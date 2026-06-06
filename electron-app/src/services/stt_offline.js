export function createOfflineStt({ modelPath } = {}) {
  let listening = false;

  return {
    async start() {
      listening = true;
      return {
        ok: true,
        mode: modelPath ? "vosk" : "mock",
        message: modelPath ? "Vosk model configured." : "Mock STT active. Set VOSK_MODEL_PATH for offline speech recognition."
      };
    },
    async stop() {
      listening = false;
      return { ok: true, text: "", listening };
    },
    isListening() {
      return listening;
    }
  };
}

export async function transcribeAudioFile(_filePath, { modelPath } = {}) {
  if (!modelPath) return { text: "", confidence: 0, mode: "mock" };
  const vosk = await import("vosk");
  return { text: "", confidence: 0, mode: "vosk", available: Boolean(vosk) };
}
