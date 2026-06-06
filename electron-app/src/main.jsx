import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import LoginPage from "./components/LoginPage.jsx";
import ChatPage from "./components/ChatPage.jsx";
import SettingsPage from "./components/SettingsPage.jsx";
import "./styles.css";

function App() {
  const [token, setToken] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    window.vrAssistant?.localDb.init();
    window.vrAssistant?.auth.getToken().then((saved) => setToken(saved || ""));
  }, []);

  if (!token) return <LoginPage onLogin={setToken} />;

  return (
    <main>
      <header>
        <h1>VR Assistant</h1>
        <button type="button" onClick={() => setSettingsOpen((value) => !value)}>
          Settings
        </button>
      </header>
      {settingsOpen ? <SettingsPage /> : <ChatPage token={token} />}
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
