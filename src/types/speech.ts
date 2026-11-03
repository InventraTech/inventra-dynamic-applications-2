export interface SpeechResultEvent { results: { [index: number]: { [index: number]: { transcript: string } } } }
export interface BrowserSpeechRecognition {
 lang: string; interimResults: boolean; continuous: boolean;
 onresult: ((event: SpeechResultEvent) => void) | null;
 onerror: ((event: { error: string }) => void) | null;
 onend: (() => void) | null;
 start: () => void; abort: () => void;
}
export interface SpeechWindow extends Window { SpeechRecognition?: new () => BrowserSpeechRecognition; webkitSpeechRecognition?: new () => BrowserSpeechRecognition }

export interface VoiceSearchControls { listening: boolean; error: string | null; supported: boolean; toggle: () => void }
