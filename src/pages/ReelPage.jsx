import { useEffect, useRef, useState } from "react";
import {
    collection,
    getDocs,
    orderBy,
    limit,
    query,
    startAfter,
} from "firebase/firestore";
import { db } from "../firebase/firebase-config";

export default function ReelPage() {
    const [reels, setReels] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRefs = useRef([]);
    const observer = useRef(null);
    const [lastVisible, setLastVisible] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [userInteracted, setUserInteracted] = useState(false);
    const [globalMuted, setGlobalMuted] = useState(true);
    const [volume, setVolume] = useState(50);
    const [pausedVideos, setPausedVideos] = useState({}); // Track paused state per video
    const [showCreatorInfo, setShowCreatorInfo] = useState({});

    const REELS_LIMIT = 10;

    const fetchReels = async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);

        try {
            let q = query(
                collection(db, "reels"),
                orderBy("timeStampServer", "desc"),
                limit(REELS_LIMIT)
            );

            if (lastVisible) {
                q = query(
                    collection(db, "reels"),
                    orderBy("timeStampServer", "desc"),
                    startAfter(lastVisible),
                    limit(REELS_LIMIT)
                );
            }

            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            if (fetched.length < REELS_LIMIT) {
                setHasMore(false);
            }

            setReels((prev) => {
                const existingIds = new Set(prev.map((reel) => reel.id));
                const newReels = fetched.filter(
                    (reel) => !existingIds.has(reel.id)
                );
                return [...prev, ...newReels];
            });

            if (snapshot.docs.length > 0) {
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            }

            console.log("Fetched reels:", snapshot, "fetched", fetched);
        } catch (error) {
            console.error("Error fetching reels:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleScroll = () => {
        if (
            window.innerHeight + document.documentElement.scrollTop >=
            document.documentElement.offsetHeight - 1000
        ) {
            fetchReels();
        }
    };

    // Navigate to specific reel
    const scrollToReel = (direction) => {
        let newIndex;
        if (direction === "up" && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (direction === "down" && currentIndex < reels.length - 1) {
            newIndex = currentIndex + 1;
        } else {
            return;
        }

        const reelElement = document.querySelector(
            `[data-reel-index="${newIndex}"]`
        );
        if (reelElement) {
            reelElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    // Global mute/unmute function
    const toggleGlobalMute = () => {
        setUserInteracted(true);
        const newMutedState = !globalMuted;
        setGlobalMuted(newMutedState);

        // Apply to all videos
        videoRefs.current.forEach((video) => {
            if (video) {
                video.muted = newMutedState;
                video.volume = newMutedState ? 0 : volume / 100;
            }
        });
    };

    // Volume control
    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        setUserInteracted(true);

        // Apply volume to all videos
        videoRefs.current.forEach((video) => {
            if (video) {
                video.volume = newVolume / 100;
                if (newVolume === 0) {
                    video.muted = true;
                    setGlobalMuted(true);
                } else {
                    video.muted = false;
                    setGlobalMuted(false);
                }
            }
        });
    };

    // Toggle creator info visibility
    const toggleCreatorInfo = (index) => {
        setShowCreatorInfo((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Track user interaction for autoplay policy
    useEffect(() => {
        const handleUserInteraction = () => {
            setUserInteracted(true);
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("touchstart", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
        };

        document.addEventListener("click", handleUserInteraction);
        document.addEventListener("touchstart", handleUserInteraction);
        document.addEventListener("keydown", handleUserInteraction);

        return () => {
            document.removeEventListener("click", handleUserInteraction);
            document.removeEventListener("touchstart", handleUserInteraction);
            document.removeEventListener("keydown", handleUserInteraction);
        };
    }, []);

    useEffect(() => {
        fetchReels();
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoading, hasMore]);

    useEffect(() => {
        if (observer.current) {
            observer.current.disconnect();
        }

        const timeoutId = setTimeout(() => {
            observer.current = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        const index = videoRefs.current.findIndex(
                            (ref) => ref === entry.target
                        );

                        if (entry.isIntersecting && index !== -1) {
                            setCurrentIndex(index);
                            const video = entry.target;

                            // Only play if not manually paused
                            if (!pausedVideos[index]) {
                                const playVideo = async () => {
                                    try {
                                        video.muted = globalMuted;
                                        video.volume = globalMuted
                                            ? 0
                                            : volume / 100;
                                        await video.play();
                                    } catch (error) {
                                        console.log(
                                            "Autoplay prevented:",
                                            error.message
                                        );
                                        video.muted = true;
                                    }
                                };
                                playVideo();
                            }
                        } else if (index !== -1) {
                            entry.target.pause();
                            entry.target.currentTime = 0;
                            // Reset paused state when video goes out of view
                            setPausedVideos((prev) => ({
                                ...prev,
                                [index]: false,
                            }));
                        }
                    });
                },
                { threshold: 0.8 }
            );

            videoRefs.current.forEach((video) => {
                if (video && observer.current) {
                    observer.current.observe(video);
                }
            });
        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [reels, globalMuted, volume, pausedVideos]);

    const handleVideoClick = (index) => {
        const video = videoRefs.current[index];
        if (video) {
            setUserInteracted(true);

            // Toggle pause/resume regardless of mute state
            if (video.paused || pausedVideos[index]) {
                // Resume video
                video.muted = globalMuted;
                video.volume = globalMuted ? 0 : volume / 100;
                video.play().catch(console.error);
                setPausedVideos((prev) => ({
                    ...prev,
                    [index]: false,
                }));
            } else {
                // Pause video
                video.pause();
                setPausedVideos((prev) => ({
                    ...prev,
                    [index]: true,
                }));
            }
        }
    };

    const handleBack = () => {
        // You can replace this with your navigation logic
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-black relative z-10">
                <button
                    onClick={handleBack}
                    className="text-white hover:text-orange-500 transition-colors p-1"
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

            {/* Scroll Navigation Controls */}
            <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-20 flex flex-col gap-2">
                <button
                    onClick={() => scrollToReel("up")}
                    disabled={currentIndex === 0}
                    className="bg-black/70 text-white p-3 rounded-full hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Main */}
            <div className="flex justify-center items-start min-h-[calc(100vh-60px)] bg-black">
                <div className="relative flex flex-col items-center w-full max-w-md">
                    {reels.map((reel, index) => (
                        <div
                            key={`${reel.id}-${index}`}
                            className="mb-8"
                            data-reel-index={index}
                        >
                            {/* Reel Card */}
                            <div
                                className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer"
                                style={{ width: "350px", height: "700px" }}
                                onClick={() => handleVideoClick(index)}
                            >
                                <video
                                    ref={(el) => {
                                        if (el) {
                                            videoRefs.current[index] = el;
                                        }
                                    }}
                                    src={reel.url}
                                    loop
                                    playsInline
                                    muted={globalMuted}
                                    className="w-full h-full object-cover"
                                    onError={(e) =>
                                        console.error("Video error:", e)
                                    }
                                />

                                {/* Pause Overlay */}
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

                                {/* Bottom Overlay - Title first, then Creator Info, and Description */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                                    {/* Title - Now appears first */}
                                    {reel.title && (
                                        <h2 className="text-white text-lg font-bold mb-3 line-clamp-2">
                                            {reel.title}
                                        </h2>
                                    )}

                                    {/* Creator Info - Now appears after title */}
                                    {reel.creatorName && (
                                        <div className="mb-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCreatorInfo(index);
                                                }}
                                                className="flex items-center gap-2 text-white hover:text-orange-500 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {reel.creatorName
                                                        .charAt(0)
                                                        .toUpperCase()}
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
                                                        showCreatorInfo[index]
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

                                            {/* Expandable Creator Info */}
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
                                                                Content Creator
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Description */}
                                    <p className="text-white text-sm mb-2 line-clamp-3">
                                        {reel.description}
                                    </p>

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

                                {/* Tap to play indicator */}
                                {!userInteracted && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                                            🔇 Tap to play with sound
                                        </div>
                                    </div>
                                )}

                                {/* Volume Controls - Now only mute/unmute button */}
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {/* Mute/Unmute button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleGlobalMute();
                                        }}
                                        className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        {globalMuted ? "🔇" : "🔊"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}

                    {/* No more content indicator */}
                    {!hasMore && reels.length > 0 && (
                        <div className="text-center p-4 text-gray-400">
                            No more reels to load
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
