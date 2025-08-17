import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Play, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase-config";

const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

const CreatorsPage = () => {
    const { subCategoryId, categoryId, creatorTopicId } = useParams();
    const navigate = useNavigate();

    const [creators, setCreators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFetchingRef = useRef(false);
    const mountedRef = useRef(true);

    const fetchCreators = useCallback(async () => {
        if (!creatorTopicId) {
            setError("Missing creatorTopicId.");
            setIsLoading(false);
            return;
        }

        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const q = query(
                collection(db, "level-creators-new"),
                where("creatorTopicId", "==", creatorTopicId),
                orderBy("createdAt", "asc")
            );

            const snapshot = await getDocs(q);
            const creatorsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));

            console.log("Fetched creators:", creatorsData);

            if (mountedRef.current) {
                setCreators(creatorsData);
                if (creatorsData.length === 0) {
                    setError("No creators found.");
                }
            }
        } catch (err) {
            console.error("Error fetching creators:", err);
            if (mountedRef.current) {
                setError(`Error fetching creators: ${err.message}`);
            }
        } finally {
            if (mountedRef.current) setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [creatorTopicId]);

    useEffect(() => {
        mountedRef.current = true;
        fetchCreators();
        return () => {
            mountedRef.current = false;
            isFetchingRef.current = false;
        };
    }, [fetchCreators]);

    const handleRefresh = useCallback(() => {
        if (!isFetchingRef.current) fetchCreators();
    }, [fetchCreators]);

    const handleCreatorClick = (creator) => {
        navigate(
            `/level/categories/${categoryId}/subcategories/${subCategoryId}/creators/${creatorTopicId}/levels/${creator.creatorTopicId}`,
            {}
        );
    };

    if (isLoading && creators.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading creators...</p>
                    <p className="text-gray-500 text-sm mt-2">
                        This may take a moment
                    </p>
                </div>
            </div>
        );
    }

    if (error && creators.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
                        <p className="text-red-400 mb-4">{error}</p>
                        <div className="text-gray-400 text-sm">
                            <p>Possible issues:</p>
                            <ul className="mt-2 space-y-1">
                                <li>• Check your internet connection</li>
                                <li>• Firestore may be unavailable</li>
                                <li>• Invalid or missing `creatorTopicId`</li>
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
                    <Button
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="bg-gray-900/50 border-b border-gray-800">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:text-orange-500"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold">
                            <span className="text-orange-500">Creator</span>'s
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
                            {creators.length} creators available
                        </p>
                        {error && creators.length > 0 && (
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Some data may be outdated
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {creators.map((creator, index) => (
                        <Card
                            key={creator.id}
                            className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
                            onClick={() => handleCreatorClick(creator)}
                        >
                            <CardContent className="p-0">
                                <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-500">
                                    <img
                                        src={`https://imagedelivery.net/${accountHash}/${creator.smallImageId}/public`}
                                        alt={
                                            creator.levelCreatorName ||
                                            `Creator ${index + 1}`
                                        }
                                        className="w-full h-full opacity-90 group-hover:opacity-100 transition-opacity"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0  bg-black/0 hover:bg-black/40" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="lg"
                                            className="bg-orange-500 hover:bg-orange-600 rounded-full"
                                        >
                                            <Play className="w-5 h-5 mr-2" />
                                            Explore
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-orange-500 transition-colors text-center">
                                        {creator.levelCreatorName ||
                                            `Creator ${index + 1}`}
                                    </h3>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                {isLoading && creators.length > 0 && (
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
};

export default CreatorsPage;
