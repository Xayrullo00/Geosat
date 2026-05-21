import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api, authApi } from "../api";
import { useAuth } from "../context/AuthContext";

const SEGMENTS = ["farmer", "gardener", "peasant", "small_plot"] as const;

export default function Onboarding() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [segment, setSegment] = useState("farmer");
  const [phone, setPhone] = useState("");
  const [region, setRegion] = useState("Farg'ona");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [farmName, setFarmName] = useState("");
  const [area, setArea] = useState("");
  const [crops, setCrops] = useState("");
  const [soil, setSoil] = useState("loam");
  const [irrigation, setIrrigation] = useState("drip");
  const [experience, setExperience] = useState("");
  const [fieldName, setFieldName] = useState("Asosiy dala");
  const [cropType, setCropType] = useState("galla");
  const [fieldArea, setFieldArea] = useState("1");
  const [lat, setLat] = useState("40.3864");
  const [lon, setLon] = useState("71.7864");

  async function saveProfile() {
    await authApi.updateProfile({
      segment,
      phone,
      region,
      district,
      village,
      farm_name: farmName,
      total_area_ha: parseFloat(area) || 0.5,
      primary_crops: crops.split(",").map((c) => c.trim()).filter(Boolean),
      soil_type: soil,
      irrigation_type: irrigation,
      experience_years: parseInt(experience, 10) || 1,
    });
  }

  async function finish(e: FormEvent) {
    e.preventDefault();
    await saveProfile();
    await api("/fields", {
      method: "POST",
      body: JSON.stringify({
        name: fieldName,
        crop_type: cropType,
        area_ha: parseFloat(fieldArea) || 0.5,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      }),
    });
    await authApi.updateProfile({ profile_complete: true });
    await refresh();
    nav("/app");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-leaf-50 to-emerald-100 p-4">
      <div className="card mx-auto max-w-2xl p-8">
        <h1 className="mb-2 text-2xl font-bold text-leaf-800">{t("onboarding.title")}</h1>
        <p className="mb-6 text-sm text-leaf-600">
          {t("onboarding.step")} {step} / 3
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <p className="font-medium">{t("onboarding.segment")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SEGMENTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSegment(s)}
                  className={`rounded-xl border p-3 text-left ${segment === s ? "border-leaf-600 bg-leaf-50" : "border-leaf-200"}`}
                >
                  {t(`segments.${s}`)}
                </button>
              ))}
            </div>
            <input className="input" placeholder={t("onboarding.phone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button type="button" className="btn-primary" onClick={() => setStep(2)}>{t("onboarding.next")}</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <input className="input" placeholder={t("onboarding.region")} value={region} onChange={(e) => setRegion(e.target.value)} />
            <input className="input" placeholder={t("onboarding.district")} value={district} onChange={(e) => setDistrict(e.target.value)} />
            <input className="input" placeholder={t("onboarding.village")} value={village} onChange={(e) => setVillage(e.target.value)} />
            <input className="input" placeholder={t("onboarding.farmName")} value={farmName} onChange={(e) => setFarmName(e.target.value)} />
            <input className="input" type="number" step="0.01" placeholder={t("onboarding.area")} value={area} onChange={(e) => setArea(e.target.value)} />
            <input className="input" placeholder={t("onboarding.crops")} value={crops} onChange={(e) => setCrops(e.target.value)} />
            <select className="input" value={soil} onChange={(e) => setSoil(e.target.value)}>
              <option value="loam">Loam</option>
              <option value="clay">Clay</option>
              <option value="sandy">Sandy</option>
            </select>
            <select className="input" value={irrigation} onChange={(e) => setIrrigation(e.target.value)}>
              <option value="drip">Drip</option>
              <option value="furrow">Furrow</option>
              <option value="sprinkler">Sprinkler</option>
            </select>
            <input className="input" type="number" placeholder={t("onboarding.experience")} value={experience} onChange={(e) => setExperience(e.target.value)} />
            <div className="flex gap-2">
              <button type="button" className="btn-outline" onClick={() => setStep(1)}>←</button>
              <button type="button" className="btn-primary flex-1" onClick={() => setStep(3)}>{t("onboarding.next")}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={finish} className="space-y-4">
            <h2 className="font-semibold text-leaf-800">{t("onboarding.fieldTitle")}</h2>
            <input className="input" placeholder={t("onboarding.fieldName")} value={fieldName} onChange={(e) => setFieldName(e.target.value)} required />
            <input className="input" placeholder={t("onboarding.cropType")} value={cropType} onChange={(e) => setCropType(e.target.value)} required />
            <input className="input" type="number" step="0.01" placeholder={t("onboarding.fieldArea")} value={fieldArea} onChange={(e) => setFieldArea(e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder={t("onboarding.latitude")} value={lat} onChange={(e) => setLat(e.target.value)} required />
              <input className="input" placeholder={t("onboarding.longitude")} value={lon} onChange={(e) => setLon(e.target.value)} required />
            </div>
            <p className="text-xs text-soil-600">Farg'ona default: 40.3864, 71.7864</p>
            <button type="submit" className="btn-primary w-full">{t("onboarding.finish")}</button>
          </form>
        )}
      </div>
    </div>
  );
}
