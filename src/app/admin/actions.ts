'use server'

import { EventStatus, NavigationSection, UserRole } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import { requireAdminUser } from '@/src/lib/auth/session'
import { prisma } from '@/src/lib/db'
import { uploadDocument } from '@/src/lib/intranet'

type ParsedPhoto = {
  url: string
  alt: string | null
  caption: string | null
  sortOrder: number
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

function withQuery(pathname: string, key: string, value: string) {
  const separator = pathname.includes('?') ? '&' : '?'
  return `${pathname}${separator}${key}=${value}`
}

function parseDate(value: FormDataEntryValue | null) {
  const input = String(value || '').trim()

  if (!input) {
    return null
  }

  const parsed = new Date(input)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parseNavigationSection(value: FormDataEntryValue | null) {
  return value === NavigationSection.SECONDARY ? NavigationSection.SECONDARY : NavigationSection.PRIMARY
}

function parsePhotos(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [urlPart, altPart, captionPart] = line.split('|').map((segment) => segment?.trim() || '')

      return {
        url: urlPart,
        alt: altPart || null,
        caption: captionPart || null,
        sortOrder: index,
      } satisfies ParsedPhoto
    })
    .filter((photo) => photo.url)
}

async function buildUniqueEventSlug(title: string) {
  const base = slugify(title) || `evenement-${Date.now()}`
  let slug = base
  let suffix = 1

  while (true) {
    const existing = await prisma.event.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existing) {
      return slug
    }

    suffix += 1
    slug = `${base}-${suffix}`
  }
}

async function buildUniqueAlbumSlug(title: string) {
  const base = slugify(title) || `album-${Date.now()}`
  let slug = base
  let suffix = 1

  while (true) {
    const existing = await prisma.photoAlbum.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!existing) {
      return slug
    }

    suffix += 1
    slug = `${base}-${suffix}`
  }
}

function revalidateBackOffice(paths: string[]) {
  for (const currentPath of paths) {
    revalidatePath(currentPath)
  }
}

