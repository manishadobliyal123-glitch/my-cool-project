import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Play, Pause } from "lucide-react";
import toast from "react-hot-toast";

const getArtistSlug = (name) => {
    if (!name) return "";
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

const getArtistNameFromSlug = (slug, artistsDb) => {
    if (!slug) return "";
    const dbKey = Object.keys(artistsDb).find(key => getArtistSlug(key) === slug);
    if (dbKey) return dbKey;

    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

export default function ArtistProfile({
    videos = [],
    playVideo,
    followedArtists = [],
    toggleFollowArtist,
    getArtistData,
    artistsDb = {},
    formatTime,
    setSearch,
    searchVideos,
    setActiveView,
    selectedArtist
}) {
    const { id: routeId } = useParams();
    const navigate = useNavigate();
    
    const id = routeId || getArtistSlug(selectedArtist);
    
    // Resolve artist name from useParams id
    const artistName = getArtistNameFromSlug(id, artistsDb);
    const artistData = getArtistData(artistName, videos);
    
    const [artistFeedTab, setArtistFeedTab] = useState("new");

    // Scroll to top of main content when artist ID changes
    useEffect(() => {
        const el = document.getElementById("main-content-scrollable");
        if (el) {
            el.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [id]);

    if (!artistData) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-zinc-400">
                <p className="text-lg font-bold">Artist profile not found.</p>
                <button
                    onClick={() => navigate("/")}
                    className="mt-4 px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition font-bold"
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const isFollowed = followedArtists.includes(artistName);
    const monthlyListeners = (parseInt(artistData.followers.replace(/,/g, ''), 10) * 0.72).toLocaleString(undefined, { maximumFractionDigits: 0 }) + " Monthly Listeners";

    // 1. Show same artist songs only - Filter songs from videos array using artistId (which matches target artistName slug or channelId)
    const filteredSongs = videos.filter(v => {
        const cId = v.snippet?.channelId || v.channelId || v.artistId;
        const cTitle = (v.snippet?.channelTitle || v.artist || "").toLowerCase();
        const videoArtistSlug = getArtistSlug(cTitle);
        
        return (cId === id) || (videoArtistSlug === id) || cTitle.includes(artistName.toLowerCase()) || artistName.toLowerCase().includes(cTitle);
    });

    // Dynamic rendering from array data
    const displayedTracks = filteredSongs.length > 0 ? filteredSongs.map((m, idx) => ({
        title: m.snippet?.title || m.title,
        videoId: m.id?.videoId || m.videoId,
        duration: m.duration || 210,
        raw: m
    })).slice(0, 8) : artistData.topTracks;

    const handleSimilarArtistClick = (similarName) => {
        navigate(`/artist/${getArtistSlug(similarName)}`);
    };

    return (
        <div className="space-y-10 animate-fadeIn text-left pb-10">
            {/* 1. HERO BANNER */}
            <div className="relative h-[320px] sm:h-[380px] md:h-[420px] rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
                {/* Background image */}
                <img 
                    src={artistData.bgImage} 
                    alt="" 
                    className="absolute inset-0 w-full h-full object-cover saturate-[1.15] brightness-[0.55] scale-102 group-hover:scale-105 transition-transform duration-[1000ms]"
                />
                {/* Ambient dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/20 to-transparent" />

                {/* Banner Content (bottom left align) */}
                <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 flex flex-col md:flex-row items-center md:items-end gap-6 z-10 text-center md:text-left">
                    {/* Circle Profile Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl shrink-0 hover:scale-105 transition duration-500">
                        <img 
                            src={artistData.image} 
                            alt={artistName} 
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 space-y-2.5">
                        {/* Verified badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-black text-[9px] uppercase tracking-widest">
                            <CheckCircle size={12} className="fill-cyan-400 text-zinc-950" />
                            <span>Verified Artist</span>
                        </div>

                        {/* Artist name */}
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.65)] font-display">
                            {artistName}
                        </h1>

                        {/* Listener stats */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs sm:text-sm font-bold text-zinc-300">
                            <span className="text-purple-400 font-extrabold uppercase tracking-wide">
                                {monthlyListeners}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 hidden sm:inline" />
                            <span>{artistData.followers} Followers</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ACTION CONTROLS ROW */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5 pb-6">
                <div className="flex items-center gap-5">
                    {/* Play Button */}
                    <button
                        onClick={() => {
                            if (displayedTracks && displayedTracks.length > 0) {
                                const trackItem = displayedTracks[0];
                                const ytVideoItem = trackItem.raw || {
                                    id: { videoId: trackItem.videoId },
                                    snippet: {
                                        title: trackItem.title,
                                        channelTitle: artistName,
                                        thumbnails: {
                                            high: { url: artistData.image },
                                            default: { url: artistData.image }
                                        }
                                    }
                                };
                                playVideo(ytVideoItem);
                                toast.success(`Playing ${artistName}'s popular track: "${trackItem.title}"`);
                            }
                        }}
                        className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-[0_5px_15px_rgba(236,72,153,0.4)] hover:shadow-[0_8px_25px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition transform duration-350 cursor-pointer shrink-0"
                        title="Play top track"
                    >
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </button>

                    {/* Follow Button */}
                    <button
                        onClick={() => toggleFollowArtist(artistName)}
                        className={`px-8 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 border cursor-pointer shrink-0 ${
                            isFollowed 
                                ? "bg-white text-zinc-950 border-white hover:bg-zinc-100 shadow-md font-bold" 
                                : "bg-transparent text-white border-white/20 hover:border-white hover:bg-white/5"
                        }`}
                    >
                        {isFollowed ? "Following" : "Follow"}
                    </button>
                </div>

                {/* Secondary Metrics */}
                <div className="hidden sm:flex items-center gap-6 text-zinc-400 font-bold text-xs uppercase tracking-widest bg-white/5 border border-white/5 rounded-full px-5 py-2.5">
                    <span>Global Artist Rank: <strong className="text-purple-400 font-extrabold">#{(artistName.charCodeAt(0) % 50 + 12)}</strong></span>
                </div>
            </div>

            {/* 3. MULTI-COLUMN CONTENT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT COLUMN: Top Tracks & Albums (2/3 width) */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Top Tracks */}
                    <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                            Popular Tracks
                        </h3>

                        <div className="space-y-1 bg-purple-950/[0.15] border border-purple-500/10 p-4 rounded-3xl backdrop-blur-2xl">
                            {displayedTracks.map((track, idx) => {
                                const ytVideo = track.raw || {
                                    id: { videoId: track.videoId },
                                    snippet: {
                                        title: track.title,
                                        channelTitle: artistName,
                                        thumbnails: {
                                            high: { url: `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg` },
                                            default: { url: `https://img.youtube.com/vi/${track.videoId}/default.jpg` }
                                        }
                                    }
                                };
                                const streamsCount = ((idx + 1) * 3.4 * (track.title.charCodeAt(0) % 7 + 1)).toFixed(1);
                                
                                // Fetch cover URL using YouTube API hierarchy or standard/fallback formats
                                const snippetThumbs = track.raw?.snippet?.thumbnails || track.snippet?.thumbnails;
                                const coverUrl = snippetThumbs?.maxres?.url || snippetThumbs?.high?.url || `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;

                                return (
                                    <div 
                                        key={track.videoId + "-" + idx}
                                        onClick={() => playVideo(ytVideo)}
                                        className="group cursor-pointer flex items-center justify-between p-3.5 rounded-2xl bg-transparent hover:bg-purple-500/[0.06] hover:border-purple-500/20 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] border border-transparent transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {/* Track number / Hover Play */}
                                            <div className="w-6 flex items-center justify-center shrink-0">
                                                <span className="text-sm font-bold text-zinc-500 group-hover:hidden">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-xs text-purple-400 hidden group-hover:inline">
                                                    <Play size={12} fill="currentColor" />
                                                </span>
                                            </div>

                                            {/* Track cover - Rounded Square with Hover Glow */}
                                            <div className="w-12 h-12 shrink-0 rounded-2xl overflow-hidden border border-purple-500/20 group-hover:border-[#7c3aed]/50 transition-all duration-300 relative shadow-sm group-hover:shadow-[0_0_12px_rgba(124,58,237,0.5)]">
                                                <img 
                                                    src={coverUrl} 
                                                    onLoad={(e) => {
                                                        if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
                                                            e.target.src = `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
                                                        }
                                                    }}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = `https://img.youtube.com/vi/${track.videoId}/hqdefault.jpg`;
                                                    }}
                                                    alt={track.title} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                />
                                            </div>

                                            {/* Track title */}
                                            <div className="min-w-0 text-left">
                                                <p className="text-sm font-black truncate text-zinc-200 group-hover:text-purple-400 transition-colors">
                                                    {track.title}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stream counts & duration */}
                                        <div className="flex items-center gap-8 shrink-0">
                                            <span className="hidden sm:inline text-xs text-zinc-500 font-bold uppercase tracking-wider">
                                                {streamsCount}M streams
                                            </span>
                                            <span className="text-xs text-zinc-400 font-mono">
                                                {formatTime(track.duration)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Albums */}
                    <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                            Albums & EPs
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                            {artistData.albums.map((album, idx) => (
                                <div 
                                    key={album.name + "-" + idx}
                                    onClick={() => {
                                        setSearch(`${artistName} ${album.name}`);
                                        searchVideos(`${artistName} ${album.name}`);
                                        navigate("/explore");
                                        toast.success(`Searching tracks from album "${album.name}"`);
                                    }}
                                    className="group cursor-pointer p-4 rounded-3xl bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-pink-500/20 transition-all duration-500 text-left shadow-lg hover:shadow-pink-500/5 hover:-translate-y-1 transform"
                                >
                                    <div className="relative overflow-hidden aspect-square rounded-2xl border border-white/10 mb-3.5">
                                        <img 
                                            src={album.cover || "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300"} 
                                            onLoad={(e) => {
                                                if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
                                                    e.target.src = e.target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                                                }
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                if (e.target.src && e.target.src.includes("maxresdefault.jpg")) {
                                                    e.target.src = e.target.src.replace("maxresdefault.jpg", "hqdefault.jpg");
                                                } else {
                                                    e.target.src = "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300";
                                                }
                                            }}
                                            alt={album.name} 
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-300">
                                            <span className="px-4 py-2 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                                                Play Album
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-zinc-200 truncate group-hover:text-pink-400 transition-colors">
                                            {album.name}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 mt-1 font-bold">
                                            {album.year} • Album
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Bio, Fans Also Like, Sub-tabs (1/3 width) */}
                <div className="space-y-10">
                    {/* Fans Also Like Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-cyan-400 rounded-full"></span>
                            Fans Also Like
                        </h3>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {artistData.similar.map((similarName, idx) => {
                                const similarData = getArtistData(similarName, videos);
                                return (
                                    <div 
                                        key={similarName + "-" + idx}
                                        onClick={() => handleSimilarArtistClick(similarName)}
                                        className="group cursor-pointer p-4 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 flex flex-col items-center text-center w-full"
                                    >
                                        <div className="w-16 h-16 rounded-full overflow-hidden border border-white/10 shadow-md mb-3 shrink-0 group-hover:scale-105 transition-transform duration-500 relative">
                                            <img 
                                                src={similarData?.image || "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300"} 
                                                alt={similarName} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="w-full min-w-0">
                                            <p className="text-xs font-bold text-zinc-300 group-hover:text-cyan-400 truncate transition-colors">
                                                {similarName}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* About Artist Card */}
                    <div className="space-y-4">
                        <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-emerald-400 rounded-full"></span>
                            About Artist
                        </h3>

                        <div className="relative h-[280px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl group text-left cursor-pointer">
                            {/* Background visual */}
                            <img 
                                src={artistData.bgImage} 
                                alt={artistName} 
                                className="absolute inset-0 w-full h-full object-cover brightness-[0.45] group-hover:scale-105 transition duration-[1000ms]"
                            />
                            {/* Dark linear gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                            
                            {/* Biography overlay at the bottom */}
                            <div className="absolute bottom-6 left-6 right-6 z-10 space-y-2">
                                <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-zinc-300 rounded-full">
                                    Biography
                                </span>
                                <p className="text-xs text-zinc-200 leading-relaxed font-semibold line-clamp-4 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)]">
                                    {artistData.bio}
                                </p>
                                <div className="pt-1.5 flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                                    <span>View Full Details</span>
                                    <span>➔</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Artist Feed Sub-Tabs */}
                    <div className="p-5 rounded-3xl bg-white/[0.01] border border-white/5 space-y-5 text-left">
                        {/* Sub-tabs header menu */}
                        <div className="flex border-b border-white/5 pb-1 gap-2 overflow-x-auto scrollbar-none">
                            {["new", "trending", "popular"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setArtistFeedTab(tab)}
                                    className={`pb-2.5 text-xs font-black uppercase tracking-wider relative transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                        artistFeedTab === tab 
                                            ? "text-white" 
                                            : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    {tab === "new" ? "New release" : tab === "trending" ? "Trending" : "Popular now"}
                                    {artistFeedTab === tab && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Sub-tabs content */}
                        <div className="pt-2 min-h-[160px]">
                            {artistFeedTab === "new" ? (
                                /* NEW RELEASE TAB */
                                artistData.newRelease ? (
                                    <div 
                                        onClick={() => {
                                            setSearch(`${artistName} ${artistData.newRelease.title}`);
                                            searchVideos(`${artistName} ${artistData.newRelease.title}`);
                                            navigate("/explore");
                                        }}
                                        className="group cursor-pointer flex gap-4 p-2.5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 transition"
                                    >
                                        <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden border border-white/10 relative">
                                            <img 
                                                src={artistData.newRelease.cover} 
                                                alt="" 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="min-w-0 space-y-1 text-left">
                                            <span className="inline-block px-2 py-0.5 bg-[#ec4899]/15 border border-[#ec4899]/25 text-[#ec4899] text-[9px] font-black uppercase tracking-wider rounded-full">
                                                New Single
                                            </span>
                                            <h4 className="text-sm font-black truncate text-zinc-100 group-hover:text-[#ec4899] transition mt-1">
                                                {artistData.newRelease.title}
                                            </h4>
                                            <p className="text-[10px] text-zinc-500 font-bold">
                                                {artistData.newRelease.date}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500">No recent releases available.</p>
                                )
                            ) : artistFeedTab === "trending" ? (
                                /* TRENDING (MOCK ANALYTICS STREAM CHART) */
                                <div className="space-y-3.5 select-none">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-zinc-500">
                                        <span>Audience Metric</span>
                                        <span className="text-cyan-400">⚡ Live Streams</span>
                                    </div>

                                    {/* Responsive animated vertical bar graph */}
                                    <div className="h-24 flex items-end justify-between gap-1 border-b border-white/5 pb-1 px-1 bg-white/[0.005] rounded-xl p-2">
                                        {[65, 45, 85, 55, 95, 75, 100].map((h, i) => {
                                            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                                            return (
                                                <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group/bar relative">
                                                    {/* Tooltip on hover */}
                                                    <span className="absolute -translate-y-8 bg-zinc-950 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black text-white opacity-0 group-hover/bar:opacity-100 transition-opacity z-10">
                                                        {(h * 3242).toLocaleString()}
                                                    </span>

                                                    {/* Bar element */}
                                                    <div 
                                                        style={{ height: `${h}%` }}
                                                        className="w-full bg-gradient-to-t from-purple-600/70 to-pink-500/90 rounded-t shadow-[0_0_8px_rgba(236,72,153,0.3)] hover:scale-x-105 hover:saturate-150 transition-all duration-300"
                                                    />
                                                    <span className="text-[8px] font-bold text-zinc-500">
                                                        {days[i]}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-semibold text-center italic mt-1">
                                        Total streaming trends rose by 14.8% this week.
                                    </p>
                                </div>
                            ) : (
                                /* POPULAR NOW TAB STATS */
                                <div className="space-y-2.5">
                                    {[
                                        { label: "Global Artist Rank", val: `#${(artistName.charCodeAt(0) % 50 + 12)}` },
                                        { label: "Active Listeners Now", val: `${(artistName.charCodeAt(0) % 9 * 1105 + 4321).toLocaleString()}` },
                                        { label: "Playlist Adds Today", val: `${(artistName.charCodeAt(0) % 4 * 14352 + 10421).toLocaleString()}` },
                                        { label: "Official Radios Playing", val: `${(artistName.charCodeAt(0) % 7 * 8 + 12)} stations` }
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/5">
                                            <span className="text-xs font-semibold text-zinc-400">{stat.label}</span>
                                            <span className="text-xs font-black text-white uppercase tracking-wider">{stat.val}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
