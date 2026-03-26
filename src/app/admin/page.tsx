import Link from 'next/link'
import type { ReactNode } from 'react'
import { AppShell } from '@/src/components/intranet/shell'
import {
  createEventAction,
  createPhotoAlbumAction,
  deleteDocumentAction,
  deleteEventAction,
  deletePhotoAlbumAction,
  updateMemberAction,
  uploadAdminDocumentAction,
} from '@/src/app/admin/actions'
import { createNewsArticleAction, deleteNewsArticleAction } from '@/src/app/admin/actualites/actions'
import { requireAdminUser } from '@/src/lib/auth/session'
import { prisma } from '@/src/lib/db'

const sectionMeta = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'actualites', label: 'Actualites' },
  { id: 'evenements', label: 'Evenements' },
  { id: 'membres', label: 'Membres' },
  { id: 'galerie', label: 'Galerie photo' },
  { id: 'documents', label: 'Documents' },
] as const

function formatDate(date: Date | null) {
  if (!date) {
    return 'Non planifie'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(date)
}

function feedbackFromParams(params: { success?: string; error?: string }) {
  const successMessages: Record<string, string> = {
    'article-created': 'Nouvelle actualite creee dans le back-office.',
    'article-deleted': 'Actualite supprimee.',
    'event-created': 'Evenement ajoute a l agenda.',
    'event-deleted': 'Evenement retire.',
    'member-updated': 'Profil membre mis a jour.',
    'album-created': 'Album photo ajoute.',
    'album-deleted': 'Album photo supprime.',
    'document-uploaded': 'Document televerse dans la bibliotheque.',
    'document-deleted': 'Document supprime.',
  }

  const errorMessages: Record<string, string> = {
    missing: 'Merci de renseigner les champs obligatoires avant de valider.',
  }

  if (params.success && successMessages[params.success]) {
    return {
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      message: successMessages[params.success],
    }
  }

  if (params.error && errorMessages[params.error]) {
    return {
      tone: 'border-red-200 bg-red-50 text-red-700',
      message: errorMessages[params.error],
    }
  }

  return null
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; success?: string; error?: string }>
}) {
  await requireAdminUser()

  const [
    params,
    members,
    articles,
    categories,
    events,
    albums,
    documents,
    membersCount,
    publishedArticlesCount,
  ] = await Promise.all([
    searchParams,
    prisma.user.findMany({
      orderBy: [{ name: 'asc' }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        city: true,
        phone: true,
        formerJobTitle: true,
        formerDepartment: true,
        bio: true,
        avatarUrl: true,
        joinedAmicaleAt: true,
      },
    }),
    prisma.newsArticle.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            images: true,
          },
        },
      },
    }),
    prisma.newsCategory.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    }),
    prisma.event.findMany({
      orderBy: [{ startAt: 'asc' }],
      select: {
        id: true,
        title: true,
        summary: true,
        location: true,
        startAt: true,
        endAt: true,
        status: true,
      },
    }),
    prisma.photoAlbum.findMany({
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        event: {
          select: {
            title: true,
          },
        },
        _count: {
          select: {
            photos: true,
          },
        },
      },
    }),
    prisma.document.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.user.count(),
    prisma.newsArticle.count({
      where: {
        status: 'PUBLISHED',
      },
    }),
  ])

  const activeSection = sectionMeta.some((section) => section.id === params.section) ? params.section : 'overview'
  const feedback = feedbackFromParams(params)

  return (
    <AppShell activePath="/admin" title="Administration" eyebrow="Back-office global">
      <div className="space-y-8">
        <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#161f30_0%,#24344d_55%,#335777_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="p-7 sm:p-9 xl:p-10">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-emerald-300/80">
                Console de pilotage
              </p>
              <h2 className="mt-4 max-w-2xl text-[34px] font-extrabold leading-tight sm:text-[40px]">
                Un vrai back-office unique pour administrer tous les contenus de l&apos;amicale.
              </h2>
              <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/78">
                Depuis cette page, vous pilotez l&apos;editorial, l&apos;agenda, l&apos;annuaire, la galerie photo et
                la bibliotheque documentaire sans changer d&apos;univers.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/actualites"
                  className="rounded-full bg-white px-6 py-3 text-[15px] font-extrabold text-[#162236] transition hover:bg-slate-100"
                >
                  Voir l&apos;intranet
                </Link>
                <a
                  href={`#${activeSection}`}
                  className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-[15px] font-extrabold text-white transition hover:bg-white/15"
                >
                  Aller a la section active
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/6 p-7 backdrop-blur sm:p-8">
              <AdminStatCard value={String(publishedArticlesCount)} label="Articles publies" />
              <AdminStatCard value={String(events.length)} label="Evenements" />
              <AdminStatCard value={String(albums.length)} label="Albums photo" />
              <AdminStatCard value={String(membersCount)} label="Profils membres" />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-[#ececec] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap gap-3">
            {sectionMeta.map((section) => {
              const isActive = section.id === activeSection

              return (
                <Link
                  key={section.id}
                  href={`/admin?section=${section.id}#${section.id}`}
                  className={`rounded-full px-4 py-2.5 text-sm font-extrabold transition ${
                    isActive ? 'bg-[#121b2c] text-white' : 'bg-[#f4f7fb] text-[#445066] hover:bg-[#e9eef6]'
                  }`}
                >
                  {section.label}
                </Link>
              )
            })}
          </div>
        </section>

        {feedback ? (
          <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div>
        ) : null}

        <section id="overview" className="grid gap-6 xl:grid-cols-4">
          <MetricPanel label="Actualites" value={String(articles.length)} detail={`${publishedArticlesCount} en ligne`} />
          <MetricPanel
            label="Evenements a venir"
            value={String(events.filter((event) => event.status === 'UPCOMING').length)}
            detail={`${events.length} evenements geres`}
          />
          <MetricPanel label="Albums photo" value={String(albums.length)} detail="Souvenirs publies" />
          <MetricPanel label="Documents" value={String(documents.length)} detail="Bibliotheque partagee" />
        </section>

        <section
          id="actualites"
          className="grid gap-8 rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:grid-cols-[minmax(0,1.15fr)_420px] xl:p-8"
        >
          <div>
            <SectionHeader
              eyebrow="Editorial"
              title="Actualites"
              description="Organisez votre ligne editoriale depuis le back-office, puis ouvrez les articles a la une ou les brouillons en detail."
            />

            <div className="mt-6 space-y-4">
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
                      <h3 className="text-[20px] font-extrabold text-[#182235]">{article.title}</h3>
                      <p className="mt-2 text-sm text-[#6f7a8d]">
                        {article.category.name} · {article._count.images} photo{article._count.images > 1 ? 's' : ''} ·
                        Mis a jour le {formatDate(article.updatedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/actualites/${article.id}`}
                        className="rounded-full bg-[#121b2c] px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
                      >
                        Editer
                      </Link>
                      <Link
                        href={`/actualites/${article.slug}`}
                        className="rounded-full border border-[#d8e0ec] px-4 py-2 text-sm font-bold text-[#223048] transition hover:bg-white"
                      >
                        Voir
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
          </div>

          <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] p-5">
            <h3 className="text-[22px] font-extrabold text-[#182235]">Ajouter une actualite</h3>
            <form action={createNewsArticleAction} className="mt-5 space-y-4">
              <input type="hidden" name="returnTo" value="/admin?section=actualites" />

              <Field label="Titre" name="title" required placeholder="Retour sur notre dejeuner annuel" />
              <Field label="Slug optionnel" name="slug" placeholder="retour-dejeuner-annuel" />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Categorie</span>
                <select
                  name="categoryId"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-white px-4 text-[15px] text-[#223048] outline-none"
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

              <TextArea
                label="Resume"
                name="excerpt"
                required
                rows={3}
                placeholder="Deux ou trois phrases pour presenter l article."
              />
              <TextArea
                label="Contenu"
                name="content"
                required
                rows={7}
                placeholder="Redigez ici votre actualite."
              />
              <Field label="Photo de couverture" name="coverImageUrl" placeholder="https://..." />
              <TextArea
                label="Galerie photos"
                name="images"
                rows={4}
                placeholder={'https://... | Groupe | Accueil\nhttps://... | Salle | Discours'}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-[#2b3446]">Statut</span>
                  <select
                    name="status"
                    defaultValue="PUBLISHED"
                    className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-white px-4 text-[15px] text-[#223048] outline-none"
                  >
                    <option value="PUBLISHED">Publie</option>
                    <option value="DRAFT">Brouillon</option>
                  </select>
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-[#dde3ec] bg-white px-4 py-3">
                  <input type="checkbox" name="featured" className="h-4 w-4" />
                  <span className="text-sm font-bold text-[#2b3446]">Mettre a la une</span>
                </label>
              </div>

              <PrimaryButton>Publier l actualite</PrimaryButton>
            </form>
          </div>
        </section>

        <section
          id="evenements"
          className="grid gap-8 rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:grid-cols-[minmax(0,1.15fr)_420px] xl:p-8"
        >
          <div>
            <SectionHeader
              eyebrow="Agenda"
              title="Evenements"
              description="Animez l agenda de l amicale et gardez un historique des rendez-vous deja passes."
            />

            <div className="mt-6 space-y-4">
              {events.map((event) => (
                <article key={event.id} className="rounded-[22px] border border-[#ebeff5] bg-[#fbfcfe] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                            event.status === 'UPCOMING'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {event.status === 'UPCOMING' ? 'A venir' : 'Passe'}
                        </span>
                      </div>
                      <h3 className="text-[20px] font-extrabold text-[#182235]">{event.title}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-[#6f7a8d]">{event.summary}</p>
                      <p className="mt-2 text-sm text-[#98a1b2]">
                        {formatDate(event.startAt)} · {event.location}
                      </p>
                    </div>

                    <form action={deleteEventAction.bind(null, event.id, '/admin?section=evenements')}>
                      <button
                        type="submit"
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] p-5">
            <h3 className="text-[22px] font-extrabold text-[#182235]">Programmer un evenement</h3>
            <form action={createEventAction} className="mt-5 space-y-4">
              <input type="hidden" name="returnTo" value="/admin?section=evenements" />

              <Field label="Titre" name="title" required placeholder="Sortie culturelle de printemps" />
              <TextArea label="Resume" name="summary" required rows={3} placeholder="Quelques lignes pour l agenda." />
              <TextArea
                label="Description"
                name="description"
                required
                rows={5}
                placeholder="Informations pratiques, deroule, contacts."
              />
              <Field label="Lieu" name="location" required placeholder="Rodez, salle de reunion" />
              <Field label="Image de couverture" name="coverImageUrl" placeholder="https://..." />
              <Field label="Debut" name="startAt" required type="datetime-local" />
              <Field label="Fin" name="endAt" type="datetime-local" />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Statut</span>
                <select
                  name="status"
                  defaultValue="UPCOMING"
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-white px-4 text-[15px] text-[#223048] outline-none"
                >
                  <option value="UPCOMING">A venir</option>
                  <option value="COMPLETED">Passe</option>
                </select>
              </label>

              <PrimaryButton>Ajouter a l agenda</PrimaryButton>
            </form>
          </div>
        </section>

        <section
          id="membres"
          className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:p-8"
        >
          <SectionHeader
            eyebrow="Annuaire"
            title="Membres"
            description="Mettez a jour les profils, les roles et les informations de contact directement depuis le back-office."
          />

          <div className="mt-6 space-y-4">
            {members.map((member) => (
              <details
                key={member.id}
                className="rounded-[22px] border border-[#ebeff5] bg-[#fbfcfe] p-5"
                open={params.section === 'membres'}
              >
                <summary className="flex cursor-pointer list-none flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                          member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {member.role === 'ADMIN' ? 'Admin' : 'Membre'}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                          member.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {member.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    <h3 className="text-[20px] font-extrabold text-[#182235]">{member.name}</h3>
                    <p className="mt-1 text-sm text-[#6f7a8d]">
                      {member.email} · {member.city || 'Ville non renseignee'}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-[#4f46e5]">Ouvrir l edition</span>
                </summary>

                <form action={updateMemberAction.bind(null, member.id)} className="mt-5 grid gap-4 border-t border-[#e7ecf3] pt-5 xl:grid-cols-2">
                  <input type="hidden" name="returnTo" value="/admin?section=membres" />

                  <Field label="Nom" name="name" defaultValue={member.name} required />
                  <Field label="Email" name="email" type="email" defaultValue={member.email} required />
                  <Field label="Ville" name="city" defaultValue={member.city ?? ''} />
                  <Field label="Telephone" name="phone" defaultValue={member.phone ?? ''} />
                  <Field label="Ancien poste" name="formerJobTitle" defaultValue={member.formerJobTitle ?? ''} />
                  <Field label="Ancien service" name="formerDepartment" defaultValue={member.formerDepartment ?? ''} />
                  <Field label="Avatar URL" name="avatarUrl" defaultValue={member.avatarUrl ?? ''} />
                  <Field
                    label="Date d adhesion"
                    name="joinedAmicaleAt"
                    type="date"
                    defaultValue={member.joinedAmicaleAt ? member.joinedAmicaleAt.toISOString().slice(0, 10) : ''}
                  />

                  <div className="xl:col-span-2">
                    <TextArea
                      label="Biographie"
                      name="bio"
                      rows={4}
                      defaultValue={member.bio ?? ''}
                      placeholder="Quelques lignes pour presenter le membre."
                    />
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[#2b3446]">Role</span>
                    <select
                      name="role"
                      defaultValue={member.role}
                      className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-white px-4 text-[15px] text-[#223048] outline-none"
                    >
                      <option value="USER">Membre</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-[#dde3ec] bg-white px-4 py-3">
                    <input type="checkbox" name="isActive" defaultChecked={member.isActive} className="h-4 w-4" />
                    <span className="text-sm font-bold text-[#2b3446]">Profil actif</span>
                  </label>

                  <div className="xl:col-span-2 flex flex-wrap gap-3">
                    <PrimaryButton>Enregistrer le profil</PrimaryButton>
                    <Link
                      href={`/membres/${member.id}`}
                      className="rounded-2xl border border-[#d8e0ec] px-5 py-3 text-[15px] font-extrabold text-[#223048] transition hover:bg-white"
                    >
                      Voir la fiche
                    </Link>
                  </div>
                </form>
              </details>
            ))}
          </div>
        </section>

        <section
          id="galerie"
          className="grid gap-8 rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:grid-cols-[minmax(0,1.15fr)_420px] xl:p-8"
        >
          <div>
            <SectionHeader
              eyebrow="Souvenirs"
              title="Galerie photo"
              description="Constituez des albums relies a un evenement ou a un moment fort, puis exposez les photos dans la galerie publique."
            />

            <div className="mt-6 space-y-4">
              {albums.map((album) => (
                <article key={album.id} className="rounded-[22px] border border-[#ebeff5] bg-[#fbfcfe] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[20px] font-extrabold text-[#182235]">{album.title}</h3>
                      <p className="mt-2 text-[15px] leading-7 text-[#6f7a8d]">{album.summary}</p>
                      <p className="mt-2 text-sm text-[#98a1b2]">
                        {album.event?.title || 'Album libre'} · {album._count.photos} photo{album._count.photos > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/galerie-photo/${album.slug}`}
                        className="rounded-full border border-[#d8e0ec] px-4 py-2 text-sm font-bold text-[#223048] transition hover:bg-white"
                      >
                        Voir
                      </Link>
                      <form action={deletePhotoAlbumAction.bind(null, album.id, '/admin?section=galerie')}>
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
          </div>

          <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] p-5">
            <h3 className="text-[22px] font-extrabold text-[#182235]">Nouvel album</h3>
            <form action={createPhotoAlbumAction} className="mt-5 space-y-4">
              <input type="hidden" name="returnTo" value="/admin?section=galerie" />

              <Field label="Titre" name="title" required placeholder="Sortie d automne a Laguiole" />
              <TextArea label="Resume" name="summary" required rows={4} placeholder="Presentez rapidement l album." />
              <Field label="Image de couverture" name="coverImageUrl" placeholder="https://..." />

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Evenement lie</span>
                <select
                  name="eventId"
                  defaultValue=""
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-white px-4 text-[15px] text-[#223048] outline-none"
                >
                  <option value="">Aucun evenement</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title}
                    </option>
                  ))}
                </select>
              </label>

              <TextArea
                label="Photos"
                name="photos"
                rows={5}
                placeholder={'https://... | Photo de groupe | Depart du car\nhttps://... | Visite | Groupe dans le musee'}
              />

              <PrimaryButton>Creer l album</PrimaryButton>
            </form>
          </div>
        </section>

        <section
          id="documents"
          className="grid gap-8 rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:grid-cols-[minmax(0,1.15fr)_420px] xl:p-8"
        >
          <div>
            <SectionHeader
              eyebrow="Bibliotheque"
              title="Documents"
              description="Partagez les comptes-rendus, formulaires et supports utiles sans quitter le back-office."
            />

            <div className="mt-6 space-y-4">
              {documents.map((document) => (
                <article key={document.id} className="rounded-[22px] border border-[#ebeff5] bg-[#fbfcfe] p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-[20px] font-extrabold text-[#182235]">{document.title}</h3>
                      {document.description ? (
                        <p className="mt-2 text-[15px] leading-7 text-[#6f7a8d]">{document.description}</p>
                      ) : null}
                      <p className="mt-2 text-sm text-[#98a1b2]">
                        {document.fileName} · Depose par {document.uploadedBy.name} le {formatDate(document.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={document.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-[#d8e0ec] px-4 py-2 text-sm font-bold text-[#223048] transition hover:bg-white"
                      >
                        Ouvrir
                      </a>
                      <form action={deleteDocumentAction.bind(null, document.id, '/admin?section=documents')}>
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
          </div>

          <div className="rounded-[24px] border border-[#eef2f7] bg-[#fbfcfe] p-5">
            <h3 className="text-[22px] font-extrabold text-[#182235]">Televerser un document</h3>
            <form action={uploadAdminDocumentAction} className="mt-5 space-y-4">
              <input type="hidden" name="returnTo" value="/admin?section=documents" />
              <Field label="Titre" name="title" required placeholder="Compte-rendu du bureau" />
              <TextArea
                label="Description"
                name="description"
                rows={4}
                placeholder="Quelques mots sur ce document."
              />
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Fichier</span>
                <input
                  type="file"
                  name="file"
                  required
                  className="block w-full rounded-2xl border border-[#dde3ec] bg-white px-4 py-3 text-[15px] text-[#223048] outline-none"
                />
              </label>
              <PrimaryButton>Ajouter le document</PrimaryButton>
            </form>
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">{eyebrow}</p>
      <h2 className="mt-2 text-[28px] font-extrabold text-[#182235]">{title}</h2>
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#6f7a8d]">{description}</p>
    </div>
  )
}

function AdminStatCard({ value, label }: { value: string; label: string }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <span className="mb-2 block text-[32px] font-black text-white">{value}</span>
      <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/62">{label}</span>
    </article>
  )
}

function MetricPanel({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-[24px] border border-[#ececec] bg-white px-5 py-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#99a3b4]">{label}</p>
      <p className="mt-3 text-[34px] font-black text-[#182235]">{value}</p>
      <p className="mt-1 text-sm text-[#6f7a8d]">{detail}</p>
    </article>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  placeholder,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-white px-4 text-[15px] text-[#223048] outline-none"
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
  defaultValue,
}: {
  label: string
  name: string
  rows: number
  required?: boolean
  placeholder?: string
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full rounded-2xl border border-[#dde3ec] bg-white px-4 py-3 text-[15px] text-[#223048] outline-none"
      />
    </label>
  )
}

function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="w-full rounded-2xl bg-[#0f9d6b] px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
    >
      {children}
    </button>
  )
}
