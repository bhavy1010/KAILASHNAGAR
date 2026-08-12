import { useState, useRef, useEffect } from "react";
import { Camera, RefreshCw, X, Check, FlipHorizontal } from "lucide-react";
import Modal from "./Modal";

const CameraModal = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [facingMode, setFacingMode] = useState("environment"); // "user" (front) or "environment" (rear)
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && !capturedImage) {
            startCamera();
        }
        return () => {
            stopCamera();
        };
    }, [isOpen, facingMode]);

    const startCamera = async () => {
        stopCamera();
        setError("");
        setLoading(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setError(
                "Unable to access camera. Please allow camera permissions in your browser or choose a photo from your gallery."
            );
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    const toggleFacingMode = () => {
        setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    };

    const handleTakeSnap = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const ctx = canvas.getContext("2d");
        if (facingMode === "user") {
            // Mirror image for front camera
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
    };

    const handleRetake = () => {
        setCapturedImage(null);
        startCamera();
    };

    const handleConfirm = () => {
        if (!capturedImage || !canvasRef.current) return;

        canvasRef.current.toBlob(
            (blob) => {
                if (blob) {
                    const file = new File(
                        [blob],
                        `camera-photo-${Date.now()}.jpg`,
                        { type: "image/jpeg" }
                    );
                    onCapture(file, capturedImage);
                    handleClose();
                }
            },
            "image/jpeg",
            0.9
        );
    };

    const handleClose = () => {
        stopCamera();
        setCapturedImage(null);
        setError("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Take Direct Photo with Camera">
            <div className="space-y-4">
                <canvas ref={canvasRef} className="hidden" />

                {error ? (
                    <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-6 text-center text-rose-600 dark:text-rose-400">
                        <p className="text-sm font-semibold mb-3">{error}</p>
                        <button
                            type="button"
                            onClick={startCamera}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow"
                        >
                            Try Again
                        </button>
                    </div>
                ) : capturedImage ? (
                    <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 aspect-video flex items-center justify-center">
                            <img
                                src={capturedImage}
                                alt="Captured Preview"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleRetake}
                                className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Retake Photo
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition"
                            >
                                <Check className="h-4 w-4" />
                                Use This Photo
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="relative overflow-hidden rounded-2xl bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10 text-white text-xs font-bold gap-2">
                                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Starting Camera...
                                </div>
                            )}

                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`h-full w-full object-cover ${
                                    facingMode === "user" ? "scale-x-[-1]" : ""
                                }`}
                            />

                            <button
                                type="button"
                                onClick={toggleFacingMode}
                                title="Flip Front / Rear Camera"
                                className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/80 text-white border border-white/20 shadow hover:bg-slate-800 transition"
                            >
                                <FlipHorizontal className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-slate-500 font-medium">
                                Point phone camera at student & click Take Photo.
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleTakeSnap}
                                    disabled={loading || !!error}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg hover:opacity-95 transition disabled:opacity-50"
                                >
                                    <Camera className="h-4 w-4" />
                                    Take Photo
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default CameraModal;
