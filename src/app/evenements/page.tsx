import Link from 'next/link'
import { AppShell } from '@/src/components/intranet/shell'
import { listAllEvents, listUpcomingEvents } from '@/src/lib/intranet'

function formatEventDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function buildCalendar(events: Awaited<ReturnType<typeof listUpcomingEvents>>) {
  const groups = new Map<string, typeof events>()

  for (const event of events) {
    const key = monthKey(event.startAt)
    groups.set(key, [...(groups.get(key) || []), event])
  }

  return [...groups.entries()].map(([key, monthEvents]) => ({
    key,
    label: new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(monthEvents[0].startAt),
    events: monthEvents,
  }))
}

export default async function EvenementsPage() {
  const [upcomingEvents, allEvents] = await Promise.all([listUpcomingEvents(), listAllEvents()])
  const calendar = buildCalendar(upcomingEvents)

  return (
    <AppShell activePath="/evenements" title="Evenements" eyebrow="Agenda de l'amicale">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_400px]">
        <section>
          <div className="mb-8 overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#0d513d_0%,#14654b_55%,#20745d_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-7 sm:p-9 xl:p-10">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-200/80">Prochains rendez-vous</p>
                <h2 className="mt-4 max-w-2xl text-[34px] font-extrabold leading-tight sm:text-[40px]">
                  Un agenda clair pour suivre les sorties, rencontres et temps forts de l&apos;amicale.
                </h2>
                <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/78">
                  Retrouvez l&apos;agenda a venir, les sorties deja passees et un calendrier simple pour reperer les
                  prochains rendez-vous.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-white/8 p-7 backdrop-blur sm:p-8">
                <EventMetric value={String(upcomingEvents.length)} label="A venir" />
                <EventMetric value={String(allEvents.filter((event) => event.status === 'COMPLETED').length)} label="Passés" />
                <EventMetric value={String(calendar.length)} label="Mois couverts" />
                <EventMetric value="100%" label="Convivialite" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {allEvents.map((event) => (
              <article
                key={event.id}
                className="grid overflow-hidden rounded-[28px] border border-[#e8edf3] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] md:grid-cols-[260px_minmax(0,1fr)]"
              >
                <div className="relative min-h-[220px] bg-[#eef2f7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.coverImageUrl || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#182235]">
                    {event.status === 'UPCOMING' ? 'A venir' : 'Passe'}
                  </div>
                </div>

                <div className="p-6 xl:p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-[13px] text-[#8c97aa]">
                    <span className="rounded-full bg-[#f3f7fb] px-3 py-1 font-bold text-[#344054]">{formatEventDate(event.startAt)}</span>
                    <span>{event.location}</span>
                  </div>
                  <h3 className="text-[24px] font-extrabold text-[#182235]">{event.title}</h3>
                  <p className="mt-3 text-[16px] leading-8 text-[#667289]">{event.summary}</p>
                  <p className="mt-4 text-[15px] leading-7 text-[#6f7a8d]">{event.description.split('\n\n')[0]}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Calendrier</p>
            <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Les prochains evenements</h3>
            <div className="mt-6 space-y-6">
              {calendar.map((month) => (
                <div key={month.key}>
                  <h4 className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-[#8b95a8]">{month.label}</h4>
                  <div className="space-y-3">
                    {month.events.map((event) => (
                      <div key={event.id} className="rounded-[22px] border border-[#e7ecf3] bg-[#fbfcfe] p-4">
                        <p className="text-sm font-bold text-[#182235]">{event.title}</p>
                        <p className="mt-1 text-[13px] text-[#6f7a8d]">{formatEventDate(event.startAt)} · {event.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Liens utiles</p>
            <div className="mt-4 space-y-3">
              <Link href="/actualites" className="block rounded-[20px] border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4 text-sm font-bold text-[#223048]">
                Voir les actualites reliees
              </Link>
              <Link href="/galerie-photo" className="block rounded-[20px] border border-[#e7ecf3] bg-[#fbfcfe] px-4 py-4 text-sm font-bold text-[#223048]">
                Ouvrir la galerie photo
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  )
}

function EventMetric({ value, label }: { value: string; label: string }) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/8 px-4 py-6 text-center shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
      <span className="mb-2 block text-[32px] font-black text-white">{value}</span>
      <span className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-white/62">{label}</span>
    </article>
  )
}
