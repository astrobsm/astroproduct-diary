import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  FileText,
  Loader2,
  Lock,
  PlayCircle,
  XCircle
} from "lucide-react";
import SourceBadge from "../components/SourceBadge";
import { useLoader } from "../lib/hooks";
import { useAuth } from "../lib/auth";
import { lmsAuthApi, type ApiAttemptResult, type ApiQuizPublic } from "../lib/api";
import { loadCourse, courseAccentFor, type CourseDetailView } from "../lib/source";

const levelLabel: Record<string, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced"
};

const lessonIcon = (type: string) => {
  if (type === "VIDEO") return PlayCircle;
  if (type === "PDF") return FileText;
  return BookOpen;
};

function Quiz({ quiz, courseId }: { quiz: ApiQuizPublic; courseId: string }) {
  const { isAuthenticated, authFetch } = useAuth();
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [result, setResult] = useState<ApiAttemptResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (questionId: string, index: number, multi: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] ?? [];
      if (multi) {
        return {
          ...prev,
          [questionId]: current.includes(index)
            ? current.filter((i) => i !== index)
            : [...current, index]
        };
      }
      return { ...prev, [questionId]: [index] };
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await lmsAuthApi.enroll(authFetch, courseId);
      const payload = quiz.questions.map((q) => ({
        questionId: q.id,
        selected: answers[q.id] ?? []
      }));
      const res = await lmsAuthApi.submitAttempt(authFetch, quiz.id, payload);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-dashed bg-white p-6 text-center text-sm text-slate-500">
        <Lock className="mx-auto mb-2 h-5 w-5 text-slate-400" />
        <Link to="/login" className="font-semibold text-brand-blue hover:underline">
          Sign in
        </Link>{" "}
        to take the quiz and earn your certificate.
      </div>
    );
  }

  const resultById = new Map(result?.results.map((r) => [r.questionId, r]) ?? []);

  return (
    <div className="space-y-5">
      {quiz.questions.map((q, qi) => {
        const multi = q.type === "MULTI";
        const r = resultById.get(q.id);
        return (
          <div key={q.id} className="rounded-xl border bg-white p-5">
            <div className="flex items-start gap-2">
              <span className="text-sm font-semibold text-brand-blue">{qi + 1}.</span>
              <p className="flex-1 text-sm font-medium text-slate-800">{q.prompt}</p>
              {r &&
                (r.correct ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-500" />
                ))}
            </div>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                const selected = (answers[q.id] ?? []).includes(oi);
                const isCorrectAnswer = r?.correctAnswer.includes(oi);
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      result
                        ? isCorrectAnswer
                          ? "border-emerald-300 bg-emerald-50"
                          : selected
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200"
                        : selected
                          ? "border-brand-blue bg-brand-blue/5"
                          : "border-slate-200 hover:border-brand-blue/50"
                    }`}
                  >
                    <input
                      type={multi ? "checkbox" : "radio"}
                      name={q.id}
                      checked={selected}
                      disabled={Boolean(result)}
                      onChange={() => toggle(q.id, oi, multi)}
                      className="accent-brand-blue"
                    />
                    <span className="text-slate-700">{opt}</span>
                  </label>
                );
              })}
            </div>
            {r?.explanation && (
              <p className="mt-2 text-xs text-slate-500">{r.explanation}</p>
            )}
          </div>
        );
      })}

      {error && <p className="text-sm text-rose-600">{error}</p>}

      {result ? (
        <div
          className={`rounded-xl border p-5 ${
            result.passed ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.passed ? (
              <Award className="h-6 w-6 text-emerald-600" />
            ) : (
              <XCircle className="h-6 w-6 text-rose-600" />
            )}
            <div>
              <p className="font-semibold text-slate-800">
                Score: {result.score}% ({result.passed ? "Passed" : "Not passed"} — pass mark{" "}
                {result.passScore}%)
              </p>
              {result.certificate && (
                <p className="text-sm text-emerald-700">
                  Certificate issued: {result.certificate.serial}
                </p>
              )}
            </div>
          </div>
          {!result.passed && (
            <button
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
              className="mt-3 rounded-lg bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy/90"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <button
          onClick={submit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue/90 disabled:opacity-60"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Submit quiz
        </button>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { slug = "" } = useParams();
  const { data, loading, source } = useLoader<CourseDetailView | null>(
    (signal) => loadCourse(slug, signal),
    [slug]
  );

  const lessonCount = useMemo(
    () => (data ? data.modules.reduce((n, m) => n + m.lessons.length, 0) : 0),
    [data]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading course…
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link to="/academy" className="inline-flex items-center gap-1 text-sm text-brand-blue">
          <ChevronLeft className="h-4 w-4" /> Back to Academy
        </Link>
        <div className="rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
          Course not found or unavailable offline.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/academy" className="inline-flex items-center gap-1 text-sm text-brand-blue">
          <ChevronLeft className="h-4 w-4" /> Back to Academy
        </Link>
        <SourceBadge source={source} />
      </div>

      <section
        className={`rounded-2xl border bg-gradient-to-br p-6 ${courseAccentFor(data.audience)}`}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-blue">
          <span>{levelLabel[data.level] ?? data.level}</span>
          {data.quiz && (
            <span className="inline-flex items-center gap-1 text-brand-gold">
              <Award className="h-3.5 w-3.5" /> Certificate on pass
            </span>
          )}
        </div>
        <h1 className="mt-1 text-2xl font-bold text-slate-800">{data.title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">{data.description}</p>
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span>{data.modules.length} modules</span>
          <span>{lessonCount} lessons</span>
          {data.durationMins > 0 && <span>{data.durationMins} min</span>}
        </div>
      </section>

      <section className="space-y-4">
        {data.modules.map((m, mi) => (
          <div key={m.id} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-brand-navy">
              Module {mi + 1}: {m.title}
            </h2>
            {m.summary && <p className="mt-1 text-sm text-slate-500">{m.summary}</p>}
            <ul className="mt-3 space-y-3">
              {m.lessons.map((l) => {
                const Icon = lessonIcon(l.contentType);
                return (
                  <li key={l.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-brand-blue" />
                      <span className="text-sm font-medium text-slate-800">{l.title}</span>
                      {l.durationMins ? (
                        <span className="ml-auto text-xs text-slate-400">{l.durationMins} min</span>
                      ) : null}
                    </div>
                    {l.body && <p className="mt-2 text-sm text-slate-600">{l.body}</p>}
                    {l.mediaUrl && (
                      <a
                        href={l.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-brand-blue hover:underline"
                      >
                        Open resource
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {data.quiz && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">{data.quiz.title}</h2>
          <Quiz quiz={data.quiz} courseId={data.id} />
        </section>
      )}
    </div>
  );
}
