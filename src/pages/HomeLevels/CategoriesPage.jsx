import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ArrowLeft, Play, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { useEffect, useState, useCallback, useRef } from "react";
import { collection, getDocs, orderBy, limit, query } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";

export default function CategoriesPage() {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());

    const isFetchingRef = useRef(false);
    const mountedRef = useRef(true);

    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    const fetchCategoriesTopics = useCallback(async () => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const q = query(
                collection(db, "categories"),
                orderBy("createdAt", "asc"),
                limit(20)
            );

            const snapshot = await getDocs(q);

            if (!mountedRef.current) return;

            const fetched = snapshot.docs.map((doc, index) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    categoryId: data.categoryId || "default",
                    categoryName: data.categoryName || `Topic ${index + 1}`,
                    thumbnailId: data.bigImageId || null,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                };
            });

            setCategories(fetched);
            setImageErrors(new Set());

            if (fetched.length === 0) {
                setError("No categories topics found in database");
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(`Error fetching data: ${err.message}`);
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchCategoriesTopics();
        return () => {
            mountedRef.current = false;
            isFetchingRef.current = false;
        };
    }, []);

    const getImageUrl = useCallback(
        (imageId, type = "public") => {
            if (!imageId) return "/placeholder.svg";
            return `https://imagedelivery.net/${accountHash}/${imageId}/${type}`;
        },
        [accountHash]
    );

    const handleImageError = useCallback(
        (imageId, event) => {
            setImageErrors((prev) => new Set([...prev, imageId]));
            const img = event.target;
            const currentSrc = img.src;

            if (currentSrc.includes("/public")) {
                img.src = `https://imagedelivery.net/${accountHash}/${imageId}`;
            } else if (!currentSrc.includes("placeholder")) {
                img.src = "/placeholder.svg";
            }
        },
        [accountHash]
    );

    const handleRefresh = useCallback(() => {
        if (!isFetchingRef.current) {
            fetchCategoriesTopics();
        }
    }, [fetchCategoriesTopics]);

    const handleCardClick = useCallback(
        (categories) => {
            navigate(`/level/categories/${categories.categoryId}`);
        },
        [navigate]
    );

    if (isLoading && categories.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-400">
                        Loading categories topics...
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                        This may take a moment
                    </p>
                </div>
            </div>
        );
    }

    if (error && categories.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
                        <p className="text-red-400 mb-4">{error}</p>
                        <div className="text-gray-400 text-sm">
                            <p>Possible issues:</p>
                            <ul className="mt-2 space-y-1">
                                <li>• Check your internet connection</li>
                            </ul>
                        </div>
                    </div>
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
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-gray-900/50 border-b border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:text-orange-500"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold">
                            <span className="text-orange-500">Categories</span>{" "}
                            Topics
                        </h1>
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
                        <p className="text-gray-400">
                            {categories.length} categories topics available
                        </p>
                        {error && categories.length > 0 && (
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Some data may be outdated
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {categories.map((category, index) => (
                        <Card
                            key={category.id}
                            className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
                            onClick={() => handleCardClick(category)}
                        >
                            <CardContent className="p-0">
                                <div className="relative h-fit bg-gradient-to-br from-blue-500 to-purple-500">
                                    <img
                                        src={getImageUrl(category.thumbnailId)}
                                        alt={
                                            category.categoryName ||
                                            `Category ${index + 1}`
                                        }
                                        className="w-full h-48 object-cover"
                                        onError={(e) =>
                                            handleImageError(
                                                category.thumbnailId,
                                                e
                                            )
                                        }
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0  bg-black/0 hover:bg-black/40" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="lg"
                                            className="bg-orange-500 hover:bg-orange-600 rounded-full"
                                        >
                                            <Play className="w-5 h-5 mr-2" />
                                            Learn Now
                                        </Button>
                                    </div>

                                    {imageErrors.has(category.thumbnailId) && (
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

                                {/* ✅ Category name shown here */}
                                <div className="p-4 bg-gray-800 border-t border-gray-700">
                                    <h3 className="text-white font-extrabold text-lg truncate text-center">
                                        {category.categoryName}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {isLoading && categories.length > 0 && (
                    <div className="fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                            <span className="text-gray-300 text-sm">
                                Refreshing...
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
