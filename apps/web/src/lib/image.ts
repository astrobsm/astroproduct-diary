/**
 * Client-side image handling for direct uploads. Images selected from the
 * device are resized and re-encoded to a compact data URL so they fit well
 * under the API's 1 MB JSON body limit and load fast on mobile networks.
 *
 * No external storage is required — the resulting data URL is saved straight
 * into the existing string image field (product image / seminar imageUrl).
 */

export interface CompressOptions {
  /** Longest edge of the output image in pixels. */
  maxDimension?: number;
  /** Initial JPEG quality (0–1); reduced automatically if still too large. */
  quality?: number;
  /** Hard ceiling for the encoded data URL length (characters). */
  maxBytes?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  maxDimension: 1024,
  quality: 0.82,
  // ~700 KB of base64 leaves comfortable headroom under the 1 MB JSON limit.
  maxBytes: 700_000
};

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the selected image."));
    img.src = dataUrl;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Resize + compress an image File into a JPEG data URL. Throws a friendly
 * Error if the file is not an image or cannot be shrunk under `maxBytes`.
 */
export async function compressImageFile(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const opts = { ...DEFAULTS, ...options };
  if (!isImageFile(file)) {
    throw new Error("Please choose an image file (JPEG, PNG, WebP, etc.).");
  }

  const original = await readAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, opts.maxDimension / Math.max(img.width, img.height));
  let width = Math.max(1, Math.round(img.width * scale));
  let height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image processing is not supported in this browser.");

  let quality = opts.quality;
  let output = "";
  // Reduce quality, then dimensions, until the encoded image fits the ceiling.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    output = canvas.toDataURL("image/jpeg", quality);
    if (output.length <= opts.maxBytes) return output;
    if (quality > 0.5) {
      quality -= 0.15;
    } else {
      width = Math.round(width * 0.8);
      height = Math.round(height * 0.8);
    }
  }

  if (output.length > opts.maxBytes) {
    throw new Error("That image is too large even after compression. Try a smaller photo.");
  }
  return output;
}
