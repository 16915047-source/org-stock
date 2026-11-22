'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

interface CameraProps {
  onCapture: (imageDataUrl: string) => void;
  label?: string;
}

type CameraFacingMode = 'user' | 'environment';

export default function Camera({ onCapture, label = 'ถ่ายรูปหน้าคู่กับอุปกรณ์' }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async (facingMode: CameraFacingMode) => {
    setCameraError('');
    setIsVideoReady(false);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('เบราว์เซอร์นี้ไม่รองรับกล้อง หรือกรุณาเปิดเว็บผ่าน localhost/HTTPS');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode === 'environment' ? { exact: facingMode } : { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setIsStreaming(true);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCameraError('ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตสิทธิ์กล้องจากเบราว์เซอร์');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setCameraError('ไม่พบกล้องที่เชื่อมต่อกับอุปกรณ์นี้');
      } else if (name === 'OverconstrainedError' && facingMode === 'environment') {
        setCameraError('ไม่พบกล้องหลังในอุปกรณ์นี้ กรุณาเลือกเปิดกล้องหน้า');
      } else {
        setCameraError('เปิดกล้องไม่สำเร็จ กรุณาตรวจสอบสิทธิ์กล้องและลองใหม่');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setIsVideoReady(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError('กล้องยังไม่พร้อม กรุณารอสักครู่แล้วลองถ่ายอีกครั้ง');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError('ไม่สามารถประมวลผลภาพจากกล้องได้ กรุณาลองใหม่');
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(dataUrl);
      onCapture(dataUrl);
      stopCamera();
    } catch {
      setCameraError('ถ่ายภาพไม่สำเร็จ กรุณาลองเปิดกล้องใหม่');
    }
  }, [onCapture, stopCamera]);

  useEffect(() => {
    if (!isStreaming || !videoRef.current || !streamRef.current) return;

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {
      setCameraError('เล่นภาพจากกล้องไม่สำเร็จ กรุณาตรวจสอบสิทธิ์กล้องแล้วลองใหม่');
    });
  }, [isStreaming]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
  }, []);

  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-800 mb-2">{label}</label>}

      {capturedImage ? (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={capturedImage} alt="รูปอุปกรณ์ที่ถ่าย" className="w-full h-44 object-cover" />
            <div className="absolute top-2 right-2 bg-white/95 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm border border-slate-200">
              ถ่ายรูปแล้ว
            </div>
          </div>
          <button
            type="button"
            onClick={retake}
            className="w-full h-10 px-4 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold"
          >
            ถ่ายรูปใหม่
          </button>
        </div>
      ) : isStreaming ? (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-950">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onCanPlay={() => setIsVideoReady(true)}
              className="w-full h-44 object-cover"
            />
            <div className="absolute top-2 left-2 bg-white/95 text-slate-700 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm border border-slate-200">
              กล้องกำลังทำงาน
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={capturePhoto}
              disabled={!isVideoReady}
              className="flex-1 h-11 px-4 bg-[#B34453] text-white rounded-xl hover:bg-[#963B48] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-bold shadow-md shadow-[#B34453]/20"
            >
              ถ่ายรูป
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="w-11 h-11 px-0 border border-slate-200 bg-white text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              aria-label="ปิดกล้อง"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4 mx-auto"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => startCamera('user')}
            className="w-full h-12 px-3 border border-slate-200 bg-white text-slate-800 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-bold flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><path d="M4 7.5h3l1.5-2h7l1.5 2h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
            เปิดกล้องหน้า
          </button>
          <button
            type="button"
            onClick={() => startCamera('environment')}
            className="w-full h-12 px-3 border border-slate-200 bg-white text-slate-800 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-colors text-xs font-bold flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="w-4 h-4"><path d="M4 7.5h3l1.5-2h7l1.5 2h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
            เปิดกล้องหลัง
          </button>
        </div>
      )}

      {cameraError && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-700" aria-live="polite">
          {cameraError}
        </p>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
