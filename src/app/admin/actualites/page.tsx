import Link from 'next/link'
import { AppShell } from '@/src/components/intranet/shell'
import { createNewsArticleAction } from '@/src/app/admin/actualites/actions'
import { listAdminCategories, listAdminNewsArticles } from '@/src/lib/news'
import { requireAdminUser } from '@/src/lib/auth/session'

export default async function AdminActualitesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  await requireAdminUser()

  const [categories, articles, params] = await Promise.all([
    listAdminCategories(),
    listAdminNewsArticles(),
    searchParams,
  ])

  const feedback =
    params.success === 'deleted'
      ? { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Article supprime avec succes.' }
      : params.error === 'missing'
        ? { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner les champs obligatoires.' }
        : null

  return (
    <AppShell activePath="/admin" title="Gestion des actualites" eyebrow="Administration">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_420px]">
        <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Editorial</p>
              <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Articles publies et brouillons</h3>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {articles.length} article{articles.length > 1 ? 's' : ''}
            </div>
          </div>

          {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

          <div className="space-y-4">
            {articles.map((article) => (
              <article
                key={article.id}
                className="rounded-[22px] border border-[#ebeff5] bg-[#fbfcfe] p-5 transition hover:border-[#d9e0ec]"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                          article.status === 'PUBLISHED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {article.status === 'PUBLISHED' ? 'Publie' : 'Brouillon'}
                      </span>
                      {article.featured ? (
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-indigo-700">
                          A la une
                        </span>
                      ) : null}
                    </div>
                    <h4 className="text-[19px] font-extrabold text-[#1a2334]">{article.title}</h4>
                    <p className="mt-2 text-sm text-[#6f7a8d]">
                      {article.category.name} · {article.imageCount} photo{article.imageCount > 1 ? 's' : ''} · Mis a jour le{' '}
                      {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(article.updatedAt)}
                    </p>
                    <p className="mt-1 text-sm text-[#98a1b2]">/{article.slug}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/actualites/${article.slug}`}
                      className="rounded-full border border-[#d8e0ec] px-4 py-2 text-sm font-bold text-[#223048] transition hover:bg-white"
                    >
                      Voir
                    </Link>
                    <Link
                      href={`/admin/actualites/${article.id}`}
                      className="rounded-full bg-[#121b2c] px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
                    >
                      Modifier
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Nouvel article</p>
          <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Publier une actualite</h3>
          <p className="mt-3 text-[15px] leading-7 text-[#6f7a8d]">
            Ajoutez un article, sa categorie et une petite galerie photo. Format galerie: une ligne par photo `url | alt | legende`.
          </p>

          <form action={createNewsArticleAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Titre</span>
              <input
                name="title"
                required
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                placeholder="Ex: Retour sur notre sortie printaniere"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Slug optionnel</span>
              <input
                name="slug"
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                placeholder="retour-sortie-printaniere"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Categorie</span>
              <select
                name="categoryId"
                required
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Choisir une categorie
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Resume</span>
              <textarea
                name="excerpt"
                required
                rows={3}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
                placeholder="Deux ou trois phrases qui donnent envie d'ouvrir l'article."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Contenu</span>
              <textarea
                name="content"
                required
                rows={8}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
                placeholder="Le corps de l'article. Separez les paragraphes avec une ligne vide."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Photo de couverture</span>
              <input
                name="coverImageUrl"
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                placeholder="https://..."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Galerie photos</span>
              <textarea
                name="images"
                rows={5}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[14px] text-[#223048] outline-none"
                placeholder={'https://... | Groupe devant la salle | Pot de bienvenue\nhttps://... | Vue de la table | Discours du president'}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Statut</span>
                <select
                  name="status"
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                  defaultValue="PUBLISHED"
                >
                  <option value="PUBLISHED">Publie</option>
                  <option value="DRAFT">Brouillon</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3">
                <input type="checkbox" name="featured" className="h-4 w-4" />
                <span className="text-sm font-bold text-[#2b3446]">Mettre a la une</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f9d6b] px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
            >
              Enregistrer l&apos;article
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  )
}
