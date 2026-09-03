/**
 * Bagimsiz konusma tanima testi (client).
 * Sahne mantigindan tamamen ayri kendi SpeechRecognition ornegini kurar; boylece
 * "Web Speech bu makinede calisiyor mu?" sorusu tek basina yanitlanir.
 */
import { getSpeechRecognition } from "./speechTypes";

export interface SpeechTestResult {
  supported: boolean;
  started: boolean;
  audioStarted: boolean;
  speechDetected: boolean;
  resultCount: number;
  transcript: string;
  error: string | null;
  /** Google servisi sessizlik bildirdi - Chrome yanlis mikrofonu dinliyor olabilir */
  noSpeech: boolean;
  durationMs: number;
}

export function runSpeechSelfTest(seconds = 8, lang = "tr-TR"): Promise<SpeechTestResult> {
  const Ctor = getSpeechRecognition();
  const res: SpeechTestResult = {
    supported: !!Ctor,
    started: false,
    audioStarted: false,
    speechDetected: false,
    resultCount: 0,
    transcript: "",
    error: null,
    noSpeech: false,
    durationMs: 0,
  };
  if (!Ctor) return Promise.resolve(res);

  return new Promise((resolve) => {
    const rec = new Ctor();
    const t0 = Date.now();
    let done = false;
    let closing = false;

    const finish = () => {
      if (done) return;
      done = true;
      closing = true; // kendi abort'umuz hata olarak yazilmasin
      res.durationMs = Date.now() - t0;
      try {
        rec.abort();
      } catch {
        // yok say
      }
      resolve(res);
    };

    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      res.started = true;
    };
    rec.onaudiostart = () => {
      res.audioStarted = true;
    };
    rec.onspeechstart = () => {
      res.speechDetected = true;
    };
    rec.onresult = (ev) => {
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const text = (ev.results[i][0]?.transcript ?? "").trim();
        if (text) {
          res.resultCount++;
          res.transcript = text;
        }
      }
    };
    rec.onerror = (ev) => {
      if (closing) return;
      if (ev.error === "no-speech") {
        res.noSpeech = true;
        return;
      }
      if (ev.error === "aborted") return;
      res.error = String(ev.error);
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed" || ev.error === "audio-capture") {
        finish();
      }
    };
    rec.onend = () => {
      if (Date.now() - t0 >= seconds * 1000 - 250) finish();
    };

    try {
      rec.start();
    } catch (e) {
      res.error = e instanceof Error ? e.message : "start() basarisiz";
      finish();
      return;
    }
    window.setTimeout(finish, seconds * 1000);
  });
}
