import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Loader2, ArrowLeft, Play, RefreshCw } from "lucide-react";

export default function SubcategoriesPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageErrors, setImageErrors] = useState(new Set());

    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    const fetchSubcategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const q = query(
                collection(db, "subcategories-new"),
                where("categoryId", "==", categoryId),
                orderBy("createdAt", "asc")
            );
            const snapshot = await getDocs(q);

            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            setSubcategories(data);

            if (data.length === 0) {
                setError("No subcategories found for this category.");
            }
        } catch (err) {
            console.error("Error fetching subcategories:", err);
            setError("Failed to load subcategories.");
        } finally {
            setLoading(false);
        }
    }, [categoryId]);

    useEffect(() => {
        fetchSubcategories();
    }, [fetchSubcategories]);

    const getImageUrl = (imageId) => {
        if (!imageId) return "/placeholder.svg";
        return `https://imagedelivery.net/${accountHash}/${imageId}/public`;
    };

    const handleImageError = (imageId, event) => {
        setImageErrors((prev) => new Set([...prev, imageId]));
        event.target.src = "/placeholder.svg";
    };

    const handleCardClick = (subcategory) => {
        navigate(
            `/level/categories/${categoryId}/subcategories/${subcategory.subCategoryId}`
        );
    };

    const BackButton = () => (
        <div className="flex justify-start px-4 mb-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="text-white hover:text-orange-500"
            >
                <ArrowLeft className="w-5 h-5" />
            </Button>
        </div>
    );

    if (loading && subcategories.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                {BackButton()}
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading subcategories...</p>
                </div>
            </div>
        );
    }

    if (error && subcategories.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                {BackButton()}
                <div className="text-center max-w-md">
                    <p className="text-red-400 mb-4">{error}</p>
                    <Button
                        onClick={fetchSubcategories}
                        className="bg-orange-500 hover:bg-orange-600"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
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
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="text-white hover:text-orange-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-orange-500">
                            Subcategories
                        </h1>
                        <Button
                            onClick={fetchSubcategories}
                            variant="ghost"
                            className="ml-auto text-gray-400 hover:text-orange-500"
                            disabled={loading}
                        >
                            {loading ? (
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
                            {subcategories.length} sub-categories topics
                            available
                        </p>
                        {error && subcategories.length > 0 && (
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Some data may be outdated
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {subcategories.map((sub, index) => (
                        <Card
                            key={sub.id}
                            className="group bg-gray-900/50 border border-gray-700 hover:border-orange-500 cursor-pointer hover:scale-105 transition-transform"
                            onClick={() => handleCardClick(sub)}
                        >
                            <CardContent className="p-0">
                                <div className="relative">
                                    <img
                                        src={getImageUrl(sub.smallImageId)}
                                        alt={
                                            sub.subCategoryName ||
                                            `Subcategory ${index + 1}`
                                        }
                                        className="w-full h-40 object-cover transition-opacity"
                                        onError={(e) =>
                                            handleImageError(
                                                sub.smallImageId,
                                                e
                                            )
                                        }
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="lg"
                                            className="bg-orange-500 hover:bg-orange-600 rounded-full"
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Explore
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 border-t border-gray-700 bg-gray-800">
                                    <h3 className="text-white text-lg font-extrabold truncate text-center">
                                        {sub.subCategoryName}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
