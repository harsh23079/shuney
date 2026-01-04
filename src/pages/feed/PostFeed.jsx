import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Play,
    Heart,
    MessageCircle,
    Share,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Eye,
    Clock,
    Bookmark,
    Send,
    User,
    Loader2,
    Pause,
    Volume2,
    VolumeX,
    Maximize,
    RotateCcw,
} from "lucide-react";

// Firebase imports - uncomment and configure these
import { db } from "../../firebase/firebase-config";
import {
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    startAfter,
    doc,
    updateDoc,
    increment,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";
import { Link, useNavigation } from "react-router-dom";

// Replace with your actual Cloudflare account hash
const CLOUDFLARE_ACCOUNT_HASH = import.meta.env.VITE_ACCOUNT_HASH;
const POSTS_PER_PAGE = 5;

const InstagramFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState(null);
    const observer = useRef();

    // Fetch initial posts
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async (isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }
            setError(null);

            // Build Firebase query
            let q;
            if (lastDoc && isLoadMore) {
                q = query(
                    collection(db, "feed-posts"),
                    orderBy("_createdBy.timestamp", "desc"),
                    startAfter(lastDoc),
                    limit(POSTS_PER_PAGE)
                );
            } else {
                q = query(
                    collection(db, "feed-posts"),
                    orderBy("_createdBy.timestamp", "desc"),
                    limit(POSTS_PER_PAGE)
                );
            }

            const snapshot = await getDocs(q);
            const newPosts = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                // Filter visible posts
                if (data.isVisible === true) {
                    newPosts.push({
                        id: doc.id,
                        ...data,
                    });
                }
            });

            if (isLoadMore) {
                setPosts((prev) => [...prev, ...newPosts]);
            } else {
                setPosts(newPosts);
            }
            console.log(newPosts);

            // Set last document for pagination
            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }

            // Check if there are more posts
            setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Failed to load posts. Please try again.");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = useCallback(() => {
        if (hasMore && !loadingMore) {
            fetchPosts(true);
        }
    }, [hasMore, loadingMore]);

    // Infinite scroll observer
    const lastPostElementRef = useCallback(
        (node) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting && hasMore && !loadingMore) {
                        loadMore();
                    }
                },
                {
                    threshold: 0.1,
                }
            );
            if (node) observer.current.observe(node);
        },
        [loading, hasMore, loadingMore, loadMore]
    );

    const handleRefresh = () => {
        setPosts([]);
        setLastDoc(null);
        setHasMore(true);
        fetchPosts();
    };

    if (loading && posts.length === 0) {
        return <LoadingSkeleton />;
    }

    if (error && posts.length === 0) {
        return <ErrorState error={error} onRetry={handleRefresh} />;
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Posts Feed */}
            <div className="max-w-lg mx-auto">
                {posts.map((post, index) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        ref={
                            index === posts.length - 1
                                ? lastPostElementRef
                                : null
                        }
                    />
                ))}
            </div>

            {/* Loading More */}
            {loadingMore && (
                <div className="max-w-md mx-auto py-8 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
            )}

            {/* No More Posts */}
            {!hasMore && posts.length > 0 && (
                <div className="max-w-md mx-auto text-center py-8">
                    <p className="text-gray-400">You're all caught up!</p>
                </div>
            )}

            {/* Empty State */}
            {posts.length === 0 && !loading && (
                <div className="max-w-md mx-auto text-center py-20">
                    <div className="text-6xl mb-4">📱</div>
                    <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                    <p className="text-gray-400 mb-6">
                        Start following accounts to see posts here
                    </p>
                    <button
                        onClick={handleRefresh}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            )}
        </div>
    );
};

