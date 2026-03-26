import Link from 'next/link'
import { AppShell } from '@/src/components/intranet/shell'
import { listPhotoAlbums } from '@/src/lib/intranet'

export default async function GaleriePhotoPage() {
  const albums = await listPhotoAlbums()

  return (
    <AppShell activePath="/galerie-photo" title="Galerie photo" eyebrow="Albums et souvenirs">
      <section className="mb-8 overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#4b2d17_0%,#6e4020_55%,#8b5935_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
        <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-7 sm:p-9 xl:p-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-200/80">Souvenirs</p>
            <h2 className="mt-4 max-w-2xl text-[34px] font-extrabold leading-tight sm:text-[40px]">
              Les albums photo des evenements, sorties et moments forts de l&apos;amicale.
            </h2>
            <p className="mt-4 max-w-2xl text-[16px] leading-8 text-white/78">
              Retrouvez les galeries photos classees par album, avec un acces simple aux souvenirs partages.
            </p>
          </div>
          <div className="flex items-center justify-center bg-white/8 p-8 text-center">
            <div>
              <p className="text-[48px] font-black">{albums.length}</p>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.16em] text-white/62">Albums disponibles</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/galerie-photo/${album.slug}`}
            className="group overflow-hidden rounded-[28px] border border-[#e8edf3] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:-translate-y-1"
          >
            <div className="relative h-60 bg-[#eef2f7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.coverImageUrl || 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'}
                alt={album.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
              {album.eventTitle ? (
                <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#182235]">
                  {album.eventTitle}
                </div>
              ) : null}
            </div>
            <div className="p-6">
              <h3 className="text-[22px] font-extrabold text-[#182235]">{album.title}</h3>
              <p className="mt-3 text-[15px] leading-7 text-[#6f7a8d]">{album.summary}</p>
              <div className="mt-5 text-sm font-extrabold text-[#4f46e5]">
                Ouvrir l&apos;album · {album.photoCount} photo{album.photoCount > 1 ? 's' : ''}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  )
}
