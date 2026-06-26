import { Link } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import ProductImage from "../components/ProductImage";
import SourceBadge from "../components/SourceBadge";
import { useLoader } from "../lib/hooks";
import { loadProducts, type ProductView } from "../lib/source";

export default function Products() {
  const { data, loading, source } = useLoader<ProductView[]>(
    (signal) => loadProducts(signal),
    []
  );
  const products = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            Advanced wound-care range from Bonnesante Medicals. Tap a product for indications,
            mechanism of action, application technique and supporting evidence.
          </p>
        </div>
        <SourceBadge source={source} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading products…
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link
              key={p.slug}
              to={`/products/${p.slug}`}
              className="group flex flex-col rounded-xl border bg-white p-4 transition hover:shadow-md"
            >
              <ProductImage product={p} className="h-40" />
              <div className="mt-4 flex flex-1 flex-col">
                <span className="text-xs font-medium uppercase tracking-wide text-brand-blue">
                  {p.category}
                </span>
                <h2 className="mt-1 font-semibold text-slate-800 group-hover:text-brand-blue">
                  {p.name}
                </h2>
                <p className="mt-1 flex-1 text-sm text-slate-500">{p.summary}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-blue">
                  Learn more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
