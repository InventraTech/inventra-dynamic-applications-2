import { useCallback, useEffect, useRef, useState } from "react";
import type { BrowserSpeechRecognition, SpeechWindow, VoiceSearchControls } from "../types/speech";
export function useVoiceSearch(onResult: (value: string) => void): VoiceSearchControls {
 const engine = useRef<BrowserSpeechRecognition | null>(null);
 const resultRef = useRef(onResult);
 useEffect(() => { resultRef.current = onResult; }, [onResult]);
 const [state, setState] = useState<{ listening: boolean; error: string | null }>({ listening: false, error: null });
 const browser = window as SpeechWindow;
 const supported = Boolean(browser.SpeechRecognition || browser.webkitSpeechRecognition);
 useEffect(() => () => { if (engine.current) { engine.current.onend = null; engine.current.onerror = null; engine.current.onresult = null; engine.current.abort(); } }, []);
 const toggle = useCallback(() => {
  if (engine.current) { engine.current.abort(); engine.current = null; setState({ listening: false, error: null }); return; }
  const browser = window as SpeechWindow; const Recognition = browser.SpeechRecognition || browser.webkitSpeechRecognition;
  if (!Recognition) { setState({ listening: false, error: "Este navegador não oferece pesquisa por voz. Use a busca por texto." }); return; }
  const recognition = new Recognition(); engine.current = recognition;
  recognition.lang = "pt-BR"; recognition.interimResults = false; recognition.continuous = false;
  recognition.onresult = event => { resultRef.current(event.results[0][0].transcript); };
  recognition.onerror = event => { setState({ listening: false, error: event.error === "not-allowed" ? "Permita o microfone nas configurações do navegador para pesquisar por voz." : event.error === "no-speech" ? "Não ouvi uma fala. Tente novamente." : "Não foi possível reconhecer a fala. Confira a conexão e tente novamente." }); };
  recognition.onend = () => { engine.current = null; setState(s => ({ ...s, listening: false })); };
  try { setState({ listening: true, error: null }); recognition.start(); }
  catch { engine.current = null; setState({ listening: false, error: "Não foi possível iniciar o microfone." }); }
 }, []);
 return { ...state, supported, toggle };
}