export async function createEventAction(formData: FormData) {
  await requireAdminUser()

  const title = String(formData.get('title') || '').trim()
  const summary = String(formData.get('summary') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const location = String(formData.get('location') || '').trim()
  const coverImageUrl = String(formData.get('coverImageUrl') || '').trim() || null
  const startAt = parseDate(formData.get('startAt'))
  const endAt = parseDate(formData.get('endAt'))
  const returnTo = String(formData.get('returnTo') || '/admin/evenements').trim()
  const status = formData.get('status') === EventStatus.COMPLETED ? EventStatus.COMPLETED : EventStatus.UPCOMING

  if (!title || !summary || !description || !location || !startAt) {
    redirect(withQuery(returnTo, 'error', 'missing'))
  }

  await prisma.event.create({
    data: {
      title,
      slug: await buildUniqueEventSlug(title),
      summary,
      description,
      location,
      coverImageUrl,
      startAt,
      endAt,
      status,
    },
  })

  revalidateBackOffice(['/admin', '/evenements'])
  redirect(withQuery(returnTo, 'success', 'event-created'))
}

export async function deleteEventAction(eventId: string, returnTo = '/admin/evenements') {
  await requireAdminUser()

  await prisma.event.delete({
    where: { id: eventId },
  })

  revalidateBackOffice(['/admin', '/evenements', '/galerie-photo'])
  redirect(withQuery(returnTo, 'success', 'event-deleted'))
}

export async function updateMemberAction(memberId: string, formData: FormData) {
  await requireAdminUser()

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const city = String(formData.get('city') || '').trim() || null
  const phone = String(formData.get('phone') || '').trim() || null
  const formerJobTitle = String(formData.get('formerJobTitle') || '').trim() || null
  const formerDepartment = String(formData.get('formerDepartment') || '').trim() || null
  const bio = String(formData.get('bio') || '').trim() || null
  const avatarUrl = String(formData.get('avatarUrl') || '').trim() || null
  const joinedAmicaleAt = parseDate(formData.get('joinedAmicaleAt'))
  const role = formData.get('role') === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER
  const isActive = formData.get('isActive') === 'on'
  const returnTo = String(formData.get('returnTo') || '/admin/membres').trim()

  if (!name || !email) {
    redirect(withQuery(returnTo, 'error', 'missing'))
  }

  await prisma.user.update({
    where: { id: memberId },
    data: {
      name,
      email,
      city,
      phone,
      formerJobTitle,
      formerDepartment,
      bio,
      avatarUrl,
      joinedAmicaleAt,
      role,
      isActive,
    },
  })

  revalidateBackOffice(['/admin', '/membres', `/membres/${memberId}`])
  redirect(withQuery(returnTo, 'success', 'member-updated'))
}

export async function createPhotoAlbumAction(formData: FormData) {
  await requireAdminUser()

  const title = String(formData.get('title') || '').trim()
  const summary = String(formData.get('summary') || '').trim()
  const coverImageUrl = String(formData.get('coverImageUrl') || '').trim() || null
  const eventId = String(formData.get('eventId') || '').trim() || null
  const returnTo = String(formData.get('returnTo') || '/admin/galerie-photo').trim()
  const photos = parsePhotos(String(formData.get('photos') || ''))

  if (!title || !summary) {
    redirect(withQuery(returnTo, 'error', 'missing'))
  }

  await prisma.photoAlbum.create({
    data: {
      title,
      slug: await buildUniqueAlbumSlug(title),
      summary,
      coverImageUrl,
      eventId,
      photos: {
        create: photos,
      },
    },
  })

  revalidateBackOffice(['/admin', '/galerie-photo'])
  redirect(withQuery(returnTo, 'success', 'album-created'))
}

export async function deletePhotoAlbumAction(albumId: string, returnTo = '/admin/galerie-photo') {
  await requireAdminUser()

  await prisma.photoAlbum.delete({
    where: { id: albumId },
  })

  revalidateBackOffice(['/admin', '/galerie-photo'])
  redirect(withQuery(returnTo, 'success', 'album-deleted'))
}

export async function uploadAdminDocumentAction(formData: FormData) {
  const admin = await requireAdminUser()
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const file = formData.get('file')
  const returnTo = String(formData.get('returnTo') || '/admin/documents').trim()

  if (!title || !(file instanceof File) || file.size === 0) {
    redirect(withQuery(returnTo, 'error', 'missing'))
  }

  await uploadDocument({
    title,
    description,
    file,
    uploadedById: admin.id,
  })

  revalidateBackOffice(['/admin', '/documents'])
  redirect(withQuery(returnTo, 'success', 'document-uploaded'))
}

export async function deleteDocumentAction(documentId: string, returnTo = '/admin/documents') {
  await requireAdminUser()

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      filePath: true,
    },
  })

  if (!document) {
    redirect(returnTo)
  }

  await prisma.document.delete({
    where: { id: documentId },
  })

  if (document.filePath.startsWith('/uploads/documents/')) {
    const absolutePath = path.join(process.cwd(), 'public', document.filePath.replace(/^\//, ''))

    try {
      await unlink(absolutePath)
    } catch {
      // Ignore missing files so content cleanup never blocks the admin flow.
    }
  }

  revalidateBackOffice(['/admin', '/documents'])
  redirect(withQuery(returnTo, 'success', 'document-deleted'))
}

export async function createNavigationItemAction(formData: FormData) {
  await requireAdminUser()

  const label = String(formData.get('label') || '').trim()
  const href = String(formData.get('href') || '').trim() || null
  const icon = String(formData.get('icon') || '').trim() || 'home'
  const sortOrder = Number(String(formData.get('sortOrder') || '0')) || 0
  const parentId = String(formData.get('parentId') || '').trim() || null
  const returnTo = String(formData.get('returnTo') || '/admin/navigation').trim()
  const section = parseNavigationSection(formData.get('section'))
  const isVisible = formData.get('isVisible') === 'on'

  if (!label) {
    redirect(withQuery(returnTo, 'error', 'missing'))
  }

  await prisma.navigationItem.create({
    data: {
      label,
      href,
      icon,
      sortOrder,
      section,
      parentId,
      isVisible,
    },
  })

  revalidateBackOffice(['/admin', returnTo])
  redirect(withQuery(returnTo, 'success', 'nav-created'))
}

export async function updateNavigationItemAction(itemId: string, formData: FormData) {
  await requireAdminUser()

  const label = String(formData.get('label') || '').trim()
  const href = String(formData.get('href') || '').trim() || null
  const icon = String(formData.get('icon') || '').trim() || 'home'
  const sortOrder = Number(String(formData.get('sortOrder') || '0')) || 0
  const parentId = String(formData.get('parentId') || '').trim() || null
  const returnTo = String(formData.get('returnTo') || '/admin/navigation').trim()
  const section = parseNavigationSection(formData.get('section'))
  const isVisible = formData.get('isVisible') === 'on'

  if (!label) {
    redirect(withQuery(returnTo, 'error', 'missing'))
  }

  await prisma.navigationItem.update({
    where: { id: itemId },
    data: {
      label,
      href,
      icon,
      sortOrder,
      section,
      parentId,
      isVisible,
    },
  })

  revalidateBackOffice(['/admin', returnTo])
  redirect(withQuery(returnTo, 'success', 'nav-updated'))
}

export async function deleteNavigationItemAction(itemId: string, returnTo = '/admin/navigation') {
  await requireAdminUser()

  await prisma.navigationItem.delete({
    where: { id: itemId },
  })

  revalidateBackOffice(['/admin', returnTo])
  redirect(withQuery(returnTo, 'success', 'nav-deleted'))
}
