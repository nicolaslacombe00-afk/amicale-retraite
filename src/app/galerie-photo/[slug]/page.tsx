import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppShell } from '@/src/components/intranet/shell'
import { getPhotoAlbum } from '@/src/lib/intranet'

export default async function PhotoAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const album = await getPhotoAlbum(slug)

  if (!album) {
    notFound()
  }

  return (
    <AppShell activePath="/galerie-photo" title={album.title} eyebrow="Galerie photo">
      <div className="mx-auto max-w-[1280px]">
        <Link href="/galerie-photo" className="mb-6 inline-flex text-sm font-extrabold text-[#4f46e5]">
          Retour aux albums
        </Link>

        <section className="mb-8 overflow-hidden rounded-[30px] border border-[#e8edf3] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="relative h-[280px] sm:h-[360px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={album.coverImageUrl || album.photos[0]?.url || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80'}
              alt={album.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.75)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              {album.eventTitle ? (
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em] backdrop-blur">
                  {album.eventTitle}
                </span>
              ) : null}
              <h1 className="mt-4 text-[36px] font-extrabold">{album.title}</h1>
              <p className="mt-3 max-w-3xl text-[16px] leading-8 text-white/80">{album.summary}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {album.photos.map((photo) => (
            <figure key={photo.id} className="overflow-hidden rounded-[24px] border border-[#e8edf3] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.alt || album.title} className="h-72 w-full object-cover" />
              {photo.caption ? <figcaption className="px-4 py-3 text-[14px] leading-6 text-[#627089]">{photo.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