const PostCard = React.forwardRef(({ post }, ref) => {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [likes, setLikes] = useState(post.likesCount || 0);
    const [views, setViews] = useState(post.viewsCount || 0);
    const [comments] = useState(post.commentsCount || 0);
    const [comment, setComment] = useState("");

    const handleLike = async () => {
        try {
            setLiked(!liked);
            setLikes((prev) => (liked ? prev - 1 : prev + 1));

            // Update likes in Firebase
            const postRef = doc(db, "feed-posts", post.id);
            await updateDoc(postRef, {
                likesCount: increment(liked ? -1 : 1),
            });
        } catch (error) {
            console.error("Error updating likes:", error);
            // Revert UI changes on error
            setLiked(liked);
            setLikes((prev) => (liked ? prev + 1 : prev - 1));
        }
    };

    const handleSave = () => {
        setSaved(!saved);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: post.title || "Check out this post",
                    text: post.description || "Interesting content",
                    url: window.location.href,
                });
            } catch (error) {
                console.log("Error sharing:", error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link copied to clipboard!");
        }
    };

    const handleComment = async () => {
        if (comment.trim()) {
            try {
                // Add comment to Firebase
                await addDoc(collection(db, "comments"), {
                    postId: post.id,
                    comment: comment.trim(),
                    createdAt: serverTimestamp(),
                    userId: "current-user-id", // Replace with actual user ID
                    userName: "Current User", // Replace with actual user name
                });

                // Update comment count
                const postRef = doc(db, "feed-posts", post.id);
                await updateDoc(postRef, {
                    commentsCount: increment(1),
                });

                setComment("");
            } catch (error) {
                console.error("Error adding comment:", error);
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "now";

        try {
            const date = timestamp.toDate
                ? timestamp.toDate()
                : new Date(timestamp);
            const now = new Date();
            const diffInMs = now - date;
            const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
            const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
            const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

            if (diffInMinutes < 1) return "now";
            if (diffInMinutes < 60) return `${diffInMinutes}m`;
            if (diffInHours < 24) return `${diffInHours}h`;
            if (diffInDays < 7) return `${diffInDays}d`;
            return date.toLocaleDateString();
        } catch (error) {
            return "now";
        }
    };

    const getBusinessInfo = () => {
        if (post.businessInfo && post.businessInfo.length > 0) {
            return post.businessInfo[0];
        }
        return null;
    };

    return (
        <div
            ref={ref}
            className="mb-6 bg-black flex flex-col items-center justify-center"
        >
            {/* Post Header */}
            <div className="px-4 py-3 flex items-center w-96 justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full">
                        <Play className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm">
                                {post.title || "Startup Kroo Content"}
                            </span>
                        </div>
                    </div>
                </div>
                <MoreHorizontal className="w-6 h-6 text-gray-400" />
            </div>

            {/* Post Media */}
            <div className="relative">
                <PostMedia post={post} />
            </div>

            {/* CTA Button */}
            <div className="px-1 pb-4 mt-4">
                <PostActionButton post={post} />
            </div>
        </div>
    );
});

