'use server'

import { NewsStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/db'
import { requireAdminUser } from '@/src/lib/auth/session'

type ParsedImage = {
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

async function buildUniqueSlug(title: string, explicitSlug?: string, excludeId?: string) {
  const base = slugify(explicitSlug?.trim() || title) || `article-${Date.now()}`
  let slug = base
  let suffix = 1

  while (true) {
    const existing = await prisma.newsArticle.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    })

    if (!existing) {
      return slug
    }

    suffix += 1
    slug = `${base}-${suffix}`
  }
}

function parseStatus(value: FormDataEntryValue | null) {
  return value === NewsStatus.DRAFT ? NewsStatus.DRAFT : NewsStatus.PUBLISHED
}

function parseImages(value: string) {
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
      } satisfies ParsedImage
    })
    .filter((image) => image.url)
}

function articlePaths(slug?: string) {
  return ['/actualites', '/admin/actualites', ...(slug ? [`/actualites/${slug}`] : [])]
}

export async function createNewsArticleAction(formData: FormData) {
  const admin = await requireAdminUser()

  const title = String(formData.get('title') || '').trim()
  const excerpt = String(formData.get('excerpt') || '').trim()
  const content = String(formData.get('content') || '').trim()
  const categoryId = String(formData.get('categoryId') || '').trim()
  const coverImageUrl = String(formData.get('coverImageUrl') || '').trim() || null
  const featured = formData.get('featured') === 'on'
  const status = parseStatus(formData.get('status'))
  const images = parseImages(String(formData.get('images') || ''))

  if (!title || !excerpt || !content || !categoryId) {
    redirect('/admin/actualites?error=missing')
  }

  const slug = await buildUniqueSlug(title, String(formData.get('slug') || ''))

  const article = await prisma.newsArticle.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      coverImageUrl,
      featured,
      status,
      publishedAt: status === NewsStatus.PUBLISHED ? new Date() : null,
      authorId: admin.id,
      images: {
        create: images,
      },
    },
  })

  for (const path of articlePaths(article.slug)) {
    revalidatePath(path)
  }

  redirect(`/admin/actualites/${article.id}?success=created`)
}

export async function updateNewsArticleAction(articleId: string, formData: FormData) {
  const admin = await requireAdminUser()

  const current = await prisma.newsArticle.findUnique({
    where: { id: articleId },
    select: {
      id: true,
      slug: true,
      publishedAt: true,
    },
  })

  if (!current) {
    redirect('/admin/actualites?error=missing')
  }

  const title = String(formData.get('title') || '').trim()
  const excerpt = String(formData.get('excerpt') || '').trim()
  const content = String(formData.get('content') || '').trim()
  const categoryId = String(formData.get('categoryId') || '').trim()
  const coverImageUrl = String(formData.get('coverImageUrl') || '').trim() || null
  const featured = formData.get('featured') === 'on'
  const status = parseStatus(formData.get('status'))
  const images = parseImages(String(formData.get('images') || ''))

  if (!title || !excerpt || !content || !categoryId) {
    redirect(`/admin/actualites/${articleId}?error=missing`)
  }

  const slug = await buildUniqueSlug(title, String(formData.get('slug') || ''), articleId)

  await prisma.newsArticle.update({
    where: { id: articleId },
    data: {
      title,
      slug,
      excerpt,
      content,
      categoryId,
      coverImageUrl,
      featured,
      status,
      publishedAt: status === NewsStatus.PUBLISHED ? current.publishedAt ?? new Date() : null,
      authorId: admin.id,
      images: {
        deleteMany: {},
        create: images,
      },
    },
  })

  for (const path of articlePaths(current.slug)) {
    revalidatePath(path)
  }

  for (const path of articlePaths(slug)) {
    revalidatePath(path)
  }

  redirect(`/admin/actualites/${articleId}?success=updated`)
}

export async function deleteNewsArticleAction(articleId: string) {
  await requireAdminUser()

  const current = await prisma.newsArticle.findUnique({
    where: { id: articleId },
    select: {
      slug: true,
    },
  })

  if (!current) {
    redirect('/admin/actualites')
  }

  await prisma.newsArticle.delete({
    where: { id: articleId },
  })

  for (const path of articlePaths(current.slug)) {
    revalidatePath(path)
  }

  redirect('/admin/actualites?success=deleted')
}
