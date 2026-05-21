import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { authApi } from "../api";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Register() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { setToken, refresh } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await authApi.register({
        email,
        password,
        full_name: fullName,
        language: i18n.language,
      });
      setToken(res.access_token);
      await refresh();
      nav("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-leaf-100 via-green-50 to-lime-100 p-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-2 text-center text-2xl font-bold text-leaf-800">{t("auth.register")}</h1>
        <div className="mb-4 flex justify-center"><LanguageSwitcher /></div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t("auth.fullName")}</label>
            <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("auth.email")}</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t("auth.password")}</label>
            <input className="input" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="mt-1 text-xs text-soil-600">{t("auth.passwordHint")}</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full">{t("auth.register")}</button>
        </form>
        <p className="mt-4 text-center text-sm">
          {t("auth.hasAccount")}{" "}
          <Link to="/login" className="font-semibold text-leaf-700 hover:underline">{t("auth.login")}</Link>
        </p>
      </div>
    </div>
  );
}
