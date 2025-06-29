import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CreatorService from "../../lib/creatorService";

const TopicGrid = () => {
    const { creatorId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const creator = location.state?.creator;
    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    const [topics, setTopics] = useState([]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const data = await CreatorService.getTopicsByCreator(creatorId);
                setTopics(data);
                console.log("topics", data);
            } catch (error) {
                console.error("Failed to load topics", error);
            }
        };
        fetchTopics();
    }, [creatorId]);

    const handleTopicClick = (topic) => {
        navigate(`${topic.playlistTopicId}/playlists`, {
            state: { topic },
        });
    };

    const handleBack = () => {
        navigate("/creators");
    };

    return (
        <div className="bg-black min-h-screen text-white px-4 py-6">
            <button
                onClick={handleBack}
                className="text-orange-500 mb-4 font-semibold"
            >
                ← Back to Creators
            </button>

            {creator && (
                <div className="text-center mb-6">
                    <img
                        src={`https://imagedelivery.net/${accountHash}/${creator.thumbnailId}/public`}
                        alt={creator.playlistCreatorName}
                        className="mx-auto rounded-full w-24 h-24 border-2 border-orange-500"
                    />
                    <h2 className="text-2xl font-bold mt-2">
                        {creator.playlistCreatorName}
                    </h2>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {topics.map((topic, index) => (
                    <div
                        key={topic.id}
                        onClick={() => handleTopicClick(topic)}
                        className="bg-gray-900 hover:bg-gray-800 p-2 rounded-lg cursor-pointer"
                    >
                        <img
                            src={`https://imagedelivery.net/${accountHash}/${topic.thumbnailId}/public`}
                            alt={topic.playlistTopicName}
                            className="w-full rounded-lg"
                        />
                        <h3 className="text-sm mt-2 font-semibold text-center">
                            {topic.playlistTopicName}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopicGrid;
