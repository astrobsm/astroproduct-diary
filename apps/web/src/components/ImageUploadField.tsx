import { useId, useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { compressImageFile } from "../lib/image";

interface ImageUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Accessible label for the preview/alt text. */
  label: string;
  /** Optional hint shown under the controls. */
  hint?: string;
  /** Disable all controls (e.g. while a parent save is in flight). */
  disabled?: boolean;
}

/**
 * Reusable image picker: tap to upload a photo from the device (camera or
 * gallery on mobile), or paste a public URL. Uploaded photos are compressed
 * client-side to a compact data URL via compressImageFile.
 */
export default function ImageUploadField({
  value,
  onChange,
  label,
  hint,
  disabled = false
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not process the image.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border bg-slate-100">
          {value ? (
            // eslint-disable-next-line jsx-a11y/img-redundant-alt
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-400" />
          )}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || busy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-brand-navy/30 bg-brand-navy/5 px-3 py-1.5 text-sm font-semibold text-brand-navy hover:bg-brand-navy/10 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {value ? "Change image" : "Upload image"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setError(null);
                }}
                disabled={disabled || busy}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-2.5 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                <X className="h-4 w-4" /> Remove
              </button>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label={`Upload image for ${label}`}
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <label htmlFor={fieldId} className="sr-only">
            Image URL for {label}
          </label>
          <input
            id={fieldId}
            value={value.startsWith("data:") ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || busy}
            placeholder={value.startsWith("data:") ? "Uploaded photo attached" : "or paste an image URL (https://… or /products/…)"}
            className="w-full rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-brand-blue disabled:bg-slate-50"
          />
        </div>
      </div>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
