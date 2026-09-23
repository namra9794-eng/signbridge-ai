import { Languages, Volume2, Square, Loader2, Eraser, ArrowDown, CheckCircle2, AlertCircle } from "lucide-react";
import type { LanguageCode } from "@/lib/translationService";
import { LANGUAGES } from "@/lib/translationService";

interface TranslationPanelProps {
  sourceText: string;
  translatedText: string | null;
  targetLang: LanguageCode;
  onLangChange: (lang: LanguageCode) => void;
  onTranslate: () => void;
  onSpeak: () => void;
  onStopSpeak: () => void;
  onClear: () => void;
  isSpeaking: boolean;
  isTranslating: boolean;
  speechError: string | null;
  translationError: string | null;
}

export default function TranslationPanel({
  sourceText,
  translatedText,
  targetLang,
  onLangChange,
  onTranslate,
  onSpeak,
  onStopSpeak,
  onClear,
  isSpeaking,
  isTranslating,
  speechError,
  translationError,
}: TranslationPanelProps) {
  const canTranslate = sourceText.length > 0 && !isTranslating;
  const canSpeak = (translatedText ?? "").length > 0 && !isSpeaking;
  const translationReady = !!translatedText && !isTranslating;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-800">Translation</h3>
        </div>
        {translationReady && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700">
            <CheckCircle2 className="w-3 h-3" />
            Translation Ready
          </span>
        )}
        {isSpeaking && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Speaking
          </span>
        )}
      </div>

      {/* Source text */}
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wide">
          Source (English)
        </label>
        <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 min-h-[48px] flex items-center">
          <p className="text-slate-700 font-medium">{sourceText || "—"}</p>
        </div>
      </div>

      {/* Flow arrow */}
      <div className="flex items-center justify-center mb-3">
        <ArrowDown className="w-4 h-4 text-slate-300" />
      </div>

      {/* Language selector */}
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wide">
          Translate To
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLangChange(lang.code)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                targetLang === lang.code
                  ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50"
              }`}
            >
              <span className="mr-1.5 opacity-70 text-xs">{lang.flag}</span>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Translated text */}
      <div className="mb-4">
        <label className="text-xs font-medium text-slate-400 mb-1.5 block uppercase tracking-wide">
          Translated Text
        </label>
        <div className={`rounded-xl border px-4 py-3 min-h-[64px] flex items-center transition-colors ${
          translationReady
            ? "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-100"
            : "bg-slate-50 border-slate-100"
        }`}>
          {isTranslating ? (
            <div className="flex items-center gap-2 text-teal-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Translating…</span>
            </div>
          ) : translatedText ? (
            <p className="text-slate-800 font-semibold text-lg">{translatedText}</p>
          ) : (
            <p className="text-slate-400">Translation will appear here</p>
          )}
        </div>
      </div>

      {/* Translation error */}
      {translationError && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{translationError}</span>
        </div>
      )}

      {/* Speech error */}
      {speechError && (
        <div className="mb-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{speechError}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onTranslate}
          disabled={!canTranslate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Languages className="w-4 h-4" />
          Translate
        </button>

        {isSpeaking ? (
          <button
            onClick={onStopSpeak}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white font-semibold shadow-sm hover:bg-red-600 transition-colors"
          >
            <Square className="w-4 h-4" />
            Stop
          </button>
        ) : (
          <button
            onClick={onSpeak}
            disabled={!canSpeak}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Volume2 className="w-5 h-5" />
            Speak
          </button>
        )}

        <button
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-medium border border-slate-200 hover:bg-slate-100 transition-colors ml-auto"
        >
          <Eraser className="w-4 h-4" />
          Clear
        </button>
      </div>
    </div>
  );
}
