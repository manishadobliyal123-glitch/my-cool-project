import { useEffect } from "react";
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    RotateCcw,
    RotateCw,
    Maximize2,
    Shuffle,
    Repeat,
} from "lucide-react";

export default function MediaController({
    currentVideo,
    playerRef,

    isPlaying,
    setIsPlaying,

    isMuted,
    setIsMuted,

    volume,
    setVolume,

    currentTime,
    setCurrentTime,

    duration,
    setDuration,

    playNext,
    playPrevious,

    fullscreenOpen,
    setFullscreenOpen,
    openArtistProfile,

    shuffle,
    setShuffle,
    repeat,
    setRepeat,
}) {
    // =========================
    // TRACK PLAYER PROGRESS
    // =========================
    useEffect(() => {
        let interval;

        interval = setInterval(() => {
            try {
                if (window.localAudioPlayer) {
                    const current = window.localAudioPlayer.currentTime;
                    const total = window.localAudioPlayer.duration || 100;
                    setCurrentTime(current);
                    setDuration(total);
                } else if (
                    isPlaying &&
                    playerRef.current &&
                    typeof playerRef.current.getCurrentTime === "function"
                ) {
                    const current = playerRef.current.getCurrentTime();
                    const total = playerRef.current.getDuration();
                    setCurrentTime(current);
                    setDuration(total);
                }
            } catch {
                console.log("Player not ready");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, playerRef, setCurrentTime, setDuration]);


    // =========================
    // PLAY / PAUSE
    // =========================
    const togglePlay = () => {
        if (window.localAudioPlayer) {
            if (isPlaying) {
                window.localAudioPlayer.pause();
                setIsPlaying(false);
            } else {
                window.localAudioPlayer.play().catch(err => console.error(err));
                setIsPlaying(true);
            }
            return;
        }

        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            playerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    // =========================
    // MUTE / UNMUTE
    // =========================
    const toggleMute = () => {
        if (window.localAudioPlayer) {
            if (isMuted) {
                window.localAudioPlayer.muted = false;
                window.localAudioPlayer.volume = volume / 100;
                setIsMuted(false);
            } else {
                window.localAudioPlayer.muted = true;
                setIsMuted(true);
            }
            return;
        }

        if (!playerRef.current) return;

        if (isMuted) {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume);
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    // =========================
    // CHANGE VOLUME
    // =========================
    const handleVolumeChange = (e) => {
        const value = parseInt(e.target.value);
        setVolume(value);

        if (window.localAudioPlayer) {
            window.localAudioPlayer.volume = value / 100;
            if (value > 0) {
                window.localAudioPlayer.muted = false;
                setIsMuted(false);
            }
            return;
        }

        if (playerRef.current) {
            playerRef.current.setVolume(value);
            if (value > 0) {
                playerRef.current.unMute();
                setIsMuted(false);
            }
        }
    };

    // =========================
    // SEEK FORWARD / BACKWARD
    // =========================
    const seek = (seconds) => {
        if (window.localAudioPlayer) {
            window.localAudioPlayer.currentTime = window.localAudioPlayer.currentTime + seconds;
            return;
        }

        if (
            !playerRef.current ||
            typeof playerRef.current.getCurrentTime !== "function"
        ) {
            return;
        }

        const current = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(current + seconds, true);
    };

    // =========================
    // PROGRESS BAR SEEK
    // =========================
    const handleSeekChange = (e) => {
        const value = parseFloat(e.target.value);
        setCurrentTime(value);

        if (window.localAudioPlayer) {
            window.localAudioPlayer.currentTime = value;
            return;
        }

        playerRef.current?.seekTo(value, true);
    };

    // =========================
    // FORMAT TIME
    // =========================
    const formatTime = (time) => {
        if (!time) return "0:00";

        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);

        return `${minutes}:${seconds < 10 ? "0" : ""
            }${seconds}`;
    };

    const thumbnail =
        currentVideo?.snippet?.thumbnails?.default?.url ||
        currentVideo?.snippet?.thumbnails?.medium?.url ||
        currentVideo?.snippet?.thumbnails?.high?.url;
    const title = currentVideo?.snippet?.title || "Nothing playing";
    const artist = currentVideo?.snippet?.channelTitle || "Cose a song to start";

    return (
        <div 
            onClick={() => setFullscreenOpen(true)}
            className="bg-[#0b0817]/95 backdrop-blur-2xl border-t border-white/[0.06] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40 relative cursor-pointer hover:bg-white/[0.015] transition-colors"
        >
            {/* ========================= */}
            {/* PROGRESS BAR */}
            {/* ========================= */}
            <div className="w-full">
                <div className="relative w-full h-1 bg-white/10 hover:h-1.5 transition-all group overflow-hidden">
                    {/* INPUT */}
                    <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeekChange}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    {/* ACTIVE BAR WITH GRADIENT */}
                    <div
                        className="h-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        style={{
                            width: `${(currentTime / (duration || 1)) * 100
                                }%`,
                        }}
                    ></div>
                </div>

                {/* TIME CONTAINER */}
                <div className="flex justify-between px-6 pt-1.5 text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* ========================= */}
            {/* CONTROLS */}
            {/* ========================= */}
            <div className="flex flex-col items-center justify-between gap-4 px-6 pb-5 pt-1.5 sm:flex-row sm:gap-6">
                {/* NOW PLAYING CARD */}
                <div 
                    onClick={(e) => { e.stopPropagation(); setFullscreenOpen(true); }}
                    className="flex min-w-0 items-center gap-4 self-stretch sm:w-72 lg:w-96 cursor-pointer group select-none"
                    title="Open Full Screen Player"
                >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-900 border border-white/5 shadow-md group-hover:scale-105 transition duration-300">
                        {thumbnail ? (
                            <img
                                src={thumbnail}
                                alt=""
                                className="h-full w-full object-cover animate-[spin_20s_linear_infinite]"
                                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-black bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white">
                                MAD
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="line-clamp-1 text-sm font-black text-white tracking-tight group-hover:text-[#ec4899] transition-colors">
                            {title}
                        </p>
                        <p 
                            onClick={(e) => {
                                e.stopPropagation();
                                if (openArtistProfile && currentVideo) {
                                    openArtistProfile(artist);
                                }
                            }}
                            className="line-clamp-1 text-[11px] font-bold text-zinc-400 mt-0.5 cursor-pointer hover:underline hover:text-white"
                        >
                            {artist}
                        </p>
                    </div>
                </div>

                {/* PLAYER BUTTONS - MAIN CTRLS */}
                <div className="flex items-center gap-5 sm:gap-6">
                    {/* BACKWARD 10 SEC */}
                    <button
                        onClick={(e) => { e.stopPropagation(); seek(-10); }}
                        className="text-zinc-400 hover:text-white transition transform hover:scale-105 active:scale-95"
                        title="Backward 10 sec"
                    >
                        <RotateCcw size={18} />
                    </button>

                    {/* SHUFFLE */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setShuffle(!shuffle); }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                            shuffle 
                                ? "bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-500/30" 
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                        title={shuffle ? "Shuffle On" : "Shuffle Off"}
                    >
                        <Shuffle size={16} />
                    </button>

                    {/* PREVIOUS */}
                    <button
                        onClick={(e) => { e.stopPropagation(); playPrevious(); }}
                        className="w-16 h-16 rounded-full flex items-center justify-center border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 text-zinc-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
                        title="Previous Song"
                    >
                        <SkipBack size={28} fill="currentColor" />
                    </button>

                    {/* PLAY / PAUSE - BEAUTIFUL NEON GRADIENT ROUND BUTTON */}
                    <button
                        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.3)] ${isPlaying
                                ? "bg-white text-zinc-950 hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
                                : "bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]"
                            }`}
                    >
                        {isPlaying ? (
                            <Pause size={20} fill="currentColor" />
                        ) : (
                            <Play
                                size={20}
                                fill="currentColor"
                                className="translate-x-0.5"
                            />
                        )}
                    </button>

                    {/* NEXT */}
                    <button
                        onClick={(e) => { e.stopPropagation(); playNext(); }}
                        className="w-16 h-16 rounded-full flex items-center justify-center border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 text-zinc-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
                        title="Next Song"
                    >
                        <SkipForward size={28} fill="currentColor" />
                    </button>

                    {/* REPEAT */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const nextRepeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
                            setRepeat(nextRepeat);
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                            repeat !== "off"
                                ? "bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-500/30" 
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                        title={repeat === "one" ? "Repeat One" : repeat === "all" ? "Repeat All" : "Repeat Off"}
                    >
                        {repeat === "one" ? (
                            <div className="relative">
                                <Repeat size={16} />
                                <span className="absolute -top-1.5 -right-1.5 text-[7px] font-black bg-pink-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center border border-[#0b0817] leading-none">1</span>
                            </div>
                        ) : (
                            <Repeat size={16} />
                        )}
                    </button>

                    {/* FORWARD 10 SEC */}
                    <button
                        onClick={(e) => { e.stopPropagation(); seek(10); }}
                        className="text-zinc-400 hover:text-white transition transform hover:scale-105 active:scale-95"
                        title="Forward 10 sec"
                    >
                        <RotateCw size={18} />
                    </button>
                </div>

                {/* VOLUME CONTROLLER */}
                <div className="hidden lg:flex items-center gap-3.5 w-44 lg:w-52">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                        className="text-zinc-400 hover:text-white transition transform hover:scale-105 active:scale-95"
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX size={18} className="text-[#ec4899]" />
                        ) : (
                            <Volume2 size={18} className="text-zinc-300" />
                        )}
                    </button>

                    <div className="relative flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden group">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        <div
                            className="h-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899]"
                            style={{
                                width: `${isMuted ? 0 : volume}%`,
                            }}
                        ></div>
                    </div>
                </div>

                {/* STATUS BAR WITH PULSING GREEN */}
                <div className="hidden md:flex flex-row items-center gap-4 w-44 lg:w-52 justify-end select-none">
                    <button
                        onClick={(e) => { e.stopPropagation(); setFullscreenOpen(true); }}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 shrink-0 shadow-inner"
                        title="Open Full Screen Player"
                    >
                        <Maximize2 size={16} />
                    </button>
                    
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-2 h-2 rounded-full ${isPlaying
                                        ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"
                                        : "bg-zinc-600"
                                    }`}
                            ></div>

                            <span className="text-xs font-black uppercase tracking-wider text-white">
                                {isPlaying
                                    ? "Streaming"
                                    : "Paused"}
                            </span>
                        </div>

                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold mt-1">
                            High Quality 320kbps
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
