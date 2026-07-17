import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for using the Clearcut image background remover." };

export default function TermsPage() {
  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm font-bold text-emerald-700 hover:text-emerald-800">← Back to Clearcut</Link>
        <article className="legal-copy mt-10 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-12">
          <p className="eyebrow">Effective July 17, 2026</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl">Terms of Use</h1>
          <p>By using Clearcut, you agree to these terms. If you do not agree, do not use the service.</p>
          <h2>Permitted use</h2>
          <p>You may use the service to process images that you own or are authorized to use. You remain responsible for the images you upload and the results you download.</p>
          <h2>Prohibited use</h2>
          <ul>
            <li>Do not upload unlawful, abusive, infringing, or privacy-invasive material.</li>
            <li>Do not bypass security controls, rate limits, or human verification.</li>
            <li>Do not automate high-volume access without written permission.</li>
            <li>Do not use the service to harm people or violate applicable law.</li>
          </ul>
          <h2>Availability and results</h2>
          <p>The service is provided on an “as is” and “as available” basis. Automatic cutouts may be incomplete or inaccurate. We do not guarantee uninterrupted availability, a particular result, or fitness for a specific purpose.</p>
          <h2>Third-party services</h2>
          <p>Background removal is supplied by Remove.bg, and infrastructure and security services are supplied by Cloudflare. Use of the service may be affected by their availability and terms.</p>
          <h2>Fair use</h2>
          <p>We may limit or block requests to protect the service, control costs, comply with law, or prevent abuse.</p>
          <h2>Changes</h2>
          <p>These MVP terms should be reviewed with qualified counsel before commercial launch. We may update them as the product evolves.</p>
        </article>
      </div>
    </main>
  );
}
