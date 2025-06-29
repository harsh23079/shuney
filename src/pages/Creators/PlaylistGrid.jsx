import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import CreatorService from "../../lib/creatorService";

const PlaylistGrid = () => {
    const { topicId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const topic = location.state?.topic;
    const accountHash = import.meta.env.VITE_ACCOUNT_HASH;

    const [playlists, setPlaylists] = useState([]);

    useEffect(() => {
        const fetchPlaylists = async () => {
            try {
                const data = await CreatorService.getPlaylistsByTopic(topicId);
                setPlaylists(data);
                console.log("playlist", data);
            } catch (error) {
                console.error("Failed to load playlists", error);
            }
        };
        fetchPlaylists();
    }, [topicId]);

    const handlePlaylistClick = (playlist) => {
        navigate(`${playlist.playlistId}/videos`, {
            state: { playlist },
        });
    };

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="p-6 text-white bg-black min-h-screen">
            <button
                onClick={handleBack}
                className="text-orange-500 mb-4 font-semibold"
            >
                ← Back to Topics
            </button>

            <h2 className="text-2xl font-bold mb-6">
                {topic?.playlistTopicName || "Playlists"}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {playlists.map((playlist) => (
                    <div
                        key={playlist.playlistId}
                        onClick={() => handlePlaylistClick(playlist)}
                        className="bg-gray-900 hover:bg-gray-800 p-3 rounded-lg cursor-pointer transition-transform transform hover:scale-105"
                    >
                        <img
                            src={`https://imagedelivery.net/${accountHash}/${playlist.smallImageId}/public`}
                            alt={playlist.playlistName}
                            className="w-full h-40 object-cover rounded-md mb-3"
                        />
                        <h3 className="text-lg font-semibold text-white truncate">
                            {playlist.playlistName}
                        </h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlaylistGrid;
