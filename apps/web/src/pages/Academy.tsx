import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  GraduationCap,
  Loader2
} from "lucide-react";
import SourceBadge from "../components/SourceBadge";
import { useLoader } from "../lib/hooks";
import { loadCourses, courseAccentFor, type CourseSummaryView } from "../lib/source";

const audienceLabel: Record<string, string> = {
  EXECUTIVE: "Executive",
  MARKETING: "Marketing & Sales",
  CUSTOMER_CARE: "Customer Care",
  SALES: "Sales",
  DISTRIBUTOR: "Distributors",
  CLINICAL: "Clinical Personnel",
  TOT: "Training of Trainers"
};

const levelLabel: Record<string, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced"
};

const roadmap = [
  { phase: "Phase 1", title: "Architecture & runnable foundation", done: true },
  { phase: "Phase 2", title: "Product knowledge + evidence library", done: true },
  { phase: "Phase 3", title: "Full LMS, quizzes & certificates", done: true },
  { phase: "Phase 4", title: "CRM, hospitals & campaigns", done: false },
  { phase: "Phase 5", title: "Sales intelligence & dashboards", done: false },
  { phase: "Phase 6", title: "AI Coach + EN/FR + offline sync", done: false }
];

function groupByAudience(courses: CourseSummaryView[]) {
  const groups = new Map<string, CourseSummaryView[]>();
  for (const c of courses) {
    const list = groups.get(c.audience) ?? [];
    list.push(c);
    groups.set(c.audience, list);
  }
  return [...groups.entries()];
}

export default function Academy() {
  const { data, loading, source } = useLoader<CourseSummaryView[]>(
    (signal) => loadCourses(signal),
    []
  );
  const courses = data ?? [];
  const groups = groupByAudience(courses);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy/5">
              <GraduationCap className="h-6 w-6 text-brand-navy" />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Training Academy</h1>
              <p className="text-sm text-slate-500">
                Role-based learning paths with interactive lessons, quizzes and certificates.
              </p>
            </div>
          </div>
          <SourceBadge source={source} />
        </div>
      </section>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading courses…
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
          No courses available offline. Connect to the ASTROBSM API to load the live catalog.
        </div>
      ) : (
        groups.map(([audience, list]) => (
          <section key={audience}>
            <h2 className="text-lg font-bold text-slate-800">
              {audienceLabel[audience] ?? audience}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((c) => (
                <Link
                  key={c.slug}
                  to={`/academy/${c.slug}`}
                  className="group flex flex-col rounded-xl border bg-white p-5 transition hover:shadow-md"
                >
                  <div
                    className={`mb-4 grid h-24 place-items-center rounded-lg bg-gradient-to-br ${courseAccentFor(
                      c.audience
                    )}`}
                  >
                    <BookOpen className="h-8 w-8 text-brand-navy/70" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-blue">
                    <span>{levelLabel[c.level] ?? c.level}</span>
                    {c.hasQuiz && (
                      <span className="inline-flex items-center gap-1 text-brand-gold">
                        <Award className="h-3.5 w-3.5" /> Certificate
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 font-semibold text-slate-800 group-hover:text-brand-blue">
                    {c.title}
                  </h3>
                  <p className="mt-1 flex-1 text-sm text-slate-500">{c.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                    <span>{c.moduleCount} modules</span>
                    <span>{c.lessonCount} lessons</span>
                    {c.durationMins > 0 && <span>{c.durationMins} min</span>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}

      <section>
        <h2 className="text-lg font-bold text-slate-800">Platform roadmap</h2>
        <ol className="mt-4 space-y-2">
          {roadmap.map((r) => (
            <li
              key={r.phase}
              className="flex items-center gap-3 rounded-lg border bg-white px-4 py-3"
            >
              {r.done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300" />
              )}
              <span className="w-20 text-xs font-semibold text-brand-blue">{r.phase}</span>
              <span className="text-sm text-slate-700">{r.title}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
