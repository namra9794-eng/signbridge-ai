import { Hand, CheckCircle2, HelpCircle, ArrowDown } from "lucide-react";
import type { GestureResult } from "@/lib/gestureRecognition";
import { SUPPORTED_GESTURES } from "@/lib/gestureRecognition";

interface RecognitionPanelProps {
  gesture: GestureResult | null;
  sourceText: string;
}

export default function RecognitionPanel({ gesture, sourceText }: RecognitionPanelProps) {
  const isRecognized = gesture && gesture.name !== "Unknown";
  const displayText = sourceText || (isRecognized ? gesture!.name : "");

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-800">Detected Sign</h3>
        </div>
        {isRecognized && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Sign Detected
          </span>
        )}
      </div>

      {/* Main display */}
      <div className="relative rounded-xl bg-slate-50 border border-slate-100 p-8 mb-4 min-h-[120px] flex items-center justify-center">
        {isRecognized ? (
          <div className="text-center animate-fade-in">
            <div className="text-3xl font-bold text-slate-900 mb-2">{gesture!.name}</div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(gesture!.confidence * 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600">
                {Math.round(gesture!.confidence * 100)}%
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Confidence</p>
          </div>
        ) : (
          <div className="text-center">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">
              {gesture ? "Unknown gesture — try another" : "Waiting for a sign…"}
            </p>
          </div>
        )}
      </div>

      {/* Flow: Detected Sign → English Text */}
      {displayText && (
        <div className="animate-fade-in mb-4">
          <div className="flex items-center justify-center mb-2">
            <ArrowDown className="w-4 h-4 text-slate-300" />
          </div>
          <div className="rounded-xl bg-teal-50 border border-teal-100 px-4 py-3">
            <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-0.5">English Text</p>
            <p className="text-slate-800 font-semibold text-lg">{displayText}</p>
          </div>
        </div>
      )}

      {/* Supported gestures */}
      <div>
        <p className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
          Supported Gestures
        </p>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_GESTURES.map((g) => (
            <span
              key={g}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isRecognized && gesture!.name === g
                  ? "bg-teal-100 text-teal-800 border border-teal-300"
                  : "bg-slate-50 text-slate-500 border border-slate-100"
              }`}
            >
              {isRecognized && gesture!.name === g && <CheckCircle2 className="w-3.5 h-3.5" />}
              {g}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
