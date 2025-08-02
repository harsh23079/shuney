import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import {
    ArrowLeft,
    Play,
    BookOpen,
    Wrench,
    Loader2,
    RefreshCw,
    Eye,
} from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { useEffect, useState, useCallback, useRef } from "react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase-config";

export default function LevelsPage() {
    const { creatorTopicId } = useParams(); // Get creatorTopicId from URL params
    const location = useLocation ();
    const buzName = location?.state?.buzName || "Level's";
    const [levels, setLevels] = useState([]);
    const [whatLevels, setWhatLevels] = useState([]);
    const [howLevels, setHowLevels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());
    const [topicName, setTopicName] = useState("");
    const navigate = useNavigate();

    // Use ref to prevent infinite loops
    const isFetchingRef = useRef(false);
    const mountedRef = useRef(true);
    const goBack = useCallback(() => {
        window.history.back();
    }, []);

    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    // Fetch levels from levels-new collection
    // Alternative approach: Fetch all and filter in JavaScript
    const fetchLevels = useCallback(async () => {
        if (isFetchingRef.current) {
            console.log("Fetch already in progress, skipping...");
            return;
        }

        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            console.log(
                "Starting to fetch levels for creatorTopicId:",
                creatorTopicId
            );

            // Fetch all documents from the collection
            const q = query(collection(db, "levels-new"));
            const snapshot = await getDocs(q);
            console.log("Fetched snapshot:", snapshot.size, "documents");

            if (!mountedRef.current) {
                console.log("Component unmounted, aborting fetch");
                return;
            }

            // Filter and process documents in JavaScript
            const allLevels = snapshot.docs.map((doc, index) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    levelId: data.levelId || doc.id,
                    levelName: data.levelName || `Level ${index + 1}`,
                    categoryId: data.categoryId || "",
                    subCategoryId: data.subCategoryId || "",
                    creatorTopicId: data.creatorTopicId || "",
                    levelCreatorId: data.levelCreatorId || "",
                    sectionType: data.sectionType || "What",
                    thumbnailId: data.thumbnailId || null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                };
            });

            // Filter by creatorTopicId and sort by createdAt
            const fetched = allLevels
                .filter((level) => level.creatorTopicId === creatorTopicId)
                .sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return a.createdAt.toMillis() - b.createdAt.toMillis();
                });

            // Re-index the levels after filtering
            const indexedLevels = fetched.map((level, index) => ({
                ...level,
                levelName: level.levelName || `Level ${index + 1}`,
            }));

            // Group levels by sectionType
            const whatLevelsFiltered = indexedLevels.filter(
                (level) => level.sectionType === "What"
            );
            const howLevelsFiltered = indexedLevels.filter(
                (level) => level.sectionType === "How"
            );

            setLevels(indexedLevels);
            setWhatLevels(whatLevelsFiltered);
            setHowLevels(howLevelsFiltered);
            setImageErrors(new Set());

            if (indexedLevels.length === 0) {
                setError("No levels found for this topic");
            }

            // Set topic name from first level or use creatorTopicId
            if (indexedLevels.length > 0) {
                setTopicName(creatorTopicId);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            if (mountedRef.current) {
                setError(`Error fetching levels: ${err.message}`);
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
            isFetchingRef.current = false;
        }
    }, [creatorTopicId]);
    // useEffect with cleanup
    useEffect(() => {
        mountedRef.current = true;
        if (creatorTopicId) {
            fetchLevels();
        } else {
            setError("No topic ID provided");
            setIsLoading(false);
        }

        // Cleanup function
        return () => {
            mountedRef.current = false;
            isFetchingRef.current = false;
        };
    }, [fetchLevels, creatorTopicId]);

    // Image URL generation with fallback
    const getImageUrl = useCallback(
        (imageId, type = "public") => {
            if (!imageId) {
                return "/placeholder.svg";
            }

            return `https://imagedelivery.net/${accountHash}/${imageId}/${type}`;
        },
        [accountHash]
    );

    // Handle image errors
    const handleImageError = useCallback(
        (imageId, event) => {
            console.log("Image error for:", imageId);
            setImageErrors((prev) => new Set([...prev, imageId]));

            // Try different fallbacks
            const img = event.target;
            const currentSrc = img.src;

            if (currentSrc.includes("/public")) {
                // Try without the type parameter
                img.src = `https://imagedelivery.net/${accountHash}/${imageId}`;
            } else if (!currentSrc.includes("placeholder")) {
                // Final fallback to placeholder
                img.src = "/placeholder.svg";
            }
        },
        [accountHash]
    );

    // Refresh handler
    const handleRefresh = useCallback(() => {
        if (!isFetchingRef.current) {
            console.log("Manual refresh triggered");
            fetchLevels();
        }
    }, [fetchLevels]);

    // Handle level click
    const handleLevelClick = useCallback(
        (level) => {
            console.log("Clicked level:", {
                id: level.id,
                levelId: level.levelId,
                levelName: level.levelName,
                sectionType: level.sectionType,
                creatorTopicId: level.creatorTopicId,
            });
            // Add your navigation logic here
            // For example: navigate(`/level/${level.levelId}`);
            navigate(
                `/levels/${creatorTopicId}/videos/${level.levelId}?page=1`
            );
        },
        [navigate]
    );

    // Render levels section
    const renderLevelsSection = useCallback(
        (sectionLevels, sectionTitle, icon) => {
            if (sectionLevels.length === 0) return null;

            return (
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        {icon}
                        <h2 className="text-2xl font-bold text-white">
                            {sectionTitle}
                        </h2>
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {sectionLevels.length} levels
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {sectionLevels.map((level, index) => (
                            <Card
                                key={level.id}
                                className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
                                onClick={() => handleLevelClick(level)}
                            >
                                <CardContent className="p-0">
                                    <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-500">
                                        <img
                                            src={getImageUrl(level.thumbnailId)}
                                            alt={level.levelName}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            onError={(e) =>
                                                handleImageError(
                                                    level.thumbnailId,
                                                    e
                                                )
                                            }
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

                                        {/* Level number badge */}
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-orange-500 text-white font-bold text-sm px-3 py-1">
                                                {index + 1}
                                            </Badge>
                                        </div>

                                        {/* Play button overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="lg"
                                                className="bg-orange-500 hover:bg-orange-600 rounded-full shadow-lg"
                                            >
                                                <Play className="w-5 h-5 mr-2" />
                                                Start Learning
                                            </Button>
                                        </div>

                                        {/* Image error indicator */}
                                        {imageErrors.has(level.thumbnailId) && (
                                            <div className="absolute top-4 right-4">
                                                <Badge
                                                    variant="outline"
                                                    className="bg-red-500/20 text-red-400 border-red-500/50 text-xs"
                                                >
                                                    Image Error
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    {/* Level info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-white mb-2 line-clamp-2">
                                            {level.levelName}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400">
                                            <Eye className="w-4 h-4" />
                                            <span>Level {index + 1}</span>
                                            <span>•</span>
                                            <span className="capitalize">
                                                {level.sectionType}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            );
        },
        [getImageUrl, handleImageError, imageErrors, handleLevelClick]
    );

    // Loading state
    if (isLoading && levels.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading levels...</p>
                    <p className="text-gray-500 text-sm mt-2">
                        This may take a moment
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && levels.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
                        <p className="text-red-400 mb-4">{error}</p>
                        <div className="text-gray-400 text-sm">
                            <p>Possible issues:</p>
                            <ul className="mt-2 space-y-1">
                                <li>• No levels found for this topic</li>
                                <li>• Check your internet connection</li>
                                <li>• Topic may not have levels yet</li>
                            </ul>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Button
                            onClick={handleRefresh}
                            disabled={isLoading}
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </>
                            )}
                        </Button>
                        <Button variant="outline" className="w-full" onClick={ ()=> navigate(-1)}  >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
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
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        {/* <Link to="/business"> */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goBack}
                            className="text-white hover:text-orange-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        {/* </Link> */}
                        <div>
                            <h1 className="text-3xl font-bold">
                                <span className="text-orange-500">{buzName}</span>{" "}
                            </h1>
                            {/* <h1 className="text-3xl font-bold">
                                <span className="text-orange-500">{topicName}</span>{" "} 
                                {buzName}
                            </h1> */}
                            <p className="text-gray-400 mt-1">
                                Choose your learning path
                            </p>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            variant="ghost"
                            className="ml-auto text-gray-400 hover:text-orange-500 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4" />
                            )}
                            <span className="ml-2 hidden sm:inline">
                                Refresh
                            </span>
                        </Button>
                    </div>
                    <div className="flex items-center justify-between mt-2 ml-14">
                        <div className="flex items-center gap-6">
                            <p className="text-gray-400">
                                {levels.length} total levels
                            </p>
                            {whatLevels.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-blue-400" />
                                    <span className="text-blue-400">
                                        {whatLevels.length} What
                                    </span>
                                </div>
                            )}
                            {howLevels.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Wrench className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">
                                        {howLevels.length} How
                                    </span>
                                </div>
                            )}
                        </div>
                        {error && levels.length > 0 && (
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Some data may be outdated
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Levels Content */}
            <div className="container mx-auto px-4 py-12">
                {levels.length === 0 && !isLoading ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
                            <p className="text-gray-400 text-lg mb-4">
                                No levels found for this topic.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={handleRefresh}
                                    disabled={isLoading}
                                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw className="w-4 h-4 mr-2" />
                                            Refresh
                                        </>
                                    )}
                                </Button>
                                <Link to="/business">
                                    <Button variant="outline">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Back to Business Topics
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* What Levels Section */}
                        {renderLevelsSection(
                            whatLevels,
                            "What",
                            <BookOpen className="w-6 h-6 text-blue-400" />
                        )}

                        {/* How Levels Section */}
                        {renderLevelsSection(
                            howLevels,
                            "How",
                            <Wrench className="w-6 h-6 text-green-400" />
                        )}

                        {/* Empty state when no levels in either section */}
                        {whatLevels.length === 0 &&
                            howLevels.length === 0 &&
                            levels.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
                                        <p className="text-gray-400 text-lg mb-4">
                                            No levels available yet.
                                        </p>
                                        <p className="text-gray-500 text-sm mb-6">
                                            This topic doesn't have any learning
                                            levels created yet.
                                        </p>
                                        <Link to="/business">
                                            <Button variant="outline">
                                                <ArrowLeft className="w-4 h-4 mr-2" />
                                                Back to Business Topics
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                    </>
                )}

                {/* Loading overlay for refresh */}
                {isLoading && levels.length > 0 && (
                    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                            <span className="text-gray-300 text-sm">
                                Refreshing levels...
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
