import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Award, BookOpen, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { useAuth } from "../lib/auth";
import {
  lmsApi,
  lmsAuthApi,
  type ApiCertificate,
  type ApiCourseSummary,
  type ApiEnrollment
} from "../lib/api";

interface DashState {
  enrollments: ApiEnrollment[];
  certificates: ApiCertificate[];
  courses: Record<string, ApiCourseSummary>;
}

export default function MyLearning() {
  const { authFetch, user } = useAuth();
  const [state, setState] = useState<DashState>({
    enrollments: [],
    certificates: [],
    courses: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [enrollments, certificates, courses] = await Promise.all([
          lmsAuthApi.myEnrollments(authFetch),
          lmsAuthApi.myCertificates(authFetch),
          lmsApi.courses()
        ]);
        if (!active) return;
        const byId: Record<string, ApiCourseSummary> = {};
        for (const c of courses) byId[c.id] = c;
        setState({ enrollments, certificates, courses: byId });
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load your learning");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authFetch]);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-navy/5">
            <GraduationCap className="h-6 w-6 text-brand-navy" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Learning</h1>
            <p className="text-sm text-slate-500">
              {user ? `Signed in as ${user.fullName}` : "Your enrollments and certificates."}
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading your learning…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-lg font-bold text-slate-800">Enrollments</h2>
            {state.enrollments.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
                You are not enrolled in any course yet.{" "}
                <Link to="/academy" className="font-semibold text-brand-blue hover:underline">
                  Browse the Academy
                </Link>
                .
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {state.enrollments.map((e) => {
                  const course = state.courses[e.courseId];
                  return (
                    <div key={e.id} className="rounded-xl border bg-white p-5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-brand-blue" />
                        <h3 className="font-semibold text-slate-800">
                          {course?.title ?? "Course"}
                        </h3>
                        {e.status === "COMPLETED" && (
                          <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> Completed
                          </span>
                        )}
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-blue"
                          style={{ width: `${e.progressPct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{e.progressPct}% complete</span>
                        {course && (
                          <Link
                            to={`/academy/${course.slug}`}
                            className="font-semibold text-brand-blue hover:underline"
                          >
                            {e.status === "COMPLETED" ? "Review" : "Continue"}
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">Certificates</h2>
            {state.certificates.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed bg-white p-8 text-center text-sm text-slate-500">
                Pass a course quiz to earn your first certificate.
              </div>
            ) : (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {state.certificates.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 rounded-xl border border-brand-gold/40 bg-gradient-to-br from-brand-honey/10 to-brand-gold/5 p-5"
                  >
                    <Award className="h-7 w-7 text-brand-gold" />
                    <div>
                      <h3 className="font-semibold text-slate-800">{c.courseTitle}</h3>
                      <p className="mt-1 text-xs text-slate-500">Serial: {c.serial}</p>
                      <p className="text-xs text-slate-500">
                        Issued {new Date(c.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
