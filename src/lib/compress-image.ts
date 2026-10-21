const MAX_EDGE = 1600;
const MAX_BYTES = 900_000;
const QUALITY_STEPS = [0.72, 0.62, 0.52, 0.42];

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Could not compress image."));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

/** Shrink phone photos so uploads stay well under Vercel/API limits. */
export async function compressImageForUpload(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Uploads must be PNG or JPG.");
  }

  if (file.size <= MAX_BYTES) {
    return file;
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not compress image.");
  ctx.drawImage(img, 0, 0, width, height);

  const outputType =
    file.type === "image/png" || file.type === "image/webp"
      ? file.type
      : "image/jpeg";

  let best: Blob | null = null;
  for (const quality of QUALITY_STEPS) {
    const blob = await canvasToBlob(canvas, outputType, quality);
    best = blob;
    if (blob.size <= MAX_BYTES) break;
  }

  if (!best) throw new Error("Could not compress image.");

  const base = file.name.replace(/\.[^.]+$/, "") || "upload";
  const ext =
    outputType === "image/png"
      ? "png"
      : outputType === "image/webp"
        ? "webp"
        : "jpg";

  return new File([best], `${base}.${ext}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}
