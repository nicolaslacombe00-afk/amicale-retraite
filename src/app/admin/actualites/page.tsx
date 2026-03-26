import { redirect } from 'next/navigation'

export default function AdminActualitesPage() {
  redirect('/admin?section=actualites')
}
