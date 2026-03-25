import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/src/components/intranet/shell'
import { deleteNewsArticleAction, updateNewsArticleAction } from '@/src/app/admin/actualites/actions'
import { getAdminNewsArticle, listAdminCategories } from '@/src/lib/news'
import { requireAdminUser } from '@/src/lib/auth/session'

export default async function AdminActualiteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  await requireAdminUser()

  const { id } = await params
  const [article, categories, query] = await Promise.all([getAdminNewsArticle(id), listAdminCategories(), searchParams])

  if (!article) {
    notFound()
  }

  const galleryValue = article.images
    .map((image) => [image.url, image.alt || '', image.caption || ''].join(' | '))
    .join('\n')

  const feedback =
    query.success === 'updated'
      ? { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Article mis a jour.' }
      : query.success === 'created'
        ? { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Article cree avec succes.' }
        : query.error === 'missing'
          ? { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner les champs obligatoires.' }
          : null

  return (
    <AppShell activePath="/admin" title="Edition d'une actualite" eyebrow="Administration">
      <div className="mx-auto max-w-[980px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Edition</p>
            <h3 className="mt-2 text-[26px] font-extrabold text-[#182235]">{article.title}</h3>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/actualites/${article.slug}`}
              className="rounded-full border border-[#d8e0ec] px-4 py-2 text-sm font-bold text-[#223048] transition hover:bg-white"
            >
              Voir l&apos;article
            </Link>
            <Link
              href="/admin/actualites"
              className="rounded-full bg-[#121b2c] px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
            >
              Retour liste
            </Link>
          </div>
        </div>

        {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

        <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:p-8">
          <form action={updateNewsArticleAction.bind(null, article.id)} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Titre</span>
              <input
                name="title"
                required
                defaultValue={article.title}
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Slug</span>
                <input
                  name="slug"
                  defaultValue={article.slug}
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Categorie</span>
                <select
                  name="categoryId"
                  required
                  defaultValue={article.categoryId}
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Resume</span>
              <textarea
                name="excerpt"
                required
                rows={3}
                defaultValue={article.excerpt}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Contenu</span>
              <textarea
                name="content"
                required
                rows={10}
                defaultValue={article.content}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Photo de couverture</span>
              <input
                name="coverImageUrl"
                defaultValue={article.coverImageUrl ?? ''}
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Galerie photos</span>
              <textarea
                name="images"
                rows={6}
                defaultValue={galleryValue}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[14px] text-[#223048] outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Statut</span>
                <select
                  name="status"
                  defaultValue={article.status}
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                >
                  <option value="PUBLISHED">Publie</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3">
                <input type="checkbox" name="featured" defaultChecked={article.featured} className="h-4 w-4" />
                <span className="text-sm font-bold text-[#2b3446]">Article a la une</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                className="rounded-2xl bg-[#0f9d6b] px-5 py-3 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
              >
                Enregistrer les modifications
              </button>
            </div>
          </form>

          <form action={deleteNewsArticleAction.bind(null, article.id)} className="mt-3">
            <button
              type="submit"
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-[15px] font-extrabold text-red-700 transition hover:bg-red-100"
            >
              Supprimer l&apos;article
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  )
}
