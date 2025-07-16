import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ videoStreamId, playing, onPlayPause }) => {
    const playerRef = useRef(null);
    const hlsUrl = `https://customer-01eap4epl2x94qzd.cloudflarestream.com/${videoStreamId}/manifest/video.m3u8`;

    const [played, setPlayed] = useState(0);

    const handleProgress = (state) => {
        setPlayed(state.played);
    };

    const togglePlay = () => {
        if (typeof onPlayPause === "function") {
            onPlayPause((prev) => !prev);
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup: pause video when unmounted
            if (typeof onPlayPause === "function") {
                onPlayPause(false);
            }
        };
    }, []);

    return (
        <div className="relative bg-black w-full max-w-md mx-auto rounded-xl overflow-hidden border border-orange-600 shadow-xl">
            <ReactPlayer
                ref={playerRef}
                src={hlsUrl}
                playing={playing}
                muted
                width="100%"
                height="100%"
                onProgress={handleProgress}
                config={{
                    file: {
                        attributes: {
                            crossOrigin: "anonymous",
                        },
                        forceHLS: true,
                    },
                }}
                className="aspect-[9/16]" // 👈 keeps vertical video ratio like reels
            />

            {/* Custom Controls */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-4 text-white">
                {/* Play/Pause Button */}
                <button
                    onClick={togglePlay}
                    className="text-orange-500 text-2xl focus:outline-none"
                    aria-label={playing ? "Pause" : "Play"}
                >
                    {playing ? "❚❚" : "▶"}
                </button>

                {/* Progress Bar */}
                <div className="flex-1 h-2 bg-gray-700 rounded overflow-hidden">
                    <div
                        className="h-full bg-orange-500 transition-all duration-200 ease-linear"
                        style={{ width: `${played * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
