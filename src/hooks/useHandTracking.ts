import { useCallback, useEffect, useRef, useState } from "react";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { classifyGesture, type GestureResult } from "@/lib/gestureRecognition";

export type CameraStatus = "idle" | "loading" | "running" | "error";

export interface HandTrackingState {
  status: CameraStatus;
  error: string | null;
  gesture: GestureResult | null;
  landmarks: NormalizedLandmark[] | null;
}

const STABLE_FRAMES = 6;

export function useHandTracking() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const gestureBufferRef = useRef<GestureResult[]>([]);
  const stableGestureRef = useRef<GestureResult | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);

  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [gesture, setGesture] = useState<GestureResult | null>(null);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);

  const drawLandmarks = useCallback((landmarksList: NormalizedLandmark[]) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    const connections = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [5,9],[9,10],[10,11],[11,12],
      [9,13],[13,14],[14,15],[15,16],
      [13,17],[17,18],[18,19],[19,20],
      [0,17],
    ];

    for (const lm of landmarksList) {
      ctx.strokeStyle = "rgba(74, 222, 128, 0.7)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (const [a, b] of connections) {
        ctx.moveTo(landmarksList[a].x * w, landmarksList[a].y * h);
        ctx.lineTo(landmarksList[b].x * w, landmarksList[b].y * h);
      }
      ctx.stroke();

      ctx.fillStyle = "rgba(250, 204, 21, 0.95)";
      for (const point of landmarksList) {
        ctx.beginPath();
        ctx.arc(point.x * w, point.y * h, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  const detectLoop = useCallback(() => {
    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const results = landmarker.detectForVideo(video, performance.now());

      if (results.landmarks && results.landmarks.length > 0) {
        const lms = results.landmarks[0];
        setLandmarks(lms);
        drawLandmarks(lms);

        const result = classifyGesture(lms);
        const buffer = gestureBufferRef.current;
        buffer.push(result);
        if (buffer.length > STABLE_FRAMES) buffer.shift();

        const sameGesture = buffer.filter((g) => g.name === result.name);
        if (sameGesture.length >= Math.ceil(STABLE_FRAMES * 0.6) && result.name !== "Unknown") {
          const avgConf = sameGesture.reduce((s, g) => s + g.confidence, 0) / sameGesture.length;
          const stable: GestureResult = { name: result.name, confidence: avgConf };
          if (!stableGestureRef.current || stableGestureRef.current.name !== stable.name) {
            stableGestureRef.current = stable;
            setGesture(stable);
          }
        }
      } else {
        setLandmarks(null);
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }

    rafRef.current = requestAnimationFrame(detectLoop);
  }, [drawLandmarks]);

  const startCamera = useCallback(async () => {
    setStatus("loading");
    setError(null);
    gestureBufferRef.current = [];
    stableGestureRef.current = null;
    setGesture(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API not supported in this browser");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) throw new Error("Video element not available");

      video.srcObject = stream;
      await video.play();

      if (!landmarkerRef.current) {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
        );
        landmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        });
      }

      setStatus("running");
      lastVideoTimeRef.current = -1;
      rafRef.current = requestAnimationFrame(detectLoop);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to start camera";
      setError(msg);
      setStatus("error");
    }
  }, [detectLoop]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    const video = videoRef.current;
    if (video) video.srcObject = null;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setStatus("idle");
    setGesture(null);
    setLandmarks(null);
    gestureBufferRef.current = [];
    stableGestureRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      landmarkerRef.current?.close();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    status,
    error,
    gesture,
    landmarks,
    startCamera,
    stopCamera,
  };
}
