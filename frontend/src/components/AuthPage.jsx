import { useState } from "react";
import { api, auth } from "../api";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim();

    if (isRegister && !cleanName) return setError("Name is required.");
    if (!EMAIL_RE.test(cleanEmail))
      return setError("Enter a valid email address.");
    if (!password) return setError("Password is required.");
    if (isRegister && password.length < 6)
      return setError("Password must be at least 6 characters.");

    setBusy(true);
    setError("");
    try {
      const data = isRegister
        ? await api.register({
            name: cleanName,
            email: cleanEmail,
            password,
          })
        : await api.login({ email: cleanEmail, password });
      auth.setToken(data.access_token);
      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Project & Task Manager</h1>
        <h2>{isRegister ? "Create account" : "Log in"}</h2>
        <form className="form" onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              maxLength={100}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            maxLength={255}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            maxLength={72}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={busy}>
            {busy ? "Please wait..." : isRegister ? "Register" : "Log in"}
          </button>
        </form>
        <p className="muted">
          {isRegister ? "Already have an account? " : "No account yet? "}
          <button type="button" className="link-button" onClick={switchMode}>
            {isRegister ? "Log in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}