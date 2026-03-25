import { Prisma, NewsStatus } from '@prisma/client'
import { prisma } from '@/src/lib/db'

export type NewsListFilters = {
  categorySlug?: string
  query?: string
}

export type PublicNewsCategory = {
  id: string
  name: string
  slug: string
  description: string | null
  count: number
}

export type PublicNewsArticleCard = {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string | null
  publishedAt: Date
  category: {
    name: string
    slug: string
  }
  imageCount: number
}

export type PublicNewsArticleDetail = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  publishedAt: Date | null
  featured: boolean
  category: {
    id: string
    name: string
    slug: string
    description: string | null
  }
  author: {
    name: string
  } | null
  images: {
    id: string
    url: string
    alt: string | null
    caption: string | null
  }[]
}

export type AdminNewsArticleSummary = {
  id: string
  slug: string
  title: string
  status: NewsStatus
  featured: boolean
  publishedAt: Date | null
  updatedAt: Date
  category: {
    name: string
    slug: string
  }
  imageCount: number
}

export type AdminNewsArticleFormData = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImageUrl: string | null
  status: NewsStatus
  featured: boolean
  categoryId: string
  images: {
    id: string
    url: string
    alt: string | null
    caption: string | null
    sortOrder: number
  }[]
}

function buildNewsWhere(filters: NewsListFilters): Prisma.NewsArticleWhereInput {
  const query = filters.query?.trim()

  return {
    status: NewsStatus.PUBLISHED,
    ...(filters.categorySlug
      ? {
          category: {
            slug: filters.categorySlug,
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { excerpt: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } },
            { category: { name: { contains: query, mode: 'insensitive' } } },
          ],
        }
      : {}),
  }
}

export async function listNewsCategories() {
  const categories = await prisma.newsCategory.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          articles: {
            where: {
              status: NewsStatus.PUBLISHED,
            },
          },
        },
      },
    },
  })

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    count: category._count.articles,
  })) satisfies PublicNewsCategory[]
}

export async function listPublishedNews(filters: NewsListFilters = {}) {
  const articles = await prisma.newsArticle.findMany({
    where: buildNewsWhere(filters),
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          images: true,
        },
      },
    },
  })

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt ?? article.createdAt,
    category: article.category,
    imageCount: article._count.images,
  })) satisfies PublicNewsArticleCard[]
}

export async function getPublishedNewsArticle(slug: string) {
  const article = await prisma.newsArticle.findFirst({
    where: {
      slug,
      status: NewsStatus.PUBLISHED,
    },
    include: {
      category: true,
      author: {
        select: {
          name: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  if (!article) {
    return null
  }

  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt,
    content: article.content,
    coverImageUrl: article.coverImageUrl,
    publishedAt: article.publishedAt,
    featured: article.featured,
    category: {
      id: article.category.id,
      name: article.category.name,
      slug: article.category.slug,
      description: article.category.description,
    },
    author: article.author,
    images: article.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: image.caption,
    })),
  } satisfies PublicNewsArticleDetail
}

export async function listAdminNewsArticles() {
  const articles = await prisma.newsArticle.findMany({
    orderBy: [{ updatedAt: 'desc' }],
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          images: true,
        },
      },
    },
  })

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    status: article.status,
    featured: article.featured,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    category: article.category,
    imageCount: article._count.images,
  })) satisfies AdminNewsArticleSummary[]
}

export async function listAdminCategories() {
  return prisma.newsCategory.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })
}

export async function getAdminNewsArticle(id: string) {
  const article = await prisma.newsArticle.findUnique({
    where: { id },
    include: {
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  })

  if (!article) {
    return null
  }

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    content: article.content,
    coverImageUrl: article.coverImageUrl,
    status: article.status,
    featured: article.featured,
    categoryId: article.categoryId,
    images: article.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      caption: image.caption,
      sortOrder: image.sortOrder,
    })),
  } satisfies AdminNewsArticleFormData
}
