import { Cloud, CloudOff } from "lucide-react";
import type { DataSource } from "../lib/source";

/** Small indicator showing whether content is served live from the API or from
 * the bundled offline cache (PWA / field use). */
export default function SourceBadge({ source }: { source: DataSource | null }) {
  if (!source) return null;
  const live = source === "live";
  return (
    <span
      title={
        live
          ? "Served live from the ASTROBSM API"
          : "Served from offline content (API unreachable)"
      }
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
        live ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {live ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
      {live ? "Live" : "Offline"}
    </span>
  );
}
