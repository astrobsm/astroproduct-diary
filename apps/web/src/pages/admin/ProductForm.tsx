import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Plus, Save, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { api, adminApi, type ProductInput } from "../../lib/api";
import { useAuth } from "../../lib/auth";

const SECTION_TYPES = [
  "DESCRIPTION",
  "MECHANISM",
  "ADVANTAGES",
  "INDICATIONS",
  "APPLICATION",
  "PRECAUTIONS",
  "STORAGE"
] as const;

const EMPTY: ProductInput = {
  slug: "",
  name: "",
  tagline: "",
  category: "",
  summary: "",
  status: "DRAFT",
  image: "",
  ingredients: [],
  sections: [],
  faqs: [],
  references: []
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const { authFetch } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        // Admin list passes the product id; fetch full list and match by id.
        const all = await api.products();
        const found = all.find((p) => p.id === id);
        if (!found) throw new Error("Product not found");
        const detail = await api.product(found.slug);
        if (cancelled) return;
        setForm({
          slug: detail.slug,
          name: detail.name,
          tagline: detail.tagline,
          category: detail.category,
          summary: detail.summary,
          status: detail.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          image: detail.image ?? "",
          ingredients: detail.ingredients,
          sections: detail.sections,
          faqs: detail.faqs,
          references: detail.references
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: ProductInput = {
        ...form,
        image: form.image?.trim() ? form.image : undefined
      };
      if (isEdit && id) {
        await adminApi.updateProduct(authFetch, id, payload);
      } else {
        await adminApi.createProduct(authFetch, payload);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  const field = "mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-brand-blue";
  const label = "block text-sm font-medium text-slate-700";

  return (
    <div className="py-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to catalogue
      </Link>
      <h1 className="mt-2 text-xl font-bold text-slate-800">
        {isEdit ? "Edit product" : "New product"}
      </h1>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <div className="grid gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">Name</label>
            <input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="slug">Slug</label>
            <input id="slug" required value={form.slug} onChange={(e) => set("slug", e.target.value)} className={field} placeholder="lowercase-with-hyphens" />
          </div>
          <div>
            <label className={label} htmlFor="category">Category</label>
            <input id="category" required value={form.category} onChange={(e) => set("category", e.target.value)} className={field} />
          </div>
          <div>
            <label className={label} htmlFor="status">Status</label>
            <select id="status" value={form.status} onChange={(e) => set("status", e.target.value as ProductInput["status"])} className={field}>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="tagline">Tagline</label>
            <input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="summary">Summary</label>
            <textarea id="summary" rows={3} value={form.summary} onChange={(e) => set("summary", e.target.value)} className={field} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="image">Image path (optional)</label>
            <input id="image" value={form.image ?? ""} onChange={(e) => set("image", e.target.value)} className={field} placeholder="/products/example.jpg" />
          </div>
        </div>

        {/* Ingredients */}
        <fieldset className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-slate-800">Ingredients</legend>
            <button type="button" onClick={() => set("ingredients", [...form.ingredients, { name: "", percent: "", role: "" }])} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {form.ingredients.map((ing, i) => (
              <div key={i} className="flex flex-wrap items-center gap-2">
                <input aria-label="Ingredient name" placeholder="Name" value={ing.name} onChange={(e) => { const next = [...form.ingredients]; next[i] = { ...ing, name: e.target.value }; set("ingredients", next); }} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <input aria-label="Percent" placeholder="%" value={ing.percent ?? ""} onChange={(e) => { const next = [...form.ingredients]; next[i] = { ...ing, percent: e.target.value }; set("ingredients", next); }} className="w-20 rounded-lg border px-3 py-2 text-sm" />
                <input aria-label="Role" placeholder="Role" value={ing.role} onChange={(e) => { const next = [...form.ingredients]; next[i] = { ...ing, role: e.target.value }; set("ingredients", next); }} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <button type="button" onClick={() => set("ingredients", form.ingredients.filter((_, j) => j !== i))} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </fieldset>

        {/* Sections */}
        <fieldset className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-slate-800">Sections</legend>
            <button type="button" onClick={() => set("sections", [...form.sections, { type: "DESCRIPTION", title: "", items: [] }])} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <div className="mt-3 space-y-4">
            {form.sections.map((sec, i) => (
              <div key={i} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <select aria-label="Section type" value={sec.type} onChange={(e) => { const next = [...form.sections]; next[i] = { ...sec, type: e.target.value }; set("sections", next); }} className="rounded-lg border px-3 py-2 text-sm">
                    {SECTION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input aria-label="Section title" placeholder="Title" value={sec.title} onChange={(e) => { const next = [...form.sections]; next[i] = { ...sec, title: e.target.value }; set("sections", next); }} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                  <button type="button" onClick={() => set("sections", form.sections.filter((_, j) => j !== i))} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <textarea aria-label="Section items, one per line" placeholder="One item per line" rows={3} value={sec.items.join("\n")} onChange={(e) => { const next = [...form.sections]; next[i] = { ...sec, items: e.target.value.split("\n").map((s) => s.trimEnd()).filter(Boolean) }; set("sections", next); }} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
              </div>
            ))}
          </div>
        </fieldset>

        {/* FAQs */}
        <fieldset className="rounded-2xl border bg-white p-6">
          <div className="flex items-center justify-between">
            <legend className="text-sm font-semibold text-slate-800">FAQs</legend>
            <button type="button" onClick={() => set("faqs", [...form.faqs, { question: "", answer: "" }])} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {form.faqs.map((faq, i) => (
              <div key={i} className="flex flex-wrap items-start gap-2">
                <input aria-label="Question" placeholder="Question" value={faq.question} onChange={(e) => { const next = [...form.faqs]; next[i] = { ...faq, question: e.target.value }; set("faqs", next); }} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <input aria-label="Answer" placeholder="Answer" value={faq.answer} onChange={(e) => { const next = [...form.faqs]; next[i] = { ...faq, answer: e.target.value }; set("faqs", next); }} className="flex-1 rounded-lg border px-3 py-2 text-sm" />
                <button type="button" onClick={() => set("faqs", form.faqs.filter((_, j) => j !== i))} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </fieldset>

        {/* References */}
        <div className="rounded-2xl border bg-white p-6">
          <label className={label} htmlFor="references">Reference IDs (comma separated)</label>
          <input
            id="references"
            value={form.references.join(", ")}
            onChange={(e) => set("references", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={field}
            placeholder="ref-honey-immunomod, ref-..."
          />
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}
