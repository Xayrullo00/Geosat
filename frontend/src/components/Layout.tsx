import { Link, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

const navItems = [
  { path: "/app", key: "dashboard", icon: "🏠" },
  { path: "/app/satellite", key: "satellite", icon: "🛰️" },
  { path: "/app/weather", key: "weather", icon: "🌤️" },
  { path: "/app/disease", key: "disease", icon: "🦠" },
  { path: "/app/calendar", key: "calendar", icon: "📅" },
  { path: "/app/forecast", key: "forecast", icon: "📊" },
  { path: "/app/crops", key: "crops", icon: "🌾" },
  { path: "/app/advisory", key: "advisory", icon: "🤖" },
  { path: "/app/fields", key: "fields", icon: "📍" },
];

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const loc = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-50 via-emerald-50 to-sky-50">
      <header className="sticky top-0 z-20 border-b border-leaf-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div>
            <h1 className="text-xl font-bold text-leaf-800">🌱 {t("app.name")}</h1>
            <p className="text-xs text-leaf-600">{t("app.tagline")}</p>
          </div>
          <LanguageSwitcher
            onChange={async (l) => {
              try {
                const { authApi } = await import("../api");
                await authApi.updateProfile({ language: l });
              } catch {
                /* guest */
              }
            }}
          />
          <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-soil-800">{String(user?.full_name || "")}</span>
            <button type="button" onClick={logout} className="btn-outline text-sm py-1.5 px-3">
              {t("auth.logout")}
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 pb-2">
          {navItems.map((n) => (
            <Link
              key={n.path}
              to={n.path}
              className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition ${
                loc.pathname === n.path ? "bg-leaf-600 text-white" : "text-leaf-800 hover:bg-leaf-100"
              }`}
            >
              {n.icon} {t(`nav.${n.key}`)}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
