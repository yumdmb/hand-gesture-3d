"use client";

import { useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { HandLandmarks } from "@/types/hand";

export const useHandDetection = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
  const [handLandmarks, setHandLandmarks] = useState<HandLandmarks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const initializeHandDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          numHands: 1,
          runningMode: "VIDEO",
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (isMounted) {
          handLandmarkerRef.current = handLandmarker;
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing hand detector:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    initializeHandDetector();

    return () => {
      isMounted = false;
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!handLandmarkerRef.current || !videoRef.current || isLoading) return;

    const detectHands = () => {
      if (!videoRef.current || !handLandmarkerRef.current) return;

      const video = videoRef.current;

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const startTimeMs = performance.now();
        const results = handLandmarkerRef.current.detectForVideo(video, startTimeMs);

        if (results.landmarks && results.landmarks.length > 0) {
          setHandLandmarks({
            landmarks: results.landmarks[0].map((landmark) => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
            })),
            handedness: results.handednesses?.[0]?.[0]?.categoryName || "Unknown",
          });
        } else {
          setHandLandmarks(null);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectHands);
    };

    detectHands();

    return () => {
      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, isLoading]);

  return { handLandmarks, isLoading };
};
