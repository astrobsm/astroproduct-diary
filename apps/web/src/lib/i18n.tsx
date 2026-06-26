import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Lang = "en" | "fr";

const STORAGE_KEY = "astrobsm.lang";

/**
 * Translation dictionary. Keys are dotted, values are { en, fr }. French copy is
 * authored for the Bonnesante Medicals Sub-Saharan rollout. Keep keys flat and
 * explicit — no string interpolation magic — so missing translations are obvious.
 */
const DICT: Record<string, { en: string; fr: string }> = {
  "nav.home": { en: "Home", fr: "Accueil" },
  "nav.products": { en: "Products", fr: "Produits" },
  "nav.research": { en: "Evidence", fr: "Preuves" },
  "nav.hospitals": { en: "Hospitals", fr: "Hôpitaux" },
  "nav.academy": { en: "Academy", fr: "Académie" },
  "nav.coach": { en: "Coach", fr: "Coach" },
  "nav.insights": { en: "Insights", fr: "Analyses" },
  "nav.crm": { en: "CRM", fr: "CRM" },
  "nav.events": { en: "Events", fr: "Événements" },
  "nav.trainers": { en: "Trainers", fr: "Formateurs" },
  "nav.learning": { en: "My Learning", fr: "Mes cours" },
  "nav.learningShort": { en: "Learning", fr: "Cours" },
  "nav.admin": { en: "Admin", fr: "Admin" },
  "nav.settings": { en: "Settings", fr: "Paramètres" },
  "nav.signin": { en: "Sign in", fr: "Connexion" },
  "nav.signout": { en: "Sign out", fr: "Déconnexion" },

  "home.badge": { en: "Nigeria · Sub-Saharan Africa · EN / FR", fr: "Nigéria · Afrique subsaharienne · EN / FR" },
  "home.title": {
    en: "ASTROBSM Academy & Sales Intelligence Platform",
    fr: "Plateforme ASTROBSM Académie & Intelligence Commerciale"
  },
  "home.subtitle": {
    en: "The single knowledge and operations hub for Bonnesante Medicals — educating staff, training trainers, equipping marketers and driving wound-care excellence across Africa.",
    fr: "Le centre unique de connaissances et d'opérations de Bonnesante Medicals — former le personnel, former les formateurs, équiper les commerciaux et promouvoir l'excellence en soins des plaies à travers l'Afrique."
  },
  "home.exploreProducts": { en: "Explore products", fr: "Découvrir les produits" },
  "home.openAcademy": { en: "Open the Academy", fr: "Ouvrir l'Académie" },
  "home.deliversTitle": { en: "What the platform delivers", fr: "Ce que la plateforme offre" },
  "home.featured": { en: "Featured products", fr: "Produits en vedette" },
  "home.viewAll": { en: "View all", fr: "Tout voir" },
  "home.pillar.product.title": { en: "Product Knowledge", fr: "Connaissance produit" },
  "home.pillar.product.text": {
    en: "Authoritative, evidence-linked pages for every ASTROBSM wound-care product.",
    fr: "Des fiches fiables et sourcées pour chaque produit de soin des plaies ASTROBSM."
  },
  "home.pillar.academy.title": { en: "Training Academy", fr: "Académie de formation" },
  "home.pillar.academy.text": {
    en: "Structured learning paths for marketers, sales, distributors and clinical staff.",
    fr: "Des parcours structurés pour le marketing, les ventes, les distributeurs et le personnel clinique."
  },
  "home.pillar.evidence.title": { en: "Evidence Library", fr: "Bibliothèque de preuves" },
  "home.pillar.evidence.text": {
    en: "Graded, cited wound-care research powering confident, defensible conversations.",
    fr: "Recherche en soins des plaies, notée et citée, pour des échanges sûrs et défendables."
  },
  "home.pillar.crm.title": { en: "CRM & Campaigns", fr: "CRM & Campagnes" },
  "home.pillar.crm.text": {
    en: "Hospital engagement, seminars, leads and follow-ups — built for the field.",
    fr: "Engagement hospitalier, séminaires, prospects et relances — conçu pour le terrain."
  },

  "login.title": { en: "Sign in", fr: "Connexion" },
  "login.subtitle": { en: "Access your ASTROBSM workspace.", fr: "Accédez à votre espace ASTROBSM." },
  "login.email": { en: "Email", fr: "E-mail" },
  "login.password": { en: "Password", fr: "Mot de passe" },
  "login.submit": { en: "Sign in", fr: "Se connecter" },
  "login.signingIn": { en: "Signing in…", fr: "Connexion…" },

  "common.offline": { en: "Offline — showing saved content", fr: "Hors ligne — contenu enregistré" },
  "common.syncing": { en: "Syncing…", fr: "Synchronisation…" },
  "common.pendingSync": { en: "change(s) waiting to sync", fr: "modification(s) en attente de synchronisation" }
};

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof DICT | string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function readInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "fr") return stored;
  return window.navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);

  const t = useCallback(
    (key: string) => {
      const entry = DICT[key];
      if (!entry) return key;
      return entry[lang];
    },
    [lang]
  );

  const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
