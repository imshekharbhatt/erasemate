import UploadSection from "../components/UploadSection";

const FEATURES = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-purple"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    name: "Neural AI Models",
    desc: "Powered by U2Net and ISNet deep learning — the same architecture behind enterprise tools.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-purple"
        strokeWidth={1.75}
        strokeLinecap="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    name: "Sub-3s Processing",
    desc: "Optimised inference pipelines on GPU-accelerated hardware deliver results in under 3 seconds.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-purple"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    name: "Hair & Fine Detail",
    desc: "Alpha matting preserves individual hair strands, fur, and transparent objects others miss.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-purple"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    name: "Batch Processing",
    desc: "Upload up to 10 images at once via the API or dashboard. Results delivered instantly.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-purple"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    name: "Secure & Private",
    desc: "Images are processed transiently. Results stored encrypted in your private storage bucket.",
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-purple"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    name: "REST API",
    desc: "Integrate background removal into any app with a single POST request. Full API key auth.",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Upload your image",
    desc: "Drag and drop, click to browse, or paste directly from clipboard. Any common format works.",
  },
  {
    n: 2,
    title: "AI removes the background",
    desc: "Our neural pipeline analyses, segments, and precisely removes the background in seconds.",
  },
  {
    n: 3,
    title: "Download or customise",
    desc: "Get a transparent PNG instantly, or apply a custom background before downloading.",
  },
];

const INTEGRATIONS = [
  {
    name: "Shopify",
    desc: "Product images",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-text2"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <path d="M15.5 5.5c-.5-2-2-3.5-3.5-3.5a3.5 3.5 0 00-3.5 3.5" />
        <path d="M4 7l1 14h14l1-14H4z" />
      </svg>
    ),
  },
  {
    name: "Figma",
    desc: "Design workflow",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-text2"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="2" width="7" height="7" rx="2" />
        <rect x="13" y="2" width="7" height="7" rx="2" />
        <rect x="4" y="11" width="7" height="7" rx="2" />
        <rect x="13" y="11" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    name: "Adobe CC",
    desc: "Creative suite",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-text2"
        strokeWidth={1.5}
        strokeLinecap="round"
      >
        <path d="M3 3h7l3 18H3z" />
        <path d="M21 3h-7l-3 18h10z" />
      </svg>
    ),
  },
  {
    name: "WooCommerce",
    desc: "E-commerce",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-5 h-5 stroke-text2"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.98-1.67l1.6-9.33H6" />
      </svg>
    ),
  },
];

