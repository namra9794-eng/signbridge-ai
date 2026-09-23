import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Hand, Sparkles, Info, Camera, CheckCircle2, Languages, Volume2 } from "lucide-react";
import { useHandTracking } from "@/hooks/useHandTracking";
import CameraPanel from "@/components/CameraPanel";
import RecognitionPanel from "@/components/RecognitionPanel";
import TranslationPanel from "@/components/TranslationPanel";
import HistoryPanel, { type HistoryEntry } from "@/components/HistoryPanel";
import DemoMode from "@/components/DemoMode";
import { translate, getLanguage, type LanguageCode } from "@/lib/translationService";
import { speak, stopSpeaking, isSpeechSupported } from "@/lib/speechService";
import type { GestureResult } from "@/lib/gestureRecognition";
import type { CameraStatus } from "@/hooks/useHandTracking";

interface DashboardProps {
  onBack: () => void;
}

export default function Dashboard({ onBack }: DashboardProps) {
  const { videoRef, canvasRef, status, error, gesture, landmarks, startCamera, stopCamera } =
    useHandTracking();

  const [targetLang, setTargetLang] = useState<LanguageCode>("hi");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const lastGestureRef = useRef<GestureResult | null>(null);
  const historyIdRef = useRef(0);

  const doTranslate = useCallback((text: string, lang: LanguageCode) => {
    if (!text) return;
    setIsTranslating(true);
    setTranslationError(null);
    setTimeout(() => {
      const result = translate(text, lang);
      if (!result) {
        setTranslationError("Could not translate this sign. Try a supported gesture.");
        setTranslatedText(null);
      } else {
        setTranslatedText(result);
        const language = getLanguage(lang);
        const now = new Date();
        const entry: HistoryEntry = {
          id: ++historyIdRef.current,
          text,
          translatedText: result,
          langLabel: language.label,
          timestamp: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setHistory((prev) => [entry, ...prev].slice(0, 12));
      }
      setIsTranslating(false);
    }, 400);
  }, []);

  // When a new stable gesture is recognized, set it as source text and auto-translate
  useEffect(() => {
    if (!gesture || gesture.name === "Unknown") return;
    if (lastGestureRef.current?.name === gesture.name) return;
    lastGestureRef.current = gesture;
    setSourceText(gesture.name);
    setTranslatedText(null);
    setSpeechError(null);
    setTranslationError(null);
    doTranslate(gesture.name, targetLang);
  }, [gesture, targetLang, doTranslate]);

  const handleTranslate = useCallback(() => {
    doTranslate(sourceText, targetLang);
  }, [doTranslate, sourceText, targetLang]);

  // Auto-translate when language changes if we have source text
  const handleLangChange = useCallback((lang: LanguageCode) => {
    setTargetLang(lang);
    setTranslatedText(null);
    setTranslationError(null);
    if (sourceText) {
      doTranslate(sourceText, lang);
    }
  }, [sourceText, doTranslate]);

  const handleSpeak = useCallback(() => {
    if (!translatedText) return;
    if (!isSpeechSupported()) {
      setSpeechError("Speech synthesis is not supported in this browser");
      return;
    }
    setSpeechError(null);
    setIsSpeaking(true);
    const lang = getLanguage(targetLang);
    speak(translatedText, lang.speechLang)
      .catch((err) => setSpeechError(err instanceof Error ? err.message : "Speech failed"))
      .finally(() => setIsSpeaking(false));
  }, [translatedText, targetLang]);

  const handleStopSpeak = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const handleClear = useCallback(() => {
    setSourceText("");
    setTranslatedText(null);
    setSpeechError(null);
    setTranslationError(null);
    stopSpeaking();
    setIsSpeaking(false);
    lastGestureRef.current = null;
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Hand className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800">SignBridge AI</span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-2">
            <StatusIndicator
              icon={Camera}
              label="Camera Active"
              active={status === "running"}
            />
            <StatusIndicator
              icon={CheckCircle2}
              label="Sign Detected"
              active={!!sourceText}
            />
            <StatusIndicator
              icon={Languages}
              label="Translation Ready"
              active={!!translatedText}
            />
            <StatusIndicator
              icon={Volume2}
              label="Speaking"
              active={isSpeaking}
              pulse
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium"
            >
              <Info className="w-4 h-4" />
              <span className="hidden sm:inline">How to use</span>
            </button>
            <button
              onClick={() => {
                stopCamera();
                setDemoMode(!demoMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                demoMode
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {demoMode ? "Exit Demo" : "Demo Mode"}
            </button>
          </div>
        </div>

        {/* Info banner */}
        {showInfo && (
          <div className="border-t border-slate-100 bg-teal-50 px-4 sm:px-6 py-3 animate-fade-in">
            <div className="max-w-7xl mx-auto text-sm text-slate-600">
              <p className="mb-1"><strong className="text-slate-800">How to use:</strong> Start the camera, then make one of the supported gestures in front of your webcam. The recognized sign appears on the right — it auto-translates. Press Speak to hear it.</p>
              <p className="text-xs text-slate-500">Supported gestures: Open palm = Hello · Pinch (all fingers to thumb) = Thank You · Thumbs up = Help · Fist = Yes · Index finger only = No</p>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {demoMode ? (
          <div className="max-w-2xl mx-auto">
            <DemoMode onExit={() => setDemoMode(false)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left column: Camera + Recognition */}
            <div className="space-y-6">
              <CameraPanel
                videoRef={videoRef}
                canvasRef={canvasRef}
                status={status}
                error={error}
                onStart={startCamera}
                onStop={stopCamera}
                handDetected={!!landmarks}
              />
              <RecognitionPanel gesture={gesture} sourceText={sourceText} />
            </div>

            {/* Right column: Translation + History */}
            <div className="space-y-6">
              <TranslationPanel
                sourceText={sourceText}
                translatedText={translatedText}
                targetLang={targetLang}
                onLangChange={handleLangChange}
                onTranslate={handleTranslate}
                onSpeak={handleSpeak}
                onStopSpeak={handleStopSpeak}
                onClear={handleClear}
                isSpeaking={isSpeaking}
                isTranslating={isTranslating}
                speechError={speechError}
                translationError={translationError}
              />
              <HistoryPanel entries={history} />
            </div>
          </div>
        )}

        {/* Prototype disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Prototype with limited vocabulary · Recognition uses hand-landmark heuristics, not a trained ASL model ·
            A trained model can be plugged into the recognition layer
          </p>
        </div>
      </main>
    </div>
  );
}

function StatusIndicator({
  icon: Icon,
  label,
  active,
  pulse,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  pulse?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
        active
          ? "bg-teal-50 text-teal-700"
          : "bg-slate-100 text-slate-400"
      }`}
    >
      <Icon className={`w-3 h-3 ${active && pulse ? "animate-pulse" : ""}`} />
      {label}
    </div>
  );
}
