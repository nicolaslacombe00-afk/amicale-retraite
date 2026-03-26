'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAuthenticatedUser } from '@/src/lib/auth/session'
import { uploadDocument } from '@/src/lib/intranet'

export async function uploadDocumentAction(formData: FormData) {
  const user = await requireAuthenticatedUser()
  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const file = formData.get('file')

  if (!title || !(file instanceof File) || file.size === 0) {
    redirect('/documents?error=missing')
  }

  await uploadDocument({
    title,
    description,
    file,
    uploadedById: user.id,
  })

  revalidatePath('/documents')
  redirect('/documents?success=uploaded')
}
