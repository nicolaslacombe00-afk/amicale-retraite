import Link from 'next/link'
import { AppShell, QuickLinkCard, EventCardView } from '@/src/components/intranet/shell'
import { events, quickLinks } from '@/src/components/intranet/data'

export default function HomePage() {
  return (
    <AppShell activePath="/">
      <section className="mb-10 rounded-[28px] bg-[#00553d] px-6 py-8 text-white shadow-[0_18px_40px_rgba(15,23,42,0.12)] sm:px-10 lg:min-h-[220px] lg:py-0 xl:rounded-[34px] xl:px-12 xl:min-h-[240px]">
        <div className="relative flex h-full items-center overflow-hidden rounded-[28px] xl:rounded-[34px]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,85,61,0.96)_0%,rgba(0,85,61,0.93)_44%,rgba(0,85,61,0.75)_100%)]" />
          <div
            className="absolute inset-0 bg-center bg-cover opacity-18"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&w=1600&q=80')",
            }}
          />
          <div className="relative z-10 py-10">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-[36px] xl:text-[38px]">
              Bonjour Jean-Pierre <span className="inline-block">👋</span>
            </h1>
            <p className="mt-3 max-w-3xl text-[16px] leading-7 text-white/75 xl:text-[18px] xl:leading-8">
              Heureux de vous revoir. Voici l&apos;actualite de votre communaute.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((link) => (
          <QuickLinkCard key={link.title} link={link} />
        ))}
      </section>

      <section className="mb-8">
        <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[22px] font-extrabold tracking-tight text-[#131c2d] xl:text-[26px]">
            A venir prochainement
          </h2>
          <Link
            href="/actualites"
            className="inline-flex items-center text-[15px] font-extrabold text-[#4f46e5] transition hover:text-[#4338ca] xl:text-[16px]"
          >
            Aller au fil de l&apos;amicale
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {events.map((event) => (
            <EventCardView key={event.title} event={event} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,380px)]">
        <article className="rounded-[24px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:rounded-[28px] xl:p-8">
          <p className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8f98aa]">Suite du contenu</p>
          <h3 className="text-[22px] font-extrabold text-[#182235]">Le fil de l&apos;amicale continue sur une page dediee</h3>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6f7a8d] xl:text-[16px] xl:leading-8">
            Pour garder un accueil plus clair et plus respirant, les actualites, le mot du president, les nouveaux
            membres et les chiffres cles sont maintenant regroupes sur une page separee.
          </p>
          <div className="mt-6">
            <Link
              href="/actualites"
              className="inline-flex items-center rounded-2xl bg-[#121b2c] px-6 py-3 text-[15px] font-extrabold text-white transition hover:bg-black"
            >
              Ouvrir la page Actualites
            </Link>
          </div>
        </article>

        <article className="overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#5146e5_0%,#4a39d5_100%)] p-7 text-white shadow-[0_18px_40px_rgba(79,70,229,0.18)] xl:rounded-[32px] xl:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/60">Vue d&apos;ensemble</p>
          <h3 className="mt-3 text-[24px] font-extrabold">Accueil simplifie, navigation clarifiee</h3>
          <p className="mt-4 text-[16px] leading-8 text-white/90">
            Cette page se concentre maintenant sur les actions rapides et l&apos;agenda, avec une structure plus stable
            sur toutes les largeurs d&apos;ecran.
          </p>
        </article>
      </section>
    </AppShell>
  )
}
