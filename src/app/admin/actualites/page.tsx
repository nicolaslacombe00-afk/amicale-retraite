import Link from 'next/link'
import { AdminShell } from '@/src/components/admin/shell'
import { createNewsArticleAction, deleteNewsArticleAction } from '@/src/app/admin/actualites/actions'
import { listAdminCategories, listAdminNewsArticles } from '@/src/lib/news'

function feedbackFromParams(params: { error?: string; success?: string }) {
  if (params.success === 'article-created') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Article cree avec succes.' }
  }

  if (params.success === 'article-deleted') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Article supprime.' }
  }

  if (params.error === 'missing') {
    return { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner les champs obligatoires.' }
  }

  return null
}

export default async function AdminActualitesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [categories, articles, params] = await Promise.all([
    listAdminCategories(),
    listAdminNewsArticles(),
    searchParams,
  ])

  const feedback = feedbackFromParams(params)

  return (
    <AdminShell
      activePath="/admin/actualites"
      title="Actualites"
      description="Gerez l editorial de l amicale avec une vue dediee aux articles, aux statuts et a la mise en avant."
      actions={
        <Link
          href="#nouvel-article"
          className="rounded-full bg-[#0f9d6b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.2)] transition hover:bg-[#118f63]"
        >
          Nouvel article
        </Link>
      }
    >
      {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.18fr)_420px]">
        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Liste editoriale</p>
              <h2 className="mt-2 text-[28px] font-black text-[#15304d]">Articles publies et brouillons</h2>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {articles.length} article{articles.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {articles.map((article) => (
              <article key={article.id} className="rounded-[24px] border border-[#ecf1f6] bg-[#fbfcfe] p-5">
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
                    <h3 className="text-[20px] font-extrabold text-[#182235]">{article.title}</h3>
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
                      Editer
                    </Link>
                    <form action={deleteNewsArticleAction.bind(null, article.id)}>
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="nouvel-article"
          className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Creation</p>
          <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Nouvel article</h3>
          <p className="mt-3 text-[15px] leading-7 text-[#6f7a8d]">
            Ajoutez un article, sa categorie et une petite galerie photo. Format galerie : une ligne par photo `url | alt | legende`.
          </p>

          <form action={createNewsArticleAction} className="mt-6 space-y-4">
            <input type="hidden" name="returnTo" value="/admin/actualites" />

            <Field label="Titre" name="title" required placeholder="Retour sur notre sortie printaniere" />
            <Field label="Slug optionnel" name="slug" placeholder="retour-sortie-printaniere" />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Categorie</span>
              <select
                name="categoryId"
                required
                defaultValue=""
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
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

            <TextArea label="Resume" name="excerpt" required rows={3} placeholder="Deux ou trois phrases d introduction." />
            <TextArea label="Contenu" name="content" required rows={8} placeholder="Le corps de l article." />
            <Field label="Photo de couverture" name="coverImageUrl" placeholder="https://..." />
            <TextArea
              label="Galerie photos"
              name="images"
              rows={5}
              placeholder={'https://... | Groupe devant la salle | Pot de bienvenue\nhttps://... | Vue de la table | Discours du president'}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Statut</span>
                <select
                  name="status"
                  defaultValue="PUBLISHED"
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
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
              Enregistrer l article
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  )
}

function Field({
  label,
  name,
  required = false,
  placeholder,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
      />
    </label>
  )
}

function TextArea({
  label,
  name,
  rows,
  required = false,
  placeholder,
}: {
  label: string
  name: string
  rows: number
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
      />
    </label>
  )
}
