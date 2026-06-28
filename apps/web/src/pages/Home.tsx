import { Link } from "react-router-dom";
import {
  ArrowRight,
  FlaskConical,
  GraduationCap,
  Globe2,
  Package,
  Users
} from "lucide-react";
import ProductImage from "../components/ProductImage";
import { products as localProducts } from "../data/products";
import { useLoader } from "../lib/hooks";
import { loadProducts, type ProductView } from "../lib/source";
import { useI18n } from "../lib/i18n";

const pillars = [
  { icon: Package, key: "product" },
  { icon: GraduationCap, key: "academy" },
  { icon: FlaskConical, key: "evidence" },
  { icon: Users, key: "crm" }
] as const;

// An image is displayable only if it is an uploaded photo (data URL) or a
// hosted URL — the seeded "/products/*.jpg" paths have no files and 404.
const hasDisplayableImage = (image?: string) =>
  !!image && (image.startsWith("data:") || image.startsWith("http"));

export default function Home() {
  const { t } = useI18n();
  const { data } = useLoader<ProductView[]>((signal) => loadProducts(signal), []);
  // Prefer live products (includes admin-uploaded images); fall back to the
  // bundled catalogue so the home page still renders offline / before load.
  const source = data && data.length > 0 ? data : localProducts;
  // Surface products that actually have a photo first, then show every
  // product so each uploaded image appears on the home page.
  const featured = [...source].sort(
    (a, b) => Number(hasDisplayableImage(b.image)) - Number(hasDisplayableImage(a.image))
  );
  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-brand-navy px-6 py-10 text-white sm:px-10">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
          <Globe2 className="h-3.5 w-3.5" /> {t("home.badge")}
        </span>
        <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="mt-3 max-w-2xl text-white/80">{t("home.subtitle")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-sky px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue"
          >
            {t("home.exploreProducts")} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/academy"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            {t("home.openAcademy")}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-800">{t("home.deliversTitle")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, key }) => (
            <div key={key} className="rounded-xl border bg-white p-5">
              <Icon className="h-6 w-6 text-brand-blue" />
              <h3 className="mt-3 font-semibold text-slate-800">{t(`home.pillar.${key}.title`)}</h3>
              <p className="mt-1 text-sm text-slate-500">{t(`home.pillar.${key}.text`)}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">{t("home.featured")}</h2>
          <Link to="/products" className="text-sm font-semibold text-brand-blue hover:underline">
            {t("home.viewAll")}
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.slug}
              to={`/products/${p.slug}`}
              className="group rounded-xl border bg-white p-4 transition hover:shadow-md"
            >
              <ProductImage product={p} className="h-32" />
              <h3 className="mt-3 font-semibold text-slate-800 group-hover:text-brand-blue">
                {p.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
