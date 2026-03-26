import { primaryNav, secondaryNav, type IconName, type NavItem } from '@/src/components/intranet/data'
import { prisma } from '@/src/lib/db'

export type NavigationTreeItem = {
  id: string
  label: string
  href: string | null
  icon: IconName
  section: 'PRIMARY' | 'SECONDARY'
  sortOrder: number
  isVisible: boolean
  children: NavigationTreeItem[]
}

const allowedIcons: IconName[] = [
  'badge',
  'calendar',
  'camera',
  'file-text',
  'heart',
  'help-circle',
  'home',
  'mail',
  'newspaper',
  'search',
  'ticket',
  'trending-up',
  'user',
  'user-plus',
  'users',
]

function asIconName(value: string): IconName {
  return allowedIcons.includes(value as IconName) ? (value as IconName) : 'home'
}

export async function listNavigationTree() {
  try {
    const items = await prisma.navigationItem.findMany({
      where: {
        isVisible: true,
      },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    })

    const rootItems = items.filter((item) => !item.parentId)
    const childItems = items.filter((item) => item.parentId)

    const byParent = new Map<string, typeof childItems>()

    for (const child of childItems) {
      byParent.set(child.parentId!, [...(byParent.get(child.parentId!) || []), child])
    }

    const mapItem = (item: (typeof items)[number]): NavigationTreeItem => ({
      id: item.id,
      label: item.label,
      href: item.href,
      icon: asIconName(item.icon),
      section: item.section,
      sortOrder: item.sortOrder,
      isVisible: item.isVisible,
      children: (byParent.get(item.id) || [])
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((child) => ({
          id: child.id,
          label: child.label,
          href: child.href,
          icon: asIconName(child.icon),
          section: child.section,
          sortOrder: child.sortOrder,
          isVisible: child.isVisible,
          children: [],
        })),
    })

    return {
      primary: rootItems.filter((item) => item.section === 'PRIMARY').map(mapItem),
      secondary: rootItems.filter((item) => item.section === 'SECONDARY').map(mapItem),
    }
  } catch {
    return {
      primary: primaryNav.map((item, index) => fromStaticItem(item, 'PRIMARY', index)),
      secondary: secondaryNav.map((item, index) => fromStaticItem(item, 'SECONDARY', index)),
    }
  }
}

export async function listNavigationAdminItems() {
  try {
    return await prisma.navigationItem.findMany({
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        parent: {
          select: {
            id: true,
            label: true,
          },
        },
        children: {
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          select: {
            id: true,
            label: true,
            href: true,
            icon: true,
            sortOrder: true,
            isVisible: true,
          },
        },
      },
    })
  } catch {
    const fallback = [...primaryNav, ...secondaryNav]

    return fallback.map((item, index) => ({
      id: item.id || `fallback-${index}`,
      label: item.label,
      href: item.href || null,
      icon: item.icon,
      section: index < primaryNav.length ? 'PRIMARY' : 'SECONDARY',
      parentId: null,
      sortOrder: index,
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      parent: null,
      children: (item.children || []).map((child, childIndex) => ({
        id: child.id || `fallback-${index}-${childIndex}`,
        label: child.label,
        href: child.href || null,
        icon: child.icon,
        sortOrder: childIndex,
        isVisible: true,
      })),
    }))
  }
}

export function getNavigationIconOptions() {
  return allowedIcons
}

function fromStaticItem(item: NavItem, section: 'PRIMARY' | 'SECONDARY', sortOrder: number): NavigationTreeItem {
  return {
    id: item.id || `${section}-${sortOrder}-${item.label}`,
    label: item.label,
    href: item.href || null,
    icon: item.icon,
    section,
    sortOrder,
    isVisible: true,
    children: (item.children || []).map((child, childIndex) => fromStaticItem(child, section, childIndex)),
  }
}
