import Link from 'next/link'
import type { ReactNode } from 'react'
import { logoutAction } from '@/src/app/login/actions'
import { AppIcon } from '@/src/components/intranet/shell'
import { requireAdminUser } from '@/src/lib/auth/session'

type AdminNavItem = {
  label: string
  href: string
  icon: Parameters<typeof AppIcon>[0]['name']
}

const contentNav: AdminNavItem[] = [
  { label: 'Tableau de bord', href: '/admin', icon: 'home' },
  { label: 'Navigation', href: '/admin/navigation', icon: 'ticket' },
  { label: 'Actualites', href: '/admin/actualites', icon: 'newspaper' },
  { label: 'Agenda', href: '/admin/evenements', icon: 'calendar' },
  { label: 'Annuaire & membres', href: '/admin/membres', icon: 'users' },
  { label: 'Galerie photo', href: '/admin/galerie-photo', icon: 'camera' },
  { label: 'Documents', href: '/admin/documents', icon: 'file-text' },
]

const accessNav: AdminNavItem[] = [
  { label: 'Voir le site', href: '/', icon: 'chevron-right' },
  { label: 'Retour intranet', href: '/actualites', icon: 'user' },
]

export async function AdminShell({
  children,
  activePath,
  title,
  eyebrow = 'Administration',
  description,
  actions,
}: {
  children: ReactNode
  activePath: string
  title: string
  eyebrow?: string
  description?: string
  actions?: ReactNode
}) {
  const user = await requireAdminUser()

  return (
    <main className="min-h-screen bg-[#edf2f8] lg:flex">
      <aside className="flex w-full shrink-0 flex-col bg-[#131d2b] text-white lg:sticky lg:top-0 lg:h-screen lg:w-[312px]">
        <div className="border-b border-white/8 px-7 pb-6 pt-7">
          <Link href="/admin" className="flex items-center gap-4">
            <div className="text-[34px] font-black italic tracking-[-0.14em]">R·A·G·T</div>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/45">Admin</p>
              <p className="text-sm text-white/60">Back-office des contenus</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <NavBlock title="Gestion du contenu" items={contentNav} activePath={activePath} />
          <div className="mt-7">
            <NavBlock title="Acces" items={accessNav} activePath={activePath} />
          </div>
        </div>

        <div className="border-t border-white/8 px-5 py-5">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f9d6b] text-sm font-black text-white">
                {getInitials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{user.name}</p>
                <p className="truncate text-[12px] text-white/50">{user.email}</p>
              </div>
            </div>

            <form action={logoutAction} className="mt-4">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <AppIcon name="chevron-right" className="h-4 w-4 rotate-180" />
                Se deconnecter
              </button>
            </form>
          </div>
        </div>
      </aside>

      <section className="min-h-screen min-w-0 flex-1">
        <header className="border-b border-[#dfe6f1] bg-[#f5f7fb] px-6 py-7 sm:px-8 xl:px-14">
          <div className="mx-auto flex max-w-[1560px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#94a0b3]">{eyebrow}</p>
              <h1 className="text-[34px] font-black tracking-tight text-[#15304d]">{title}</h1>
              {description ? <p className="mt-3 max-w-3xl text-[16px] leading-7 text-[#738198]">{description}</p> : null}
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </header>

        <div className="mx-auto max-w-[1560px] px-6 py-8 sm:px-8 xl:px-14">{children}</div>
      </section>
    </main>
  )
}

function NavBlock({
  title,
  items,
  activePath,
}: {
  title: string
  items: AdminNavItem[]
  activePath: string
}) {
  return (
    <div>
      <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/28">{title}</p>
      <div className="mt-3 space-y-1.5">
        {items.map((item) => {
          const active =
            item.href === '/admin'
              ? activePath === '/admin'
              : activePath === item.href || activePath.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-[17px] transition ${
                active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/6 hover:text-white'
              }`}
            >
              <AppIcon name={item.icon} className="h-5 w-5 shrink-0" />
              <span className="font-semibold">{item.label}</span>
              {active ? <span className="ml-auto h-2 w-2 rounded-full bg-[#0f9d6b]" /> : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
