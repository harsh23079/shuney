import React, { useState, useEffect, useRef } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    Loader2,
} from "lucide-react";
import { query, orderBy, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";

const placeholderImg = "https://via.placeholder.com/100x100?text=Image";

const StoriesFeature = () => {
    const [selectedStory, setSelectedStory] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const progressInterval = useRef(null);
    const fetchedRef = useRef(false);
    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    const fetchStories = async () => {
        if (fetchedRef.current) return;

        try {
            fetchedRef.current = true;
            setLoading(true);
            setError(null);

            if (!db) throw new Error("Firebase database not initialized");

            const storiesQuery = query(
                collection(db, "stories"),
                orderBy("_createdBy.timestamp", "desc")
            );

            const snapshot = await getDocs(storiesQuery);

            const storiesData = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                console.log("stories", data);
                if (data?.imageIds?.length) {
                    storiesData.push({
                        id: doc.id,
                        title: data.title || "",
                        imageIds: data.imageIds,
                        iconId: data.iconId || "",
                        _createdBy: data._createdBy || {},
                        _updatedBy: data._updatedBy || {},
                    });
                }
            });

            setStories(storiesData);
        } catch (err) {
            console.error("Error fetching stories:", err);
            setError(`Failed to load stories: ${err.message}`);
            fetchedRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    const retryFetch = () => {
        fetchedRef.current = false;
        fetchStories();
    };

    useEffect(() => {
        fetchStories();
        return () => {
            clearInterval(progressInterval.current);
        };
    }, []);

    const handleNextImageOrStory = () => {
        if (!selectedStory) return;

        const nextImageIndex = currentImageIndex + 1;
        if (nextImageIndex < selectedStory.imageIds.length) {
            setCurrentImageIndex(nextImageIndex);
        } else {
            const currentStoryIndex = stories.findIndex(
                (s) => s.id === selectedStory.id
            );
            const nextStoryIndex = currentStoryIndex + 1;

            if (nextStoryIndex < stories.length) {
                setSelectedStory(stories[nextStoryIndex]);
                setCurrentImageIndex(0);
            } else {
                setSelectedStory(null);
            }
        }
    };

    useEffect(() => {
        if (!selectedStory || !isPlaying || !selectedStory.imageIds?.length)
            return;

        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNextImageOrStory();
                    return 0;
                }
                return prev + 2;
            });
        }, 100);

        return () => clearInterval(progressInterval.current);
    }, [selectedStory?.id, isPlaying, currentImageIndex]);

    useEffect(() => {
        setProgress(0);
    }, [currentImageIndex]);

    const openStory = (story) => {
        if (story?.imageIds?.length) {
            setSelectedStory(story);
            setCurrentImageIndex(0);
            setProgress(0);
            setIsPlaying(true);
        }
    };

    const closeStory = () => {
        setSelectedStory(null);
        setCurrentImageIndex(0);
        setProgress(0);
        setIsPlaying(true);
    };

    const goToPrevious = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        } else {
            const currentStoryIndex = stories.findIndex(
                (s) => s.id === selectedStory?.id
            );
            if (currentStoryIndex > 0) {
                const prevStory = stories[currentStoryIndex - 1];
                setSelectedStory(prevStory);
                setCurrentImageIndex(prevStory.imageIds.length - 1);
            }
        }
    };

    const goToNext = () => {
        if (
            selectedStory &&
            currentImageIndex < selectedStory.imageIds.length - 1
        ) {
            setCurrentImageIndex(currentImageIndex + 1);
        } else {
            const currentStoryIndex = stories.findIndex(
                (s) => s.id === selectedStory?.id
            );
            if (currentStoryIndex < stories.length - 1) {
                setSelectedStory(stories[currentStoryIndex + 1]);
                setCurrentImageIndex(0);
            } else {
                closeStory();
            }
        }
    };

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return "Unknown";
        const now = new Date();
        const storyTime = timestamp.seconds
            ? new Date(timestamp.seconds * 1000)
            : new Date(timestamp);
        const diff = now - storyTime;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    const isRecentStory = (timestamp) => {
        if (!timestamp) return false;
        const storyTime = timestamp.seconds
            ? new Date(timestamp.seconds * 1000)
            : new Date(timestamp);
        return new Date() - storyTime < 2 * 60 * 60 * 1000;
    };

    const getCloudflareImageUrl = (imageId) => {
        if (!imageId || !accountHash) return placeholderImg;
        return `https://imagedelivery.net/${accountHash}/${imageId}/public`;
    };

    const handleImageError = (e) => {
        if (!e.target.src.includes("placeholder")) {
            e.target.src = placeholderImg;
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-900/30 py-4 px-4 border-b border-gray-800">
                <div className="flex items-center justify-center space-x-2 py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <span className="text-gray-300">Loading stories...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-900/30 py-4 px-4 border-b border-gray-800">
                <div className="text-center py-8">
                    <p className="text-red-400 mb-2">{error}</p>
                    <button
                        onClick={retryFetch}
                        className="text-orange-500 hover:text-orange-400 underline transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full">
            <div className="bg-gray-900/30 py-4 px-4 border-b border-gray-800">
                <div className=" max-w-90 justify-center flex  space-x-4 overflow-x-auto scrollbar-hide">
                    {stories.map((story) => (
                        <div
                            key={story.id}
                            className="flex-shrink-0 text-center cursor-pointer hover:scale-95 transition-transform"
                            onClick={() => openStory(story)}
                        >
                            <div className="relative">
                                <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-red-500 rounded-full p-0.5">
                                    <img
                                        src={
                                            getCloudflareImageUrl(
                                                story?.iconId
                                            ) || placeholderImg
                                        }
                                        alt={
                                            story._createdBy?.displayName ||
                                            "User"
                                        }
                                        className="rounded-[50%]"
                                        onError={handleImageError}
                                    />
                                </div>
                                {isRecentStory(story._createdBy?.timestamp) && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedStory && selectedStory.imageIds.length > 0 && (
                <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                    <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
                        {selectedStory.imageIds.map((_, index) => (
                            <div
                                key={index}
                                className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
                            >
                                <div
                                    className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                                    style={{
                                        width:
                                            index === currentImageIndex
                                                ? `${progress}%`
                                                : index < currentImageIndex
                                                ? "100%"
                                                : "0%",
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
                        <div className="flex items-center space-x-3">
                            <img
                                src={
                                    getCloudflareImageUrl(
                                        selectedStory.iconId
                                    ) || placeholderImg
                                }
                                alt={
                                    selectedStory._createdBy?.displayName ||
                                    "User"
                                }
                                className="w-8 h-8 rounded-full object-cover"
                                onError={handleImageError}
                            />
                            <div>
                                <p className="text-white font-medium text-sm">
                                    {selectedStory._createdBy?.displayName ||
                                        "Unknown User"}
                                </p>
                                <p className="text-gray-300 text-xs">
                                    {formatTimeAgo(
                                        selectedStory._createdBy?.timestamp
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={togglePlayPause}
                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </button>
                            <button
                                onClick={closeStory}
                                className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="relative w-full h-full max-w-md mx-auto">
                        <img
                            src={getCloudflareImageUrl(
                                selectedStory.imageIds[currentImageIndex]
                            )}
                            alt={selectedStory.title || "Story"}
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                        />
                        <div
                            className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
                            onClick={goToPrevious}
                        />
                        <div
                            className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10"
                            onClick={goToNext}
                        />
                        <div
                            className="absolute left-1/3 top-0 w-1/3 h-full cursor-pointer z-10"
                            onClick={togglePlayPause}
                        />

                        <div className="hidden md:block">
                            {(stories.findIndex(
                                (s) => s.id === selectedStory.id
                            ) > 0 ||
                                currentImageIndex > 0) && (
                                <button
                                    onClick={goToPrevious}
                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-20"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                            )}
                            {(stories.findIndex(
                                (s) => s.id === selectedStory.id
                            ) <
                                stories.length - 1 ||
                                currentImageIndex <
                                    selectedStory.imageIds.length - 1) && (
                                <button
                                    onClick={goToNext}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-20"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            )}
                        </div>
                    </div>

                    {selectedStory.title && (
                        <div className="absolute bottom-8 left-4 right-4 z-10">
                            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                                <h3 className="text-white font-semibold text-lg">
                                    {selectedStory.title}
                                </h3>
                                <p className="text-gray-300 text-sm mt-1">
                                    Tap left or right to navigate • Tap center
                                    to pause
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default StoriesFeature;
