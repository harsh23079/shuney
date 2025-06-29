// components/CreatorGrid.jsx
import React from "react";
import { User } from "lucide-react";

const CreatorGrid = ({ creators, onCreatorClick }) => {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Content Creators
                </h1>
                <p className="text-gray-600">
                    Discover content from your favorite creators
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {creators.map((creator) => (
                    <div
                        key={creator.playlistCreatorId}
                        onClick={() => onCreatorClick(creator)}
                        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                        <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                            <User className="w-16 h-16 text-white" />
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {creator.playlistCreatorName}
                            </h3>
                            <p className="text-sm text-gray-500">
                                Content Creator
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CreatorGrid;
