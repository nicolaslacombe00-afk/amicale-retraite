export type IconName =
  | 'calendar'
  | 'camera'
  | 'chevron-down'
  | 'chevron-right'
  | 'file-text'
  | 'heart'
  | 'help-circle'
  | 'home'
  | 'linkedin'
  | 'mail'
  | 'message-square'
  | 'newspaper'
  | 'search'
  | 'ticket'
  | 'trending-up'
  | 'user'
  | 'user-plus'
  | 'users'

export type NavItem = {
  label: string
  icon: IconName
  href?: string
  trailing?: boolean
}

export type EventCard = {
  month: string
  day: string
  badge: string
  badgeTone: string
  title: string
  description: string
  attendees: string[]
  cta: string
  filled?: boolean
}

export type NewsItem = {
  category: string
  categoryTone: string
  time: string
  title: string
  description: string
  icon: IconName
}

export type MemberSpotlight = {
  initials: string
  name: string
  joined: string
  tone: string
}

export type QuickLink = {
  title: string
  description: string
  icon: IconName
  tone: string
}

export const primaryNav: NavItem[] = [
  { label: 'Actualites', icon: 'newspaper', trailing: true, href: '/actualites' },
  { label: 'Evenements', icon: 'calendar' },
  { label: 'Membres', icon: 'users' },
  { label: 'Galerie photo', icon: 'camera', trailing: true },
  { label: 'Documents', icon: 'file-text', trailing: true },
]

export const secondaryNav: NavItem[] = [
  { label: "L'Amicale", icon: 'heart', trailing: true },
  { label: 'Mon profil', icon: 'user' },
  { label: 'Aide', icon: 'help-circle' },
]

export const quickLinks: QuickLink[] = [
  {
    title: 'Contacter le bureau',
    description: 'Une question, une idee ?',
    icon: 'mail',
    tone: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Boite a documents',
    description: 'Statuts, CR, formulaires',
    icon: 'file-text',
    tone: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'Billetterie & offres',
    description: 'Decouvrir les bons plans',
    icon: 'ticket',
    tone: 'bg-sky-50 text-sky-600',
  },
]

export const events: EventCard[] = [
  {
    month: 'NOV',
    day: '12',
    badge: 'Rencontre',
    badgeTone: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    title: "Pot d'accueil des nouveaux membres",
    description:
      "Venez faire connaissance avec les dernieres personnes ayant rejoint l'amicale autour d'un verre convivial.",
    attendees: ['bg-indigo-200', 'bg-emerald-200', 'bg-slate-100'],
    cta: 'Participer',
    filled: true,
  },
  {
    month: 'NOV',
    day: '24',
    badge: 'Activite',
    badgeTone: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    title: 'Randonnee Fontainebleau',
    description: 'Parcours de 12 km adapte a tous les niveaux. Prevoir un pique-nique pour le midi.',
    attendees: ['bg-orange-200', 'bg-sky-200'],
    cta: "S'inscrire",
  },
]

export const news: NewsItem[] = [
  {
    category: "Vie de l'amicale",
    categoryTone: 'text-indigo-600',
    time: 'Il y a 2 jours',
    title: 'Retour en images sur la soiree annuelle',
    description: 'Merci aux 120 participants presents lors de notre diner de gala. Consulter la galerie photo.',
    icon: 'camera',
  },
  {
    category: 'Infos pratiques',
    categoryTone: 'text-emerald-600',
    time: 'Il y a 4 jours',
    title: 'Mise a jour du reglement interieur',
    description: 'Nouvelle version disponible dans la section Documents. Ajustements cotisations.',
    icon: 'file-text',
  },
]

export const newcomers: MemberSpotlight[] = [
  {
    initials: 'SL',
    name: 'Sophie Laurent',
    joined: 'Rejoint cette semaine',
    tone: 'bg-orange-100 text-orange-600',
  },
  {
    initials: 'MR',
    name: 'Maxime Rive',
    joined: 'Rejoint il y a 2 semaines',
    tone: 'bg-sky-100 text-sky-600',
  },
]

export const statCards = [
  { value: '142', label: 'Membres actifs' },
  { value: '5', label: 'Clubs internes' },
]
