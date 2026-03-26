import { AdminShell } from '@/src/components/admin/shell'
import { deleteDocumentAction, uploadAdminDocumentAction } from '@/src/app/admin/actions'
import { prisma } from '@/src/lib/db'

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

function feedbackFromParams(params: { error?: string; success?: string }) {
  if (params.success === 'document-uploaded') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Document televerse avec succes.' }
  }

  if (params.success === 'document-deleted') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Document supprime.' }
  }

  if (params.error === 'missing') {
    return { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner un titre et un fichier.' }
  }

  return null
}

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [documents, params] = await Promise.all([
    prisma.document.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        uploadedBy: {
          select: {
            name: true,
          },
        },
      },
    }),
    searchParams,
  ])

  const feedback = feedbackFromParams(params)

  return (
    <AdminShell
      activePath="/admin/documents"
      title="Documents"
      description="Administrez la bibliotheque documentaire dans une interface dediee au depot, au suivi et au nettoyage des fichiers."
    >
      {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_420px]">
        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Bibliotheque</p>
              <h2 className="mt-2 text-[28px] font-black text-[#15304d]">Documents de l amicale</h2>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {documents.length} document{documents.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {documents.map((document) => (
              <article key={document.id} className="rounded-[24px] border border-[#ecf1f6] bg-[#fbfcfe] p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-[20px] font-extrabold text-[#182235]">{document.title}</h3>
                    {document.description ? <p className="mt-2 text-[15px] leading-7 text-[#6f7a8d]">{document.description}</p> : null}
                    <p className="mt-2 text-sm text-[#98a1b2]">
                      {document.fileName} · {formatBytes(document.sizeBytes)} · Depose par {document.uploadedBy.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={document.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-[#d8e0ec] px-4 py-2 text-sm font-bold text-[#223048] transition hover:bg-white"
                    >
                      Ouvrir
                    </a>
                    <form action={deleteDocumentAction.bind(null, document.id, '/admin/documents')}>
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
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Televersement</p>
          <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Ajouter un document</h3>

          <form action={uploadAdminDocumentAction} className="mt-6 space-y-4">
            <input type="hidden" name="returnTo" value="/admin/documents" />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Titre</span>
              <input
                name="title"
                required
                className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
                placeholder="Compte-rendu reunion bureau"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[#2b3446]">Description</span>
              <textarea
                name="description"
                rows={4}
                className="w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3 text-[15px] text-[#223048] outline-none"
                placeholder="Quelques mots sur le document."
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
              Ajouter le document
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  )
}
