import { useState } from "react";
import { Package } from "lucide-react";

interface ProductImageData {
  name: string;
  accent: string;
  image?: string;
}

/**
 * Renders the official product photo from /public/products/<slug>.jpg when present,
 * and falls back to a branded placeholder if the image has not been added yet.
 * Drop official images extracted from the product brochure into apps/web/public/products/.
 */
export default function ProductImage({
  product,
  className = ""
}: {
  product: ProductImageData;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = product.image && !failed;

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${product.accent} ${className}`}
    >
      {showImage ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center">
          <Package className="h-10 w-10 text-brand-navy/60" />
          <span className="text-sm font-semibold text-brand-navy/80">{product.name}</span>
          <span className="text-[11px] text-brand-navy/50">
            Official product image pending
          </span>
        </div>
      )}
    </div>
  );
}
