import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('HomePage')

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e7f7ef,_transparent_55%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-6 py-16 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-5xl items-center">
        <section className="w-full rounded-[2rem] border border-white/70 bg-white/80 p-10 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-700">{t('eyebrow')}</p>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{t('description')}</p>
        </section>
      </div>
    </main>
  )
}
