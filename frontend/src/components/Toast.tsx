import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Download, ZoomIn } from "lucide-react";
import { useImageStore } from "../store";
import { useToastStore } from "../store";

const BG_SWATCHES = [
  {
    id: "transparent",
    label: "Transparent",
    class: "sw-transparent",
    style: {},
  },
  {
    id: "white",
    label: "White",
    class: "sw-white",
    style: { background: "#ffffff", border: "1.5px solid #e8e7f0" },
  },
  {
    id: "light",
    label: "Light grey",
    class: "",
    style: { background: "#f1f5f9" },
  },
  { id: "black", label: "Black", class: "", style: { background: "#111111" } },
  {
    id: "purple",
    label: "Purple",
    class: "",
    style: { background: "linear-gradient(135deg,#5b3ff8,#8b5cf6)" },
  },
  {
    id: "blue",
    label: "Blue",
    class: "",
    style: { background: "linear-gradient(135deg,#1d4ed8,#60a5fa)" },
  },
  {
    id: "green",
    label: "Green",
    class: "",
    style: { background: "linear-gradient(135deg,#166534,#22c55e)" },
  },
  {
    id: "orange",
    label: "Amber",
    class: "",
    style: { background: "linear-gradient(135deg,#92400e,#f59e0b)" },
  },
  {
    id: "red",
    label: "Red",
    class: "",
    style: { background: "linear-gradient(135deg,#991b1b,#f87171)" },
  },
];

const BG_CSS: Record<string, string> = {
  white: "#ffffff",
  light: "#f1f5f9",
  black: "#111111",
};
const BG_GRADIENT: Record<string, [string, string]> = {
  purple: ["#5b3ff8", "#8b5cf6"],
  blue: ["#1d4ed8", "#60a5fa"],
  green: ["#166534", "#22c55e"],
  orange: ["#92400e", "#f59e0b"],
  red: ["#991b1b", "#f87171"],
};

