import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Heart, 
    MessageSquare, 
    Share2, 
    Send, 
    Play, 
    Music, 
    Sparkles, 
    Plus,
    Compass,
    Radio,
    ChevronDown,
    ChevronUp,
    ListMusic,
    UserCheck,
    Volume2,
    Trash2
} from "lucide-react";
import toast from "react-hot-toast";
import aakashAvatar from "../assets/aakash.jpg";
import apnaBanaLeCover from "../assets/apna_bana_le.png";
import aditiAvatar from "../assets/aditi.jpg";
import badtameezCover from "../assets/badtameez_dil.png";
import twistCover from "../assets/twist.png";
import befikreCover from "../assets/befikre.png";
import sunnyCover from "../assets/sunny_sunny.png";
import aartiAvatar from "../assets/aarti.jpg";
import sitaareCover from "../assets/sitaare.png";

export default function MusicFeed({
    currentVideo,
    playVideo,
    favorites,
    addToFavorites,
    removeFavorite,
    userName,
    userAvatar,
    liveFriendListening = [],
    realtimePlaylistUpdates = [],
    socketActivities = [],
    broadcastActivityEvent,
    userId,
    autoShare,
    setAutoShare,
    friendsStatus = {},
    handleSendFriendRequest,
    friendRequests = [],
    friendsList = [],
    handleAcceptFriendRequest,
    handleRejectFriendRequest
}) {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // Dynamic timeline activities representing friends' activities
    const [activities, setActivities] = useState([
        {
            id: 1,
            type: "share", // Friend shared a track
            user: {
                name: "aakash singh",
                avatar: aakashAvatar,
                handle: "@aakash_singh",
                badge: "Vibe Curator",
                badgeColor: "from-pink-500 to-rose-500"
            },
            time: "10 mins ago",
            caption: "Loved this music! Sarah beats added it to her prime rotation library. 🎵🎧",
            song: {
                id: "apna-bana-le",
                title: "Apna Bana Le",
                artist: "Arijit Singh & Sachin-Jigar",
                album: "Bhediya",
                genre: "Bollywood Romantic",
                cover_url: apnaBanaLeCover,
                videoId: "g6fnFLEMtfY"
            },
            likes: 24,
            hasLiked: false,
            comments: [],
            showComments: false
        },
        {
            id: 2,
            type: "share", // Friend shared a track
            user: {
                name: "aditi raj",
                avatar: aditiAvatar,
                handle: "@aditi_raj",
                badge: "Party Curator",
                badgeColor: "from-amber-500 to-orange-500"
            },
            time: "45 mins ago",
            caption: "High-octane club bangers and dance anthems to turn any space into an instant dance floor! Compiled by Aditi.",
            song: {
                id: "party1",
                title: "Badtameez Dil",
                artist: "Benny Dayal & Pritam",
                album: "Yeh Jawaani Hai Deewani",
                genre: "Bollywood Dance",
                cover_url: badtameezCover,
                videoId: "r5L1co96TO0"
            },
            likes: 42,
            hasLiked: false,
            comments: [
                { id: 1, name: "Prerna S.", text: "Badtameez Dil is a timeless classic! Instant energy!" }
            ],
            showComments: false
        },
        {
            id: 3,
            type: "share", // Friend shared a track
            user: {
                name: "Aarti rana",
                avatar: aartiAvatar,
                handle: "@aarti_rana",
                badge: "Zen Master",
                badgeColor: "from-emerald-500 to-teal-500"
            },
            time: "3 hours ago",
            caption: "Listening to the beautiful new romantic track 'Sitaare' by Arijit Singh from the movie Ikkis! It is absolute magic. ✨🎵❤️",
            song: {
                id: "sitaare",
                title: "Sitaare",
                artist: "Arijit Singh",
                album: "Ikkis",
                genre: "Bollywood Romantic",
                cover_url: sitaareCover,
                videoId: "o0jA8sLw5v0"
            },
            likes: 67,
            hasLiked: true,
            comments: [
                { id: 1, name: "Marcus", text: "Pure sonic healing. Loving this recommendation!" }
            ],
            showComments: false
        }
    ]);

    // Merge local activities with socket-received activities (deduplicated)
    // socketActivities come from App.jsx WebSocket handler when other users broadcast
    const socketMapped = (socketActivities || []).filter(
        (sa) => !activities.some((a) => String(a.id) === String(sa.id))
    );
    const displayedActivities = [...activities, ...socketMapped].sort(
        (a, b) => (b.id || 0) - (a.id || 0)
    );

    // Combine socket live list with static active friends - only show hardcoded mock friends
    const activeFriends = [
        // Mock active friends for visual fullness if none are active on socket yet
        {
            name: "Aakash Singh",
            avatar: aakashAvatar,
            song: {
                title: "Apna Bana Le",
                artist: "Arijit Singh",
                cover_url: apnaBanaLeCover,
                videoId: "g6fnFLEMtfY"
            },
            time: "Active now"
        },
        {
            name: "Aditi Raj",
            avatar: aditiAvatar,
            song: {
                title: "Badtameez Dil",
                artist: "Benny Dayal",
                cover_url: badtameezCover,
                videoId: "r5L1co96TO0"
            },
            time: "Active now"
        }
    ].filter((item, idx, self) => self.findIndex(t => t.name === item.name) === idx).slice(0, 4); // Deduplicate & Limit

    const [shareCaption, setShareCaption] = useState("");
    const [commentInputs, setCommentInputs] = useState({});

    // ==========================================
    // FAVORITE / UNFAVORITE HANDLER
    // ==========================================
    const handleLikeToggle = (activityId, activity) => {
        setActivities(prev => prev.map(act => {
            if (act.id === activityId) {
                const updatedHasLiked = !act.hasLiked;
                const updatedLikes = updatedHasLiked ? act.likes + 1 : act.likes - 1;
                
                // Construct standard track info
                let targetSong = act.song;

                if (updatedHasLiked) {
                    toast.success(targetSong ? `Added "${targetSong.title}" to Favorites!` : "Added to Favorites!", {
                        icon: '💖',
                        style: {
                            borderRadius: '10px',
                            background: '#18181b',
                            color: '#fff',
                            border: '1px solid rgba(236, 72, 153, 0.3)'
                        }
                    });
                    
                    if (targetSong) {
                        const videoItem = {
                            id: { videoId: targetSong.videoId },
                            videoId: targetSong.videoId,
                            snippet: {
                                title: targetSong.title,
                                channelTitle: targetSong.artist,
                                thumbnails: {
                                    high: { url: targetSong.cover_url }
                                    // default: { url: targetSong.cover_url }
                                }
                            }
                        };
                        addToFavorites(videoItem);
                    }
                } else {
                    toast.success(targetSong ? `Removed "${targetSong.title}" from Favorites.` : "Removed from Favorites", {
                        icon: '💔',
                        style: {
                            borderRadius: '10px',
                            background: '#18181b',
                            color: '#fff',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }
                    });
                    if (targetSong) {
                        removeFavorite(targetSong.videoId);
                    }
                }

                return {
                    ...act,
                    hasLiked: updatedHasLiked,
                    likes: updatedLikes
                };
            }
            return act;
        }));
    };

    // ==========================================
    // SHARE SONG TO TIMELINE
    // ==========================================
    const handleShareSong = (e) => {
        e.preventDefault();
        console.log("[BroadcastVibe] Button clicked. currentVideo:", currentVideo);

        if (!currentVideo) {
            console.warn("[BroadcastVibe] No currentVideo — aborting.");
            toast.error("Stream a track first to share it on the Activity Feed!", {
                style: { borderRadius: '10px', background: '#18181b', color: '#fff' }
            });
            return;
        }

        const songInfo = {
            id: `custom-track-${Date.now()}`,
            title: currentVideo.snippet.title,
            artist: currentVideo.snippet.channelTitle,
            cover_url: currentVideo.snippet.thumbnails?.high?.url || currentVideo.snippet.thumbnails?.default?.url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500",
            videoId: currentVideo.id?.videoId || currentVideo.videoId
        };
        console.log("[BroadcastVibe] songInfo built:", songInfo);

        const finalCaption = shareCaption.trim() || `Tuning into this amazing track! 🎧✨`;

        const customActivity = {
            id: Date.now(),
            type: "share",
            userId: userId,
            user: {
                name: userName || "You",
                avatar: userAvatar || "",
                handle: `@${(userName || "user").toLowerCase().replace(/\s+/g, '_')}`,
                badge: "Curator",
                badgeColor: "from-indigo-500 to-purple-500"
            },
            time: "Just now",
            caption: finalCaption,
            song: songInfo,
            likes: 0,
            hasLiked: false,
            comments: [],
            showComments: false
        };
        console.log("[BroadcastVibe] customActivity object:", customActivity);

        // ✅ ALWAYS update local state immediately (optimistic update) so post appears in feed right away
        console.log("[BroadcastVibe] Adding post to local activities state (optimistic update)...");
        setActivities(prev => {
            const next = [customActivity, ...prev];
            console.log("[BroadcastVibe] activities state updated. New count:", next.length);
            return next;
        });

        // Also broadcast via WebSocket for persistence + other users (if WS is connected)
        if (broadcastActivityEvent) {
            console.log("[BroadcastVibe] Sending FEED_BROADCAST via WebSocket...");
            broadcastActivityEvent({
                type: "FEED_BROADCAST",
                userId: userId,
                activity: customActivity
            });
            console.log("[BroadcastVibe] WebSocket broadcast sent.");
        } else {
            console.warn("[BroadcastVibe] broadcastActivityEvent not available — post only added locally.");
        }
        
        setShareCaption("");
        toast.success("Vibe broadcasted to the feed! 🎵", {
            icon: '⚡',
            style: {
                borderRadius: '12px',
                background: 'linear-gradient(to right, #6366f1, #a855f7)',
                color: '#fff',
                fontWeight: 'bold'
            }
        });
        console.log("[BroadcastVibe] ✅ Done. Post should now appear at top of feed.");
    };

    // ==========================================
    // DELETE VIBE POST
    // ==========================================
    const handleDeletePost = (activityId) => {
        const API_BASE = "http://127.0.0.1:8010";

        // Remove from local activities state
        setActivities(prev => prev.filter(a => a.id !== activityId));

        // Broadcast FEED_DELETE event to other clients via WebSocket
        if (broadcastActivityEvent) {
            broadcastActivityEvent({
                type: "FEED_DELETE",
                userId: userId,
                activityId: activityId
            });
        }

        // Send API request to backend to delete from DB
        fetch(`${API_BASE}/api/activities/${activityId}`, {
            method: "DELETE"
        })
        .then(res => {
            if (!res.ok) console.log("Database activity delete returned status:", res.status);
        })
        .catch(err => console.log("Database deletion failed (API fallback):", err));

        toast.success("Post deleted successfully!", {
            icon: '🗑️',
            style: {
                borderRadius: '10px',
                background: '#18181b',
                color: '#fff',
                border: '1px solid rgba(239, 68, 68, 0.2)'
            }
        });
    };

    // ==========================================
    // PLAY VIDEO TRIGGER
    // ==========================================
    const handlePlayTrack = (track) => {
        const videoItem = {
            id: { videoId: track.videoId },
            videoId: track.videoId,
            snippet: {
                title: track.title,
                channelTitle: track.artist,
                thumbnails: {
                    high: { url: track.cover_url },
                    default: { url: track.cover_url }
                }
            }
        };
        playVideo(videoItem);
    };

    // ==========================================
    // COMMENTS MECHANISM
    // ==========================================
    const toggleComments = (actId) => {
        setActivities(prev => prev.map(a => {
            if (a.id === actId) {
                return { ...a, showComments: !a.showComments };
            }
            return a;
        }));
    };

    const handleAddComment = (actId, e) => {
        e.preventDefault();
        const text = commentInputs[actId] || "";
        if (!text.trim()) return;

        setActivities(prev => prev.map(a => {
            if (a.id === actId) {
                return {
                    ...a,
                    comments: [
                        ...a.comments,
                        { id: Date.now(), name: userName || "You", text }
                    ]
                };
            }
            return a;
        }));

        setCommentInputs(prev => ({ ...prev, [actId]: "" }));
        toast.success("Comment posted!");
    };

    // ==========================================
    // PLAYLIST ACCORDION TOGGLE
    // ==========================================
    const togglePlaylistTracks = (actId) => {
        setActivities(prev => prev.map(a => {
            if (a.id === actId) {
                return { ...a, showTracks: !a.showTracks };
            }
            return a;
        }));
    };

    return (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20 px-4">
            
            {/* INLINE CSS FOR SCI-FI AUDIO WAVEFORM */}
            <style>{`
                @keyframes waveform-bounce {
                    0%, 100% { transform: scaleY(0.2); }
                    50% { transform: scaleY(1); }
                }
                .wave-bar {
                    animation: waveform-bounce 0.8s ease-in-out infinite;
                    transform-origin: bottom;
                }
                .wave-bar-1 { animation-delay: 0.15s; }
                .wave-bar-2 { animation-delay: 0.3s; }
                .wave-bar-3 { animation-delay: 0.45s; }
            `}</style>

            {/* LEFT/CENTER TWO COLUMNS: BROADCAST & TIMELINE ACTIVITIES */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* HERO STATS BAR */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-rose-950/30 via-black to-indigo-950/20 border border-white/5 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="space-y-3 text-center md:text-left relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-black tracking-widest uppercase text-rose-400">
                            <Radio size={13} className="text-rose-400 animate-pulse" />
                            Live Status
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                            ✨ Music <span className="bg-gradient-to-r from-rose-400 via-purple-500 to-indigo-400 bg-clip-text text-transparent">Community Feed</span>
                        </h1>
                        <p className="text-zinc-400 font-semibold max-w-lg leading-relaxed text-xs sm:text-sm">
                            Discover music posts, playlist shares, AI mood updates, and now-playing activities shared by your community.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 shrink-0">
                        {/* Friends Active Status Widget */}
                        <div className="flex items-center gap-4 bg-white/[0.03] border border-white/5 backdrop-blur-md rounded-2xl p-4 min-w-[180px] shadow-xl text-left">
                            <div className="flex -space-x-4 shrink-0">
                                <img className="w-9 h-9 rounded-full border-2 border-zinc-950 object-cover" src={aakashAvatar} alt="Aakash" />
                                <img className="w-9 h-9 rounded-full border-2 border-zinc-950 object-cover" src={aditiAvatar} alt="Aditi" />
                                <img className="w-9 h-9 rounded-full border-2 border-zinc-950 object-cover" src={aartiAvatar} alt="Aarti" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-white leading-none">Friends</p>
                                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mt-1">Active Now</p>
                            </div>
                        </div>

                        {/* Modern Add Friend Button */}
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shrink-0"
                        >
                            <Plus size={15} className="text-white" /> Add Friend
                        </button>
                    </div>
                </div>

                {/* BROADCAST BOX */}
                <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-950/70 border border-white/10 rounded-2xl p-6 backdrop-blur-lg shadow-xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500"></div>
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles size={18} className="text-rose-400 animate-pulse" /> Broadcast Your Vibe
                        </h3>
                        
                        {/* Auto-share playing songs toggle switch */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-zinc-400">Auto Share Playing</span>
                            <button
                                type="button"
                                onClick={() => setAutoShare(!autoShare)}
                                className={`w-10 h-6 rounded-full p-1 transition-all duration-300 relative ${
                                    autoShare 
                                        ? "bg-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-500/40" 
                                        : "bg-zinc-850 border border-white/5"
                                }`}
                                aria-label="Toggle auto sharing"
                            >
                                <span className={`w-3.5 h-3.5 rounded-full absolute top-1 transition-all duration-300 ${
                                    autoShare 
                                        ? "bg-pink-500 left-[21px]" 
                                        : "bg-zinc-400 left-1"
                                }`} />
                            </button>
                        </div>
                    </div>
                    
                    <form onSubmit={handleShareSong} className="space-y-4">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center font-bold text-lg text-white border border-white/10 shrink-0 shadow-lg">
                                {userAvatar ? (
                                    <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    (userName || "U").slice(0, 1).toUpperCase()
                                )}
                            </div>
                            <textarea
                                id="broadcast-caption-input"
                                value={shareCaption}
                                onChange={(e) => setShareCaption(e.target.value)}
                                placeholder="Tell friends what this track makes you feel..."
                                className="w-full h-24 bg-white/5 border border-white/5 rounded-xl p-4 text-white text-sm placeholder:text-zinc-500 outline-none resize-none focus:border-rose-500/50 focus:bg-white/[0.08] transition duration-200"
                            />
                        </div>

                        {/* DYNAMIC ATTACHMENT */}
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                            {currentVideo ? (
                                <>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative group shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                                            <img 
                                                src={currentVideo.snippet.thumbnails?.high?.url || currentVideo.snippet.thumbnails?.default?.url} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <Volume2 size={16} className="text-rose-400 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-0.5 animate-pulse">Now Playing Attachment</p>
                                            <p className="text-sm font-extrabold text-white truncate">{currentVideo.snippet.title}</p>
                                            <p className="text-xs text-zinc-400 font-semibold truncate">{currentVideo.snippet.channelTitle}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        id="broadcast-submit-btn"
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-extrabold text-xs tracking-widest uppercase transition duration-300 transform active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 shadow-lg shadow-rose-950/20"
                                    >
                                        Broadcast Vibe <Send size={12} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4 py-1">
                                    <div className="flex items-center gap-3 text-zinc-500">
                                        <Music size={20} className="text-zinc-600" />
                                        <p className="text-xs md:text-sm font-semibold">No track actively playing. Play a song from your library to attach and share it!</p>
                                    </div>
                                    <button
                                        type="button"
                                        disabled
                                        className="px-4 py-2.5 rounded-lg bg-zinc-850 text-zinc-500 text-xs font-bold uppercase tracking-wider pointer-events-none"
                                    >
                                        Play Song First
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </motion.div>

                {/* TIMELINE ACTIVITIES */}
                <div className="space-y-6">
                    <AnimatePresence>
                        {displayedActivities.map((act) => {
                            const nameLower = (act.user?.name || "").toLowerCase();
                            const handleLower = (act.user?.handle || "").toLowerCase();
                            const isMyPost = act.userId === userId || 
                                             nameLower.includes("manisha") || 
                                             handleLower.includes("manisha") ||
                                             act.user?.name === userName;

                            return (
                                <motion.article
                                    key={act.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-zinc-950/45 border border-white/5 rounded-3xl p-6 backdrop-blur-xl shadow-lg hover:border-white/10 transition duration-300"
                                >
                                    {/* ACTIVITY HEADER */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex gap-4">
                                            <div className="w-11 h-11 rounded-full overflow-hidden border border-white/10 shrink-0 bg-zinc-850 flex items-center justify-center text-white font-extrabold shadow-lg">
                                                {act.user.avatar ? (
                                                    <img src={act.user.avatar} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    act.user.name.slice(0, 1).toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0 text-left">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <span className="font-extrabold text-white text-base hover:text-rose-400 cursor-pointer">{act.user.name}</span>
                                                    {isMyPost ? (
                                                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-zinc-700 to-zinc-800">
                                                            You
                                                        </span>
                                                    ) : (
                                                        (() => {
                                                            const status = friendsStatus[act.user.handle] || "none";
                                                            if (status === "accepted") {
                                                                return (
                                                                    <span className="px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 text-[9px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.15)]">
                                                                        Friends ✓
                                                                    </span>
                                                                );
                                                            } else if (status === "pending") {
                                                                return (
                                                                    <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                                        Pending
                                                                    </span>
                                                                );
                                                            } else {
                                                                return null;
                                                            }
                                                        })()
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 font-semibold mt-0.5">{act.user.handle} &bull; {act.time}</p>
                                            </div>
                                        </div>

                                        {/* ACTIVITY TYPE BADGES & DELETE */}
                                        <div className="flex flex-wrap gap-2 shrink-0 items-center">
                                            {isMyPost && (
                                                <button
                                                    onClick={() => handleDeletePost(act.id)}
                                                    className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition duration-200 cursor-pointer active:scale-95"
                                                    title="Delete Vibe"
                                                >
                                                    <Trash2 size={11} /> Delete
                                                </button>
                                            )}
                                            {act.hasLiked && (
                                                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm animate-pulse">
                                                    <Heart size={10} className="fill-rose-400" /> ADDED TO FAVORITES
                                                </span>
                                            )}
                                            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                                                <Share2 size={10} className="text-cyan-400" /> SHARED A TRACK
                                            </span>
                                        </div>
                                    </div>

                                {/* CASE 1: FRIEND ADDED TO FAVORITES */}
                                {act.type === "like" && (
                                    <div className="space-y-4 pl-1">
                                        <p className="text-zinc-300 text-sm md:text-base font-semibold leading-relaxed">
                                            {act.caption || "Loved this music! Sarah beats added it to her prime rotation library. 🎵🎧"}
                                        </p>
                                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                                            <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                                                <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                                    <img src={act.song.cover_url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        id={`act-${act.id}-thumbnail-play`}
                                                        onClick={() => handlePlayTrack(act.song)}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 text-white"
                                                    >
                                                        <Play size={20} fill="currentColor" className="text-rose-400" />
                                                    </button>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400">
                                                        {act.song.genre || "Pop"}
                                                    </span>
                                                    <h4 
                                                        onClick={() => handlePlayTrack(act.song)}
                                                        className="font-black text-white text-base hover:text-rose-400 cursor-pointer truncate mt-1"
                                                    >
                                                        {act.song.title}
                                                    </h4>
                                                    <p className="text-xs md:text-sm text-zinc-400 font-semibold truncate mt-0.5">{act.song.artist} &bull; {act.song.album || "Single"}</p>
                                                </div>
                                            </div>

                                            <button
                                                id={`act-${act.id}-stream-btn`}
                                                onClick={() => handlePlayTrack(act.song)}
                                                className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-extrabold text-xs tracking-widest uppercase transition duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
                                            >
                                                <Play size={12} fill="currentColor" /> Stream Track
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CASE 2: NEW PLAYLIST CREATED */}
                                {act.type === "playlist" && (
                                    <div className="space-y-4 pl-1">
                                        <p className="text-zinc-300 text-sm md:text-base font-semibold leading-relaxed">
                                            {act.caption || act.playlist?.description || ""}
                                        </p>
                                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                                            <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                                                <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                                    <img src={act.song?.cover_url || act.playlist?.covers?.[0] || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500"} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        id={`act-${act.id}-thumbnail-play`}
                                                        onClick={() => {
                                                            const track = act.song || act.playlist?.tracks?.[0];
                                                            if (track) handlePlayTrack(track);
                                                        }}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 text-white"
                                                    >
                                                        <Play size={20} fill="currentColor" className="text-rose-400" />
                                                    </button>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400">
                                                        {act.song?.genre || "Playlist"}
                                                    </span>
                                                    <h4 
                                                        onClick={() => {
                                                            const track = act.song || act.playlist?.tracks?.[0];
                                                            if (track) handlePlayTrack(track);
                                                        }}
                                                        className="font-black text-white text-base hover:text-rose-400 cursor-pointer truncate mt-1"
                                                    >
                                                        {act.song?.title || act.playlist?.name || "Unnamed Playlist"}
                                                    </h4>
                                                    <p className="text-xs md:text-sm text-zinc-400 font-semibold truncate mt-0.5">
                                                        {act.song ? `${act.song.artist} • ${act.song.album || "Single"}` : (act.playlist?.tracks?.[0]?.artist || "Various Artists")}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                id={`act-${act.id}-stream-btn`}
                                                onClick={() => {
                                                    const track = act.song || act.playlist?.tracks?.[0];
                                                    if (track) handlePlayTrack(track);
                                                }}
                                                className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-extrabold text-xs tracking-widest uppercase transition duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
                                            >
                                                <Play size={12} fill="currentColor" /> Stream Track
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CASE 3: SOMEONE SHARED A TRACK */}
                                {act.type === "share" && (
                                    <div className="space-y-4 pl-1">
                                        <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-semibold whitespace-pre-line">
                                            {act.caption}
                                        </p>

                                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                                            <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                                                <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                                    <img src={act.song.cover_url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        id={`act-${act.id}-thumbnail-play`}
                                                        onClick={() => handlePlayTrack(act.song)}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 text-white"
                                                    >
                                                        <Play size={20} fill="currentColor" className="text-rose-400" />
                                                    </button>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-black uppercase tracking-widest text-cyan-400">
                                                        {act.song.genre || "Pop"}
                                                    </span>
                                                    <h4 
                                                        onClick={() => handlePlayTrack(act.song)}
                                                        className="font-black text-white text-base hover:text-rose-400 cursor-pointer truncate mt-1"
                                                    >
                                                        {act.song.title}
                                                    </h4>
                                                    <p className="text-xs md:text-sm text-zinc-400 font-semibold truncate mt-0.5">{act.song.artist} &bull; {act.song.album || "Single"}</p>
                                                </div>
                                            </div>

                                            <button
                                                id={`act-${act.id}-stream-btn`}
                                                onClick={() => handlePlayTrack(act.song)}
                                                className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-extrabold text-xs tracking-widest uppercase transition duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
                                            >
                                                <Play size={12} fill="currentColor" /> Stream Track
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* CASE 4: FRIEND STREAMED A SONG */}
                                {act.type === "stream" && (
                                    <div className="space-y-4 pl-1">
                                        <p className="text-zinc-300 text-sm md:text-base font-semibold leading-relaxed">
                                            Streamed a track and is tuning into the vibe! 🎧⚡
                                        </p>
                                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-900/90 to-zinc-950 border border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                                            <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                                                <div className="relative shrink-0 w-16 h-16 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                                    <img src={act.song.cover_url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        id={`act-${act.id}-thumbnail-play`}
                                                        onClick={() => handlePlayTrack(act.song)}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 text-white"
                                                    >
                                                        <Play size={20} fill="currentColor" className="text-rose-400" />
                                                    </button>
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400">
                                                        Active Stream
                                                    </span>
                                                    <h4 
                                                        onClick={() => handlePlayTrack(act.song)}
                                                        className="font-black text-white text-base hover:text-rose-400 cursor-pointer truncate mt-1"
                                                    >
                                                        {act.song.title}
                                                    </h4>
                                                    <p className="text-xs md:text-sm text-zinc-400 font-semibold truncate mt-0.5">{act.song.artist}</p>
                                                </div>
                                            </div>

                                            <button
                                                id={`act-${act.id}-stream-btn`}
                                                onClick={() => handlePlayTrack(act.song)}
                                                className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-extrabold text-xs tracking-widest uppercase transition duration-300 flex items-center justify-center gap-2 active:scale-95 shadow-md"
                                            >
                                                <Play size={12} fill="currentColor" /> Stream Track
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* ACTIVITY ACTIONS FOOTER */}
                                <div className="flex items-center gap-6 border-t border-white/5 pt-4 mt-5">
                                    {/* FAVORITE INTERACTION */}
                                    <button
                                        id={`act-${act.id}-like-btn`}
                                        onClick={() => handleLikeToggle(act.id, act)}
                                        className={`flex items-center gap-2 group text-sm font-extrabold transition duration-300 focus:outline-none ${
                                            act.hasLiked 
                                                ? 'text-rose-500' 
                                                : 'text-zinc-400 hover:text-white'
                                        }`}
                                    >
                                        <motion.div
                                            whileTap={{ scale: 1.4 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        >
                                            <Heart 
                                                size={18} 
                                                className={act.hasLiked ? "fill-rose-500 text-rose-500 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]" : "group-hover:scale-110 transition duration-200"} 
                                            />
                                        </motion.div>
                                        <span>{act.likes} {act.likes === 1 ? 'Favorite' : 'Favorites'}</span>
                                    </button>

                                    {/* COMMENT DRAWERS TOGGLE */}
                                    <button
                                        id={`act-${act.id}-comment-toggle`}
                                        onClick={() => toggleComments(act.id)}
                                        className={`flex items-center gap-2 group text-sm font-extrabold hover:text-white transition duration-300 ${
                                            act.showComments ? 'text-white' : 'text-zinc-400'
                                        }`}
                                    >
                                        <MessageSquare size={18} className="group-hover:scale-110 transition duration-200" />
                                        <span>{act.comments.length} Comments</span>
                                    </button>
                                </div>

                                {/* DYNAMIC EXPANDABLE COMMENTS */}
                                <AnimatePresence>
                                    {act.showComments && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-white/5 mt-5 pt-5 space-y-4">
                                                {act.comments.length > 0 ? (
                                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 [scrollbar-color:rgba(255,255,255,0.1)_transparent] scrollbar-thin">
                                                        {act.comments.map((comm) => (
                                                            <div key={comm.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 flex flex-col gap-1">
                                                                <div className="flex justify-between items-center">
                                                                    <span className="font-extrabold text-zinc-300 text-xs">{comm.name}</span>
                                                                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Replied</span>
                                                                </div>
                                                                <p className="text-zinc-400 text-xs md:text-sm font-medium">{comm.text}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-zinc-600 font-semibold italic text-center py-2">No comments posted. Start the conversation!</p>
                                                )}

                                                {/* ADD A COMMENT FORM */}
                                                <form onSubmit={(e) => handleAddComment(act.id, e)} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        id={`act-${act.id}-comment-input`}
                                                        value={commentInputs[act.id] || ""}
                                                        onChange={(e) => setCommentInputs({ ...commentInputs, [act.id]: e.target.value })}
                                                        placeholder="Add a comment to this activity..."
                                                        className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder:text-zinc-500 outline-none focus:border-rose-500/50"
                                                    />
                                                    <button
                                                        type="submit"
                                                        id={`act-${act.id}-comment-send`}
                                                        disabled={!(commentInputs[act.id] || "").trim()}
                                                        className="px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.article>
                        );
                    })}
                </AnimatePresence>
                </div>
            </div>

            {/* RIGHT COLUMN: LIVE FRIEND SYNC PANEL & REAL-TIME PLAYLIST UPDATES */}
            <div className="space-y-6 lg:border-l lg:border-white/5 lg:pl-6">
                
                {/* 1. LIVE FRIEND LISTENING (REAL-TIME SOCKET COMMUNICATION) */}
                <div className="rounded-2xl border border-white/5 bg-zinc-950 p-5 space-y-4 shadow-xl relative overflow-hidden bg-gradient-to-br from-zinc-950 to-rose-950/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                        Live Friend Listening 🎧
                    </h3>
                    
                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                        {activeFriends.map((friend, idx) => (
                            <div 
                                key={idx}
                                className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-3 group hover:bg-white/[0.04] transition duration-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                                            {friend.avatar ? (
                                                <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-xs uppercase text-rose-400">{friend.name.slice(0, 1)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-white truncate">{friend.name}</p>
                                            <p className="text-[9px] text-zinc-500 font-semibold">{friend.time || "Active now"}</p>
                                        </div>
                                    </div>

                                    {/* Animated Waveform Visual Indicator */}
                                    <div className="flex items-end gap-0.5 h-3 shrink-0">
                                        <span className="w-0.5 h-full bg-rose-500 wave-bar wave-bar-1"></span>
                                        <span className="w-0.5 h-5/6 bg-rose-500 wave-bar wave-bar-2"></span>
                                        <span className="w-0.5 h-2/3 bg-rose-500 wave-bar wave-bar-3"></span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 bg-black/40 border border-white/5 p-2 rounded-lg relative overflow-hidden group">
                                    <img 
                                        src={friend.song.cover_url} 
                                        alt="" 
                                        className="w-10 h-10 rounded object-cover shrink-0" 
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] font-extrabold text-white truncate">{friend.song.title}</p>
                                        <p className="text-[9px] text-zinc-400 truncate mt-0.5 font-semibold">{friend.song.artist}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            handlePlayTrack(friend.song);
                                            toast.success(`Syncing & tuning into ${friend.name}'s vibe!`, { icon: "📻" });
                                        }}
                                        className="h-7 w-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition active:scale-90 shadow shrink-0"
                                        title="Listen along instantly"
                                    >
                                        <Play size={10} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. REAL-TIME PLAYLIST UPDATES (DYNAMIC SYNC CHANNEL) */}
                <div className="rounded-2xl border border-white/5 bg-zinc-950 p-5 space-y-4 shadow-xl relative overflow-hidden bg-gradient-to-br from-zinc-950 to-indigo-950/5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-white/5 pb-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Real-time AI Playlists ⚡
                    </h3>
                    
                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs">
                        {true ? (
                            <p className="text-[10px] text-zinc-500 font-semibold italic text-center py-6">AI Playlists will dynamically sync here...</p>
                        ) : (
                            [].map((update, idx) => (
                                <div 
                                    key={idx}
                                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-xl flex items-center gap-3 transition"
                                >
                                    {update.playlist.covers?.[0] ? (
                                        <img 
                                            src={update.playlist.covers[0]} 
                                            alt="" 
                                            className="w-12 h-12 rounded-lg object-cover shrink-0" 
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-white text-lg font-bold">🎵</div>
                                    )}
                                    <div className="min-w-0 flex-grow">
                                        <p className="font-extrabold text-white truncate">{update.playlist.name}</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">By {update.user.name}</p>
                                        <p className="text-[9px] text-indigo-400 font-bold uppercase mt-1 tracking-wider">{update.playlist.tracksCount} tracks</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (update.playlist.tracks?.length > 0) {
                                                handlePlayTrack(update.playlist.tracks[0]);
                                                toast.success(`Importing and playing playlist: "${update.playlist.name}"!`);
                                            }
                                        }}
                                        className="h-8 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[10px] uppercase tracking-wide transition shrink-0 active:scale-95"
                                    >
                                        Tune In
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>

            {/* ADD FRIEND / INVITE POPUP MODAL */}
            <AnimatePresence>
                {isInviteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", duration: 0.4 }}
                            className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-purple-500/20 shadow-[0_0_50px_rgba(124,58,237,0.15)] p-6 sm:p-8 overflow-hidden text-left"
                        >
                            {/* Decorative ambient gradients */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none"></div>

                            {/* Header */}
                            <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <Sparkles size={20} className="text-purple-400" />
                                    <span>Expand Your Vibe Circle</span>
                                </h3>
                                <button
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer text-lg font-bold"
                                >
                                    &times;
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="space-y-6">
                                {/* 1. Shareable Invite Link */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-purple-400">Share Invite Link</label>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">Invite friends to MAD Music VibeTune AI to sync vibes in real-time.</p>
                                    <div className="flex gap-2 mt-2 bg-white/5 border border-white/5 p-2.5 rounded-xl items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/invite?user=${encodeURIComponent(userName || "user")}&id=${userId}`}
                                            className="bg-transparent text-xs text-zinc-300 w-full outline-none select-all truncate pr-2 font-mono"
                                        />
                                        <button
                                            onClick={() => {
                                                const link = `${window.location.origin}/invite?user=${encodeURIComponent(userName || "user")}&id=${userId}`;
                                                navigator.clipboard.writeText(link);
                                                toast.success("Invite link copied!");
                                            }}
                                            className="px-4 py-2 bg-gradient-to-tr from-purple-500 to-pink-500 text-white rounded-lg text-xs font-black uppercase tracking-wider transition hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {/* Social Share Options */}
                                <div className="space-y-3 pt-2">
                                    <label className="text-xs font-black uppercase tracking-wider text-purple-400">Share via Social Media</label>
                                    <div className="grid grid-cols-4 gap-3 mt-2">
                                        {/* WhatsApp */}
                                        <a
                                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent("Join my vibe circle on MAD Music VibeTune AI! " + window.location.origin + "/invite?user=" + encodeURIComponent(userName || "user") + "&id=" + userId)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition duration-200 group gap-1.5 cursor-pointer text-center"
                                        >
                                            <svg className="w-5 h-5 fill-current group-hover:scale-110 transition duration-200" viewBox="0 0 24 24">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.381 9.805-9.768.002-2.607-1.012-5.059-2.859-6.908C16.32 2.08 13.87 1.065 11.26 1.065 5.855 1.065 1.456 5.449 1.454 10.835c-.001 1.777.472 3.51 1.372 5.071L1.871 20.89l5.088-1.336zM17.151 14.28c-.282-.142-1.67-.823-1.927-.918-.258-.095-.446-.142-.633.142-.188.283-.728.918-.891 1.103-.164.185-.328.209-.61.066-.282-.142-1.19-.439-2.267-1.4C9.983 12.44 9.4 11.386 9.213 11.072c-.188-.314-.02-.484.121-.625.127-.127.282-.328.423-.493.142-.165.188-.283.282-.472.095-.188.047-.354-.024-.496-.071-.142-.633-1.523-.867-2.089-.228-.549-.46-.474-.633-.483-.164-.008-.352-.01-.54-.01-.188 0-.493.071-.751.354-.258.282-1.01 1.01-1.01 2.457 0 1.448 1.01 2.851 1.151 3.04.142.189 1.992 3.125 4.827 4.35.674.292 1.202.466 1.612.597.678.215 1.295.185 1.782.112.543-.081 1.67-.682 1.905-1.34.235-.658.235-1.221.164-1.34-.07-.119-.258-.19-.54-.332z"/>
                                            </svg>
                                            <span className="text-[10px] font-bold">WhatsApp</span>
                                        </a>

                                        {/* Telegram */}
                                        <a
                                            href={`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + "/invite?user=" + encodeURIComponent(userName || "user") + "&id=" + userId)}&text=${encodeURIComponent("Join my vibe circle on MAD Music VibeTune AI!")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 hover:bg-sky-500/20 transition duration-200 group gap-1.5 cursor-pointer text-center"
                                        >
                                            <svg className="w-5 h-5 fill-current group-hover:scale-110 transition duration-200" viewBox="0 0 24 24">
                                                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.56 8.18l-1.91 9c-.14.65-.53.81-1.08.5l-2.91-2.15-1.4 1.35c-.15.15-.28.27-.58.27l.2-2.94 5.35-4.83c.23-.2-.05-.32-.36-.12L9.82 12.8 6.97 11.9c-.62-.2-.63-.62.13-.91l11.12-4.29c.51-.19.96.11.74.88z"/>
                                            </svg>
                                            <span className="text-[10px] font-bold">Telegram</span>
                                        </a>

                                        {/* X / Twitter */}
                                        <a
                                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin + "/invite?user=" + encodeURIComponent(userName || "user") + "&id=" + userId)}&text=${encodeURIComponent("Join my vibe circle on MAD Music VibeTune AI! 🎵")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-zinc-400/10 border border-zinc-400/20 text-zinc-300 hover:bg-zinc-400/20 transition duration-200 group gap-1.5 cursor-pointer text-center"
                                        >
                                            <svg className="w-5 h-5 fill-current group-hover:scale-110 transition duration-200" viewBox="0 0 24 24">
                                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                            </svg>
                                            <span className="text-[10px] font-bold">X (Twitter)</span>
                                        </a>

                                        {/* Facebook */}
                                        <a
                                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/invite?user=" + encodeURIComponent(userName || "user") + "&id=" + userId)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition duration-200 group gap-1.5 cursor-pointer text-center"
                                        >
                                            <svg className="w-5 h-5 fill-current group-hover:scale-110 transition duration-200" viewBox="0 0 24 24">
                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                            </svg>
                                            <span className="text-[10px] font-bold">Facebook</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );

}
