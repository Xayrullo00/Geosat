import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { api } from "../api";

type Field = { id: number; name: string; crop_type: string; area_ha: number; latitude: number; longitude: number };

export default function Fields() {
  const { t } = useTranslation();
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    api<Field[]>("/fields").then(setFields);
  }, []);

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-leaf-800">📍 {t("nav.fields")}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => (
          <div key={f.id} className="card p-5">
            <h3 className="font-bold text-leaf-800">{f.name}</h3>
            <p className="text-sm">{f.crop_type} · {f.area_ha} ga</p>
            <p className="text-xs text-soil-600">{f.latitude}, {f.longitude}</p>
            <Link to="/app/satellite" className="mt-3 inline-block text-sm font-semibold text-leaf-700 hover:underline">
              🛰️ Monitoring →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
