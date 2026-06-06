const intentPatterns = [
  {
    name: "open_file",
    patterns: [/^(?:open|och|ochib ber)\s+(?:file|fayl)?\s*(?<target>.+)$/i, /^(?<target>.+)\s+(?:faylini)?\s*och$/i],
    args: (match) => ({ target: match.groups?.target?.trim() })
  },
  {
    name: "start_app",
    patterns: [/^(?:start|run|ishga tushir|och)\s+(?:app|dastur)?\s*(?<app>[\w .-]+)$/i],
    args: (match) => ({ app: match.groups?.app?.trim() })
  },
  {
    name: "show_notification",
    patterns: [/^(?:notify|eslat|bildirishnoma)\s+(?<message>.+)$/i],
    args: (match) => ({ message: match.groups?.message?.trim() })
  },
  {
    name: "copy_to_clipboard",
    patterns: [/^(?:copy|nusxa ol)\s+(?<text>.+)$/i],
    args: (match) => ({ text: match.groups?.text?.trim() })
  },
  {
    name: "create_note",
    patterns: [/^(?:note|eslatma|qayd)\s+(?<text>.+)$/i],
    args: (match) => ({ text: match.groups?.text?.trim() })
  },
  {
    name: "play_media",
    patterns: [/^(?:play|ijro et|musiqa qo'y)(?:\s+(?<target>.+))?$/i],
    args: (match) => ({ target: match.groups?.target?.trim() || "" })
  },
  {
    name: "pause_media",
    patterns: [/^(?:pause|to'xtat|pauza)$/i],
    args: () => ({})
  }
];

export function detectIntent(text) {
  const clean = String(text || "").trim();
  if (!clean) return null;
  for (const intent of intentPatterns) {
    for (const pattern of intent.patterns) {
      const match = clean.match(pattern);
      if (match) {
        return {
          type: "command",
          name: intent.name,
          args: intent.args(match),
          confidence: 0.82,
          requiresConfirmation: true
        };
      }
    }
  }
  return null;
}

export function listSupportedIntents() {
  return intentPatterns.map((intent) => intent.name);
}
