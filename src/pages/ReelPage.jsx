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
import VideoPlayer from "../components/VideoPlayer"; // Adjust import path as needed

export default function ReelPage() {
    // State management
    const [reels, setReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lastVisible, setLastVisible] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [userInteracted, setUserInteracted] = useState(false);
    const [playingStates, setPlayingStates] = useState({});
    const [showCreatorInfo, setShowCreatorInfo] = useState({});
    const [initialFetchDone, setInitialFetchDone] = useState(false);

    // Refs
    const observer = useRef(null);
    const containerRef = useRef(null);
    const reelRefs = useRef([]);

    const REELS_LIMIT = 10;

    // Memoized video URLs with validation
    const reelsWithUrls = useMemo(() => {
        return reels.map((reel) => {
            const hasValidStreamId =
                reel.videoStreamId &&
                typeof reel.videoStreamId === "string" &&
                reel.videoStreamId.trim().length > 0;

            return {
                ...reel,
                hasValidVideo: hasValidStreamId,
            };
        });
    }, [reels]);

    // Optimized fetch function - removed from useCallback to break dependency cycle
    const fetchReels = useCallback(
        async (forceRefresh = false) => {
            if (isLoading || (!hasMore && !forceRefresh)) return;

            setIsLoading(true);

            try {
                let q = query(
                    collection(db, "reel-shorts"),
                    orderBy("_createdBy.timestamp", "desc"),
                    limit(REELS_LIMIT)
                );

                if (lastVisible && !forceRefresh) {
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

                if (forceRefresh) {
                    setReels(fetchedReels);
                    setLastVisible(
                        snapshot.docs.length > 0
                            ? snapshot.docs[snapshot.docs.length - 1]
                            : null
                    );
                } else {
                    setReels((prevReels) => {
                        const existingIds = new Set(
                            prevReels.map((reel) => reel.id)
                        );
                        const newReels = fetchedReels.filter(
                            (reel) => !existingIds.has(reel.id)
                        );
                        return [...prevReels, ...newReels];
                    });

                    if (snapshot.docs.length > 0) {
                        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
                    }
                }

                setInitialFetchDone(true);
            } catch (error) {
                console.error("Error fetching reels:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [isLoading, hasMore, lastVisible]
    ); // Keep dependencies minimal

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

    // Toggle creator info
    const toggleCreatorInfo = useCallback((index) => {
        setShowCreatorInfo((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    }, []);

    // Handle video play/pause for a specific reel
    const handleVideoPlayPause = useCallback((index) => {
        setUserInteracted(true);

        return (newPlayingState) => {
            setPlayingStates((prev) => {
                const newStates = { ...prev };

                if (typeof newPlayingState === "function") {
                    newStates[index] = newPlayingState(prev[index] || false);
                } else {
                    newStates[index] = newPlayingState;
                }

                // If this video is starting to play, pause all others
                if (newStates[index]) {
                    Object.keys(newStates).forEach((key) => {
                        if (parseInt(key) !== index) {
                            newStates[key] = false;
                        }
                    });
                }

                return newStates;
            });
        };
    }, []);

    // Function to pause all videos except the current one
    const pauseAllVideosExcept = useCallback((exceptIndex) => {
        setPlayingStates((prev) => {
            const newStates = { ...prev };
            Object.keys(newStates).forEach((key) => {
                if (parseInt(key) !== exceptIndex) {
                    newStates[key] = false;
                }
            });
            return newStates;
        });
    }, []);

    // Back navigation
    const handleBack = useCallback(() => {
        window.history.back();
    }, []);

    // Track user interaction for autoplay - FIXED: Added proper dependency array
    useEffect(() => {
        if (userInteracted) return;

        const handleUserInteraction = () => {
            setUserInteracted(true);
        };

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
    }, [userInteracted]); // Added dependency array

    // Initial fetch - FIXED: Prevent infinite loop
    useEffect(() => {
        if (!initialFetchDone && !isLoading) {
            fetchReels(true);
        }
    }, [initialFetchDone, isLoading, fetchReels]);

    // Scroll event listener - FIXED: Removed fetchReels from dependency
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

    // Enhanced intersection observer - FIXED: Better dependency management
    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }

        if (reelsWithUrls.length === 0) return;

        const setupObserver = setTimeout(() => {
            observer.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const reelElement = entry.target;
                        const index = parseInt(reelElement.dataset.reelIndex);

                        if (isNaN(index)) return;

                        if (entry.isIntersecting) {
                            setCurrentIndex(index);

                            // Auto-play logic - only if user has interacted
                            if (
                                userInteracted &&
                                reelsWithUrls[index]?.hasValidVideo
                            ) {
                                setPlayingStates((prev) => {
                                    const newStates = { ...prev };
                                    // Pause all other videos
                                    Object.keys(newStates).forEach((key) => {
                                        newStates[key] = false;
                                    });
                                    // Start playing current video
                                    newStates[index] = true;
                                    return newStates;
                                });
                            }
                        } else {
                            // Pause video when not visible
                            setPlayingStates((prev) => ({
                                ...prev,
                                [index]: false,
                            }));
                        }
                    });
                },
                { threshold: 0.8, rootMargin: "0px 0px -10% 0px" }
            );

            // Observe all reel elements
            reelRefs.current.forEach((reelElement) => {
                if (reelElement && observer.current) {
                    observer.current.observe(reelElement);
                }
            });
        }, 100);

        return () => {
            clearTimeout(setupObserver);
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [reelsWithUrls.length, userInteracted]);

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

            {/* Main Content */}
            <div className="flex justify-center items-start min-h-screen bg-black pt-20">
                <div className="relative flex flex-col items-center w-full max-w-md">
                    {/* Reels */}
                    {reelsWithUrls.map((reel, index) => {
                        if (!reel.hasValidVideo) {
                            console.warn(
                                `No valid video stream ID for reel ${reel.id}`
                            );
                            return null;
                        }

                        const isPlaying = playingStates[index] || false;

                        return (
                            <div
                                key={`${reel.id}-${index}`}
                                className="mb-8"
                                data-reel-index={index}
                                ref={(el) => {
                                    if (el) {
                                        reelRefs.current[index] = el;
                                    }
                                }}
                            >
                                <div
                                    className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
                                    style={{
                                        width: "350px",
                                        height: "550px",
                                    }}
                                >
                                    <VideoPlayer
                                        videoStreamId={reel.videoStreamId.trim()}
                                        playing={playingStates[index] || false}
                                        onPlayPause={(newVal) =>
                                            handleVideoPlayPause(index)(newVal)
                                        }
                                        controls={true}
                                    />

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
                                                        {reel._createdBy
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
                                                            .replace(/\s+/g, "")
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
                    {!isLoading && reels.length === 0 && initialFetchDone && (
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
