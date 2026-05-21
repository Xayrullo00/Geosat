import { useTranslation } from "react-i18next";

const langs = [
  { code: "uz", label: "O'zbek" },
  { code: "ru", label: "Рус" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher({ onChange }: { onChange?: (l: string) => void }) {
  const { i18n, t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-soil-600">{t("common.language")}:</span>
      {langs.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => {
            i18n.changeLanguage(l.code);
            localStorage.setItem("agrosat_lang", l.code);
            onChange?.(l.code);
          }}
          className={`rounded-lg px-3 py-1 text-sm font-medium transition ${
            i18n.language === l.code ? "bg-leaf-600 text-white" : "bg-leaf-100 text-leaf-800 hover:bg-leaf-200"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
