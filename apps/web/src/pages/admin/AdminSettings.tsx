import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  ImageIcon,
  Loader2,
  Package,
  ShieldCheck,
  UserCheck,
  XCircle
} from "lucide-react";
import { useAuth } from "../../lib/auth";
import ImageUploadField from "../../components/ImageUploadField";
import {
  adminApi,
  adminUsersApi,
  api,
  type ApiProduct,
  type PendingUser
} from "../../lib/api";

function Section({
  icon,
  title,
  description,
  children
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm">
      <header className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-navy/10 text-brand-navy">
          {icon}
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Approvals() {
  const { authFetch } = useAuth();
  const [pending, setPending] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPending(await adminUsersApi.list(authFetch, "PENDING"));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      if (action === "approve") await adminUsersApi.approve(authFetch, id);
      else await adminUsersApi.reject(authFetch, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-slate-400" />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (pending.length === 0)
    return <p className="text-sm text-slate-500">No accounts are awaiting approval.</p>;

  return (
    <ul className="divide-y">
      {pending.map((u) => (
        <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
          <div>
            <p className="font-semibold text-slate-800">{u.fullName}</p>
            <p className="text-sm text-slate-500">
              {u.phone ?? u.email}
              {u.requestedRoles.length > 0 && (
                <span className="ml-2 text-xs text-slate-400">
                  · requests: {u.requestedRoles.join(", ")}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => decide(u.id, "approve")}
              disabled={busyId === u.id}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" /> Approve
            </button>
            <button
              onClick={() => decide(u.id, "reject")}
              disabled={busyId === u.id}
              className="inline-flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              <XCircle className="h-4 w-4" /> Reject
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ProductImages() {
  const { authFetch } = useAuth();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const list = await api.products();
        setProducts(list);
        setDrafts(Object.fromEntries(list.map((p) => [p.id, p.image ?? ""])));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(p: ApiProduct) {
    setSavingId(p.id);
    setError(null);
    try {
      const updated = await adminApi.updateProduct(authFetch, p.id, { image: drafts[p.id] || undefined });
      setProducts((list) => list.map((x) => (x.id === p.id ? updated : x)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <Loader2 className="h-5 w-5 animate-spin text-slate-400" />;

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">
        Tap <span className="font-semibold">Upload image</span> to attach a photo from your phone or
        computer, or paste a public image URL. Changes save to the catalogue when you press Save.
      </p>
      <ul className="space-y-3">
        {products.map((p) => (
          <li key={p.id} className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-800">{p.name}</p>
              <div className="mt-2">
                <ImageUploadField
                  label={p.name}
                  value={drafts[p.id] ?? ""}
                  onChange={(v) => setDrafts((d) => ({ ...d, [p.id]: v }))}
                  disabled={savingId === p.id}
                />
              </div>
            </div>
            <button
              onClick={() => save(p)}
              disabled={savingId === p.id}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-brand-navy px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60 sm:mt-7"
            >
              {savingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AdminSettings() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      <header className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-navy text-white">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Settings</h1>
          <p className="text-sm text-slate-500">
            Approve access requests, manage product images, and edit educational content.
          </p>
        </div>
      </header>

      <Section
        icon={<UserCheck className="h-5 w-5" />}
        title="Access requests"
        description="Approve or reject staff who requested role-based credentials."
      >
        <Approvals />
      </Section>

      <Section
        icon={<ImageIcon className="h-5 w-5" />}
        title="Product images"
        description="Add, edit, or change the image shown for each product."
      >
        <ProductImages />
      </Section>

      <Section
        icon={<BookOpen className="h-5 w-5" />}
        title="Educational content"
        description="Manage products, research references, and training courses."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/admin/products"
            className="flex items-center gap-3 rounded-lg border p-4 hover:border-brand-navy hover:bg-slate-50"
          >
            <Package className="h-5 w-5 text-brand-navy" />
            <span>
              <span className="block font-semibold text-slate-800">Products & monographs</span>
              <span className="block text-xs text-slate-500">Create and edit product content</span>
            </span>
          </Link>
          <Link
            to="/trainers"
            className="flex items-center gap-3 rounded-lg border p-4 hover:border-brand-navy hover:bg-slate-50"
          >
            <BookOpen className="h-5 w-5 text-brand-navy" />
            <span>
              <span className="block font-semibold text-slate-800">Training of Trainers</span>
              <span className="block text-xs text-slate-500">Nominate and assess trainers</span>
            </span>
          </Link>
        </div>
      </Section>
    </div>
  );
}
