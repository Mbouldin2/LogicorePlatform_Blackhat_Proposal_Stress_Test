import type { CarouselSlide } from "@/types";

export interface RenderStyle {
  palette: string[]; // [dark, primary, accent, light]
  fontHeading: string;
  fontBody: string;
  tone: string;
  logoDataUrl?: string | null;
  brandName?: string;
}

/** Draw a single slide onto a canvas at the exact target dimensions and return
 *  a PNG data URL. Premium, business-grade composition — gradient field, accent
 *  rule, kicker, wrapped headline, supporting body, slide index, optional logo. */
export function renderSlideToDataUrl(
  slide: CarouselSlide,
  style: RenderStyle,
  w: number,
  h: number,
  index: number,
  total: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const [dark, primary, accent, light] = style.palette;
  const pad = Math.round(w * 0.08);

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, dark);
  grad.addColorStop(1, primary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Subtle corner glow
  const glow = ctx.createRadialGradient(w, 0, 0, w, 0, w * 0.8);
  glow.addColorStop(0, hexWithAlpha(accent, 0.35));
  glow.addColorStop(1, hexWithAlpha(accent, 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Accent rule
  ctx.fillStyle = accent;
  ctx.fillRect(pad, pad, Math.round(w * 0.12), Math.max(4, Math.round(h * 0.008)));

  // Kicker
  ctx.fillStyle = hexWithAlpha(light, 0.85);
  ctx.font = `600 ${Math.round(w * 0.026)}px ${style.fontBody}, sans-serif`;
  ctx.fillText(`${(style.tone || "Insight").toUpperCase()}`, pad, pad + Math.round(h * 0.07));

  // Headline (wrapped)
  ctx.fillStyle = "#ffffff";
  const headSize = Math.round(w * (slide.headline.length > 40 ? 0.06 : 0.078));
  ctx.font = `800 ${headSize}px ${style.fontHeading}, serif`;
  const headLines = wrapText(ctx, slide.headline, w - pad * 2);
  let y = pad + Math.round(h * 0.16);
  headLines.slice(0, 4).forEach((line) => {
    ctx.fillText(line, pad, y);
    y += headSize * 1.12;
  });

  // Body
  ctx.fillStyle = hexWithAlpha(light, 0.92);
  const bodySize = Math.round(w * 0.032);
  ctx.font = `400 ${bodySize}px ${style.fontBody}, sans-serif`;
  y += Math.round(h * 0.02);
  const bodyLines = wrapText(ctx, slide.body, w - pad * 2);
  bodyLines.slice(0, 6).forEach((line) => {
    ctx.fillText(line, pad, y);
    y += bodySize * 1.45;
  });

  // Footer: brand + slide index
  ctx.fillStyle = hexWithAlpha(light, 0.7);
  ctx.font = `600 ${Math.round(w * 0.024)}px ${style.fontBody}, sans-serif`;
  if (style.brandName) ctx.fillText(style.brandName, pad, h - pad);
  const idx = `${index + 1} / ${total}`;
  const idxW = ctx.measureText(idx).width;
  ctx.fillText(idx, w - pad - idxW, h - pad);

  return canvas.toDataURL("image/png");
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Trigger a browser download of a data URL. */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
