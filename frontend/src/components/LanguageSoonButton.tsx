import { useState } from "react";
import i18n from "../i18n";

const DASHBOARD_LANGUAGE_SAVED_KEY = "smaj_dashboard_language_saved";

type LanguageChoiceButtonProps = {
  dashboardPrompt?: boolean;
};

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "Francais" },
] as const;

const LanguageSoonButton = ({ dashboardPrompt = false }: LanguageChoiceButtonProps) => {
  const [hidden, setHidden] = useState(
    () => dashboardPrompt && window.localStorage.getItem(DASHBOARD_LANGUAGE_SAVED_KEY) === "true",
  );
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(i18n.resolvedLanguage === "fr" ? "fr" : "en");

  if (hidden) return null;

  const saveLanguage = async () => {
    await i18n.changeLanguage(selected);
    window.localStorage.setItem("smaj_language", selected);
    window.localStorage.setItem(DASHBOARD_LANGUAGE_SAVED_KEY, "true");
    setOpen(false);
    if (dashboardPrompt) setHidden(true);
  };

  return (
    <>
      <button
        type="button"
        className="language-soon-button"
        aria-label="Choose language"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true">{"\u6587"}</span>
        <span aria-hidden="true">A</span>
      </button>

      {open ? (
        <div className="language-choice-backdrop" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="language-choice-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-choice-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="language-choice-close" aria-label="Close" onClick={() => setOpen(false)}>x</button>
            <h2 id="language-choice-title">Pick language</h2>
            <label>
              <span>Language</span>
              <select value={selected} onChange={(event) => setSelected(event.target.value as "en" | "fr")}>
                {languages.map((language) => <option value={language.code} key={language.code}>{language.label}</option>)}
              </select>
            </label>
            <div className="language-choice-actions">
              <button type="button" className="language-choice-cancel" onClick={() => setOpen(false)}>Cancel</button>
              <button type="button" className="language-choice-save" onClick={() => void saveLanguage()}>Save</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
};

export default LanguageSoonButton;