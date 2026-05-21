import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";

type Crop = { name: string; roi_score: number; season: string; water: string };

export default function Crops() {
  const { t } = useTranslation();
  const [crops, setCrops] = useState<Crop[]>([]);

  useEffect(() => {
    api<Crop[]>("/crops/recommend").then(setCrops);
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-leaf-800">🌾 {t("nav.crops")}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {crops.map((c) => (
          <div key={c.name} className="card p-5">
            <h3 className="text-lg font-bold text-leaf-800">{c.name}</h3>
            <p className="text-3xl font-bold text-leaf-600">{c.roi_score}% ROI</p>
            <p className="text-sm text-soil-600">{c.season} · {c.water} water</p>
            <div className="mt-2 h-2 rounded-full bg-leaf-100">
              <div className="h-2 rounded-full bg-leaf-500" style={{ width: `${c.roi_score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
