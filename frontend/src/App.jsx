import { useEffect, useState } from "react";
import { api, auth, setUnauthorizedHandler } from "./api";
import AuthPage from "./components/AuthPage";
import TaskManager from "./TaskManager";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(auth.getToken()));

  function logout() {
    auth.clear();
    setUser(null);
  }

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
  }, []);

  // if a token is saved from an earlier visit, check that it is still valid
  useEffect(() => {
    if (!auth.getToken()) return;
    api
      .me()
      .then(setUser)
      .catch(() => auth.clear())
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!user) return <AuthPage onAuthenticated={setUser} />;
  return <TaskManager user={user} onLogout={logout} />;
}

export default App;