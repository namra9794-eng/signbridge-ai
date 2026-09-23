export type LanguageCode = "en" | "hi" | "es" | "fr";

export interface Language {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
  speechLang: string;
}

export const LANGUAGES: Language[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "EN", speechLang: "en-US" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", flag: "HI", speechLang: "hi-IN" },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "ES", speechLang: "es-ES" },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "FR", speechLang: "fr-FR" },
];

const TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  Hello: { en: "Hello", hi: "नमस्ते", es: "Hola", fr: "Bonjour" },
  "Thank You": { en: "Thank You", hi: "धन्यवाद", es: "Gracias", fr: "Merci" },
  Help: { en: "Help", hi: "मदद", es: "Ayuda", fr: "Aide" },
  Yes: { en: "Yes", hi: "हाँ", es: "Sí", fr: "Oui" },
  No: { en: "No", hi: "नहीं", es: "No", fr: "Non" },
};

export function translate(text: string, targetLang: LanguageCode): string | null {
  const entry = TRANSLATIONS[text];
  if (!entry) return null;
  return entry[targetLang] ?? null;
}

export function getLanguage(code: LanguageCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
