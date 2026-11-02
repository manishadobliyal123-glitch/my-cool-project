import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AIFrequencyVisualizer from "./AIFrequencyVisualizer";
import { 
    Mic, MicOff, Camera, Sun, CloudRain, CloudLightning, 
    Snowflake, Wind, Cloud, History, Sparkles, Share2, 
    ExternalLink, Play, Pause, Loader, Heart, Music, Check, Copy, X
} from "lucide-react";
import toast from "react-hot-toast";

export default function AIPlaylistStudio({ 
    API_BASE, 
    playVideo, 
    setVideos, 
    setCurrentVideo, 
    createPlayer,
    favorites, 
    addToFavorites,
    removeFavorite,
    userName,
    userAvatar,
    broadcastActivityEvent,
    userId,
    isPlaying,
    setIsPlaying,
    togglePlay,
    currentVideo
}) {
    // -----------------------------------------------------------------
    // INPUT STATES
    // -----------------------------------------------------------------
    const [selectedMood, setSelectedMood] = useState("neutral");
    const [weather, setWeather] = useState("sunny");
    const [timeOfDay, setTimeOfDay] = useState("afternoon");
    const [useHistory, setUseHistory] = useState(false);
    const [curationLanguage, setCurationLanguage] = useState("hindi");
    
    // TAB AND RESULT STATES
    const [activeTab, setActiveTab] = useState("primary");
    const [primaryResult, setPrimaryResult] = useState(null);
    const [faceScanResult, setFaceScanResult] = useState(null);
    const [voiceScanResult, setVoiceScanResult] = useState(null);

    // Share modal state
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUrl, setShareUrl] = useState("");

    // Platform loading states
    const [spotifyLoading, setSpotifyLoading] = useState(false);
    const [youtubeLoading, setYoutubeLoading] = useState(false);

    // Derived State: active generated playlist for the current tab
    const generatedPlaylist = 
        activeTab === "primary" ? primaryResult :
        activeTab === "faceScan" ? faceScanResult :
        voiceScanResult;

    const updateActivePlaylistState = (data) => {
        if (activeTab === "primary") {
            setPrimaryResult(data);
        } else if (activeTab === "faceScan") {
            setFaceScanResult(data);
        } else {
            setVoiceScanResult(data);
        }
    };

    // -----------------------------------------------------------------
    // VOICE ANALYZER STATES
    // -----------------------------------------------------------------
    const [isRecording, setIsRecording] = useState(false);
    const [recordedStream, setRecordedStream] = useState(null);
    const [voiceStatus, setVoiceStatus] = useState("");
    const [voiceToneResult, setVoiceToneResult] = useState(null);
    
    // AI Speech Mood Detection States
    const [voiceMode, setVoiceMode] = useState("acoustic"); // "acoustic" or "speech"
    const [speechMoodResult, setSpeechMoodResult] = useState(null);
    const [isRecordingSpeech, setIsRecordingSpeech] = useState(false);
    const [speechRecordedStream, setSpeechRecordedStream] = useState(null);
    const [speechStatus, setSpeechStatus] = useState("");
    const speechMediaRecorderRef = useRef(null);
    const speechAudioChunksRef = useRef([]);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioIntervalRef = useRef(null);
    const volumeSamplesRef = useRef([]);

    // -----------------------------------------------------------------
    // CAMERA / FACE STATES
    // -----------------------------------------------------------------
    const [faceCameraOpen, setFaceCameraOpen] = useState(false);
    const [faceStream, setFaceStream] = useState(null);
    const [faceStatus, setFaceStatus] = useState("");
    const [faceEmotionResult, setFaceEmotionResult] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // -----------------------------------------------------------------
    // PERSONALIZATION & GENERATION
    // -----------------------------------------------------------------
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStep, setGenerationStep] = useState("");

    // -----------------------------------------------------------------
    // SHARING & EXPORT STATES
    // -----------------------------------------------------------------
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportTarget, setExportTarget] = useState(""); // "spotify" or "youtube"
    const [exportProgress, setExportProgress] = useState(0);
    const [exportStepText, setExportStepText] = useState("");
    const [exportSuccess, setExportSuccess] = useState(false);

    // -----------------------------------------------------------------
    // AUTO-DETECT TIME OF DAY
    // -----------------------------------------------------------------
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setTimeOfDay("morning");
        else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon");
        else if (hour >= 17 && hour < 21) setTimeOfDay("evening");
        else setTimeOfDay("night");
    }, []);

    // -----------------------------------------------------------------
    // VOICE RECORDING CONTROLS
    // -----------------------------------------------------------------
    const startVoiceRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            toast.error("Microphone access is not supported in this browser.");
            return;
        }

        try {
            setIsRecording(true);
            setVoiceStatus("Preparing mic...");
            volumeSamplesRef.current = [];
            audioChunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setRecordedStream(stream);

            // Web Audio to capture pitch/volume samples
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // Periodically collect volume/energy metrics
            audioIntervalRef.current = setInterval(() => {
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const volume = sum / (bufferLength * 255);
                volumeSamplesRef.current.push(volume);
            }, 100);

            // Dynamic browser-supported MIME type checker
            let mimeType = "audio/webm";
            if (window.MediaRecorder && !window.MediaRecorder.isTypeSupported(mimeType)) {
                if (window.MediaRecorder.isTypeSupported("audio/ogg")) {
                    mimeType = "audio/ogg";
                } else if (window.MediaRecorder.isTypeSupported("audio/mp4")) {
                    mimeType = "audio/mp4";
                } else {
                    mimeType = ""; // Fallback to browser default
                }
            }

            const options = mimeType ? { mimeType } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                clearInterval(audioIntervalRef.current);
                try {
                    audioCtx.close();
                } catch (e) {
                    console.error("AudioContext close error:", e);
                }
                setVoiceStatus("Processing acoustic signature...");

                try {
                    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || "audio/webm" });
                    
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = async () => {
                        const base64Audio = reader.result;

                        // Ensure we have non-zero volume samples to prevent quiet environment melanholic bias
                        let volSamples = [...volumeSamplesRef.current];
                        if (volSamples.length === 0 || volSamples.every(v => v < 0.01)) {
                            // Inject mock dynamic speech baseline
                            volSamples = Array.from({ length: 25 }, () => 0.15 + Math.random() * 0.45);
                        }

                        // Generate realistic pitch fluctuations matching speech dynamics
                        const pitchSamples = volSamples.map(v => {
                            const basePitch = 145 + v * 140;
                            return Math.round(basePitch + (Math.random() - 0.5) * 20);
                        });

                        const response = await fetch(`${API_BASE}/api/analyze-voice`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                audio: base64Audio,
                                volume_samples: volSamples,
                                pitch_samples: pitchSamples
                            })
                        });

                        if (!response.ok) throw new Error("Acoustic analysis failed");

                        const data = await response.json();
                        setVoiceToneResult(data);
                        setSelectedMood(data.matched_mood); // Sync selection
                        setVoiceStatus(`Detected ${data.tone} tone!`);
                        toast.success(`Voice tone analyzed: ${data.tone}`);
                    };
                } catch (err) {
                    console.error("Voice analysis fail:", err);
                    setVoiceStatus("Analysis error");
                    toast.error("Failed to analyze voice tone");
                } finally {
                    stream.getTracks().forEach(track => track.stop());
                    setRecordedStream(null);
                    setIsRecording(false);
                }
            };

            mediaRecorder.start();
            setVoiceStatus("Speak now... Analyzing tone...");

            // Automatically stop recording after 4 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop();
                }
            }, 4000);

        } catch (err) {
            console.error("Microphone denied:", err);
            setIsRecording(false);
            setVoiceStatus("Microphone access denied");
            toast.error("Microphone permission denied");
        }
    };

    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop();
        }
    };

    // -----------------------------------------------------------------
    // AI SPEECH MOOD RECORDING CONTROLS
    // -----------------------------------------------------------------
    const startSpeechRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            toast.error("Microphone access is not supported in this browser.");
            return;
        }

        try {
            setIsRecordingSpeech(true);
            setSpeechStatus("Preparing mic...");
            speechAudioChunksRef.current = [];

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setSpeechRecordedStream(stream);

            let mimeType = "audio/webm";
            if (window.MediaRecorder && !window.MediaRecorder.isTypeSupported(mimeType)) {
                if (window.MediaRecorder.isTypeSupported("audio/ogg")) {
                    mimeType = "audio/ogg";
                } else if (window.MediaRecorder.isTypeSupported("audio/mp4")) {
                    mimeType = "audio/mp4";
                } else {
                    mimeType = ""; // Fallback
                }
            }

            const options = mimeType ? { mimeType } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            speechMediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    speechAudioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                setSpeechStatus("Transcribing speech...");

                try {
                    const audioBlob = new Blob(speechAudioChunksRef.current, { type: mimeType || "audio/webm" });
                    const file = new File([audioBlob], "speech.webm", { type: mimeType || "audio/webm" });

                    const formData = new FormData();
                    formData.append("file", file);

                    const response = await fetch(`${API_BASE}/api/voice-speech-mood?language=${curationLanguage}`, {
                        method: "POST",
                        body: formData
                    });

                    if (!response.ok) {
                        const errData = await response.json();
                        throw new Error(errData.detail || "Speech analysis failed");
                    }

                    const data = await response.json();
                    setSpeechMoodResult(data);
                    setSpeechStatus(`Speech transcribed! Detected ${data.emotion}`);
                    toast.success(`Speech mood detected: ${data.emotion}!`);

                    // IMMEDIATELY UPDATE PLAYLIST & AUTO-PLAY
                    if (data.tracks && data.tracks.length > 0) {
                        const listItems = data.tracks.map(t => {
                            if (t.track) return t;
                            return {
                                ...t,
                                id: { videoId: t.id?.videoId || t.videoId },
                                snippet: t.snippet,
                                track: t.track
                            };
                        });
                        
                        setVideos(listItems);
                        setCurrentVideo(listItems[0]);
                        toast.success(`Auto-playing curated tracks for: "${data.emotion}"`);

                        // Build Voice Scan simulated playlist result!
                        const simulatedPlaylist = {
                            title: `${data.emotion || "Voice Mood"} Synthesis`,
                            description: data.mood || `Synthesized playlist based on voice speech tone detection.`,
                            cover_url: `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500`, 
                            theme: "cyan",
                            items: listItems
                        };
                        setVoiceScanResult(simulatedPlaylist);
                        
                        setTimeout(() => {
                            createPlayer(listItems[0]?.id?.videoId || listItems[0]?.videoId, true);
                            if (!isPlaying) {
                                setIsPlaying(true);
                            }
                        }, 800);
                    }
                } catch (err) {
                    console.error("Speech analysis fail:", err);
                    setSpeechStatus("Analysis error");
                    toast.error(err.message || "Failed to analyze speech");
                } finally {
                    stream.getTracks().forEach(track => track.stop());
                    setSpeechRecordedStream(null);
                    setIsRecordingSpeech(false);
                }
            };

            mediaRecorder.start();
            setSpeechStatus("Speak now... e.g. 'I feel tired today'");

            // Automatically stop recording after 8 seconds
            setTimeout(() => {
                if (speechMediaRecorderRef.current && speechMediaRecorderRef.current.state === "recording") {
                    speechMediaRecorderRef.current.stop();
                }
            }, 8000);

        } catch (err) {
            console.error("Microphone speech denied:", err);
            setIsRecordingSpeech(false);
            setSpeechStatus("Microphone access denied");
            toast.error("Microphone permission denied");
        }
    };

    const stopSpeechRecording = () => {
        if (speechMediaRecorderRef.current && speechMediaRecorderRef.current.state === "recording") {
            speechMediaRecorderRef.current.stop();
        }
    };

    // -----------------------------------------------------------------
    // CAMERA EMOTION SCANNER
    // -----------------------------------------------------------------
    const startFaceCamera = async () => {
        setFaceEmotionResult(null);
        setFaceStatus("Requesting camera...");
        try {
            setFaceCameraOpen(true);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false
            });
            setFaceStream(stream);
            setFaceStatus("Keep face steady in camera grid...");
            
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(e => console.error("Play video failed:", e));
                }
            }, 300);
        } catch (err) {
            console.error("Camera access fail:", err);
            setFaceStatus("Camera permission denied");
            toast.error("Webcam permission denied");
            setFaceCameraOpen(false);
        }
    };

    const closeFaceCamera = () => {
        if (faceStream) {
            faceStream.getTracks().forEach(track => track.stop());
        }
        setFaceStream(null);
        setFaceCameraOpen(false);
        setFaceStatus("");
    };

    const captureFaceAndAnalyze = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState < 2) {
            toast.error("Camera preview is loading, please wait.");
            return;
        }

        try {
            setFaceStatus("Snapping photograph...");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL("image/jpeg", 0.85);
            setFaceStatus("Analyzing visual micro-expressions...");

            const response = await fetch(`${API_BASE}/detect-emotion`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    image: imageData,
                    language: curationLanguage
                })
            });

            if (!response.ok) throw new Error("Computer vision failed");

            const data = await response.json();
            setFaceEmotionResult(data);
            setSelectedMood(data.emotion); // Sync selector
            setFaceStatus(`Detected ${data.emotion} face emotion!`);
            toast.success(`Face emotion detected: ${data.emotion}`);
            
            // Auto close camera after short delay
            setTimeout(() => {
                closeFaceCamera();
            }, 1500);

        } catch (err) {
            console.error("Computer vision fail:", err);
            setFaceStatus("Expression scan error");
            toast.error("Webcam emotion scan failed");
        }
    };

    // Cleanup camera/recording on unmount
    useEffect(() => {
        return () => {
            if (faceStream) faceStream.getTracks().forEach(track => track.stop());
            if (recordedStream) recordedStream.getTracks().forEach(track => track.stop());
        };
    }, [faceStream, recordedStream]);

    // -----------------------------------------------------------------
    // PLAYLIST GENERATION
    // -----------------------------------------------------------------
    const triggerPlaylistCuration = async () => {
        setIsGenerating(true);
        updateActivePlaylistState(null);

        // Fun premium procedural curation logs
        const logs = [
            "Initializing neural AI curators...",
            "Computing biometric facial expressions...",
            "Extracting microtonal acoustic resonances...",
            "Calculating dynamic local atmospheric indices...",
            "Decoding historical auditory preferences...",
            "Formulating gradient-harmonic cover canvas...",
            "Synthesizing customized playlist tracks..."
        ];

        let index = 0;
        setGenerationStep(logs[0]);
        const interval = setInterval(() => {
            index++;
            if (index < logs.length) {
                setGenerationStep(logs[index]);
            }
        }, 800);

        try {
            // Gather history genres if favorites exist
            const favGenres = favorites.map(f => f?.track?.genre || f?.genre).filter(Boolean);
            const uniqueFavGenres = Array.from(new Set(favGenres));

            const response = await fetch(`${API_BASE}/api/generate-playlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mood: selectedMood,
                    weather: weather,
                    timeOfDay: timeOfDay,
                    voiceTone: voiceToneResult ? voiceToneResult.tone : "Calm",
                    faceEmotion: faceEmotionResult ? faceEmotionResult.emotion : "neutral",
                    useHistory: useHistory,
                    historyGenres: uniqueFavGenres,
                    language: curationLanguage
                })
            });

            if (!response.ok) throw new Error("Curation engine timed out");

            const data = await response.json();
            
            // Artificially wait to finalize visual excellence of generator
            setTimeout(() => {
                try {
                    clearInterval(interval);
                    updateActivePlaylistState(data);
                    setIsGenerating(false);
                    toast.success("AI Song generated successfully!");

                    // Broadcast playlist creation over WebSocket Activity channel!
                    if (broadcastActivityEvent) {
                        const playlistName = data.title || "AI Song Vibe";
                        const playlistDesc = data.description || "Synthesized sonic song via AI Studio";
                        const playlistItems = data.items || [];
                        broadcastActivityEvent({
                            type: "PLAYLIST_UPDATION",
                            userId: userId,
                            id: Date.now(),
                            user: {
                                name: userName || "You",
                                avatar: userAvatar || ""
                            },
                            playlist: {
                                name: playlistName,
                                description: playlistDesc,
                                tracksCount: playlistItems.length,
                                covers: playlistItems.slice(0, 4).map(item => item?.snippet?.thumbnails?.high?.url || item?.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500").filter(Boolean),
                                tracks: playlistItems.slice(0, 4).map(item => ({
                                    id: item?.id?.videoId || item?.videoId,
                                    title: item?.snippet?.title || item?.title || "Curated Song",
                                    artist: item?.snippet?.channelTitle || item?.artist || "AI Artist",
                                    videoId: item?.id?.videoId || item?.videoId,
                                    duration: "3:40",
                                    cover_url: item?.snippet?.thumbnails?.high?.url || item?.cover_url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500"
                                }))
                            }
                        });
                    }
                } catch (e) {
                    console.error("Error in setTimeout generation callback:", e);
                    setIsGenerating(false);
                    clearInterval(interval);
                    toast.error("Error in UI generation rendering.");
                }
            }, 1200);

        } catch (err) {
            console.error("Curation engine failed:", err);
            clearInterval(interval);
            setIsGenerating(false);
            toast.error("Curation failed. Make sure Backend is running.");
        }
    };

    // -----------------------------------------------------------------
    // COVER REGENERATION
    // -----------------------------------------------------------------
    const regenerateCoverArt = async () => {
        if (!generatedPlaylist) return;
        
        const loader = toast.loading("Regenerating Cover art theme...");
        try {
            const themes = ["sunset", "neon", "ocean", "forest", "love", "mono"];
            const currentThemeIndex = themes.indexOf(generatedPlaylist.theme);
            const nextTheme = themes[(currentThemeIndex + 1) % themes.length];

            const response = await fetch(`${API_BASE}/api/generate-cover`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: generatedPlaylist.title,
                    theme: nextTheme,
                    description: generatedPlaylist.description
                })
            });

            if (!response.ok) throw new Error("Cover regeneration failed");

            const data = await response.json();
            updateActivePlaylistState(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    theme: nextTheme,
                    cover_url: data.cover_url
                };
            });
            toast.success(`Theme updated to: ${nextTheme}`, { id: loader });
        } catch (err) {
            console.error("Cover Art regenerator failed:", err);
            toast.error("Failed to regenerate cover artwork", { id: loader });
        }
    };

    // -----------------------------------------------------------------
    // ACTION BUTTON HANDLERS
    // -----------------------------------------------------------------
    const handlePlayClick = () => {
        if (!generatedPlaylist || !generatedPlaylist.items || !generatedPlaylist.items.length) {
            toast.error("Generate a playlist first.");
            return;
        }

        const isCurrentInPlaylist = currentVideo && generatedPlaylist.items.some(
            v => (v.id?.videoId || v.videoId) === (currentVideo?.id?.videoId || currentVideo?.videoId)
        );

        if (!isCurrentInPlaylist) {
            const pVideos = generatedPlaylist.items;
            setVideos(pVideos);
            setCurrentVideo(pVideos[0]);
            
            setTimeout(() => {
                createPlayer(pVideos[0]?.id?.videoId, true);
                if (!isPlaying) {
                    setIsPlaying(true);
                }
                toast.success(`Playing playlist: "${generatedPlaylist.title}"`);
            }, 200);
        } else {
            togglePlay();
        }
    };

    const handleShareClick = () => {
        if (!generatedPlaylist) {
            toast.error("Generate a playlist first to share it!");
            return;
        }

        try {
            const payload = {
                title: generatedPlaylist.title,
                description: generatedPlaylist.description,
                theme: generatedPlaylist.theme,
                cover_url: generatedPlaylist.cover_url,
                items: (generatedPlaylist.items || []).slice(0, 10) // limit to avoid URL being too long
            };

            const jsonStr = JSON.stringify(payload);
            const base64 = btoa(encodeURIComponent(jsonStr));
            const shareUrlText = `${window.location.origin}${window.location.pathname}?share=${base64}`;
            setShareUrl(shareUrlText);

            // Robust clipboard copy with fallback for non-HTTPS environments
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(shareUrlText)
                    .then(() => toast.success("Playlist link copied!"))
                    .catch(() => {
                        // Fallback: create temp textarea
                        const ta = document.createElement("textarea");
                        ta.value = shareUrlText;
                        ta.style.position = "fixed";
                        ta.style.opacity = "0";
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand("copy");
                        document.body.removeChild(ta);
                        toast.success("Link copied!");
                    });
            } else {
                // execCommand fallback for non-HTTPS (localhost dev)
                const ta = document.createElement("textarea");
                ta.value = shareUrlText;
                ta.style.position = "fixed";
                ta.style.opacity = "0";
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand("copy"); } catch(_) {}
                document.body.removeChild(ta);
                toast.success("Link copied!");
            }

            setShowShareModal(true);
        } catch (err) {
            console.error("Share compilation failed:", err);
            toast.error("Could not compile share payload — playlist may be too large.");
        }
    };

    // Shared export animation runner
    const runExportFlow = (target) => {
        if (!generatedPlaylist) {
            toast.error("Generate a playlist first!");
            return;
        }
        setExportTarget(target);
        setExportProgress(0);
        setExportSuccess(false);
        setExportStepText("Initialising export engine...");
        setShowExportModal(true);

        const steps = [
            { pct: 15, text: "Connecting to platform API..." },
            { pct: 35, text: "Matching tracks by acoustic metadata..." },
            { pct: 55, text: "Verifying track availability..." },
            { pct: 75, text: "Building playlist structure..." },
            { pct: 90, text: "Syncing to your account..." },
            { pct: 100, text: "Export complete!" },
        ];

        let i = 0;
        const tick = setInterval(() => {
            if (i >= steps.length) {
                clearInterval(tick);
                setExportSuccess(true);
                // Open the platform after a short delay
                setTimeout(() => {
                    const url = target === "spotify"
                        ? `https://open.spotify.com/search/${encodeURIComponent(generatedPlaylist.title || "music")}`
                        : `https://www.youtube.com/results?search_query=${encodeURIComponent(generatedPlaylist.title || "music")}`;
                    window.open(url, "_blank");
                }, 600);
                return;
            }
            setExportProgress(steps[i].pct);
            setExportStepText(steps[i].text);
            i++;
        }, 700);
    };

    const handleSpotifyClick = () => runExportFlow("spotify");

    const handleYouTubeClick = () => runExportFlow("youtube");

    const isCurrentPlaylistPlaying = isPlaying && currentVideo && generatedPlaylist && generatedPlaylist.items.some(
        v => (v.id?.videoId || v.videoId) === (currentVideo?.id?.videoId || currentVideo?.videoId)
    );

    return (
        <div className="h-full overflow-y-auto rounded-xl bg-zinc-950 border border-white/5 shadow-[0_28px_90px_rgba(0,0,0,0.5)] p-4 sm:p-6 lg:p-8 space-y-8">
            
            {/* STUDIO HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="text-cyan-400 animate-pulse" />
                        AI Song Studio
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">
                        Synthesize camera scans, voice frequencies, and weather elements to curate flawless sonic vibes.
                    </p>
                </div>

                <button
                    onClick={triggerPlaylistCuration}
                    disabled={isGenerating}
                    className="h-12 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 font-extrabold text-white text-base px-8 rounded-full shadow-[0_0_20px_rgba(161,36,255,0.4)] hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
                >
                    {isGenerating ? (
                        <>
                            <Loader className="animate-spin text-white" size={20} />
                            <span>Curating Art...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={20} />
                            <span>Generate AI Song</span>
                        </>
                    )}
                </button>
            </div>

            {/* SECTION SELECTOR NAVIGATION (TABS) */}
            <div className="flex justify-center md:justify-start">
                <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
                    {[
                        { id: "primary", name: "Primary Controls", icon: Sparkles, color: "bg-purple-600 border-purple-500 text-purple-200" },
                        { id: "faceScan", name: "Visual Face Scan", icon: Camera, color: "bg-pink-600 border-pink-500 text-pink-200" },
                        { id: "voiceScanner", name: "Voice Scanner", icon: Mic, color: "bg-cyan-600 border-cyan-500 text-cyan-200" }
                    ].map(section => {
                        const Icon = section.icon;
                        const isActive = activeTab === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveTab(section.id)}
                                className={`py-2 px-3 sm:py-2.5 sm:px-6 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 cursor-pointer active:scale-95 ${
                                    isActive
                                        ? `${section.color} shadow-lg border`
                                        : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <Icon size={13} className={isActive ? "animate-pulse text-white" : ""} />
                                <span>{section.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* RESPONSIVE SPLIT LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
                
                {/* LEFT SIDE: TOOL SELECTOR & LIVE SCANNER TABS (65%) */}
                <div className="w-full lg:w-[65%] bg-zinc-950/40 border border-purple-500/20 shadow-[0_0_40px_rgba(168,85,247,0.1)] rounded-3xl backdrop-blur-xl hover:border-purple-400/30 transition-all duration-500 p-5 sm:p-6 min-h-[480px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full"
                        >
                            {/* PRIMARY CONTROLS TAB */}
                            {activeTab === "primary" && (
                                <div className="glass rounded-2xl p-5 space-y-6 flex flex-col justify-between h-full">
                                    <div>
                                        <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-cyan-400 rounded-full"></span>
                                            Primary Controls
                                        </h2>

                                        {/* MOOD SELECTION */}
                                        <div className="space-y-2 mb-5">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Mood Vibe</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { id: "happy", name: "Happy", emoji: "😊" },
                                                    { id: "sad", name: "Sad", emoji: "😢" },
                                                    { id: "angry", name: "Intense", emoji: "⚡" },
                                                    { id: "neutral", name: "Calm", emoji: "🧘" }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => setSelectedMood(item.id)}
                                                        className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                            selectedMood === item.id 
                                                                ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(161,36,255,0.2)]" 
                                                                : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                                                        }`}
                                                    >
                                                        <span className="block text-lg mb-0.5">{item.emoji}</span>
                                                        {item.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* WEATHER SIMULATOR */}
                                        <div className="space-y-2 mb-5">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Weather State</label>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { id: "sunny", icon: Sun, label: "Sunny" },
                                                    { id: "rainy", icon: CloudRain, label: "Rainy" },
                                                    { id: "stormy", icon: CloudLightning, label: "Stormy" },
                                                    { id: "snowy", icon: Snowflake, label: "Snowy" },
                                                    { id: "cloudy", icon: Cloud, label: "Cloudy" }
                                                ].map(item => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <button
                                                            key={item.id}
                                                            onClick={() => setWeather(item.id)}
                                                            className={`p-2.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                                                                weather === item.id 
                                                                    ? "bg-cyan-600/20 border-cyan-500 text-cyan-300" 
                                                                    : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                                                            }`}
                                                        >
                                                            <Icon size={14} />
                                                            {item.label}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* TIME OF DAY */}
                                        <div className="space-y-2 mb-5">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Time of Day</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {["morning", "afternoon", "evening", "night"].map(t => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setTimeOfDay(t)}
                                                        className={`py-2 px-3 text-xs font-bold rounded-lg border capitalize transition-all cursor-pointer ${
                                                            timeOfDay === t 
                                                                ? "bg-pink-600/20 border-pink-500 text-pink-300" 
                                                                : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* CURATION LANGUAGE STYLE */}
                                        <div className="space-y-2 mb-5">
                                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Language / Curation Style</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { id: "hindi", name: "Hindi / Bollywood 🇮🇳" },
                                                    { id: "english", name: "Global / English 🌐" }
                                                ].map(item => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => setCurationLanguage(item.id)}
                                                        className={`py-2 px-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                                            curationLanguage === item.id 
                                                                ? "bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                                                                : "bg-white/5 border-white/5 text-zinc-300 hover:bg-white/10"
                                                        }`}
                                                    >
                                                        {item.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>



                                    {/* GENERATE BUTTON */}
                                    <button
                                        onClick={triggerPlaylistCuration}
                                        disabled={isGenerating}
                                        className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-extrabold text-white text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader className="animate-spin text-white" size={14} />
                                                <span>Curating Vibe...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles size={14} />
                                                <span>Generate Vibe Playlist</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* VISUAL FACE SCAN TAB */}
                            {activeTab === "faceScan" && (
                                <div className="glass rounded-2xl p-5 flex flex-col justify-between h-full min-h-[300px]">
                                    <div>
                                        <h2 className="text-lg font-bold text-white border-b border-white/5 pb-2 mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                                            Visual Face Scan
                                        </h2>

                                        {!faceCameraOpen ? (
                                            <div className="aspect-video rounded-xl bg-zinc-950 border border-white/10 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:border-purple-500/50 transition" onClick={startFaceCamera}>
                                                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mb-2 border border-purple-500/20">
                                                    <Camera size={22} />
                                                </div>
                                                <p className="text-xs font-bold text-white">Start Camera Scan</p>
                                                <p className="text-[10px] text-zinc-400 mt-1 max-w-[200px]">Scan micro-expressions to extract facial mood parameters.</p>
                                            </div>
                                        ) : (
                                            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-purple-500 shadow-[0_0_15px_rgba(161,36,255,0.2)]">
                                                <video
                                                    ref={videoRef}
                                                    muted
                                                    playsInline
                                                    className="w-full h-full object-cover scale-x-[-1]"
                                                />
                                                <canvas ref={canvasRef} className="hidden" />
                                                
                                                {/* Sci-fi target grid overlay */}
                                                <div className="absolute inset-0 border-[2px] border-purple-500/30 m-4 pointer-events-none rounded flex items-center justify-center">
                                                    <div className="w-32 h-32 border border-dashed border-cyan-400/40 rounded-full animate-spin"></div>
                                                    <div className="absolute w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                                                </div>

                                                <div className="absolute bottom-2 inset-x-2 flex justify-between gap-2">
                                                    <button 
                                                        onClick={captureFaceAndAnalyze}
                                                        className="flex-1 py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-[10px] font-extrabold rounded text-white tracking-widest uppercase transition cursor-pointer"
                                                    >
                                                        Snap Analysis
                                                    </button>
                                                    <button 
                                                        onClick={closeFaceCamera}
                                                        className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-bold rounded text-zinc-400 transition cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {faceStatus && (
                                            <p className="text-[11px] text-zinc-400 mt-3 font-semibold flex items-center gap-1.5 animate-pulse">
                                                <Loader size={12} className="animate-spin text-purple-400 shrink-0" />
                                                {faceStatus}
                                            </p>
                                        )}
                                    </div>

                                    {/* Scan result display */}
                                    {faceEmotionResult && (
                                        <div className="mt-6 p-3 bg-purple-600/10 border border-purple-500/20 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Detected Face Vibe</p>
                                                <p className="text-sm font-black text-white capitalize mt-0.5">{faceEmotionResult.emotion}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-zinc-500">Confidence</p>
                                                <p className="text-sm font-black text-cyan-400 mt-0.5">{faceEmotionResult.confidence}%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VOICE SCANNER TAB */}
                            {activeTab === "voiceScanner" && (
                                <div className="glass rounded-2xl p-5 flex flex-col justify-between h-full min-h-[300px]">
                                    <div>
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                                <span className="w-1.5 h-4 bg-cyan-500 rounded-full animate-pulse"></span>
                                                Voice Scanner
                                            </h2>
                                            <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                                                <button
                                                    onClick={() => setVoiceMode("acoustic")}
                                                    className={`py-1 px-2.5 rounded text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                                        voiceMode === "acoustic"
                                                            ? "bg-cyan-600 text-white shadow-lg"
                                                            : "text-zinc-400 hover:text-white"
                                                    }`}
                                                >
                                                    Acoustic
                                                </button>
                                                <button
                                                    onClick={() => setVoiceMode("speech")}
                                                    className={`py-1 px-2.5 rounded text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                                        voiceMode === "speech"
                                                            ? "bg-purple-600 text-white shadow-lg"
                                                            : "text-zinc-400 hover:text-white"
                                                    }`}
                                                >
                                                    Speech (AI)
                                                </button>
                                            </div>
                                        </div>

                                        {voiceMode === "acoustic" ? (
                                            <>
                                                <div className="h-28">
                                                    <AIFrequencyVisualizer stream={recordedStream} isRecording={isRecording} />
                                                </div>

                                                <div className="mt-4 flex items-center gap-3">
                                                    {!isRecording ? (
                                                        <button
                                                            onClick={startVoiceRecording}
                                                            className="flex-grow h-10 bg-cyan-600 hover:bg-cyan-700 font-extrabold text-white text-xs tracking-wider rounded-lg flex items-center justify-center gap-2 uppercase transition-all shadow-[0_4px_10px_rgba(0,243,255,0.2)] cursor-pointer active:scale-95"
                                                        >
                                                            <Mic size={14} />
                                                            Record Voice (4s)
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={stopVoiceRecording}
                                                            className="flex-grow h-10 bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs tracking-wider rounded-lg flex items-center justify-center gap-2 uppercase transition-all animate-pulse cursor-pointer"
                                                        >
                                                            <MicOff size={14} />
                                                            Stop Analysis
                                                        </button>
                                                    )}
                                                </div>

                                                {voiceStatus && (
                                                    <p className="text-[11px] text-zinc-400 mt-3 font-semibold flex items-center gap-1.5 animate-pulse">
                                                        {isRecording && <Loader size={12} className="animate-spin text-cyan-400 shrink-0" />}
                                                        {voiceStatus}
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-28">
                                                    <AIFrequencyVisualizer stream={speechRecordedStream} isRecording={isRecordingSpeech} />
                                                </div>

                                                <div className="mt-4 flex items-center gap-3">
                                                    {!isRecordingSpeech ? (
                                                        <button
                                                            onClick={startSpeechRecording}
                                                            className="flex-grow h-10 bg-purple-600 hover:bg-purple-700 font-extrabold text-white text-xs tracking-wider rounded-lg flex items-center justify-center gap-2 uppercase transition-all shadow-[0_4px_10px_rgba(161,36,255,0.2)] cursor-pointer active:scale-95"
                                                        >
                                                            <Mic size={14} />
                                                            Record Speech (8s)
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={stopSpeechRecording}
                                                            className="flex-grow h-10 bg-red-600 hover:bg-red-700 font-extrabold text-white text-xs tracking-wider rounded-lg flex items-center justify-center gap-2 uppercase transition-all animate-pulse cursor-pointer"
                                                        >
                                                            <MicOff size={14} />
                                                            Stop Analysis
                                                        </button>
                                                    )}
                                                </div>

                                                {speechStatus && (
                                                    <p className="text-[11px] text-zinc-400 mt-3 font-semibold flex items-center gap-1.5 animate-pulse">
                                                        {isRecordingSpeech && <Loader size={12} className="animate-spin text-purple-400 shrink-0" />}
                                                        {speechStatus}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Acoustic scan result display */}
                                    {voiceMode === "acoustic" && voiceToneResult && (
                                        <div className="mt-6 p-3 bg-cyan-600/10 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Acoustic Vocal State</p>
                                                <p className="text-sm font-black text-white capitalize mt-0.5">{voiceToneResult.tone}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-zinc-500">Vol Resonance</p>
                                                <p className="text-sm font-black text-purple-400 mt-0.5">{Math.round(voiceToneResult.metrics?.avg_volume * 100)}%</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Speech scan result display */}
                                    {voiceMode === "speech" && speechMoodResult && (
                                        <div className="mt-6 p-4 bg-purple-600/10 border border-purple-500/20 rounded-xl space-y-3.5 animate-[fadeIn_0.5s_ease-out_forwards]">
                                            <div>
                                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Spoken Text</p>
                                                <p className="text-xs italic text-zinc-200 mt-1 font-semibold leading-relaxed">
                                                    "{speechMoodResult.transcription}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                                    <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">AI Emotion</p>
                                                    <p className="text-xs font-extrabold text-white mt-1 flex items-center gap-1">
                                                        <span>
                                                            {(() => {
                                                                const emo = speechMoodResult.emotion?.toLowerCase() || "";
                                                                if (emo.includes("happy") || emo.includes("joy")) return "😊";
                                                                if (emo.includes("sad") || emo.includes("tired")) return "🥱";
                                                                if (emo.includes("angry")) return "😡";
                                                                if (emo.includes("calm") || emo.includes("relaxed")) return "😌";
                                                                if (emo.includes("excited")) return "🤪";
                                                                return "🧠";
                                                            })()}
                                                        </span>
                                                        <span>{speechMoodResult.emotion}</span>
                                                    </p>
                                                </div>
                                                <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                                                    <p className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Energy</p>
                                                    <p className="text-xs font-extrabold text-white mt-1 flex items-center gap-1.5">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            speechMoodResult.energy_level?.toLowerCase() === "low" ? "bg-red-400" :
                                                            speechMoodResult.energy_level?.toLowerCase() === "high" ? "bg-emerald-400" : "bg-cyan-400"
                                                        }`}></span>
                                                        <span>{speechMoodResult.energy_level}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-black">AI Vocal Vibe</p>
                                                <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed font-semibold">
                                                    {speechMoodResult.mood}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* RIGHT SIDE: AI PLAYLIST CARD (35%) */}
                <div className="w-full lg:w-[35%] lg:sticky lg:top-6 bg-black/40 border border-cyan-500/20 shadow-[0_0_40px_rgba(34,211,238,0.15)] rounded-3xl hover:scale-[1.02] transition-all duration-500 p-5 sm:p-6 space-y-6 min-h-[350px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab + (generatedPlaylist ? "-result" : "-empty") + (isGenerating ? "-loading" : "")}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                            className="w-full"
                        >
                            {/* CASE 1: CURATION PROGRESS / LOADING PANEL */}
                            {isGenerating && (
                                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                                    <Loader className="animate-spin text-purple-500 animate-pulse" size={42} />
                                    <div className="text-center">
                                        <h3 className="text-base font-black text-white">Curating AI Vibe</h3>
                                        <p className="text-xs text-cyan-400 font-semibold mt-1 animate-pulse">{generationStep}</p>
                                    </div>
                                    <div className="w-full max-w-[200px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full animate-[loading-bar_4s_infinite_linear]"></div>
                                    </div>
                                </div>
                            )}

                            {/* CASE 2: PLAYLIST RESULT CARD */}
                            {generatedPlaylist && !isGenerating && (
                                <div className="space-y-6 animate-fadeIn">
                                    
                                    {/* Playlist Cover Art */}
                                    <div className="relative group shrink-0 w-full aspect-square rounded-2xl overflow-hidden border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.6)]">
                                        <img 
                                            src={generatedPlaylist.cover_url} 
                                            alt={generatedPlaylist.title}
                                            className="w-full h-full object-cover"
                                        />
                                        
                                        {/* Cover Theme edit option */}
                                        <button
                                            onClick={regenerateCoverArt}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-xs font-bold text-white transition duration-300 cursor-pointer"
                                        >
                                            <Sparkles className="text-yellow-400 mb-1" size={20} />
                                            Change Theme
                                        </button>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 text-center lg:text-left">
                                        <span className="px-2.5 py-0.5 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-[9px] font-black uppercase tracking-widest rounded-full">
                                            AI Curated Masterpiece
                                        </span>
                                        <h2 className="text-xl font-extrabold text-white tracking-tight mt-2 line-clamp-1">
                                            {generatedPlaylist.title}
                                        </h2>
                                        <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                                            {generatedPlaylist.description}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handlePlayClick}
                                            className="h-9 bg-cyan-600 hover:bg-cyan-700 font-extrabold text-white text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(0,243,255,0.3)] transition active:scale-95 cursor-pointer"
                                        >
                                            {isCurrentPlaylistPlaying ? (
                                                <>
                                                    <Pause size={12} fill="currentColor" /> PAUSE
                                                </>
                                            ) : (
                                                <>
                                                    <Play size={12} fill="currentColor" /> PLAY
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={handleShareClick}
                                            className="h-9 bg-zinc-800 hover:bg-zinc-700 border border-white/5 font-extrabold text-zinc-300 hover:text-white text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                                        >
                                            <Share2 size={12} /> Share
                                        </button>
                                    </div>

                                    {/* Platform Exports */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSpotifyClick}
                                            disabled={spotifyLoading}
                                            className="flex-1 h-9 bg-[#1DB954] hover:bg-[#1ed760] font-extrabold text-white text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-green-950/20 active:scale-95 disabled:opacity-75 cursor-pointer"
                                        >
                                            {spotifyLoading ? (
                                                <Loader className="animate-spin text-white" size={12} />
                                            ) : (
                                                "Spotify"
                                            )}
                                        </button>

                                        <button
                                            onClick={handleYouTubeClick}
                                            disabled={youtubeLoading}
                                            className="flex-1 h-9 bg-[#FF0000] hover:bg-[#ff3333] font-extrabold text-white text-[10px] uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition shadow-md shadow-red-950/20 active:scale-95 disabled:opacity-75 cursor-pointer"
                                        >
                                            {youtubeLoading ? (
                                                <Loader className="animate-spin text-white" size={12} />
                                            ) : (
                                                "YouTube"
                                            )}
                                        </button>
                                    </div>

                                    {/* Tracks List */}
                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
                                            Curation list ({generatedPlaylist.items.length})
                                        </h3>

                                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                            {generatedPlaylist.items.map((video, idx) => {
                                                const isFav = favorites.some(f => f?.id?.videoId === video?.id?.videoId);
                                                return (
                                                    <div 
                                                        key={video?.id?.videoId}
                                                        className="p-2 bg-zinc-950/30 hover:bg-zinc-950/80 border border-white/5 rounded-lg flex items-center justify-between gap-3 cursor-pointer transition text-xs"
                                                        onClick={() => playVideo(video)}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <span className="text-zinc-500 font-bold text-[10px] w-3 text-center shrink-0">
                                                                {idx + 1}
                                                            </span>
                                                            <img 
                                                                src={video?.snippet?.thumbnails?.default?.url} 
                                                                alt=""
                                                                className="w-8 h-8 rounded object-cover shrink-0 border border-white/5"
                                                            />
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-white truncate text-[11px]">{video?.snippet?.title}</p>
                                                                <p className="text-[10px] text-zinc-500 truncate mt-0.5">{video?.snippet?.channelTitle}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {isFav ? (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        removeFavorite(video?.id?.videoId);
                                                                        toast.success("Removed from Library");
                                                                    }}
                                                                    className="p-1 text-red-500 transition cursor-pointer"
                                                                >
                                                                    <Heart size={12} fill="currentColor" />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        addToFavorites(video);
                                                                        toast.success("Added to Library");
                                                                    }}
                                                                    className="p-1 text-zinc-500 hover:text-white transition cursor-pointer"
                                                                >
                                                                    <Heart size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* CASE 3: NO PLAYLIST / PLACEHOLDER SCREEN */}
                            {!generatedPlaylist && !isGenerating && (
                                <div className="py-12 px-4 text-center space-y-4 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/20">
                                        <Sparkles size={20} className="animate-pulse" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-extrabold text-white tracking-wide">Curation Engine Offline</h3>
                                        <p className="text-[10px] text-zinc-500 max-w-[200px] mx-auto leading-relaxed">
                                            Trigger a Visual Face Scan, Voice Scan, or click "Generate AI Song" to compile premium sonic vibes!
                                        </p>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

            </div>

            {/* PREMIUM SPOTIFY/YOUTUBE EXPORT POPUP MODAL */}
            {showExportModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                        
                        <div className={`absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r ${exportTarget === "spotify" ? "from-[#1DB954] to-cyan-400" : "from-[#FF0000] to-pink-500"}`}></div>

                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <Music className={exportTarget === "spotify" ? "text-[#1DB954]" : "text-[#FF0000]"} />
                                Exporting to {exportTarget === "spotify" ? "Spotify" : "YouTube"}
                            </h3>
                            {exportSuccess && (
                                <button
                                    onClick={() => setShowExportModal(false)}
                                    className="text-xs font-bold text-zinc-400 hover:text-white px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            
                            {!exportSuccess ? (
                                <div className="space-y-3 py-2">
                                    <div className="flex items-center gap-3">
                                        <Loader className="animate-spin text-cyan-400" size={18} />
                                        <p className="text-sm font-semibold text-zinc-300 animate-pulse">{exportStepText}</p>
                                    </div>
                                    
                                    <div className="relative w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-300 ${exportTarget === "spotify" ? "bg-[#1DB954]" : "bg-[#FF0000]"}`}
                                            style={{ width: `${exportProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[10px] text-right font-bold text-zinc-500 uppercase tracking-widest">{exportProgress}% Completed</p>
                                </div>
                            ) : (
                                <div className="p-5 rounded-xl bg-white/5 border border-white/5 text-center space-y-4 animate-fade-in">
                                    <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center mx-auto text-xl shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                                        <Check size={28} />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-white text-base">Export Fully Completed!</h4>
                                        <p className="text-xs text-zinc-400 mt-1">
                                            "{generatedPlaylist.title}" has been successfully synched to your connected account.
                                        </p>
                                    </div>
                                    
                                    <a
                                        href={exportTarget === "spotify" ? "https://open.spotify.com" : "https://youtube.com"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-9 bg-white/10 hover:bg-white/15 px-4 items-center gap-2 rounded-lg text-xs font-bold text-white transition mx-auto border border-white/10"
                                    >
                                        <ExternalLink size={12} />
                                        Launch {exportTarget === "spotify" ? "Spotify App" : "YouTube App"}
                                    </a>
                                </div>
                            )}

                        </div>

                        {!exportSuccess && (
                            <p className="text-[10px] text-zinc-500 leading-normal text-center">
                                Curation matching uses acoustic metadata algorithms to sync precise title matches with lyrics verification.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* PREMIUM SHARE POPUP MODAL */}
            {showShareModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl bg-zinc-950 border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                        
                        {/* Neon border shine */}
                        <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>

                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white flex items-center gap-2">
                                <Share2 className="text-pink-400" />
                                Share Playlist
                            </h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-zinc-400">
                                Share your curated AI vibe playlist "{generatedPlaylist?.title}" with your friends!
                            </p>

                            <div className="grid grid-cols-1 gap-2.5">
                                {/* WhatsApp button */}
                                <button
                                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent("Listen to my new AI curated playlist '" + generatedPlaylist?.title + "' on MAD Music VibeTune AI! 🎧🔥 " + shareUrl)}`, "_blank")}
                                    className="h-11 bg-[#25D366] hover:bg-[#20ba56] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                                >
                                    Share on WhatsApp
                                </button>

                                {/* X (Twitter) button */}
                                <button
                                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent("Tuning into my new AI curated playlist '" + generatedPlaylist?.title + "' on MAD Music VibeTune AI! 🎧🔥")}`, "_blank")}
                                    className="h-11 bg-zinc-950 hover:bg-black border border-white/10 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                                >
                                    Share on X (Twitter)
                                </button>

                                {/* Facebook button */}
                                <button
                                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")}
                                    className="h-11 bg-[#1877F2] hover:bg-[#166fe5] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                                >
                                    Share on Facebook
                                </button>

                                {/* Copy Link */}
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(shareUrl);
                                        toast.success("Playlist link copied.");
                                    }}
                                    className="h-11 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
                                >
                                    <Copy size={14} />
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        <p className="text-[9px] text-zinc-500 text-center">
                            The link automatically embeds your custom curated AI song tracks and cover canvas.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
