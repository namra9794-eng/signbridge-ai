import { Hand, ArrowRight, Eye, Languages, Volume2, ShieldCheck } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md">
            <Hand className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">SignBridge AI</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 pb-12 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-teal-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium mb-8">
            <ShieldCheck className="w-4 h-4" />
            AI-Powered Sign Language Translator
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
            Breaking Communication
            <br />
            <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Barriers with AI
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            SignBridge AI uses computer vision to recognize sign language gestures in real time,
            translate them into multiple languages, and speak them aloud — bridging the gap
            between the deaf community and the hearing world.
          </p>

          <button
            onClick={onStart}
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-lg font-semibold shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:scale-105 active:scale-100 transition-all duration-200"
          >
            Start Translating
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="mt-4 text-sm text-slate-400">
            Camera access required · Works best in Chrome / Edge
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">How It Works</h2>
          <p className="text-slate-500 text-center mb-14 max-w-xl mx-auto">
            Five steps from gesture to spoken word, all running live in your browser.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Eye, title: "Hand Detection", desc: "MediaPipe tracks 21 hand landmarks from your webcam in real time." },
              { icon: Hand, title: "Sign Recognition", desc: "Hand poses are classified into common gestures like Hello, Thank You, Help." },
              { icon: Languages, title: "Translation", desc: "Recognized text is translated into English, Hindi, and more languages." },
              { icon: Volume2, title: "Text-to-Speech", desc: "The translated text is spoken aloud using the browser's speech engine." },
            ].map((step, i) => (
              <div
                key={i}
                className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-teal-200 hover:bg-teal-50/50 transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-4 shadow-md">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-xs font-bold text-teal-600 mb-1">STEP {i + 1}</div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prototype notice */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" />
            Prototype Notice
          </div>
          <p className="text-slate-600 leading-relaxed">
            This is a functional prototype demonstrating the full pipeline — camera, detection,
            recognition, translation, and speech. It currently recognizes a limited vocabulary
            of common gestures, and is designed so a trained sign-language model can be plugged
            in later. A Demo Mode is available if your camera is unavailable.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
              <Hand className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">SignBridge AI</span>
          </div>
          <p className="text-slate-400 text-sm">
            Sign Language → Text → Translation → Speech
          </p>
        </div>
      </footer>
    </div>
  );
}
