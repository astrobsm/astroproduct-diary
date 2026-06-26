import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import ProductImage from "../components/ProductImage";
import SourceBadge from "../components/SourceBadge";
import { useLoader } from "../lib/hooks";
import { loadProduct, type ProductView } from "../lib/source";

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: product, loading, source } = useLoader<ProductView | null>(
    (signal) => loadProduct(slug ?? "", signal),
    [slug]
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center">
        <p className="text-slate-600">Product not found.</p>
        <Link to="/products" className="mt-3 inline-block text-brand-blue hover:underline">
          Back to products
        </Link>
      </div>
    );
  }

  const productRefs = product.references;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-blue"
        >
          <ArrowLeft className="h-4 w-4" /> All products
        </Link>
        <SourceBadge source={source} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <ProductImage product={product} className="aspect-square w-full" />
          {product.ingredients.length > 0 && (
            <div className="rounded-xl border bg-white p-4">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                Key ingredients
              </h3>
              <ul className="mt-3 space-y-2">
                {product.ingredients.map((ing) => (
                  <li key={ing.name} className="text-sm">
                    <span className="font-semibold text-slate-800">{ing.name}</span>
                    {ing.percent ? (
                      <span className="text-slate-400"> · {ing.percent}</span>
                    ) : null}
                    <span className="block text-slate-500">{ing.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-brand-blue">
              {product.category}
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-800">{product.name}</h1>
            <p className="mt-1 text-brand-navy/70">{product.tagline}</p>
            <p className="mt-3 text-slate-600">{product.summary}</p>
          </div>

          {product.sections.map((section) => (
            <section key={section.type} className="rounded-xl border bg-white p-5">
              <h2 className="text-base font-bold text-slate-800">{section.title}</h2>
              <ul className="mt-3 space-y-2">
                {section.items.map((item, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-600">
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {product.faqs.length > 0 && (
            <section className="rounded-xl border bg-white p-5">
              <h2 className="text-base font-bold text-slate-800">Frequently asked questions</h2>
              <div className="mt-3 divide-y">
                {product.faqs.map((faq, idx) => (
                  <details key={idx} className="group py-3">
                    <summary className="cursor-pointer list-none font-medium text-slate-700 marker:hidden">
                      {faq.question}
                    </summary>
                    <p className="mt-2 text-sm text-slate-500">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {productRefs.length > 0 && (
            <section className="rounded-xl border bg-white p-5">
              <h2 className="text-base font-bold text-slate-800">Supporting evidence</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-600">
                {productRefs.map((ref, idx) => (
                  <li key={idx}>
                    {ref.authors} <span className="italic">{ref.title}</span> {ref.journal}{" "}
                    {ref.year}.
                    {ref.doi ? (
                      <span className="text-slate-400"> doi:{ref.doi}</span>
                    ) : null}
                    <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">
                      {ref.evidenceLevel}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-[11px] text-slate-400">
                Educational information only — not a substitute for professional clinical judgement.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
