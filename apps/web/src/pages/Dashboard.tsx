import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Building2,
  CalendarCheck,
  Loader2,
  Megaphone,
  Users
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { analyticsAuthApi, type AnalyticsOverview } from "../lib/api";

function Stat({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: number | string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-4 w-4 text-brand-blue" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-slate-800">{value}</div>
    </div>
  );
}

function BreakdownBar({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (entries.length === 0) {
    return <p className="py-4 text-center text-sm text-slate-400">No data yet.</p>;
  }
  return (
    <ul className="mt-3 space-y-2">
      {entries.map(([label, value]) => (
        <li key={label} className="text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>{label}</span>
            <span className="font-semibold">{value}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-brand-blue"
              style={{ width: `${(value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-700">{title}</h2>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const { authFetch } = useAuth();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const overview = await analyticsAuthApi.overview(authFetch);
        if (active) setData(overview);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Could not load analytics");
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
            <BarChart3 className="h-6 w-6 text-brand-navy" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Sales Intelligence</h1>
            <p className="text-sm text-slate-500">
              Live figures derived from real platform records — no projected or synthetic data.
            </p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading analytics…
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error}
        </div>
      ) : data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Contacts" value={data.crm.totalContacts} icon={Users} />
            <Stat label="Interactions (30d)" value={data.crm.interactionsLast30Days} icon={Activity} />
            <Stat label="Open follow-ups" value={data.crm.followUps.open} icon={CalendarCheck} />
            <Stat label="Facilities" value={data.network.totalFacilities} icon={Building2} />
            <Stat label="Campaigns" value={data.marketing.totalCampaigns} icon={Megaphone} />
            <Stat label="Seminars" value={data.marketing.totalSeminars} icon={CalendarCheck} />
            <Stat label="Upcoming seminars" value={data.marketing.upcomingSeminars} icon={CalendarCheck} />
            <Stat label="Registrations" value={data.marketing.totalRegistrations} icon={Users} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card title="Contacts by role">
              <BreakdownBar data={data.crm.contactsByRole} />
            </Card>
            <Card title="Interactions by type">
              <BreakdownBar data={data.crm.interactionsByType} />
            </Card>
            <Card title="Campaigns by status">
              <BreakdownBar data={data.marketing.campaignsByStatus} />
            </Card>
            <Card title="Seminars by status">
              <BreakdownBar data={data.marketing.seminarsByStatus} />
            </Card>
            <Card title="Facilities by zone">
              <BreakdownBar data={data.network.facilitiesByZone} />
            </Card>
            <Card title="Facilities by type">
              <BreakdownBar data={data.network.facilitiesByType} />
            </Card>
          </section>

          <p className="text-right text-xs text-slate-400">
            Generated {new Date(data.generatedAt).toLocaleString()}
          </p>
        </>
      ) : null}
    </div>
  );
}
