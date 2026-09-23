import { Camera, CameraOff, Loader2, AlertCircle, Video } from "lucide-react";
import type { RefObject } from "react";
import type { CameraStatus } from "@/hooks/useHandTracking";

interface CameraPanelProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  status: CameraStatus;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  handDetected: boolean;
}

export default function CameraPanel({
  videoRef,
  canvasRef,
  status,
  error,
  onStart,
  onStop,
  handDetected,
}: CameraPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-800">Live Camera</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} handDetected={handDetected} />
        </div>
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
        />

        {/* Idle overlay */}
        {status === "idle" && (
          <div className="text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-300 text-sm mb-1">Camera is off</p>
            <p className="text-slate-500 text-xs">Press Start to begin sign detection</p>
          </div>
        )}

        {/* Loading overlay */}
        {status === "loading" && (
          <div className="text-center px-6">
            <Loader2 className="w-10 h-10 text-teal-400 animate-spin mx-auto mb-3" />
            <p className="text-slate-300 text-sm">Loading camera & model…</p>
          </div>
        )}

        {/* Error overlay */}
        {status === "error" && (
          <div className="text-center px-6 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-red-300 text-sm font-medium mb-1">Camera Error</p>
            <p className="text-slate-400 text-xs mb-4">{error}</p>
            <p className="text-slate-500 text-xs">
              Try Demo Mode below to experience the full pipeline without a camera.
            </p>
          </div>
        )}

        {/* Running indicator */}
        {status === "running" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs font-medium">LIVE</span>
          </div>
        )}

        {/* Hand detection indicator */}
        {status === "running" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
            <span className={`w-2 h-2 rounded-full ${handDetected ? "bg-green-400" : "bg-slate-500"}`} />
            <span className="text-white text-xs font-medium">
              {handDetected ? "Hand Detected" : "No Hand"}
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 py-4 flex gap-3">
        {status === "running" ? (
          <button
            onClick={onStop}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            <CameraOff className="w-4 h-4" />
            Stop Camera
          </button>
        ) : (
          <button
            onClick={onStart}
            disabled={status === "loading"}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-4 h-4" />
            {status === "loading" ? "Starting…" : "Start Camera"}
          </button>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, handDetected }: { status: CameraStatus; handDetected: boolean }) {
  if (status === "running") {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
        handDetected ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${handDetected ? "bg-green-500" : "bg-amber-500"}`} />
        {handDetected ? "Tracking" : "Searching"}
      </span>
    );
  }
  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
        <AlertCircle className="w-3 h-3" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Idle
    </span>
  );
}