const STATS = [
  { n: "50M+", label: "Images processed" },
  { n: "99.1%", label: "Detection accuracy" },
  { n: "2.8s", label: "Average processing time" },
  { n: "180+", label: "Countries using EraseMate" },
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="bg-white px-10 pt-[72px] pb-0 text-center relative overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(91,63,248,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.06em] text-purple uppercase mb-[22px] opacity-0 animate-rise animate-delay-1">
          <span
            className="h-px w-8"
            style={{
              background: "linear-gradient(90deg, transparent, #5b3ff8)",
            }}
          />
          Automated Background Removal
          <span
            className="h-px w-8"
            style={{
              background: "linear-gradient(90deg, #5b3ff8, transparent)",
            }}
          />
        </div>

        <h1 className="font-sans text-[clamp(38px,5.5vw,72px)] font-extrabold tracking-[-2px] leading-[1.04] text-text mb-[22px] opacity-0 animate-rise animate-delay-2">
          Remove Any Background
          <br />
          <em className="font-serif font-normal not-italic text-purple italic">
            Automatically.
          </em>
        </h1>

        <p className="text-[17px] text-muted max-w-[500px] mx-auto mb-11 leading-[1.7] opacity-0 animate-rise animate-delay-3">
          Upload any image and receive a clean, precise cutout in seconds. Built
          for professionals, designers, and developers who need results at
          scale.
        </p>

        <div className="flex items-center justify-center gap-9 flex-wrap py-6 pb-10 opacity-0 animate-rise animate-delay-4">
          <span className="text-[11px] font-semibold tracking-[0.1em] text-muted2 uppercase">
            Trusted by
          </span>
          <div className="flex items-center gap-8 flex-wrap">
            {["Shopify", "Adobe", "Figma", "Canva", "WooCommerce"].map((b) => (
              <span
                key={b}
                className="text-[13px] font-bold text-muted2 tracking-[0.02em]"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upload / Result ───────────────────────────────────────── */}
      <div id="upload-section">
        <UploadSection />
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-line px-10">
        <div className="max-w-[1200px] mx-auto flex flex-wrap">
          {STATS.map((s, i) => (
            <div
              key={s.n}
              className="flex-1 py-8 text-center"
              style={{
                borderRight:
                  i < STATS.length - 1 ? "1px solid #e8e7f0" : "none",
                minWidth: "140px",
              }}
            >
              <div className="text-[28px] font-extrabold text-text tracking-[-1px] mb-1">
                {s.n}
              </div>
              <div className="text-[13px] text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white px-10 py-24">
        <div className="max-w-[1200px] mx-auto">
          <span className="block text-center text-[11.5px] font-bold tracking-[0.1em] text-purple uppercase mb-3.5">
            Process
          </span>
          <h2 className="font-sans text-[clamp(26px,3.5vw,40px)] font-extrabold tracking-[-1px] text-text text-center mb-4">
            Three steps to a perfect cutout
          </h2>
          <p className="text-[16px] text-muted text-center max-w-[520px] mx-auto mb-14 leading-[1.7]">
            No technical skills required. Upload, process, and download — the
            entire workflow takes under 10 seconds.
          </p>

          <div
            className="grid gap-10 relative"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <div className="absolute top-[22px] left-[calc(16.66%+10px)] right-[calc(16.66%+10px)] h-px bg-line2" />
            {STEPS.map((step) => (
              <div key={step.n} className="text-center group">
                <div className="w-11 h-11 rounded-full mx-auto mb-5 bg-white border-[1.5px] border-line2 flex items-center justify-center relative z-10 transition-all group-hover:border-purple group-hover:shadow-[0_0_0_4px_#ede9fe]">
                  <span className="text-[14px] font-extrabold text-purple">
                    {step.n}
                  </span>
                </div>
                <h3 className="text-[15px] font-bold text-text mb-2">
                  {step.title}
                </h3>
                <p className="text-[13.5px] text-muted leading-[1.7]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="bg-bg border-y border-line px-10 py-24">
        <div className="max-w-[1200px] mx-auto">
          <span className="block text-center text-[11.5px] font-bold tracking-[0.1em] text-purple uppercase mb-3.5">
            Why EraseMate
          </span>
          <h2 className="font-sans text-[clamp(26px,3.5vw,40px)] font-extrabold tracking-[-1px] text-text text-center mb-4">
            Built for precision at scale
          </h2>
          <p className="text-[16px] text-muted text-center max-w-[520px] mx-auto mb-14 leading-[1.7]">
            Every feature is designed around professional workflows — from
            individual creators to enterprise pipelines.
          </p>

          <div
            className="grid bg-line border border-line rounded-[20px] overflow-hidden"
            style={{ gridTemplateColumns: "repeat(3, 1fr)", gap: "1px" }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.name}
                className="bg-white px-8 py-9 hover:bg-bg transition-colors"
              >
                <div className="w-11 h-11 rounded-[11px] bg-purple-light flex items-center justify-center mb-[18px]">
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-bold text-text mb-2 tracking-[-0.2px]">
                  {f.name}
                </h3>
                <p className="text-[13.5px] text-muted leading-[1.7]">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Integrations ─────────────────────────────────────────── */}
      <section id="integrations" className="bg-white px-10 py-24">
        <div className="max-w-[1200px] mx-auto">
          <span className="block text-center text-[11.5px] font-bold tracking-[0.1em] text-purple uppercase mb-3.5">
            Integrations
          </span>
          <h2 className="font-sans text-[clamp(26px,3.5vw,40px)] font-extrabold tracking-[-1px] text-text text-center mb-4">
            Works with your stack
          </h2>
          <p className="text-[16px] text-muted text-center max-w-[520px] mx-auto mb-14 leading-[1.7]">
            Connect EraseMate to the tools you already use. REST API makes
            integration trivial.
          </p>

          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(4, 1fr)" }}
          >
            {INTEGRATIONS.map((int) => (
              <div
                key={int.name}
                className="bg-white border border-line rounded-[14px] px-5 py-6 text-center hover:border-purple-mid hover:shadow-[0_6px_24px_rgba(91,63,248,0.1)] hover:-translate-y-0.5 transition-all"
              >
                <div className="w-11 h-11 rounded-[10px] bg-bg border border-line mx-auto mb-3 flex items-center justify-center">
                  {int.icon}
                </div>
                <h4 className="text-[13px] font-bold text-text mb-1">
                  {int.name}
                </h4>
                <p className="text-[12px] text-muted">{int.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── API Section ──────────────────────────────────────────── */}
      <section id="api" className="bg-bg border-y border-line px-10 py-24">
        <div
          className="max-w-[1200px] mx-auto grid gap-16"
          style={{ gridTemplateColumns: "1fr 1fr" }}
        >
          <div>
            <span className="block text-[11.5px] font-bold tracking-[0.1em] text-purple uppercase mb-3.5">
              Developer API
            </span>
            <h2 className="font-sans text-[clamp(22px,3vw,36px)] font-extrabold tracking-[-1px] text-text mb-4">
              One request. Perfect results.
            </h2>
            <p className="text-[15px] text-muted leading-[1.7] mb-6">
              Integrate EraseMate into your app, pipeline, or automation with a
              single POST request. Get a transparent PNG back in milliseconds.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {[
                "Simple REST API with multipart upload",
                "Bearer token auth via Supabase",
                "Model selection & edge enhancement params",
                "Full OpenAPI docs at /docs",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[13.5px] text-muted"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    className="w-4 h-4 mt-px shrink-0"
                  >
                    <circle cx="8" cy="8" r="7" fill="#ede9fe" />
                    <path
                      d="M5 8l2 2 4-4"
                      stroke="#5b3ff8"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="/docs"
              className="inline-flex items-center gap-2 bg-purple text-white px-6 py-2.5 rounded-lg text-[13.5px] font-semibold no-underline hover:bg-purple-hover transition-colors"
            >
              View API docs →
            </a>
          </div>
          <div className="bg-text rounded-[16px] p-6 overflow-x-auto">
            <div className="flex items-center gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-70" />
              <div className="w-3 h-3 rounded-full bg-green-500 opacity-70" />
            </div>
            <pre className="text-[12.5px] leading-[1.8] text-[#a78bfa] font-mono whitespace-pre-wrap">
              {`curl -X POST \\
  https://your-api.railway.app/api/remove-background \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@photo.jpg" \\
  -F "model=auto" \\
  -F "enhance_edges=true" \\
  --output result.png`}
            </pre>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[11px] text-[#6b7280] font-mono">
                ← Returns transparent PNG with headers:
              </p>
              <p className="text-[11px] text-[#34d399] font-mono mt-1">
                X-Processing-Time-Ms: 1823
              </p>
              <p className="text-[11px] text-[#34d399] font-mono">
                X-Model-Used: u2net_human_seg
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Band ─────────────────────────────────────────────── */}
      <section className="bg-text px-10 py-20 text-center">
        <h2 className="font-sans text-[clamp(28px,4vw,46px)] font-extrabold tracking-[-1.5px] text-white mb-4">
          Start removing backgrounds
          <br />
          <em className="font-serif font-normal not-italic italic text-[#a78bfa]">
            for free today.
          </em>
        </h2>
        <p className="text-[16px] text-[#9ca3af] max-w-[460px] mx-auto mb-9 leading-[1.7]">
          No credit card required. 5 free images per day, upgrade for unlimited.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href="#upload-section"
            className="text-[14.5px] font-bold bg-white text-text px-8 py-3.5 rounded-[10px] no-underline hover:opacity-90 transition-opacity"
          >
            Remove background free →
          </a>
          <a
            href="/docs"
            className="text-[14.5px] font-semibold bg-transparent text-white/70 border border-white/20 px-7 py-3.5 rounded-[10px] no-underline hover:border-white/50 hover:text-white transition-all"
          >
            View API docs
          </a>
        </div>
      </section>
    </>
  );
}
