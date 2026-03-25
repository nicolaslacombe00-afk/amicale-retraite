'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/db'
import { verifyPassword } from '@/src/lib/auth/password'
import { createUserSession, deleteCurrentSession } from '@/src/lib/auth/session'

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    redirect('/login?error=missing')
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.isActive) {
    redirect('/login?error=invalid')
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash)

  if (!isValidPassword) {
    redirect('/login?error=invalid')
  }

  await createUserSession(user.id)
  redirect('/')
}

export async function logoutAction() {
  await deleteCurrentSession()
  redirect('/login')
}
