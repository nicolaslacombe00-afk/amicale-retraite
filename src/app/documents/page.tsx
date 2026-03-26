import { AppShell } from '@/src/components/intranet/shell'
import { uploadDocumentAction } from '@/src/app/documents/actions'
import { listDocuments } from '@/src/lib/intranet'
import { requireAuthenticatedUser } from '@/src/lib/auth/session'

function formatBytes(size: number | null) {
  if (!size) {
    return 'Taille inconnue'
  }

  const units = ['o', 'Ko', 'Mo', 'Go']
  let value = size
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  await requireAuthenticatedUser()
  const [documents, params] = await Promise.all([listDocuments(), searchParams])

  const feedback =
    params.success === 'uploaded'
      ? { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Document ajoute avec succes.' }
      : params.error === 'missing'
        ? { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner un titre et un fichier.' }
        : null

  return (
    <AppShell activePath="/documents" title="Documents" eyebrow="Boite documentaire">
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_420px]">
        <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Bibliotheque</p>
              <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Documents de l&apos;amicale</h3>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {documents.length} document{documents.length > 1 ? 's' : ''}
            </div>
          </div>

          {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

          <div className="space-y-4">
            {documents.map((document) => (
              <article key={document.id} className="rounded-[22px] border border-[#ebeff5] bg-[#fbfcfe] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h4 className="text-[19px] font-extrabold text-[#1a2334]">{document.title}</h4>
                    {document.description ? <p className="mt-2 text-[15px] leading-7 text-[#6f7a8d]">{document.description}</p> : null}
                    <p className="mt-3 text-sm text-[#95a0b3]">
                      {document.fileName} · {formatBytes(document.sizeBytes)} · Depose par {document.uploadedBy.name}
                    </p>
                  </div>
                  <a
                    href={document.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-[#121b2c] px-4 py-2 text-sm font-bold text-white transition hover:bg-black"
                  >
                    Ouvrir
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#99a3b4]">Depot</p>
          <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Ajouter un document</h3>
          <p className="mt-3 text-[15px] leading-7 text-[#6f7a8d]">
            Chargez un document utile a la vie de l&apos;amicale. Il sera aussitot visible dans la bibliotheque.
          </p>

          <form action={uploadDocumentAction} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Titre</span>
              <input
                name="title"
                required
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                placeholder="Ex: Compte-rendu reunion bureau"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Description</span>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
                placeholder="Precisez rapidement le contenu du document."
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Fichier</span>
              <input
                type="file"
                name="file"
                required
                className="block w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f9d6b] px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
            >
              Envoyer le document
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  )
}
