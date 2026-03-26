import { EventStatus } from '@prisma/client'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { prisma } from '@/src/lib/db'

export type EventCardData = {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  location: string
  coverImageUrl: string | null
  startAt: Date
  endAt: Date | null
  status: EventStatus
}

export type MemberDirectoryCard = {
  id: string
  name: string
  city: string | null
  formerJobTitle: string | null
  formerDepartment: string | null
  avatarUrl: string | null
  joinedAmicaleAt: Date | null
}

export type MemberProfile = {
  id: string
  name: string
  email: string
  city: string | null
  phone: string | null
  formerJobTitle: string | null
  formerDepartment: string | null
  bio: string | null
  avatarUrl: string | null
  joinedAmicaleAt: Date | null
}

export type AlbumCardData = {
  id: string
  slug: string
  title: string
  summary: string
  coverImageUrl: string | null
  eventTitle: string | null
  photoCount: number
}

export type AlbumDetail = {
  id: string
  slug: string
  title: string
  summary: string
  coverImageUrl: string | null
  eventTitle: string | null
  photos: {
    id: string
    url: string
    alt: string | null
    caption: string | null
  }[]
}

export type DocumentListItem = {
  id: string
  slug: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  mimeType: string | null
  sizeBytes: number | null
  createdAt: Date
  uploadedBy: {
    name: string
  }
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

async function buildUniqueDocumentSlug(title: string) {
  const base = slugify(title) || `document-${Date.now()}`
  let slug = base
  let suffix = 1

  while (true) {
    const existing = await prisma.document.findUnique({
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

function safeFileName(name: string) {
  const extension = path.extname(name)
  const base = path.basename(name, extension)
  const sanitized = slugify(base) || 'document'
  return `${sanitized}${extension.toLowerCase()}`
}

export async function listUpcomingEvents() {
  return prisma.event.findMany({
    orderBy: [{ startAt: 'asc' }],
    where: {
      status: EventStatus.UPCOMING,
    },
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      location: true,
      coverImageUrl: true,
      startAt: true,
      endAt: true,
      status: true,
    },
  }) satisfies Promise<EventCardData[]>
}

export async function listAllEvents() {
  return prisma.event.findMany({
    orderBy: [{ startAt: 'asc' }],
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      description: true,
      location: true,
      coverImageUrl: true,
      startAt: true,
      endAt: true,
      status: true,
    },
  }) satisfies Promise<EventCardData[]>
}

export async function listDirectoryMembers() {
  return prisma.user.findMany({
    where: {
      isActive: true,
    },
    orderBy: [{ name: 'asc' }],
    select: {
      id: true,
      name: true,
      city: true,
      formerJobTitle: true,
      formerDepartment: true,
      avatarUrl: true,
      joinedAmicaleAt: true,
    },
  }) satisfies Promise<MemberDirectoryCard[]>
}

export async function getMemberProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      city: true,
      phone: true,
      formerJobTitle: true,
      formerDepartment: true,
      bio: true,
      avatarUrl: true,
      joinedAmicaleAt: true,
    },
  }) as Promise<MemberProfile | null>
}

export async function listPhotoAlbums() {
  const albums = await prisma.photoAlbum.findMany({
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
  })

  return albums.map((album) => ({
    id: album.id,
    slug: album.slug,
    title: album.title,
    summary: album.summary,
    coverImageUrl: album.coverImageUrl,
    eventTitle: album.event?.title ?? null,
    photoCount: album._count.photos,
  })) satisfies AlbumCardData[]
}

export async function getPhotoAlbum(slug: string) {
  const album = await prisma.photoAlbum.findUnique({
    where: { slug },
    include: {
      event: {
        select: {
          title: true,
        },
      },
      photos: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  if (!album) {
    return null
  }

  return {
    id: album.id,
    slug: album.slug,
    title: album.title,
    summary: album.summary,
    coverImageUrl: album.coverImageUrl,
    eventTitle: album.event?.title ?? null,
    photos: album.photos.map((photo) => ({
      id: photo.id,
      url: photo.url,
      alt: photo.alt,
      caption: photo.caption,
    })),
  } satisfies AlbumDetail
}

export async function listDocuments() {
  return prisma.document.findMany({
    orderBy: [{ createdAt: 'desc' }],
    include: {
      uploadedBy: {
        select: {
          name: true,
        },
      },
    },
  }) satisfies Promise<DocumentListItem[]>
}

export async function uploadDocument(input: {
  title: string
  description?: string
  file: File
  uploadedById: string
}) {
  const slug = await buildUniqueDocumentSlug(input.title)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
  await mkdir(uploadDir, { recursive: true })

  const timestamp = Date.now()
  const fileName = `${timestamp}-${safeFileName(input.file.name)}`
  const absolutePath = path.join(uploadDir, fileName)
  const publicPath = `/uploads/documents/${fileName}`
  const buffer = Buffer.from(await input.file.arrayBuffer())

  await writeFile(absolutePath, buffer)

  return prisma.document.create({
    data: {
      title: input.title,
      slug,
      description: input.description?.trim() || null,
      fileName: input.file.name,
      filePath: publicPath,
      mimeType: input.file.type || null,
      sizeBytes: input.file.size,
      uploadedById: input.uploadedById,
    },
  })
}
