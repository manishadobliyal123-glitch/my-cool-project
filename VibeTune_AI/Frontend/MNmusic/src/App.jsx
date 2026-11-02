import { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import Login from "./components/Login";
import MediaController from "./components/MediaController";
import AIPlaylistStudio from "./components/AIPlaylistStudio";
import MusicFeed from "./components/MusicFeed";
import ArtistProfile from "./components/ArtistProfile";
import madLogo from "./assets/mad_logo.png";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
    Bell,
    Bookmark,
    Cast,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Compass,
    Home,
    Menu,
    PlayCircle,
    Search,
    X,
    Sparkles,
    Users,
    Mic,
    ExternalLink,
    MessageSquare,
    Heart,
    History,
    Minimize2,
    Tv,
    Music,
    Volume2,
    VolumeX,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Maximize2,
    Shuffle,
    Repeat,
    LayoutGrid,
    List,
} from "lucide-react";

// ==========================================
// PREDEFINED PREMIUM ARTISTS DATABASE (SPOTIFY STYLE)
// ==========================================
const artistsDb = {
    "Arijit Singh": {
        image: "/arijit.jpg",
        bgImage: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200",
        followers: "63,412,892",
        listeners: "42,912,482",
        bio: "The voice of a generation, Arijit Singh is a versatile playback singer known for his soulful romantic ballads.",
        topTracks: [
            { title: "Kesariya", videoId: "BddP6PYo2gs", duration: 172 },
            { title: "Apna Bana Le", videoId: "u2NAus-WDKA", duration: 204 },
            { title: "Tum Hi Ho", videoId: "Umqb9KENgmg", duration: 262 },
            { title: "Channa Mereya", videoId: "z-diRlyLGzo", duration: 289 },
            { title: "Kabira", videoId: "jHNNMj5bNQw", duration: 223 }
        ],
        albums: [
            { name: "Aashiqui 2", year: "2013", cover: "https://img.youtube.com/vi/Umqb9KENgmg/hqdefault.jpg" },
            { name: "Kabir Singh", year: "2019", cover: "https://img.youtube.com/vi/volg4T218SM/hqdefault.jpg" },
            { name: "Brahmastra", year: "2022", cover: "https://img.youtube.com/vi/BddP6PYo2gs/hqdefault.jpg" },
            { name: "Love Aaj Kal", year: "2020", cover: "https://img.youtube.com/vi/MJyKN-8UncM/hqdefault.jpg" }
        ],
        similar: ["Diljit Dosanjh", "Taylor Swift", "Coldplay"],
        newRelease: { title: "Apna Bana Le (Acoustic Version)", date: "Released 3 days ago", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400" }
    },
    "Diljit Dosanjh": {
        image: "/diljit.jpg",
        bgImage: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200",
        followers: "22,418,903",
        listeners: "18,912,482",
        bio: "Global Punjabi superstar, actor, and singer blending authentic bhangra vibes with international hip-hop beats.",
        topTracks: [
            { title: "Lover", videoId: "mH0_XCnZ0mY", duration: 191 },
            { title: "Born to Shine", videoId: "Cl2UaM64O4o", duration: 213 },
            { title: "Do You Know", videoId: "TzUfR64TzXw", duration: 224 },
            { title: "Lemonade", videoId: "dC2kG4Z9H-s", duration: 182 },
            { title: "Proper Patola", videoId: "0Zexd8X73N0", duration: 180 }
        ],
        albums: [
            { name: "G.O.A.T.", year: "2020", cover: "https://img.youtube.com/vi/2dHozW27G3g/hqdefault.jpg" },
            { name: "MoonChild Era", year: "2021", cover: "https://img.youtube.com/vi/mH0_XCnZ0mY/hqdefault.jpg" },
            { name: "Ghost", year: "2023", cover: "https://img.youtube.com/vi/dC2kG4Z9H-s/hqdefault.jpg" },
            { name: "Roar", year: "2018", cover: "https://img.youtube.com/vi/0Zexd8X73N0/hqdefault.jpg" }
        ],
        similar: ["Arijit Singh", "Taylor Swift", "Coldplay"],
        newRelease: { title: "Lemonade (Sunset Vibes)", date: "Released 1 week ago", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400" }
    },
    "Taylor Swift": {
        image: "/GNLZZGG002C8FJK.jpg",
        bgImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200",
        followers: "102,482,903",
        listeners: "98,912,482",
        bio: "Acclaimed singer-songwriter Taylor Swift is one of the world's most successful and influential pop musicians.",
        topTracks: [
            { title: "Cruel Summer", videoId: "ic8j13c6Gpg", duration: 178 },
            { title: "Blank Space", videoId: "e-ORhEE9VVg", duration: 231 },
            { title: "Love Story", videoId: "8xg3vE8Ie_E", duration: 236 },
            { title: "Anti-Hero", videoId: "b1kbLwvqugk", duration: 200 },
            { title: "Shake It Off", videoId: "nfWlot6h_JM", duration: 242 }
        ],
        albums: [
            { name: "Midnights", year: "2022", cover: "https://img.youtube.com/vi/b1kbLwvqugk/hqdefault.jpg" },
            { name: "1989 (Taylor's Version)", year: "2023", cover: "https://img.youtube.com/vi/e-ORhEE9VVg/hqdefault.jpg" },
            { name: "Lover", year: "2019", cover: "https://img.youtube.com/vi/ic8j13c6Gpg/hqdefault.jpg" },
            { name: "Folklore", year: "2020", cover: "https://img.youtube.com/vi/K-a8s8OLBSE/hqdefault.jpg" }
        ],
        similar: ["Ed Sheeran", "Coldplay", "Arijit Singh"],
        newRelease: { title: "Fortnight (featuring Post Malone)", date: "Released 2 weeks ago", cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400" }
    },
    "Coldplay": {
        image: "/cold.jpg",
        bgImage: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200",
        followers: "45,912,482",
        listeners: "62,912,482",
        bio: "Legendary alternative rock band, known for their colorful stadium tours and globally loved anthems.",
        topTracks: [
            { title: "Something Just Like This", videoId: "FM7MFYuyoOE", duration: 247 },
            { title: "Hymn for the Weekend", videoId: "YykjpePLW1k", duration: 260 },
            { title: "Yellow", videoId: "yKNxeF4KMsY", duration: 268 },
            { title: "Fix You", videoId: "k4V3_Gky278", duration: 295 },
            { title: "Viva La Vida", videoId: "dvgZkm1xWPE", duration: 242 }
        ],
        albums: [
            { name: "Music of the Spheres", year: "2021", cover: "https://img.youtube.com/vi/3YqGPAMLDkU/hqdefault.jpg" },
            { name: "A Head Full of Dreams", year: "2015", cover: "https://img.youtube.com/vi/YykjpePLW1k/hqdefault.jpg" },
            { name: "Ghost Stories", year: "2014", cover: "https://img.youtube.com/vi/VPRjCeoBqrI/hqdefault.jpg" },
            { name: "Parachutes", year: "2000", cover: "https://img.youtube.com/vi/yKNxeF4KMsY/hqdefault.jpg" }
        ],
        similar: ["Taylor Swift", "Diljit Dosanjh", "Arijit Singh"],
        newRelease: { title: "feelslikeimfallinginlove", date: "Released 5 days ago", cover: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=400" }
    },
    "Shreya Ghoshal": {
        image: "/shreya.jpg",
        bgImage: "https://i.scdn.co/image/ab67616d0000b2730d1bf14991089b023556354f",
        followers: "28,412,892",
        listeners: "19,912,482",
        bio: "Renowned Indian playback singer Shreya Ghoshal is celebrated globally for her expressive voice and mastery over classical and modern romantic melodies.",
        topTracks: [
            { title: "Tum Kya Mile", videoId: "8T4sXhiP_h8", duration: 252 },
            { title: "Sunn Raha Hai", videoId: "z3wAjJXbYzA", duration: 312 },
            { title: "Deewani Mastani", videoId: "zRtPz3j032Y", duration: 340 },
            { title: "Pal", videoId: "9g2gD8qI8dE", duration: 247 },
            { title: "Teri Meri", videoId: "8yG9x23-Lzo", duration: 325 }
        ],
        albums: [
            { name: "Rocky Aur Rani Kii Prem Kahaani", year: "2023", cover: "https://img.youtube.com/vi/8T4sXhiP_h8/hqdefault.jpg" },
            { name: "Aashiqui 2", year: "2013", cover: "https://img.youtube.com/vi/z3wAjJXbYzA/hqdefault.jpg" },
            { name: "Bajirao Mastani", year: "2015", cover: "https://img.youtube.com/vi/zRtPz3j032Y/hqdefault.jpg" },
            { name: "Jalebi", year: "2018", cover: "https://img.youtube.com/vi/9g2gD8qI8dE/hqdefault.jpg" }
        ],
        similar: ["Arijit Singh", "Jubin Nautiyal", "Diljit Dosanjh"],
        newRelease: { title: "Tum Kya Mile (Unplugged)", date: "Released 4 days ago", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400" }
    },
    "Jubin Nautiyal": {
        image: "/jubi.jpg",
        bgImage: "https://i.scdn.co/image/ab67616d0000b273f372aa30e5c85e7a47fd1c4d",
        followers: "18,124,902",
        listeners: "14,912,482",
        bio: "An exceptionally soulful Indian playback singer, Jubin Nautiyal is celebrated for his organic voice and chartbuster romance ballads.",
        topTracks: [
            { title: "Raataan Lambiyan", videoId: "gvyUuxdRdRY", duration: 230 },
            { title: "Lut Gaye", videoId: "sCbbMZ-cgn8", duration: 228 },
            { title: "Tum Hi Aana", videoId: "8sR_HnBsk-E", duration: 249 },
            { title: "Humnava Mere", videoId: "h108c9-z2t4", duration: 343 },
            { title: "Dil Galti Kar Baitha Hai", videoId: "1-yTsz2sKj0", duration: 291 }
        ],
        albums: [
            { name: "Shershaah", year: "2021", cover: "https://img.youtube.com/vi/gvyUuxdRdRY/hqdefault.jpg" },
            { name: "Marjaavaan", year: "2019", cover: "https://img.youtube.com/vi/8sR_HnBsk-E/hqdefault.jpg" },
            { name: "Lut Gaye Album", year: "2021", cover: "https://img.youtube.com/vi/sCbbMZ-cgn8/hqdefault.jpg" },
            { name: "Humnava Mere Single", year: "2018", cover: "https://img.youtube.com/vi/h108c9-z2t4/hqdefault.jpg" }
        ],
        similar: ["Arijit Singh", "Shreya Ghoshal", "Diljit Dosanjh"],
        newRelease: { title: "Raataan Lambiyan (Lofi Reprise)", date: "Released 2 days ago", cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400" }
    }
};

const getArtistSlug = (name) => {
    if (!name) return "";
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

const getArtistNameFromSlug = (slug) => {
    if (!slug) return "";
    const dbKey = Object.keys(artistsDb).find(key => getArtistSlug(key) === slug);
    if (dbKey) return dbKey;

    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const getArtistData = (name, activeVideosList = []) => {
    if (!name) return null;
    const cleanName = name.replace(/\s*-\s*Topic/gi, "").replace(/\s*VEVO/gi, "").trim();
    if (artistsDb[cleanName]) return artistsDb[cleanName];

    // Otherwise, generate deterministically based on name length/hash
    const seed = cleanName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const followersVal = ((seed * 123456) % 15000000) + 50000;
    const listenersVal = ((seed * 98765) % 30000000) + 80000;

    // Pick Unsplash generic images based on seed
    const concertImages = [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200",
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200",
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200",
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200"
    ];
    const profileImages = [
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600",
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600"
    ];

    const bgImage = concertImages[seed % concertImages.length];
    const image = profileImages[seed % profileImages.length];

    // Dynamically try to find tracks in videos list that match this channel/artist name
    const matches = activeVideosList.filter(v => {
        const cTitle = (v.snippet?.channelTitle || v.artist || "").toLowerCase();
        return cTitle.includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(cTitle);
    });

    const topTracks = matches.length >= 2 ? matches.map(m => ({
        title: m.snippet?.title || m.title,
        videoId: m.id?.videoId || m.videoId,
        duration: m.duration || 210,
        raw: m
    })).slice(0, 5) : [
        { title: `${cleanName} - Golden Vibe`, videoId: "BddP6PYo2gs", duration: 180 },
        { title: `${cleanName} - Sunset Acoustic`, videoId: "u2NAus-WDKA", duration: 220 },
        { title: `${cleanName} - Midnight Sessions`, videoId: "Umqb9KENgmg", duration: 240 },
        { title: `${cleanName} - Lo-Fi Chill`, videoId: "z-diRlyLGzo", duration: 190 },
        { title: `${cleanName} - Echoes`, videoId: "jHNNMj5bNQw", duration: 205 }
    ];

    return {
        image,
        bgImage,
        followers: followersVal.toLocaleString(),
        listeners: listenersVal.toLocaleString(),
        bio: `${cleanName} is a dynamic audio presence, shaping the sonic currents of modern streaming with every release.`,
        topTracks,
        albums: [
            { name: "Vibe Chronicles", year: "2024", cover: `https://img.youtube.com/vi/${topTracks[0]?.videoId || "BddP6PYo2gs"}/hqdefault.jpg` },
            { name: "Sunset Sessions Vol. 1", year: "2023", cover: `https://img.youtube.com/vi/${topTracks[1]?.videoId || topTracks[0]?.videoId || "u2NAus-WDKA"}/hqdefault.jpg` },
            { name: "Echoes of Mind", year: "2022", cover: `https://img.youtube.com/vi/${topTracks[2]?.videoId || topTracks[0]?.videoId || "Umqb9KENgmg"}/hqdefault.jpg` },
            { name: "Midnight Acoustic", year: "2021", cover: `https://img.youtube.com/vi/${topTracks[3]?.videoId || topTracks[0]?.videoId || "z-diRlyLGzo"}/hqdefault.jpg` }
        ],
        similar: ["Arijit Singh", "Diljit Dosanjh", "Taylor Swift", "Coldplay"].filter(n => n !== cleanName).slice(0, 3),
        newRelease: { title: `${cleanName} - Retro Session`, date: "Released 3 days ago", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400" }
    };
};

const genresDb = {
    "New": {
        color: "from-lime-500/20 to-emerald-600/30 border-lime-500/30 hover:border-lime-500/60 shadow-lime-500/10 hover:shadow-lime-500/30 text-lime-400",
        pillColor: "bg-lime-500/20 text-lime-300 border-lime-500/30",
        glow: "shadow-[0_0_20px_rgba(132,204,22,0.4)] border-lime-500",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80",
        desc: "Fresh releases and brand new hit tracks",
        tagline: "Brand new sounds"
    },
    "Sad": {
        color: "from-blue-600/20 to-indigo-800/30 border-blue-500/30 hover:border-blue-500/60 shadow-blue-500/10 hover:shadow-blue-500/30 text-blue-400",
        pillColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)] border-blue-500",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80",
        desc: "Soulful tracks for quiet contemplation",
        tagline: "Beautiful melancholy"
    },
    "Party": {
        color: "from-amber-500/20 to-red-600/30 border-amber-500/30 hover:border-amber-500/60 shadow-amber-500/10 hover:shadow-amber-500/30 text-amber-400",
        pillColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        glow: "shadow-[0_0_20px_rgba(245,158,11,0.4)] border-amber-500",
        image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80",
        desc: "High-octane club beats and house music",
        tagline: "Turn up the vibe"
    },
    "Relax": {
        color: "from-teal-400/20 to-emerald-600/30 border-teal-500/30 hover:border-teal-500/60 shadow-teal-500/10 hover:shadow-teal-500/30 text-teal-400",
        pillColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
        glow: "shadow-[0_0_20px_rgba(20,184,166,0.4)] border-teal-500",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&auto=format&fit=crop&q=80",
        desc: "Chill lo-fi beats and relaxing soundscapes",
        tagline: "Unwind & breathe"
    },
    "Energise": {
        color: "from-orange-500/20 to-amber-600/30 border-orange-500/30 hover:border-orange-500/60 shadow-orange-500/10 hover:shadow-orange-500/30 text-orange-400",
        pillColor: "bg-orange-500/20 text-orange-300 border-orange-500/30",
        glow: "shadow-[0_0_20px_rgba(249,115,22,0.4)] border-orange-500",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        desc: "Pump up tracks to power your day",
        tagline: "Instant motivation"
    },
    "Sleep": {
        color: "from-violet-800/20 to-fuchsia-950/30 border-violet-500/30 hover:border-violet-500/60 shadow-violet-500/10 hover:shadow-violet-500/30 text-violet-400",
        pillColor: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        glow: "shadow-[0_0_20px_rgba(139,92,246,0.4)] border-violet-500",
        image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80",
        desc: "Deep ambient tones for peaceful rest",
        tagline: "Sweet dreams"
    },
    "Podcasts": {
        color: "from-cyan-500/20 to-blue-600/30 border-cyan-500/30 hover:border-cyan-500/60 shadow-cyan-500/10 hover:shadow-cyan-500/30 text-cyan-400",
        pillColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
        glow: "shadow-[0_0_20px_rgba(6,182,212,0.4)] border-cyan-500",
        image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&auto=format&fit=crop&q=80",
        desc: "Intriguing talks and global stories",
        tagline: "Expand your mind"
    },
    "Work out": {
        color: "from-red-500/20 to-orange-600/30 border-red-500/30 hover:border-red-500/60 shadow-red-500/10 hover:shadow-red-500/30 text-red-400",
        pillColor: "bg-red-500/20 text-red-300 border-red-500/30",
        glow: "shadow-[0_0_20px_rgba(239,68,68,0.4)] border-red-500",
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
        desc: "Aggressive beats to break limits",
        tagline: "Push your limits"
    },
    "Commute": {
        color: "from-sky-400/20 to-blue-600/30 border-sky-500/30 hover:border-sky-500/60 shadow-sky-500/10 hover:shadow-sky-500/30 text-sky-400",
        pillColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        glow: "shadow-[0_0_20px_rgba(56,189,248,0.4)] border-sky-500",
        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&auto=format&fit=crop&q=80",
        desc: "Easy listening for your travels",
        tagline: "On the move"
    },
    "Focus": {
        color: "from-slate-600/20 to-zinc-800/30 border-slate-500/30 hover:border-slate-500/60 shadow-slate-500/10 hover:shadow-slate-500/30 text-slate-400",
        pillColor: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        glow: "shadow-[0_0_20px_rgba(100,116,139,0.4)] border-slate-500",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&auto=format&fit=crop&q=80",
        desc: "Instrumental and binaural focus audio",
        tagline: "Pure concentration"
    },
    "Feel good": {
        color: "from-pink-500/20 to-fuchsia-600/30 border-pink-500/30 hover:border-pink-500/60 shadow-pink-500/10 hover:shadow-pink-500/30 text-pink-400",
        pillColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        glow: "shadow-[0_0_20px_rgba(236,72,153,0.4)] border-pink-500",
        image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&auto=format&fit=crop&q=80",
        desc: "Cheerful upbeat pop to raise your mood",
        tagline: "Smile and groove"
    },
    "Lofi": {
        color: "from-indigo-900/40 via-purple-900/20 to-pink-900/30 border-purple-500/30 hover:border-purple-500/60 shadow-purple-500/10 hover:shadow-purple-500/30 text-purple-400",
        pillColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        glow: "shadow-[0_0_20px_rgba(168,85,247,0.4)] border-purple-500",
        image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=400&auto=format&fit=crop&q=80",
        desc: "Retro synth beats and lo-fi aesthetics to zone out",
        tagline: "Lofi beats to study/relax"
    },
    "Chill": {
        color: "from-teal-900/40 via-emerald-900/20 to-cyan-900/30 border-teal-500/30 hover:border-teal-500/60 shadow-teal-500/10 hover:shadow-teal-500/30 text-teal-400",
        pillColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
        glow: "shadow-[0_0_20px_rgba(20,184,166,0.4)] border-teal-500",
        image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&auto=format&fit=crop&q=80",
        desc: "Low-tempo lounge sounds and soft chill acoustic vibes",
        tagline: "Unwind completely"
    },
    "Romantic": {
        color: "from-rose-900/40 via-pink-900/20 to-red-900/30 border-rose-500/30 hover:border-rose-500/60 shadow-rose-500/10 hover:shadow-rose-500/30 text-rose-400",
        pillColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
        glow: "shadow-[0_0_20px_rgba(244,63,94,0.4)] border-rose-500",
        image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&auto=format&fit=crop&q=80",
        desc: "Beautiful romantic ballads and acoustic love anthems",
        tagline: "Pure emotional connection"
    }
};

const getVibeGenreForSong = (video) => {
    if (!video) return "Feel good";

    const title = (video.snippet?.title || video.title || "").toLowerCase();
    const artist = (video.snippet?.channelTitle || video.artist || "").toLowerCase();

    if (title.includes("lofi") || title.includes("lo-fi"))
        return "Lofi";

    if (title.includes("chill") || title.includes("chillout"))
        return "Chill";

    if (
        title.includes("romantic") ||
        title.includes("love") ||
        title.includes("ishq") ||
        title.includes("romance") ||
        title.includes("kesariya") ||
        title.includes("tum hi ho") ||
        title.includes("sanam") ||
        title.includes("apna bana le")
    )
        return "Romantic";

    if (
        title.includes("sad") ||
        title.includes("dard") ||
        title.includes("judai") ||
        title.includes("alone") ||
        title.includes("cry") ||
        title.includes("channa")
    )
        return "Sad";

    if (
        title.includes("party") ||
        title.includes("dance") ||
        title.includes("bhangra") ||
        title.includes("club") ||
        title.includes("dj") ||
        title.includes("born to shine") ||
        artist.includes("dosanjh")
    )
        return "Party";

    if (
        title.includes("gym") ||
        title.includes("workout") ||
        title.includes("fitness") ||
        title.includes("training")
    )
        return "Work out";

    if (
        title.includes("pump") ||
        title.includes("boost") ||
        title.includes("energy") ||
        title.includes("energise")
    )
        return "Energise";

    if (
        title.includes("relax") ||
        title.includes("meditation") ||
        title.includes("slowed") ||
        title.includes("reverb")
    )
        return "Relax";

    if (
        title.includes("sleep") ||
        title.includes("ambient") ||
        title.includes("dream") ||
        title.includes("nature")
    )
        return "Sleep";

    if (
        title.includes("focus") ||
        title.includes("study") ||
        title.includes("instrumental") ||
        title.includes("concentration")
    )
        return "Focus";

    if (
        title.includes("drive") ||
        title.includes("travel") ||
        title.includes("road") ||
        title.includes("journey")
    )
        return "Commute";

    if (
        title.includes("podcast") ||
        title.includes("interview") ||
        title.includes("episode") ||
        title.includes("talk")
    )
        return "Podcasts";

    if (
        title.includes("new") ||
        title.includes("latest") ||
        title.includes("fresh") ||
        title.includes("release")
    )
        return "New";

    return "Popular";
};

export default function App() {
    const playerRef = useRef(null);
    const playerContainerRef = useRef(null);

    const cameraVideoRef = useRef(null);
    const cameraCanvasRef = useRef(null);
    const cardsRailRef = useRef(null);

    const API_BASE = "http://127.0.0.1:8000";
    const getSavedProfile = () => {
        try {
            const savedProfile = localStorage.getItem("profile");
            return savedProfile ? JSON.parse(savedProfile) : {};
        } catch (error) {
            console.error("Failed to load profile", error);
            return {};
        }
    };
    const savedProfile = getSavedProfile();

    // =========================
    // STATES
    // =========================
    const [search, setSearch] = useState("");
    const [notifications, setNotifications] = useState([
        { id: 1, type: "playlist", title: "New playlist generated", desc: "Your 'Late Night Chill' AI vibe is ready.", time: "2 mins ago", read: false },
        { id: 2, type: "trending", title: "Trending songs updated", desc: "Top 50 global viral tracks refreshed.", time: "1 hour ago", read: false },
        { id: 3, type: "ai", title: "AI recommendations ready", desc: "Based on your morning listening pattern.", time: "3 hours ago", read: false },
        { id: 4, type: "friend", title: "Friend liked your playlist", desc: "aarti liked your 'Sunday Coffee' mix.", time: "5 hours ago", read: true }
    ]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };
    const [videos, setVideos] = useState([]);
    const [friendsList, setFriendsList] = useState([]);
    const [friendRequests, setFriendRequests] = useState([
        { id: 101, name: "aakash singh", handle: "@aakash_singh", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
        { id: 102, name: "aditi raj", handle: "@aditi_raj", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" }
    ]);
    const [friendsStatus, setFriendsStatus] = useState({
        "@aakash_singh": "none",
        "@aditi_raj": "none",
        "@aarti_rana": "none"
    });

    const handleSendFriendRequest = (targetUser) => {
        setFriendsStatus(prev => ({
            ...prev,
            [targetUser.handle]: "pending"
        }));

        const requestId = Date.now();
        setFriendRequests(prev => [...prev, { ...targetUser, requestId, status: "pending" }]);

        const newNotif = {
            id: requestId,
            type: "friend_request",
            title: "Friend Request",
            desc: "sent you a friend request",
            sender: targetUser,
            time: "Just now",
            read: false
        };
        setNotifications(prev => [newNotif, ...prev]);
        toast.success(`Sent friend request to ${targetUser.name}!`);
    };

    const handleAcceptFriendRequest = (notificationId, sender) => {
        setFriendsList(prev => [...prev, sender]);
        setFriendsStatus(prev => ({
            ...prev,
            [sender.handle]: "accepted"
        }));
        setFriendRequests(prev => prev.filter(r => r.handle !== sender.handle));
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success(`You are now friends with ${sender.name}! 🤝`, {
            icon: "💚"
        });
    };

    const handleRejectFriendRequest = (notificationId, sender) => {
        setFriendsStatus(prev => ({
            ...prev,
            [sender.handle]: "none"
        }));
        setFriendRequests(prev => prev.filter(r => r.handle !== sender.handle));
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.error(`Declined friend request from ${sender.name}.`);
    };

    const [currentVideo, setCurrentVideo] = useState(null);

    const [loading, setLoading] = useState(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [favorites, setFavorites] = useState([]);
    const [librarySearch, setLibrarySearch] = useState("");
    const [libraryLayout, setLibraryLayout] = useState("grid"); // "grid" or "list"
    const [librarySort, setLibrarySort] = useState("recent"); // "recent", "title", "artist"
    const [emotion, setEmotion] = useState("");

    const [shuffle, setShuffle] = useState(false);

    const [repeat, setRepeat] = useState("off"); // "off", "all", "one"
    const [cameraOpen, setCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraStatus, setCameraStatus] = useState("");
    const [cameraError, setCameraError] = useState("");
    const [emotionDetails, setEmotionDetails] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const [activeView, setActiveViewState] = useState("home");

    const setActiveView = (view) => {
        if (view === "home") navigate("/");
        else if (view === "explore") navigate("/explore");
        else if (view === "library") navigate("/library");
        else if (view === "generator") navigate("/generator");
        else if (view === "feed") navigate("/feed");
        else if (view === "history") navigate("/history");
        else if (view === "artist") {
            setActiveViewState("artist");
        }
    };

    // Synchronize routes with state
    useEffect(() => {
        const path = location.pathname;
        if (path === "/") {
            setActiveViewState("home");
        } else if (path === "/explore") {
            setActiveViewState("explore");
        } else if (path === "/library") {
            setActiveViewState("library");
        } else if (path === "/generator") {
            setActiveViewState("generator");
        } else if (path === "/feed") {
            setActiveViewState("feed");
        } else if (path === "/history") {
            setActiveViewState("history");
        } else if (path.startsWith("/artist/")) {
            const slug = path.split("/artist/")[1];
            if (slug) {
                const artistName = getArtistNameFromSlug(slug);
                setSelectedArtist(artistName);
                setActiveViewState("artist");
            }
        }
    }, [location.pathname]);

    const [selectedExploreGenre, setSelectedExploreGenre] = useState("");
    const [activeHomeSection, setActiveHomeSection] = useState("All");

    const handleCategoryClick = (chip) => {
        if (chip === "All") {
            setSearch("");
            setSelectedExploreGenre("");
            fetchTrendingMusic();
            if (activeView !== "home") {
                setActiveView("home");
                setTimeout(() => {
                    const container = document.getElementById("main-content-scrollable");
                    if (container) container.scrollTo({ top: 0, behavior: "smooth" });
                }, 150);
            } else {
                const container = document.getElementById("main-content-scrollable");
                if (container) container.scrollTo({ top: 0, behavior: "smooth" });
            }
            setActiveHomeSection("All");
        } else if (chip === "Albums") {
            if (activeView !== "home") {
                setActiveView("home");
                setTimeout(() => {
                    const container = document.getElementById("main-content-scrollable");
                    const target = document.getElementById("albums-section");
                    if (container && target) {
                        const containerRect = container.getBoundingClientRect();
                        const targetRect = target.getBoundingClientRect();
                        const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 120;
                        container.scrollTo({ top: scrollOffset, behavior: "smooth" });
                    }
                }, 150);
            } else {
                const container = document.getElementById("main-content-scrollable");
                const target = document.getElementById("albums-section");
                if (container && target) {
                    const containerRect = container.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 120;
                    container.scrollTo({ top: scrollOffset, behavior: "smooth" });
                }
            }
            setActiveHomeSection("Albums");
        } else if (chip === "Podcasts" || chip === "Podcast") {
            if (activeView !== "home") {
                setActiveView("home");
                setTimeout(() => {
                    const container = document.getElementById("main-content-scrollable");
                    const target = document.getElementById("podcasts-section");
                    if (container && target) {
                        const containerRect = container.getBoundingClientRect();
                        const targetRect = target.getBoundingClientRect();
                        const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 120;
                        container.scrollTo({ top: scrollOffset, behavior: "smooth" });
                    }
                }, 150);
            } else {
                const container = document.getElementById("main-content-scrollable");
                const target = document.getElementById("podcasts-section");
                if (container && target) {
                    const containerRect = container.getBoundingClientRect();
                    const targetRect = target.getBoundingClientRect();
                    const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 120;
                    container.scrollTo({ top: scrollOffset, behavior: "smooth" });
                }
            }
            setActiveHomeSection("Podcasts");
        }
    };

    const handleMainScroll = (e) => {
        if (activeView !== "home") return;
        const container = e.currentTarget;
        const containerRect = container.getBoundingClientRect();

        const sections = [
            { id: "all-songs-section", name: "All" },
            { id: "albums-section", name: "Albums" },
            { id: "podcasts-section", name: "Podcasts" }
        ];

        let currentSection = "All";
        let minDistance = Infinity;

        sections.forEach(sec => {
            const el = document.getElementById(sec.id);
            if (el) {
                const rect = el.getBoundingClientRect();
                const distance = Math.abs(rect.top - (containerRect.top + 120));
                const isVisible = rect.top < containerRect.bottom && rect.bottom > containerRect.top;
                if (isVisible && distance < minDistance) {
                    minDistance = distance;
                    currentSection = sec.name;
                }
            }
        });

        if (activeHomeSection !== currentSection) {
            setActiveHomeSection(currentSection);
        }
    };

    const navigateToExplore = (genre) => {
        if (!genre) return;
        setSelectedExploreGenre(genre);
        setSearch(genre);
        searchVideos(genre);
        setActiveView("explore");
        toast.success(`Exploring ${genre} vibes!`);

        // Smooth scroll to matched vibe tracks
        setTimeout(() => {
            const container = document.getElementById("main-content-scrollable");
            const target = document.getElementById("matched-tracks-section");
            if (container && target) {
                const containerRect = container.getBoundingClientRect();
                const targetRect = target.getBoundingClientRect();
                const scrollOffset = targetRect.top - containerRect.top + container.scrollTop - 120;
                container.scrollTo({ top: scrollOffset, behavior: "smooth" });
            }
        }, 200);
    };
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const [fullscreenOpen, setFullscreenOpen] = useState(false);
    const [hideVideo, setHideVideo] = useState(false);
    const [isFullscreenVideo, setIsFullscreenVideo] = useState(true);
    const [showControls, setShowControls] = useState(true);
    const shouldHide = !showControls && isFullscreenVideo && !hideVideo && fullscreenOpen;
    const [autoShare, setAutoShare] = useState(() => {
        try {
            const saved = localStorage.getItem("auto_share_playing");
            return saved ? JSON.parse(saved) : false;
        } catch {
            return false;
        }
    });
    const [userName, setUserName] = useState(savedProfile.name || "User");
    const [userAvatar, setUserAvatar] = useState(savedProfile.avatar || "");
    const [userId, setUserId] = useState(() => {
        try {
            const session = localStorage.getItem("user_session");
            if (session) {
                const parsed = JSON.parse(session);
                if (parsed.userId) return parsed.userId;
            }
            const profile = localStorage.getItem("profile");
            if (profile) {
                const parsed = JSON.parse(profile);
                if (parsed.userId) return parsed.userId;
            }
        } catch { }
        const savedId = localStorage.getItem("guest_user_id");
        if (savedId) return savedId;
        const newId = "guest_" + Math.random().toString(36).substring(2, 10);
        localStorage.setItem("guest_user_id", newId);
        return newId;
    });
    const [deviceOpen, setDeviceOpen] = useState(false);
    const [connectedDevice, setConnectedDevice] = useState("");
    const [deviceStatus, setDeviceStatus] = useState("Playing on this device");

    // Shazam / Voice Assistant Recognizer States
    const [shazamOpen, setShazamOpen] = useState(false);
    const [shazamRecording, setShazamRecording] = useState(false);
    const [shazamStatus, setShazamStatus] = useState("");
    const [shazamResult, setShazamResult] = useState(null);
    const [shazamStream, setShazamStream] = useState(null);
    const shazamAudioChunksRef = useRef([]);
    const shazamMediaRecorderRef = useRef(null);

    // Advanced Voice Assistant states
    const [shazamTranscript, setShazamTranscript] = useState("");
    const [shazamConfirmMatch, setShazamConfirmMatch] = useState(null);
    const [shazamStage, setShazamStage] = useState("idle"); // "idle", "listening", "processing", "searching", "confirm", "error"
    const [shazamConfidence, setShazamConfidence] = useState(1.0);
    const speechRecognitionRef = useRef(null);
    const silenceTimeoutRef = useRef(null);

    // Play increment protection & History Tabs state
    const lastIncrementedSongIdRef = useRef(null);
    const [historyTab, setHistoryTab] = useState("recent"); // "recent", "most", "favorites"

    // Real-Time Activity WebSocket States
    const [liveFriendListening, setLiveFriendListening] = useState([]);
    const [realtimePlaylistUpdates, setRealtimePlaylistUpdates] = useState([]);
    const [socketActivities, setSocketActivities] = useState([]);
    const wsActivityRef = useRef(null);

    const mapActivityEventToFeedItem = (data) => {
        if (!data) return null;

        const activityType = data.activityType || data.type;
        const uId = data.userId || "unknown_user";
        const user = data.user || {};
        const timestamp = data.timestamp || Date.now();

        const diff = Date.now() - timestamp;
        let timeStr = "Just now";
        if (diff > 60000) {
            const mins = Math.floor(diff / 60000);
            timeStr = `${mins} min${mins > 1 ? 's' : ''} ago`;
            if (mins >= 60) {
                const hrs = Math.floor(mins / 60);
                timeStr = `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
            }
        }

        const baseItem = {
            // For FEED_BROADCAST, preserve the original activity.id so deduplication against local state works
            id: data.id || (activityType === "FEED_BROADCAST" ? (data.activity?.id || data.payload?.activity?.id) : null) || timestamp + Math.random(),
            userId: uId,
            time: timeStr,
            likes: data.likes || 0,
            hasLiked: false,
            comments: data.comments || [],
            showComments: false
        };

        if (activityType === "FRIEND_LISTENING" || activityType === "stream") {
            return null; // Stop currently playing songs from appearing as timeline posts
        } else if (activityType === "PLAYLIST_UPDATION" || activityType === "playlist") {
            const playlist = data.playlist || data.payload?.playlist || {};
            return {
                ...baseItem,
                type: "playlist",
                user: {
                    name: user.name || data.username || "Unknown",
                    avatar: user.avatar || data.userAvatar || "",
                    handle: `@${(user.name || data.username || "unknown").toLowerCase().replace(/\s+/g, '_')}`,
                    badge: "Party Curator",
                    badgeColor: "from-amber-500 to-orange-500"
                },
                playlist: {
                    name: playlist.name || data.itemTitle || "Curated Playlist",
                    description: playlist.description || data.itemArtist || "",
                    covers: playlist.covers || (data.itemCover ? [data.itemCover] : []),
                    tracks: playlist.tracks || [],
                    tracksCount: playlist.tracksCount || (playlist.tracks ? playlist.tracks.length : 1)
                }
            };
        } else if (activityType === "FEED_BROADCAST" || activityType === "share") {
            const activity = data.activity || data.payload?.activity || {};
            const innerUser = activity.user || user;
            const song = activity.song || data.song || data.payload?.song || {};
            return {
                ...baseItem,
                type: "share",
                user: {
                    name: innerUser.name || data.username || "Unknown",
                    avatar: innerUser.avatar || data.userAvatar || "",
                    handle: `@${(innerUser.name || data.username || "unknown").toLowerCase().replace(/\s+/g, '_')}`,
                    badge: innerUser.badge || "Zen Master",
                    badgeColor: innerUser.badgeColor || "from-emerald-500 to-teal-500"
                },
                caption: activity.caption || data.itemTitle || "",
                song: {
                    title: song.title || data.itemArtist || "Unknown Song",
                    artist: song.artist || "Unknown Artist",
                    cover_url: song.cover_url || data.itemCover || "",
                    videoId: song.videoId || data.itemVideoId || ""
                }
            };
        } else if (activityType === "SONG_LIKED" || activityType === "like") {
            const song = data.song || data.payload?.song || {};
            return {
                ...baseItem,
                type: "like",
                user: {
                    name: user.name || data.username || "Unknown",
                    avatar: user.avatar || data.userAvatar || "",
                    handle: `@${(user.name || data.username || "unknown").toLowerCase().replace(/\s+/g, '_')}`,
                    badge: "Vibe Curator",
                    badgeColor: "from-pink-500 to-rose-500"
                },
                song: {
                    title: song.title || data.itemTitle || "Unknown Song",
                    artist: song.artist || data.itemArtist || "Unknown Artist",
                    cover_url: song.cover_url || data.itemCover || "",
                    videoId: song.videoId || data.itemVideoId || ""
                }
            };
        }

        return null;
    };

    useEffect(() => {
        const fetchInitialActivities = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/activities`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    const mapped = data.map(mapActivityEventToFeedItem).filter(Boolean);
                    setSocketActivities(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch initial activities:", error);
            }
        };

        fetchInitialActivities();
    }, []);

    useEffect(() => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${API_BASE.replace("http://", "").replace("https://", "")}/api/ws/activity`;
        console.log("Connecting to Activity WebSocket:", wsUrl);

        let socket;
        let reconnectTimeout;
        let connectTimeout;
        let shouldReconnect = true;

        function connect() {
            if (!shouldReconnect) return;

            socket = new WebSocket(wsUrl);
            wsActivityRef.current = socket;

            socket.onopen = () => {
                console.log("Activity WebSocket connected successfully");
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log("Activity WS Event received:", data);

                    if (data.type === "FRIEND_LISTENING") {
                        setLiveFriendListening(prev => {
                            const filtered = prev.filter(f => f.name !== data.user.name);
                            return [
                                {
                                    name: data.user.name,
                                    avatar: data.user.avatar,
                                    song: data.song,
                                    time: "Just now",
                                    timestamp: Date.now()
                                },
                                ...filtered
                            ];
                        });

                        // We only want streaming activities to appear in the live friends sidebar, not post as cards to the feed.
                        // const feedItem = mapActivityEventToFeedItem(data);
                        // if (feedItem) {
                        //     setSocketActivities(prev => [feedItem, ...prev]);
                        // }
                    } else if (data.type === "PLAYLIST_UPDATION") {
                        setRealtimePlaylistUpdates(prev => [
                            {
                                id: data.id || Date.now(),
                                user: data.user,
                                playlist: data.playlist,
                                time: "Just now"
                            },
                            ...prev
                        ]);

                        const feedItem = mapActivityEventToFeedItem(data);
                        if (feedItem) {
                            setSocketActivities(prev => [feedItem, ...prev]);
                        }
                    } else if (data.type === "FEED_BROADCAST") {
                        // Skip own broadcasts — current user already added it via optimistic local state update
                        // This prevents the triple-post: (1) local state, (2) WS echo, (3) DB fetch
                        if (data.userId && data.userId === userId) {
                            console.log("[WS] Skipping own FEED_BROADCAST echo (already added locally). id:", data.activity?.id);
                        } else {
                            const feedItem = mapActivityEventToFeedItem(data);
                            if (feedItem) {
                                setSocketActivities(prev => {
                                    if (prev.some(a => String(a.id) === String(feedItem.id))) return prev;
                                    return [feedItem, ...prev];
                                });
                            }
                        }
                    } else if (data.type === "FEED_DELETE") {
                        setSocketActivities(prev => prev.filter(a => a.id !== data.activityId));
                    } else if (data.type === "SONG_LIKED") {
                        const feedItem = mapActivityEventToFeedItem(data);
                        if (feedItem) {
                            setSocketActivities(prev => [feedItem, ...prev]);
                        }
                    }
                } catch (err) {
                    console.error("Activity WS decode error:", err);
                }
            };

            socket.onclose = () => {
                if (!shouldReconnect) return;

                console.log("Activity WebSocket closed, reconnecting in 5s...");
                reconnectTimeout = setTimeout(connect, 5000);
            };

            socket.onerror = (err) => {
                if (shouldReconnect && socket.readyState !== WebSocket.CLOSING && socket.readyState !== WebSocket.CLOSED) {
                    console.error("Activity WebSocket error:", err);
                }
            };
        }

        connectTimeout = setTimeout(connect, 0);

        return () => {
            shouldReconnect = false;
            clearTimeout(connectTimeout);
            clearTimeout(reconnectTimeout);
            if (wsActivityRef.current === socket) {
                wsActivityRef.current = null;
            }
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, []);

    const broadcastActivityEvent = (payload) => {
        if (wsActivityRef.current && wsActivityRef.current.readyState === WebSocket.OPEN) {
            wsActivityRef.current.send(JSON.stringify(payload));
        }
    };

    // User history state
    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem("listen_history");
            if (!saved) return [];
            const parsed = JSON.parse(saved);
            // Handle backward compatibility: map old flat arrays and structures to the new format
            return parsed.map(item => {
                if (!item) return null;
                const videoObj = item.video || item;
                const videoId = videoObj?.id?.videoId || videoObj?.videoId || item.songId;
                if (!videoId) return null;
                return {
                    songId: videoId,
                    title: videoObj?.snippet?.title || videoObj?.title || item.title || "Unknown Title",
                    artist: videoObj?.snippet?.channelTitle || videoObj?.artist || item.artist || "Unknown Artist",
                    coverImage: videoObj?.snippet?.thumbnails?.high?.url || videoObj?.snippet?.thumbnails?.default?.url || videoObj?.cover_url || item.coverImage || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500",
                    playCount: item.playCount || 1,
                    lastPlayed: item.lastPlayed || item.playedAt || Date.now(),
                    progress: item.progress || 0,
                    video: videoObj
                };
            }).filter(Boolean);
        } catch {
            return [];
        }
    });

    // Search query history states
    const [searchHistory, setSearchHistory] = useState(() => {
        try {
            const saved = localStorage.getItem("search_history");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [searchFocused, setSearchFocused] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState("");
    const openArtistProfile = (artistName) => {
        if (!artistName) return;
        const cleaned = artistName.replace(/\s*-\s*Topic/gi, "").replace(/\s*VEVO/gi, "").trim();
        navigate(`/artist/${getArtistSlug(cleaned)}`);
    };

    // Artist Section Premium States
    const [artistFeedTab, setArtistFeedTab] = useState("new");
    const [followedArtists, setFollowedArtists] = useState(() => {
        try {
            const saved = localStorage.getItem("followed_artists");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const toggleFollowArtist = (artistName) => {
        setFollowedArtists(prev => {
            let next;
            if (prev.includes(artistName)) {
                next = prev.filter(n => n !== artistName);
                toast.success(`Unfollowed ${artistName}`);
            } else {
                next = [...prev, artistName];
                toast.success(`Followed ${artistName}!`);
            }
            localStorage.setItem("followed_artists", JSON.stringify(next));
            return next;
        });
    };

    // Share link loading on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shareData = params.get("share");
        if (shareData) {
            try {
                const decoded = JSON.parse(decodeURIComponent(atob(shareData)));
                if (decoded && decoded.items && decoded.items.length > 0) {
                    setVideos(decoded.items);
                    setCurrentVideo(decoded.items[0]);
                    setActiveView("explore"); // Swap view to showcase shared tracks

                    // We seed a generated structure so players can play
                    queueMicrotask(() => {
                        toast.success(`Loaded Shared Playlist: "${decoded.title}"`);
                        createPlayer(decoded.items[0]?.id?.videoId, false);
                    });
                }
            } catch (err) {
                console.error("Failed to parse shared playlist URL:", err);
                toast.error("Malformed shared playlist link");
            }
        }


    }, []);

    // =====================================================================
    // VOICE ASSISTANT SPEECH RECOGNITION & FUZZY MATCH SYSTEM
    // =====================================================================
    const getSimilarity = (str1, str2) => {
        const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
        const s1 = clean(str1);
        const s2 = clean(str2);
        if (!s1 || !s2) return 0;
        if (s1 === s2) return 1.0;
        if (s1.includes(s2) || s2.includes(s1)) {
            return Math.min(s1.length, s2.length) / Math.max(s1.length, s2.length) * 0.9;
        }
        // Bigram similarity (Dice's coefficient)
        const getBigrams = (str) => {
            const bigrams = new Set();
            for (let i = 0; i < str.length - 1; i++) {
                bigrams.add(str.slice(i, i + 2));
            }
            return bigrams;
        };
        const b1 = getBigrams(s1);
        const b2 = getBigrams(s2);
        let intersection = 0;
        b2.forEach(b => {
            if (b1.has(b)) intersection++;
        });
        return (2.0 * intersection) / (b1.size + b2.size);
    };

    const startShazamScan = async () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
            setShazamStage("error");
            setShazamStatus("Speech recognition is not supported in this browser.");
            setShazamResult({
                status: "no_match",
                message: "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
            });
            return;
        }

        try {
            setShazamStage("listening");
            setShazamStatus("Preparing mic...");
            setShazamTranscript("");
            setShazamConfirmMatch(null);
            setShazamResult(null);
            setShazamConfidence(1.0);

            // Request mic permissions with standard echo & noise suppression filters
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true }
            });
            setShazamStream(stream);

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";
            speechRecognitionRef.current = recognition;

            let finalTranscript = "";
            let interimTranscript = "";
            let confidenceSum = 0;
            let confidenceCount = 0;

            recognition.onstart = () => {
                setShazamRecording(true);
                setShazamStatus("Listening...");
                // Automatically stop recording after 5 seconds of silence
                if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                silenceTimeoutRef.current = setTimeout(() => {
                    recognition.stop();
                }, 5000);
            };

            recognition.onresult = (event) => {
                finalTranscript = "";
                interimTranscript = "";

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalTranscript += result[0].transcript;
                        if (result[0].confidence) {
                            confidenceSum += result[0].confidence;
                            confidenceCount++;
                        }
                    } else {
                        interimTranscript += result[0].transcript;
                    }
                }

                const currentText = (finalTranscript + " " + interimTranscript).trim();
                setShazamTranscript(currentText);
                setShazamStatus("Listening...");

                // Reset 5 seconds silence detection timeout
                if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
                silenceTimeoutRef.current = setTimeout(() => {
                    console.log("Inactivity detected, stopping speech recognition.");
                    recognition.stop();
                }, 5000);
            };

            recognition.onerror = (event) => {
                console.error("Speech Recognition Error:", event.error);
                if (event.error === "not-allowed") {
                    setShazamStage("error");
                    setShazamStatus("Microphone access denied. Please allow mic permission in browser settings.");
                    setShazamResult({
                        status: "no_match",
                        message: "Microphone access denied. Please allow mic permission in browser settings."
                    });
                    toast.error("Microphone permission denied.");
                } else {
                    setShazamStage("error");
                    setShazamStatus(`Recognition error: ${event.error}`);
                    setShazamResult({
                        status: "no_match",
                        message: `Recognition error: ${event.error}`
                    });
                }
            };

            recognition.onend = async () => {
                setShazamRecording(false);
                if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

                // Cleanup mic stream
                if (stream) {
                    stream.getTracks().forEach(track => track.stop());
                }
                setShazamStream(null);

                const rawText = (finalTranscript + " " + interimTranscript).trim();
                const cleanText = rawText
                    .replace(/\s+/g, ' ')
                    .replace(/[^a-zA-Z0-9\s\u0900-\u097F]/g, '')
                    .trim();

                // 5. Ignore short transcripts (less than 2 characters)
                if (cleanText.length < 2) {
                    setShazamStage("error");
                    setShazamStatus("Speak louder. Could not hear any distinct song name.");
                    setShazamResult({
                        status: "no_match",
                        message: "Speak louder. We could not hear any distinct song name or artist name. Please try again."
                    });
                    toast.error("Please try again.");
                    return;
                }

                // 10. Low Confidence Filter (<70%)
                const avgConfidence = confidenceCount > 0 ? (confidenceSum / confidenceCount) : 0.85;
                setShazamConfidence(avgConfidence);
                if (avgConfidence < 0.70) {
                    setShazamStage("error");
                    setShazamStatus("We couldn't hear clearly. Please repeat again.");
                    setShazamResult({
                        status: "no_match",
                        message: "We couldn't hear clearly. Please speak closer to the microphone and repeat again."
                    });
                    toast.error("Please repeat clearly.");
                    return;
                }

                // 9. Searching Stage
                setShazamStage("searching");
                setShazamStatus("Searching database...");

                try {
                    // Fetch tracks database to perform fuzzy match
                    const res = await fetch(`${API_BASE}/api/tracks`);
                    if (!res.ok) throw new Error("Database offline");
                    const dbTracks = await res.json();

                    let bestMatch = null;
                    let bestScore = 0;
                    let matchType = "";

                    // Clean search queries (strip common prefix keywords like play/find/search)
                    let cleanQuery = cleanText.toLowerCase();
                    for (const phrase of ["play song", "play music", "play", "search for", "search", "find song", "find"]) {
                        if (cleanQuery.startsWith(phrase)) {
                            cleanQuery = cleanQuery.slice(phrase.length).trim();
                            break;
                        }
                    }

                    // 8. prioritized Search: match track title first
                    dbTracks.forEach(track => {
                        const score = getSimilarity(cleanQuery, track.title);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMatch = track;
                            matchType = "title";
                        }
                    });

                    // Fallback search: match artist name if title match score is below 40% (0.40)
                    if (bestScore < 0.40) {
                        bestScore = 0;
                        bestMatch = null;
                        dbTracks.forEach(track => {
                            const score = getSimilarity(cleanQuery, track.artist);
                            if (score > bestScore) {
                                bestScore = score;
                                bestMatch = track;
                                matchType = "artist";
                            }
                        });
                    }

                    if (bestMatch && bestScore >= 0.40) {
                        const normalized = normalizeVideoItem(track_to_video_item(bestMatch));
                        setShazamConfirmMatch({
                            songId: bestMatch.id,
                            title: bestMatch.title,
                            artist: bestMatch.artist,
                            coverImage: bestMatch.cover_url,
                            video: normalized
                        });
                        setShazamResult({
                            status: "match",
                            title: bestMatch.title,
                            artist: bestMatch.artist,
                            video: normalized,
                            transcription: cleanQuery,
                            lyrics: `Confidence Score: ${(bestScore * 100).toFixed(0)}%. Found in local database. Enjoy listening!`
                        });
                        setShazamStage("confirm");
                        setShazamStatus("Perfect match found!");
                        toast.success("Match identified!");
                    } else {
                        // Fallback YouTube API search if no database match
                        setShazamStatus("Querying online database...");
                        const ytResponse = await fetch(`${API_BASE}/search?query=${encodeURIComponent(cleanQuery)}`);
                        if (!ytResponse.ok) throw new Error("YouTube search offline");
                        const ytData = await ytResponse.json();
                        const items = ytData.items || [];

                        if (items.length > 0) {
                            const matchedVideo = normalizeVideoItem(items[0]);
                            setShazamConfirmMatch({
                                songId: matchedVideo.id?.videoId || matchedVideo.videoId,
                                title: matchedVideo.snippet?.title,
                                artist: matchedVideo.snippet?.channelTitle,
                                coverImage: matchedVideo.snippet?.thumbnails?.medium?.url || matchedVideo.snippet?.thumbnails?.default?.url,
                                video: matchedVideo
                            });
                            setShazamResult({
                                status: "match",
                                title: matchedVideo.snippet?.title,
                                artist: matchedVideo.snippet?.channelTitle,
                                video: matchedVideo,
                                transcription: cleanQuery,
                                lyrics: "Online match found via search queries. Ready to play."
                            });
                            setShazamStage("confirm");
                            setShazamStatus("Online match found!");
                            toast.success("Match identified!");
                        } else {
                            setShazamStage("error");
                            setShazamStatus("No matching songs found in database or YouTube.");
                            setShazamResult({
                                status: "no_match",
                                message: `Could not find any matching song for "${cleanQuery}" in the database or on YouTube.`
                            });
                            toast.error("Could not resolve this song.");
                        }
                    }

                } catch (err) {
                    console.error("Fuzzy voice matching failed:", err);
                    setShazamStage("error");
                    setShazamStatus("Error connecting to search databases.");
                    setShazamResult({
                        status: "no_match",
                        message: "Error connecting to search databases. Please check your network connection."
                    });
                    toast.error("Search failed.");
                }
            };

            recognition.start();

        } catch (err) {
            console.error("Microphone authorization error:", err);
            setShazamStage("error");
            setShazamStatus("Microphone access denied. Enable mic in your browser.");
            setShazamResult({
                status: "no_match",
                message: "Microphone authorization error. Please check your browser's microphone permissions."
            });
            toast.error("Microphone permission denied.");
        }
    };

    const stopShazamScan = () => {
        if (speechRecognitionRef.current) {
            speechRecognitionRef.current.stop();
        }
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        if (shazamStream) {
            shazamStream.getTracks().forEach(track => track.stop());
        }
        setShazamStream(null);
        setShazamRecording(false);
    };

    // =========================
    // NORMALIZATION HELPERS
    // =========================
    const normalizeVideoItem = (item) => {
        if (!item) return null;

        // Exclude short videos / YouTube shorts / status clips from showing in dashboard/playlist
        const title = (item.snippet?.title || item.title || "").toLowerCase();
        const description = (item.snippet?.description || item.description || "").toLowerCase();
        const channel = (item.snippet?.channelTitle || item.artist || "").toLowerCase();

        const isShort =
            title.includes("#shorts") ||
            title.includes("shorts") ||
            title.includes("short video") ||
            title.includes("short clip") ||
            title.includes("whatsapp status") ||
            title.includes("status video") ||
            title.includes("status") ||
            title.includes("tiktok") ||
            title.includes("reels") ||
            title.includes("15s") ||
            title.includes("30s") ||
            title.includes("30 sec") ||
            title.includes("30 seconds") ||
            title.includes("||") ||
            title.includes("full screen") ||
            title.includes("fullscreen") ||
            channel.includes("creation") ||
            channel.includes("creations") ||
            channel.includes("status") ||
            channel.includes("shorts") ||
            channel.includes("clip") ||
            channel.includes("clips") ||
            description.includes("#shorts") ||
            description.includes("shorts") ||
            description.includes("tiktok") ||
            description.includes("reels") ||
            description.includes("whatsapp status");

        if (isShort) {
            return null;
        }

        const duration = item.duration || item.track?.duration;
        if (duration && duration < 60) {
            return null;
        }

        // 1. Prioritize direct videoId (e.g. from mock playlist tracks or direct shapes)
        if (item?.videoId) {
            return { ...item, id: { videoId: item.videoId } };
        }

        // 2. If it has nested id.videoId, use it
        if (item?.id?.videoId) {
            return { ...item, id: { videoId: item.id.videoId } };
        }

        // 3. YouTube search API sometimes returns item.id as string (videoId)
        if (typeof item?.id === "string") {
            return { ...item, id: { videoId: item.id } };
        }

        return null;
    };

    const normalizeFavorites = (arr) => {
        if (!Array.isArray(arr)) return [];

        const seen = new Set();
        return arr
            .map((v) => {
                if (v?.id?.videoId) return v;
                if (v?.videoId) return { ...v, id: { videoId: v.videoId } };
                return null;
            })
            .filter((v) => {
                if (!v) return false;
                const id = v?.id?.videoId || v?.videoId;
                if (!id || seen.has(id)) return false;
                seen.add(id);
                return true;
            });
    };

    // =========================
    // LOAD FAVORITES
    // =========================
    useEffect(() => {
        // Load favorites after mount.
        // Read-only side effect to avoid cascading renders.
        const saved = localStorage.getItem("favorites");
        if (!saved) return;

        try {
            const parsed = JSON.parse(saved);
            const normalized = normalizeFavorites(parsed);
            // Avoid calling setState during render-effect by using a deferred update.
            // This prevents react-hooks/set-state-in-effect cascading-render warnings.
            queueMicrotask(() => {
                setFavorites((prev) => {
                    const prevJson = JSON.stringify(prev);
                    const nextJson = JSON.stringify(normalized);
                    return prevJson === nextJson ? prev : normalized;
                });
            });
            console.debug("Favorites loaded:", normalized);

        } catch (e) {
            console.error("Failed to load favorites", e);
        }
    }, []);

    useEffect(() => {
        const video = cameraVideoRef.current;
        if (!video || !cameraStream) return;

        video.srcObject = cameraStream;
        video.play().catch((error) => {
            console.error("Camera play error:", error);
            setCameraError("Camera opened, but the preview could not start.");
        });
    }, [cameraStream]);

    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach((track) => track.stop());
            }
        };
    }, [cameraStream]);




    // =========================
    // SAVE FAVORITES
    // =========================
    useEffect(() => {
        try {
            localStorage.setItem("favorites", JSON.stringify(favorites));
            console.debug("Favorites saved:", favorites);
        } catch (e) {
            console.error("Failed to save favorites", e);
        }
    }, [favorites]);

    useEffect(() => {
        try {
            localStorage.setItem(
                "profile",
                JSON.stringify({ name: userName, avatar: userAvatar })
            );
        } catch (error) {
            console.error("Failed to save profile", error);
        }
    }, [userName, userAvatar]);

    useEffect(() => {
        try {
            localStorage.setItem("auto_share_playing", JSON.stringify(autoShare));
        } catch (error) {
            console.error("Failed to save auto_share_playing setting", error);
        }
    }, [autoShare]);

    // =========================
    // FETCH TRENDING MUSIC
    // =========================
    const createPlayer = (videoId, shouldPlay = true, startTime = 0) => {
        if (!videoId) return;

        // Cleanup any existing YT player
        if (playerRef.current) {
            try {
                playerRef.current.destroy();
                playerRef.current = null;
            } catch (error) {
                console.error("Destroy Error:", error);
            }
        }

        // Cleanup any existing local audio player
        if (window.localAudioPlayer) {
            window.localAudioPlayer.pause();
            window.localAudioPlayer = null;
        }

        // Check if it's a mock database track (starts with 'mn-track-')
        if (typeof videoId === "string" && videoId.startsWith("mn-track-")) {
            console.log("Playing local track via HTML5 Audio:", videoId);
            const trackId = parseInt(videoId.replace("mn-track-", ""), 10);

            // Find track metadata from videos or state
            const targetTrack = videos.find(v => v.track?.id === trackId || v.id?.videoId === videoId);
            const audioUrl = targetTrack?.track?.audio_url || `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(trackId % 10) + 1}.mp3`;

            const audio = new Audio(audioUrl);
            audio.volume = volume / 100;
            if (startTime > 0) {
                audio.currentTime = startTime;
            }
            window.localAudioPlayer = audio;

            audio.addEventListener("play", () => {
                setIsPlaying(true);
                handleSongPlaybackStarted(videoId);
            });
            audio.addEventListener("pause", () => setIsPlaying(false));
            audio.addEventListener("ended", () => {
                if (repeat === "one") {
                    audio.currentTime = 0;
                    audio.play();
                } else if (repeat === "all") {
                    queueMicrotask(playNext);
                } else {
                    // repeat === "off"
                    queueMicrotask(() => playNext(true));
                }
            });

            if (shouldPlay) {
                audio.play().catch(err => console.error("HTML5 Audio play failed:", err));
                setIsPlaying(true);
                handleSongPlaybackStarted(videoId);
            }
            return;
        }

        if (!playerContainerRef.current) return;
        if (!window.YT || !window.YT.Player) return;

        playerRef.current = new window.YT.Player(playerContainerRef.current, {
            height: "100%",
            width: "100%",
            videoId,
            playerVars: {
                autoplay: shouldPlay ? 1 : 0,
                controls: 0,
                rel: 0,
                modestbranding: 1,
            },
            events: {
                onReady: (event) => {
                    event.target.setVolume(volume);
                    if (startTime > 0) {
                        event.target.seekTo(startTime, true);
                    }
                    if (shouldPlay) {
                        event.target.playVideo();
                        setIsPlaying(true);
                        handleSongPlaybackStarted(videoId);
                    }
                },
                onStateChange: (event) => {
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setIsPlaying(true);
                        handleSongPlaybackStarted(videoId);
                    }
                    if (event.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
                    if (event.data === window.YT.PlayerState.ENDED) {
                        if (repeat === "one") {
                            event.target.playVideo();
                        } else if (repeat === "all") {
                            queueMicrotask(playNext);
                        } else {
                            // repeat === "off"
                            queueMicrotask(() => playNext(true));
                        }
                    }
                },
            },
        });
    };

    // =========================
    // FETCH TRENDING MUSIC
    // =========================
    const fetchTrendingMusic = async () => {
        try {
            setLoading(true);



            const response = await fetch(`${API_BASE}/trending`);
            const data = await response.json();

            const items = data.items || [];
            const normalized = items.map(normalizeVideoItem).filter(Boolean);

            setVideos(normalized);

            if (normalized.length > 0) {
                setCurrentVideo(normalized[0]);
                setTimeout(() => {
                    createPlayer(normalized[0]?.id?.videoId, false);
                }, 1000);
            }
        } catch (error) {
            console.error("Trending Error:", error);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // AUTOMATICALLY HIDE VIDEO FOR PODCASTS & LOCAL TRACKS
    // =========================
    useEffect(() => {
        if (!currentVideo) return;
        const videoId = currentVideo.id?.videoId || currentVideo.videoId;
        const isLocalTrack = typeof videoId === "string" && videoId.startsWith("mn-track-");

        const title = (currentVideo.snippet?.title || currentVideo.title || "").toLowerCase();
        const channel = (currentVideo.snippet?.channelTitle || currentVideo.artist || "").toLowerCase();
        const genre = (currentVideo.track?.genre || currentVideo.genre || "").toLowerCase();
        const isPodcast = title.includes("podcast") || channel.includes("podcast") || genre.includes("podcast") || search === "Podcasts";

        if (isPodcast || isLocalTrack) {
            setHideVideo(true);
        } else {
            setHideVideo(false);
        }
    }, [currentVideo, search]);



    // =========================
    // MOBILE SIDEBAR AUTO-COLLAPSE
    // =========================
    useEffect(() => {
        if (window.innerWidth < 768) {
            setSidebarOpen(false);
        }
    }, []);



    // =========================
    // LOAD YOUTUBE API
    // =========================
    useEffect(() => {
        const init = async () => {
            if (!window.YT) {
                const tag = document.createElement("script");
                tag.src =
                    "https://www.youtube.com/iframe_api";
                document.body.appendChild(tag);

                window.onYouTubeIframeAPIReady = () => {
                    fetchTrendingMusic();
                };
                return;
            }

            fetchTrendingMusic();
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // =========================
    // DETECT EMOTION
    // =========================
    const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera access is not supported in this browser.");
            return null;
        }

        try {
            setCameraOpen(true);
            setCameraError("");
            setCameraStatus("Requesting camera permission...");

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });

            setCameraStream(stream);
            setCameraStatus("Camera ready. Keep your face in frame and analyze.");
            return stream;
        } catch (error) {
            console.error("Camera Error:", error);
            setCameraError("Camera permission was denied or no camera was found.");
            setCameraStatus("");
            return null;
        }
    };

    const stopCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
        }

        setCameraStream(null);
        setCameraOpen(false);
        setCameraStatus("");
        setCameraError("");
    };

    const captureCameraImage = () => {
        const video = cameraVideoRef.current;
        const canvas = cameraCanvasRef.current;

        if (
            !video ||
            !canvas ||
            video.readyState < 2 ||
            !video.videoWidth ||
            !video.videoHeight
        ) {
            setCameraError("Camera is not ready yet. Try again in a moment.");
            return null;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL("image/jpeg", 0.85);
    };

    const detectEmotion = async () => {
        try {
            setLoading(true);
            setCameraError("");
            setCameraStatus("");

            if (!cameraStream) {
                await startCamera();
                return;
            }

            const image = captureCameraImage();
            if (!image) return;

            setCameraStatus("Analyzing face...");

            const response = await fetch(`${API_BASE}/detect-emotion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.detail || "Emotion detection failed");
            }

            setEmotion(data.emotion);
            setEmotionDetails({
                faceDetected: data.face_detected,
                confidence: data.confidence,
                model: data.model,
                message: data.message,
            });
            setCameraStatus(data.message || "Mood detected.");

            const items = data.music?.items || [];
            const normalized = items.map(normalizeVideoItem).filter(Boolean);

            setVideos(normalized);

            if (normalized.length > 0) {
                setCurrentVideo(normalized[0]);
                createPlayer(normalized[0]?.id?.videoId);
            }
        } catch (error) {
            console.error(error);
            setCameraError(error.message || "Emotion detection failed.");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // UPDATE PLAYER TIME & RECORD PLAYBACK PROGRESS
    // =========================
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current && typeof playerRef.current.getCurrentTime === "function") {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);
                const dur = playerRef.current.getDuration();
                setDuration(dur);

                // Persist current seek progress in history for "Continue Listening"
                if (currentVideo) {
                    const videoId = currentVideo?.id?.videoId || currentVideo?.videoId;
                    if (videoId) {
                        setHistory(prev => {
                            const hasItem = prev.some(item => (item?.video?.id?.videoId || item?.video?.videoId) === videoId);
                            if (!hasItem) return prev;
                            const next = prev.map(item => {
                                if ((item?.video?.id?.videoId || item?.video?.videoId) === videoId) {
                                    return { ...item, progress: time };
                                }
                                return item;
                            });
                            try {
                                localStorage.setItem("listen_history", JSON.stringify(next));
                            } catch { }
                            return next;
                        });
                    }
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [currentVideo]);

    // ==========================================
    // AUTO-HIDE CONTROLS ON INACTIVITY (2 SEC)
    // ==========================================
    useEffect(() => {
        if (!fullscreenOpen) {
            setShowControls(true);
            return;
        }

        let timer;
        const resetTimer = () => {
            setShowControls(true);
            clearTimeout(timer);
            timer = setTimeout(() => {
                setShowControls(false);
            }, 2000);
        };

        // Initial setup
        resetTimer();

        const handleActivity = () => {
            resetTimer();
        };

        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("click", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("touchstart", handleActivity);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("touchstart", handleActivity);
        };
    }, [fullscreenOpen]);

    // =========================
    // SEARCH VIDEOS
    // =========================
    const searchVideos = async (queryOverride) => {
        const query = typeof queryOverride === "string" ? queryOverride : search;
        if (!query.trim()) return;

        // Log search query in recent history
        setSearchHistory(prev => {
            const next = [query.trim(), ...prev.filter(q => q.toLowerCase() !== query.trim().toLowerCase())].slice(0, 10);
            try {
                localStorage.setItem("search_history", JSON.stringify(next));
            } catch { }
            return next;
        });

        try {
            setLoading(true);
            setActiveView("explore");

            const response = await fetch(
                `${API_BASE}/search?query=${encodeURIComponent(query)}`
            );
            const data = await response.json();

            const items = data.items || [];
            const normalized = items.map(normalizeVideoItem).filter(Boolean);

            setVideos(normalized);

            if (normalized.length > 0) {
                setCurrentVideo(normalized[0]);
                createPlayer(normalized[0]?.id?.videoId);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    // =====================================================================
    // UTILITY FUNCTIONS & PLAY TRACKING SYSTEM
    // =====================================================================
    const incrementPlayCount = (songId) => {
        if (!songId) return;
        setHistory(prev => {
            const existingIndex = prev.findIndex(item => item.songId === songId);
            let next;

            // Find video metadata to construct structured song item
            const currentSong = currentVideo;
            let targetVideo = currentSong;
            if (!targetVideo || (targetVideo.id?.videoId !== songId && targetVideo.videoId !== songId)) {
                // Look in history list
                const inHistory = prev.find(item => item.songId === songId);
                if (inHistory) {
                    targetVideo = inHistory.video;
                }
            }
            if (!targetVideo) {
                // Look in favorites
                const inFav = favorites.find(fav => (fav?.id?.videoId || fav?.videoId) === songId);
                if (inFav) {
                    targetVideo = inFav;
                }
            }

            // Fallback normalized check
            const norm = targetVideo ? normalizeVideoItem(targetVideo) : null;
            if (!norm) return prev;

            const title = norm.snippet?.title || norm.title || "Unknown Title";
            const artist = norm.snippet?.channelTitle || norm.artist || "Unknown Artist";
            const coverImage = norm.snippet?.thumbnails?.high?.url || norm.snippet?.thumbnails?.default?.url || norm.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500";

            if (existingIndex !== -1) {
                const existing = prev[existingIndex];
                const updated = {
                    ...existing,
                    songId,
                    title,
                    artist,
                    coverImage,
                    lastPlayed: Date.now(),
                    playCount: (existing.playCount || 0) + 1,
                    video: norm
                };
                next = [updated, ...prev.filter((_, idx) => idx !== existingIndex)];
            } else {
                const newItem = {
                    songId,
                    title,
                    artist,
                    coverImage,
                    lastPlayed: Date.now(),
                    playCount: 1,
                    progress: 0,
                    video: norm
                };
                next = [newItem, ...prev];
            }

            try {
                localStorage.setItem("listen_history", JSON.stringify(next));
            } catch (err) {
                console.error("Failed to save history:", err);
            }
            return next;
        });
    };

    const getMostPlayedSongs = () => {
        return [...history]
            .sort((a, b) => (b.playCount || 0) - (a.playCount || 0))
            .slice(0, 10);
    };

    const getRecentlyPlayedSongs = () => {
        return [...history]
            .sort((a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0));
    };

    const getFavoriteSongs = () => {
        return favorites.map(fav => {
            const videoId = fav?.id?.videoId || fav?.videoId;
            const histItem = history.find(item => item.songId === videoId);
            return {
                songId: videoId,
                title: fav?.snippet?.title || fav?.title || "Unknown Title",
                artist: fav?.snippet?.channelTitle || fav?.artist || "Unknown Artist",
                coverImage: fav?.snippet?.thumbnails?.high?.url || fav?.snippet?.thumbnails?.default?.url || fav?.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500",
                playCount: histItem ? histItem.playCount : 0,
                lastPlayed: histItem ? histItem.lastPlayed : null,
                video: fav
            };
        });
    };

    const handleSongPlaybackStarted = (videoId) => {
        if (!videoId) return;
        if (lastIncrementedSongIdRef.current === videoId) {
            console.debug("Play count already incremented for this playback session:", videoId);
            return;
        }
        lastIncrementedSongIdRef.current = videoId;
        incrementPlayCount(videoId);
    };

    // =========================
    // PLAY VIDEO
    // =========================
    const playVideo = (video, startTime = 0) => {
        const normalized = normalizeVideoItem(video);
        if (!normalized?.id?.videoId) return;

        setCurrentVideo(normalized);
        createPlayer(normalized.id.videoId, true, startTime);

        // Broadcast live listening state over activity WebSocket
        broadcastActivityEvent({
            type: "FRIEND_LISTENING",
            userId: userId,
            user: {
                name: userName || "You",
                avatar: userAvatar || ""
            },
            song: {
                title: normalized.snippet.title,
                artist: normalized.snippet.channelTitle,
                cover_url: normalized.snippet.thumbnails?.high?.url || normalized.snippet.thumbnails?.default?.url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500",
                videoId: normalized.id.videoId
            }
        });

        // Automatically create a post on the activity feed if autoShare is enabled
        if (autoShare) {
            const songInfo = {
                id: `custom-track-${Date.now()}`,
                title: normalized.snippet?.title || normalized.title || "Unknown Title",
                artist: normalized.snippet?.channelTitle || normalized.artist || "Unknown Artist",
                cover_url: normalized.snippet?.thumbnails?.high?.url || normalized.snippet?.thumbnails?.default?.url || normalized.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500",
                videoId: normalized.id?.videoId || normalized.videoId
            };
            const customActivity = {
                id: Date.now(),
                type: "share",
                user: {
                    name: userName || "You",
                    avatar: userAvatar || "",
                    handle: `@${(userName || "user").toLowerCase().replace(/\s+/g, '_')}`,
                    badge: "Curator",
                    badgeColor: "from-indigo-500 to-purple-500"
                },
                time: "Just now",
                caption: `Tuning into: ${normalized.snippet?.title || normalized.title || "this track"}! 🎧✨`,
                song: songInfo,
                likes: 0,
                hasLiked: false,
                comments: [],
                showComments: false
            };
            broadcastActivityEvent({
                type: "FEED_BROADCAST",
                userId: userId,
                activity: customActivity
            });
        }
    };

    // =========================
    // CUSTOM FULLSCREEN MEDIA HELPERS
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

    const handleSeekChange = (e) => {
        const value = parseFloat(e.target.value);
        setCurrentTime(value);
        if (window.localAudioPlayer) {
            window.localAudioPlayer.currentTime = value;
            return;
        }
        playerRef.current?.seekTo(value, true);
    };

    const handleVolumeChange = (e) => {
        const value = parseInt(e.target.value);
        setVolume(value);
        if (window.localAudioPlayer) {
            window.localAudioPlayer.volume = value / 100;
            return;
        }
        if (playerRef.current) {
            playerRef.current.setVolume(value);
        }
    };

    const formatTime = (time) => {
        if (!time) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    };

    const getStableDuration = (vid) => {
        if (vid?.duration) return vid.duration;
        const id = vid?.id?.videoId || vid?.videoId || "";
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const seconds = 150 + Math.abs(hash % 150);
        return seconds;
    };

    // =========================
    // NEXT VIDEO
    // =========================
    function playNext(stopAtEnd = false) {
        if (!currentVideo || videos.length === 0) return;

        if (shuffle) {
            const random = videos[Math.floor(Math.random() * videos.length)];
            playVideo(random);
            return;
        }

        const index = videos.findIndex((v) => (v?.id?.videoId || v?.videoId) === (currentVideo?.id?.videoId || currentVideo?.videoId));
        if (index === -1) return;

        if (stopAtEnd && index === videos.length - 1) {
            setIsPlaying(false);
            if (window.localAudioPlayer) {
                window.localAudioPlayer.pause();
            } else if (playerRef.current && typeof playerRef.current.pauseVideo === "function") {
                playerRef.current.pauseVideo();
            }
            toast("Reached end of playlist", { icon: "🎧" });
            return;
        }

        const nextVideo = videos[(index + 1) % videos.length];
        playVideo(nextVideo);
    }

    // =========================
    // PREVIOUS VIDEO
    // =========================
    function playPrevious() {
        if (!currentVideo || videos.length === 0) return;

        const index = videos.findIndex((v) => v?.id?.videoId === currentVideo?.id?.videoId);
        const prevVideo = videos[(index - 1 + videos.length) % videos.length];
        playVideo(prevVideo);
    }

    // =========================
    // FAVORITES
    // =========================
    const addToFavorites = (video) => {
        const videoId = video?.id?.videoId || video?.videoId;
        if (!videoId) return;

        // Ensure we normalize the video object we add so it matches the standard schema
        const normalizedVideo = video.id?.videoId
            ? video
            : { ...video, id: { videoId: videoId } };

        const exists = favorites.some((v) => (v?.id?.videoId || v?.videoId) === videoId);
        if (!exists) {
            console.debug("Add to favorites clicked:", normalizedVideo);
            setFavorites((prev) => {
                const alreadyExists = prev.some((v) => (v?.id?.videoId || v?.videoId) === videoId);
                if (alreadyExists) return prev;
                return [...prev, normalizedVideo];
            });

            // Broadcast real-time SONG_LIKED event!
            broadcastActivityEvent({
                type: "SONG_LIKED",
                userId: userId,
                user: {
                    name: userName || "You",
                    avatar: userAvatar || ""
                },
                song: {
                    title: normalizedVideo.snippet?.title || normalizedVideo.title || "Unknown Title",
                    artist: normalizedVideo.snippet?.channelTitle || normalizedVideo.artist || "Unknown Artist",
                    cover_url: normalizedVideo.snippet?.thumbnails?.high?.url || normalizedVideo.snippet?.thumbnails?.default?.url || normalizedVideo.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500",
                    videoId: videoId
                }
            });
        } else {
            console.debug("Already favorited:", normalizedVideo);
        }
    };

    const removeFavorite = (videoId) => {
        console.debug("Remove favorite clicked:", videoId);
        setFavorites((prev) => prev.filter((v) => (v?.id?.videoId || v?.videoId) !== videoId));
    };

    const isFavorited = currentVideo
        ? favorites.some((v) => v?.id?.videoId === currentVideo?.id?.videoId)
        : false;

    const filteredFavorites = favorites
        .filter((video) => {
            if (!librarySearch) return true;
            const title = (video?.snippet?.title || video?.title || "").toLowerCase();
            const artist = (video?.snippet?.channelTitle || video?.artist || "").toLowerCase();
            return title.includes(librarySearch.toLowerCase()) || artist.includes(librarySearch.toLowerCase());
        })
        .sort((a, b) => {
            if (librarySort === "title") {
                const titleA = (a?.snippet?.title || a?.title || "").toLowerCase();
                const titleB = (b?.snippet?.title || b?.title || "").toLowerCase();
                return titleA.localeCompare(titleB);
            }
            if (librarySort === "artist") {
                const artistA = (a?.snippet?.channelTitle || a?.artist || "").toLowerCase();
                const artistB = (b?.snippet?.channelTitle || b?.artist || "").toLowerCase();
                return artistA.localeCompare(artistB);
            }
            return 0;
        });

    const mainVideos = activeView === "library" ? favorites : activeView === "history" ? history.map(item => item.video) : videos;
    const mainTitle =
        activeView === "library"
            ? "Library"
            : activeView === "explore"
                ? "Explore"
                : activeView === "generator"
                    ? "AI Song Studio"
                    : activeView === "feed"
                        ? "Activity Feed"
                        : activeView === "history"
                            ? "Listening History"
                            : "Hindi songs";
    const emptyMessage =
        activeView === "library"
            ? "Your saved favorites will appear here."
            : activeView === "history"
                ? "Your listening history is empty. Start playing some vibes!"
                : "No videos found yet.";
    const navItemClass = (view) =>
        `w-full h-[68px] rounded-2xl flex flex-col items-center justify-center gap-1.5 text-[11px] font-bold transition duration-300 ${activeView === view ? "bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]" : "text-zinc-400 hover:bg-white/5 hover:text-white hover:scale-105"
        }`;
    const mobileNavItemClass = (view) =>
        `w-full py-3.5 px-5 rounded-xl flex items-center gap-4 text-sm font-bold transition duration-300 ${activeView === view ? "bg-gradient-to-r from-[#7c3aed] to-[#ec4899] text-white shadow-[0_4px_15px_rgba(236,72,153,0.3)] font-extrabold scale-102" : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`;
    const chips = [
        "All",
        "Albums",
        "Podcasts",
        "New",
        "Feel good",
        "Relax",
        "Party",
        "Sad",
        "Energise",
        "Sleep",
        "Work out",
        "Commute",
        "Focus",
    ];
    const scrollCards = (direction) => {
        cardsRailRef.current?.scrollBy({
            left: direction * 520,
            behavior: "smooth",
        });
    };
    const handleAvatarUpload = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please choose an image file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setUserAvatar(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };
    const connectBluetoothDevice = async () => {
        if (!navigator.bluetooth?.requestDevice) {
            setDeviceStatus("Bluetooth device picker is not supported in this browser.");
            return;
        }

        try {
            setDeviceStatus("Searching for nearby Bluetooth devices...");
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
            });

            setConnectedDevice(device.name || "Bluetooth device");
            setDeviceStatus(
                `Connected to ${device.name || "Bluetooth device"}. Use Windows sound settings to route audio if needed.`
            );
        } catch (error) {
            console.error("Bluetooth connection error:", error);
            setDeviceStatus("Device connection was cancelled or failed.");
        }
    };

    // =========================
    // RENDER
    // =========================
    const userSession = localStorage.getItem("user_session");

    // =========================
    // DYNAMIC SONG LISTENERS CALCULATIONS
    // =========================
    const activeVideoId = currentVideo?.id?.videoId || currentVideo?.videoId || currentVideo?.id || "";
    const seed = activeVideoId ? activeVideoId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    const songListenersCount = activeVideoId ? Math.floor((seed % 850) + 150) : 684;
    const listenerPercent = Math.min(99, Math.max(40, Math.floor((songListenersCount / 1000) * 100)));

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/*"
                element={
                    userSession ? (
                        <div className="h-screen w-screen overflow-hidden text-white flex flex-col font-sans relative bg-linear-to-br from-black via-purple-950 to-pink-900">
                            {/* Beautiful Ambient Background Glows (Matching the uploaded image) */}
                            <div className="absolute inset-0 pointer-events-none z-0">
                                {/* Top-left vibrant pink/purple glow */}
                                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-[#d946ef]/15 blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
                                {/* Top-right bright cyan/teal glow */}
                                <div className="absolute -top-40 right-[10%] w-[500px] h-[500px] rounded-full bg-[#06b6d4]/12 blur-[130px]" />
                                {/* Bottom-left emerald/green glow */}
                                <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] rounded-full bg-[#10b981]/10 blur-[140px]" />
                                {/* Bottom-right glowing neon purple */}
                                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/15 blur-[120px] animate-pulse" style={{ animationDuration: '7s' }} />
                            </div>
                            <div className="h-full w-full flex flex-col relative z-10">
                                {/* HEADER */}
                                <header className="min-h-[76px] px-4 py-3 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-5 w-full relative">
                                    <button
                                        onClick={() => setSidebarOpen((open) => !open)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full text-zinc-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 shrink-0"
                                        title="Toggle navigation"
                                    >
                                        <Menu size={28} />
                                    </button>

                                    <button
                                        onClick={() => setActiveView("home")}
                                        className="flex items-center gap-2 shrink-0 transition-transform active:scale-95 duration-200"
                                    >
                                        <img
                                            src={madLogo}
                                            alt="MAD Music Logo"
                                            className="w-24 h-24 object-contain drop-shadow-[0_2px_14px_rgba(168,85,247,0.6)] hover:scale-105 transition-transform duration-300"
                                        />
                                        <span className="text-xl sm:text-2xl font-black tracking-tight bg-linear-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                                            MAD Music VibeTune AI
                                        </span>
                                    </button>

                                    <div className="order-last w-full md:order-0 md:flex-1 md:w-[65%] md:max-w-5xl flex items-center gap-3">
                                        <div
                                            className="relative flex-1 group transition-all duration-300"
                                            onFocus={() => setSearchFocused(true)}
                                            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                                        >
                                            <div className="relative w-full h-16 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 focus-within:border-purple-500/50 focus-within:ring-2 focus-within:ring-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex items-center transition-all duration-300">
                                                <Search
                                                    size={21}
                                                    className="pointer-events-none absolute left-5 text-zinc-300 group-focus-within:text-purple-400 transition-colors duration-300"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Search songs, albums, artists, podcasts"
                                                    value={search}
                                                    onChange={(e) => setSearch(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && searchVideos()}
                                                    style={{ paddingLeft: "4rem" }}
                                                    className="w-full h-full bg-transparent pr-5 text-base sm:text-lg font-semibold text-white placeholder:text-zinc-400 outline-none"
                                                />
                                            </div>

                                            {/* Floating Search History Dropdown */}
                                            {searchFocused && searchHistory.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-950/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 space-y-3">
                                                    <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                                        <span>Recent Searches</span>
                                                        <button
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setSearchHistory([]);
                                                                localStorage.removeItem("search_history");
                                                                toast.success("Search history cleared.");
                                                            }}
                                                            className="hover:text-red-400 transition"
                                                        >
                                                            Clear All
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {searchHistory.map((query, idx) => (
                                                            <button
                                                                key={idx}
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setSearch(query);
                                                                    searchVideos(query);
                                                                }}
                                                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white transition flex items-center gap-1.5"
                                                            >
                                                                <span>🔍</span>
                                                                <span>{query}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShazamOpen(true);
                                                setShazamResult(null);
                                                setShazamStatus("Ready for voice search.");
                                            }}
                                            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.15)] shrink-0"
                                            title="Search via Voice Identify"
                                        >
                                            <Mic size={22} className="text-cyan-400" />
                                        </button>

                                        <div className="relative shrink-0 z-50">
                                            <button
                                                onClick={() => {
                                                    setShowNotifications(!showNotifications);
                                                    if (!showNotifications) markAllAsRead();
                                                }}
                                                className="relative w-14 h-14 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-purple-500/20 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)] flex items-center justify-center text-zinc-200 hover:text-purple-300 transition-all duration-300 shrink-0 cursor-pointer"
                                                title="Notifications"
                                            >
                                                <Bell size={22} />
                                                {unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-pink-500 text-white text-xs font-bold flex items-center justify-center animate-pulse">
                                                        {unreadCount}
                                                    </span>
                                                )}
                                            </button>

                                            {showNotifications && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                    className="absolute right-0 top-18 w-[340px] rounded-2xl bg-[#120018]/90 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_rgba(168,85,247,0.2)] p-4 z-50"
                                                >
                                                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                                        <span className="text-sm font-bold text-white flex items-center gap-1.5">
                                                            <Bell size={14} className="text-purple-400" />
                                                            Notifications
                                                        </span>
                                                        {notifications.length > 0 && (
                                                            <button
                                                                onClick={() => setNotifications([])}
                                                                className="text-[10px] uppercase font-black tracking-widest text-zinc-400 hover:text-red-400 transition"
                                                            >
                                                                Clear
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="space-y-1.5 max-h-75 overflow-y-auto">
                                                        {notifications.length === 0 ? (
                                                            <div className="text-center py-6 text-zinc-500 text-xs">
                                                                No new activities
                                                            </div>
                                                        ) : (
                                                            notifications.map((n) => {
                                                                if (n.type === "friend_request") {
                                                                    return (
                                                                        <div
                                                                            key={n.id}
                                                                            className="flex flex-col gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5 transition-all duration-300 hover:bg-white/8"
                                                                        >
                                                                            <div className="flex items-start gap-3">
                                                                                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/10 bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                                                                                    {n.sender.avatar ? (
                                                                                        <img src={n.sender.avatar} alt="" className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        n.sender.name.slice(0, 1).toUpperCase()
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0 text-left">
                                                                                    <h4 className="text-xs font-bold text-white truncate">{n.sender.name}</h4>
                                                                                    <p className="text-[10px] text-zinc-400 mt-0.5 font-medium leading-relaxed">{n.desc}</p>
                                                                                    <span className="text-[9px] text-zinc-500 font-bold block mt-1">{n.time}</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <button
                                                                                    onClick={() => handleAcceptFriendRequest(n.id, n.sender)}
                                                                                    className="flex-grow py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-[10px] font-black uppercase tracking-wider shadow-md hover:scale-102 transition cursor-pointer"
                                                                                >
                                                                                    Accept
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleRejectFriendRequest(n.id, n.sender)}
                                                                                    className="px-3 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-wider border border-white/5 transition cursor-pointer"
                                                                                >
                                                                                    Reject
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                }
                                                                let Icon = Sparkles;
                                                                let iconColor = "text-purple-400 bg-purple-500/10";
                                                                if (n.type === "trending") {
                                                                    Icon = Music;
                                                                    iconColor = "text-cyan-400 bg-cyan-500/10";
                                                                } else if (n.type === "friend") {
                                                                    Icon = Heart;
                                                                    iconColor = "text-pink-400 bg-pink-500/10";
                                                                } else if (n.type === "ai") {
                                                                    Icon = Sparkles;
                                                                    iconColor = "text-yellow-400 bg-yellow-500/10";
                                                                }
                                                                return (
                                                                    <div
                                                                        key={n.id}
                                                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 cursor-pointer border-b border-white/[0.02] last:border-0"
                                                                    >
                                                                        <div className={`p-2 rounded-lg shrink-0 ${iconColor}`}>
                                                                            <Icon size={16} />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0 text-left">
                                                                            <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                                                                            <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 font-medium leading-relaxed">{n.desc}</p>
                                                                            <span className="text-[9px] text-zinc-500 font-bold block mt-1">{n.time}</span>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={searchVideos}
                                        className="hidden bg-white/10 px-7 py-8 rounded-lg hover:bg-white/15"
                                    >
                                        Search
                                    </button>

                                    <div className="flex items-center gap-10 sm:gap-4 ml-auto">
                                        {/* <button
                                            onClick={() => setDeviceOpen(true)}
                                            className="w-10 h-10 hidden md:flex items-center justify-center rounded-full text-zinc-200 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
                                            title="Connect to a device"
                                        >
                                            <Cast size={27} />
                                        </button> */}
                                        <button
                                            onClick={() => setProfileOpen(true)}
                                            className="h-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] px-4 flex items-center gap-2 font-bold hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 border border-white/10 shrink-0"
                                            title="Open user profile"
                                        >
                                            {userAvatar ? (
                                                <img
                                                    src={userAvatar}
                                                    alt=""
                                                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                                                />
                                            ) : (
                                                <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-xs">
                                                    {userName.slice(0, 1).toUpperCase()}
                                                </span>
                                            )}
                                            <span className="text-xs">{userName || "User"}</span>
                                        </button>

                                    </div>
                                </header>

                                {profileOpen && (
                                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            className="w-full max-w-4xl rounded-3xl bg-zinc-950 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row min-h-[550px] relative"
                                        >
                                            {/* Gradient Ambient Orbs */}
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
                                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                                            {/* LEFT PANEL: PROFILE MANAGEMENT (1/3 width on desktop) */}
                                            <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 p-6 sm:p-8 flex flex-col justify-between shrink-0 bg-white/1 relative z-10">
                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between">
                                                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                                                            <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                                                            Vibe Profile
                                                        </h2>
                                                        <button
                                                            onClick={() => setProfileOpen(false)}
                                                            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>

                                                    <div className="flex flex-col items-center text-center space-y-4 py-4">
                                                        <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500/40 shadow-xl flex items-center justify-center bg-zinc-900">
                                                            {userAvatar ? (
                                                                <img
                                                                    src={userAvatar}
                                                                    alt=""
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                                />
                                                            ) : (
                                                                <span className="text-3xl font-black text-white">
                                                                    {userName.slice(0, 1).toUpperCase()}
                                                                </span>
                                                            )}
                                                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 text-xs font-bold text-white cursor-pointer">
                                                                Upload
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={handleAvatarUpload}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-white tracking-tight">{userName}</p>
                                                            <p className="text-xs text-purple-400 font-extrabold uppercase tracking-widest mt-1">Premium Listener</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="block space-y-2">
                                                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Edit Display Name</span>
                                                            <input
                                                                value={userName}
                                                                onChange={(event) => setUserName(event.target.value)}
                                                                className="w-full h-11 bg-white/5 border border-white/5 rounded-xl px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-purple-500/50 transition"
                                                                placeholder="User name"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pt-6 border-t border-white/5">
                                                    <button
                                                        onClick={() => {
                                                            setProfileOpen(false);
                                                            setActiveView("library");
                                                        }}
                                                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs tracking-wide uppercase transition active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        Open Favorites
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            localStorage.removeItem("user_session");
                                                            localStorage.removeItem("user_token");
                                                            setProfileOpen(false);
                                                            toast.success("Signed out successfully.");
                                                            window.location.reload();
                                                        }}
                                                        className="w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 rounded-xl font-bold text-xs tracking-wide uppercase transition active:scale-95"
                                                    >
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>

                                            {/* RIGHT PANEL: ANALYTICS & CHARTS DASHBOARD */}
                                            <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[90vh] md:max-h-none relative z-10 bg-black/20">
                                                <div>
                                                    <h3 className="text-2xl font-black text-white tracking-tight">Listener Dashboard</h3>
                                                    <p className="text-xs text-zinc-400 mt-1">Real-time statistics and curation parameters based on your active playback sessions.</p>
                                                </div>

                                                {/* ROW 1: LISTENING HOURS, SONG LISTENERS & ENGAGEMENT PILLS */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Listening Time</p>
                                                            <p className="text-2xl lg:text-3xl font-black text-white">124.8 <span className="text-xs font-semibold text-zinc-400">Hrs</span></p>
                                                            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-1">
                                                                <span>▲ +12.4%</span>
                                                            </p>
                                                        </div>
                                                        {/* Progress Ring SVG */}
                                                        <div className="w-12 h-12 shrink-0 relative flex items-center justify-center">
                                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                                <path className="text-white/5" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                                <path className="text-purple-500" strokeDasharray="82, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                            </svg>
                                                            <span className="absolute text-[9px] font-black text-white">82%</span>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Songs Listend</p>
                                                            <p className="text-2xl lg:text-3xl font-black text-white">
                                                                {songListenersCount.toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-pink-400 font-bold flex items-center gap-1 mt-1">
                                                                <span>Active Now</span>
                                                            </p>
                                                        </div>
                                                        {/* Progress Ring SVG */}
                                                        <div className="w-12 h-12 shrink-0 relative flex items-center justify-center">
                                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                                <path className="text-white/5" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                                <path
                                                                    className="text-pink-500"
                                                                    strokeDasharray={`${listenerPercent}, 100`}
                                                                    strokeWidth="3.5"
                                                                    strokeLinecap="round"
                                                                    stroke="currentColor"
                                                                    fill="none"
                                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                                />
                                                            </svg>
                                                            <span className="absolute text-[9px] font-black text-white">
                                                                {listenerPercent}%
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                                                        <div className="space-y-1">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Engagement Rate</p>
                                                            <p className="text-2xl lg:text-3xl font-black text-white">94.2%</p>
                                                            <p className="text-xs text-cyan-400 font-bold flex items-center gap-1 mt-1">
                                                                <span>Super Active</span>
                                                            </p>
                                                        </div>
                                                        {/* Progress Ring SVG */}
                                                        <div className="w-12 h-12 shrink-0 relative flex items-center justify-center">
                                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                                <path className="text-white/5" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                                <path className="text-cyan-400" strokeDasharray="94, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                            </svg>
                                                            <span className="absolute text-[9px] font-black text-white">94%</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ROW 2: ACTIVE USERS DENSITY CHART (SVG Vector Line Graph) */}
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Collaborative Listener Density</p>
                                                        <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">Vibe Stats</span>
                                                    </div>
                                                    {/* Vector SVG Line Chart */}
                                                    <div className="relative h-24 w-full">
                                                        <svg className="w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
                                                            {/* Chart Grid Lines */}
                                                            <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                                            <line x1="0" y1="50" x2="400" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                                            <line x1="0" y1="80" x2="400" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                                                            {/* Graph Area Gradient fill */}
                                                            <defs>
                                                                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                                                                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                                                                </linearGradient>
                                                            </defs>
                                                            <path d="M0,100 L0,70 Q40,30 80,45 Q120,60 160,20 Q200,-10 240,40 Q280,90 320,30 Q360,5 400,15 L400,100 Z" fill="url(#chartGlow)" />

                                                            {/* Smooth Spline Vector Path */}
                                                            <path d="M0,70 Q40,30 80,45 Q120,60 160,20 Q200,-10 240,40 Q280,90 320,30 Q360,5 400,15" fill="none" stroke="#00f3ff" strokeWidth="2.5" strokeLinecap="round" />

                                                            {/* Dynamic Indicator circles */}
                                                            <circle cx="160" cy="20" r="4.5" fill="#fff" stroke="#06b6d4" strokeWidth="2" />
                                                            <circle cx="240" cy="40" r="3" fill="#00f3ff" />
                                                        </svg>
                                                        <span className="absolute top-1 left-[38%] text-[9px] font-black uppercase tracking-wider text-white bg-cyan-600 px-1.5 py-0.5 rounded shadow">Peak Traffic: 124 Peers</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-widest text-zinc-600">
                                                        <span>09:00 AM</span>
                                                        <span>01:00 PM</span>
                                                        <span>06:00 PM</span>
                                                        <span>10:00 PM</span>
                                                    </div>
                                                </div>

                                                {/* ROW 3: TOP GENRES (Horizontal bar charts) */}
                                                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Top Curated Vibe Genres</p>

                                                    <div className="space-y-3.5">
                                                        {/* Genre Item 1 */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs font-semibold">
                                                                <span className="text-zinc-200">Bollywood Romantic</span>
                                                                <span className="text-zinc-400 font-extrabold">42% Share</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: "42%" }}></div>
                                                            </div>
                                                        </div>

                                                        {/* Genre Item 2 */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs font-semibold">
                                                                <span className="text-zinc-200">EDM / Dance Party</span>
                                                                <span className="text-zinc-400 font-extrabold">28% Share</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-linear-to-r from-pink-500 to-rose-500 rounded-full" style={{ width: "28%" }}></div>
                                                            </div>
                                                        </div>

                                                        {/* Genre Item 3 */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs font-semibold">
                                                                <span className="text-zinc-200">Lo-Fi / Slowed Reverb</span>
                                                                <span className="text-zinc-400 font-extrabold">18% Share</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-linear-to-r from-rose-500 to-cyan-500 rounded-full" style={{ width: "18%" }}></div>
                                                            </div>
                                                        </div>

                                                        {/* Genre Item 4 */}
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs font-semibold">
                                                                <span className="text-zinc-200">Indie Pop / Alternate</span>
                                                                <span className="text-zinc-400 font-extrabold">12% Share</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                                <div className="h-full bg-linear-to-r from-cyan-500 to-teal-500 rounded-full" style={{ width: "12%" }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {deviceOpen && (
                                    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                                        <div className="w-full max-w-md rounded-lg bg-zinc-950 border border-white/10 shadow-2xl">
                                            <div className="p-5 border-b border-white/10 flex items-center justify-between">
                                                <h2 className="text-xl font-bold">Connect to a device</h2>
                                                <button
                                                    onClick={() => setDeviceOpen(false)}
                                                    className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            <div className="p-5 space-y-4">
                                                <button
                                                    onClick={() => {
                                                        setConnectedDevice("");
                                                        setDeviceStatus("Playing on this device");
                                                    }}
                                                    className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/15 text-left"
                                                >
                                                    <p className="font-bold">This device</p>
                                                    <p className="text-sm text-zinc-400">Browser audio output</p>
                                                </button>

                                                <button
                                                    onClick={connectBluetoothDevice}
                                                    className="w-full p-4 rounded-lg bg-white/10 hover:bg-white/15 text-left"
                                                >
                                                    <p className="font-bold">Bluetooth device</p>
                                                    <p className="text-sm text-zinc-400">Search nearby devices</p>
                                                </button>

                                                <div className="rounded-lg border border-white/10 p-4">
                                                    <p className="text-sm text-zinc-400">Status</p>
                                                    <p className="font-semibold mt-1">
                                                        {connectedDevice || "This device"}
                                                    </p>
                                                    <p className="text-sm text-zinc-500 mt-2">{deviceStatus}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* SHAZAM VOICE SEARCH MODAL */}
                                {shazamOpen && (
                                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                                        <div className="w-full max-w-2xl rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-100">

                                            {/* LEFT SIDE: RADAR WAVES & CONTROLS */}
                                            <div className="flex-1 p-6 flex flex-col justify-between items-center text-center bg-white/2 border-r border-white/5">
                                                <div className="w-full flex items-center justify-between border-b border-white/5 pb-3">
                                                    <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                                                        Voice Assistant
                                                    </h3>
                                                    <button
                                                        onClick={() => {
                                                            stopShazamScan();
                                                            setShazamOpen(false);
                                                        }}
                                                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>

                                                {/* PULSING SCI-FI SOUNDWAVE RADAR */}
                                                <div className="relative my-8 flex items-center justify-center">
                                                    {shazamRecording ? (
                                                        <>
                                                            {/* Animated concentric rings */}
                                                            <div className="absolute w-36 h-36 border border-purple-500/30 rounded-full animate-[ping_2s_infinite]"></div>
                                                            <div className="absolute w-28 h-28 border border-cyan-500/40 rounded-full animate-[ping_1.5s_infinite_delay-200ms]"></div>
                                                            <div className="absolute w-20 h-20 bg-linear-to-r from-purple-500 to-cyan-600 rounded-full blur-md opacity-40 animate-pulse"></div>
                                                        </>
                                                    ) : null}

                                                    <button
                                                        onClick={shazamRecording ? stopShazamScan : startShazamScan}
                                                        className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 ${shazamRecording
                                                            ? "bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.6)]"
                                                            : "bg-linear-to-tr from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 shadow-[0_0_20px_rgba(161,36,255,0.4)] hover:scale-105"
                                                            }`}
                                                    >
                                                        <Mic size={38} className={`text-white ${shazamRecording ? "animate-bounce" : ""}`} />
                                                    </button>
                                                </div>

                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-white tracking-wide uppercase">
                                                        {shazamRecording ? "Listening closely..." : "Spoken Search"}
                                                    </p>
                                                    <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed font-semibold">
                                                        {shazamStatus}
                                                    </p>
                                                </div>

                                                <div className="w-full pt-4">
                                                    {!shazamRecording ? (
                                                        <button
                                                            onClick={startShazamScan}
                                                            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 font-extrabold text-white text-xs tracking-widest rounded-lg uppercase shadow-lg transition"
                                                        >
                                                            Record Request
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={stopShazamScan}
                                                            className="w-full py-2.5 bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs tracking-widest rounded-lg uppercase shadow-lg transition animate-pulse"
                                                        >
                                                            Stop Recording
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* RIGHT SIDE: SONG MATCH RESULT DETAILS */}
                                            <div className="flex-1 p-6 flex flex-col justify-between bg-zinc-950">
                                                {shazamResult ? (
                                                    shazamResult.status === "no_match" ? (
                                                        <div className="h-full flex flex-col justify-center items-center text-center space-y-4">
                                                            <div className="text-4xl">🔎📭</div>
                                                            <h4 className="font-extrabold text-lg text-white">No Song Found</h4>
                                                            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed font-semibold">
                                                                {shazamResult.message}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex flex-col justify-between space-y-5">
                                                            <div className="space-y-4">
                                                                <div className="flex gap-4 items-center">
                                                                    <img
                                                                        src={shazamResult.video?.snippet?.thumbnails?.medium?.url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60"}
                                                                        alt=""
                                                                        className="w-20 h-20 rounded-lg object-cover bg-zinc-900 border border-white/5"
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">
                                                                            Voice Match
                                                                        </span>
                                                                        <h4 className="font-black text-lg text-white truncate mt-1">{shazamResult.title}</h4>
                                                                        <p className="text-xs text-zinc-400 truncate mt-0.5 font-semibold">Channel: {shazamResult.artist}</p>
                                                                        <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-semibold">Spoken: "{shazamResult.transcription}"</p>
                                                                    </div>
                                                                </div>

                                                                {shazamResult.lyrics ? (
                                                                    <div>
                                                                        <h5 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Search Metadata</h5>
                                                                        <div className="h-40 overflow-y-auto bg-white/[0.02] border border-white/5 rounded-xl p-3 text-xs leading-relaxed text-zinc-300 font-semibold scrollbar-thin [scrollbar-color:rgba(255,255,255,0.15)_transparent] whitespace-pre-wrap">
                                                                            {shazamResult.lyrics}
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center text-zinc-500 text-xs font-semibold">
                                                                        Details are not available for this song.
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex gap-3">
                                                                {shazamResult.video && (
                                                                    <button
                                                                        onClick={() => {
                                                                            const videoItem = shazamResult.video;
                                                                            playVideo(videoItem);
                                                                            setShazamOpen(false);
                                                                            toast.success(`Playing voice matched track: "${shazamResult.title}"!`);
                                                                        }}
                                                                        className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-cyan-600 hover:from-purple-600 hover:to-cyan-700 text-white font-extrabold text-xs tracking-wider rounded-xl uppercase transition active:scale-95 flex items-center justify-center gap-2"
                                                                    >
                                                                        Play Instantly
                                                                    </button>
                                                                )}
                                                                {shazamResult.youtube_url && (
                                                                    <a
                                                                        href={shazamResult.youtube_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl flex items-center justify-center transition"
                                                                        title="View on YouTube"
                                                                    >
                                                                        <ExternalLink size={16} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="h-full flex flex-col justify-center items-center text-center space-y-4 text-zinc-500">
                                                        <div className="text-5xl animate-bounce">🎙️⚡</div>
                                                        <h4 className="font-extrabold text-sm text-zinc-400">Speak the Song Name</h4>
                                                        <p className="text-xs text-zinc-500 max-w-xs leading-relaxed font-semibold">
                                                            Click Record Request, speak the name of any song or artist , and we will instantly find and play it for you!
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                )}







                                {/* MOBILE SIDEBAR / SLIDEBAR DRAWER */}
                                {sidebarOpen && (
                                    <div
                                        className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm transition-opacity duration-300"
                                        onClick={() => setSidebarOpen(false)}
                                    >
                                        <div
                                            className="w-[280px] h-full bg-zinc-950/95 backdrop-blur-md border-r border-white/10 flex flex-col pt-6 pb-8 shadow-2xl relative transition-transform duration-300 ease-out transform translate-x-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-between px-6 pb-6 border-b border-white/5 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <img src={madLogo} alt="MAD Music Logo" className="w-14 h-14 object-contain" />
                                                    <span className="text-lg font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">MAD Music VibeTune AI</span>
                                                </div>
                                                <button
                                                    onClick={() => setSidebarOpen(false)}
                                                    className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>

                                            <ul className="w-full space-y-2 px-3 flex-1">
                                                <li>
                                                    <button
                                                        onClick={() => { setActiveView("home"); setSidebarOpen(false); }}
                                                        className={mobileNavItemClass("home")}
                                                    >
                                                        <Home size={22} fill={activeView === "home" ? "currentColor" : "none"} />
                                                        Home
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => { setActiveView("explore"); setSidebarOpen(false); }}
                                                        className={mobileNavItemClass("explore")}
                                                    >
                                                        <Compass size={22} />
                                                        Explore
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => { setActiveView("library"); setSidebarOpen(false); }}
                                                        className={mobileNavItemClass("library")}
                                                    >
                                                        <Bookmark size={22} />
                                                        Library
                                                    </button>
                                                </li>
                                                <li>
                                                    <button
                                                        onClick={() => { setActiveView("generator"); setSidebarOpen(false); }}
                                                        className={mobileNavItemClass("generator")}
                                                    >
                                                        <Sparkles size={22} />
                                                        AI Studio
                                                    </button>
                                                </li>

                                                <li>
                                                    <button
                                                        onClick={() => { setActiveView("feed"); setSidebarOpen(false); }}
                                                        className={mobileNavItemClass("feed")}
                                                    >
                                                        <Heart size={22} fill={activeView === "feed" ? "currentColor" : "none"} className={activeView === "feed" ? "text-rose-500" : ""} />
                                                        Activity Feed
                                                    </button>
                                                </li>

                                                <li>
                                                    <button
                                                        onClick={() => { setActiveView("history"); setSidebarOpen(false); }}
                                                        className={mobileNavItemClass("history")}
                                                    >
                                                        <History size={22} className={activeView === "history" ? "text-pink-500" : ""} />
                                                        History
                                                    </button>
                                                </li>
                                            </ul>

                                            <div className="px-6 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-3">
                                                    {userAvatar ? (
                                                        <img src={userAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-white/10" />
                                                    ) : (
                                                        <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
                                                            {userName.slice(0, 1).toUpperCase()}
                                                        </span>
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold truncate text-white">{userName}</p>
                                                        <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Premium</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* MAIN */}
                                <div className="flex flex-1 overflow-hidden gap-4 md:gap-8 px-3 sm:px-4 lg:px-6 pb-3 md:pb-5">
                                    {/* LEFT SIDEBAR */}
                                    <nav
                                        className={`${sidebarOpen ? "w-[88px] border-r border-white/5" : "w-0 border-r-transparent"
                                            } hidden md:flex shrink-0 pt-4 pb-8 flex-col items-center gap-6 overflow-hidden bg-black/25 backdrop-blur-md transition-all duration-300`}
                                    >
                                        <ul className="w-full space-y-2">
                                            <li>
                                                <button
                                                    onClick={() => setActiveView("home")}
                                                    className={navItemClass("home")}
                                                >
                                                    <Home size={22} fill="currentColor" />
                                                    Home
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => setActiveView("explore")}
                                                    className={navItemClass("explore")}
                                                >
                                                    <Compass size={22} />
                                                    Explore
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => setActiveView("library")}
                                                    className={navItemClass("library")}
                                                >
                                                    <Bookmark size={22} />
                                                    Library
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => setActiveView("generator")}
                                                    className={navItemClass("generator")}
                                                >
                                                    <Sparkles size={22} />
                                                    AI Studio
                                                </button>
                                            </li>

                                            <li>
                                                <button
                                                    onClick={() => setActiveView("feed")}
                                                    className={navItemClass("feed")}
                                                >
                                                    <Heart size={22} fill={activeView === "feed" ? "currentColor" : "none"} className={activeView === "feed" ? "text-rose-500" : ""} />
                                                    Activity Feed
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    onClick={() => setActiveView("history")}
                                                    className={navItemClass("history")}
                                                >
                                                    <History size={22} className={activeView === "history" ? "text-pink-500" : ""} />
                                                    History
                                                </button>
                                            </li>
                                        </ul>

                                        <button
                                            onClick={() => setShuffle(!shuffle)}
                                            className={`hidden px-4 py-2 rounded-lg ${shuffle ? "bg-green-600" : "bg-zinc-800"}`}
                                        >
                                            Shuffle
                                        </button>

                                        <button
                                            onClick={() => setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off")}
                                            className={`hidden px-4 py-2 rounded-lg ${repeat !== "off" ? "bg-blue-600" : "bg-zinc-800"}`}
                                        >
                                            Repeat
                                        </button>

                                        <div className="hidden">
                                            <h3 className="text-lg font-bold mb-3">Favorites</h3>
                                            <div className="space-y-2">
                                                {favorites.map((video) => (
                                                    <div
                                                        key={video?.id?.videoId}
                                                        className="bg-zinc-900 p-2 rounded-lg"
                                                    >
                                                        <button
                                                            onClick={() => playVideo(video)}
                                                            className="flex items-center gap-2 w-full"
                                                        >
                                                            <img
                                                                src={video?.snippet?.thumbnails?.default?.url}
                                                                alt=""
                                                                className="w-10 h-10 rounded"
                                                            />
                                                            <p className="text-xs line-clamp-1">{video?.snippet?.title}</p>
                                                        </button>

                                                        <button
                                                            onClick={() => removeFavorite(video?.id?.videoId)}
                                                            className="text-red-500 text-xs mt-2"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </nav>

                                    {/* CENTER */}
                                    <main className="flex-1 min-w-0 overflow-hidden py-3 sm:py-6 lg:py-5">
                                        <div id="main-content-scrollable" onScroll={handleMainScroll} className="h-full overflow-y-auto scroll-smooth rounded-3xl bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.65)] [scrollbar-color:rgba(255,255,255,0.25)_transparent]">
                                            {(activeView === "home") && (
                                                <div className="sticky top-0 z-20 rounded-t-3xl bg-black/35 backdrop-blur-md border-b border-white/5 px-4 py-5 shadow-[0_15px_45px_rgba(0,0,0,0.25)] sm:px-8 lg:px-12">
                                                    <div
                                                        className="flex gap-3 overflow-x-auto pb-1 scrollbar-none"
                                                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                                                    >
                                                        {chips.map((chip) => {
                                                            const isScrollChip = chip === "All" || chip === "Albums" || chip === "Podcasts";
                                                            const isActive = isScrollChip
                                                                ? (activeHomeSection === chip && !search)
                                                                : (search === chip);
                                                            return (
                                                                <motion.button
                                                                    key={chip}
                                                                    type="button"
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => {
                                                                        if (isScrollChip) {
                                                                            handleCategoryClick(chip);
                                                                        } else {
                                                                            navigateToExplore(chip);
                                                                        }
                                                                    }}
                                                                    aria-pressed={isActive}
                                                                    className={`px-7 py-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300 border border-white/5 whitespace-nowrap cursor-pointer ${isActive
                                                                        ? "bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white shadow-[0_4px_15px_rgba(236,72,153,0.35)] font-bold border-transparent"
                                                                        : "bg-white/10 text-zinc-200 hover:bg-white/15 hover:text-white"
                                                                        }`}
                                                                >
                                                                    {chip}
                                                                </motion.button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
                                                {activeView === "generator" ? (
                                                    <AIPlaylistStudio
                                                        API_BASE={API_BASE}
                                                        playVideo={playVideo}
                                                        setVideos={setVideos}
                                                        setCurrentVideo={setCurrentVideo}
                                                        createPlayer={createPlayer}
                                                        favorites={favorites}
                                                        addToFavorites={addToFavorites}
                                                        removeFavorite={removeFavorite}
                                                        userName={userName}
                                                        userAvatar={userAvatar}
                                                        broadcastActivityEvent={broadcastActivityEvent}
                                                        userId={userId}
                                                        isPlaying={isPlaying}
                                                        setIsPlaying={setIsPlaying}
                                                        togglePlay={togglePlay}
                                                        currentVideo={currentVideo}
                                                    />
                                                ) : activeView === "feed" ? (
                                                    <MusicFeed
                                                        currentVideo={currentVideo}
                                                        playVideo={playVideo}
                                                        favorites={favorites}
                                                        addToFavorites={addToFavorites}
                                                        removeFavorite={removeFavorite}
                                                        userName={userName}
                                                        userAvatar={userAvatar}
                                                        liveFriendListening={liveFriendListening}
                                                        realtimePlaylistUpdates={realtimePlaylistUpdates}
                                                        socketActivities={socketActivities}
                                                        broadcastActivityEvent={broadcastActivityEvent}
                                                        userId={userId}
                                                        autoShare={autoShare}
                                                        setAutoShare={setAutoShare}
                                                        friendsStatus={friendsStatus}
                                                        handleSendFriendRequest={handleSendFriendRequest}
                                                        friendRequests={friendRequests}
                                                        friendsList={friendsList}
                                                        handleAcceptFriendRequest={handleAcceptFriendRequest}
                                                        handleRejectFriendRequest={handleRejectFriendRequest}
                                                    />
                                                ) : activeView === "artist" ? (
                                                    <ArtistProfile
                                                        videos={videos}
                                                        playVideo={playVideo}
                                                        followedArtists={followedArtists}
                                                        toggleFollowArtist={toggleFollowArtist}
                                                        getArtistData={getArtistData}
                                                        artistsDb={artistsDb}
                                                        formatTime={formatTime}
                                                        setSearch={setSearch}
                                                        searchVideos={searchVideos}
                                                        setActiveView={setActiveView}
                                                        selectedArtist={selectedArtist}
                                                    />
                                                ) : activeView === "history" ? (
                                                    <div className="space-y-8 animate-fadeIn">
                                                        {/* Listen History Header */}
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                                                            <div>
                                                                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">Listening History</h2>
                                                                <p className="text-sm text-zinc-400 mt-1.5">User ne kya play kiya tha uska pura record save hoga. Manage your listening footprint.</p>
                                                            </div>
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm("Are you sure you want to clear your listening history?")) {
                                                                            setHistory([]);
                                                                            localStorage.removeItem("listen_history");
                                                                            toast.success("Listening history cleared.");
                                                                        }
                                                                    }}
                                                                    className="px-4 py-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-500/10 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95"
                                                                >
                                                                    Clear Listen History
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm("Are you sure you want to clear your search history?")) {
                                                                            setSearchHistory([]);
                                                                            localStorage.removeItem("search_history");
                                                                            toast.success("Search history cleared.");
                                                                        }
                                                                    }}
                                                                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/5 rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95"
                                                                >
                                                                    Clear Searches
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {history.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border border-dashed border-white/10 bg-white/[0.01]">
                                                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl">🎵</div>
                                                                <p className="text-lg font-bold text-zinc-300">Your listening history is empty</p>
                                                                <p className="text-sm text-zinc-500 max-w-sm">Start exploring and playing songs to automatically build your dynamic music profile timeline!</p>
                                                                <button
                                                                    onClick={() => setActiveView("home")}
                                                                    className="px-6 py-2.5 bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white rounded-xl font-bold text-sm transition active:scale-95 shadow-[0_5px_15px_rgba(236,72,153,0.3)] hover:scale-105"
                                                                >
                                                                    Go To Home
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                                {/* LEFT/MID COLUMN: CONTINUE & TIMELINE (2/3 width) */}
                                                                <div className="lg:col-span-2 space-y-8">
                                                                    {/* CONTINUE LISTENING (Resumes last played song progress) */}
                                                                    {(() => {
                                                                        const continueItem = history.find(item => item.progress > 0) || history[0];
                                                                        if (!continueItem) return null;
                                                                        const progressPercent = continueItem.progress && continueItem.video?.duration
                                                                            ? Math.min(100, Math.floor((continueItem.progress / continueItem.video.duration) * 100))
                                                                            : 30; // fallback default indicator
                                                                        return (
                                                                            <div className="p-6 rounded-3xl bg-gradient-to-tr from-white/[0.03] to-white/[0.01] border border-white/5 shadow-xl relative overflow-hidden group">
                                                                                {/* Glowing background halo */}
                                                                                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all"></div>

                                                                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                                                                    <div className="relative w-28 h-28 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-102 transition duration-300">
                                                                                        <img
                                                                                            src={continueItem.video?.snippet?.thumbnails?.high?.url || continueItem.video?.snippet?.thumbnails?.default?.url || continueItem.video?.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500"}
                                                                                            alt=""
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                                                                                            <button
                                                                                                onClick={() => playVideo(continueItem.video, continueItem.progress || 0)}
                                                                                                className="w-12 h-12 rounded-full bg-[#ec4899] hover:bg-[#d946ef] text-white flex items-center justify-center shadow-lg transition transform hover:scale-110 active:scale-95"
                                                                                            >
                                                                                                <Play size={20} fill="currentColor" className="ml-1" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="flex-1 min-w-0 space-y-3 text-center md:text-left w-full">
                                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/20 text-[#ec4899] text-xs font-black uppercase tracking-wider animate-pulse">
                                                                                            Continue Listening
                                                                                        </span>
                                                                                        <div>
                                                                                            <h3 className="text-xl font-black text-white truncate">{continueItem.video?.snippet?.title || continueItem.video?.title}</h3>
                                                                                            <p className="text-sm text-zinc-400 truncate mt-1">{continueItem.video?.snippet?.channelTitle || continueItem.video?.artist}</p>
                                                                                        </div>

                                                                                        {/* Progress indicators */}
                                                                                        <div className="space-y-1.5">
                                                                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                                                                <div
                                                                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                                                                                    style={{ width: `${progressPercent}%` }}
                                                                                                />
                                                                                            </div>
                                                                                            <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                                                                                                <span>{formatTime(continueItem.progress || 0)} Listened</span>
                                                                                                <span>{((Date.now() - (continueItem.playedAt || Date.now())) < 60000) ? "Just now" : `${Math.floor((Date.now() - (continueItem.playedAt || Date.now())) / 60000)}m ago`}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <button
                                                                                        onClick={() => playVideo(continueItem.video, continueItem.progress || 0)}
                                                                                        className="hidden md:flex w-14 h-14 shrink-0 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white items-center justify-center shadow-lg transition transform hover:scale-108 active:scale-95 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]"
                                                                                    >
                                                                                        <Play size={24} fill="currentColor" className="ml-1" />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}

                                                                    {/* RECENTLY PLAYED TIMELINE */}
                                                                    <div className="space-y-6">
                                                                        <h3 className="text-lg font-black uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                                                                            <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                                                                            Auto-Generated History Timeline
                                                                        </h3>

                                                                        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-purple-500 before:via-pink-500 before:to-zinc-800">
                                                                            {history.map((item, index) => {
                                                                                const diff = Date.now() - (item.playedAt || Date.now());
                                                                                let relativeTime = "Just now";
                                                                                if (diff > 60000) {
                                                                                    const mins = Math.floor(diff / 60000);
                                                                                    relativeTime = `${mins} min${mins > 1 ? 's' : ''} ago`;
                                                                                    if (mins >= 60) {
                                                                                        const hrs = Math.floor(mins / 60);
                                                                                        relativeTime = `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
                                                                                        if (hrs >= 24) {
                                                                                            const days = Math.floor(hrs / 24);
                                                                                            relativeTime = `${days} day${days > 1 ? 's' : ''} ago`;
                                                                                        }
                                                                                    }
                                                                                }

                                                                                return (
                                                                                    <div key={`${item.songId || item.video?.id?.videoId || item.video?.videoId || index}-${item.lastPlayed || index}-${index}`} className="relative group flex items-center gap-4 p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-pink-500/20 transition-all duration-300">
                                                                                        {/* Timeline dot */}
                                                                                        <span className="absolute -left-[22px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-pink-500 border border-zinc-950 shadow-[0_0_10px_rgba(236,72,153,0.8)] z-10 group-hover:scale-125 transition-transform duration-200" />

                                                                                        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden border border-white/15 relative">
                                                                                            <img
                                                                                                src={item.video?.snippet?.thumbnails?.high?.url || item.video?.snippet?.thumbnails?.default?.url || item.video?.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500"}
                                                                                                alt=""
                                                                                                className="w-full h-full object-cover"
                                                                                            />
                                                                                            <button
                                                                                                onClick={() => playVideo(item.video, 0)}
                                                                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 text-white"
                                                                                            >
                                                                                                <Play size={16} fill="currentColor" className="ml-0.5" />
                                                                                            </button>
                                                                                        </div>

                                                                                        <div className="flex-1 min-w-0">
                                                                                            <h4 className="text-base font-black truncate text-zinc-100 group-hover:text-white transition">{item.video?.snippet?.title || item.video?.title}</h4>
                                                                                            <p
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    openArtistProfile(item.video?.snippet?.channelTitle || item.video?.artist);
                                                                                                }}
                                                                                                className="text-xs text-zinc-400 truncate mt-0.5 cursor-pointer hover:underline hover:text-white"
                                                                                            >
                                                                                                {item.video?.snippet?.channelTitle || item.video?.artist}
                                                                                            </p>
                                                                                        </div>

                                                                                        <div className="text-right shrink-0">
                                                                                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-extrabold uppercase text-zinc-400 group-hover:text-zinc-200 transition">
                                                                                                {relativeTime}
                                                                                            </span>
                                                                                            <p className="text-[10px] text-zinc-500 font-bold mt-1.5">{item.playCount || 1} play{item.playCount > 1 ? 's' : ''}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* RIGHT COLUMN: MOST PLAYED & SEARCH HISTORY (1/3 width) */}
                                                                <div className="space-y-8">
                                                                    {/* MOST PLAYED SONGS */}
                                                                    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
                                                                        <h3 className="text-base font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                                                            <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                                                                            Most Played Songs
                                                                        </h3>

                                                                        <div className="space-y-3.5">
                                                                            {[...history]
                                                                                .sort((a, b) => (b.playCount || 1) - (a.playCount || 1))
                                                                                .slice(0, 5)
                                                                                .map((item, idx) => (
                                                                                    <div
                                                                                        key={`${item.songId || item.video?.id?.videoId || item.video?.videoId || idx}-${item.lastPlayed || idx}-${idx}`}
                                                                                        onClick={() => playVideo(item.video, 0)}
                                                                                        className="group cursor-pointer flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/5 transition"
                                                                                    >
                                                                                        <span className="w-6 text-center text-sm font-black text-purple-400 group-hover:scale-105 transition-transform">
                                                                                            #{idx + 1}
                                                                                        </span>
                                                                                        <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-white/10">
                                                                                            <img
                                                                                                src={item.video?.snippet?.thumbnails?.high?.url || item.video?.snippet?.thumbnails?.default?.url || item.video?.cover_url}
                                                                                                alt=""
                                                                                                className="w-full h-full object-cover"
                                                                                            />
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-sm font-bold truncate text-white">{item.video?.snippet?.title || item.video?.title}</p>
                                                                                            <p
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    openArtistProfile(item.video?.snippet?.channelTitle || item.video?.artist);
                                                                                                }}
                                                                                                className="text-[10px] text-zinc-500 truncate mt-0.5 cursor-pointer hover:underline hover:text-white"
                                                                                            >
                                                                                                {item.video?.snippet?.channelTitle || item.video?.artist}
                                                                                            </p>
                                                                                        </div>
                                                                                        <div className="text-right shrink-0">
                                                                                            <span className="text-[10px] bg-purple-950/40 border border-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                                                                {item.playCount || 1} play{item.playCount > 1 ? 's' : ''}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* SEARCH HISTORY */}
                                                                    <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                                                                        <h3 className="text-base font-black uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                                                            <span className="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
                                                                            Recent Search History
                                                                        </h3>

                                                                        {searchHistory.length === 0 ? (
                                                                            <p className="text-xs text-zinc-500 py-2">Your search history is empty.</p>
                                                                        ) : (
                                                                            <div className="flex flex-col gap-2">
                                                                                {searchHistory.map((query, idx) => (
                                                                                    <div
                                                                                        key={idx}
                                                                                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.01] hover:bg-white/5 border border-white/5 hover:border-cyan-500/20 group transition"
                                                                                    >
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setSearch(query);
                                                                                                searchVideos(query);
                                                                                            }}
                                                                                            className="flex-1 text-left text-sm font-semibold text-zinc-300 hover:text-white truncate flex items-center gap-2"
                                                                                        >
                                                                                            <span className="text-xs text-zinc-500 group-hover:text-cyan-400 transition">🔍</span>
                                                                                            <span>{query}</span>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                setSearchHistory(prev => {
                                                                                                    const next = prev.filter(q => q !== query);
                                                                                                    localStorage.setItem("search_history", JSON.stringify(next));
                                                                                                    return next;
                                                                                                });
                                                                                                toast.success(`Removed "${query}" from search history.`);
                                                                                            }}
                                                                                            className="text-zinc-600 hover:text-red-400 p-1 rounded transition"
                                                                                            title="Remove from history"
                                                                                        >
                                                                                            <X size={14} />
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        {activeView === "home" ? (
                                                            <motion.div
                                                                key="home"
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="space-y-10 text-left"
                                                            >
                                                                {/* HERO BANNER SECTION */}
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.1, duration: 0.5 }}
                                                                    className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-purple-900/40 via-pink-900/20 to-black/80 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 group"
                                                                >
                                                                    <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all"></div>
                                                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

                                                                    <div className="flex-1 space-y-5 relative z-10">
                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                                                            ✨ Discover Next-Gen Vibe
                                                                        </span>
                                                                        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                                                                            AI Powered <br />
                                                                            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(236,72,153,0.35)]">
                                                                                Playlist Studio
                                                                            </span>
                                                                        </h1>
                                                                        <p className="text-xs sm:text-sm text-zinc-300 max-w-xl font-semibold leading-relaxed">
                                                                            Curate your daily sound footprints based on face-scan emotion analysis or voice commands. Experience music tailored perfectly to your immediate mental frequency.
                                                                        </p>
                                                                        <div className="flex flex-wrap gap-4 pt-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setActiveView("generator");
                                                                                    toast.success("Welcome to AI Playlist Studio!");
                                                                                }}
                                                                                className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all duration-300 shrink-0 cursor-pointer"
                                                                            >
                                                                                Launch AI Studio
                                                                            </button>
                                                                            <button
                                                                                onClick={() => navigateToExplore("New")}
                                                                                className="px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 hover:border-white/20 rounded-xl font-black text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                                                                            >
                                                                                Explore New Vibe
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Hero Floating Visual Card */}
                                                                    <div
                                                                        onClick={() => navigateToExplore("Feel good")}
                                                                        className="relative w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] cursor-pointer group-hover:scale-105 transition-all duration-500 group-hover:border-pink-500/40 shrink-0"
                                                                    >
                                                                        <img
                                                                            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500"
                                                                            alt="Curated Hits"
                                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700 brightness-90 group-hover:brightness-100"
                                                                        />
                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                                                                        <div className="absolute bottom-4 left-4 right-4 text-left">
                                                                            <span className="text-[9px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Featured</span>
                                                                            <h3 className="text-sm font-black text-white truncate mt-1">Feel Good Grooves</h3>
                                                                            <p className="text-[10px] text-zinc-300 font-semibold truncate mt-0.5">Top-curated upbeat pop anthems</p>
                                                                        </div>
                                                                    </div>
                                                                </motion.div>

                                                                {/* RECENTLY PLAYED SECTION */}
                                                                {history.length > 0 && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: 15 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        transition={{ delay: 0.2, duration: 0.4 }}
                                                                        className="space-y-4"
                                                                    >
                                                                        <h3 className="text-lg sm:text-xl font-black text-zinc-100 flex items-center gap-2">
                                                                            <span className="w-1.5 h-4 bg-gradient-to-b from-[#7c3aed] to-[#ec4899] rounded-full"></span>
                                                                            Recently Played
                                                                        </h3>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                            {history.slice(0, 3).map((item, idx) => {
                                                                                const video = item.video;
                                                                                const matchedGenre = getVibeGenreForSong(video);
                                                                                return (
                                                                                    <div
                                                                                        key={idx}
                                                                                        onClick={() => navigateToExplore(matchedGenre)}
                                                                                        className="group cursor-pointer p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-purple-500/20 transition-all duration-300 flex items-center gap-4 relative overflow-hidden shadow-sm"
                                                                                    >
                                                                                        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden relative border border-white/10">
                                                                                            <img
                                                                                                src={video?.snippet?.thumbnails?.high?.url || video?.cover_url}
                                                                                                alt=""
                                                                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                                                            />
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    playVideo(video);
                                                                                                }}
                                                                                                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl text-xs font-bold"
                                                                                            >
                                                                                                ▶
                                                                                            </button>
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <h4 className="text-xs sm:text-sm font-black truncate text-zinc-100 group-hover:text-[#ec4899] transition">
                                                                                                {video?.snippet?.title || video?.title}
                                                                                            </h4>
                                                                                            <p className="text-[10px] text-zinc-500 font-bold truncate mt-0.5">
                                                                                                {video?.snippet?.channelTitle || video?.artist}
                                                                                            </p>
                                                                                        </div>
                                                                                        <span className="absolute bottom-2 right-3 text-[9px] bg-white/5 text-zinc-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-white/5 opacity-80">
                                                                                            {matchedGenre}
                                                                                        </span>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </motion.div>
                                                                )}

                                                                {/* TRENDING MUSIC SECTION */}
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 15 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.3, duration: 0.4 }}
                                                                    className="space-y-4 scroll-mt-32"
                                                                    id="all-songs-section"
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <h3 className="text-lg sm:text-xl font-black text-zinc-100 flex items-center gap-2">
                                                                            <span className="w-1.5 h-4 bg-gradient-to-b from-[#7c3aed] to-[#ec4899] rounded-full"></span>
                                                                            Trending Music
                                                                        </h3>
                                                                        <div className="flex gap-2">
                                                                            <button
                                                                                onClick={() => scrollCards(-1)}
                                                                                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                                                                            >
                                                                                <ChevronLeft size={18} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => scrollCards(1)}
                                                                                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                                                                            >
                                                                                <ChevronRight size={18} />
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {loading ? (
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                                                            <div className="animate-pulse bg-zinc-800/40 h-48 rounded-2xl"></div>
                                                                            <div className="animate-pulse bg-zinc-800/40 h-48 rounded-2xl"></div>
                                                                            <div className="animate-pulse bg-zinc-800/40 h-48 rounded-2xl"></div>
                                                                            <div className="animate-pulse bg-zinc-800/40 h-48 rounded-2xl"></div>
                                                                        </div>
                                                                    ) : videos.length === 0 ? (
                                                                        <div className="border border-zinc-800 bg-zinc-950/40 rounded-2xl p-6 text-zinc-400 text-sm">
                                                                            No trending music found.
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            ref={cardsRailRef}
                                                                            className="flex gap-6 overflow-x-auto pb-6 scroll-smooth scrollbar-none snap-x snap-mandatory"
                                                                        >
                                                                            {videos.map((video) => {
                                                                                const videoId = video?.id?.videoId || video?.videoId;
                                                                                const songTitle = video?.snippet?.title || "Unknown Track";
                                                                                const artistName = video?.snippet?.channelTitle?.replace(/\s*-\s*Topic/gi, "").replace(/\s*VEVO/gi, "").trim();

                                                                                const snippetThumbs = video?.snippet?.thumbnails;
                                                                                const coverUrl = snippetThumbs?.maxres?.url || snippetThumbs?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

                                                                                return (
                                                                                    <div
                                                                                        key={videoId}
                                                                                        onClick={() => {
                                                                                            playVideo(video);
                                                                                            toast.success(`Playing: "${songTitle}"`);
                                                                                        }}
                                                                                        className="group cursor-pointer p-4 rounded-3xl bg-purple-950/[0.15] border border-purple-500/10 hover:border-purple-500/30 hover:bg-purple-950/[0.25] hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all duration-500 w-[200px] shrink-0 snap-start text-left relative border border-transparent"
                                                                                    >
                                                                                        {/* Song Cover - Rounded Square with Overlay Play */}
                                                                                        <div className="relative overflow-hidden aspect-square rounded-2xl bg-zinc-900 mb-4 border border-purple-500/20 group-hover:border-[#7c3aed]/70 transition-all duration-500 shadow-md group-hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]">
                                                                                            <img
                                                                                                src={coverUrl}
                                                                                                onLoad={(e) => {
                                                                                                    if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
                                                                                                        e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                                                    }
                                                                                                }}
                                                                                                onError={(e) => {
                                                                                                    e.target.onerror = null;
                                                                                                    e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                                                }}
                                                                                                alt={songTitle}
                                                                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                                                            />

                                                                                            {/* Spotify-style Floating Play Button Overlay */}
                                                                                            <div className="absolute right-3 bottom-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition transform duration-200">
                                                                                                    <Play size={16} fill="currentColor" className="ml-0.5" />
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Song & Artist Info */}
                                                                                        <div className="space-y-1 pr-1">
                                                                                            <p
                                                                                                className="text-xs sm:text-sm font-black text-zinc-200 truncate group-hover:text-purple-400 transition-colors"
                                                                                                title={songTitle}
                                                                                            >
                                                                                                {songTitle}
                                                                                            </p>
                                                                                            <p
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    openArtistProfile(video?.snippet?.channelTitle);
                                                                                                }}
                                                                                                className="text-[10px] text-zinc-500 font-bold truncate hover:text-white transition-colors cursor-pointer inline-block"
                                                                                                title={artistName}
                                                                                            >
                                                                                                {artistName}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </motion.div>

                                                                {/* FEATURED ARTISTS SECTION */}
                                                                <motion.div
                                                                    id="albums-section"
                                                                    initial={{ opacity: 0, y: 15 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.4, duration: 0.4 }}
                                                                    className="space-y-4 scroll-mt-32 text-left"
                                                                >
                                                                    <h3 className="text-lg sm:text-xl font-black text-zinc-100 flex items-center gap-2 pt-6">
                                                                        <span className="w-1.5 h-4 bg-gradient-to-b from-[#7c3aed] to-[#ec4899] rounded-full"></span>
                                                                        Featured Artists
                                                                    </h3>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                                                        {["Arijit Singh", "Diljit Dosanjh", "Shreya Ghoshal", "Jubin Nautiyal", "Taylor Swift", "Coldplay"].map((artistName, idx) => {
                                                                            const artist = artistsDb[artistName];
                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    onClick={() => openArtistProfile(artistName)}
                                                                                    className="group cursor-pointer p-4 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 hover:scale-105 w-full text-center"
                                                                                >
                                                                                    <div className="relative overflow-hidden rounded-full bg-zinc-900 aspect-square mb-4 border border-purple-500/20 group-hover:border-[#7c3aed]/70 transition-all duration-500 shadow-md group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]">
                                                                                        <img
                                                                                            src={artist?.image}
                                                                                            alt={artistName}
                                                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-1 text-center">
                                                                                        <p className="text-xs sm:text-sm font-bold text-zinc-300 truncate group-hover:text-[#7c3aed] transition-colors">{artistName}</p>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </motion.div>

                                                                {/* FEATURED SONGS SECTION */}
                                                                <motion.div
                                                                    id="featured-songs-section"
                                                                    initial={{ opacity: 0, y: 15 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.45, duration: 0.4 }}
                                                                    className="space-y-4 scroll-mt-32 text-left"
                                                                >
                                                                    <h3 className="text-lg sm:text-xl font-black text-zinc-100 flex items-center gap-2 pt-6">
                                                                        <span className="w-1.5 h-4 bg-gradient-to-b from-[#7c3aed] to-[#ec4899] rounded-full"></span>
                                                                        Featured Songs
                                                                    </h3>
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                                                        {[
                                                                            {
                                                                                title: "Kesariya",
                                                                                artist: "Arijit Singh",
                                                                                videoId: "BddP6PYo2gs",
                                                                                coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80",
                                                                                snippet: {
                                                                                    title: "Kesariya",
                                                                                    channelTitle: "Arijit Singh",
                                                                                    thumbnails: {
                                                                                        high: {
                                                                                            url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80"
                                                                                        }
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                title: "Lover",
                                                                                artist: "Taylor Swift",
                                                                                videoId: "VyoDbX1EkPQ",
                                                                                coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80",
                                                                                snippet: {
                                                                                    title: "Lover",
                                                                                    channelTitle: "Taylor Swift",
                                                                                    thumbnails: {
                                                                                        high: {
                                                                                            url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80"
                                                                                        }
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                title: "Blinding Lights",
                                                                                artist: "The Weeknd",
                                                                                videoId: "fHI8X4OXluQ",
                                                                                coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
                                                                                snippet: {
                                                                                    title: "Blinding Lights",
                                                                                    channelTitle: "The Weeknd",
                                                                                    thumbnails: {
                                                                                        high: {
                                                                                            url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80"
                                                                                        }
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                title: "Hymn For The Weekend",
                                                                                artist: "Coldplay",
                                                                                videoId: "YykjpePLW1k",
                                                                                coverUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format&fit=crop&q=80",
                                                                                snippet: {
                                                                                    title: "Hymn For The Weekend",
                                                                                    channelTitle: "Coldplay",
                                                                                    thumbnails: {
                                                                                        high: {
                                                                                            url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&auto=format&fit=crop&q=80"
                                                                                        }
                                                                                    }
                                                                                }
                                                                            },
                                                                            {
                                                                                title: "Excuses",
                                                                                artist: "AP Dhillon",
                                                                                videoId: "vX2cDW8yOb4",
                                                                                coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80",
                                                                                snippet: {
                                                                                    title: "Excuses",
                                                                                    channelTitle: "AP Dhillon",
                                                                                    thumbnails: {
                                                                                        high: {
                                                                                            url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80"
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        ].map((song, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                onClick={() => playVideo(song)}
                                                                                className="group cursor-pointer p-4 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 hover:scale-105 w-full text-center"
                                                                            >
                                                                                <div className="relative overflow-hidden rounded-2xl bg-zinc-900 aspect-square mb-4 border border-purple-500/20 group-hover:border-[#7c3aed]/70 transition-all duration-500 shadow-md group-hover:shadow-[0_0_25px_rgba(124,58,237,0.5)]">
                                                                                    <img
                                                                                        src={song.coverUrl}
                                                                                        onError={(e) => {
                                                                                            e.target.onerror = null;
                                                                                            e.target.src = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=80";
                                                                                        }}
                                                                                        alt={song.title}
                                                                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                                                    />
                                                                                </div>
                                                                                <div className="space-y-1 text-center">
                                                                                    <p className="text-xs sm:text-sm font-black text-zinc-200 truncate group-hover:text-[#7c3aed] transition-colors">{song.title}</p>
                                                                                    <p className="text-[10px] text-zinc-500 font-bold truncate mt-0.5">{song.artist}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>

                                                                {/* TRENDING PODCASTS SECTION */}
                                                                <motion.div
                                                                    id="podcasts-section"
                                                                    initial={{ opacity: 0, y: 15 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.5, duration: 0.4 }}
                                                                    className="space-y-4 scroll-mt-32 text-left"
                                                                >
                                                                    <h3 className="text-lg sm:text-xl font-black text-zinc-100 flex items-center gap-2 pt-6">
                                                                        <span className="w-1.5 h-4 bg-gradient-to-b from-[#7c3aed] to-[#ec4899] rounded-full"></span>
                                                                        Trending Podcasts
                                                                    </h3>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                                                        {[
                                                                            { title: "The Ranveer Show", host: "Ranveer Allahbadia", desc: "India's smartest podcast covering spirituality, tech, and history.", cover: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300", tag: "Society & Culture" },
                                                                            { title: "Vibe Check", host: "Aarav & Riya", desc: "Weekly deep dives into trending pop culture, memes, and next-gen vibes.", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300", tag: "Entertainment" },
                                                                            { title: "Mindset Audio", host: "Dr. Kabir Malhotra", desc: "Scientific tools and psychological strategies to rebuild your cognitive focus.", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300", tag: "Education" },
                                                                            { title: "Deep Focus Echoes", host: "DJ Solitude", desc: "Relaxing ambient conversations and binaural beats for working or sleeping.", cover: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=300", tag: "Mindfulness" }
                                                                        ].map((podcast, idx) => (
                                                                            <div
                                                                                key={idx}
                                                                                onClick={() => navigateToExplore("Podcasts")}
                                                                                className="group cursor-pointer flex gap-4 p-4 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-[#ec4899]/30 transition-all duration-300 hover:scale-[1.02] w-full"
                                                                            >
                                                                                <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden relative border border-white/10">
                                                                                    <img
                                                                                        src={podcast.cover}
                                                                                        alt={podcast.title}
                                                                                        className="w-full h-full object-cover"
                                                                                    />
                                                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl">
                                                                                        <Mic size={14} className="text-zinc-200" />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="flex-1 min-w-0 text-left space-y-1">
                                                                                    <span className="text-[8px] bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                                                        {podcast.tag}
                                                                                    </span>
                                                                                    <h4 className="text-xs sm:text-sm font-black truncate text-zinc-100 group-hover:text-[#ec4899] transition">{podcast.title}</h4>
                                                                                    <p className="text-[9px] text-zinc-500 font-bold truncate">Hosted by {podcast.host}</p>
                                                                                    <p className="text-[9px] text-zinc-400 font-semibold line-clamp-1 mt-0.5 leading-tight">{podcast.desc}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            </motion.div>
                                                        ) : activeView === "explore" ? (
                                                            <motion.div
                                                                key="explore"
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="space-y-10 text-left relative"
                                                            >
                                                                {/* Ambient Neon background overlays */}
                                                                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-3xl">
                                                                    <div className="absolute top-[10%] left-[20%] w-[350px] h-[350px] rounded-full bg-[#d946ef]/8 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
                                                                    <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#06b6d4]/8 blur-[90px]" />
                                                                </div>

                                                                {/* EXPLORE DISCOVERY HEADER */}
                                                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/5 pb-6">
                                                                    <div>
                                                                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(6,182,212,0.15)]">
                                                                            Discovery Studio
                                                                        </h2>
                                                                        <p className="text-xs sm:text-sm text-zinc-400 mt-1">Explore custom genre-coded frequencies and find matching live soundscapes.</p>
                                                                    </div>

                                                                    {/* Quick search input */}
                                                                    <div className="relative w-full md:max-w-xs shrink-0">
                                                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Quick genre search..."
                                                                            value={search}
                                                                            onChange={(e) => setSearch(e.target.value)}
                                                                            onKeyDown={(e) => e.key === "Enter" && searchVideos()}
                                                                            style={{ paddingLeft: "2.8rem" }}
                                                                            className="w-full h-10 bg-white/5 border border-white/10 rounded-full pr-4 text-xs font-semibold placeholder:text-zinc-500 outline-none focus:border-cyan-500/50 focus:bg-white/10 transition"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* PINTEREST / SPOTIFY INSPIRED DISCOVERY GRID */}
                                                                <div className="relative z-10 space-y-5">
                                                                    <h3 className="text-lg sm:text-xl font-black text-zinc-200 flex items-center gap-2">
                                                                        <span className="w-1.5 h-4 bg-cyan-400 rounded-full"></span>
                                                                        Browse Custom Categories
                                                                    </h3>

                                                                    {/* Asymmetric Pinterest Grid */}
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                                        {Object.keys(genresDb).map((genreName, idx) => {
                                                                            const genre = genresDb[genreName];
                                                                            const isActive = selectedExploreGenre === genreName || search.toLowerCase() === genreName.toLowerCase();
                                                                            const isDoubleWidth = idx === 0 || idx === 5 || idx === 8; // Asymmetric grid mapping
                                                                            return (
                                                                                <motion.div
                                                                                    key={genreName}
                                                                                    whileHover={{ scale: 1.05, y: -4 }}
                                                                                    whileTap={{ scale: 0.97 }}
                                                                                    animate={isActive ? { scale: 1.03, y: -2 } : { scale: 1, y: 0 }}
                                                                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                                                                    onClick={() => navigateToExplore(genreName)}
                                                                                    className={`group cursor-pointer rounded-3xl p-5 border relative overflow-hidden transition-all duration-500 flex flex-col justify-between h-[150px] sm:h-[180px] bg-gradient-to-br ${genre.color} ${isActive
                                                                                            ? `ring-2 ring-purple-500/60 border-purple-400/80 shadow-2xl ${genre.glow}`
                                                                                            : "border-white/5 shadow-md"
                                                                                        } ${isDoubleWidth ? "col-span-2" : "col-span-1"}`}
                                                                                >
                                                                                    {/* Graphic background */}
                                                                                    <img
                                                                                        src={genre.image}
                                                                                        alt=""
                                                                                        className="absolute inset-0 w-full h-full object-cover opacity-15 saturate-50 group-hover:opacity-25 group-hover:scale-105 transition-all duration-700"
                                                                                    />
                                                                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                                                                                    <div className="flex justify-between items-start w-full relative z-10">
                                                                                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border border-white/10 ${genre.pillColor}`}>
                                                                                            {genreName}
                                                                                        </span>
                                                                                        {isActive && (
                                                                                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse">
                                                                                                Active
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    <div className="text-left w-full space-y-1 relative z-10">
                                                                                        <h4 className="text-lg font-black text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                                                                                            {genreName}
                                                                                        </h4>
                                                                                        <p className="text-[10px] text-zinc-300 font-bold truncate">
                                                                                            {genre.tagline}
                                                                                        </p>
                                                                                        <p className="text-[9px] text-zinc-500 font-semibold line-clamp-1 group-hover:text-zinc-400 transition-colors pt-0.5">
                                                                                            {genre.desc}
                                                                                        </p>
                                                                                    </div>
                                                                                </motion.div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* matched search result deck */}
                                                                <div id="matched-tracks-section" className="relative z-10 space-y-5 pt-4 scroll-mt-32">
                                                                    <h3 className="text-lg sm:text-xl font-black text-zinc-200 flex items-center gap-2">
                                                                        <span className="w-1.5 h-4 bg-purple-400 rounded-full"></span>
                                                                        {search ? `Matched Vibe Tracks: "${search}"` : "Matched Vibe Tracks"}
                                                                    </h3>

                                                                    {loading ? (
                                                                        <div className="space-y-3">
                                                                            <div className="animate-pulse bg-zinc-800/40 h-14 rounded-xl"></div>
                                                                            <div className="animate-pulse bg-zinc-800/40 h-14 rounded-xl"></div>
                                                                            <div className="animate-pulse bg-zinc-800/40 h-14 rounded-xl"></div>
                                                                        </div>
                                                                    ) : videos.length === 0 ? (
                                                                        <div className="border border-dashed border-white/10 rounded-2xl p-10 text-center text-zinc-500 text-xs">
                                                                            Select a browse category card or type a genre query to fetch instant matched frequencies.
                                                                        </div>
                                                                    ) : (
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                                                            {videos.map((video) => (
                                                                                <div
                                                                                    key={video?.id?.videoId}
                                                                                    onClick={() => playVideo(video)}
                                                                                    className="group cursor-pointer flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] border border-white/5 hover:border-cyan-500/20 transition-all duration-300"
                                                                                >
                                                                                    <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden relative border border-white/10">
                                                                                        <img
                                                                                            src={video?.snippet?.thumbnails?.high?.url}
                                                                                            alt=""
                                                                                            className="w-full h-full object-cover"
                                                                                        />
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                playVideo(video);
                                                                                            }}
                                                                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-xl text-[10px]"
                                                                                        >
                                                                                            ▶
                                                                                        </button>
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0 text-left">
                                                                                        <h4 className="text-xs font-black truncate text-zinc-100 group-hover:text-cyan-400 transition">{video?.snippet?.title}</h4>
                                                                                        <p
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                openArtistProfile(video?.snippet?.channelTitle);
                                                                                            }}
                                                                                            className="text-[9px] text-zinc-500 font-bold truncate mt-0.5 cursor-pointer hover:underline hover:text-white"
                                                                                        >
                                                                                            {video?.snippet?.channelTitle}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ) : activeView === "library" ? (
                                                            <motion.div
                                                                key="library"
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ duration: 0.4 }}
                                                                className="space-y-8 text-left relative"
                                                            >
                                                                {/* Ambient glowing overlays */}
                                                                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden rounded-3xl">
                                                                    <div className="absolute top-0 left-[10%] w-[350px] h-[350px] rounded-full bg-purple-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
                                                                    <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[90px]" />
                                                                </div>

                                                                {/* 1. SPOTIFY LIKED SONGS PREMIUM HEADER */}
                                                                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-900/30 via-zinc-950/40 to-transparent border border-white/5 shadow-2xl backdrop-blur-md">
                                                                    {/* Giant Spotify-style Heart Icon Collage */}
                                                                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#ec4899] flex items-center justify-center shadow-[0_12px_40px_rgba(124,58,237,0.4)] shrink-0 transition-transform duration-500 hover:scale-105 group/heart">
                                                                        <Heart size={56} className="text-white fill-white animate-pulse group-hover/heart:scale-110 transition duration-300" />
                                                                    </div>

                                                                    {/* Details Row */}
                                                                    <div className="flex-1 text-center md:text-left space-y-2.5">
                                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black text-[9px] uppercase tracking-widest">
                                                                            Playlist
                                                                        </span>

                                                                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] font-display">
                                                                            Liked Songs
                                                                        </h1>

                                                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-xs sm:text-sm font-bold text-zinc-300">
                                                                            {userAvatar ? (
                                                                                <img src={userAvatar} alt="" className="w-5 h-5 rounded-full object-cover border border-purple-500/30 mr-1" />
                                                                            ) : (
                                                                                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[9px] font-black text-white mr-1">
                                                                                    {(userName || "U").charAt(0).toUpperCase()}
                                                                                </div>
                                                                            )}
                                                                            <span className="text-white hover:underline cursor-pointer">{userName || "User"}</span>
                                                                            <span className="text-zinc-500">•</span>
                                                                            <span className="text-[#ec4899] font-extrabold">{favorites.length} saved songs</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 2. DYNAMIC CONTROLS TOOLBAR */}
                                                                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-white/5 pb-4">
                                                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                                                        {/* Floating Big Play Button */}
                                                                        <button
                                                                            onClick={() => {
                                                                                if (favorites.length > 0) {
                                                                                    playVideo(favorites[0]);
                                                                                    toast.success(`Playing Liked Songs collection!`);
                                                                                } else {
                                                                                    toast.error("No liked songs to play.");
                                                                                }
                                                                            }}
                                                                            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] text-white flex items-center justify-center shadow-[0_5px_15px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95 transition transform duration-200 cursor-pointer shrink-0"
                                                                            title="Play all liked songs"
                                                                        >
                                                                            <Play size={20} fill="currentColor" className="ml-0.5" />
                                                                        </button>

                                                                        {/* Sort Dropdown Selector */}
                                                                        <div className="relative shrink-0">
                                                                            <select
                                                                                value={librarySort}
                                                                                onChange={(e) => setLibrarySort(e.target.value)}
                                                                                className="h-10 bg-white/5 border border-white/10 rounded-full px-4 pr-8 text-xs font-bold text-zinc-300 outline-none hover:bg-white/10 hover:border-purple-500/30 transition cursor-pointer appearance-none"
                                                                            >
                                                                                <option value="recent" className="bg-zinc-950 text-zinc-200">Recently Added</option>
                                                                                <option value="title" className="bg-zinc-950 text-zinc-200">Alphabetical</option>
                                                                                <option value="artist" className="bg-zinc-950 text-zinc-200">Artist Name</option>
                                                                            </select>
                                                                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-[10px]">▼</div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                                                        {/* Search bar inside library */}
                                                                        <div className="relative w-full sm:max-w-xs">
                                                                            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Search in liked songs..."
                                                                                value={librarySearch}
                                                                                onChange={(e) => setLibrarySearch(e.target.value)}
                                                                                style={{ paddingLeft: "2.4rem" }}
                                                                                className="w-full h-10 bg-white/5 border border-white/10 rounded-full pr-4 text-xs font-semibold placeholder:text-zinc-500 outline-none focus:border-purple-500/50 focus:bg-white/10 transition"
                                                                            />
                                                                            {librarySearch && (
                                                                                <button
                                                                                    onClick={() => setLibrarySearch("")}
                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-xs"
                                                                                >
                                                                                    ✕
                                                                                </button>
                                                                            )}
                                                                        </div>

                                                                        {/* Layout Toggle Buttons */}
                                                                        <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 shrink-0">
                                                                            <button
                                                                                onClick={() => setLibraryLayout("grid")}
                                                                                className={`p-1.5 rounded-full transition-all duration-300 ${libraryLayout === "grid" ? "bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white shadow-md" : "text-zinc-400 hover:text-white"}`}
                                                                                title="Grid Layout"
                                                                            >
                                                                                <LayoutGrid size={15} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setLibraryLayout("list")}
                                                                                className={`p-1.5 rounded-full transition-all duration-300 ${libraryLayout === "list" ? "bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] text-white shadow-md" : "text-zinc-400 hover:text-white"}`}
                                                                                title="List Layout"
                                                                            >
                                                                                <List size={15} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* 3. DYNAMIC GRID/LIST SONGS CONTENT */}
                                                                {favorites.length === 0 ? (
                                                                    /* Empty State */
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="border border-dashed border-white/10 rounded-3xl p-12 text-center text-zinc-500 text-sm space-y-4"
                                                                    >
                                                                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto text-zinc-400">
                                                                            <Music size={28} />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <h3 className="text-zinc-300 font-extrabold text-base">Your library is empty</h3>
                                                                            <p className="text-xs text-zinc-500 max-w-sm mx-auto">Click the heart button on any featured songs, search results, or activities to add songs instantly to your library!</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => setActiveView("home")}
                                                                            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] font-bold text-white text-xs uppercase tracking-wider shadow-lg active:scale-95 transition cursor-pointer"
                                                                        >
                                                                            Discover Songs
                                                                        </button>
                                                                    </motion.div>
                                                                ) : filteredFavorites.length === 0 ? (
                                                                    /* Search filter produced no matches */
                                                                    <div className="border border-zinc-800/40 bg-zinc-950/20 rounded-2xl p-10 text-center text-zinc-500 text-xs font-semibold">
                                                                        No liked songs matched "{librarySearch}". Try searching for something else.
                                                                    </div>
                                                                ) : libraryLayout === "grid" ? (
                                                                    /* GRID LAYOUT VIEW */
                                                                    <motion.div
                                                                        layout
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6"
                                                                    >
                                                                        {filteredFavorites.map((video, idx) => {
                                                                            const videoId = video?.id?.videoId || video?.videoId;
                                                                            const songTitle = video?.snippet?.title || video?.title || "Unknown Title";
                                                                            const artistName = (video?.snippet?.channelTitle || video?.artist || "Unknown Artist")
                                                                                .replace(/\s*-\s*Topic/gi, "").replace(/\s*VEVO/gi, "").trim();

                                                                            const snippetThumbs = video?.snippet?.thumbnails;
                                                                            const coverUrl = snippetThumbs?.high?.url || snippetThumbs?.default?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                            const stableSeconds = getStableDuration(video);
                                                                            const isPlayingCurrent = currentVideo?.id?.videoId === videoId;

                                                                            return (
                                                                                <motion.div
                                                                                    layout
                                                                                    key={videoId + "-grid-" + idx}
                                                                                    initial={{ opacity: 0, scale: 0.92 }}
                                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                                    transition={{ duration: 0.25, delay: Math.min(idx * 0.03, 0.3) }}
                                                                                    className={`group cursor-pointer p-4 rounded-2xl bg-zinc-900/35 border transition-all duration-500 hover:scale-105 text-left relative flex flex-col justify-between h-full ${isPlayingCurrent ? "border-purple-500/50 bg-purple-950/10 shadow-[0_0_20px_rgba(124,58,237,0.15)]" : "border-white/5 hover:border-purple-500/35 hover:bg-white/[0.03]"}`}
                                                                                >
                                                                                    <div>
                                                                                        {/* Cover Image Wrapper */}
                                                                                        <div className="relative overflow-hidden aspect-square rounded-xl bg-zinc-950 mb-3.5 border border-white/10 group-hover:border-purple-500/40 transition duration-300 shadow-md">
                                                                                            <img
                                                                                                src={coverUrl}
                                                                                                alt={songTitle}
                                                                                                onLoad={(e) => {
                                                                                                    if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
                                                                                                        e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                                                    }
                                                                                                }}
                                                                                                onError={(e) => {
                                                                                                    e.target.onerror = null;
                                                                                                    e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                                                }}
                                                                                                className="w-full h-full object-cover group-hover:scale-108 transition duration-500"
                                                                                            />

                                                                                            {/* Floating Spotify Style Play Button */}
                                                                                            <div className="absolute right-3.5 bottom-3.5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                                                                                                <button
                                                                                                    onClick={(e) => {
                                                                                                        e.stopPropagation();
                                                                                                        playVideo(video);
                                                                                                    }}
                                                                                                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition transform duration-200"
                                                                                                >
                                                                                                    {isPlayingCurrent && isPlaying ? (
                                                                                                        <Pause size={16} fill="currentColor" />
                                                                                                    ) : (
                                                                                                        <Play size={16} fill="currentColor" className="ml-0.5" />
                                                                                                    )}
                                                                                                </button>
                                                                                            </div>

                                                                                            {/* Currently Playing Equalizer Overlay */}
                                                                                            {isPlayingCurrent && (
                                                                                                <div className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1.5 flex items-center gap-1.5 border border-purple-500/30">
                                                                                                    <div className="visualizer-container !h-3.5 !w-4">
                                                                                                        <div className="visualizer-bar !w-0.5 bg-purple-400" />
                                                                                                        <div className="visualizer-bar !w-0.5 bg-purple-400" style={{ animationDelay: '0.1s', animationDuration: '0.5s' }} />
                                                                                                        <div className="visualizer-bar !w-0.5 bg-purple-400" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }} />
                                                                                                    </div>
                                                                                                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Playing</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>

                                                                                        {/* Titles */}
                                                                                        <div className="space-y-1">
                                                                                            <h4
                                                                                                onClick={() => playVideo(video)}
                                                                                                className={`text-sm font-black truncate group-hover:text-purple-400 transition-colors cursor-pointer ${isPlayingCurrent ? "text-purple-400" : "text-zinc-200"}`}
                                                                                                title={songTitle}
                                                                                            >
                                                                                                {songTitle}
                                                                                            </h4>
                                                                                            <p
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    openArtistProfile(video?.snippet?.channelTitle || video?.artist);
                                                                                                }}
                                                                                                className="text-[10px] text-zinc-500 hover:text-white transition-colors cursor-pointer font-bold inline-block truncate max-w-full"
                                                                                                title={artistName}
                                                                                            >
                                                                                                {artistName}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Actions / Bottom row */}
                                                                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 shrink-0">
                                                                                        <span className="text-[10px] font-mono text-zinc-500 font-semibold">{formatTime(stableSeconds)}</span>
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                removeFavorite(videoId);
                                                                                                toast.success(`Removed: "${songTitle}" from Library`);
                                                                                            }}
                                                                                            className="text-rose-500 hover:text-rose-400 transition cursor-pointer p-1 rounded hover:bg-white/5 active:scale-90"
                                                                                            title="Remove from Library"
                                                                                        >
                                                                                            <Heart size={14} className="fill-rose-500 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
                                                                                        </button>
                                                                                    </div>
                                                                                </motion.div>
                                                                            );
                                                                        })}
                                                                    </motion.div>
                                                                ) : (
                                                                    /* LIST LAYOUT VIEW */
                                                                    <motion.div
                                                                        initial={{ opacity: 0 }}
                                                                        animate={{ opacity: 1 }}
                                                                        className="space-y-1 select-none"
                                                                    >
                                                                        {/* List Headers */}
                                                                        <div className="grid grid-cols-[45px_1fr_1.5fr_100px_45px] sm:grid-cols-[55px_2.5fr_1.5fr_120px_60px] items-center px-4 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-500 border-b border-white/5 mb-2 text-left">
                                                                            <span className="text-center">#</span>
                                                                            <span>Title</span>
                                                                            <span>Artist</span>
                                                                            <span className="text-right pr-6 sm:pr-8">Duration</span>
                                                                            <span className="text-center">Like</span>
                                                                        </div>

                                                                        {/* List Rows */}
                                                                        <div className="space-y-1">
                                                                            {filteredFavorites.map((video, idx) => {
                                                                                const videoId = video?.id?.videoId || video?.videoId;
                                                                                const songTitle = video?.snippet?.title || video?.title || "Unknown Title";
                                                                                const artistName = (video?.snippet?.channelTitle || video?.artist || "Unknown Artist")
                                                                                    .replace(/\s*-\s*Topic/gi, "").replace(/\s*VEVO/gi, "").trim();

                                                                                const snippetThumbs = video?.snippet?.thumbnails;
                                                                                const coverUrl = snippetThumbs?.default?.url || snippetThumbs?.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                                const stableSeconds = getStableDuration(video);
                                                                                const isPlayingCurrent = currentVideo?.id?.videoId === videoId;

                                                                                return (
                                                                                    <motion.div
                                                                                        key={videoId + "-list-" + idx}
                                                                                        initial={{ opacity: 0, x: -10 }}
                                                                                        animate={{ opacity: 1, x: 0 }}
                                                                                        transition={{ duration: 0.2, delay: Math.min(idx * 0.02, 0.25) }}
                                                                                        onClick={() => playVideo(video)}
                                                                                        className={`grid grid-cols-[45px_1fr_1.5fr_100px_45px] sm:grid-cols-[55px_2.5fr_1.5fr_120px_60px] items-center px-4 py-2.5 rounded-xl border transition-all duration-300 cursor-pointer text-left ${isPlayingCurrent ? "border-purple-500/40 bg-purple-950/15 shadow-md" : "border-transparent bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/5"}`}
                                                                                    >
                                                                                        {/* Number / Status */}
                                                                                        <div className="flex items-center justify-center text-center">
                                                                                            {isPlayingCurrent && isPlaying ? (
                                                                                                <div className="visualizer-container !h-3.5 !w-4">
                                                                                                    <div className="visualizer-bar !w-0.5 bg-purple-400" />
                                                                                                    <div className="visualizer-bar !w-0.5 bg-purple-400" style={{ animationDelay: '0.15s', animationDuration: '0.4s' }} />
                                                                                                    <div className="visualizer-bar !w-0.5 bg-purple-400" style={{ animationDelay: '0.3s', animationDuration: '0.6s' }} />
                                                                                                </div>
                                                                                            ) : isPlayingCurrent ? (
                                                                                                <span className="text-xs text-purple-400 font-extrabold">▶</span>
                                                                                            ) : (
                                                                                                <span className="text-xs sm:text-sm font-bold text-zinc-500">{idx + 1}</span>
                                                                                            )}
                                                                                        </div>

                                                                                        {/* Title & Cover */}
                                                                                        <div className="flex items-center gap-3.5 min-w-0 pr-4">
                                                                                            <div className="w-10 h-10 shrink-0 rounded-lg overflow-hidden border border-white/10 relative shadow-sm">
                                                                                                <img
                                                                                                    src={coverUrl}
                                                                                                    alt=""
                                                                                                    onLoad={(e) => {
                                                                                                        if (e.target.naturalWidth === 120 && e.target.naturalHeight === 90) {
                                                                                                            e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                                                        }
                                                                                                    }}
                                                                                                    onError={(e) => {
                                                                                                        e.target.onerror = null;
                                                                                                        e.target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                                                                                    }}
                                                                                                    className="w-full h-full object-cover"
                                                                                                />
                                                                                            </div>
                                                                                            <span className={`text-xs sm:text-sm font-black truncate group-hover:text-purple-400 transition-colors ${isPlayingCurrent ? "text-purple-400" : "text-zinc-200"}`} title={songTitle}>
                                                                                                {songTitle}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* Artist links */}
                                                                                        <div className="min-w-0 pr-4">
                                                                                            <span
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    openArtistProfile(video?.snippet?.channelTitle || video?.artist);
                                                                                                }}
                                                                                                className="text-xs text-zinc-400 hover:text-white hover:underline transition font-bold truncate max-w-full inline-block"
                                                                                            >
                                                                                                {artistName}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* Duration */}
                                                                                        <div className="text-right pr-6 sm:pr-8 text-xs sm:text-sm font-mono text-zinc-400 font-bold">
                                                                                            {formatTime(stableSeconds)}
                                                                                        </div>

                                                                                        {/* Like Status button */}
                                                                                        <div className="flex justify-center">
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    removeFavorite(videoId);
                                                                                                    toast.success(`Removed: "${songTitle}" from Library`);
                                                                                                }}
                                                                                                className="text-rose-500 hover:text-rose-400 transition cursor-pointer p-1.5 rounded hover:bg-white/5 active:scale-90 flex items-center justify-center"
                                                                                                title="Remove from Library"
                                                                                            >
                                                                                                <Heart size={14} className="fill-rose-500 filter drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
                                                                                            </button>
                                                                                        </div>
                                                                                    </motion.div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </motion.div>
                                                        ) : (
                                                            /* Default library / favorites grid fallback */
                                                            <section className="mb-16">
                                                                <div className="mb-6 sm:mb-7 flex items-center justify-between gap-5 text-left">
                                                                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{mainTitle}</h2>
                                                                    {activeView === "library" && (
                                                                        <span className="text-sm text-zinc-400">
                                                                            {favorites.length} saved
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {loading ? (
                                                                    <div className="space-y-4">
                                                                        <div className="animate-pulse bg-zinc-800 h-20 rounded-lg"></div>
                                                                        <div className="animate-pulse bg-zinc-800 h-20 rounded-lg"></div>
                                                                        <div className="animate-pulse bg-zinc-800 h-20 rounded-lg"></div>
                                                                    </div>
                                                                ) : mainVideos.length === 0 ? (
                                                                    <div className="border border-zinc-800 bg-zinc-950 rounded-lg p-6 text-zinc-400 text-left text-sm">
                                                                        {emptyMessage}
                                                                    </div>
                                                                ) : (
                                                                    <div
                                                                        className="grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-10"
                                                                    >
                                                                        {mainVideos.map((video) => {
                                                                            const artistName = video?.snippet?.channelTitle?.replace(/\s*-\s*Topic/gi, "").replace(/\s*VEVO/gi, "").trim();
                                                                            const artistData = getArtistData(video?.snippet?.channelTitle);
                                                                            return (
                                                                                <div
                                                                                    key={video?.id?.videoId}
                                                                                    onClick={() => openArtistProfile(video?.snippet?.channelTitle)}
                                                                                    className="group cursor-pointer p-4 rounded-2xl hover:bg-white/[0.04] transition-all duration-300 hover:scale-105 w-full text-center"
                                                                                >
                                                                                    <div className="relative overflow-hidden rounded-full bg-zinc-900 shadow-md aspect-square mb-3 border border-white/10 group-hover:border-[#ec4899]/50 transition duration-300">
                                                                                        <img
                                                                                            src={artistData?.image}
                                                                                            alt={artistName}
                                                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="text-center space-y-1">
                                                                                        <p
                                                                                            className="text-sm font-bold text-zinc-300 truncate group-hover:text-[#ec4899] transition-colors"
                                                                                        >
                                                                                            {artistName}
                                                                                        </p>
                                                                                        {activeView === "library" && (
                                                                                            <button
                                                                                                onClick={(event) => {
                                                                                                    event.stopPropagation();
                                                                                                    removeFavorite(video?.id?.videoId);
                                                                                                }}
                                                                                                className="mt-2 text-[11px] font-bold text-red-400 hover:text-red-300 transition cursor-pointer block mx-auto hover:underline"
                                                                                            >
                                                                                                Remove
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </section>
                                                        )}

                                                        {currentVideo && (
                                                            <section className="bg-white/[0.055] border border-white/10 p-5 sm:p-6 lg:p-8 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] text-left">
                                                                <div className="flex flex-col md:flex-row gap-7 lg:gap-9 items-stretch">
                                                                    <img
                                                                        src={currentVideo?.snippet?.thumbnails?.high?.url}
                                                                        alt=""
                                                                        className="w-full md:w-52 lg:w-60 aspect-video md:aspect-square rounded-xl object-cover shrink-0"
                                                                    />

                                                                    <div className="min-w-0 py-1 flex-1">
                                                                        <h2 className="text-2xl font-bold line-clamp-2">{currentVideo?.snippet?.title}</h2>
                                                                        <p className="text-zinc-400 mt-2">{currentVideo?.snippet?.channelTitle}</p>

                                                                        <button
                                                                            onClick={() => addToFavorites(currentVideo)}
                                                                            className="mt-4 bg-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 cursor-pointer"
                                                                        >
                                                                            {isFavorited ? "Added" : "Add to Favorites"}
                                                                        </button>

                                                                        <p className="mt-3 text-sm text-zinc-400">Favorites: {favorites.length}</p>
                                                                    </div>
                                                                </div>
                                                            </section>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </main>

                                    {/* RIGHT SIDEBAR */}
                                    {activeView === "home" && (
                                        <aside className="hidden xl:block w-[340px] shrink-0 my-9 rounded-2xl border border-white/5 bg-white/[0.035] overflow-y-auto shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
                                            <div className="px-5 py-5 border-b border-white/5">
                                                <h2 className="font-bold text-lg">Playlist</h2>
                                            </div>

                                            <div className="p-4 space-y-3">
                                                {videos.map((video) => (
                                                    <button
                                                        key={video?.id?.videoId}
                                                        onClick={() => playVideo(video)}
                                                        className={`w-full flex gap-4 p-3 rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 ${currentVideo?.id?.videoId === video?.id?.videoId
                                                            ? "bg-white/12"
                                                            : "hover:bg-white/8"
                                                            }`}
                                                    >
                                                        <img
                                                            src={video?.snippet?.thumbnails?.default?.url}
                                                            alt=""
                                                            className="w-16 h-16 rounded-lg object-cover"
                                                        />

                                                        <div className="text-left flex-1">
                                                            <p className="text-sm font-semibold line-clamp-2">{video?.snippet?.title}</p>
                                                            <p
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    openArtistProfile(video?.snippet?.channelTitle);
                                                                }}
                                                                className="text-xs text-zinc-400 mt-1 cursor-pointer hover:underline hover:text-white"
                                                            >
                                                                {video?.snippet?.channelTitle}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </aside>
                                    )}
                                </div>

                                <MediaController
                                    currentVideo={currentVideo}
                                    playerRef={playerRef}
                                    isPlaying={isPlaying}
                                    setIsPlaying={setIsPlaying}
                                    isMuted={isMuted}
                                    setIsMuted={setIsMuted}
                                    volume={volume}
                                    setVolume={setVolume}
                                    currentTime={currentTime}
                                    setCurrentTime={setCurrentTime}
                                    duration={duration}
                                    setDuration={setDuration}
                                    playNext={playNext}
                                    playPrevious={playPrevious}
                                    fullscreenOpen={fullscreenOpen}
                                    setFullscreenOpen={setFullscreenOpen}
                                    openArtistProfile={openArtistProfile}
                                    shuffle={shuffle}
                                    setShuffle={setShuffle}
                                    repeat={repeat}
                                    setRepeat={setRepeat}
                                />

                                {/* FULL SCREEN PLAYER MODAL (Always rendered in DOM to keep player mounted, styled visible/hidden dynamically) */}
                                {currentVideo && (
                                    <div className={`${fullscreenOpen ? "fixed inset-0 z-50 bg-black flex flex-col overflow-hidden select-none animate-fade-in opacity-100 pointer-events-auto" : "fixed w-[1px] h-[1px] opacity-0 overflow-hidden pointer-events-none z-[-99]"} ${shouldHide ? "cursor-none" : ""}`}>
                                        {/* DYNAMIC AMBIENT BLUR BACKDROP */}
                                        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                                            <img
                                                src={currentVideo?.snippet?.thumbnails?.high?.url}
                                                alt=""
                                                className="w-full h-full object-cover blur-[120px] saturate-[1.8] opacity-35 scale-125 animate-pulse"
                                                style={{ animationDuration: "12s" }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-zinc-950/90" />
                                        </div>

                                        <div className="relative z-10 flex flex-col h-full w-full">
                                            {/* HEADER CONTROLS */}
                                            <header className={`h-[76px] px-6 sm:px-8 flex items-center justify-between border-b border-white/5 bg-black/10 backdrop-blur-md transition-all duration-500 ${shouldHide ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"}`}>
                                                <div className="flex items-center gap-3">
                                                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-[10px] font-black uppercase tracking-widest text-purple-400">
                                                        Now Playing
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => setFullscreenOpen(false)}
                                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-all transform hover:scale-105 active:scale-95"
                                                    title="Exit Full Screen"
                                                >
                                                    <Minimize2 size={20} />
                                                </button>
                                            </header>

                                            {/* BODY CONTENT - SPLIT LAYOUT */}
                                            <main className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-8 lg:gap-12 px-6 sm:px-8 lg:px-16 py-8">
                                                {/* SINGLE COLUMN IMMERSIVE MEDIA CENTER DECK */}
                                                <div className={`max-w-3xl mx-auto flex-1 flex flex-col justify-center items-center text-center space-y-7 w-full ${isFullscreenVideo && !hideVideo ? "" : "relative"}`}>

                                                    {/* VIEWPORT PANEL / BACKGROUND VIDEO */}
                                                    <div className={isFullscreenVideo && !hideVideo
                                                        ? "absolute inset-0 w-full h-full z-0   scale-110 overflow-hidden transition-all duration-500 pointer-events-none"
                                                        : "w-full aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-[0_35px_90px_rgba(0,0,0,0.85)]  relative flex items-center justify-center p-3 select-none z-10 transition-all duration-500"
                                                    }>

                                                        {/* Dynamic Youtube Player Node */}
                                                        <div className={!hideVideo
                                                            ? (isFullscreenVideo ? "w-full h-full absolute inset-0 overflow-hidden scale-110" : "w-full h-full aspect-video rounded-2xl overflow-hidden relative")
                                                            : "absolute w-[1px] h-[1px]  overflow-hidden pointer-events-none"
                                                        }>
                                                            <div ref={playerContainerRef} className="w-full h-full"></div>
                                                            {/* Transparent Overlay to block all YT Native hover UI / interaction */}
                                                            <div className=" inset-0  z-10 pointer-events-auto cursor-default" />
                                                        </div>

                                                        {/* Fullscreen Video Glassmorphic vignette overlays */}
                                                        {isFullscreenVideo && (
                                                            <>
                                                                <div className="absolute inset-0   z-20 pointer-events-none" />
                                                                <div className="absolute inset-0    z-20 pointer-events-none" />
                                                            </>
                                                        )}

                                                        {/* Spinning Vinyl Album Art (Rendered when hideVideo is true) */}
                                                        {hideVideo && (
                                                            <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 rounded-full bg-zinc-950 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center p-3 overflow-hidden">
                                                                {/* Vinyl Grooves */}
                                                                <div className="absolute inset-0 rounded-full border border-white/[0.02]" />
                                                                <div className="absolute inset-6 rounded-full border border-white/[0.01]" />
                                                                <div className="absolute inset-12 rounded-full border border-white/[0.02]" />
                                                                <div className="absolute inset-20 rounded-full border border-white/[0.01]" />
                                                                <div className="absolute inset-32 rounded-full border border-white/[0.02]" />

                                                                {/* Rotating Center Disc Cover */}
                                                                <div
                                                                    className={`w-full h-full rounded-full overflow-hidden transition-transform duration-[6s] ease-linear`}
                                                                    style={{
                                                                        animation: isPlaying ? "spin 15s linear infinite" : "none",
                                                                        backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%), url(${currentVideo?.snippet?.thumbnails?.high?.url})`,
                                                                        backgroundSize: "cover",
                                                                        backgroundPosition: "center"
                                                                    }}
                                                                />

                                                                {/* Vinyl Center Hole */}
                                                                <div className="absolute w-12 h-12 rounded-full bg-zinc-950 border-4 border-black shadow-inner flex items-center justify-center">
                                                                    <div className="w-3 h-3 rounded-full bg-black/80" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* SONG METADATA */}
                                                    <div className={`space-y-2 z-10 transition-all duration-500 text-center ${shouldHide ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
                                                        }`}>
                                                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight line-clamp-1 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                                                            {currentVideo?.snippet?.title}
                                                        </h2>
                                                        <p
                                                            onClick={() => {
                                                                setFullscreenOpen(false);
                                                                openArtistProfile(currentVideo?.snippet?.channelTitle);
                                                            }}
                                                            className="text-sm sm:text-base font-bold text-zinc-400 font-sans mt-1 cursor-pointer hover:underline hover:text-white inline-block"
                                                        >
                                                            {currentVideo?.snippet?.channelTitle}
                                                        </p>
                                                    </div>

                                                    {/* MODE CONTROLS: AUDIO ONLY / VIDEO MODE / AMBIENT TOGGLE */}
                                                    <div className={`w-full flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-white/5 z-10 transition-all duration-500 ${shouldHide ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
                                                        }`}>
                                                        {/* Audio vs Video Mode Switcher */}
                                                        <div className="bg-white/5 border border-white/10 rounded-full p-1 flex items-center gap-1">
                                                            <button
                                                                onClick={() => setHideVideo(true)}
                                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${hideVideo
                                                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                                                                        : "text-zinc-400 hover:text-white"
                                                                    }`}
                                                            >
                                                                🎧 Audio Only
                                                            </button>
                                                            <button
                                                                onClick={() => setHideVideo(false)}
                                                                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${!hideVideo
                                                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)]"
                                                                        : "text-zinc-400 hover:text-white"
                                                                    }`}
                                                            >
                                                                📺 Video Mode
                                                            </button>
                                                        </div>

                                                        {/* Fullscreen Video Toggle pill (only available in Video Mode) */}
                                                        {!hideVideo && (
                                                            <button
                                                                onClick={() => setIsFullscreenVideo(!isFullscreenVideo)}
                                                                className={`px-5 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5 ${isFullscreenVideo
                                                                        ? "bg-cyan-600 border-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.35)]"
                                                                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                                                                    }`}
                                                            >
                                                                <Maximize2 size={12} />
                                                                {isFullscreenVideo ? "Exit Ambient Video" : "Ambient Video Backdrop"}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* 100% CUSTOM PLAYBACK CONTROL HUB */}
                                                    <div className={`w-full space-y-6 pt-2 z-10 transition-all duration-500 ${shouldHide ? "opacity-0 translate-y-4 pointer-events-none" : "opacity-100 translate-y-0"
                                                        }`}>
                                                        {/* 1. Progress seekbar bar */}
                                                        <div className="w-full space-y-2 select-none px-4">
                                                            <div className="relative w-full h-1.5 bg-white/10 hover:h-2 rounded-full transition-all group overflow-hidden">
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max={duration || 100}
                                                                    value={currentTime}
                                                                    onChange={handleSeekChange}
                                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                                />
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                                                                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex justify-between text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">
                                                                <span>{formatTime(currentTime)}</span>
                                                                <span>{formatTime(duration)}</span>
                                                            </div>
                                                        </div>

                                                        {/* 2. Controls play/pause skip button row */}
                                                        <div className="flex items-center justify-center gap-6 select-none">
                                                            {/* Shuffle Button */}
                                                            <button
                                                                onClick={() => setShuffle(!shuffle)}
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${shuffle
                                                                        ? "bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-500/30"
                                                                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
                                                                    }`}
                                                                title={shuffle ? "Shuffle On" : "Shuffle Off"}
                                                            >
                                                                <Shuffle size={16} />
                                                            </button>

                                                            {/* Skip Previous Button */}
                                                            <button
                                                                onClick={playPrevious}
                                                                className="w-16 h-16 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 flex items-center justify-center text-zinc-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
                                                                title="Previous Song"
                                                            >
                                                                <SkipBack size={28} />
                                                            </button>

                                                            {/* Massive Custom Play/Pause Button */}
                                                            <button
                                                                onClick={togglePlay}
                                                                className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all transform hover:scale-105 active:scale-95 border border-white/10"
                                                                title={isPlaying ? "Pause" : "Play"}
                                                            >
                                                                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                                                            </button>

                                                            {/* Skip Next Button */}
                                                            <button
                                                                onClick={playNext}
                                                                className="w-16 h-16 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 flex items-center justify-center text-zinc-400 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-md shrink-0 cursor-pointer"
                                                                title="Next Song"
                                                            >
                                                                <SkipForward size={28} />
                                                            </button>

                                                            {/* Repeat Button */}
                                                            <button
                                                                onClick={() => {
                                                                    const nextRepeat = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
                                                                    setRepeat(nextRepeat);
                                                                }}
                                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${repeat !== "off"
                                                                        ? "bg-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.5)] border border-pink-500/30"
                                                                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
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
                                                        </div>

                                                        {/* 3. Volume slider */}
                                                        <div className="flex items-center justify-center gap-3 select-none">
                                                            <div className="flex items-center gap-3 w-48 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-full">
                                                                <Volume2 size={14} className="text-zinc-400" />
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="100"
                                                                    value={volume}
                                                                    onChange={handleVolumeChange}
                                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </main>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    );
}
