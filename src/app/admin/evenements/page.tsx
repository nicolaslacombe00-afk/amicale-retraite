import { AdminShell } from '@/src/components/admin/shell'
import { createEventAction, deleteEventAction } from '@/src/app/admin/actions'
import { prisma } from '@/src/lib/db'

function feedbackFromParams(params: { error?: string; success?: string }) {
  if (params.success === 'event-created') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Evenement ajoute avec succes.' }
  }

  if (params.success === 'event-deleted') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Evenement supprime.' }
  }

  if (params.error === 'missing') {
    return { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner les champs obligatoires.' }
  }

  return null
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default async function AdminEvenementsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [events, params] = await Promise.all([
    prisma.event.findMany({
      orderBy: [{ startAt: 'asc' }],
    }),
    searchParams,
  ])

  const feedback = feedbackFromParams(params)

  return (
    <AdminShell
      activePath="/admin/evenements"
      title="Agenda"
      description="Planifiez les rendez-vous de l amicale et gardez une vision claire de ce qui arrive et de ce qui est deja passe."
    >
      {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_420px]">
        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Calendrier</p>
              <h2 className="mt-2 text-[28px] font-black text-[#15304d]">Evenements a piloter</h2>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {events.length} evenement{events.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {events.map((event) => (
              <article key={event.id} className="rounded-[24px] border border-[#ecf1f6] bg-[#fbfcfe] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] ${
                          event.status === 'UPCOMING' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
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

                  <form action={deleteEventAction.bind(null, event.id, '/admin/evenements')}>
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
        </section>

        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Creation</p>
          <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Programmer un evenement</h3>

          <form action={createEventAction} className="mt-6 space-y-4">
            <input type="hidden" name="returnTo" value="/admin/evenements" />

            <Field label="Titre" name="title" required placeholder="Sortie culturelle de printemps" />
            <TextArea label="Resume" name="summary" required rows={3} placeholder="Quelques lignes pour l agenda." />
            <TextArea label="Description" name="description" required rows={5} placeholder="Details pratiques et deroule." />
            <Field label="Lieu" name="location" required placeholder="Rodez, salle de reunion" />
            <Field label="Image de couverture" name="coverImageUrl" placeholder="https://..." />
            <Field label="Debut" name="startAt" type="datetime-local" required />
            <Field label="Fin" name="endAt" type="datetime-local" />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Statut</span>
              <select
                name="status"
                defaultValue="UPCOMING"
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
              >
                <option value="UPCOMING">A venir</option>
                <option value="COMPLETED">Passe</option>
              </select>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f9d6b] px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
            >
              Ajouter a l agenda
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
  type = 'text',
  required = false,
  placeholder,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <input
        type={type}
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
