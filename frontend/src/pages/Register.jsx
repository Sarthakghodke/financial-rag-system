import { ShieldPlus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Alert from "../components/Alert";
import LoadingButton from "../components/LoadingButton";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage, registerUser } from "../services/api";

export default function Register() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10 text-slate-100">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-indigo-400 text-slate-950 shadow-glow">
            <ShieldPlus className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-white">Create account</h1>
          <p className="mt-2 text-sm text-slate-400">
            Register a user for the financial RAG dashboard.
          </p>
        </div>

        <form className="panel space-y-4 p-6" onSubmit={handleSubmit}>
          <Alert message={error} />
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Username</span>
            <input
              className="input"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
            <input
              className="input"
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          <LoadingButton loading={loading} className="btn-primary w-full">
            Register
          </LoadingButton>
          <p className="text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link className="font-medium text-teal-300 hover:text-teal-200" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
