import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { UserRole } from '@prisma/client'
import { prisma } from '@/src/lib/db'

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30

export type AuthenticatedUser = {
  id: string
  email: string
  name: string
  role: UserRole
}

function getSessionCookieName() {
  return process.env.SESSION_COOKIE_NAME || 'amicale_session'
}

function shouldUseSecureCookie() {
  const configuredValue = process.env.SESSION_COOKIE_SECURE

  if (configuredValue === 'true') {
    return true
  }

  if (configuredValue === 'false') {
    return false
  }

  return process.env.NODE_ENV === 'production'
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: shouldUseSecureCookie(),
    expires: expiresAt,
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined,
  }
}

export async function createUserSession(userId: string) {
  const cookieStore = await cookies()
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(token),
      userId,
      expiresAt,
    },
  })

  cookieStore.set(getSessionCookieName(), token, getSessionCookieOptions(expiresAt))
}

export async function deleteCurrentSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getSessionCookieName())?.value

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    })
  }

  cookieStore.delete(getSessionCookieName())
}

export async function getAuthenticatedUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(getSessionCookieName())?.value

  if (!token) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      },
    },
  })

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    return null
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  } satisfies AuthenticatedUser
}

export async function requireAuthenticatedUser() {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect('/login')
  }

  return user
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser()

  if (user.role !== 'ADMIN') {
    redirect('/')
  }

  return user
}
