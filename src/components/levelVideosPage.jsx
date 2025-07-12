import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
    ArrowLeft,
    Play,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    Minimize,
    Clock,
    List,
    Loader2,
    RefreshCw,
    PlayCircle,
    AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { useEffect, useState, useCallback, useRef } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase-config";

export default function LevelVideosPage() {
    const { levelId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // States
    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [currentPage, setCurrentPage] = useState("1");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());
    const [levelName, setLevelName] = useState("");
    const [availablePages, setAvailablePages] = useState(new Set(["1"])); // Track which pages have data
    const [videoError, setVideoError] = useState(null);

    // Video player states
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showPlaylist, setShowPlaylist] = useState(true);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Refs
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const isFetchingRef = useRef(false);
    const mountedRef = useRef(true);
    const hlsRef = useRef(null);

    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    // Initialize HLS support
    const initializeHLS = useCallback((videoElement, videoUrl) => {
        setVideoError(null);
        setIsVideoLoading(true);

        // Clean up previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (!videoUrl) {
            setVideoError("Invalid video URL");
            setIsVideoLoading(false);
            return;
        }

        try {
            // Check if HLS is supported
            if (window.Hls && window.Hls.isSupported()) {
                const hls = new window.Hls({
                    enableWorker: false,
                    lowLatencyMode: true,
                    backBufferLength: 90,
                });

                hlsRef.current = hls;

                hls.on(window.Hls.Events.MEDIA_ATTACHED, () => {
                    console.log("HLS media attached");
                });

                hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                    console.log("HLS manifest parsed");
                    setIsVideoLoading(false);
                    // Auto-play when manifest is loaded
                    if (videoElement) {
                        videoElement
                            .play()
                            .then(() => {
                                setIsPlaying(true);
                            })
                            .catch((err) => {
                                console.log("Auto-play prevented:", err);
                                setIsPlaying(false);
                            });
                    }
                });

                hls.on(window.Hls.Events.ERROR, (event, data) => {
                    console.error("HLS error:", data);
                    if (data.fatal) {
                        setVideoError(`Video playback error: ${data.type}`);
                        setIsVideoLoading(false);
                    }
                });

                hls.loadSource(videoUrl);
                hls.attachMedia(videoElement);
            } else if (
                videoElement.canPlayType("application/vnd.apple.mpegurl")
            ) {
                // Native HLS support (Safari)
                videoElement.src = videoUrl;
                videoElement.addEventListener("loadedmetadata", () => {
                    setIsVideoLoading(false);
                    // Auto-play for Safari
                    videoElement
                        .play()
                        .then(() => {
                            setIsPlaying(true);
                        })
                        .catch((err) => {
                            console.log("Auto-play prevented:", err);
                            setIsPlaying(false);
                        });
                });
            } else {
                setVideoError("HLS playback not supported in this browser");
                setIsVideoLoading(false);
            }
        } catch (err) {
            console.error("Error initializing video:", err);
            setVideoError("Failed to initialize video player");
            setIsVideoLoading(false);
        }
    }, []);

    // Load HLS.js library
    useEffect(() => {
        if (!window.Hls) {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
            script.onload = () => {
                console.log("HLS.js loaded");
            };
            script.onerror = () => {
                console.error("Failed to load HLS.js");
                setVideoError("Failed to load video player library");
            };
            document.head.appendChild(script);

            return () => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                }
            };
        }
    }, []);

    // Get current video from URL params or set first video
    useEffect(() => {
        const videoId = searchParams.get("video");
        if (videoId && videos.length > 0) {
            const video = videos.find((v) => v.levelVideoId === videoId);
            if (video) {
                setCurrentVideo(video);
            }
        } else if (videos.length > 0 && !currentVideo) {
            setCurrentVideo(videos[0]);
            setSearchParams((prev) => {
                prev.set("video", videos[0].levelVideoId);
                return prev;
            });
        }
    }, [videos, searchParams, setSearchParams, currentVideo]);

    // Check which pages have data
    const checkAvailablePages = useCallback(async () => {
        const pages = ["1", "2", "3"];
        const availablePagesSet = new Set();

        for (const page of pages) {
            try {
                const q = query(
                    collection(db, "level-videos-new"),
                    where("levelId", "==", levelId),
                    where("pageNo", "==", page),
                    orderBy("createdAt", "asc")
                );

                const snapshot = await getDocs(q);
                if (snapshot.docs.length > 0) {
                    availablePagesSet.add(page);
                }
            } catch (err) {
                console.error(`Error checking page ${page}:`, err);
            }
        }

        setAvailablePages(availablePagesSet);
    }, [levelId]);

    // Fetch videos from Firebase
    const fetchVideos = useCallback(
        async (pageNo = "1") => {
            if (isFetchingRef.current) return;

            isFetchingRef.current = true;
            setIsLoading(true);
            setError(null);

            try {
                console.log(
                    "Fetching videos for levelId:",
                    levelId,
                    "pageNo:",
                    pageNo
                );

                const q = query(
                    collection(db, "level-videos-new"),
                    where("levelId", "==", levelId),
                    where("pageNo", "==", pageNo),
                    orderBy("createdAt", "asc")
                );

                const snapshot = await getDocs(q);

                if (!mountedRef.current) return;

                const fetchedVideos = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setVideos(fetchedVideos);
                setCurrentPage(pageNo);
                setImageErrors(new Set());

                if (fetchedVideos.length === 0) {
                    setError(`No videos found for page ${pageNo}`);
                }
            } catch (err) {
                console.error("Error fetching videos:", err);
                if (mountedRef.current) {
                    setError(`Error fetching videos: ${err.message}`);
                }
            } finally {
                if (mountedRef.current) {
                    setIsLoading(false);
                }
                isFetchingRef.current = false;
            }
        },
        [levelId]
    );

    // Initial fetch and check available pages
    useEffect(() => {
        mountedRef.current = true;
        const pageNo = searchParams.get("page") || "1";

        if (levelId) {
            checkAvailablePages();
            fetchVideos(pageNo);
        } else {
            setError("No level ID provided");
            setIsLoading(false);
        }

        return () => {
            mountedRef.current = false;
            isFetchingRef.current = false;
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [levelId, fetchVideos, checkAvailablePages]);

    // Initialize video when currentVideo changes
    useEffect(() => {
        if (currentVideo && videoRef.current) {
            const videoUrl = getVideoUrl(currentVideo.streamVideoId);
            // Reset states when switching videos
            setIsPlaying(false);
            setCurrentTime(0);
            setVideoError(null);
            initializeHLS(videoRef.current, videoUrl);
        }
    }, [currentVideo, initializeHLS]);

    // Video URL generation
    const getVideoUrl = useCallback((streamVideoId) => {
        if (!streamVideoId) return null;
        return `https://customer-01eap4epl2x94qzd.cloudflarestream.com/${streamVideoId.trim()}/manifest/video.m3u8`;
    }, []);

    // Image URL generation
    const getImageUrl = useCallback(
        (imageId, type = "public") => {
            if (!imageId) return "/placeholder.svg";
            return `https://imagedelivery.net/${accountHash}/${imageId}/${type}`;
        },
        [accountHash]
    );

    // Handle image errors
    const handleImageError = useCallback((imageId, event) => {
        setImageErrors((prev) => new Set([...prev, imageId]));
        event.target.src = "/placeholder.svg";
    }, []);

    // Format duration
    const formatDuration = useCallback((milliseconds) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(
                seconds % 60
            )
                .toString()
                .padStart(2, "0")}`;
        }
        return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
    }, []);

    // Video player controls
    const togglePlay = useCallback(async () => {
        if (videoRef.current) {
            try {
                if (isPlaying) {
                    videoRef.current.pause();
                } else {
                    await videoRef.current.play();
                }
            } catch (err) {
                console.error("Error playing video:", err);
                setVideoError("Failed to play video");
            }
        }
    }, [isPlaying]);

    const toggleMute = useCallback(() => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    }, [isMuted]);

    const handleVolumeChange = useCallback(
        (newVolume) => {
            if (videoRef.current) {
                videoRef.current.volume = newVolume;
                setVolume(newVolume);
                if (newVolume === 0) {
                    setIsMuted(true);
                } else if (isMuted) {
                    setIsMuted(false);
                }
            }
        },
        [isMuted]
    );

    const handleSeek = useCallback(
        (e) => {
            if (videoRef.current && duration) {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                const newTime = pos * duration;
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
            }
        },
        [duration]
    );

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement) {
                await containerRef.current?.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            console.error("Fullscreen error:", err);
        }
    }, []);

    // Handle video selection
    const handleVideoSelect = useCallback(
        (video) => {
            // Pause current video if playing
            if (videoRef.current && isPlaying) {
                videoRef.current.pause();
            }

            setCurrentVideo(video);
            setSearchParams((prev) => {
                prev.set("video", video.levelVideoId);
                return prev;
            });
            setCurrentTime(0);
            setVideoError(null);
            setIsPlaying(false); // Reset play state
        },
        [setSearchParams, isPlaying]
    );

    // Handle page change
    const handlePageChange = useCallback(
        (newPage) => {
            if (!availablePages.has(newPage)) return;

            setSearchParams((prev) => {
                prev.set("page", newPage);
                prev.delete("video"); // Clear current video when changing pages
                return prev;
            });
            fetchVideos(newPage);
            setCurrentVideo(null);
        },
        [fetchVideos, setSearchParams, availablePages]
    );

    // Video event handlers
    const handleVideoLoadedMetadata = useCallback(() => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    }, []);

    const handleTimeUpdate = useCallback(() => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    }, []);

    const handleVideoPlay = useCallback(() => {
        setIsPlaying(true);
    }, []);

    const handleVideoPause = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleVideoError = useCallback((e) => {
        console.error("Video element error:", e);
        setVideoError("Video playback failed");
        setIsVideoLoading(false);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.target.tagName === "INPUT") return;

            switch (e.key) {
                case " ":
                    e.preventDefault();
                    togglePlay();
                    break;
                case "m":
                case "M":
                    toggleMute();
                    break;
                case "f":
                case "F":
                    toggleFullscreen();
                    break;
                default:
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyPress);
        return () => document.removeEventListener("keydown", handleKeyPress);
    }, [togglePlay, toggleMute, toggleFullscreen]);

    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () =>
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange
            );
    }, []);

    // Loading state
    if (isLoading && videos.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading videos...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && videos.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
                        <p className="text-red-400 mb-4">{error}</p>
                    </div>
                    <div className="space-y-3">
                        <Button
                            onClick={() => fetchVideos(currentPage)}
                            disabled={isLoading}
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Levels
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gray-900/50 border-b border-gray-800">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:text-orange-500"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">
                                <span className="text-orange-500">Level</span>{" "}
                                Videos
                            </h1>
                            <p className="text-gray-400 text-sm">
                                Page {currentPage} of{" "}
                                {Math.max(
                                    ...Array.from(availablePages).map((p) =>
                                        parseInt(p)
                                    )
                                )}
                            </p>
                        </div>

                        {/* Page Navigation - Only show pages that have data */}
                        {availablePages.size > 1 && (
                            <div className="flex items-center gap-2 ml-auto">
                                {Array.from(availablePages)
                                    .sort()
                                    .map((page) => (
                                        <Button
                                            key={page}
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(page)
                                            }
                                            className={
                                                currentPage === page
                                                    ? "bg-orange-500 text-white"
                                                    : ""
                                            }
                                        >
                                            Page {page}
                                        </Button>
                                    ))}

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        setShowPlaylist(!showPlaylist)
                                    }
                                    className="ml-4"
                                >
                                    <List className="w-4 h-4 mr-2" />
                                    {showPlaylist ? "Hide" : "Show"} Playlist
                                </Button>
                            </div>
                        )}

                        {/* Show playlist toggle even when single page */}
                        {availablePages.size === 1 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPlaylist(!showPlaylist)}
                                className="ml-auto hover:text-orange-500"
                            >
                                <List className="w-4 h-4 mr-2" />
                                {showPlaylist ? "Hide" : "Show"} Playlist
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div
                    className={`grid gap-6 ${
                        showPlaylist ? "lg:grid-cols-3" : "lg:grid-cols-1"
                    }`}
                >
                    {/* Video Player */}
                    <div
                        className={
                            showPlaylist ? "lg:col-span-2" : "lg:col-span-1"
                        }
                    >
                        {currentVideo ? (
                            <div
                                ref={containerRef}
                                className="bg-black rounded-lg overflow-hidden"
                            >
                                {/* Video */}
                                <div className="relative aspect-video bg-black">
                                    {/* Loading overlay */}
                                    {isVideoLoading && (
                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                            <div className="text-center">
                                                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
                                                <p className="text-gray-400 text-sm">
                                                    Loading video...
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Video error overlay */}
                                    {videoError && (
                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                                            <div className="text-center max-w-sm">
                                                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                                <p className="text-red-400 mb-4">
                                                    {videoError}
                                                </p>
                                                <Button
                                                    onClick={() => {
                                                        setVideoError(null);
                                                        if (
                                                            currentVideo &&
                                                            videoRef.current
                                                        ) {
                                                            const videoUrl =
                                                                getVideoUrl(
                                                                    currentVideo.streamVideoId
                                                                );
                                                            initializeHLS(
                                                                videoRef.current,
                                                                videoUrl
                                                            );
                                                        }
                                                    }}
                                                    size="sm"
                                                    className="bg-orange-500 hover:bg-orange-600"
                                                >
                                                    <RefreshCw className="w-4 h-4 mr-2" />
                                                    Retry
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <video
                                        ref={videoRef}
                                        className="w-full h-full"
                                        onLoadedMetadata={
                                            handleVideoLoadedMetadata
                                        }
                                        onTimeUpdate={handleTimeUpdate}
                                        onPlay={handleVideoPlay}
                                        onPause={handleVideoPause}
                                        onError={handleVideoError}
                                        onClick={togglePlay}
                                        controls={false}
                                        playsInline
                                    />

                                    {/* Video Controls Overlay */}
                                    {!videoError && (
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 hover:opacity-100 transition-opacity">
                                            <div className="absolute bottom-4 left-4 right-4">
                                                {/* Progress Bar */}
                                                <div
                                                    className="w-full bg-gray-600 h-2 rounded mb-4 cursor-pointer"
                                                    onClick={handleSeek}
                                                >
                                                    <div
                                                        className="bg-orange-500 h-2 rounded transition-all"
                                                        style={{
                                                            width: `${
                                                                duration
                                                                    ? (currentTime /
                                                                          duration) *
                                                                      100
                                                                    : 0
                                                            }%`,
                                                        }}
                                                    />
                                                </div>

                                                {/* Controls */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={togglePlay}
                                                            className="text-white hover:text-orange-500"
                                                        >
                                                            {isPlaying ? (
                                                                <Pause className="w-5 h-5" />
                                                            ) : (
                                                                <Play className="w-5 h-5" />
                                                            )}
                                                        </Button>

                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={
                                                                    toggleMute
                                                                }
                                                                className="text-white hover:text-orange-500"
                                                            >
                                                                {isMuted ? (
                                                                    <VolumeX className="w-4 h-4" />
                                                                ) : (
                                                                    <Volume2 className="w-4 h-4" />
                                                                )}
                                                            </Button>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.1"
                                                                value={
                                                                    isMuted
                                                                        ? 0
                                                                        : volume
                                                                }
                                                                onChange={(e) =>
                                                                    handleVolumeChange(
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                                className="w-20 accent-orange-500"
                                                            />
                                                        </div>

                                                        <span className="text-white text-sm">
                                                            {Math.floor(
                                                                currentTime / 60
                                                            )}
                                                            :
                                                            {Math.floor(
                                                                currentTime % 60
                                                            )
                                                                .toString()
                                                                .padStart(
                                                                    2,
                                                                    "0"
                                                                )}{" "}
                                                            /{" "}
                                                            {Math.floor(
                                                                duration / 60
                                                            )}
                                                            :
                                                            {Math.floor(
                                                                duration % 60
                                                            )
                                                                .toString()
                                                                .padStart(
                                                                    2,
                                                                    "0"
                                                                )}
                                                        </span>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={
                                                            toggleFullscreen
                                                        }
                                                        className="text-white hover:text-orange-500"
                                                    >
                                                        {isFullscreen ? (
                                                            <Minimize className="w-4 h-4" />
                                                        ) : (
                                                            <Maximize className="w-4 h-4" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Video Info */}
                                <div className="p-6 bg-gray-900/50">
                                    <h2 className="text-xl font-bold text-white mb-2">
                                        {currentVideo.levelVideoName}
                                    </h2>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>
                                                {formatDuration(
                                                    currentVideo.duration
                                                )}
                                            </span>
                                        </div>
                                        <Badge className="bg-orange-500/20 text-orange-400">
                                            Page {currentPage}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <PlayCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">
                                        Select a video to start watching
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Playlist */}
                    {showPlaylist && (
                        <div className="bg-gray-900/50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">
                                    Playlist
                                </h3>
                                <Badge className="bg-gray-700 text-gray-300">
                                    {videos.length} videos
                                </Badge>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {videos.map((video, index) => (
                                    <Card
                                        key={video.id}
                                        className={`cursor-pointer transition-all duration-200 ${
                                            currentVideo?.id === video.id
                                                ? "bg-orange-500/20 border-orange-500"
                                                : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                                        }`}
                                        onClick={() => handleVideoSelect(video)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex gap-3">
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={getImageUrl(
                                                            video.thumbnailId
                                                        )}
                                                        alt={
                                                            video.levelVideoName
                                                        }
                                                        className="w-24 h-16 object-cover rounded"
                                                        onError={(e) =>
                                                            handleImageError(
                                                                video.thumbnailId,
                                                                e
                                                            )
                                                        }
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 rounded flex items-center justify-center">
                                                        <Play className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                                        {formatDuration(
                                                            video.duration
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                                                        {video.levelVideoName}
                                                    </h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <span>
                                                            Video {index + 1}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {formatDuration(
                                                                video.duration
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
