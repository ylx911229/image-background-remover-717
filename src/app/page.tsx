import Link from "next/link";
import { BackgroundRemover } from "@/components/background-remover";

const faqItems = [
  {
    question: "How do I remove the background from an image?",
    answer:
      "Upload a JPG or PNG, select Remove background, then download the transparent PNG when it is ready.",
  },
  {
    question: "Is this background remover free?",
    answer:
      "The MVP is free to try. Fair-use limits protect the service from automated abuse and keep it available for everyone.",
  },
  {
    question: "What image formats are supported?",
    answer:
      "Clearcut currently accepts JPG, JPEG, and PNG images up to 22 MB. Animated files, PDF, HEIC, and video are not supported yet.",
  },
  {
    question: "Are my uploaded images stored?",
    answer:
      "We do not write your images to our storage systems. They pass through our Cloudflare service to Remove.bg for processing and return directly to your browser.",
  },
  {
    question: "Why did background removal fail?",
    answer:
      "Try a well-lit image with one clear foreground subject. Low contrast, severe blur, damaged files, and unsupported formats can prevent a clean result.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Clearcut Image Background Remover",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  description:
    "Remove image backgrounds online and download a transparent PNG.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="Clearcut home">
          <span className="logo-mark" aria-hidden="true">
            <span />
          </span>
          <span className="text-lg font-extrabold tracking-[-0.04em] text-slate-950">
            clearcut
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-slate-600 sm:gap-7">
          <a className="hidden transition hover:text-slate-950 sm:inline" href="#how-it-works">
            How it works
          </a>
          <a className="hidden transition hover:text-slate-950 sm:inline" href="#faq">
            FAQ
          </a>
          <a
            className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 shadow-sm transition hover:border-slate-400 hover:shadow"
            href="#tool"
          >
            Remove background
          </a>
        </nav>
      </header>

      <section className="relative overflow-hidden px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:px-10">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            No sign-up · No image storage
          </div>
          <h1 className="mx-auto max-w-4xl text-balance text-5xl font-black leading-[0.98] tracking-[-0.06em] text-slate-950 sm:text-7xl lg:text-[5.6rem]">
            Remove backgrounds.
            <span className="block text-emerald-600">Keep what matters.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
            One click turns a busy photo into a clean, transparent PNG. Fast,
            precise, and ready for your next product page, profile, or design.
          </p>
        </div>

        <div id="tool" className="relative mx-auto mt-12 max-w-5xl scroll-mt-8">
          <BackgroundRemover />
        </div>
      </section>

      <section id="how-it-works" className="border-y border-slate-200 bg-white px-5 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Three simple steps</p>
            <h2 className="section-title">From photo to transparent in moments.</h2>
            <p className="section-copy">
              No editing skills, layers, or complicated controls. Clearcut keeps
              the workflow focused on the result.
            </p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Choose your image", "Drop in a JPG or PNG up to 22 MB from any device."],
              ["02", "Let AI do the cut", "Your image is securely sent for automatic foreground detection."],
              ["03", "Download the result", "Preview the clean cutout and save a transparent PNG."],
            ].map(([number, title, copy]) => (
              <article key={number} className="feature-card">
                <span className="text-sm font-black tracking-widest text-emerald-600">{number}</span>
                <h3 className="mt-8 text-xl font-extrabold tracking-tight text-slate-950">{title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="eyebrow">Built for real work</p>
            <h2 className="section-title">A clean cut for every kind of project.</h2>
            <p className="section-copy">
              Give product shots, portraits, logos, and creative assets a polished
              starting point without opening a full design suite.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Product photos", "Prepare transparent catalog assets for stores and marketplaces."],
              ["Profile pictures", "Separate people cleanly for avatars, posters, and social posts."],
              ["Logos & graphics", "Turn solid-background artwork into flexible transparent assets."],
              ["Presentations", "Create focused visuals that sit naturally on any slide color."],
            ].map(([title, copy], index) => (
              <article key={title} className={`use-card use-card-${index + 1}`}>
                <span className="use-card-icon" aria-hidden="true">{["▣", "●", "◆", "◫"][index]}</span>
                <h3 className="mt-6 text-lg font-extrabold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] bg-slate-950 text-white lg:grid-cols-2">
          <div className="p-8 sm:p-12 lg:p-16">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-400">Privacy, clearly stated</p>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Your image is a task, not our data.</h2>
            <p className="mt-5 max-w-lg leading-7 text-slate-300">
              We do not persistently store your uploaded image. It is transmitted
              to Remove.bg only for processing and returned directly to your browser.
            </p>
            <Link href="/privacy" className="mt-8 inline-flex items-center gap-2 font-bold text-emerald-400 hover:text-emerald-300">
              Read our privacy policy <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="privacy-visual" aria-hidden="true">
            <div className="privacy-file">JPG</div>
            <div className="privacy-line" />
            <div className="privacy-shield">✓</div>
            <div className="privacy-line" />
            <div className="privacy-file privacy-file-png">PNG</div>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-slate-200 bg-white px-5 py-24 sm:px-8 lg:px-10">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="eyebrow">Questions, answered</p>
            <h2 className="section-title">Good to know.</h2>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {faqItems.map((item) => (
              <details key={item.question} className="group py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-bold text-slate-950">
                  {item.question}
                  <span className="text-2xl font-light text-slate-400 transition group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="max-w-2xl pb-6 pr-10 leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span className="logo-mark logo-mark-small" aria-hidden="true"><span /></span>
            clearcut
          </div>
          <p>© {new Date().getFullYear()} Clearcut. Images are processed by Remove.bg.</p>
          <div className="flex gap-5 font-semibold">
            <Link className="hover:text-slate-950" href="/privacy">Privacy</Link>
            <Link className="hover:text-slate-950" href="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
