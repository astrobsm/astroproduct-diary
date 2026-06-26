import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../http/errors";
import { store } from "../store/store";
import { requireAuth } from "../auth/rbac";
import type { Course, Product, ResearchReference } from "../domain/types";

/**
 * AI Coach — grounded retrieval over the platform's REAL corpus only
 * (published products, imported research references, published courses).
 *
 * No-fabrication policy: the coach never invents clinical claims. It retrieves
 * passages from verified content, ranks them by term-weighted relevance, and
 * returns excerpts with citations. When nothing relevant is found it says so
 * explicitly rather than guessing. There is no generative model in the loop —
 * answers are composed from the source passages themselves.
 *
 * Bilingual (EN/FR): the framing/UI strings are localised; source passages are
 * returned in their original language and the response flags when sources are
 * only available in another language.
 */
export const coachRouter = Router();

type CorpusKind = "product" | "research" | "course";

interface Passage {
  id: string;
  kind: CorpusKind;
  /** Heading shown above the excerpt. */
  heading: string;
  /** Raw text used both for matching and excerpting. */
  text: string;
  /** Human-readable citation label. */
  citationLabel: string;
  /** In-app or external reference link. */
  citationRef?: string;
  /** Best-effort language tag of the passage text. */
  lang: "en" | "fr" | "unknown";
}

// --- Tokenisation -----------------------------------------------------------

