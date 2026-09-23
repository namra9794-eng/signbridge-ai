import { History } from "lucide-react";

export interface HistoryEntry {
  id: number;
  text: string;
  translatedText: string;
  langLabel: string;
  timestamp: string;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
}

export default function HistoryPanel({ entries }: HistoryPanelProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-teal-600" />
        <h3 className="font-semibold text-slate-800">Recent Translations</h3>
        {entries.length > 0 && (
          <span className="ml-auto text-xs text-slate-400 font-medium">{entries.length}</span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-400 text-sm">No translations yet</p>
          <p className="text-slate-300 text-xs mt-1">Recognized signs will appear here</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-teal-200 transition-colors animate-slide-in"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-slate-800">{entry.text}</span>
                  <span className="text-slate-300">→</span>
                  <span className="text-sm font-semibold text-teal-700">{entry.translatedText}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{entry.langLabel}</span>
                  <span>·</span>
                  <span>{entry.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
