"use client";

import { useRef, useState, useCallback } from "react";
import { WebcamFeed } from "./WebcamFeed";
import { Hand3D } from "./Hand3D";
import { useHandDetection } from "@/hooks/useHandDetection";

export const HandGestureDetector = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { handLandmarks, isLoading } = useHandDetection(videoRef);

  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    setIsVideoReady(true);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">3D Hand Gesture Tracker</h1>
        <p className="text-gray-400">
          Show your hand to the camera to see it visualized in 3D
        </p>
        {isLoading && (
          <p className="text-yellow-500 mt-2">Loading hand detection model...</p>
        )}
        {!isLoading && handLandmarks && (
          <p className="text-green-500 mt-2">
            Hand detected: {handLandmarks.handedness}
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center justify-center flex-1">
        {/* Webcam Feed */}
        <div className="w-full lg:w-1/2 max-w-xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Camera Feed</h2>
          <WebcamFeed ref={videoRef} onVideoReady={handleVideoReady} />
        </div>

        {/* 3D Visualization */}
        <div className="w-full lg:w-1/2 max-w-xl h-[480px]">
          <h2 className="text-xl font-semibold mb-4 text-center">3D Hand Model</h2>
          <Hand3D handLandmarks={handLandmarks} />
        </div>
      </div>

      {/* Info */}
      <div className="text-center text-sm text-gray-500">
        <p>Landmarks detected: {handLandmarks?.landmarks.length || 0}</p>
        {!isVideoReady && <p>Waiting for camera...</p>}
      </div>
    </div>
  );
};
