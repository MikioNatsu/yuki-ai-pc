import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({ autoExecuteSafeCommands: false, hostUrl: "http://127.0.0.1:4000" });

  useEffect(() => {
    window.vrAssistant.localDb.getSettings().then((saved) => setSettings((current) => ({ ...current, ...saved })));
  }, []);

  async function update(key, value) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    await window.vrAssistant.localDb.setSetting(key, value);
  }

  return (
    <section className="settings panel">
      <h2>Settings</h2>
      <label>
        Host URL
        <input value={settings.hostUrl} onChange={(event) => update("hostUrl", event.target.value)} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={settings.autoExecuteSafeCommands}
          onChange={(event) => update("autoExecuteSafeCommands", event.target.checked)}
        />
        Auto-execute safe commands
      </label>
      <p>Default requires modal confirmation before command execution.</p>
    </section>
  );
}
