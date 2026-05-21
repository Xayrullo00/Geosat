import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";

export default function Advisory() {
  const { t, i18n } = useTranslation();
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = await api<{ answer: string }>("/advisory", {
      method: "POST",
      body: JSON.stringify({ question: q, language: i18n.language }),
    });
    setAnswer(res.answer);
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-leaf-800">🤖 {t("nav.advisory")}</h2>
      <form onSubmit={onSubmit} className="card max-w-2xl space-y-4 p-6">
        <textarea className="input min-h-[120px]" value={q} onChange={(e) => setQ(e.target.value)} required />
        <button type="submit" className="btn-primary">{t("common.submit")}</button>
      </form>
      {answer && <div className="card whitespace-pre-wrap p-6 text-sm">{answer}</div>}
    </div>
  );
}