export default function ResultSection({
  model,
  enhanceEdges,
}: {
  model: string;
  enhanceEdges: boolean;
}) {
  const {
    originalUrl,
    resultBlob,
    resultUrl,
    currentBg,
    setCurrentBg,
    processingMs,
    modelUsed,
  } = useImageStore();
  const { addToast } = useToastStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const paneOrigRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const resultImgRef = useRef<HTMLImageElement | null>(null);
  const sliding = useRef(false);

  // Draw result image with chosen background onto canvas
  const renderCanvas = useCallback((img: HTMLImageElement, bg: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxW = compareRef.current?.clientWidth || 1100;
    const maxH = 500;
    const scale = Math.min(
      maxW / img.naturalWidth,
      maxH / img.naturalHeight,
      1,
    );
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d")!;

    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (bg !== "transparent") {
      if (BG_CSS[bg]) {
        ctx.fillStyle = BG_CSS[bg];
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (BG_GRADIENT[bg]) {
        const [c1, c2] = BG_GRADIENT[bg];
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    // Draw at 2x scale onto offscreen canvas first for better AA, then downscale
    const offscreen = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    offscreen.width = canvas.width * dpr;
    offscreen.height = canvas.height * dpr;
    const octx = offscreen.getContext("2d")!;
    octx.imageSmoothingEnabled = true;
    octx.imageSmoothingQuality = "high";
    octx.scale(dpr, dpr);
    octx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Composite the high-res offscreen result back
    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height);

    // Edge refinement: soften jagged alpha edges for a professional look
    if (bg === "transparent") {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;
      // Smooth alpha at semi-transparent edges (0 < a < 240)
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          const a = data[idx + 3];
          if (a > 0 && a < 240) {
            // Average alpha with 4-neighbours for smoother edge transition
            const top = data[((y - 1) * w + x) * 4 + 3];
            const bottom = data[((y + 1) * w + x) * 4 + 3];
            const left = data[(y * w + (x - 1)) * 4 + 3];
            const right = data[(y * w + (x + 1)) * 4 + 3];
            data[idx + 3] = Math.round(
              (a * 4 + top + bottom + left + right) / 8,
            );
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, []);

  // Load result image
  useEffect(() => {
    if (!resultUrl) return;
    const img = new Image();
    img.onload = () => {
      resultImgRef.current = img;
      renderCanvas(img, currentBg);
    };
    img.src = resultUrl;
  }, [resultUrl]);

  // Re-render when bg changes
  useEffect(() => {
    if (resultImgRef.current) renderCanvas(resultImgRef.current, currentBg);
  }, [currentBg, renderCanvas]);

  // Slider logic
  const setDividerPos = useCallback((clientX: number) => {
    const win = compareRef.current;
    const pane = paneOrigRef.current;
    const div = dividerRef.current;
    if (!win || !pane || !div) return;
    const rect = win.getBoundingClientRect();
    const pct = Math.max(
      0.02,
      Math.min(0.98, (clientX - rect.left) / rect.width),
    );
    div.style.left = `${pct * 100}%`;
    pane.style.clipPath = `inset(0 ${(1 - pct) * 100}% 0 0)`;
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (sliding.current) setDividerPos(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (sliding.current && e.touches[0]) setDividerPos(e.touches[0].clientX);
    };
    const onUp = () => {
      sliding.current = false;
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchend", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchend", onUp);
    };
  }, [setDividerPos]);

  // Download
  const handleDownload = () => {
    const a = document.createElement("a");
    if (currentBg === "transparent" && resultBlob) {
      a.href = URL.createObjectURL(resultBlob);
      a.download = "erasemate-transparent.png";
    } else {
      a.href = canvasRef.current?.toDataURL("image/png") || "";
      a.download = `erasemate-${currentBg}.png`;
    }
    a.click();
    addToast("Download started", "success");
  };

  // Copy
  const handleCopy = async () => {
    try {
      await new Promise<void>((resolve, reject) => {
        canvasRef.current?.toBlob(async (blob) => {
          if (!blob) {
            reject();
            return;
          }
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          resolve();
        });
      });
      addToast("Image copied to clipboard", "success");
    } catch {
      addToast("Clipboard access unavailable in this browser", "error");
    }
  };

  return (
    <div className="max-w-[1100px] mx-auto mt-8 px-4 sm:px-0">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-[16px] font-bold text-text">
            Background Removed
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold bg-green-100 text-green-700 border border-green-200 px-2.5 py-[3px] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Completed
          </span>
          {processingMs > 0 && (
            <span className="text-[11.5px] text-muted2">
              {(processingMs / 1000).toFixed(1)}s · {modelUsed}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 text-text2 bg-white border border-line2 px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-bg2 transition-colors"
          >
            <Copy size={13} />
            Copy
          </button>
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 text-white bg-purple border-none px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-purple-hover hover:shadow-[0_4px_14px_rgba(91,63,248,0.3)] hover:-translate-y-px transition-all"
          >
            <Download size={13} />
            Download PNG
          </button>
        </div>
      </div>

      {/* Compare container */}
      <div className="bg-white border border-line rounded-[20px] overflow-hidden shadow-md">
        {/* Compare window */}
        <div
          ref={compareRef}
          className="relative h-[300px] sm:h-[420px] lg:h-[520px] overflow-hidden cursor-ew-resize select-none"
          onClick={(e) => {
            if (!sliding.current) setDividerPos(e.clientX);
          }}
        >
          {/* Result pane (checkerboard) */}
          <div className="absolute inset-0 flex items-center justify-center checkerboard">
            <canvas
              ref={canvasRef}
              className="max-h-[280px] sm:max-h-[400px] lg:max-h-[500px] max-w-full object-contain block pointer-events-none"
              style={{ imageRendering: "high-quality" }}
            />
          </div>

          {/* Original pane (clipped) */}
          <div
            ref={paneOrigRef}
            className="absolute inset-0 flex items-center justify-center bg-[#f8f8f8]"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          >
            {originalUrl && (
              <img
                src={originalUrl}
                alt="Original"
                className="max-h-[280px] sm:max-h-[400px] lg:max-h-[500px] max-w-full object-contain block pointer-events-none"
              />
            )}
          </div>

          {/* Divider */}
          <div
            ref={dividerRef}
            className="absolute top-0 bottom-0 w-px bg-purple z-20 cursor-ew-resize"
            style={{ left: "50%" }}
            onMouseDown={(e) => {
              sliding.current = true;
              e.preventDefault();
            }}
            onTouchStart={() => {
              sliding.current = true;
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border-2 border-purple shadow-[0_2px_10px_rgba(91,63,248,0.25)] flex items-center justify-center hover:shadow-[0_2px_16px_rgba(91,63,248,0.4)] transition-shadow">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 stroke-purple"
              >
                <polyline points="15 18 9 12 15 6" />
                <line x1="3" y1="12" x2="21" y2="12" />
              </svg>
            </div>
          </div>

          {/* Labels */}
          <span className="absolute top-3.5 left-3.5 bg-white/92 border border-line px-3 py-1 rounded-md text-[11px] font-bold tracking-[0.05em] text-text2 uppercase z-[25] backdrop-blur-sm shadow-sm">
            Original
          </span>
          <span className="absolute top-3.5 right-3.5 bg-white/92 border border-purple-light px-3 py-1 rounded-md text-[11px] font-bold tracking-[0.05em] text-purple uppercase z-[25] backdrop-blur-sm shadow-sm">
            Removed
          </span>
        </div>

        {/* Background picker */}
        <div className="border-t border-line px-6 py-4.5 flex items-center gap-5 bg-white flex-wrap py-[18px]">
          <span className="text-[12px] font-bold tracking-[0.06em] text-muted uppercase whitespace-nowrap min-w-[80px]">
            Background
          </span>
          <div className="flex gap-2 flex-wrap items-center">
            {BG_SWATCHES.map((sw) => (
              <button
                key={sw.id}
                title={sw.label}
                onClick={() => setCurrentBg(sw.id)}
                className={`
                  w-[34px] h-[34px] rounded-lg cursor-pointer transition-all duration-150 relative border-2
                  hover:scale-110
                  ${
                    currentBg === sw.id
                      ? "border-purple shadow-[0_0_0_3px_rgba(91,63,248,0.18)]"
                      : "border-transparent"
                  }
                  ${
                    sw.id === "transparent"
                      ? "bg-[image:linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[length:10px_10px] bg-[position:0_0,0_5px,5px_-5px,-5px_0] bg-[#f5f5f5]"
                      : ""
                  }
                `}
                style={sw.id !== "transparent" ? { ...sw.style } : {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
