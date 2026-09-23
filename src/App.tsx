import { useState } from "react";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

type View = "landing" | "dashboard";

export default function App() {
  const [view, setView] = useState<View>("landing");

  if (view === "dashboard") {
    return <Dashboard onBack={() => setView("landing")} />;
  }

  return <LandingPage onStart={() => setView("dashboard")} />;
}
