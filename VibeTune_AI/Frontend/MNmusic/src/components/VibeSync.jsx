import { useState, useEffect, useRef } from "react";
import { 
    Users, Plus, Trash2, Heart, Play, Pause, Send, 
    Sparkles, ArrowRight, Loader, Volume2, Copy, Check, MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

export default function VibeSync({
    API_BASE,
    playVideo,
    currentVideo,
    isPlaying,
    currentTime,
    duration,
    playerRef,
    userName,
    favorites,
    addToFavorites,
    removeFavorite,
    initialRoomCode
}) {
    // -----------------------------------------------------------------
    // ROOM STATES
    // -----------------------------------------------------------------
    const [roomCode, setRoomCode] = useState("");
    const [inRoom, setInRoom] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [sharedQueue, setSharedQueue] = useState([]);
    const [wsConnected, setWsConnected] = useState(false);
    const [activityFeed, setActivityFeed] = useState([]);
    
    // -----------------------------------------------------------------
    // FLOATING REACTION ENGINE
    // -----------------------------------------------------------------
    const [floatingEmojis, setFloatingEmojis] = useState([]);

    // -----------------------------------------------------------------
    // SEARCH TRACKS INSIDE JAM
    // -----------------------------------------------------------------
    const [jamSearch, setJamSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Refs for WebSocket and syncing throttling
    const wsRef = useRef(null);
    const isSyncingFromWS = useRef(false);
    const avatarIndex = useRef(Math.floor(Math.random() * 6) + 1);

    // -----------------------------------------------------------------
    // WS CONNECTION INITIATORS
    // -----------------------------------------------------------------
    const connectToVibeSync = (code) => {
        if (!code || code.trim().length < 4) {
            toast.error("Please enter a valid VibeSync Session Code");
            return;
        }

        const finalCode = code.toUpperCase().trim();
        setRoomCode(finalCode);
        setInRoom(true);

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        // Connect to FastAPI vibesync ws endpoint
        const wsUrl = `${protocol}//127.0.0.1:8000/api/vibesync/${finalCode}/${encodeURIComponent(userName)}/${avatarIndex.current}`;
        
        console.log("Connecting to VibeSync Session:", wsUrl);
        const socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
            setWsConnected(true);
            toast.success(`Connected to VibeSync Room: ${finalCode}`);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("WS Received Action:", data);

                // Add to activity logs
                if (data.message) {
                    setActivityFeed(prev => [
                        { text: data.message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                        ...prev.slice(0, 19)
                    ]);
                }

                switch (data.type) {
                    case "USER_JOINED":
                        if (data.room_state) {
                            setParticipants(data.room_state.participants || []);
                            setSharedQueue(data.room_state.queue || []);
                        }
                        break;

                    case "USER_LEFT":
                        if (data.participants) {
                            setParticipants(data.participants);
                        }
                        break;

                    case "QUEUE_UPDATED":
                        if (data.queue) {
                            setSharedQueue(data.queue);
                        }
                        break;

                    case "REACTION_RECEIVED":
                        triggerFloatingEmoji(data.emoji);
                        break;

                    case "PLAYER_SYNCED":
                        // Lock sync state block to prevent playback loops
                        if (data.sender_id !== `user-${absHash(userName + socket.url) % 100000}`) {
                            isSyncingFromWS.current = true;
                            
                            // Synchronize player track selection
                            if (data.current_track) {
                                const activeVid = data.current_track;
                                const isCurrentMatch = currentVideo?.id?.videoId === activeVid?.id?.videoId;
                                if (!isCurrentMatch) {
                                    playVideo(activeVid);
                                }
                            }

                            // Synchronize player playing speeds/timelines
                            setTimeout(() => {
                                if (playerRef.current) {
                                    const playerState = playerRef.current.getPlayerState?.();
                                    
                                    if (data.playing) {
                                        if (playerState !== 1) playerRef.current.playVideo?.();
                                    } else {
                                        if (playerState !== 2) playerRef.current.pauseVideo?.();
                                    }

                                    // Seek if delta exceeds 3 seconds
                                    const localTime = playerRef.current.getCurrentTime?.() || 0;
                                    if (Math.abs(localTime - data.progress) > 3) {
                                        playerRef.current.seekTo?.(data.progress, true);
                                    }
                                }
                                isSyncingFromWS.current = false;
                            }, 500);
                        }
                        break;

                    default:
                        break;
                }
            } catch (err) {
                console.error("Error decoding websocket stream:", err);
            }
        };

        socket.onerror = (err) => {
            console.error("WebSocket Curation Error:", err);
            toast.error("WebSocket connection failure");
        };

        socket.onclose = () => {
            setWsConnected(false);
            setInRoom(false);
            toast.error("VibeSync Session disconnected");
        };
    };

    // Helper absHash for participant ID tracking matching backend hash
    const absHash = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash);
    };

    const disconnectVibeSync = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
        setInRoom(false);
        setSharedQueue([]);
        setParticipants([]);
        setWsConnected(false);
    };

    const createVibeSyncRoom = () => {
        const randCode = "VIBE-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        connectToVibeSync(randCode);
    };

    // -----------------------------------------------------------------
    // SEARCH & QUEUE MUTATORS
    // -----------------------------------------------------------------
    const performJamSearch = async () => {
        if (!jamSearch.trim()) return;
        setSearchLoading(true);
        try {
            const res = await fetch(`${API_BASE}/search?query=${encodeURIComponent(jamSearch)}`);
            const data = await res.json();
            setSearchResults(data.items || []);
        } catch (err) {
            console.error("Jam search failed:", err);
            toast.error("Search failed");
        } finally {
            setSearchLoading(false);
        }
    };

    const addSongToJamQueue = (video) => {
        if (wsRef.current && wsConnected) {
            wsRef.current.send(JSON.stringify({
                action: "ADD_SONG",
                track: video
            }));
            toast.success("Added to shared VibeSync Queue!");
        }
    };

    const removeSongFromJamQueue = (video) => {
        if (wsRef.current && wsConnected) {
            const vidId = video?.id?.videoId || video?.videoId;
            wsRef.current.send(JSON.stringify({
                action: "REMOVE_SONG",
                videoId: vidId
            }));
        }
    };

    const voteSongInJamQueue = (video) => {
        if (wsRef.current && wsConnected) {
            const vidId = video?.id?.videoId || video?.videoId;
            wsRef.current.send(JSON.stringify({
                action: "UPVOTE_SONG",
                videoId: vidId
            }));
            toast.success("Vibe Voted!");
        }
    };

    // -----------------------------------------------------------------
    // FLOATING EMOJI RENDER TRIGGER
    // -----------------------------------------------------------------
    const sendJamReaction = (emoji) => {
        if (wsRef.current && wsConnected) {
            wsRef.current.send(JSON.stringify({
                action: "SEND_REACTION",
                emoji: emoji,
                timestamp: Date.now()
            }));
        }
    };

    const triggerFloatingEmoji = (emoji) => {
        const id = Date.now() + Math.random();
        // Generate random offset left positions (15% to 85%) and rotations
        const left = 15 + Math.random() * 70;
        const rotate = (Math.random() - 0.5) * 45;
        
        setFloatingEmojis(prev => [...prev, { id, emoji, left, rotate }]);
        
        // Remove emoji after float animation completes (3 seconds)
        setTimeout(() => {
            setFloatingEmojis(prev => prev.filter(item => item.id !== id));
        }, 3000);
    };

    // -----------------------------------------------------------------
    // REAL-TIME PLAYBACK SYNC PUSH
    // -----------------------------------------------------------------
    useEffect(() => {
        if (!wsRef.current || !wsConnected || isSyncingFromWS.current || !currentVideo) return;

        // Throttled player state broadcaster
        const syncPayload = {
            action: "PLAYER_SYNC",
            playing: isPlaying,
            progress: currentTime,
            currentTrack: currentVideo
        };

        wsRef.current.send(JSON.stringify(syncPayload));
    }, [isPlaying, currentVideo, wsConnected]);

    // High frequency scrubbing sync trigger (every 5 seconds)
    useEffect(() => {
        if (!wsRef.current || !wsConnected || isSyncingFromWS.current || !currentVideo || !isPlaying) return;

        const interval = setInterval(() => {
            wsRef.current.send(JSON.stringify({
                action: "PLAYER_SYNC",
                playing: true,
                progress: currentTime,
                currentTrack: currentVideo
            }));
        }, 6000);

        return () => clearInterval(interval);
    }, [currentTime, isPlaying, wsConnected, currentVideo]);

    useEffect(() => {
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (initialRoomCode) {
            connectToVibeSync(initialRoomCode);
        }
    }, [initialRoomCode]);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        toast.success("VibeSync code copied!");
    };

    return (
        <div className="relative h-full overflow-y-auto rounded-xl bg-zinc-950 border border-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.5)] p-4 sm:p-6 lg:p-8 space-y-8">
            
            {/* FLOATING REACTION EMOJIS RENDER CONTAINER */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                {floatingEmojis.map(item => (
                    <span 
                        key={item.id}
                        className="absolute bottom-0 text-5xl select-none animate-[emoji-float_3s_ease-out_forwards]"
                        style={{ 
                            left: `${item.left}%`
                        }}
                    >
                        <span 
                            className="inline-block"
                            style={{ 
                                transform: `rotate(${item.rotate}deg)`
                            }}
                        >
                            {item.emoji}
                        </span>
                    </span>
                ))}
            </div>

            {/* JAM HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Users className="text-emerald-400 animate-pulse" />
                        VibeSync Studio ⚡
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Synchronize player playheads and queues in absolute lockstep. Multiple users can vote, react, and curate the collaborative vibe.
                    </p>
                </div>

                {inRoom && wsConnected && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 py-1.5 px-3 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            VibeSync Active
                        </div>
                        <button
                            onClick={copyRoomCode}
                            className="h-10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white px-4 rounded-full flex items-center gap-2 text-xs font-bold transition"
                        >
                            <code>{roomCode}</code>
                            <Copy size={12} />
                        </button>
                        <button
                            onClick={disconnectVibeSync}
                            className="h-10 bg-red-600 hover:bg-red-700 text-white px-4 rounded-full text-xs font-bold transition"
                        >
                            Disconnect
                        </button>
                    </div>
                )}
            </div>

            {/* JOIN / CREATE ROOM INITIAL GATE */}
            {!inRoom ? (
                <div className="max-w-2xl mx-auto py-12 text-center space-y-8 bg-white/5 rounded-2xl border border-white/5 p-6 backdrop-blur-xl shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center mx-auto text-white shadow-xl shadow-emerald-950/20">
                        <Users size={32} />
                    </div>
                    
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white">Create a VibeSync Room</h2>
                        <p className="text-sm text-zinc-400 max-w-md mx-auto">
                            Generate a shareable VIBE- prefix listening code or enter a code from a friend to sync your playback.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="Enter VIBE-XXXX Code"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            className="w-full h-12 bg-zinc-900 border border-white/10 rounded-full px-6 outline-none focus:border-emerald-500/50 text-center font-bold tracking-widest text-emerald-400 placeholder:text-zinc-500 placeholder:tracking-normal placeholder:font-semibold"
                        />
                        <button
                            onClick={() => connectToVibeSync(roomCode)}
                            className="w-full sm:w-auto h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 rounded-full uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 transition"
                        >
                            Join Session
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    <div className="relative flex items-center justify-center max-w-xs mx-auto">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <span className="relative px-3 text-xs text-zinc-500 bg-zinc-950 uppercase font-black tracking-widest">or</span>
                    </div>

                    <button
                        onClick={createVibeSyncRoom}
                        className="h-12 bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs px-8 rounded-full uppercase tracking-wider flex items-center justify-center gap-2 mx-auto border border-white/5 transition"
                    >
                        <Sparkles size={14} className="text-emerald-400" />
                        Start VibeSync Room
                    </button>
                </div>
            ) : (
                /* LIVE SESSION CONTROL PANEL BOARD */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* LEFT TWO COLUMNS: SHARED QUEUE & CONTROLS */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* SHARED QUEUE LIST */}
                        <div className="glass rounded-2xl p-5 space-y-4">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-4 bg-emerald-400 rounded-full"></span>
                                    VibeSync Queue ({sharedQueue.length} songs)
                                </span>
                                {sharedQueue.length > 0 && (
                                    <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold py-0.5 px-2 rounded-full uppercase tracking-widest animate-pulse flex items-center gap-1">
                                        <Volume2 size={10} />
                                        Democratic Sync Mode
                                    </span>
                                )}
                            </h2>

                            {sharedQueue.length === 0 ? (
                                <div className="py-12 text-center text-zinc-500 space-y-2">
                                    <p className="text-sm font-bold">The VibeSync Queue is empty</p>
                                    <p className="text-xs max-w-xs mx-auto">Use the search panel below to add songs and get this listening room rocking!</p>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                                    {sharedQueue.map((video, idx) => {
                                        const isPlayingThis = currentVideo?.id?.videoId === (video?.id?.videoId || video?.videoId);
                                        const isFav = favorites.some(f => f?.id?.videoId === (video?.id?.videoId || video?.videoId));
                                        
                                        return (
                                            <div 
                                                key={video?.id?.videoId || video?.videoId}
                                                className={`p-3 border rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-all ${
                                                    isPlayingThis 
                                                        ? "bg-emerald-600/10 border-emerald-500/40 hover:bg-emerald-600/15" 
                                                        : "bg-zinc-950/40 border-white/5 hover:bg-zinc-950/90"
                                                }`}
                                                onClick={() => playVideo(video)}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <span className="text-zinc-500 font-bold text-sm w-4 text-center shrink-0">
                                                        {idx + 1}
                                                    </span>
                                                    
                                                    <img 
                                                        src={video?.snippet?.thumbnails?.medium?.url || video?.snippet?.thumbnails?.default?.url} 
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover bg-zinc-800 shrink-0 border border-white/5"
                                                    />

                                                    <div className="min-w-0">
                                                        <p className={`text-sm font-bold line-clamp-1 ${isPlayingThis ? "text-emerald-400" : "text-white"}`}>
                                                            {video?.snippet?.title}
                                                        </p>
                                                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{video?.snippet?.channelTitle}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2.5 shrink-0">
                                                    {/* Upvote Button Badge */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            voteSongInJamQueue(video);
                                                        }}
                                                        className="h-8 py-1 px-2.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-xs font-black flex items-center gap-1.5 transition active:scale-95"
                                                        title="Vote Up"
                                                    >
                                                        <Plus size={10} strokeWidth={3} />
                                                        <span>{video.upvotes || 0} Votes</span>
                                                    </button>

                                                    {/* Heart Add */}
                                                    {isFav ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                removeFavorite(video?.id?.videoId || video?.videoId);
                                                                toast.success("Removed from Library");
                                                            }}
                                                            className="p-2 text-red-500 hover:scale-110 transition"
                                                        >
                                                            <Heart size={14} fill="currentColor" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                addToFavorites(video);
                                                                toast.success("Added to Library");
                                                            }}
                                                            className="p-2 text-zinc-500 hover:text-white hover:scale-110 transition"
                                                        >
                                                            <Heart size={14} />
                                                        </button>
                                                    )}

                                                    {/* Trash Action */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSongFromJamQueue(video);
                                                        }}
                                                        className="p-2 text-zinc-600 hover:text-red-400 transition"
                                                        title="Remove from shared queue"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ADD SONGS PANEL */}
                        <div className="glass rounded-2xl p-5 space-y-4">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-teal-500 rounded-full"></span>
                                Search & Add Songs
                            </h2>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Search tracks, artists, or keywords to add..."
                                    value={jamSearch}
                                    onChange={(e) => setJamSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && performJamSearch()}
                                    className="flex-1 h-11 bg-zinc-950 border border-white/10 rounded-lg px-4 text-sm outline-none focus:border-teal-500/50"
                                />
                                <button
                                    onClick={performJamSearch}
                                    disabled={searchLoading}
                                    className="h-11 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold px-5 rounded-lg flex items-center justify-center gap-1.5 transition"
                                >
                                    {searchLoading ? <Loader size={12} className="animate-spin" /> : "Search"}
                                </button>
                            </div>

                            {searchResults.length > 0 && (
                                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 pt-2">
                                    {searchResults.map(video => (
                                        <div 
                                            key={video?.id?.videoId || video?.videoId}
                                            className="p-2 bg-zinc-950/20 hover:bg-zinc-950/60 border border-white/5 rounded-lg flex items-center justify-between gap-4 text-xs cursor-pointer transition"
                                            onClick={() => addSongToJamQueue(video)}
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <img 
                                                    src={video?.snippet?.thumbnails?.default?.url} 
                                                    alt=""
                                                    className="w-9 h-9 rounded object-cover shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="font-bold text-white line-clamp-1">{video?.snippet?.title}</p>
                                                    <p className="text-zinc-500 mt-0.5 line-clamp-1">{video?.snippet?.channelTitle}</p>
                                                </div>
                                            </div>
                                            <button className="h-7 w-7 bg-white/5 hover:bg-emerald-600 text-zinc-300 hover:text-white rounded-full flex items-center justify-center transition shrink-0">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: JAM DETAILS, REACTIONS, LOGS */}
                    <div className="space-y-6">
                        
                        {/* INVITE FRIENDS PANEL */}
                        <div className="glass rounded-2xl p-5 space-y-4 relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/20 border border-emerald-500/10 shadow-lg">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
                            
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-pulse"></span>
                                Invite Friends
                            </h2>

                            <div className="space-y-3.5">
                                {/* Room ID Field */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">VibeSync Room ID</label>
                                    <div className="flex gap-2">
                                        <div className="flex-grow bg-white/5 border border-white/5 rounded-xl px-4 py-2 flex items-center justify-between font-mono text-sm font-bold text-emerald-400">
                                            {roomCode}
                                        </div>
                                        <button
                                            onClick={copyRoomCode}
                                            className="px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition active:scale-95 shrink-0"
                                            title="Copy Code"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Invite Link Field */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Direct Invite Link</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/?room=${roomCode}`}
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 font-semibold text-xs text-zinc-300 outline-none select-all truncate"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/?room=${roomCode}`);
                                                toast.success("Invite Link copied to clipboard!");
                                            }}
                                            className="px-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl flex items-center justify-center transition active:scale-95 shrink-0"
                                            title="Copy Invite Link"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* QR Code Image */}
                                <div className="flex flex-col items-center justify-center pt-2 gap-2 border-t border-white/5">
                                    <div className="p-3.5 bg-white rounded-2xl border border-white/10 shadow-lg flex items-center justify-center">
                                        <img 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(window.location.origin + "/?room=" + roomCode)}`} 
                                            alt="VibeSync QR Code"
                                            className="w-[130px] h-[130px] object-contain rounded"
                                        />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 mt-1 animate-pulse">Scan QR Code to Join Vibe</span>
                                </div>
                            </div>
                        </div>

                        {/* ACTIVE LISTENERS PANEL */}
                        <div className="glass rounded-2xl p-5 space-y-4">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-cyan-400 rounded-full"></span>
                                Connected Listeners ({participants.length})
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                {participants.map((p, idx) => {
                                    const colors = [
                                        "bg-emerald-600 text-white", "bg-purple-600 text-white",
                                        "bg-pink-600 text-white", "bg-amber-600 text-white",
                                        "bg-indigo-600 text-white", "bg-teal-600 text-white"
                                    ];
                                    const avatarColor = colors[idx % colors.length];
                                    
                                    return (
                                        <div 
                                            key={p.id}
                                            className="p-2 bg-white/5 border border-white/5 rounded-xl flex items-center gap-2.5"
                                        >
                                            <div className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-xs font-black border border-white/10 uppercase shadow-md`}>
                                                {p.name.slice(0, 1)}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                                <p className="text-[9px] text-zinc-400 flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                                                    in sync
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* REAL-TIME REACTIONS TOOLBAR */}
                        <div className="glass rounded-2xl p-5 space-y-4">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-orange-500 rounded-full"></span>
                                Live Room Reactions
                            </h2>
                            <p className="text-[10px] text-zinc-400 leading-normal">
                                Click an emoji below to publish a real-time floating reaction directly across everyone's active sessions!
                            </p>

                            <div className="grid grid-cols-3 gap-2.5">
                                {[
                                    { char: "🔥", label: "Fire" },
                                    { char: "❤️", label: "Heart" },
                                    { char: "😂", label: "Laugh" },
                                    { char: "👏", label: "Clap" },
                                    { char: "🎉", label: "Party" },
                                    { char: "😮", label: "Wow" }
                                ].map(emojiItem => (
                                    <button
                                        key={emojiItem.char}
                                        onClick={() => sendJamReaction(emojiItem.char)}
                                        className="h-14 bg-zinc-900 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-xl flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
                                    >
                                        <span className="text-2xl">{emojiItem.char}</span>
                                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">{emojiItem.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* LIVE ACTIVITY logs */}
                        <div className="glass rounded-2xl p-5 space-y-4">
                            <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 flex items-center gap-2">
                                <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                                VibeSync Feed
                            </h2>

                            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-xs text-zinc-400">
                                {activityFeed.length === 0 ? (
                                    <p className="text-[10px] text-zinc-500 text-center py-6 font-semibold">Session feeds will compile here...</p>
                                ) : (
                                    activityFeed.map((log, idx) => (
                                        <div key={idx} className="flex justify-between items-start gap-3 py-1 border-b border-white/5 last:border-0">
                                            <p className="leading-relaxed font-semibold">{log.text}</p>
                                            <span className="text-[9px] text-zinc-500 shrink-0 font-bold mt-0.5">{log.time}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}
