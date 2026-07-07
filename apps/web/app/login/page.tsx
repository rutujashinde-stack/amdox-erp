"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../lib/api";
import { useAuthStore } from "../../lib/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@amdox.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      setToken(res.data.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="text-center text-3xl font-bold">Amdox ERP</h1>
        <p className="mb-6 text-center text-slate-500">Login to continue</p>

        {error && <p className="mb-4 text-center text-sm text-red-600">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full rounded border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded border p-3"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full rounded bg-blue-600 p-3 text-white">
            Login
          </button>
        </form>
      </div>
    </main>
  );
}