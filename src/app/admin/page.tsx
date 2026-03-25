import Link from 'next/link'
import { prisma } from '@/src/lib/db'
import { AppShell } from '@/src/components/intranet/shell'
import { requireAdminUser } from '@/src/lib/auth/session'

export default async function AdminPage() {
  await requireAdminUser()

  const [membersCount, articlesCount, publishedArticlesCount, categoriesCount] = await Promise.all([
    prisma.user.count(),
    prisma.newsArticle.count(),
    prisma.newsArticle.count({
      where: {
        status: 'PUBLISHED',
      },
    }),
    prisma.newsCategory.count(),
  ])

  return (
    <AppShell activePath="/admin" title="Administration" eyebrow="Back-office">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,380px)]">
        <section className="overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#161f30_0%,#24344d_60%,#34506b_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="p-7 sm:p-9 xl:p-10">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-emerald-300/80">Pilotage</p>
              <h2 className="mt-4 max-w-2xl text-[34px] font-extrabold leading-tight sm:text-[40px]">
                Un back-office unique pour administrer l&apos;intranet.
              </h2>
              <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/78">
                Vous etes connecte en tant qu&apos;administrateur. Depuis cet espace, vous pilotez les actualites et
                vous pouvez faire evoluer les futurs modules de gestion au meme endroit.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/admin/actualites"
                  className="rounded-full bg-white px-6 py-3 text-[15px] font-extrabold text-[#162236] transition hover:bg-slate-100"
                >
                  Gerer les actualites
                </Link>
                <Link
                  href="/actualites"
                  className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-[15px] font-extrabold text-white transition hover:bg-white/15"
                >
                  Voir le site public
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-white/6 p-7 backdrop-blur sm:p-8">
              <AdminStatCard value={String(publishedArticlesCount)} label="Articles publies" />
              <AdminStatCard value={String(articlesCount)} label="Articles total" />
              <AdminStatCard value={String(categoriesCount)} label="Categories" />
              <AdminStatCard value={String(membersCount)} label="Comptes geres" />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Modules</p>
            <div className="mt-5 space-y-4">
              <Link
                href="/admin/actualites"
                className="block rounded-[22px] border border-[#e7ecf3] bg-[#fbfcfe] p-5 transition hover:border-[#d7dfeb]"
              >
                <h3 className="text-[18px] font-extrabold text-[#182235]">Actualites</h3>
                <p className="mt-2 text-[15px] leading-7 text-[#6f7a8d]">
                  Creer, mettre a la une, publier ou brouillonner des articles avec photos.
                </p>
              </Link>
              <div className="rounded-[22px] border border-dashed border-[#d7dfeb] bg-[#fbfcfe] p-5">
                <h3 className="text-[18px] font-extrabold text-[#182235]">Modules suivants</h3>
                <p className="mt-2 text-[15px] leading-7 text-[#6f7a8d]">
                  Evenements, documents, annuaire et galerie photo pourront se raccrocher ici ensuite.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Conseil</p>
            <h3 className="mt-2 text-[22px] font-extrabold text-[#182235]">Un seul point d&apos;entree admin</h3>
            <p className="mt-3 text-[15px] leading-7 text-[#6f7a8d]">
              L&apos;administration devient maintenant globale. Les sous-sections comme les actualites restent des
              modules du back-office plutot que des zones separees.
            </p>
          </section>
        </aside>
      </div>
    </AppShell>
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