const VideoPlayer = ({ post }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showControls, setShowControls] = useState(false);

    const getVideoUrl = () => {
        if (post.videoStreamId) {
            return `https://customer-01eap4epl2x94qzd.cloudflarestream.com/${post.videoStreamId}/manifest/video.m3u8`;
        }
        return null;
    };

    useEffect(() => {
        const video = videoRef.current;
        const videoSrc = getVideoUrl();

        if (!video || !videoSrc) return;

        // Check if HLS is supported natively
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoSrc;
            setIsLoading(false);
        } else {
            // Use HLS.js for browsers that don't support HLS natively
            const loadHlsScript = async () => {
                try {
                    // Load HLS.js from CDN
                    if (!window.Hls) {
                        const script = document.createElement("script");
                        script.src =
                            "https://cdn.jsdelivr.net/npm/hls.js@latest";
                        script.onload = () => initializeHls();
                        script.onerror = () => setError(true);
                        document.head.appendChild(script);
                    } else {
                        initializeHls();
                    }
                } catch (err) {
                    console.error("Failed to load HLS.js:", err);
                    setError(true);
                }
            };

            const initializeHls = () => {
                if (window.Hls && window.Hls.isSupported()) {
                    const hls = new window.Hls({
                        debug: false,
                        enableWorker: true,
                        lowLatencyMode: true,
                    });

                    hlsRef.current = hls;
                    hls.loadSource(videoSrc);
                    hls.attachMedia(video);

                    hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
                        setIsLoading(false);
                        console.log("HLS manifest loaded");
                    });

                    hls.on(window.Hls.Events.ERROR, (event, data) => {
                        console.error("HLS error:", data);
                        if (data.fatal) {
                            setError(true);
                            setIsLoading(false);
                        }
                    });
                } else {
                    console.error("HLS is not supported");
                    setError(true);
                    setIsLoading(false);
                }
            };

            loadHlsScript();
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [post.videoStreamId]);

    const togglePlay = async () => {
        if (videoRef.current) {
            try {
                if (isPlaying) {
                    videoRef.current.pause();
                } else {
                    await videoRef.current.play();
                }
                setIsPlaying(!isPlaying);
            } catch (err) {
                console.error("Error toggling play:", err);
            }
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
            setIsLoading(false);
        }
    };

    const handleSeek = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const newTime = (clickX / rect.width) * duration;

        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const handleError = (e) => {
        console.error("Video error:", e);
        setError(true);
        setIsLoading(false);
    };

    const handleCanPlay = () => {
        setIsLoading(false);
        setError(false);
    };

    const handleRestart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            setCurrentTime(0);
        }
    };

    const videoUrl = getVideoUrl();

    if (!videoUrl || error) {
        return (
            <div className="w-96 h-96 bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-2">📹</div>
                    <p className="text-gray-400">Video unavailable</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative w-96 h-96 bg-black group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted={isMuted}
                playsInline
                preload="metadata"
                controls={false}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onError={handleError}
                onCanPlay={handleCanPlay}
                onLoadStart={() => setIsLoading(true)}
                onLoadedData={() => setIsLoading(false)}
                onWaiting={() => setIsLoading(true)}
                onCanPlayThrough={() => setIsLoading(false)}
            />

            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            )}

            {/* Play/Pause overlay */}
            <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={togglePlay}
            >
                {!isPlaying && !isLoading && (
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-black ml-1" />
                    </div>
                )}
            </div>

            {/* Controls overlay */}
            <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300 ${
                    showControls || !isPlaying ? "opacity-100" : "opacity-0"
                }`}
            >
                {/* Progress bar */}
                <div
                    className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-white rounded-full transition-all duration-150"
                        style={{
                            width: `${
                                duration ? (currentTime / duration) * 100 : 0
                            }%`,
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={togglePlay}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5" />
                            )}
                        </button>

                        <button
                            onClick={toggleMute}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            {isMuted ? (
                                <VolumeX className="w-5 h-5" />
                            ) : (
                                <Volume2 className="w-5 h-5" />
                            )}
                        </button>

                        <button
                            onClick={handleRestart}
                            className="text-white hover:text-gray-300 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 text-white text-sm">
                        <span>{formatTime(currentTime)}</span>
                        <span>/</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>

            {/* Duration badge */}
            {post.duration && (
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs">
                    {post.duration}
                </div>
            )}
        </div>
    );
};

const PostMedia = ({ post }) => {
    const [imageError, setImageError] = useState(false);

    const getImageUrl = (imageId) => {
        if (!imageId)
            return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`;
        console.log(
            "image2",
            `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/public`
        );
        return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/public`;
    };

    const getFirstImageUrl = () => {
        if (post.imageIds && post.imageIds.length > 0) {
            return getImageUrl(post.imageIds[0]);
        } else if (post.imgId) {
            console.log("image", post.imgId);
            return getImageUrl(post.imgId);
        }
        return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`;
    };

    switch (post.postType) {
        case "image":
            return (
                <div className="w-96 h-96 bg-gray-900">
                    <img
                        src={
                            imageError
                                ? `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`
                                : getFirstImageUrl()
                        }
                        alt={post.title || "Post image"}
                        className="w-full h-full object-fill"
                        onError={() => setImageError(true)}
                    />
                </div>
            );

        case "multi_image":
            return <MultiImageCarousel images={post.imageIds || []} />;

        case "video":
            return <VideoPlayer post={post} />;

        case "reels_carousel":
            return (
                <div className="w-96 h-96 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center relative">
                    <div className="text-center text-white">
                        {console.log(post, "reel")}
                        <div className="grid grid-cols-3 gap-2 mb-4 mx-auto w-20">
                            {[...Array(9)].map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-square bg-white/20 rounded-sm animate-pulse"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                />
                            ))}
                        </div>
                        <p className="font-bold text-lg">
                            {post.reelsCount || "Multiple"} Reels
                        </p>
                        <p className="text-white/80 text-sm">Tap to explore</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        Reels
                    </div>
                </div>
            );

        default:
            return (
                <div className="aspect-square bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-gray-400">Content</p>
                    </div>
                </div>
            );
    }
};

