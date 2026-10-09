import React, { useEffect, useRef, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, RefreshCw, Upload, AlertCircle, CheckCircle2, VideoOff, SwitchCamera } from 'lucide-react';
import { Language } from '../../types';

interface QrScannerViewProps {
  onScan: (scannedText: string) => void;
  lang?: Language;
  compact?: boolean;
  isActive?: boolean;
}

export const QrScannerView: React.FC<QrScannerViewProps> = ({
  onScan,
  lang = 'en',
  compact = false,
  isActive = true
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraStatus, setCameraStatus] = useState<'idle' | 'requesting' | 'active' | 'denied' | 'unsupported'>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Stable references to prevent camera teardown loops
  const lastScannedRef = useRef<string | null>(null);
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Play auditory and haptic beep on scan
  const playScanFeedback = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.16);
      }
    } catch {}
    try {
      if ('vibrate' in navigator) navigator.vibrate(150);
    } catch {}
  }, []);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Frame scanner loop using jsQR
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (code && code.data && code.data.trim()) {
            const raw = code.data.trim();
            if (raw !== lastScannedRef.current) {
              lastScannedRef.current = raw;
              playScanFeedback();
              onScanRef.current(raw);
              // Cooldown before scanning identical code again
              setTimeout(() => {
                lastScannedRef.current = null;
              }, 2500);
            }
          }
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanLoop);
  }, [playScanFeedback]);

  // Start camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus('unsupported');
      setErrorMessage(
        lang === 'hi' 
          ? 'आपके ब्राउज़र में वेबकैम उपलब्ध नहीं है। कृपया नीचे फोटो अपलोड विकल्प का उपयोग करें।'
          : 'Camera is not supported on this browser/environment. Please use image upload below.'
      );
      return;
    }

    setCameraStatus('requesting');

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraStatus('active');
        animFrameRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      console.warn('Camera access error, trying fallback:', err);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();
          setCameraStatus('active');
          animFrameRef.current = requestAnimationFrame(scanLoop);
          return;
        }
      } catch (fallbackErr) {
        setCameraStatus('denied');
        setErrorMessage(
          lang === 'hi'
            ? 'कैमरा अनुमति नहीं मिली या डिवाइस में कैमरा व्यस्त है। आप नीचे फोटो अपलोड या टोकन कोड दर्ज करके भी सत्यापित कर सकते हैं।'
            : 'Camera permission denied or camera in use. You can upload slip photo or enter token code below.'
        );
      }
    }
  }, [facingMode, lang, scanLoop, stopCamera]);

  // Lifecycle
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isActive, facingMode, startCamera, stopCamera]);

  // Decode QR from Image element with multi-resolution attempt
  const decodeFromImage = (img: HTMLImageElement): boolean => {
    // 1. Try scaled down first (for fast & robust decode on high-res photos)
    const maxDim = 800;
    let w = img.width;
    let h = img.height;
    if (w > maxDim || h > maxDim) {
      if (w > h) {
        h = Math.round((h * maxDim) / w);
        w = maxDim;
      } else {
        w = Math.round((w * maxDim) / h);
        h = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return false;

    ctx.drawImage(img, 0, 0, w, h);
    let imageData = ctx.getImageData(0, 0, w, h);
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    // 2. If not found at scaled size, try original dimension
    if ((!code || !code.data) && (img.width !== w || img.height !== h)) {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      imageData = ctx.getImageData(0, 0, img.width, img.height);
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth'
      });
    }

    // 3. Fallback: High contrast threshold pass (fixes photos with colored QR or shadows)
    if (!code || !code.data) {
      const enhanced = new Uint8ClampedArray(imageData.data);
      for (let i = 0; i < enhanced.length; i += 4) {
        const luma = enhanced[i] * 0.299 + enhanced[i + 1] * 0.587 + enhanced[i + 2] * 0.114;
        const val = luma < 140 ? 0 : 255;
        enhanced[i] = val;
        enhanced[i + 1] = val;
        enhanced[i + 2] = val;
      }
      code = jsQR(enhanced, canvas.width, canvas.height, {
        inversionAttempts: 'attemptBoth'
      });
    }

    if (code && code.data && code.data.trim()) {
      playScanFeedback();
      onScanRef.current(code.data.trim());
      return true;
    }
    return false;
  };

  // Decode QR from uploaded image file
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const found = decodeFromImage(img);
        setIsProcessingImage(false);
        if (!found) {
          setErrorMessage(
            lang === 'hi'
              ? 'अपलोड की गई फोटो में क्यूआर कोड नहीं मिला। कृपया स्पष्ट फोटो चुनें या टोकन OTP दर्ज करें।'
              : 'No QR code found in uploaded image. Please ensure good lighting or enter 4-digit token OTP.'
          );
        }
      };
      img.onerror = () => {
        setIsProcessingImage(false);
        setErrorMessage(lang === 'hi' ? 'फोटो लोड करने में विफल।' : 'Failed to load image.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);

    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="w-full flex flex-col items-center space-y-3">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Viewfinder Box */}
      <div 
        className={`relative w-full ${compact ? 'max-w-xs aspect-4/3' : 'max-w-md aspect-4/3 sm:aspect-video'} bg-[#0A3A3D] rounded-2xl overflow-hidden border-3 border-[#0F5257] shadow-xl flex items-center justify-center`}
      >
        {/* Real Live Video Feed */}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
        />

        {/* Live Active Overlay with Guide Box & Laser */}
        {cameraStatus === 'active' && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            {/* Guide Corners Target Box */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-amber-300/80 rounded-2xl shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-400 rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-400 rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-400 rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-400 rounded-br-sm"></div>

              {/* Animated Laser Scanning Line */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-bounce"></div>
            </div>

            <span className="mt-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-[11px] text-amber-300 font-bold tracking-wide font-mono-num flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {lang === 'hi' ? 'कैमरे के सामने पर्ची का QR कोड रखें' : 'Align Patient QR Code within Box'}
            </span>
          </div>
        )}

        {/* Camera Requesting / Loading State */}
        {cameraStatus === 'requesting' && (
          <div className="text-center p-6 text-white space-y-2">
            <RefreshCw className="w-8 h-8 mx-auto text-amber-400 animate-spin" />
            <p className="text-xs font-bold text-teal-100">
              {lang === 'hi' ? 'कैमरा शुरू किया जा रहा है...' : 'Starting Front-Desk Camera...'}
            </p>
          </div>
        )}

        {/* Camera Blocked / Denied State */}
        {(cameraStatus === 'denied' || cameraStatus === 'unsupported') && (
          <div className="text-center p-6 text-white space-y-3 max-w-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
              <VideoOff className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">
                {lang === 'hi' ? 'कैमरा उपलब्ध नहीं है' : 'Camera Unavailable'}
              </h4>
              <p className="text-[11px] text-teal-100 mt-1 leading-relaxed">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {lang === 'hi' ? 'पुनः प्रयास करें' : 'Retry Camera'}
            </button>
          </div>
        )}

        {/* Camera Controls Overlay (Top Right) */}
        {cameraStatus === 'active' && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <button
              type="button"
              onClick={toggleCamera}
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer shadow-md backdrop-blur-xs"
              title={lang === 'hi' ? 'कैमरा बदलें (आगे / पीछे)' : 'Flip Camera (Front/Rear)'}
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={startCamera}
              className="p-2 rounded-xl bg-black/50 hover:bg-black/70 text-white transition-colors cursor-pointer shadow-md backdrop-blur-xs"
              title={lang === 'hi' ? 'कैमरा रीफ्रेश करें' : 'Refresh Camera'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Alternative Options: Upload QR Image / File input */}
      <div className="w-full flex items-center justify-center gap-2 flex-wrap pt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessingImage}
          className="px-3.5 py-2 rounded-xl border border-teal-800/30 bg-teal-50 hover:bg-teal-100 text-[#0F5257] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          id="qr-upload-slip-image-btn"
        >
          {isProcessingImage ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-800" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-[#0F5257]" />
          )}
          <span>
            {lang === 'hi' ? '📁 पर्ची की फोटो / स्क्रीनशॉट अपलोड करें' : '📁 Upload Slip Photo / Screenshot'}
          </span>
        </button>

        {cameraStatus === 'active' && (
          <span className="text-[11px] text-stone-500">
            {lang === 'hi' ? '• या सीधे कैमरे के सामने रखें' : '• or hold QR slip to camera'}
          </span>
        )}
      </div>

      {/* Error message notification */}
      {errorMessage && cameraStatus !== 'denied' && cameraStatus !== 'unsupported' && (
        <div className="w-full max-w-md p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
