import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";

export default function Weather() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    api("/weather?lat=40.3864&lon=71.7864").then(setData);
  }, []);

  const irrigation = data?.irrigation as { should_irrigate?: boolean; amount_mm?: number } | undefined;
  const series = (data?.series as { date: string; temp_c: number; rain_mm: number }[]) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-leaf-800">🌤️ {t("weather.title")}</h2>
      <div className={`card p-6 text-center ${irrigation?.should_irrigate ? "bg-amber-50 border-amber-200" : "bg-sky-50 border-sky-200"}`}>
        <p className="text-lg font-semibold">{t("weather.irrigateToday")}</p>
        <p className="mt-2 text-4xl font-bold text-leaf-800">
          {irrigation?.should_irrigate ? t("weather.yes") : t("weather.no")}
        </p>
        {irrigation?.should_irrigate && (
          <p className="text-sm text-soil-600">~{irrigation.amount_mm} mm</p>
        )}
      </div>
      <p className="text-sm text-soil-600">{t("weather.nasa")}</p>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-leaf-50">
              <th className="p-2 text-left">Sana</th>
              <th className="p-2">°C</th>
              <th className="p-2">Yomg'ir mm</th>
            </tr>
          </thead>
          <tbody>
            {series.slice(-7).map((r) => (
              <tr key={r.date} className="border-b border-leaf-50">
                <td className="p-2">{r.date}</td>
                <td className="p-2 text-center">{r.temp_c}</td>
                <td className="p-2 text-center">{r.rain_mm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