const MultiImageCarousel = ({ images }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState({});

    const validImages = images?.filter((img) => img) || [];

    const getImageUrl = (imageId) => {
        if (!imageId)
            return `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`;
        return `https://imagedelivery.net/${CLOUDFLARE_ACCOUNT_HASH}/${imageId}/public`;
    };

    if (validImages.length === 0) {
        return (
            <div className="aspect-square bg-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-2">🖼️</div>
                    <p className="text-gray-400">No images</p>
                </div>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
    };

    const prevImage = () => {
        setCurrentIndex(
            (prev) => (prev - 1 + validImages.length) % validImages.length
        );
    };

    const handleImageError = (index) => {
        setImageErrors((prev) => ({ ...prev, [index]: true }));
    };

    return (
        <div className="relative w-96 h-96 bg-black">
            <img
                src={
                    imageErrors[currentIndex]
                        ? `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop`
                        : getImageUrl(validImages[currentIndex])
                }
                alt={`Image ${currentIndex + 1} of ${validImages.length}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(currentIndex)}
            />

            {validImages.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        {currentIndex + 1}/{validImages.length}
                    </div>

                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {validImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${
                                    index === currentIndex
                                        ? "bg-white"
                                        : "bg-white/50"
                                }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const PostActionButton = ({ post }) => {
    const getBusinessInfo = (post) => {
        return post.businessInfo && post.businessInfo.length > 0
            ? post.businessInfo[0]
            : null;
    };

    const businessInfo = getBusinessInfo(post);
    console.log(businessInfo, "businessInfo");

function normalizeColor(color, fallback) {
    if (!color) return fallback;
    color = color.startsWith("#") ? color : `#${color}`;
    return parseHexToCSSColor(color) || fallback;
}

function parseHexToCSSColor(hex) {
    const cleanHex = hex.replace("#", "");
    if (cleanHex.length === 6) {
        const r = parseInt(cleanHex.slice(0, 2), 16);
        const g = parseInt(cleanHex.slice(2, 4), 16);
        const b = parseInt(cleanHex.slice(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    if (cleanHex.length === 8) {
        const a = parseInt(cleanHex.slice(0, 2), 16) / 255;
        const r = parseInt(cleanHex.slice(2, 4), 16);
        const g = parseInt(cleanHex.slice(4, 6), 16);
        const b = parseInt(cleanHex.slice(6, 8), 16);
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
    }
    return null;
}

function extractRGB(colorStr) {
    const rgb = colorStr.match(/\d+(\.\d+)?/g);
    return rgb ? rgb.slice(0, 3).map(Number).join(",") : null;
}

function getContrastingTextColor(bgColor, textColor) {
    const bgRGB = extractRGB(bgColor);
    const textRGB = extractRGB(textColor);
    return bgRGB === textRGB ? "black" : textColor;
}

// Final logic
const bgColor = normalizeColor(post.buttonBgColor, "#F57C00");
const rawTextColor = normalizeColor(post.buttonTextColor, "#FFFFFF");
const textColor = getContrastingTextColor(bgColor, rawTextColor);

const buttonStyle = {
    backgroundColor: bgColor,
    color: textColor,
};

    const handleCTAClick = () => {
        // navigate(`/business/levels/${businessInfo.creatorTopicId}`)
    };

    if (post.postType === "reels_carousel") {
        return (
            <button
                onClick={handleCTAClick}
                className="w-96 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
            >
                <Play className="w-4 h-4 inline mr-2" />
                Watch Reels
            </button>
        );
    }

    return (
        <Link to={`/business/levels/${businessInfo.creatorTopicId}`}>
            <button
                onClick={handleCTAClick}
                className="w-96 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={buttonStyle}
            >
                {businessInfo
                    ? `Learn ${businessInfo.creatorTopicName}`
                    : post.ctaText || "Learn More"}
            </button>
        </Link>
    );
};

const LoadingSkeleton = () => {
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-md mx-auto">
                {/* Posts Skeleton */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="mb-6">
                        <div className="p-4 flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-full animate-pulse"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-800 rounded w-24 mb-1 animate-pulse"></div>
                                <div className="h-3 bg-gray-800 rounded w-16 animate-pulse"></div>
                            </div>
                        </div>
                        <div className="aspect-square bg-gray-800 animate-pulse"></div>
                        <div className="p-4">
                            <div className="flex space-x-4 mb-3">
                                <div className="w-6 h-6 bg-gray-800 rounded animate-pulse"></div>
                                <div className="w-6 h-6 bg-gray-800 rounded animate-pulse"></div>
                                <div className="w-6 h-6 bg-gray-800 rounded animate-pulse"></div>
                            </div>
                            <div className="h-4 bg-gray-800 rounded w-20 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-800 rounded w-full mb-1 animate-pulse"></div>
                            <div className="h-4 bg-gray-800 rounded w-2/3 mb-4 animate-pulse"></div>
                            <div className="h-10 bg-gray-800 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ErrorState = ({ error, onRetry }) => {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-8">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold mb-2">
                    Something went wrong
                </h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={onRetry}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};

export default InstagramFeed;
