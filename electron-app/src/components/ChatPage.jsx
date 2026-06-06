import { useEffect, useState } from "react";
import ChatBox from "./ChatBox.jsx";
import ConfirmationModal from "./ConfirmationModal.jsx";
import VRMAvatar from "./VRMAvatar.jsx";
import { chat } from "../services/api.js";
import { detectIntent } from "../services/intent_matcher.js";

export default function ChatPage({ token }) {
  const [messages, setMessages] = useState([]);
  const [emotion, setEmotion] = useState({ label: "neutral", intensity: 0.3 });
  const [pendingAction, setPendingAction] = useState(null);
  const [settings, setSettings] = useState({ autoExecuteSafeCommands: false, hostUrl: "http://127.0.0.1:4000" });

  useEffect(() => {
    window.vrAssistant.localDb.getMessages(20).then(setMessages);
    window.vrAssistant.localDb.getSettings().then((saved) => setSettings((current) => ({ ...current, ...saved })));
  }, []);

  async function saveAndShow(message) {
    await window.vrAssistant.localDb.saveMessage(message);
    setMessages((current) => [...current, message]);
  }

  async function handleSend(text) {
    const userMessage = { role: "user", content: text };
    await saveAndShow(userMessage);
    const intent = detectIntent(text);
    if (intent) {
      if (settings.autoExecuteSafeCommands) await window.vrAssistant.commands.execute(intent);
      else setPendingAction(intent);
    }

    const response = await chat(
      token,
      {
        message: text,
        recentMessages: messages.slice(-8),
        keyFacts: [],
        userProfile: { charName: "Yuki", persona: "Friendly Uzbek VR desktop assistant." }
      },
      settings.hostUrl
    );
    setEmotion(response.emotion);
    await saveAndShow({ role: "assistant", content: response.reply, metadata: response });
  }

  async function handleListen() {
    await window.vrAssistant.stt.start();
    const result = await window.vrAssistant.stt.stop();
    if (result.text) await handleSend(result.text);
    else await window.vrAssistant.notifications.show("Offline STT", "Mock STT is active. Configure VOSK_MODEL_PATH for audio.");
  }

  return (
    <section className="chat-layout">
      <div className="panel">
        <div className="messages">
          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={`${message.role}-${index}`}>
              <strong>{message.role}</strong>
              <p>{message.content}</p>
            </article>
          ))}
        </div>
        <ChatBox onSend={handleSend} onListen={handleListen} />
      </div>
      <VRMAvatar emotion={emotion} />
      <ConfirmationModal
        action={pendingAction}
        onCancel={() => setPendingAction(null)}
        onConfirm={async () => {
          await window.vrAssistant.commands.execute(pendingAction);
          setPendingAction(null);
        }}
      />
    </section>
  );
}
