import React, { useRef, useState } from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ videoStreamId }) => {
    const playerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [played, setPlayed] = useState(0);
    const [volume, setVolume] = useState(0.8); // Default volume

    const hlsUrl = `https://customer-01eap4epl2x94qzd.cloudflarestream.com/${videoStreamId}/manifest/video.m3u8`;

    const handlePlayPause = () => {
        setPlaying((prev) => !prev);
    };

    const handleProgress = (state) => {
        setPlayed(state.played);
    };

    const handleVolumeChange = (e) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
        }
    };

    return (
        <div className="relative bg-black w-full max-w-md mx-auto aspect-[9/16]">
            {/* Top Controls */}
            <div className="absolute top-0 left-0 right-0 z-10 p-2 flex flex-col gap-2 bg-black/60 text-white">
                <div className="flex justify-between items-center">
                    <button onClick={handlePlayPause}>
                        {playing ? "Pause" : "Play"}
                    </button>
                   
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="volume">Volume:</label>
                    <input
                        id="volume"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-full"
                    />
                </div>
            </div>

            {/* Video */}
            <ReactPlayer
                ref={playerRef}
                src={hlsUrl}
                playing={playing}
                volume={volume}
                controls={false}
                onProgress={handleProgress}
                config={{
                    file: { forceHLS: true },
                }}
                width="100%"
                height="100%"
            />
        </div>
    );
};

export default VideoPlayer;
