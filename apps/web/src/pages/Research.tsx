import { useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import SourceBadge from "../components/SourceBadge";
import { useLoader } from "../lib/hooks";
import { loadResearch, type RefView } from "../lib/source";

const levels = [
  "All",
  "Systematic review / meta-analysis",
  "Review",
  "Laboratory / in-vitro",
  "Clinical practice"
] as const;

export default function Research() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof levels)[number]>("All");
  const { data, loading, source } = useLoader<RefView[]>((signal) => loadResearch(signal), []);
  const references = data ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return references.filter((r) => {
      const matchesLevel = level === "All" || r.evidenceLevel === level;
      const matchesQuery =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.authors.toLowerCase().includes(q) ||
        r.journal.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [query, level, references]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Evidence Library</h1>
          <p className="mt-1 text-sm text-slate-500">
            Curated, citation-ready wound-care references. The full Research Knowledge Engine
            (Phase 2) imports and evidence-grades sources from PubMed, WHO, Cochrane and others.
          </p>
        </div>
        <SourceBadge source={source} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search authors, titles, journals…"
            className="w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue"
          />
        </div>
        <select
          aria-label="Filter by evidence level"
          value={level}
          onChange={(e) => setLevel(e.target.value as (typeof levels)[number])}
          className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
        >
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <p className="text-xs text-slate-400">
        {loading ? "Loading…" : `${filtered.length} references`}
      </p>

      {loading && (
        <div className="flex items-center gap-2 py-8 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading evidence…
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((ref, idx) => (
          <article key={idx} className="rounded-xl border bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold text-slate-800">{ref.title}</h2>
              <span className="shrink-0 rounded-full bg-brand-navy/5 px-2 py-1 text-[11px] font-medium text-brand-navy">
                {ref.evidenceLevel}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {ref.authors} · <span className="italic">{ref.journal}</span> · {ref.year}
            </p>
            {ref.doi && (
              <a
                href={`https://doi.org/${ref.doi}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-medium text-brand-blue hover:underline"
              >
                doi:{ref.doi}
              </a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
