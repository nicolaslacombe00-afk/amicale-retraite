import Link from 'next/link'
import { AdminShell } from '@/src/components/admin/shell'
import { createPhotoAlbumAction, deletePhotoAlbumAction } from '@/src/app/admin/actions'
import { prisma } from '@/src/lib/db'

function feedbackFromParams(params: { error?: string; success?: string }) {
  if (params.success === 'album-created') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Album cree avec succes.' }
  }

  if (params.success === 'album-deleted') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Album supprime.' }
  }

  if (params.error === 'missing') {
    return { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner au minimum le titre et le resume.' }
  }

  return null
}

export default async function AdminGaleriePhotoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [albums, events, params] = await Promise.all([
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
    prisma.event.findMany({
      orderBy: [{ startAt: 'asc' }],
      select: {
        id: true,
        title: true,
      },
    }),
    searchParams,
  ])

  const feedback = feedbackFromParams(params)

  return (
    <AdminShell
      activePath="/admin/galerie-photo"
      title="Galerie photo"
      description="Construisez vos albums photo dans une interface de back-office dediee aux souvenirs et sorties de l amicale."
    >
      {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_420px]">
        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Albums</p>
              <h2 className="mt-2 text-[28px] font-black text-[#15304d]">Galeries publiees</h2>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {albums.length} album{albums.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {albums.map((album) => (
              <article key={album.id} className="rounded-[24px] border border-[#ecf1f6] bg-[#fbfcfe] p-5">
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
                    <form action={deletePhotoAlbumAction.bind(null, album.id, '/admin/galerie-photo')}>
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

        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Creation</p>
          <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Nouvel album photo</h3>

          <form action={createPhotoAlbumAction} className="mt-6 space-y-4">
            <input type="hidden" name="returnTo" value="/admin/galerie-photo" />

            <Field label="Titre" name="title" required placeholder="Sortie d automne a Laguiole" />
            <TextArea label="Resume" name="summary" required rows={4} placeholder="Presentez rapidement l album." />
            <Field label="Image de couverture" name="coverImageUrl" placeholder="https://..." />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Evenement lie</span>
              <select
                name="eventId"
                defaultValue=""
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
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

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f9d6b] px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
            >
              Creer l album
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
