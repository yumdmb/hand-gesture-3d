"use client";

import { useEffect, useRef, useState, forwardRef, useCallback } from "react";

interface WebcamFeedProps {
  onVideoReady?: (video: HTMLVideoElement) => void;
}

export const WebcamFeed = forwardRef<HTMLVideoElement, WebcamFeedProps>(
  ({ onVideoReady }, forwardedRef) => {
  const localRef = useRef<HTMLVideoElement>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const videoElement = localRef.current;
    if (!videoElement || hasStarted.current) return;

    hasStarted.current = true;

    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        });

        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
          videoElement.play();
          setIsStreamReady(true);
          onVideoReady?.(videoElement);
        };
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Could not access webcam. Please ensure you have granted camera permissions.");
      }
    };

    startWebcam();

    return () => {
      if (videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onVideoReady]);

  const setRefs = useCallback((element: HTMLVideoElement | null) => {
    localRef.current = element;
    if (typeof forwardedRef === 'function') {
      forwardedRef(element);
    } else if (forwardedRef) {
      (forwardedRef as React.MutableRefObject<HTMLVideoElement | null>).current = element;
    }
  }, [forwardedRef]);

  return (
    <div className="relative">
      <video
        ref={setRefs}
        className="rounded-lg shadow-lg max-w-full"
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />
      {!isStreamReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
          <p className="text-white">Loading webcam...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900 rounded-lg">
          <p className="text-white text-center px-4">{error}</p>
        </div>
      )}
    </div>
  );
});

WebcamFeed.displayName = "WebcamFeed";
