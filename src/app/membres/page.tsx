import Link from 'next/link'
import { AppShell } from '@/src/components/intranet/shell'
import { listDirectoryMembers } from '@/src/lib/intranet'

export default async function MembresPage() {
  const members = await listDirectoryMembers()

  return (
    <AppShell activePath="/membres" title="Membres" eyebrow="Annuaire de l'amicale">
      <section className="mb-8 overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#182235_0%,#25364c_60%,#324a63_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-7 sm:p-9 xl:p-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-sky-200/80">Annuaire</p>
            <h2 className="mt-4 max-w-2xl text-[34px] font-extrabold leading-tight sm:text-[40px]">
              Les membres de l&apos;amicale des Anciens RAGT en un seul annuaire.
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/78">
              Retrouvez les membres actifs, leur ancien service, leur ville et consultez leur fiche individuelle.
            </p>
          </div>
          <div className="flex items-center justify-center bg-white/8 p-8 text-center">
            <div>
              <p className="text-[48px] font-black">{members.length}</p>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-white/62">Profils consultables</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {members.map((member) => (
          <Link
            key={member.id}
            href={`/membres/${member.id}`}
            className="group rounded-[28px] border border-[#e8edf3] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-[#edf2fb]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[20px] font-extrabold text-[#182235]">{member.name}</h3>
                <p className="mt-1 text-[14px] text-[#6f7a8d]">{member.formerJobTitle || 'Membre de l amicale'}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2 text-[14px] text-[#607089]">
              <p>{member.formerDepartment || 'Departement non renseigne'}</p>
              <p>{member.city || 'Ville non renseignee'}</p>
              <p>
                {member.joinedAmicaleAt
                  ? `Rejoint l amicale le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(member.joinedAmicaleAt)}`
                  : 'Date d adhesion non renseignee'}
              </p>
            </div>
            <div className="mt-5 text-sm font-extrabold text-[#4f46e5]">Voir le profil</div>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}
