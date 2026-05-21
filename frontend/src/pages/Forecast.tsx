import { FormEvent, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Forecast() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [forecast, setForecast] = useState<Record<string, unknown> | null>(null);
  const [crop, setCrop] = useState("galla");
  const [area, setArea] = useState("1");
  const [tons, setTons] = useState("2");

  useEffect(() => {
    api("/forecast/regional").then(setForecast);
  }, []);

  async function submitYield(e: FormEvent) {
    e.preventDefault();
    await api("/yield/report", {
      method: "POST",
      body: JSON.stringify({
        crop_type: crop,
        area_ha: parseFloat(area),
        expected_yield_tons: parseFloat(tons),
        region: String(user?.region || "Farg'ona"),
        district: user?.district || null,
      }),
    });
    setForecast(await api("/forecast/regional"));
  }

  const crops = (forecast?.crops as { crop: string; expected_tons: number; area_ha: number }[]) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-leaf-800">📊 {t("nav.forecast")}</h2>
      <form onSubmit={submitYield} className="card grid max-w-md gap-3 p-4 sm:grid-cols-4">
        <input className="input" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="Ekin" />
        <input className="input" type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="ga" />
        <input className="input" type="number" value={tons} onChange={(e) => setTons(e.target.value)} placeholder="tonna" />
        <button type="submit" className="btn-primary">{t("common.submit")}</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-leaf-50">
              <th className="p-2 text-left">Ekin</th>
              <th className="p-2">Ton (kutilmoqda)</th>
              <th className="p-2">ga</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((c) => (
              <tr key={c.crop} className="border-t">
                <td className="p-2">{c.crop}</td>
                <td className="p-2 text-center">{c.expected_tons}</td>
                <td className="p-2 text-center">{c.area_ha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
