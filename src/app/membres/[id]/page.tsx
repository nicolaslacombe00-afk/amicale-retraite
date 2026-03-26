import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/src/components/intranet/shell'
import { getMemberProfile } from '@/src/lib/intranet'

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const member = await getMemberProfile(id)

  if (!member) {
    notFound()
  }

  return (
    <AppShell activePath="/membres" title={member.name} eyebrow="Profil membre">
      <div className="mx-auto max-w-[1100px]">
        <Link href="/membres" className="mb-6 inline-flex text-sm font-extrabold text-[#4f46e5]">
          Retour a l&apos;annuaire
        </Link>

        <section className="grid overflow-hidden rounded-[30px] border border-[#e8edf3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="bg-[linear-gradient(160deg,#1a2334_0%,#243650_60%,#33526f_100%)] p-8 text-white">
            <div className="mx-auto h-40 w-40 overflow-hidden rounded-full border border-white/15 bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'}
                alt={member.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h1 className="mt-6 text-[32px] font-extrabold">{member.name}</h1>
            <p className="mt-2 text-[16px] text-white/72">{member.formerJobTitle || 'Membre de l amicale'}</p>
            <p className="mt-1 text-[14px] text-white/60">{member.formerDepartment || 'Ancien service non renseigne'}</p>
          </div>

          <div className="p-8 xl:p-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Presentation</p>
                <p className="mt-4 text-[16px] leading-8 text-[#445066]">
                  {member.bio || "Ce membre n'a pas encore complete sa presentation personnelle."}
                </p>
              </div>
              <aside className="rounded-[24px] bg-[#f8fafd] p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Coordonnees</p>
                <div className="mt-4 space-y-4 text-[15px] text-[#445066]">
                  <p><span className="font-bold text-[#182235]">Ville:</span> {member.city || 'Non renseignee'}</p>
                  <p><span className="font-bold text-[#182235]">Telephone:</span> {member.phone || 'Non renseigne'}</p>
                  <p><span className="font-bold text-[#182235]">Email:</span> {member.email}</p>
                  <p>
                    <span className="font-bold text-[#182235]">Adhesion:</span>{' '}
                    {member.joinedAmicaleAt
                      ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(member.joinedAmicaleAt)
                      : 'Non renseignee'}
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
