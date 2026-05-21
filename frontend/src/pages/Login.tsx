import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { setToken, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await authApi.login({ email, password });
      setToken(res.access_token);
      await refresh();
      nav(res.profile_complete ? "/app" : "/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-leaf-100 via-green-50 to-lime-100 p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="text-5xl mb-2">🌱🛰️</div>
          <h1 className="text-2xl font-bold text-leaf-800">{t("app.name")}</h1>
          <p className="text-leaf-600">{t("app.tagline")}</p>
        </div>
        <div className="mb-4 flex justify-center">
          <LanguageSwitcher />
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("auth.email")}</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("auth.password")}</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">{t("auth.login")}</button>
        </form>
        <p className="mt-4 text-center text-sm">
          {t("auth.noAccount")}{" "}
          <Link to="/register" className="font-semibold text-leaf-700 hover:underline">{t("auth.register")}</Link>
        </p>
      </div>
    </div>
  );
}
