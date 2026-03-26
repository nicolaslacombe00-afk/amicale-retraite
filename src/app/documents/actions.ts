'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuthenticatedUser } from '@/src/lib/auth/session'
import { uploadDocument } from '@/src/lib/intranet'

function withQuery(pathname: string, key: string, value: string) {
  const separator = pathname.includes('?') ? '&' : '?'
  return `${pathname}${separator}${key}=${value}`
}

export async function uploadDocumentAction(formData: FormData) {
  const user = await requireAuthenticatedUser()
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const file = formData.get('file')
  const returnTo = String(formData.get('returnTo') || '/documents').trim()

  if (!title || !(file instanceof File) || file.size === 0) {
    redirect(withQuery(returnTo, 'error', 'missing'))
  }

  await uploadDocument({
    title,
    description,
    file,
    uploadedById: user.id,
  })

  revalidatePath('/documents')
  revalidatePath('/admin')
  redirect(withQuery(returnTo, 'success', 'uploaded'))
}
