import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/src/components/intranet/shell'
import { getPublishedNewsArticle } from '@/src/lib/news'

function renderParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export default async function ActualiteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getPublishedNewsArticle(slug)

  if (!article) {
    notFound()
  }

  const paragraphs = renderParagraphs(article.content)

  return (
    <AppShell activePath="/actualites" title={article.title} eyebrow={article.category.name}>
      <article className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-[#8d98ac]">
          <Link href="/actualites" className="font-bold text-[#4f46e5]">
            Retour aux actualites
          </Link>
          <span>•</span>
          <span>{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(article.publishedAt ?? new Date())}</span>
          {article.author ? (
            <>
              <span>•</span>
              <span>Par {article.author.name}</span>
            </>
          ) : null}
        </div>

        <section className="overflow-hidden rounded-[30px] border border-[#e8edf3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="relative h-[280px] sm:h-[360px] lg:h-[420px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImageUrl || article.images[0]?.url || 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1600&q=80'}
              alt={article.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.04)_0%,rgba(15,23,42,0.72)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] backdrop-blur">
                {article.category.name}
              </span>
              <h1 className="mt-4 max-w-4xl text-[34px] font-extrabold leading-tight sm:text-[42px]">{article.title}</h1>
              <p className="mt-4 max-w-3xl text-[16px] leading-8 text-white/82">{article.excerpt}</p>
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_340px]">
            <div className="p-7 sm:p-10">
              <div className="prose prose-slate max-w-none">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="mb-6 text-[17px] leading-8 text-[#314056]">
                    {paragraph}
                  </p>
                ))}
              </div>

              {article.images.length > 0 ? (
                <section className="mt-10">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Galerie</p>
                      <h2 className="mt-2 text-[24px] font-extrabold text-[#182235]">Photos de l&apos;actualite</h2>
                    </div>
                    <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
                      {article.images.length} photo{article.images.length > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {article.images.map((image) => (
                      <figure key={image.id} className="overflow-hidden rounded-[22px] border border-[#e8edf3] bg-[#fbfcfe]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt={image.alt || article.title} className="h-56 w-full object-cover" />
                        {image.caption ? (
                          <figcaption className="px-4 py-3 text-[14px] leading-6 text-[#627089]">{image.caption}</figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>

            <aside className="border-t border-[#eef2f6] bg-[#fbfcfe] p-7 lg:border-l lg:border-t-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">En bref</p>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-bold text-[#1c2537]">Categorie</p>
                  <p className="mt-1 text-[15px] text-[#6f7a8d]">{article.category.name}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1c2537]">Date de publication</p>
                  <p className="mt-1 text-[15px] text-[#6f7a8d]">
                    {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(article.publishedAt ?? new Date())}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1c2537]">Photos jointes</p>
                  <p className="mt-1 text-[15px] text-[#6f7a8d]">{article.images.length}</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </article>
    </AppShell>
  )
}
