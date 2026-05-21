import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";

type Field = { id: number; name: string; crop_type: string };
type Monitoring = {
  satellite: {
    indices: { ndvi: number; ndvi_change_5d: number; evi: number; ndwi: number };
    health_status: string;
    history: { date: string; ndvi: number }[];
    zones: { zone: string; ndvi: number; status: string }[];
    bands_used: string[];
    resolution_m: number;
    revisit_days: number;
    extra: Record<string, unknown>;
  };
};

export default function Satellite() {
  const { t } = useTranslation();
  const [fields, setFields] = useState<Field[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [data, setData] = useState<Monitoring | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<Field[]>("/fields").then((f) => {
      setFields(f);
      if (f[0]) setSelected(f[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    api<Monitoring>(`/fields/${selected}/monitoring`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [selected]);

  const sat = data?.satellite;
  const healthColor: Record<string, string> = {
    healthy: "bg-leaf-500",
    moderate: "bg-yellow-400",
    stressed: "bg-red-500",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-leaf-800">🛰️ {t("satellite.title")}</h2>
      <select className="input max-w-xs" value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}>
        {fields.map((f) => (
          <option key={f.id} value={f.id}>{f.name} — {f.crop_type}</option>
        ))}
      </select>
      {loading && <p>{t("common.loading")}</p>}
      {sat && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="card p-4">
              <p className="text-sm text-soil-600">{t("satellite.ndvi")}</p>
              <p className="text-3xl font-bold text-leaf-700">{sat.indices.ndvi}</p>
              <p className="text-xs">Δ5d: {sat.indices.ndvi_change_5d}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm">EVI</p>
              <p className="text-2xl font-bold">{sat.indices.evi}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm">NDWI</p>
              <p className="text-2xl font-bold">{sat.indices.ndwi}</p>
            </div>
            <div className="card p-4">
              <p className="text-sm">{t("satellite.health")}</p>
              <span className={`inline-block rounded-full px-3 py-1 text-white ${healthColor[sat.health_status] || "bg-gray-400"}`}>
                {sat.health_status}
              </span>
            </div>
          </div>
          <div className="card p-4">
            <p className="mb-2 font-medium">{t("satellite.bands")}</p>
            <p className="text-sm">{sat.bands_used.join(" · ")}</p>
            <p className="mt-2 text-sm text-soil-600">
              {t("satellite.resolution")}: {sat.resolution_m}m · {t("satellite.revisit")}: {sat.revisit_days} kun
            </p>
          </div>
          <div className="card p-4">
            <p className="mb-3 font-medium">{t("satellite.zones")}</p>
            <div className="grid gap-2 sm:grid-cols-5">
              {sat.zones.map((z) => (
                <div key={z.zone} className="rounded-xl border border-leaf-100 p-3 text-center">
                  <p className="text-xs uppercase">{z.zone}</p>
                  <p className="text-lg font-bold" style={{ color: `rgb(${Math.round((1 - z.ndvi) * 200)}, ${Math.round(z.ndvi * 180)}, 80)` }}>
                    {z.ndvi}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4">
            <p className="mb-2 font-medium">NDVI trend</p>
            <div className="flex h-32 items-end gap-1">
              {sat.history.map((h) => (
                <div
                  key={h.date}
                  className="flex-1 rounded-t bg-leaf-500"
                  style={{ height: `${h.ndvi * 100}%` }}
                  title={`${h.date}: ${h.ndvi}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
