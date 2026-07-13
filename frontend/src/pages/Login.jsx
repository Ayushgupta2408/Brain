import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setCredentials } from "../store/authSlice.js";
import Footer from "../components/Footer.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      dispatch(setCredentials(data));
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="w-9 h-9 rounded-lg bg-signal/20 border border-signal flex items-center justify-center">
              <span className="text-signal font-display font-bold text-sm">B</span>
            </div>
            <span className="font-display font-semibold text-xl">Brain</span>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-2xl p-6 space-y-4">
            <h1 className="font-display text-lg text-center mb-2">Welcome back</h1>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-signal"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface2 border border-line rounded-lg px-3 py-2 text-sm outline-none focus:border-signal"
            />

            {error && <p className="text-pulse text-xs">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-signal hover:bg-signal/90 disabled:opacity-50 text-white rounded-lg py-2 text-sm font-medium transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="text-center text-xs text-muted">
              No account?{" "}
              <Link to="/register" className="text-signal">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
