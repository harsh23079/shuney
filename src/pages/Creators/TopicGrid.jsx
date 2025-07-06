import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { ArrowLeft, Play, TrendingUp, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import CreatorService from "../../lib/creatorService";
import iconImg from "/image.png";
import placeholderImg from "/placeholder.svg";

const TopicGrid = () => {
    const { creatorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const creator = location.state?.creator;
    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    const [topics, setTopics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isFetchingRef = useRef(false);
    const mountedRef = useRef(true);

    const fetchTopics = useCallback(async () => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            const data = await CreatorService.getTopicsByCreator(creatorId);
            if (!mountedRef.current) return;
            setTopics(data);
            console.log("topics", data);

            if (data.length === 0) {
                setError("No topics found for this creator");
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(`Error fetching topics: ${err.message}`);
            }
        } finally {
            if (mountedRef.current) setIsLoading(false);
            isFetchingRef.current = false;
        }
    }, [creatorId]);

    useEffect(() => {
        mountedRef.current = true;
        fetchTopics();
        return () => {
            mountedRef.current = false;
            isFetchingRef.current = false;
        };
    }, [fetchTopics]);

    const handleRefresh = useCallback(() => {
        if (!isFetchingRef.current) fetchTopics();
    }, [fetchTopics]);

    const handleTopicClick = useCallback(
        (topic) => {
            navigate(`${topic.playlistTopicId}/playlists`, {
                state: { topic },
            });
        },
        [navigate]
    );

    const handleBack = () => {
        navigate("/creators");
    };

    if (isLoading && topics.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-gray-400">Loading topics...</p>
                    <p className="text-gray-500 text-sm mt-2">
                        This may take a moment
                    </p>
                </div>
            </div>
        );
    }

    if (error && topics.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-6">
                        <p className="text-red-400 mb-4">{error}</p>
                        <div className="text-gray-400 text-sm">
                            <p>Possible issues:</p>
                            <ul className="mt-2 space-y-1">
                                <li>• Check your internet connection</li>
                                <li>• Topic service may be unavailable</li>
                                <li>• Creator may have no topics</li>
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
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                            </>
                        )}
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
                            onClick={handleBack}
                            variant="ghost"
                            size="icon"
                            className="text-white hover:text-orange-500"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-3xl font-bold">
                            <span className="text-orange-500">Topic</span>'s
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
                            {topics.length} topics available
                        </p>
                        {error && topics.length > 0 && (
                            <p className="text-yellow-400 text-sm">
                                ⚠️ Some data may be outdated
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Creator Info Section */}
            {creator && (
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <img
                            //src={`https://imagedelivery.net/${accountHash}/${creator.thumbnailId}/public`}
                            src={iconImg}
                            alt={creator.playlistCreatorName}
                            className="mx-auto rounded-full w-24 h-24 border-4 border-orange-500 shadow-lg"
                            loading="lazy"
                        />
                        <h2 className="text-2xl font-bold mt-4 text-white">
                            {creator.playlistCreatorName}
                        </h2>
                        <p className="text-gray-400 mt-1">
                            Explore topics by this creator
                        </p>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-12">
                {topics.length === 0 && !isLoading ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-8">
                            <p className="text-gray-400 text-lg mb-4">
                                No topics found for this creator.
                            </p>
                            <Button
                                onClick={handleRefresh}
                                disabled={isLoading}
                                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                                        Loading...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2" />{" "}
                                        Refresh
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {topics.map((topic, index) => (
                            <Card
                                key={topic.playlistTopicId || index}
                                className="group bg-gray-900/50 border-gray-700 hover:border-orange-500 transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
                                onClick={() => handleTopicClick(topic)}
                            >
                                <CardContent className="p-0">
                                    <div className="relative h-48 bg-gradient-to-br from-orange-500 to-red-500">
                                        <img
                                            src={
                                                topic.thumbnailId
                                                    ? `https://imagedelivery.net/${accountHash}/${topic.thumbnailId}/public`
                                                    : placeholderImg
                                            }
                                            alt={
                                                topic.playlistTopicName ||
                                                `Topic ${index + 1}`
                                            }
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/40" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                size="lg"
                                                className="bg-orange-500 hover:bg-orange-600 rounded-full"
                                            >
                                                <Play className="w-5 h-5 mr-2" />{" "}
                                                Explore
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-center text-white mb-2 group-hover:text-orange-500 transition-colors">
                                            {topic.playlistTopicName ||
                                                `Topic ${index + 1}`}
                                        </h3>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                {isLoading && topics.length > 0 && (
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

export default TopicGrid;
