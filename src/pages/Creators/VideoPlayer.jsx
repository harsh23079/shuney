import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Play, Settings, List, Clock } from "lucide-react";
import CreatorService from "../../lib/creatorService";
import Hls from "hls.js";

const VideoPlayer = () => {
    const { playlistId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const playlist = location.state?.playlist;

    const [videos, setVideos] = useState([]);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [showPlaylist, setShowPlaylist] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [videoLoading, setVideoLoading] = useState(false);
    const [error, setError] = useState(null);
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    const formatDuration = (durationMs) => {
        if (!durationMs) return "0:00";
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const getThumbnailUrl = (thumbnailId) => {
        return thumbnailId
            ? `https://imagedelivery.net/${accountHash}/${thumbnailId}/public`
            : "/api/placeholder/120/80";
    };

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setIsLoading(true);
                const data = await CreatorService.getVideosByPlaylist(
                    playlistId
                );
                setVideos(data);
                if (data.length > 0) {
                    setCurrentVideo(data[0]);
                    setCurrentVideoIndex(0);
                }
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to load videos", error);
                setError("Failed to load videos");
                setIsLoading(false);
            }
        };

        if (playlistId) fetchVideos();
    }, [playlistId]);
    const loadVideo = (videoToLoad = currentVideo) => {
        if (!videoToLoad || !videoRef.current) return;

        const videoUrl = `https://customer-01eap4epl2x94qzd.cloudflarestream.com/${videoToLoad.streamVideoId.trim()}/manifest/video.m3u8`;
        console.log("Loading video:", videoUrl);

        setVideoLoading(true);
        setError(null);

        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (Hls.isSupported()) {
            const hls = new Hls({ enableWorker: false, lowLatencyMode: true });
            hls.loadSource(videoUrl);
            hls.attachMedia(videoRef.current);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                setVideoLoading(false);
                // 🔐 Safely play after slight delay (ensures DOM is ready)
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current
                            .play()
                            .catch((err) =>
                                console.warn("Autoplay failed", err)
                            );
                    }
                }, 50);
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
                console.error("HLS error", data);
                setError(`Video loading error: ${data.details}`);
                setVideoLoading(false);
                if (data.fatal) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR)
                        hls.startLoad();
                    else if (data.type === Hls.ErrorTypes.MEDIA_ERROR)
                        hls.recoverMediaError();
                    else hls.destroy();
                }
            });

            hlsRef.current = hls;
        } else if (
            videoRef.current.canPlayType("application/vnd.apple.mpegurl")
        ) {
            videoRef.current.src = videoUrl;
            videoRef.current.addEventListener("loadedmetadata", () => {
                setVideoLoading(false);
                setTimeout(() => {
                    if (videoRef.current) {
                        videoRef.current
                            .play()
                            .catch((err) =>
                                console.warn("Autoplay failed", err)
                            );
                    }
                }, 50);
            });
        } else {
            setError("HLS not supported in this browser.");
            setVideoLoading(false);
        }
    };

    useEffect(() => {
        if (currentVideo && videoRef.current) {
            loadVideo();
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [currentVideo]);

    const handleVideoSelect = (video, index) => {
        setCurrentVideo(video);
        setCurrentVideoIndex(index);
    };

    const handleNextVideo = () => {
        if (currentVideoIndex < videos.length - 1) {
            handleVideoSelect(
                videos[currentVideoIndex + 1],
                currentVideoIndex + 1
            );
        }
    };

    const handlePrevVideo = () => {
        if (currentVideoIndex > 0) {
            handleVideoSelect(
                videos[currentVideoIndex - 1],
                currentVideoIndex - 1
            );
        }
    };

    if (isLoading) {
        return (
            <div className="bg-black text-white min-h-screen flex justify-center items-center">
                <div>
                    <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-center mt-4">Loading playlist...</p>
                </div>
            </div>
        );
    }

    if (!videos.length) {
        return (
            <div className="bg-black text-white min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <p className="text-red-500">
                        No videos found in this playlist.
                    </p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 bg-orange-500 px-4 py-2 rounded"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-black text-white min-h-screen">
            {/* Header */}
            <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-300 hover:text-white"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold">
                            {playlist?.playlistName || "Level Videos"}
                        </h1>
                        <p className="text-sm text-gray-400">Page 1 of 1</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowPlaylist(!showPlaylist)}
                        className="flex items-center text-gray-300 hover:text-white"
                    >
                        <List className="w-5 h-5 mr-2" />
                        {showPlaylist ? "Hide Playlist" : "Show Playlist"}
                    </button>
                    <Settings className="w-5 h-5 text-gray-400" />
                </div>
            </div>

            <div className="flex">
                {/* Main Video Area */}
                <div className={`flex-1 p-6 ${showPlaylist ? "pr-3" : ""}`}>
                    <div className="bg-black rounded-lg overflow-hidden">
                        <div className="relative aspect-video bg-black flex items-center justify-center">
                            {videoLoading ? (
                                <div className="text-center">
                                    <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-orange-500 mx-auto"></div>
                                    <p className="text-gray-400 mt-2">
                                        Loading video...
                                    </p>
                                </div>
                            ) : error ? (
                                <div className="text-center">
                                    <p className="text-red-500">{error}</p>
                                    <button
                                        onClick={() => loadVideo()}
                                        className="mt-4 bg-orange-500 px-4 py-2 rounded"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <video
                                    ref={videoRef}
                                    controls
                                    className="w-full h-full"
                                    poster={getThumbnailUrl(
                                        currentVideo.thumbnailId
                                    )}
                                    onEnded={handleNextVideo}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>

                        <div className="p-4 bg-gray-800">
                            <h2 className="text-lg font-semibold">
                                {currentVideo?.playlistVideoName}
                            </h2>
                            <div className="flex items-center text-sm text-gray-400">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>
                                    {formatDuration(currentVideo.duration)}
                                </span>
                                <span className="mx-2">•</span>
                                <span className="bg-orange-600 px-2 py-1 rounded text-xs font-semibold">
                                    Video {currentVideoIndex + 1}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center mt-4">
                        <button
                            onClick={handlePrevVideo}
                            disabled={currentVideoIndex === 0}
                            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-gray-400">
                            {currentVideoIndex + 1} of {videos.length}
                        </span>
                        <button
                            onClick={handleNextVideo}
                            disabled={currentVideoIndex === videos.length - 1}
                            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>

                {/* Playlist Sidebar */}
                {showPlaylist && (
                    <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto max-h-[calc(100vh-100px)]">
                        <div className="p-4 border-b border-gray-700">
                            <h3 className="font-semibold mb-2">Playlist</h3>
                        </div>
                        {videos.map((video, index) => (
                            <div
                                key={video.playlistVideoId}
                                onClick={() => handleVideoSelect(video, index)}
                                className={`p-3 cursor-pointer hover:bg-gray-700 ${
                                    currentVideo?.playlistVideoId ===
                                    video.playlistVideoId
                                        ? "bg-gray-700 border-l-4 border-orange-500"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={getThumbnailUrl(video.thumbnailId)}
                                        className="w-20 h-12 rounded object-cover"
                                        alt={video.playlistVideoName}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate">
                                            {video.playlistVideoName}
                                        </h4>
                                        <div className="text-xs text-gray-400">
                                            Video {index + 1} •{" "}
                                            {formatDuration(video.duration)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
