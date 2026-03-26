import Link from 'next/link'
import { AdminShell } from '@/src/components/admin/shell'
import { updateMemberAction } from '@/src/app/admin/actions'
import { prisma } from '@/src/lib/db'

function feedbackFromParams(params: { error?: string; success?: string }) {
  if (params.success === 'member-updated') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Profil membre mis a jour.' }
  }

  if (params.error === 'missing') {
    return { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner le nom et l email.' }
  }

  return null
}

export default async function AdminMembresPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [members, params] = await Promise.all([
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
    searchParams,
  ])

  const feedback = feedbackFromParams(params)

  return (
    <AdminShell
      activePath="/admin/membres"
      title="Annuaire & membres"
      description="Gardez les fiches membres a jour et pilotez les droits d administration depuis une interface dediee."
    >
      {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

      <div className="space-y-4">
        {members.map((member) => (
          <details key={member.id} className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)]" open>
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
                <h2 className="text-[24px] font-black text-[#15304d]">{member.name}</h2>
                <p className="mt-1 text-sm text-[#6f7a8d]">{member.email}</p>
              </div>

              <Link
                href={`/membres/${member.id}`}
                className="rounded-full border border-[#d8e0ec] px-4 py-2 text-sm font-bold text-[#223048] transition hover:bg-white"
              >
                Voir la fiche
              </Link>
            </summary>

            <form action={updateMemberAction.bind(null, member.id)} className="mt-6 grid gap-4 border-t border-[#edf2f7] pt-6 xl:grid-cols-2">
              <input type="hidden" name="returnTo" value="/admin/membres" />

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
                  placeholder="Presentation du membre."
                />
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[#2b3446]">Role</span>
                <select
                  name="role"
                  defaultValue={member.role}
                  className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                >
                  <option value="USER">Membre</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3">
                <input type="checkbox" name="isActive" defaultChecked={member.isActive} className="h-4 w-4" />
                <span className="text-sm font-bold text-[#2b3446]">Profil actif</span>
              </label>

              <div className="xl:col-span-2">
                <button
                  type="submit"
                  className="rounded-2xl bg-[#0f9d6b] px-5 py-3 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
                >
                  Enregistrer le profil
                </button>
              </div>
            </form>
          </details>
        ))}
      </div>
    </AdminShell>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
      />
    </label>
  )
}

function TextArea({
  label,
  name,
  rows,
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  rows: number
  defaultValue?: string
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
      />
    </label>
  )
}
