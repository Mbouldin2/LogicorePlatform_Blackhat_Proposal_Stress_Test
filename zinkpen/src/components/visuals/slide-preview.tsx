"use client";
import type { CarouselSlide } from "@/types";
import type { RenderStyle } from "@/lib/visuals/render";

/** Live, on-screen mirror of the exported PNG. Scales to fit its container while
 *  preserving the chosen platform aspect ratio. Premium editorial composition. */
export function SlidePreview({
  slide,
  style,
  w,
  h,
  index,
  total,
}: {
  slide: CarouselSlide;
  style: RenderStyle;
  w: number;
  h: number;
  index: number;
  total: number;
}) {
  const [dark, primary, accent, light] = style.palette;
  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-pop)]"
      style={{
        aspectRatio: `${w} / ${h}`,
        background: `linear-gradient(135deg, ${dark}, ${primary})`,
        containerType: "inline-size",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 100% 0%, ${accent}55, transparent 60%)` }}
      />
      <div className="absolute inset-0 flex flex-col p-[7%]">
        <div className="h-1 w-[14%] rounded-full" style={{ background: accent }} />
        <p
          className="mt-[4%] text-[2.4cqw] font-semibold uppercase tracking-widest"
          style={{ color: light, fontFamily: style.fontBody, opacity: 0.85 }}
        >
          {style.tone || "Insight"}
        </p>
        <h2
          className="mt-[2%] font-extrabold leading-tight text-white"
          style={{
            fontFamily: style.fontHeading,
            fontSize: slide.headline.length > 40 ? "6cqw" : "7.6cqw",
          }}
        >
          {slide.headline}
        </h2>
        <p
          className="mt-[4%] max-w-[88%] text-[3.4cqw] leading-snug"
          style={{ color: light, fontFamily: style.fontBody, opacity: 0.92 }}
        >
          {slide.body}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="flex items-center gap-2 text-[2.6cqw] font-semibold" style={{ color: light, opacity: 0.75 }}>
            {style.logoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={style.logoDataUrl} alt="logo" className="h-[5cqw] w-auto object-contain" />
            ) : (
              style.brandName
            )}
          </span>
          <span className="text-[2.6cqw] font-semibold" style={{ color: light, opacity: 0.7 }}>
            {index + 1} / {total}
          </span>
        </div>
      </div>
    </div>
  );
}
