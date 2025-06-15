import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
    collection,
    getDocs,
    orderBy,
    limit,
    query,
    startAfter,
} from "firebase/firestore";
import { db } from "../firebase/firebase-config";

// HLS.js dynamic loader with caching
const loadHlsScript = (() => {
    let hlsPromise = null;

    return () => {
        if (hlsPromise) return hlsPromise;

        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        hlsPromise = new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.onload = () => resolve(window.Hls);
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsPromise;
    };
})();

export default function ReelPage() {
    // State management
    const [reels, setReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lastVisible, setLastVisible] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [userInteracted, setUserInteracted] = useState(false);
    const [globalMuted, setGlobalMuted] = useState(true);
    const [volume, setVolume] = useState(50);
    const [pausedVideos, setPausedVideos] = useState({});
    const [showCreatorInfo, setShowCreatorInfo] = useState({});
    const [hlsLoaded, setHlsLoaded] = useState(false);
    const [videoStates, setVideoStates] = useState({});

    // Refs
    const videoRefs = useRef([]);
    const hlsInstances = useRef(new Map());
    const observer = useRef(null);
    const containerRef = useRef(null);

    const REELS_LIMIT = 10;
    const PRELOAD_DISTANCE = 2; // Videos to preload around current video

    // Memoized video URLs with validation
    const reelsWithUrls = useMemo(() => {
        return reels.map((reel) => {
            const hasValidStreamId =
                reel.videoStreamId &&
                typeof reel.videoStreamId === "string" &&
                reel.videoStreamId.trim().length > 0;

            return {
                ...reel,
                videoUrl: hasValidStreamId
                    ? `https://customer-01eap4epl2x94qzd.cloudflarestream.com/${reel.videoStreamId.trim()}/manifest/video.m3u8`
                    : null,
            };
        });
    }, [reels]);

    // Load HLS.js with error handling
    useEffect(() => {
        let isMounted = true;

        loadHlsScript()
            .then(() => {
                if (isMounted) {
                    setHlsLoaded(true);
                    console.log("HLS.js loaded successfully");
                }
            })
            .catch((error) => {
                if (isMounted) {
                    console.error("Failed to load HLS.js:", error);
                    // Fallback: try to use native HLS support
                    setHlsLoaded(true);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Enhanced HLS setup with better error handling
    const setupHls = useCallback((video, url, index) => {
        if (!video || !url) return;

        const instanceKey = `${index}`;

        // Clean up existing instance
        if (hlsInstances.current.has(instanceKey)) {
            const existingHls = hlsInstances.current.get(instanceKey);
            existingHls.destroy();
            hlsInstances.current.delete(instanceKey);
        }

        // Check for HLS support
        if (window.Hls?.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                startLevel: -1, // Auto quality selection
                debug: false,
            });

            hls.loadSource(url);
            hls.attachMedia(video);

            // Event handlers
            hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                setVideoStates((prev) => ({
                    ...prev,
                    [index]: { ...prev[index], loaded: true },
                }));
            });

            hls.on(window.Hls.Events.ERROR, (event, data) => {
                console.error("HLS error for video", index, ":", data);

                if (data.fatal) {
                    switch (data.type) {
                        case window.Hls.ErrorTypes.NETWORK_ERROR:
                            console.log("Recovering from network error...");
                            hls.startLoad();
                            break;
                        case window.Hls.ErrorTypes.MEDIA_ERROR:
                            console.log("Recovering from media error...");
                            hls.recoverMediaError();
                            break;
                        default:
                            console.log("Fatal error, destroying HLS instance");
                            hls.destroy();
                            hlsInstances.current.delete(instanceKey);
                            setVideoStates((prev) => ({
                                ...prev,
                                [index]: { ...prev[index], error: true },
                            }));
                            break;
                    }
                }
            });

            hlsInstances.current.set(instanceKey, hls);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // Safari native HLS support
            video.src = url;
            setVideoStates((prev) => ({
                ...prev,
                [index]: { ...prev[index], loaded: true },
            }));
        } else {
            console.error("HLS not supported in this browser");
            setVideoStates((prev) => ({
                ...prev,
                [index]: { ...prev[index], error: true },
            }));
        }
    }, []);

    // Optimized fetch function
    const fetchReels = useCallback(async () => {
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        try {
            let q = query(
                collection(db, "reel-shorts"),
                orderBy("_createdBy.timestamp", "desc"),
                limit(REELS_LIMIT)
            );

            if (lastVisible) {
                q = query(
                    collection(db, "reel-shorts"),
                    orderBy("_createdBy.timestamp", "desc"),
                    startAfter(lastVisible),
                    limit(REELS_LIMIT)
                );
            }

            const snapshot = await getDocs(q);
            const fetchedReels = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (fetchedReels.length < REELS_LIMIT) {
                setHasMore(false);
            }

            setReels((prevReels) => {
                const existingIds = new Set(prevReels.map((reel) => reel.id));
                const newReels = fetchedReels.filter(
                    (reel) => !existingIds.has(reel.id)
                );
                return [...prevReels, ...newReels];
            });

            if (snapshot.docs.length > 0) {
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            }
        } catch (error) {
            console.error("Error fetching reels:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, lastVisible]);

    // Smart video preloading
    const shouldPreloadVideo = useCallback(
        (index) => {
            return Math.abs(index - currentIndex) <= PRELOAD_DISTANCE;
        },
        [currentIndex]
    );

    // Setup videos with preloading logic
    useEffect(() => {
        if (!hlsLoaded || reelsWithUrls.length === 0) return;

        const setupVideosWithDelay = setTimeout(() => {
            reelsWithUrls.forEach((reel, index) => {
                const video = videoRefs.current[index];

                if (video && reel.videoUrl && shouldPreloadVideo(index)) {
                    const instanceKey = `${index}`;

                    if (!hlsInstances.current.has(instanceKey)) {
                        setupHls(video, reel.videoUrl, index);
                    }
                }
            });
        }, 100);

        return () => {
            clearTimeout(setupVideosWithDelay);
        };
    }, [hlsLoaded, reelsWithUrls, setupHls, shouldPreloadVideo]);

    // Enhanced scroll handler with throttling
    const handleScroll = useCallback(() => {
        const { scrollTop, scrollHeight, clientHeight } =
            document.documentElement;

        if (scrollTop + clientHeight >= scrollHeight - 1000) {
            fetchReels();
        }
    }, [fetchReels]);

    // Smooth navigation between reels
    const scrollToReel = useCallback(
        (direction) => {
            let newIndex;

            if (direction === "up" && currentIndex > 0) {
                newIndex = currentIndex - 1;
            } else if (
                direction === "down" &&
                currentIndex < reels.length - 1
            ) {
                newIndex = currentIndex + 1;
            } else {
                return;
            }

            const reelElement = document.querySelector(
                `[data-reel-index="${newIndex}"]`
            );
            if (reelElement) {
                reelElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        },
        [currentIndex, reels.length]
    );

    // Enhanced global mute/unmute
    const toggleGlobalMute = useCallback(() => {
        setUserInteracted(true);

        setGlobalMuted((prevMuted) => {
            const newMutedState = !prevMuted;

            // Apply to all loaded videos
            videoRefs.current.forEach((video, index) => {
                if (video && videoStates[index]?.loaded) {
                    video.muted = newMutedState;
                    if (!newMutedState) {
                        video.volume = volume / 100;
                    }
                }
            });

            return newMutedState;
        });
    }, [volume, videoStates]);

    // Enhanced volume control
    const handleVolumeChange = useCallback(
        (newVolume) => {
            setVolume(newVolume);
            setUserInteracted(true);

            const isMuted = newVolume === 0;
            setGlobalMuted(isMuted);

            videoRefs.current.forEach((video, index) => {
                if (video && videoStates[index]?.loaded) {
                    video.volume = newVolume / 100;
                    video.muted = isMuted;
                }
            });
        },
        [videoStates]
    );

    // Toggle creator info
    const toggleCreatorInfo = useCallback((index) => {
        setShowCreatorInfo((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    }, []);

    // Enhanced video click handler
    const handleVideoClick = useCallback(
        (index) => {
            const video = videoRefs.current[index];
            if (!video || !videoStates[index]?.loaded) return;

            setUserInteracted(true);

            setPausedVideos((prev) => {
                const isCurrentlyPaused = prev[index] || video.paused;

                if (isCurrentlyPaused) {
                    // Resume video
                    video.muted = globalMuted;
                    video.volume = globalMuted ? 0 : volume / 100;
                    video.play().catch(console.error);
                    return { ...prev, [index]: false };
                } else {
                    // Pause video
                    video.pause();
                    return { ...prev, [index]: true };
                }
            });
        },
        [globalMuted, volume, videoStates]
    );

    // Back navigation
    const handleBack = useCallback(() => {
        window.history.back();
    }, []);

    // Video event handlers
    const handleVideoCanPlay = useCallback((index) => {
        setVideoStates((prev) => ({
            ...prev,
            [index]: { ...prev[index], canPlay: true },
        }));
    }, []);

    const handleVideoLoadStart = useCallback((index) => {
        setVideoStates((prev) => ({
            ...prev,
            [index]: { ...prev[index], loading: true },
        }));
    }, []);

    const handleVideoError = useCallback((index, error) => {
        console.error("Video error for index:", index, error);
        setVideoStates((prev) => ({
            ...prev,
            [index]: { ...prev[index], error: true, loading: false },
        }));
    }, []);

    // Track user interaction for autoplay
    useEffect(() => {
        const handleUserInteraction = () => {
            setUserInteracted(true);
        };

        if (!userInteracted) {
            const events = ["click", "touchstart", "keydown"];
            events.forEach((event) => {
                document.addEventListener(event, handleUserInteraction, {
                    once: true,
                });
            });

            return () => {
                events.forEach((event) => {
                    document.removeEventListener(event, handleUserInteraction);
                });
            };
        }
    }, [userInteracted]);

    // Initial fetch
    useEffect(() => {
        if (reels.length === 0) {
            fetchReels();
        }
    }, []);

    // Scroll event listener
    useEffect(() => {
        let timeoutId;

        const throttledHandleScroll = () => {
            if (timeoutId) return;

            timeoutId = setTimeout(() => {
                handleScroll();
                timeoutId = null;
            }, 100);
        };

        window.addEventListener("scroll", throttledHandleScroll, {
            passive: true,
        });
        return () => {
            window.removeEventListener("scroll", throttledHandleScroll);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [handleScroll]);

    // Enhanced intersection observer
    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }

        const setupObserver = setTimeout(() => {
            observer.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const video = entry.target;
                        const index = videoRefs.current.findIndex(
                            (ref) => ref === video
                        );

                        if (index === -1) return;

                        if (entry.isIntersecting) {
                            setCurrentIndex(index);

                            // Auto-play logic
                            if (
                                !pausedVideos[index] &&
                                userInteracted &&
                                videoStates[index]?.loaded
                            ) {
                                const playVideo = async () => {
                                    try {
                                        video.muted = globalMuted;
                                        video.volume = globalMuted
                                            ? 0
                                            : volume / 100;
                                        await video.play();
                                    } catch (error) {
                                        // Fallback to muted playback
                                        video.muted = true;
                                        try {
                                            await video.play();
                                        } catch (secondError) {
                                            console.log(
                                                "Video playback failed:",
                                                secondError.message
                                            );
                                        }
                                    }
                                };
                                playVideo();
                            }
                        } else {
                            // Pause and reset video when not visible
                            video.pause();
                            video.currentTime = 0;
                            setPausedVideos((prev) => ({
                                ...prev,
                                [index]: false,
                            }));
                        }
                    });
                },
                { threshold: 0.8, rootMargin: "0px 0px -10% 0px" }
            );

            // Observe all videos
            videoRefs.current.forEach((video) => {
                if (video && observer.current) {
                    observer.current.observe(video);
                }
            });
        }, 100);

        return () => {
            clearTimeout(setupObserver);
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [
        reelsWithUrls.length,
        globalMuted,
        volume,
        userInteracted,
        videoStates,
    ]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Destroy all HLS instances
            hlsInstances.current.forEach((hls) => {
                if (hls) {
                    hls.destroy();
                }
            });
            hlsInstances.current.clear();
        };
    }, []);

    return (
        <div
            className="min-h-screen bg-black text-white relative"
            ref={containerRef}
        >
            {/* Fixed Header */}
            <div className="fixed top-18 left-0 right-0 flex items-center gap-3 p-4 bg-black z-30">
                <button
                    onClick={handleBack}
                    className="text-white hover:text-orange-500 transition-colors p-1"
                    aria-label="Go back"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M19 12H5M12 19L5 12L12 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <span className="text-white font-medium text-lg">Reels</span>
            </div>

            {/* Navigation Controls */}
            <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-2">
                <button
                    onClick={() => scrollToReel("up")}
                    disabled={currentIndex === 0}
                    className="bg-black/70 text-white p-3 rounded-full hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous reel"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M18 15L12 9L6 15"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <button
                    onClick={() => scrollToReel("down")}
                    disabled={currentIndex === reels.length - 1}
                    className="bg-black/70 text-white p-3 rounded-full hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next reel"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M6 9L12 15L18 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {/* Global Volume Control */}
            <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-2">
                <button
                    onClick={toggleGlobalMute}
                    className="bg-black/70 text-white p-3 rounded-full hover:bg-orange-500 transition-colors"
                    aria-label={globalMuted ? "Unmute" : "Mute"}
                >
                    {globalMuted ? "🔇" : "🔊"}
                </button>
            </div>

            {/* Main Content */}
            <div className="flex justify-center items-start min-h-screen bg-black pt-20">
                <div className="relative flex flex-col items-center w-full max-w-md">
                    {/* Loading HLS indicator */}
                    {!hlsLoaded && (
                        <div className="flex items-center justify-center p-8 text-gray-400">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
                            Loading video player...
                        </div>
                    )}

                    {/* Reels */}
                    {hlsLoaded &&
                        reelsWithUrls.map((reel, index) => {
                            if (!reel.videoUrl) {
                                console.warn(
                                    `No valid video URL for reel ${reel.id}`
                                );
                                return null;
                            }

                            const videoState = videoStates[index] || {};

                            return (
                                <div
                                    key={`${reel.id}-${index}`}
                                    className="mb-8"
                                    data-reel-index={index}
                                >
                                    <div
                                        className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer shadow-2xl"
                                        style={{
                                            width: "350px",
                                            height: "700px",
                                        }}
                                        onClick={() => handleVideoClick(index)}
                                    >
                                        <video
                                            ref={(el) => {
                                                if (el) {
                                                    videoRefs.current[index] =
                                                        el;
                                                }
                                            }}
                                            loop
                                            playsInline
                                            muted={globalMuted}
                                            preload="metadata"
                                            className="w-full h-full object-cover"
                                            onError={(e) =>
                                                handleVideoError(index, e)
                                            }
                                            onLoadStart={() =>
                                                handleVideoLoadStart(index)
                                            }
                                            onCanPlay={() =>
                                                handleVideoCanPlay(index)
                                            }
                                        />

                                        {/* Loading overlay */}
                                        {videoState.loading &&
                                            !videoState.canPlay && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                                                </div>
                                            )}

                                        {/* Error overlay */}
                                        {videoState.error && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                                                <div className="text-center">
                                                    <div className="text-4xl mb-2">
                                                        ⚠️
                                                    </div>
                                                    <p className="text-white">
                                                        Failed to load video
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Pause overlay */}
                                        {pausedVideos[index] &&
                                            currentIndex === index && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                    <div className="bg-black/70 text-white p-4 rounded-full">
                                                        <svg
                                                            width="40"
                                                            height="40"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M8 5V19L19 12L8 5Z"
                                                                fill="currentColor"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            )}

                                        {/* Content overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                            {/* Title */}
                                            {reel.title && (
                                                <h2 className="text-white text-lg font-bold mb-3 line-clamp-2">
                                                    {reel.title}
                                                </h2>
                                            )}
                                            {/* Creator Info */}

                                            {reel.creatorName && (
                                                <div className="mb-3">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleCreatorInfo(
                                                                index
                                                            );
                                                        }}
                                                        className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {reel?._createdBy
                                                                ?.photoURL ? (
                                                                <img
                                                                    src={
                                                                        reel
                                                                            ._createdBy
                                                                            .photoURL
                                                                    }
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                    alt="Creator Avatar"
                                                                />
                                                            ) : (
                                                                reel.creatorName
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                            )}
                                                        </div>

                                                        <span className="font-semibold text-sm">
                                                            @
                                                            {reel.creatorName
                                                                .replace(
                                                                    /\s+/g,
                                                                    ""
                                                                )
                                                                .toLowerCase()}
                                                        </span>
                                                        <svg
                                                            width="12"
                                                            height="12"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className={`transform transition-transform ${
                                                                showCreatorInfo[
                                                                    index
                                                                ]
                                                                    ? "rotate-180"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <path
                                                                d="M6 9L12 15L18 9"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        </svg>
                                                    </button>

                                                    {showCreatorInfo[index] && (
                                                        <div className="mt-2 p-3 bg-black/70 rounded-lg backdrop-blur-sm">
                                                            <div className="flex items-center">
                                                                <div>
                                                                    <p className="text-white font-medium">
                                                                        {
                                                                            reel.creatorName
                                                                        }
                                                                    </p>
                                                                    <p className="text-gray-300 text-xs">
                                                                        Content
                                                                        Creator
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {/* Description */}
                                            {reel.description && (
                                                <p className="text-white text-sm mb-2 line-clamp-3">
                                                    {reel.description}
                                                </p>
                                            )}
                                            {/* Music Info */}
                                            {reel.music && (
                                                <div className="text-xs text-white opacity-80 flex items-center gap-1">
                                                    <svg
                                                        width="12"
                                                        height="12"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M9 18V5L21 3V16M9 13L21 11M9 18C9 19.1046 8.10457 20 7 20C5.89543 20 5 19.1046 5 18C5 16.8954 5.89543 16 7 16C8.10457 16 9 16.8954 9 18ZM21 16C21 17.1046 20.1046 18 19 18C17.8954 18 17 17.1046 17 16C17 14.8954 17.8954 14 19 14C20.1046 14 21 14.8954 21 16Z"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        />
                                                    </svg>
                                                    <span className="animate-pulse">
                                                        ♪ {reel.music}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}

                    {/* No more content */}
                    {!hasMore && reels.length > 0 && (
                        <div className="text-center p-4 text-gray-400">
                            No more reels to load
                        </div>
                    )}

                    {/* Empty state */}
                    {!isLoading && reels.length === 0 && hlsLoaded && (
                        <div className="text-center p-8 text-gray-400">
                            <div className="text-4xl mb-4">📹</div>
                            <p>No reels available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
