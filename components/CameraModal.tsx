import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon, CameraIcon as CaptureIcon } from './icons';

interface CameraModalProps {
    isVisible: boolean;
    onClose: () => void;
    onCapture: (file: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isVisible, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stopStream = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isVisible) {
            setError(null);
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(mediaStream => {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                })
                .catch(err => {
                    console.error("Camera Error:", err);
                    setError("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
                });
        } else {
            stopStream();
        }

        return () => {
            stopStream();
        };
    }, [isVisible, stopStream]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
                    onCapture(file);
                }
            }, 'image/jpeg', 0.9);
        }
    };

    if (!isVisible) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4 animate-fade-in"
            aria-modal="true"
            role="dialog"
        >
            <div className="relative w-full max-w-4xl h-full flex flex-col items-center justify-center">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-colors z-20"
                    aria-label="Fechar Câmera"
                >
                    <CloseIcon className="text-2xl" />
                </button>

                {error ? (
                    <div className="text-center bg-rose-900/50 p-6 rounded-lg border border-rose-500/50 text-white">
                        <h3 className="text-lg font-bold">Erro na Câmera</h3>
                        <p className="mt-2">{error}</p>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain rounded-lg"
                    />
                )}

                {!error && (
                    <button 
                        onClick={handleCapture}
                        className="absolute bottom-8 w-20 h-20 rounded-full bg-white/30 border-4 border-white flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-sky-500/50 z-20"
                        aria-label="Capturar Imagem"
                    >
                         <CaptureIcon className="text-4xl text-white" />
                    </button>
                )}

                <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            </div>
        </div>
    );
};

export default CameraModal;
