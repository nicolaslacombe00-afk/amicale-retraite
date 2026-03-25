import Link from 'next/link'
import { AppShell, PresidentCard, WelcomeCard, StatsGrid } from '@/src/components/intranet/shell'
import { newcomers, statCards } from '@/src/components/intranet/data'
import { listNewsCategories, listPublishedNews } from '@/src/lib/news'

function buildFilterHref(category: string | undefined, query: string | undefined) {
  const params = new URLSearchParams()

  if (category) {
    params.set('category', category)
  }

  if (query) {
    params.set('q', query)
  }

  const suffix = params.toString()
  return suffix ? `/actualites?${suffix}` : '/actualites'
}

export default async function ActualitesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() || ''
  const [categories, articles] = await Promise.all([
    listNewsCategories(),
    listPublishedNews({ categorySlug: params.category, query }),
  ])

  const featuredArticle = articles[0] ?? null
  const secondaryArticles = featuredArticle ? articles.slice(1) : articles
  const featuredImageUrl = featuredArticle
    ? featuredArticle.coverImageUrl ||
      (featuredArticle.category.slug === 'evenements'
        ? 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80'
        : 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80')
    : null

  return (
    <AppShell activePath="/actualites" title="Actualites" eyebrow="Vie de l'amicale">
      <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,1.75fr)_360px] 2xl:gap-10">
        <section>
          <div className="mb-8 overflow-hidden rounded-[30px] bg-[linear-gradient(140deg,#172338_0%,#243652_60%,#32516b_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
            <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="p-7 sm:p-9 xl:p-10">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-300/80">Fil de l&apos;amicale</p>
                <h2 className="mt-4 max-w-2xl text-[32px] font-extrabold leading-tight sm:text-[38px]">
                  Des actualites vivantes, des photos et un fil plus simple a suivre.
                </h2>
                <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/78">
                  Retrouvez les rendez-vous, les compte-rendus, les moments forts de la vie de l&apos;amicale et
                  consultez les galeries photo associees.
                </p>

                <form action="/actualites" className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="text"
                    name="q"
                    defaultValue={query}
                    placeholder="Rechercher une actualite, un mot-cle..."
                    className="h-12 flex-1 rounded-full border border-white/15 bg-white/10 px-5 text-[15px] text-white outline-none placeholder:text-white/45"
                  />
                  {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
                  <button
                    type="submit"
                    className="rounded-full bg-white px-6 py-3 text-[15px] font-extrabold text-[#162236] transition hover:bg-slate-100"
                  >
                    Rechercher
                  </button>
                </form>
              </div>

              {featuredArticle ? (
                <Link href={`/actualites/${featuredArticle.slug}`} className="group relative block min-h-[260px] bg-[#1a2334]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImageUrl!}
                    alt={featuredArticle.title}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.82)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white backdrop-blur">
                      A la une
                    </span>
                    <h3 className="mt-4 text-[24px] font-extrabold leading-tight text-white">{featuredArticle.title}</h3>
                    <p className="mt-3 max-w-xl text-[15px] leading-7 text-white/80">{featuredArticle.excerpt}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex min-h-[260px] items-center justify-center bg-[radial-gradient(circle_at_top,#eaf0ff_0%,#dce7fb_42%,#f8fafc_100%)] p-8 text-center text-[#51607b]">
                  Les premieres actualites apparaitront ici des qu&apos;un article sera publie.
                </div>
              )}
            </div>
          </div>

          <div className="mb-7 flex flex-wrap gap-3">
            <Link
              href={buildFilterHref(undefined, query || undefined)}
              className={`rounded-full px-5 py-2.5 text-[15px] font-extrabold transition ${
                !params.category ? 'bg-[#121b2c] text-white shadow-sm' : 'border border-[#d9dee7] bg-white text-[#556074]'
              }`}
            >
              Toutes
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={buildFilterHref(category.slug, query || undefined)}
                className={`rounded-full px-5 py-2.5 text-[15px] font-extrabold transition ${
                  params.category === category.slug
                    ? 'bg-[#121b2c] text-white shadow-sm'
                    : 'border border-[#d9dee7] bg-white text-[#556074]'
                }`}
              >
                {category.name} <span className="text-[13px] opacity-65">({category.count})</span>
              </Link>
            ))}
          </div>

          {articles.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#d9dee7] bg-white px-6 py-10 text-center text-[#6f7a8d]">
              Aucun article ne correspond a ce filtre pour le moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {secondaryArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/actualites/${article.slug}`}
                  className="group overflow-hidden rounded-[26px] border border-[#ececec] bg-white shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-1"
                >
                  <div className="relative h-52 bg-[#f1f5f9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={article.coverImageUrl || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'}
                      alt={article.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#182235]">
                      {article.category.name}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-3 text-[13px] font-medium text-[#94a0b3]">
                      {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(article.publishedAt)}
                    </div>
                    <h3 className="text-[22px] font-extrabold leading-tight text-[#1a2334] transition group-hover:text-indigo-600">
                      {article.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-7 text-[#6f7a8d]">{article.excerpt}</p>
                    <div className="mt-5 text-sm font-extrabold text-[#4f46e5]">
                      Lire l&apos;article{article.imageCount ? ` · ${article.imageCount} photo${article.imageCount > 1 ? 's' : ''}` : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-8">
          <PresidentCard />
          <WelcomeCard newcomers={newcomers} />
          <StatsGrid stats={statCards} />
        </div>
      </div>
    </AppShell>
  )
}
