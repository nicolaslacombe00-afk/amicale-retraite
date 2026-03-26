import Link from 'next/link'
import { AppShell } from '@/src/components/intranet/shell'
import { listDirectoryMembers } from '@/src/lib/intranet'

function membershipLabel(joinedAmicaleAt: Date | null) {
  if (!joinedAmicaleAt) {
    return 'Anciennete non renseignee'
  }

  const now = new Date()
  let years = now.getFullYear() - joinedAmicaleAt.getFullYear()
  const monthDiff = now.getMonth() - joinedAmicaleAt.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < joinedAmicaleAt.getDate())) {
    years -= 1
  }

  if (years <= 0) {
    return "Moins d'un an d'amicale"
  }

  return `${years} an${years > 1 ? 's' : ''} d'amicale`
}

function roleLabel(role: 'ADMIN' | 'USER') {
  return role === 'ADMIN' ? 'Administrateur' : 'Membre'
}

export default async function MembresPage() {
  const members = await listDirectoryMembers()

  return (
    <AppShell activePath="/membres" title="Membres" eyebrow="Annuaire de l'amicale">
      <section className="mb-8 overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#182235_0%,#25364c_60%,#324a63_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-7 sm:p-9 xl:p-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-sky-200/80">Annuaire</p>
            <h2 className="mt-4 max-w-2xl text-[34px] font-extrabold leading-tight sm:text-[40px]">
              Une vue annuaire claire pour retrouver tous les membres de l&apos;amicale.
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/78">
              Consultez l&apos;annuaire sous forme de tableau, retrouvez les coordonnees essentielles et ouvrez la fiche
              detaillee de chaque membre en un clic.
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

      <section className="overflow-hidden rounded-[30px] border border-[#e6ebf2] bg-white shadow-[0_20px_55px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf2f7] px-6 py-5 sm:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9aa5b7]">Vue tableau</p>
              <h3 className="mt-2 text-[28px] font-extrabold text-[#182235]">Annuaire des membres</h3>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {members.length} membre{members.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="hidden xl:block">
          <div className="grid grid-cols-[2.2fr_2.3fr_1.2fr_1.3fr_1.4fr_1.2fr_120px] gap-6 border-b border-[#edf2f7] px-8 py-5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#9aa5b7]">
            <span>Nom</span>
            <span>Email</span>
            <span>Ville</span>
            <span>Departement</span>
            <span>Membre amicale</span>
            <span>Role</span>
            <span className="text-center">Profil</span>
          </div>

          <div>
            {members.map((member) => (
              <Link
                key={member.id}
                href={`/membres/${member.id}`}
                className="grid grid-cols-[2.2fr_2.3fr_1.2fr_1.3fr_1.4fr_1.2fr_120px] gap-6 border-b border-[#edf2f7] px-8 py-6 transition hover:bg-[#f8fbff]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="h-14 w-14 overflow-hidden rounded-full bg-[#edf2fb] ring-1 ring-[#e3e9f3]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[21px] font-extrabold text-[#182235]">{member.name}</p>
                    <p className="mt-1 truncate text-[14px] text-[#6f7a8d]">
                      {member.formerJobTitle || 'Membre de l amicale'}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 self-center text-[16px] text-[#445066]">{member.email}</div>
                <div className="self-center text-[16px] text-[#445066]">{member.city || 'Non renseignee'}</div>
                <div className="self-center text-[16px] text-[#445066]">
                  {member.formerDepartment || 'Non renseigne'}
                </div>
                <div className="self-center text-[16px] text-[#445066]">{membershipLabel(member.joinedAmicaleAt)}</div>
                <div className="self-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[12px] font-extrabold uppercase tracking-[0.08em] ${
                      member.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {roleLabel(member.role)}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-black ${
                      member.isActive ? 'bg-[#e8f7ef] text-[#0f9d6b]' : 'bg-[#fff3e8] text-[#d97706]'
                    }`}
                  >
                    {member.isActive ? '✓' : '!'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="xl:hidden">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/membres/${member.id}`}
              className="block border-b border-[#edf2f7] px-6 py-5 transition hover:bg-[#f8fbff] sm:px-8"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full bg-[#edf2fb] ring-1 ring-[#e3e9f3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[22px] font-extrabold text-[#182235]">{member.name}</h3>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                        member.role === 'ADMIN' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {roleLabel(member.role)}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1 text-[15px] leading-7 text-[#5f6d82]">
                    <p>{member.email}</p>
                    <p>{member.city || 'Ville non renseignee'}</p>
                    <p>{member.formerDepartment || 'Departement non renseigne'}</p>
                    <p>{membershipLabel(member.joinedAmicaleAt)}</p>
                  </div>

                  <p className="mt-4 text-sm font-extrabold text-[#4f46e5]">Ouvrir le profil</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  )
}