const STOPWORDS = new Set([
  // English
  "the","a","an","and","or","of","to","in","is","are","was","were","be","been",
  "for","on","with","as","by","at","from","that","this","it","its","what","which",
  "how","when","why","do","does","can","could","should","would","i","you","we",
  "my","our","your","about","into","than","then","there","their","they","them",
  // French
  "le","la","les","un","une","des","de","du","et","ou","est","sont","pour","dans",
  "que","qui","quoi","comment","quand","pourquoi","avec","sur","par","au","aux",
  "ce","cette","ces","mon","ma","mes","notre","nos","votre","vos","ils","elles",
  "je","tu","nous","vous","plus","comme","sans","sous","entre"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

/**
 * Bilingual query expansion (EN <-> FR) for the small, fixed wound-care
 * vocabulary used across the corpus. This only widens the SEARCH terms so a
 * French question can reach English source passages (and vice versa) — it never
 * invents answer content, preserving the no-fabrication policy.
 */
const SYNONYMS: Record<string, string[]> = {
  wound: ["plaie", "plaies"],
  plaie: ["wound"],
  healing: ["cicatrisation", "guerison"],
  cicatrisation: ["healing"],
  dressing: ["pansement", "pansements"],
  pansement: ["dressing"],
  infection: ["infectee", "infecte", "infectees"],
  infectee: ["infection", "infected"],
  infected: ["infectee", "infection"],
  chronic: ["chronique", "chroniques"],
  chronique: ["chronic"],
  moist: ["humide"],
  humide: ["moist"],
  honey: ["miel"],
  miel: ["honey"],
  burn: ["brulure", "brulures"],
  brulure: ["burn"],
  antimicrobial: ["antimicrobien", "antimicrobienne"],
  antimicrobien: ["antimicrobial"],
  debridement: ["debridement"],
  gel: ["gel"],
  ulcer: ["ulcere", "ulceres"],
  ulcere: ["ulcer"]
};

function expandTerms(terms: string[]): string[] {
  const out = new Set(terms);
  for (const term of terms) {
    for (const syn of SYNONYMS[term] ?? []) out.add(syn);
  }
  return Array.from(out);
}

/** Very rough language sniff used only to flag cross-language sources. */
function sniffLang(text: string): Passage["lang"] {
  const lower = ` ${text.toLowerCase()} `;
  const fr = [" les ", " des ", " une ", " avec ", " pour ", " plaie ", " cicatris"];
  const en = [" the ", " and ", " with ", " wound ", " healing ", " for "];
  const frHits = fr.filter((w) => lower.includes(w)).length;
  const enHits = en.filter((w) => lower.includes(w)).length;
  if (frHits > enHits) return "fr";
  if (enHits > frHits) return "en";
  return "unknown";
}

// --- Corpus construction ----------------------------------------------------

function productPassages(products: Product[]): Passage[] {
  const out: Passage[] = [];
  for (const p of products) {
    out.push({
      id: `product:${p.slug}:summary`,
      kind: "product",
      heading: `${p.name} — Overview`,
      text: `${p.tagline}. ${p.summary}`,
      citationLabel: p.name,
      citationRef: `/products/${p.slug}`,
      lang: sniffLang(p.summary)
    });
    for (const section of p.sections) {
      const text = section.items.join(" ");
      if (!text.trim()) continue;
      out.push({
        id: `product:${p.slug}:${section.type}`,
        kind: "product",
        heading: `${p.name} — ${section.title}`,
        text,
        citationLabel: p.name,
        citationRef: `/products/${p.slug}`,
        lang: sniffLang(text)
      });
    }
    for (const [i, faq] of p.faqs.entries()) {
      out.push({
        id: `product:${p.slug}:faq:${i}`,
        kind: "product",
        heading: `${p.name} — ${faq.question}`,
        text: `${faq.question} ${faq.answer}`,
        citationLabel: p.name,
        citationRef: `/products/${p.slug}`,
        lang: sniffLang(faq.answer)
      });
    }
  }
  return out;
}

function researchPassages(refs: ResearchReference[]): Passage[] {
  return refs
    .filter((r) => (r.summary && r.summary.trim()) || r.title)
    .map((r) => {
      const text = `${r.title}. ${r.summary ?? ""}`.trim();
      return {
        id: `research:${r.id}`,
        kind: "research" as const,
        heading: `${r.journal} (${r.year}) — ${r.evidenceLevel}`,
        text,
        citationLabel: `${r.authors} (${r.year})`,
        citationRef: r.doi ? `https://doi.org/${r.doi}` : r.url,
        lang: sniffLang(text)
      };
    });
}

function coursePassages(courses: Course[]): Passage[] {
  const out: Passage[] = [];
  for (const c of courses) {
    for (const mod of c.modules) {
      for (const lesson of mod.lessons) {
        if (!lesson.body || !lesson.body.trim()) continue;
        out.push({
          id: `course:${c.slug}:${lesson.id}`,
          kind: "course",
          heading: `${c.title} — ${lesson.title}`,
          text: lesson.body,
          citationLabel: c.title,
          citationRef: `/academy/${c.slug}`,
          lang: sniffLang(lesson.body)
        });
      }
    }
  }
  return out;
}

async function buildCorpus(): Promise<Passage[]> {
  const [products, refs, courses] = await Promise.all([
    store.listProducts({ status: "PUBLISHED" }),
    store.listReferences(),
    store.listCourses({ published: true })
  ]);
  return [
    ...productPassages(products),
    ...researchPassages(refs),
    ...coursePassages(courses)
  ];
}

// --- Ranking ----------------------------------------------------------------

interface ScoredPassage {
  passage: Passage;
  score: number;
  matched: string[];
}

function rank(corpus: Passage[], query: string, limit: number): ScoredPassage[] {
  const queryTerms = Array.from(new Set(tokenize(query)));
  if (queryTerms.length === 0) return [];
  const searchTerms = expandTerms(queryTerms);

  // Document frequency for inverse-document-frequency weighting.
  const df = new Map<string, number>();
  const docTokens = corpus.map((p) => {
    const tokens = tokenize(`${p.heading} ${p.text}`);
    const unique = new Set(tokens);
    for (const t of unique) df.set(t, (df.get(t) ?? 0) + 1);
    return tokens;
  });
  const n = corpus.length || 1;

  const scored: ScoredPassage[] = corpus.map((passage, idx) => {
    const tokens = docTokens[idx];
    const counts = new Map<string, number>();
    for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
    let score = 0;
    const matched: string[] = [];
    for (const term of searchTerms) {
      const tf = counts.get(term);
      if (!tf) continue;
      const idf = Math.log(1 + n / (df.get(term) ?? 1));
      score += tf * idf;
      matched.push(term);
    }
    // Normalise by length so long passages don't dominate.
    const norm = score / Math.sqrt(tokens.length + 1);
    return { passage, score: norm, matched };
  });

  return scored
    .filter((s) => s.score > 0 && s.matched.length > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function excerpt(text: string, max = 320): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return `${(lastStop > max * 0.5 ? cut.slice(0, lastStop + 1) : cut).trim()}…`;
}

// --- Localised framing ------------------------------------------------------

const STRINGS = {
  en: {
    lead: "Here is what the verified ASTROBSM corpus says:",
    none:
      "I couldn't find anything in the verified ASTROBSM corpus (products, research, courses) that answers this. I won't guess — please rephrase, or add a verified source via the Research import.",
    crossLang: "Note: the most relevant sources are in another language.",
    sourcesEN: "Sources are drawn only from verified, citable ASTROBSM content."
  },
  fr: {
    lead: "Voici ce que dit le corpus ASTROBSM vérifié :",
    none:
      "Je n'ai rien trouvé dans le corpus ASTROBSM vérifié (produits, recherche, cours) qui réponde à cela. Je ne devine pas — reformulez, ou ajoutez une source vérifiée via l'import Recherche.",
    crossLang: "Remarque : les sources les plus pertinentes sont dans une autre langue.",
    sourcesEN: "Les sources proviennent uniquement de contenu ASTROBSM vérifié et citable."
  }
} as const;

// --- Routes -----------------------------------------------------------------

const askSchema = z.object({
  question: z.string().min(3).max(500),
  lang: z.enum(["en", "fr"]).optional()
});

coachRouter.post(
  "/ask",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { question, lang = "en" } = askSchema.parse(req.body);
    const t = STRINGS[lang];
    const corpus = await buildCorpus();
    const hits = rank(corpus, question, 4);

    if (hits.length === 0) {
      res.json({
        grounded: false,
        answer: t.none,
        citations: [],
        meta: { corpusSize: corpus.length, lang }
      });
      return;
    }

    const crossLang = hits.every(
      (h) => h.passage.lang !== "unknown" && h.passage.lang !== lang
    );

    const citations = hits.map((h, i) => ({
      index: i + 1,
      kind: h.passage.kind,
      heading: h.passage.heading,
      excerpt: excerpt(h.passage.text),
      label: h.passage.citationLabel,
      ref: h.passage.citationRef,
      lang: h.passage.lang
    }));

    const body = citations
      .map((c) => `[${c.index}] ${c.heading}: ${c.excerpt}`)
      .join("\n\n");
    const notes: string[] = [t.sourcesEN];
    if (crossLang) notes.unshift(t.crossLang);

    res.json({
      grounded: true,
      answer: `${t.lead}\n\n${body}`,
      citations,
      notes,
      meta: { corpusSize: corpus.length, lang }
    });
  })
);

coachRouter.get(
  "/suggestions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const lang = (req.query.lang as string) === "fr" ? "fr" : "en";
    const products = await store.listProducts({ status: "PUBLISHED" });
    const names = products.slice(0, 4).map((p) => p.name);
    const make =
      lang === "fr"
        ? (n: string) => `Quand utiliser ${n} ?`
        : (n: string) => `When should I use ${n}?`;
    const base =
      lang === "fr"
        ? ["Qu'est-ce que le cadre TIME ?", "Comment gérer une plaie chronique infectée ?"]
        : ["What is the TIME framework?", "How do I manage an infected chronic wound?"];
    res.json({ data: [...base, ...names.map(make)], meta: { lang } });
  })
);
