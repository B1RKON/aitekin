/**
 * Web Speech API tipleri (lib.dom'da SpeechRecognition yok). Global kirletmeden modul icinde.
 */
export interface SRAlternative {
  transcript: string;
  confidence: number;
}
export interface SRResult {
  isFinal: boolean;
  length: number;
  [index: number]: SRAlternative;
}
export interface SRResultList {
  length: number;
  [index: number]: SRResult;
}
export interface SREvent extends Event {
  resultIndex: number;
  results: SRResultList;
}
export type SRErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported";
export interface SRErrorEvent extends Event {
  error: SRErrorCode | string;
  message?: string;
}
export interface SRInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((ev: Event) => void) | null;
  onend: ((ev: Event) => void) | null;
  onerror: ((ev: SRErrorEvent) => void) | null;
  onresult: ((ev: SREvent) => void) | null;
  onaudiostart: ((ev: Event) => void) | null;
  onaudioend: ((ev: Event) => void) | null;
  onspeechstart: ((ev: Event) => void) | null;
  onspeechend: ((ev: Event) => void) | null;
}
export type SRConstructor = new () => SRInstance;

export function getSpeechRecognition(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
