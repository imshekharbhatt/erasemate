export default function Footer() {
  const year = new Date().getFullYear();

  const cols = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "API Docs", href: "/docs" },
        { label: "Pricing", href: "/pricing" },
        { label: "Changelog", href: "#" },
        { label: "Status", href: "#" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "E-commerce", href: "#" },
        { label: "Photography", href: "#" },
        { label: "Marketing", href: "#" },
        { label: "Developers", href: "/docs" },
        { label: "Enterprise", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Press", href: "#" },
        { label: "Contact", href: "mailto:hello@erasemate.app" },
      ],
    },
  ];

  return (
    <footer className="bg-white border-t border-line py-12 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1200px] mx-auto grid gap-8 sm:gap-10 lg:gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[200px_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 text-[17px] font-extrabold text-text tracking-tight mb-3">
            <div className="w-6 h-6 bg-purple rounded-[6px] flex items-center justify-center">
              <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
                <circle
                  cx="7"
                  cy="7"
                  r="5"
                  stroke="white"
                  strokeWidth="1.5"
                  fill="none"
                />
                <path
                  d="M5 7l1.5 1.5L9.5 5.5"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            Erase<span className="text-purple">Mate</span>
          </div>
          <p className="text-[13px] text-muted leading-[1.7]">
            Professional AI background removal. Built for designers, developers,
            and teams who need precision at scale.
          </p>
          {/* Social icons */}
          <div className="flex gap-3 mt-5">
            {[
              {
                label: "Twitter",
                href: "#",
                path: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z",
              },
              {
                label: "GitHub",
                href: "#",
                path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22",
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 rounded-lg bg-bg border border-line flex items-center justify-center text-muted hover:text-text hover:border-line2 transition-colors"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-3.5 h-3.5 stroke-current"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {cols.map((col) => (
          <div key={col.title}>
            <p className="text-[12px] font-bold tracking-[0.08em] text-text uppercase mb-4">
              {col.title}
            </p>
            <div className="flex flex-col gap-2.5">
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13.5px] text-muted no-underline hover:text-text transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1200px] mx-auto mt-9 pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-[12.5px] text-muted2">
          © {year} EraseMate. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-4 sm:gap-5">
          {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((t) => (
            <a
              key={t}
              href="#"
              className="text-[12.5px] text-muted2 no-underline hover:text-text2 transition-colors"
            >
              {t}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
