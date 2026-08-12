import { useRef, useEffect, useState } from "react";
import { X, Play, Globe, BookOpen, Calendar, User, Maximize2, Minimize2 } from "lucide-react";

const VideoPlayerModal = ({ video, onClose }) => {
    const playerContainerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (!video) return null;

    // Fullscreen + Landscape Orientation Handler for Mobile & Desktop
    const toggleFullscreenLandscape = async () => {
        const container = playerContainerRef.current;
        if (!container) return;

        try {
            if (!document.fullscreenElement) {
                if (container.requestFullscreen) {
                    await container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    await container.webkitRequestFullscreen();
                } else if (container.msRequestFullscreen) {
                    await container.msRequestFullscreen();
                }

                // Force horizontal / landscape orientation on mobile phones
                if (window.screen?.orientation?.lock) {
                    await window.screen.orientation.lock("landscape").catch(() => {
                        // Orientation locking is optional depending on browser support
                    });
                }
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    await document.webkitExitFullscreen();
                }
                if (window.screen?.orientation?.unlock) {
                    window.screen.orientation.unlock();
                }
                setIsFullscreen(false);
            }
        } catch (err) {
            console.log("Fullscreen/Orientation error:", err);
        }
    };

    // Listen to native fullscreen changes (e.g. if user presses ESC or back button)
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFS = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
            setIsFullscreen(isFS);
            if (!isFS && window.screen?.orientation?.unlock) {
                window.screen.orientation.unlock();
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/85 p-2 sm:p-5 backdrop-blur-md animate-fadeIn overflow-y-auto">
            <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl overflow-hidden my-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-800 bg-slate-900/90">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
                            <Play size={20} className="fill-current ml-0.5" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-lg font-bold truncate text-slate-100">
                                {video.title}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                                    video.targetScope === "whole_school"
                                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                        : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                }`}>
                                    {video.targetScope === "whole_school" ? (
                                        <>
                                            <Globe size={11} /> Whole School
                                        </>
                                    ) : (
                                        <>
                                            <BookOpen size={11} /> Std {video.standard} · {video.subject}
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Horizontal Fullscreen Button */}
                        <button
                            type="button"
                            onClick={toggleFullscreenLandscape}
                            className="flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition"
                            title="Fullscreen Horizontal View"
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Horizontal Fullscreen"}</span>
                        </button>

                        <button
                            onClick={onClose}
                            type="button"
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-400 transition hover:bg-rose-600 hover:text-white"
                            title="Close Player"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Video Player Container */}
                <div
                    ref={playerContainerRef}
                    className="relative w-full aspect-video bg-black shadow-inner overflow-hidden"
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1&controls=1&playsinline=1&rel=0&modestbranding=1&fs=1&enablejsapi=1`}
                        title={video.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full border-0"
                    />
                </div>

                {/* Footer Info */}
                <div className="p-4 sm:p-6 bg-slate-900/95 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                            <User size={14} className="text-indigo-400" />
                            <span>Uploaded by <strong className="text-slate-200">{video.uploadedByName}</strong> ({video.uploadedByRole})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                            <Calendar size={14} />
                            <span>{new Date(video.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                    </div>

                    {video.description ? (
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                            {video.description}
                        </p>
                    ) : (
                        <p className="text-xs italic text-slate-500">No additional description provided.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayerModal;
