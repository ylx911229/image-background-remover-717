import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-5 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.06em] text-slate-950">Nothing to cut out here.</h1>
        <p className="mt-4 text-slate-600">The page you requested does not exist.</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-slate-950 px-6 py-3 font-bold text-white hover:bg-emerald-600">Return home</Link>
      </div>
    </main>
  );
}
