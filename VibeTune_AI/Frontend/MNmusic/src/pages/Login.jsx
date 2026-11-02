import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Moon, Sun, Music, Heart, Zap } from "lucide-react";
import { toast } from "react-toastify";
import '../index.css';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const navigate = useNavigate();

    const API_BASE = "http://127.0.0.1:8000";

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) { 
            toast.error("Please fill in all required fields."); 
            return; 
        }
        if (!isLogin && !name.trim()) { 
            toast.error("Please enter your name to sign up."); 
            return; 
        }
        
        setLoading(true);
        const loadingToastId = toast.loading(`${isLogin ? "Logging in" : "Creating account"}...`);
        try {
            const url = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;
            const payload = isLogin ? { email, password } : { name, email, password };
            
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || "Authentication failed.");
            }
            
            const data = await response.json();
            const userProfile = { 
                name: data.user.name, 
                email: data.user.email, 
                avatar: data.user.avatar || "", 
                userId: data.user.id,
                authenticated: true 
            };
            
            localStorage.setItem("user_token", data.access_token);
            localStorage.setItem("user_session", JSON.stringify(userProfile));
            localStorage.setItem("profile", JSON.stringify({ name: userProfile.name, avatar: userProfile.avatar, userId: userProfile.userId }));
            
            if (isLogin) {
                // Login successful
                toast.success("Welcome back to MAD Music VibeTune AI! 🎧", { autoClose: 4000 });
                navigate("/");
                window.location.reload();
            } else {
                // Registration successful - Show success toast and redirect to login after 2 seconds
                toast.dismiss(loadingToastId);
                toast.success("Registration Successful! Please login to continue.", { 
                    autoClose: 2000,
                    onClose: () => {
                        // Switch to login form after toast disappears
                        setIsLogin(true);
                        // Clear form fields for fresh login
                        setEmail("");
                        setPassword("");
                        setName("");
                    }
                });
            }
        } catch (err) {
            toast.dismiss(loadingToastId);
            toast.error(err.message || "Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        const loadingToastId = toast.loading("Connecting with Google...");
        try {
            await new Promise((r) => setTimeout(r, 1200));
            const userProfile = { 
                name: "Google User", 
                email: "google_user@gmail.com", 
                avatar: "", 
                authenticated: true 
            };
            localStorage.setItem("user_session", JSON.stringify(userProfile));
            localStorage.setItem("profile", JSON.stringify({ name: userProfile.name, avatar: "" }));
            toast.dismiss(loadingToastId);
            toast.success("Logged in with Google! 🎧", { autoClose: 4000 });
            navigate("/");
            window.location.reload();
        } catch (err) {
            toast.dismiss(loadingToastId);
            toast.error("Google authentication failed.");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#05030a] font-sans overflow-x-hidden relative p-4 md:p-8 select-none">
            
            {/* Ambient Background Glow Blobs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[20%] left-[15%] w-[450px] h-[450px] rounded-full bg-[#ec4899]/10 blur-[130px]" />
                <div className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] rounded-full bg-[#7c3aed]/10 blur-[130px]" />
            </div>

            {/* Quick AutoFill floating badge */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={() => {
                        setEmail("manishadobliyal123@gmail.com");
                        setPassword("Mn123456");
                        setName("Manisha");
                        toast.success("Demo credentials loaded! 🔥");
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#ec4899] hover:text-[#7c3aed] transition-all border border-[#ec4899]/30 hover:border-[#7c3aed]/40 bg-[#0f0b1a]/80 backdrop-blur-md rounded-full px-4 py-2 shadow-lg"
                >
                    <Sparkles className="w-3.5 h-3.5" /> Auto Fill Demo
                </button>
            </div>

            {/* Main responsive grid layout */}
            <div className="relative w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* ══════════════════════════════════
                    LEFT PANEL – Brand Showcase
                ══════════════════════════════════ */}
                <div className="hidden lg:flex lg:col-span-7 flex-col justify-between min-h-[660px] text-white pr-4 relative">
                    
                    {/* Header: Logo */}
                    <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#ec4899] to-[#7c3aed] p-[1.5px] shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                            <div className="w-full h-full rounded-[10px] bg-[#07050f] flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#ec4899] filter drop-shadow-[0_0_4px_rgba(236,72,153,0.6)]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-extrabold tracking-[0.2em] leading-none text-white">MAD</span>
                            <span className="text-[10px] font-medium tracking-[0.15em] text-[#ec4899]">MUSIC</span>
                        </div>
                    </div>

                    {/* Left Center Content */}
                    <div className="my-auto py-8 relative">
                        
                        {/* Slogan */}
                        <span className="text-xs font-semibold text-[#ec4899] tracking-wider uppercase">Welcome to</span>
                        <h1 className="text-5xl font-black mt-2 mb-4 tracking-tight leading-none">
                            MAD <span className="bg-gradient-to-r from-[#a855f7] to-[#ec4899] bg-clip-text text-transparent">MUSIC</span>
                        </h1>
                        <p className="text-sm text-zinc-400 font-medium max-w-sm leading-relaxed">
                            Feel the beat. Discover more.<br />
                            Your music, your vibe.
                        </p>

                        {/* Purple audio wave animation */}
                        <div className="flex items-center gap-1.5 my-6 h-8 opacity-75">
                            {[3.5, 6, 2, 5, 7, 3, 5.5, 4, 6.5, 3.5, 5, 2, 6, 4, 3, 5.5, 7.5, 4.5, 3.5].map((h, i) => (
                                <motion.span 
                                    key={i} 
                                    className="w-[2.5px] rounded-full bg-[#7c3aed]"
                                    style={{ height: `${h * 4}px` }}
                                    animate={{ height: [`${h * 2}px`, `${h * 4}px`, `${h * 2}px`] }}
                                    transition={{
                                        duration: 1.2,
                                        repeat: Infinity,
                                        delay: i * 0.05,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}
                        </div>

                        {/* Interactive AI Card */}
                        <div className="inline-flex items-center gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-4 shadow-xl max-w-sm backdrop-blur-md hover:border-white/10 transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/20 flex items-center justify-center text-[#7c3aed] shrink-0 shadow-inner">
                                <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-xs font-bold text-white">AI Powered Recommendations</h4>
                                <p className="text-[10px] text-zinc-500 mt-0.5">Discover songs you'll love</p>
                            </div>
                        </div>

                        {/* Giant spinning Neon Vinyl Artwork */}
                        <div className="absolute right-[-50px] top-1/2 -translate-y-1/2 w-[340px] h-[340px] pointer-events-none select-none">
                            {/* Glowing Aura Rings */}
                            <div className="absolute inset-0 rounded-full border border-[#7c3aed]/20 blur-[2px] animate-pulse" />
                            <div className="absolute -inset-4 rounded-full border border-[#ec4899]/15 blur-sm animate-ping" style={{ animationDuration: '3s' }} />
                            
                            {/* Vinyl Disc structure */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                                className="w-full h-full rounded-full bg-black relative p-2 shadow-[0_0_50px_rgba(124,85,253,0.3),_0_0_80px_rgba(236,72,153,0.15)]"
                                style={{
                                    background: 'radial-gradient(circle, #100b21 0%, #030206 70%, #000 100%)'
                                }}
                            >
                                {/* Grooves on Vinyl */}
                                <div className="absolute inset-4 rounded-full border border-zinc-800/60" />
                                <div className="absolute inset-8 rounded-full border border-zinc-900/80" />
                                <div className="absolute inset-12 rounded-full border border-zinc-800/40" />
                                <div className="absolute inset-16 rounded-full border border-zinc-900/60" />
                                <div className="absolute inset-20 rounded-full border border-zinc-800/30" />
                                <div className="absolute inset-24 rounded-full border border-zinc-900/50" />
                                
                                {/* Metallic Reflection overlay */}
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/[0.03] via-transparent to-white/[0.03] mix-blend-overlay" />

                                {/* Vinyl Center Badge */}
                                <div className="absolute inset-[33%] rounded-full bg-gradient-to-tr from-[#ec4899] to-[#7c3aed] p-[2px] shadow-[0_0_20px_rgba(124,85,253,0.6)]">
                                    <div className="w-full h-full rounded-full bg-[#0a0616] flex items-center justify-center">
                                        <svg className="w-8 h-8 text-[#ec4899] filter drop-shadow-[0_0_6px_rgba(236,72,153,0.7)]" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                        </svg>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom: Features grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-6 mt-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] shrink-0">
                                <Music className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                                <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Millions of Songs</h5>
                                <p className="text-[9px] text-zinc-500 mt-0.5">Endless music at fingertips</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#ec4899]/10 flex items-center justify-center text-[#ec4899] shrink-0">
                                <Heart className="w-4 h-4 fill-current" />
                            </div>
                            <div className="text-left">
                                <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Personalized for You</h5>
                                <p className="text-[9px] text-zinc-500 mt-0.5">Recommendations just for you</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6] shrink-0">
                                <Zap className="w-4 h-4 fill-current" />
                            </div>
                            <div className="text-left">
                                <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">High Quality Audio</h5>
                                <p className="text-[9px] text-zinc-500 mt-0.5">Enjoy the best sound</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ══════════════════════════════════
                    RIGHT PANEL – Floating Glassmorphic Auth Form Card
                ══════════════════════════════════ */}
                <div className="col-span-1 lg:col-span-5 flex justify-center items-center">
                    
                    <div className="relative w-full max-w-[440px] rounded-[32px] p-[1.5px] bg-[#1a1530]/40 border border-white/[0.04] shadow-[0_30px_80px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                        
                        {/* Card inner casing */}
                        <div className="w-full rounded-[31px] bg-[#0a0813] p-10 relative flex flex-col gap-9 min-h-[610px]">
                            
                            

                            {/* Header Titles */}
                            <div>
                                <h2 className="text-[28px] font-bold text-white flex items-center gap-2 tracking-tight">
                                    {isLogin ? "Welcome Back" : "Create Account"} <span className="text-[#ec4899]">👋</span>
                                </h2>
                                <p className="text-[12.5px] text-zinc-500 mt-1 font-medium">
                                    {isLogin ? "Sign in to continue to" : "Join us and enjoy endless beats at"}{" "}
                                    <span className="text-[#ec4899] font-bold tracking-wide">MAD MUSIC</span>
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleAuthAction} className="flex flex-col gap-6">
                                
                                <div className="flex flex-col gap-6">
                                    
                                    {/* Full Name input for Signup state */}
                                    <AnimatePresence initial={false}>
                                        {!isLogin && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                className="space-y-2 text-left overflow-hidden"
                                            >
                                                <label className="text-[12.5px] font-medium text-zinc-400 pl-1">Full Name</label>
                                                <div className="relative h-[56px] w-full">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10" />
                                                    <input 
                                                        type="text"
                                                        required={!isLogin}
                                                        placeholder="Enter your name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="absolute inset-0 w-full h-full bg-[#130f23]/60 border border-white/[0.04] hover:border-white/[0.08] focus:border-[#7c3aed]/60 rounded-xl pl-12 pr-4 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-all"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Email input field */}
                                    <div className="space-y-2.5 text-left">
                                        <label className="text-[12.5px] font-medium text-zinc-400 pl-1">Email</label>
                                        <div className="relative h-[56px] w-full">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10" />
                                            <input 
                                                type="email"
                                                required
                                                placeholder="Enter your email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="absolute inset-0 w-full h-full bg-[#130f23]/60 border border-white/[0.04] hover:border-white/[0.08] focus:border-[#7c3aed]/60 rounded-xl pl-12 pr-4 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Password input field */}
                                    <div className="space-y-2.5 text-left">
                                        <label className="text-[12.5px] font-medium text-zinc-400 pl-1">Password</label>
                                        <div className="relative h-[56px] w-full">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 z-10" />
                                            <input 
                                                type={showPassword ? "text" : "password"}
                                                required
                                                placeholder="Enter your password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="absolute inset-0 w-full h-full bg-[#130f23]/60 border border-white/[0.04] hover:border-white/[0.08] focus:border-[#7c3aed]/60 rounded-xl pl-12 pr-12 text-[13px] text-white placeholder:text-zinc-600 outline-none transition-all"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition z-10"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember Me / Forgot Password */}
                                    <div className="flex items-center justify-between text-[12px] pt-1 px-1 select-none">
                                        <label className="flex items-center gap-2.5 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                checked={rememberMe} 
                                                onChange={(e) => setRememberMe(e.target.checked)} 
                                                className="sr-only peer" 
                                            />
                                            <div className="w-[18px] h-[18px] rounded-[4px] border border-white/20 peer-checked:bg-[#7c3aed] peer-checked:border-[#7c3aed] transition-all flex items-center justify-center shadow-inner">
                                                <svg className="w-3 h-3 text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </div>
                                            <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors font-medium">Remember me</span>
                                        </label>
                                        {isLogin && (
                                            <button 
                                                type="button" 
                                                onClick={() => toast.success("Password reset sent!")}
                                                className="text-[#ec4899] hover:underline font-bold transition"
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>

                                </div>

                                {/* Sign In Action Button */}
                                <div className="mt-2">
                                    <button 
                                        type="submit" 
                                        disabled={loading || googleLoading}
                                        className="w-full h-[56px] rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#ec4899] hover:from-[#6d28d9] hover:to-[#db2777] active:scale-98 text-white font-bold text-sm tracking-wider transition-all duration-300 shadow-[0_4px_25px_rgba(236,72,153,0.35)] hover:brightness-110 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <span className="flex items-center gap-1.5 font-bold">
                                                {isLogin ? "Sign In" : "Sign Up"} &rarr;
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>

                            {/* Separator / Divider */}
                            <div className="relative py-2 flex items-center justify-center">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/[0.04]" />
                                </div>
                                <span className="relative px-4 bg-[#0a0813] text-[10.5px] text-zinc-600 uppercase tracking-widest font-bold">OR</span>
                            </div>

                            {/* Google Sign-in Action */}
                            {/* <button 
                                onClick={handleGoogleLogin} 
                                disabled={loading || googleLoading}
                                className="w-full h-[56px] rounded-xl bg-transparent hover:bg-white/[0.03] border border-white/[0.05] text-xs text-white font-bold flex items-center justify-center gap-3.5 transition shadow-inner"
                            >
                                {googleLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.48 0-6.3-2.82-6.3-6.3s2.82-6.3 6.3-6.3c1.623 0 3.097.617 4.226 1.625l3.055-3.055C19.263 2.56 15.96 1 12.24 1 5.67 1 .34 6.33.34 12.9s5.33 11.9 11.9 11.9c6.9 0 12.24-4.856 12.24-11.9 0-.67-.06-1.32-.17-1.964H12.24z"/>
                                        </svg>
                                        <span className="font-semibold text-zinc-300">Continue with Google</span>
                                    </>
                                )}
                            </button> */}

                            {/* Toggle sign-in / sign-up Footer */}
                            <div className="text-center text-xs pt-1">
                                <p className="text-zinc-500 font-medium">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button 
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-[#ec4899] hover:underline font-extrabold transition-all"
                                    >
                                        {isLogin ? "Sign Up" : "Sign In"}
                                    </button>
                                </p>
                            </div>

                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}
