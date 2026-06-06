import { useState } from "react";
import { login, register } from "../services/api.js";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("password123");
  const [displayName, setDisplayName] = useState("Demo");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const response =
        mode === "register" ? await register({ email, password, displayName }) : await login({ email, password });
      await window.vrAssistant.auth.setToken(response.token);
      onLogin(response.token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="login">
      <h1>VR Assistant</h1>
      <form className="panel" onSubmit={submit}>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {mode === "register" ? (
          <label>
            Display name
            <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          </label>
        ) : null}
        <label>
          Password
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
        <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          Switch to {mode === "login" ? "register" : "login"}
        </button>
        {error ? <p role="alert">{error}</p> : null}
      </form>
    </section>
  );
}
