import { NavigationSection } from '@prisma/client'
import { AdminShell } from '@/src/components/admin/shell'
import {
  createNavigationItemAction,
  deleteNavigationItemAction,
  updateNavigationItemAction,
} from '@/src/app/admin/actions'
import { getNavigationIconOptions, listNavigationAdminItems } from '@/src/lib/navigation'

function feedbackFromParams(params: { error?: string; success?: string }) {
  if (params.success === 'nav-created') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Element de menu cree.' }
  }

  if (params.success === 'nav-updated') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Element de menu mis a jour.' }
  }

  if (params.success === 'nav-deleted') {
    return { tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', message: 'Element de menu supprime.' }
  }

  if (params.error === 'missing') {
    return { tone: 'border-red-200 bg-red-50 text-red-700', message: 'Merci de renseigner au minimum un libelle.' }
  }

  return null
}

export default async function AdminNavigationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const [items, params] = await Promise.all([listNavigationAdminItems(), searchParams])
  const icons = getNavigationIconOptions()
  const parents = items.filter((item) => !item.parentId)
  const feedback = feedbackFromParams(params)

  return (
    <AdminShell
      activePath="/admin/navigation"
      title="Navigation"
      description="Administrez le menu lateral membre, choisissez les entrees visibles et ajoutez des sous-elements quand vous en avez besoin."
    >
      {feedback ? <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-medium ${feedback.tone}`}>{feedback.message}</div> : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.16fr)_420px]">
        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Menu lateral</p>
              <h2 className="mt-2 text-[28px] font-black text-[#15304d]">Elements du menu</h2>
            </div>
            <div className="rounded-full bg-[#f4f7fb] px-4 py-2 text-sm font-bold text-[#445066]">
              {items.length} element{items.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {parents.map((item) => (
              <details key={item.id} className="rounded-[24px] border border-[#ecf1f6] bg-[#fbfcfe] p-5" open>
                <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-700">
                        {item.section === 'PRIMARY' ? 'Principal' : 'Secondaire'}
                      </span>
                      {!item.isVisible ? (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-amber-700">
                          Masque
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-[20px] font-extrabold text-[#182235]">{item.label}</h3>
                    <p className="mt-1 text-sm text-[#6f7a8d]">{item.href || 'Parent sans lien direct'}</p>
                  </div>
                  <span className="text-sm font-extrabold text-[#4f46e5]">
                    {item.children.length} sous-element{item.children.length > 1 ? 's' : ''}
                  </span>
                </summary>

                <form action={updateNavigationItemAction.bind(null, item.id)} className="mt-5 grid gap-4 border-t border-[#edf2f7] pt-5 xl:grid-cols-2">
                  <input type="hidden" name="returnTo" value="/admin/navigation" />
                  <Field label="Libelle" name="label" defaultValue={item.label} required />
                  <Field label="Lien" name="href" defaultValue={item.href ?? ''} placeholder="/membres" />
                  <SelectField label="Icône" name="icon" defaultValue={item.icon} options={icons} />
                  <Field label="Ordre" name="sortOrder" type="number" defaultValue={String(item.sortOrder)} />
                  <SelectField
                    label="Section"
                    name="section"
                    defaultValue={item.section}
                    options={[NavigationSection.PRIMARY, NavigationSection.SECONDARY]}
                  />
                  <SelectField
                    label="Parent"
                    name="parentId"
                    defaultValue={item.parentId ?? ''}
                    options={['', ...parents.filter((parent) => parent.id !== item.id).map((parent) => parent.id)]}
                    labels={Object.fromEntries(parents.map((parent) => [parent.id, parent.label]))}
                  />

                  <label className="flex items-center gap-3 rounded-2xl border border-[#dde3ec] bg-white px-4 py-3">
                    <input type="checkbox" name="isVisible" defaultChecked={item.isVisible} className="h-4 w-4" />
                    <span className="text-sm font-bold text-[#2b3446]">Visible dans le menu</span>
                  </label>

                  <div className="xl:col-span-2 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="rounded-2xl bg-[#121b2c] px-5 py-3 text-[15px] font-extrabold text-white transition hover:bg-black"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="submit"
                      formAction={deleteNavigationItemAction.bind(null, item.id, '/admin/navigation')}
                      className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-[15px] font-extrabold text-red-700 transition hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </form>

                {item.children.length ? (
                  <div className="mt-5 rounded-[20px] border border-[#edf2f7] bg-white/80 p-4">
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9ba6b8]">Sous-elements</p>
                    <div className="mt-3 space-y-3">
                      {item.children.map((child) => (
                        <div key={child.id} className="rounded-[18px] border border-[#edf2f7] bg-[#fbfcfe] px-4 py-3 text-sm text-[#445066]">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-extrabold text-[#182235]">{child.label}</p>
                              <p className="mt-1 text-[#8a95a8]">{child.href || 'Sans lien'}</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em] text-slate-700">
                              ordre {child.sortOrder}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#e4ebf4] bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.04)] xl:p-8">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#9ba6b8]">Creation</p>
          <h3 className="mt-2 text-[24px] font-extrabold text-[#182235]">Ajouter un element de menu</h3>

          <form action={createNavigationItemAction} className="mt-6 space-y-4">
            <input type="hidden" name="returnTo" value="/admin/navigation" />
            <Field label="Libelle" name="label" required placeholder="Boutique & billetterie" />
            <Field label="Lien" name="href" placeholder="/documents" />
            <SelectField label="Icône" name="icon" defaultValue="home" options={icons} />
            <Field label="Ordre" name="sortOrder" type="number" defaultValue="0" />
            <SelectField
              label="Section"
              name="section"
              defaultValue={NavigationSection.PRIMARY}
              options={[NavigationSection.PRIMARY, NavigationSection.SECONDARY]}
            />
            <SelectField
              label="Parent"
              name="parentId"
              defaultValue=""
              options={['', ...parents.map((parent) => parent.id)]}
              labels={Object.fromEntries(parents.map((parent) => [parent.id, parent.label]))}
            />

            <label className="flex items-center gap-3 rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 py-3">
              <input type="checkbox" name="isVisible" defaultChecked className="h-4 w-4" />
              <span className="text-sm font-bold text-[#2b3446]">Visible dans le menu</span>
            </label>

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#0f9d6b] px-5 py-4 text-[15px] font-extrabold text-white shadow-[0_16px_36px_rgba(15,157,107,0.22)] transition hover:bg-[#118f63]"
            >
              Creer l element
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
  defaultValue,
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
  defaultValue?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        type={type}
        className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  options,
  defaultValue,
  labels,
}: {
  label: string
  name: string
  options: string[]
  defaultValue: string
  labels?: Record<string, string>
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[#2b3446]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-12 w-full rounded-2xl border border-[#dde3ec] bg-[#fbfcfe] px-4 text-[15px] text-[#223048] outline-none"
      >
        {options.map((option) => (
          <option key={option || 'empty'} value={option}>
            {labels?.[option] ?? (option || 'Aucun parent')}
          </option>
        ))}
      </select>
    </label>
  )
}
