import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const role = data.user?.role;
      localStorage.setItem("sparvi_token", data.token);
      localStorage.setItem("sparvi_role", role || "");
      localStorage.setItem("sparvi_user", JSON.stringify(data.user || {}));
      navigate("/inbox");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="inbox-login">
      <form className="inbox-login-card" onSubmit={handleSubmit}>
        <h1 className="inbox-title">Unified Inbox</h1>
        <p className="inbox-subtitle">Sign in to manage WhatsApp conversations</p>
        {error && <div className="inbox-error">{error}</div>}
        <label className="inbox-label">
          Email
          <input
            type="email"
            className="inbox-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="inbox-label">
          Password
          <input
            type="password"
            className="inbox-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="inbox-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
};

export default Login;
