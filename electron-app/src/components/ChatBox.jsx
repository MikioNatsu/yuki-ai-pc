import { useState } from "react";

export default function ChatBox({ onSend, onListen }) {
  const [value, setValue] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue("");
  }

  return (
    <form className="chat-box" onSubmit={submit}>
      <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder="Yukiga yozing..." />
      <button type="submit">Send</button>
      <button type="button" onClick={onListen}>
        Offline STT
      </button>
    </form>
  );
}
