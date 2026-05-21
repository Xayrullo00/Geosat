import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const modules = [
  { to: "/app/satellite", icon: "🛰️", key: "satellite", color: "from-emerald-500 to-green-700" },
  { to: "/app/weather", icon: "🌤️", key: "weather", color: "from-sky-400 to-blue-600" },
  { to: "/app/disease", icon: "🦠", key: "disease", color: "from-amber-400 to-orange-600" },
  { to: "/app/calendar", icon: "📅", key: "calendar", color: "from-lime-400 to-leaf-700" },
  { to: "/app/forecast", icon: "📊", key: "forecast", color: "from-violet-400 to-purple-700" },
  { to: "/app/crops", icon: "🌾", key: "crops", color: "from-yellow-400 to-amber-700" },
  { to: "/app/advisory", icon: "🤖", key: "advisory", color: "from-teal-400 to-cyan-700" },
  { to: "/app/fields", icon: "📍", key: "fields", color: "from-green-500 to-emerald-800" },
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div>
      <div className="card mb-6 bg-gradient-to-r from-leaf-600 to-emerald-700 p-6 text-white">
        <h2 className="text-2xl font-bold">{t("dashboard.welcome")}, {String(user?.full_name || "")} 🌱</h2>
        <p className="mt-1 opacity-90">
          {String(user?.region || "Farg'ona")} · {String(user?.segment || "farmer")} · {String(user?.total_area_ha || "—")} ga
        </p>
      </div>
      <h3 className="mb-4 text-lg font-semibold text-leaf-800">{t("dashboard.quick")}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className={`card bg-gradient-to-br ${m.color} p-5 text-white transition hover:scale-[1.02] hover:shadow-xl`}
          >
            <span className="text-3xl">{m.icon}</span>
            <p className="mt-2 font-semibold">{t(`nav.${m.key}`)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
