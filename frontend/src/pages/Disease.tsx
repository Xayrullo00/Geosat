import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Disease() {
  const { t, i18n } = useTranslation();
  const [crop, setCrop] = useState("galla");
  const [symptoms, setSymptoms] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("crop_type", crop);
    fd.append("symptoms", symptoms);
    fd.append("language", i18n.language);
    if (file) fd.append("image", file);
    const token = localStorage.getItem("agrosat_token");
    const res = await fetch("/api/disease/analyze", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    setResult(await res.json());
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-leaf-800">🦠 {t("nav.disease")}</h2>
      <form onSubmit={onSubmit} className="card max-w-xl space-y-4 p-6">
        <input className="input" value={crop} onChange={(e) => setCrop(e.target.value)} placeholder="Ekin" />
        <textarea className="input min-h-[100px]" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Alomatlar" required />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button type="submit" className="btn-primary" disabled={loading}>{t("common.submit")}</button>
      </form>
      {result && (
        <div className="card p-6 text-sm space-y-2">
          {"analysis" in result ? (
            <pre className="whitespace-pre-wrap">{String(result.analysis)}</pre>
          ) : (
            <>
              <p><strong>Diagnoz:</strong> {String(result.diagnosis)}</p>
              <p><strong>Jiddiylik:</strong> {String(result.severity)}</p>
              <p><strong>Kimyoviy:</strong> {String(result.chemical_treatment)}</p>
              <p><strong>Tabiiy:</strong> {String(result.organic_treatment)}</p>
              <p><strong>Oldini olish:</strong> {String(result.prevention)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
