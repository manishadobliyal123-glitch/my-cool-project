import { useEffect, useRef } from "react";

export default function AIFrequencyVisualizer({ stream, isRecording }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        let height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

        // Handle resize
        const handleResize = () => {
            if (!canvas) return;
            width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        };
        window.addEventListener("resize", handleResize);

        // Web Audio API setup when stream is active
        if (stream && isRecording) {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                const source = audioCtx.createMediaStreamSource(stream);
                const analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                source.connect(analyser);

                audioContextRef.current = audioCtx;
                analyserRef.current = analyser;
                dataArrayRef.current = dataArray;
            } catch (err) {
                console.error("Failed to initialize web audio visualizer:", err);
            }
        }

        // Animation draw loop
        let phase = 0;
        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw premium glow backdrop
            ctx.fillStyle = "rgba(10, 5, 18, 0.4)";
            ctx.fillRect(0, 0, width, height);

            const analyser = analyserRef.current;
            const dataArray = dataArrayRef.current;
            let voiceEnergy = 0;

            if (analyser && dataArray && isRecording) {
                analyser.getByteFrequencyData(dataArray);
                // Compute average energy/volume
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                    sum += dataArray[i];
                }
                voiceEnergy = sum / dataArray.length;
            }

            // Draw multi-layered sine waves for highly aesthetic visual
            const numWaves = 3;
            const colors = [
                "rgba(161, 36, 255, 0.8)", // Neon purple
                "rgba(0, 243, 255, 0.6)",  // Neon cyan
                "rgba(255, 59, 112, 0.4)",  // Rose red
            ];

            const speed = isRecording ? 0.15 + (voiceEnergy * 0.002) : 0.04;
            const amplitude = isRecording 
                ? 15 + (voiceEnergy * 0.8) 
                : 6;

            phase += speed;

            for (let w = 0; w < numWaves; w++) {
                ctx.beginPath();
                ctx.lineWidth = w === 0 ? 3 : 1.5;
                ctx.strokeStyle = colors[w];
                ctx.shadowBlur = 15;
                ctx.shadowColor = colors[w];

                const frequency = 0.005 + (w * 0.002);
                const offset = w * Math.PI * 0.35 + phase;

                for (let x = 0; x < width; x++) {
                    // Apply windowing function (pinch the ends so they sit smoothly at 0)
                    const windowMultiplier = Math.sin((x / width) * Math.PI);
                    const y = height / 2 + Math.sin(x * frequency + offset) * amplitude * windowMultiplier;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }

            // Draw central grid lines or indicators if recording
            if (isRecording) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = "rgba(0, 243, 255, 0.15)";
                ctx.fillRect(0, height / 2 - 1, width, 2);
                
                // Draw floating frequency particles
                ctx.fillStyle = "rgba(161, 36, 255, 0.6)";
                for (let i = 0; i < 8; i++) {
                    const px = (width * 0.1) + ((width * 0.8) * ((i + phase * 0.05) % 1));
                    const py = height / 2 + Math.sin(phase + i) * (amplitude * 0.4);
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {});
            }
        };
    }, [stream, isRecording]);

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-zinc-950/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? "bg-red-500 animate-ping" : "bg-cyan-500"}`}></div>
                <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
                    {isRecording ? "Analyzing Voice Frequencies" : "Frequency Monitor Ready"}
                </span>
            </div>
        </div>
    );
}
