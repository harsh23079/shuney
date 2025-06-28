import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreatorService from "../../lib/creatorService";
import CreatorGrid from "./CreatorGrid";

const CreatorPlaylist = () => {
    const [creators, setCreators] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCreators = async () => {
            try {
                const data = await CreatorService.getCreators();
                setCreators(data);
            } catch (error) {
                console.error("Failed to load creators", error);
            }
        };
        fetchCreators();
    }, []);

    const handleCreatorClick = (creator) => {
        navigate(`${creator.playlistCreatorId}/topics`, { state: { creator } });
    };

    return (
        <div className="min-h-screen bg-[#0D0D0D] text-white px-4 py-6">
            <CreatorGrid
                creators={creators}
                onCreatorClick={handleCreatorClick}
            />
        </div>
    );
};

export default CreatorPlaylist;
