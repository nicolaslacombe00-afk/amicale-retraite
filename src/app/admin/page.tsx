import Link from 'next/link'
import { AdminShell } from '@/src/components/admin/shell'
import { prisma } from '@/src/lib/db'

function formatDate(date: Date | null) {
  if (!date) {
    return 'Non renseigne'
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(date)
}

export default async function AdminDashboardPage() {
  const [membersCount, articlesCount, publishedArticlesCount, eventsCount, albumsCount, documentsCount, recentArticles, recentEvents] =
    await Promise.all([
      prisma.user.count(),
      prisma.newsArticle.count(),
      prisma.newsArticle.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
      prisma.event.count(),
      prisma.photoAlbum.count(),
      prisma.document.count(),
      prisma.newsArticle.findMany({
        orderBy: [{ updatedAt: 'desc' }],
        take: 5,
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.event.findMany({
        orderBy: [{ startAt: 'asc' }],
        take: 5,
        select: {
          id: true,
          title: true,
          startAt: true,
          location: true,
          status: true,
        },
      }),
    ])

  return (
    <AdminShell
      activePath="/admin"
      title="Tableau de bord"
      description="Bienvenue dans l espace d administration. Pilotez vos contenus depuis des modules dedies, avec une interface separee du site membre."
      actions={
        <>
          <Link
            href="/admin/actualites"
            className="rounded-full bg-[#0f9d6b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.2)] transition hover:bg-[#118f63]"
          >
            Nouvelle actualite
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[#d5dcea] bg-white px-5 py-3 text-sm font-extrabold text-[#223048] transition hover:bg-[#f8fafe]"
          >
            Voir le site
          </Link>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-4">
        <MetricCard value={String(articlesCount)} label="Actualites" detail={`${publishedArticlesCount} publiees`} />
        <MetricCard value={String(eventsCount)} label="Evenements" detail="Agenda administre" />
        <MetricCard value={String(albumsCount)} label="Albums photo" detail="Galeries disponibles" />
        <MetricCard value={String(documentsCount)} label="Documents" detail={`${membersCount} profils membres`} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_380px]">
        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Acces rapide</p>
              <h2 className="mt-2 text-[28px] font-black text-[#15304d]">Modules de gestion</h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <ModuleCard
              href="/admin/actualites"
              title="Actualites"
              detail="Creer, publier, mettre a la une et modifier les articles."
            />
            <ModuleCard
              href="/admin/evenements"
              title="Agenda"
              detail="Ajouter les sorties, les rendez-vous et les moments forts."
            />
            <ModuleCard
              href="/admin/membres"
              title="Annuaire & membres"
              detail="Mettre a jour les fiches, les roles et les informations de contact."
            />
            <ModuleCard
              href="/admin/galerie-photo"
              title="Galerie photo"
              detail="Constituer des albums, relier des sorties et exposer les souvenirs."
            />
            <ModuleCard
              href="/admin/documents"
              title="Documents"
              detail="Centraliser les comptes-rendus, fichiers utiles et archives."
            />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Actualites recentes</p>
            <div className="mt-5 space-y-4">
              {recentArticles.map((article) => (
                <Link key={article.id} href={`/admin/actualites/${article.id}`} className="block rounded-[20px] border border-[#edf2f7] bg-[#fbfcfe] p-4 transition hover:border-[#d7dfeb]">
                  <p className="text-[16px] font-extrabold text-[#182235]">{article.title}</p>
                  <p className="mt-2 text-sm text-[#6f7a8d]">{article.category.name}</p>
                  <p className="mt-1 text-[13px] text-[#9aa4b6]">Mise a jour le {formatDate(article.updatedAt)}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Agenda proche</p>
            <div className="mt-5 space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="rounded-[20px] border border-[#edf2f7] bg-[#fbfcfe] p-4">
                  <p className="text-[16px] font-extrabold text-[#182235]">{event.title}</p>
                  <p className="mt-2 text-sm text-[#6f7a8d]">{event.location}</p>
                  <p className="mt-1 text-[13px] text-[#9aa4b6]">
                    {formatDate(event.startAt)} · {event.status === 'UPCOMING' ? 'A venir' : 'Passe'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AdminShell>
  )
}

function MetricCard({ value, label, detail }: { value: string; label: string; detail: string }) {
  return (
    <article className="rounded-[26px] border border-[#e4ebf4] bg-white px-5 py-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#98a5b7]">{label}</p>
      <p className="mt-3 text-[38px] font-black text-[#15304d]">{value}</p>
      <p className="mt-2 text-sm text-[#738198]">{detail}</p>
    </article>
  )
}

function ModuleCard({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <Link
      href={href}
      className="rounded-[24px] border border-[#e7edf5] bg-[#fbfcfe] p-5 transition hover:-translate-y-0.5 hover:border-[#d7dfeb]"
    >
      <h3 className="text-[20px] font-extrabold text-[#182235]">{title}</h3>
      <p className="mt-3 text-[15px] leading-7 text-[#6f7a8d]">{detail}</p>
      <p className="mt-4 text-sm font-extrabold text-[#0f9d6b]">Ouvrir le module</p>
    </Link>
  )
}
