import { useState } from "react";
import { Sparkles, ArrowRight, Volume2, Square, CheckCircle2, Eye, Hand, Languages, AlertCircle } from "lucide-react";
import type { LanguageCode } from "@/lib/translationService";
import { LANGUAGES, translate, getLanguage } from "@/lib/translationService";
import { speak, stopSpeaking, isSpeechSupported } from "@/lib/speechService";
import { SUPPORTED_GESTURES } from "@/lib/gestureRecognition";

interface DemoModeProps {
  onExit: () => void;
}

export default function DemoMode({ onExit }: DemoModeProps) {
  const [selectedGesture, setSelectedGesture] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState<LanguageCode>("hi");
  const [translated, setTranslated] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "sign" | "text" | "translate" | "speech">("idle");

  const handleSelect = (gesture: string) => {
    setSelectedGesture(gesture);
    setTranslated(null);
    setSpeechError(null);
    stopSpeaking();
    setIsSpeaking(false);
    setStep("sign");
    setTimeout(() => setStep("text"), 600);
  };

  const handleTranslate = () => {
    if (!selectedGesture) return;
    setSpeechError(null);
    setStep("translate");
    setTimeout(() => {
      const result = translate(selectedGesture, targetLang);
      setTranslated(result);
      setStep("speech");
    }, 500);
  };

  const handleSpeak = () => {
    if (!translated) return;
    if (!isSpeechSupported()) {
      setSpeechError("Speech synthesis is not supported in this browser");
      return;
    }
    setSpeechError(null);
    const lang = getLanguage(targetLang);
    setIsSpeaking(true);
    speak(translated, lang.speechLang)
      .catch((err) => setSpeechError(err instanceof Error ? err.message : "Speech failed"))
      .finally(() => setIsSpeaking(false));
  };

  const handleStopSpeak = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  const handleReset = () => {
    setSelectedGesture(null);
    setTranslated(null);
    setSpeechError(null);
    setStep("idle");
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-semibold text-slate-800">Demo Mode</h3>
            <p className="text-xs text-slate-500">Full pipeline without camera</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedGesture && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <CheckCircle2 className="w-3 h-3" />
              Sign Detected
            </span>
          )}
          {translated && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
              <Languages className="w-3 h-3" />
              Translation Ready
            </span>
          )}
          {isSpeaking && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Speaking
            </span>
          )}
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-white/60 transition-colors"
          >
            Exit Demo
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Step 1: Select a sign */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step !== "idle" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
            }`}>1</span>
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <Hand className="w-4 h-4" /> Select a Sign
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_GESTURES.map((g) => (
              <button
                key={g}
                onClick={() => handleSelect(g)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                  selectedGesture === g
                    ? "bg-teal-600 text-white border-teal-600 shadow-md scale-105"
                    : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50"
                }`}
              >
                {selectedGesture === g && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />}
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline visualization */}
        {selectedGesture && (
          <div className="space-y-4 animate-fade-in">
            {/* Recognized text */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step !== "idle" && step !== "sign" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>2</span>
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Eye className="w-4 h-4" /> Recognized Text
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
              <p className="text-slate-800 font-semibold text-lg">{selectedGesture}</p>
            </div>

            {/* Language + Translate */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === "speech" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>3</span>
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <Languages className="w-4 h-4" /> Translate
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setTargetLang(lang.code); setTranslated(null); setSpeechError(null); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    targetLang === lang.code
                      ? "bg-teal-600 text-white border-teal-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-teal-300"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleTranslate}
              disabled={!selectedGesture}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-40"
            >
              Translate <ArrowRight className="w-4 h-4" />
            </button>

            {/* Translated result + Speak */}
            {translated && (
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-teal-600 text-white">4</span>
                  <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                    <Volume2 className="w-4 h-4" /> Text-to-Speech
                  </span>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 px-4 py-3 mb-3">
                  <p className="text-slate-800 font-bold text-xl">{translated}</p>
                </div>

                {speechError && (
                  <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{speechError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {isSpeaking ? (
                    <button
                      onClick={handleStopSpeak}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <Square className="w-4 h-4" /> Stop
                    </button>
                  ) : (
                    <button
                      onClick={handleSpeak}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all"
                    >
                      <Volume2 className="w-5 h-5" /> Speak
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-medium border border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!selectedGesture && (
          <div className="py-8 text-center">
            <p className="text-slate-400 text-sm">Select a sign above to start the demo</p>
          </div>
        )}
      </div>
    </div>
  );
}
