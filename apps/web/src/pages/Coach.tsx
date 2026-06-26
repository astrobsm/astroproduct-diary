import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Bot, ExternalLink, FlaskConical, Loader2, Package, Send, Sparkles } from "lucide-react";
import { useAuth } from "../lib/auth";
import { useI18n } from "../lib/i18n";
import { coachAuthApi, type CoachAnswer, type CoachCitation } from "../lib/api";

interface Turn {
  id: string;
  question: string;
  answer?: CoachAnswer;
  error?: string;
  pending: boolean;
}

const UI = {
  en: {
    title: "AI Coach",
    subtitle:
      "Grounded answers from verified ASTROBSM content only — products, research and courses. No guessing.",
    placeholder: "Ask about a product, wound type, or protocol…",
    send: "Ask",
    suggestions: "Try asking",
    sources: "Sources",
    empty: "Ask a question to get a cited, evidence-grounded answer.",
    disclaimer:
      "The coach never invents clinical claims. If a question is outside the verified corpus it will say so."
  },
  fr: {
    title: "Coach IA",
    subtitle:
      "Réponses fondées uniquement sur le contenu ASTROBSM vérifié — produits, recherche et cours. Sans approximation.",
    placeholder: "Posez une question sur un produit, un type de plaie ou un protocole…",
    send: "Demander",
    suggestions: "Essayez de demander",
    sources: "Sources",
    empty: "Posez une question pour obtenir une réponse sourcée et fondée sur des preuves.",
    disclaimer:
      "Le coach n'invente jamais d'affirmation clinique. Si une question dépasse le corpus vérifié, il le signale."
  }
} as const;

const kindIcon = {
  product: Package,
  research: FlaskConical,
  course: BookOpen
} as const;

function CitationCard({ c }: { c: CoachCitation }) {
  const Icon = kindIcon[c.kind];
  const isExternal = c.ref?.startsWith("http");
  return (
    <div className="rounded-lg border bg-slate-50 p-3 text-sm">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded bg-white text-brand-blue">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-navy/10 px-1.5 py-0.5 text-xs font-bold text-brand-navy">
              [{c.index}]
            </span>
            <span className="truncate font-semibold text-slate-700">{c.heading}</span>
          </div>
          <p className="mt-1 text-slate-600">{c.excerpt}</p>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium">{c.label}</span>
            {c.ref &&
              (isExternal ? (
                <a
                  href={c.ref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-brand-blue hover:underline"
                >
                  <ExternalLink className="h-3 w-3" /> DOI
                </a>
              ) : (
                <Link to={c.ref} className="inline-flex items-center gap-1 text-brand-blue hover:underline">
                  <ExternalLink className="h-3 w-3" /> View
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Coach() {
  const { authFetch } = useAuth();
  const { lang, setLang } = useI18n();
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const t = UI[lang];

  useEffect(() => {
    let active = true;
    coachAuthApi
      .suggestions(authFetch, lang)
      .then((s) => active && setSuggestions(s))
      .catch(() => active && setSuggestions([]));
    return () => {
      active = false;
    };
  }, [authFetch, lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  const ask = useCallback(
    async (question: string) => {
      const q = question.trim();
      if (!q || busy) return;
      const id = `t-${Date.now()}`;
      setTurns((prev) => [...prev, { id, question: q, pending: true }]);
      setInput("");
      setBusy(true);
      try {
        const answer = await coachAuthApi.ask(authFetch, q, lang);
        setTurns((prev) =>
          prev.map((turn) => (turn.id === id ? { ...turn, answer, pending: false } : turn))
        );
      } catch (e) {
        const error = e instanceof Error ? e.message : "Request failed";
        setTurns((prev) =>
          prev.map((turn) => (turn.id === id ? { ...turn, error, pending: false } : turn))
        );
      } finally {
        setBusy(false);
      }
    },
    [authFetch, busy, lang]
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy/5">
              <Bot className="h-6 w-6 text-brand-navy" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{t.title}</h1>
              <p className="text-sm text-slate-500">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex shrink-0 overflow-hidden rounded-lg border text-sm font-semibold">
            {(["en", "fr"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-3 py-1.5 ${
                  lang === l ? "bg-brand-navy text-white" : "bg-white text-slate-600"
                }`}
                aria-pressed={lang === l}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="space-y-4">
        {turns.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
            {t.empty}
          </div>
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className="space-y-2">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-brand-navy px-4 py-2 text-sm text-white">
                {turn.question}
              </div>
              <div className="mr-auto max-w-[95%] rounded-2xl rounded-bl-sm border bg-white p-4">
                {turn.pending ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> …
                  </div>
                ) : turn.error ? (
                  <p className="text-sm text-rose-600">{turn.error}</p>
                ) : turn.answer ? (
                  <div className="space-y-3">
                    <p
                      className={`text-sm ${
                        turn.answer.grounded ? "text-slate-700" : "text-amber-700"
                      }`}
                    >
                      {turn.answer.grounded
                        ? turn.answer.answer.split("\n\n")[0]
                        : turn.answer.answer}
                    </p>
                    {turn.answer.citations.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          {t.sources}
                        </p>
                        {turn.answer.citations.map((c) => (
                          <CitationCard key={c.index} c={c} />
                        ))}
                      </div>
                    )}
                    {turn.answer.notes?.map((note) => (
                      <p key={note} className="text-xs italic text-slate-400">
                        {note}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {suggestions.length > 0 && turns.length === 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-slate-400">
            <Sparkles className="h-3.5 w-3.5" /> {t.suggestions}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void ask(s)}
                className="rounded-full border bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-brand-blue hover:text-brand-blue"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(input);
        }}
        className="sticky bottom-4 flex items-center gap-2 rounded-2xl border bg-white p-2 shadow-sm"
      >
        <input
          className="flex-1 rounded-lg px-3 py-2 text-sm focus:outline-none"
          placeholder={t.placeholder}
          aria-label={t.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {t.send}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">{t.disclaimer}</p>
    </div>
  );
}
