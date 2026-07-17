import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Clearcut handles uploaded images and service data." };

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">← Back to Clearcut</Link>
        <article className="legal-copy mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
          <p className="eyebrow">Effective July 17, 2026</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">Privacy Policy</h1>
          <p>This policy explains how Clearcut handles information when you use our image background removal tool.</p>
          <h2>Uploaded images</h2>
          <p>We do not write uploaded images or processed results to our persistent storage systems. Images are transmitted through Cloudflare Workers to Remove.bg solely to provide the requested background-removal operation, then returned to your browser.</p>
          <p>Remove.bg is a third-party processing provider. Its handling of data is governed by its own privacy policy and service terms.</p>
          <h2>Technical information</h2>
          <p>We may process limited technical data such as request identifiers, approximate region, response status, processing duration, browser type, and error category to secure and improve the service. Logs do not intentionally include image bodies or full upload requests.</p>
          <h2>Browser storage</h2>
          <p>Image previews and results use temporary browser object URLs. Clearcut does not place your images in localStorage, sessionStorage, or IndexedDB. Temporary browser memory is released when you replace the image or leave the page.</p>
          <h2>Security and abuse prevention</h2>
          <p>We use Cloudflare security services, including Turnstile and rate limiting, to protect the service. These services may process network and device signals necessary to detect automated abuse.</p>
          <h2>Analytics</h2>
          <p>We may use privacy-conscious aggregate analytics to understand page visits and the upload-to-download funnel. Analytics events do not include file names or image content.</p>
          <h2>Contact and changes</h2>
          <p>This is an MVP policy and should be reviewed with qualified counsel before commercial launch. Material changes will be reflected on this page with a revised effective date.</p>
        </article>
      </div>
    </main>
  );
}
