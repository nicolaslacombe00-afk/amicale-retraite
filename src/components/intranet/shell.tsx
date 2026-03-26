import Link from 'next/link'
import type { ReactNode } from 'react'
import { logoutAction } from '@/src/app/login/actions'
import {
  type EventCard,
  type IconName,
  type MemberSpotlight,
  type NavItem,
  type NewsItem,
  type QuickLink,
} from '@/src/components/intranet/data'
import { requireAuthenticatedUser } from '@/src/lib/auth/session'
import { listNavigationTree } from '@/src/lib/navigation'

export async function AppShell({
  children,
  activePath,
  title = 'Tableau de bord',
  eyebrow = 'Plateforme collaborative',
}: {
  children: ReactNode
  activePath: string
  title?: string
  eyebrow?: string
}) {
  const user = await requireAuthenticatedUser()
  const navigation = await listNavigationTree()
  const homeItem = navigation.primary[0] ?? null
  const mainItems = homeItem ? navigation.primary.slice(1) : navigation.primary
  const homeActive = activePath === '/'

  return (
    <main className="min-h-screen bg-[#fafafa] lg:flex">
      <aside className="sidebar-panel flex w-full shrink-0 flex-col text-white lg:sticky lg:top-0 lg:h-screen lg:w-[290px] xl:w-[304px] lg:overflow-hidden">
        <div className="px-6 pb-5 pt-6 xl:px-7 xl:pb-6 xl:pt-7">
          <div className="text-center">
            <div className="text-[34px] font-black italic tracking-[-0.14em] xl:text-[38px]">R·A·G·T</div>
            <div className="mx-auto mt-1.5 h-px w-14 bg-white/70" />
          </div>
        </div>

        <nav className="flex flex-1 flex-col justify-between px-4 pb-5 xl:px-5 xl:pb-6">
          <div>
            {homeItem ? <NavGroup item={homeItem} activePath={activePath} defaultOpen={homeActive} /> : null}

            <div className="space-y-0.5">
              {mainItems.map((item) => (
                <NavButton key={item.id || item.label} item={item} active={isNavItemActive(item, activePath)} />
              ))}
            </div>

            <div className="mx-3 my-4 border-t border-white/10" />

            <div className="space-y-0.5">
              {navigation.secondary.map((item) => (
                <NavButton key={item.id || item.label} item={item} active={isNavItemActive(item, activePath)} />
              ))}
            </div>

            {user.role === 'ADMIN' ? (
              <>
                <div className="mx-3 my-4 border-t border-white/10" />
                <div className="space-y-0.5">
                  <NavButton
                    item={{ label: 'Administration', icon: 'badge', href: '/admin', trailing: true }}
                    active={activePath === '/admin'}
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="pt-3">
            <div className="rounded-[20px] border border-white/10 bg-[#141b26]/70 p-3">
              {user.role === 'ADMIN' ? (
                <Link
                  href="/admin"
                  className="mb-3 flex w-full items-center justify-center rounded-2xl bg-[#0f9d6b] px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#12a975]"
                >
                  Ouvrir le back-office
                </Link>
              ) : null}

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{user.name}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                    {user.role === 'ADMIN' ? 'Administrateur' : 'Membre'}
                  </p>
                </div>
              </div>

              <form action={logoutAction} className="mt-3">
                <button
                  type="submit"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Se deconnecter
                </button>
              </form>
            </div>
          </div>
        </nav>
      </aside>

      <section className="min-h-screen min-w-0 flex-1 bg-[#fafafa]">
        <header className="glass-header sticky top-0 z-40 border-b border-[#ececec] px-6 py-7 sm:px-8 xl:px-14">
          <div className="mx-auto flex max-w-[1480px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#a9b0be]">{eyebrow}</p>
              <h2 className="text-[28px] font-extrabold tracking-tight text-[#131c2d]">{title}</h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative block">
                <AppIcon
                  name="search"
                  className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#a1a8b8]"
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="h-12 w-full rounded-full border border-[#dde1ea] bg-white py-2.5 pl-12 pr-5 text-[17px] text-[#2b3446] outline-none transition placeholder:text-[#a4abba] focus:border-[#cfd8ea] sm:w-[340px]"
                />
              </label>

              <div className="flex items-center gap-3 rounded-full border border-[#dde1ea] bg-white px-2 py-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.05)]">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e3e7ff] text-[18px] font-bold text-[#5660df]">
                  {getInitials(user.name)}
                </div>
                <div className="pr-4">
                  <p className="text-[17px] font-bold text-[#364054]">{user.name}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#98a1b2]">
                    {user.role === 'ADMIN' ? 'Admin' : 'Membre'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-6 py-8 sm:px-8 xl:px-14">{children}</div>
      </section>
    </main>
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

function NavButton({ item, active = false }: { item: NavItem; active?: boolean }) {
  const content = (
    <>
      <AppIcon name={item.icon} className="h-5 w-5 shrink-0 text-[#f1f2f4] xl:h-6 xl:w-6" />
      <span className="ml-4 flex-1 text-[16px] font-medium xl:ml-5 xl:text-[18px]">{item.label}</span>
      {item.trailing ? <AppIcon name="chevron-right" className="h-4 w-4 opacity-50" /> : null}
    </>
  )

  const className = `flex w-full items-center rounded-[18px] px-4 py-3 text-left transition xl:px-5 xl:py-3.5 ${
    active ? 'bg-[#0f9d6b] text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]' : 'text-[#f0f1f3] hover:bg-white/5 hover:text-white'
  }`

  return item.href ? (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  ) : (
    <button className={className}>{content}</button>
  )
}

function NavGroup({
  item,
  activePath,
  defaultOpen = false,
}: {
  item: NavItem
  activePath: string
  defaultOpen?: boolean
}) {
  const active = item.href ? isLinkActive(item.href, activePath) : false

  return (
    <details open={defaultOpen || active} className="mb-2">
      <summary
        className={`flex cursor-pointer items-center rounded-[18px] px-4 py-3.5 transition xl:px-5 xl:py-4 ${
          active
            ? 'bg-[#0f9d6b] text-white shadow-[0_14px_30px_rgba(0,0,0,0.16)]'
            : 'text-[#f0f1f3] hover:bg-white/5 hover:text-white'
        }`}
      >
        <AppIcon name={item.icon} className="h-5 w-5 shrink-0 xl:h-6 xl:w-6" />
        <span className="ml-4 flex-1 text-left text-[17px] font-semibold xl:text-[18px]">{item.label}</span>
        <AppIcon name="chevron-down" className="h-4 w-4 shrink-0 transition group-open:rotate-180" />
      </summary>

      <div className="mt-0.5 overflow-hidden rounded-b-[18px] bg-white/5 px-4 py-2.5">
        {item.children?.map((child) => {
          const childActive = isNavItemActive(child, activePath)

          return child.href ? (
            <Link
              key={child.id || child.label}
              href={child.href}
              className={`flex w-full items-center rounded-xl px-4 py-2.5 text-left text-[15px] transition xl:text-[16px] ${
                childActive ? 'font-extrabold text-white' : 'text-stone-300 hover:text-white'
              }`}
            >
              <span className={`mr-3 h-2 w-2 rounded-full ${childActive ? 'bg-white' : 'bg-white/40'}`} />
              {child.label}
            </Link>
          ) : (
            <div
              key={child.id || child.label}
              className={`flex w-full items-center rounded-xl px-4 py-2.5 text-left text-[15px] xl:text-[16px] ${
                childActive ? 'font-extrabold text-white' : 'text-stone-300'
              }`}
            >
              <span className={`mr-3 h-2 w-2 rounded-full ${childActive ? 'bg-white' : 'bg-white/40'}`} />
              {child.label}
            </div>
          )
        })}
      </div>
    </details>
  )
}

function isNavItemActive(item: NavItem, activePath: string): boolean {
  if (item.href) {
    if (isLinkActive(item.href, activePath)) {
      return true
    }
  }

  return item.children?.some((child) => isNavItemActive(child, activePath)) ?? false
}

function isLinkActive(href: string, activePath: string): boolean {
  if (href === '/') {
    return activePath === '/'
  }

  return activePath === href || activePath.startsWith(`${href}/`)
}

export function QuickLinkCard({ link }: { link: QuickLink }) {
  return (
    <article className="rounded-[24px] border border-[#e8e8e8] bg-white px-5 py-5 shadow-[0_6px_18px_rgba(15,23,42,0.04)] xl:rounded-[26px] xl:px-7 xl:py-7">
      <div className="flex items-center gap-4">
        <div className={`rounded-[18px] p-3 xl:p-4 ${link.tone}`}>
          <AppIcon name={link.icon} className="h-6 w-6 xl:h-7 xl:w-7" />
        </div>
        <div className="min-w-0">
          <h3 className="text-[16px] font-extrabold text-[#1b2536] xl:text-[18px]">{link.title}</h3>
          <p className="text-[13px] text-[#a1a8b8] xl:text-[14px]">{link.description}</p>
        </div>
      </div>
    </article>
  )
}

export function EventCardView({ event }: { event: EventCard }) {
  return (
    <article className="rounded-[24px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:rounded-[28px] xl:p-8">
      <div className="mb-5 flex flex-col items-start gap-4 sm:flex-row sm:gap-5">
        <div className="shrink-0 rounded-[18px] border border-[#eceef3] bg-[#fafbfc] px-5 py-3 text-center xl:rounded-[20px] xl:px-6">
          <span className="mb-1 block text-[11px] font-extrabold uppercase leading-none text-[#9aa3b3]">{event.month}</span>
          <span className="block text-[24px] font-extrabold leading-none text-[#182235] xl:text-[26px]">{event.day}</span>
        </div>
        <div className="min-w-0">
          <span className={`rounded-lg border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.04em] ${event.badgeTone}`}>
            {event.badge}
          </span>
          <h3 className="mt-3 text-[18px] font-extrabold leading-tight text-[#1a2334] sm:text-[20px] xl:text-[24px]">
            {event.title}
          </h3>
        </div>
      </div>
      <p className="mb-8 text-[15px] leading-7 text-[#6f7a8d] xl:text-[16px] xl:leading-8">{event.description}</p>
      <div className="flex flex-col gap-4 border-t border-[#f1f2f5] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex -space-x-2">
          {event.attendees.map((tone, index) => (
            <div
              key={`${event.title}-${index}`}
              className={`h-10 w-10 rounded-full border-[3px] border-white shadow-sm xl:h-11 xl:w-11 ${tone} ${
                index === event.attendees.length - 1 && event.attendees.length > 2
                  ? 'flex items-center justify-center text-[15px] font-bold text-slate-500 xl:text-[17px]'
                  : ''
              }`}
            >
              {index === event.attendees.length - 1 && event.attendees.length > 2 ? '+8' : null}
            </div>
          ))}
        </div>
        <button
          className={`w-full rounded-2xl px-6 py-3 text-[15px] font-extrabold transition sm:w-auto xl:px-9 xl:text-[16px] ${
            event.filled
              ? 'bg-[#121b2c] text-white shadow-sm hover:bg-black'
              : 'border border-[#dadde5] bg-white text-[#1c2537] hover:bg-[#f8f9fb]'
          }`}
        >
          {event.cta}
        </button>
      </div>
    </article>
  )
}

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <article className="group flex flex-col gap-5 rounded-[24px] border border-[#ececec] bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.04)] sm:flex-row xl:rounded-[28px] xl:p-7">
      <div className="flex h-28 w-full shrink-0 items-center justify-center rounded-[20px] bg-[#fafbfc] text-[#d5dae3] sm:w-36 xl:h-32 xl:w-44 xl:rounded-[22px]">
        <AppIcon name={item.icon} className="h-8 w-8 opacity-50 xl:h-10 xl:w-10" />
      </div>
      <div className="min-w-0 flex-1 py-1">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] font-medium">
          <span className={`font-extrabold uppercase tracking-[0.18em] ${item.categoryTone}`}>{item.category}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[14px] italic text-[#9aa2b1]">{item.time}</span>
        </div>
        <h3 className="mb-2 text-[18px] font-extrabold text-[#1a2334] transition group-hover:text-indigo-600 sm:text-[20px] xl:text-[24px]">
          {item.title}
        </h3>
        <p className="max-w-3xl text-[15px] leading-7 text-[#6f7a8d] xl:text-[16px] xl:leading-8">{item.description}</p>
      </div>
    </article>
  )
}

export function PresidentCard() {
  return (
    <section className="overflow-hidden rounded-[28px] bg-[linear-gradient(160deg,#5146e5_0%,#4a39d5_100%)] p-7 text-white shadow-[0_18px_40px_rgba(79,70,229,0.18)] xl:rounded-[32px] xl:p-10">
      <AppIcon name="message-square" className="mb-6 h-10 w-10 text-[#7e78f7] xl:mb-8 xl:h-12 xl:w-12" />
      <h3 className="mb-4 text-[20px] font-extrabold xl:mb-5 xl:text-[22px]">Mot du president</h3>
      <p className="mb-8 text-[16px] italic leading-8 text-white/92 xl:mb-10 xl:text-[18px] xl:leading-9">
        &quot;Une amicale n&apos;est pas qu&apos;une structure, c&apos;est avant tout les liens que nous tissons ensemble
        au quotidien. Heureux de voir notre communaute s&apos;agrandir.&quot;
      </p>
      <p className="text-[16px] font-extrabold text-[#d1cffc] xl:text-[17px]">- Marc L., President</p>
    </section>
  )
}

export function WelcomeCard({ newcomers }: { newcomers: MemberSpotlight[] }) {
  return (
    <section className="rounded-[24px] border border-[#ececec] bg-white p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:rounded-[28px] xl:p-8">
      <h3 className="mb-6 flex items-center text-[17px] font-extrabold text-[#1b2536] xl:mb-8 xl:text-[18px]">
        <AppIcon name="trending-up" className="mr-3 h-5 w-5 text-emerald-500" />
        Bienvenue aux nouveaux
      </h3>
      <div className="space-y-6 xl:space-y-8">
        {newcomers.map((member) => (
          <div key={member.name} className="flex items-center gap-4 xl:gap-5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-[20px] font-bold xl:h-14 xl:w-14 xl:text-[24px] ${member.tone}`}>
              {member.initials}
            </div>
            <div>
              <h4 className="mb-1 text-[16px] font-extrabold leading-none text-[#1a2334] xl:text-[18px]">{member.name}</h4>
              <p className="text-[13px] text-[#9fa6b5] xl:text-[14px]">{member.joined}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-8 w-full rounded-[18px] bg-[#eef0ff] px-4 py-3 text-[16px] font-extrabold text-[#534be9] transition hover:bg-[#e7eaff] xl:mt-10 xl:py-4 xl:text-[18px]">
        Voir l&apos;annuaire complet
      </button>
    </section>
  )
}

export function StatsGrid({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="grid grid-cols-2 gap-4 xl:gap-6">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-[24px] border border-[#ececec] bg-white px-4 py-6 text-center shadow-[0_8px_22px_rgba(15,23,42,0.04)] xl:rounded-[28px] xl:px-5 xl:py-8"
        >
          <span className="mb-2 block text-[34px] font-black text-[#182235] xl:text-[44px]">{stat.value}</span>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#adb4c2] xl:text-[12px]">
            {stat.label}
          </span>
        </article>
      ))}
    </section>
  )
}

export function Pill({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return (
    <button
      className={`whitespace-nowrap rounded-full px-5 py-2.5 text-[15px] font-extrabold transition xl:px-7 xl:py-3 xl:text-[16px] ${
        active
          ? 'bg-[#121b2c] text-white shadow-sm'
          : 'border border-[#d9dee7] bg-white text-[#556074] hover:bg-[#fafbfc]'
      }`}
    >
      {children}
    </button>
  )
}

export function AppIcon({ name, className }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    badge: (
      <>
        <path d="M12 3 6 5v5c0 5 2.9 9.1 6 11 3.1-1.9 6-6 6-11V5z" />
        <path d="m9.5 12 1.7 1.7 3.3-3.4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    camera: (
      <>
        <path d="M4 7h3l2-2h6l2 2h3v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
        <circle cx="12" cy="13" r="3.5" />
      </>
    ),
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    'chevron-right': <path d="m9 6 6 6-6 6" />,
    'file-text': (
      <>
        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" />
        <path d="M14 2v5h5M9 13h6M9 17h6M9 9h1" />
      </>
    ),
    heart: <path d="m12 21-1.6-1.5C5 14.7 2 12 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1C13.1 3.8 14.8 3 16.5 3 19.6 3 22 5.4 22 8.5c0 3.5-3 6.2-8.4 11z" />,
    'help-circle': (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4M12 17h.01" />
      </>
    ),
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </>
    ),
    linkedin: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V9h4v2" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    'message-square': (
      <>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </>
    ),
    newspaper: (
      <>
        <path d="M5 22h14a2 2 0 0 0 2-2V7H7a2 2 0 0 0-2 2z" />
        <path d="M5 7V4a2 2 0 0 1 2-2h11" />
        <path d="M9 11h8M9 15h8M9 19h5" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </>
    ),
    ticket: (
      <>
        <path d="M3 9a2 2 0 0 1 2-2h14v4a2 2 0 1 0 0 4v4H5a2 2 0 0 1-2-2z" />
        <path d="M13 7v10" />
      </>
    ),
    'trending-up': (
      <>
        <path d="M22 7 13.5 15.5 8.5 10.5 2 17" />
        <path d="M16 7h6v6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M6 20a6 6 0 0 1 12 0" />
      </>
    ),
    'user-plus': (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6M16 11h6" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <path d="M20 8a4 4 0 1 1-2 7.5M23 21v-2a4 4 0 0 0-3-3.9" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths[name]}
    </svg>
  )
}
