import { PrismaClient, UserRole, NewsStatus } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  const users = [
    {
      email: 'admin@amicale-ragt.local',
      name: 'Jean-Pierre Martin',
      password: 'Admin2030!',
      role: UserRole.ADMIN,
    },
    {
      email: 'membre@amicale-ragt.local',
      name: 'Sophie Laurent',
      password: 'Membre2030!',
      role: UserRole.USER,
    },
  ] as const

  const userByEmail = new Map<string, string>()

  for (const user of users) {
    const savedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: true,
        passwordHash: await hashPassword(user.password),
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: true,
        passwordHash: await hashPassword(user.password),
      },
    })

    userByEmail.set(savedUser.email, savedUser.id)
  }

  const categories = [
    {
      slug: 'vie-amicale',
      name: "Vie de l'amicale",
      description: 'Rencontres, moments conviviaux, retours sur les evenements marquants.',
    },
    {
      slug: 'infos-pratiques',
      name: 'Infos pratiques',
      description: 'Informations utiles, rappels logistiques, points administratifs.',
    },
    {
      slug: 'evenements',
      name: 'Evenements',
      description: 'Sorties, ateliers, visites et rendez-vous a venir.',
    },
  ] as const

  for (const category of categories) {
    await prisma.newsCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    })
  }

  const categoryMap = new Map(
    (
      await prisma.newsCategory.findMany({
        select: {
          id: true,
          slug: true,
        },
      })
    ).map((category) => [category.slug, category.id]),
  )

  const articles = [
    {
      slug: 'retour-sur-la-soiree-annuelle',
      title: 'Retour sur la soiree annuelle de l amicale',
      excerpt:
        "Pres de 120 participants se sont retrouves dans une ambiance chaleureuse pour partager un diner, des souvenirs et de nouveaux projets.",
      content:
        "La soiree annuelle a une nouvelle fois reuni les membres de l amicale autour d un moment de partage tres attendu.\n\nAu programme cette annee : accueil des nouveaux adherents, point sur les activites a venir et une sequence photo qui a rencontre un tres joli succes.\n\nLe bureau remercie chaleureusement toutes les personnes presentes ainsi que les benevoles qui ont prepare la salle, l accueil et la coordination de la soiree.",
      coverImageUrl:
        'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      featured: true,
      status: NewsStatus.PUBLISHED,
      categorySlug: 'vie-amicale',
      authorEmail: 'admin@amicale-ragt.local',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
          alt: 'Participants autour des tables',
          caption: 'Un tres beau moment de convivialite en ouverture de soiree.',
        },
        {
          url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
          alt: 'Discours dans la salle',
          caption: 'Le mot du president avant le diner.',
        },
      ],
    },
    {
      slug: 'mise-a-jour-du-reglement-interieur',
      title: 'Mise a jour du reglement interieur',
      excerpt:
        "Une nouvelle version du reglement interieur est disponible avec quelques clarifications sur les inscriptions et les participations aux sorties.",
      content:
        "Le bureau a valide une nouvelle version du reglement interieur.\n\nCette mise a jour vise surtout a clarifier les modalites d inscription aux sorties et a rappeler quelques regles simples de fonctionnement pour faciliter l organisation.\n\nLe document complet reste disponible dans l espace documentaire et sera presente lors de la prochaine reunion d information.",
      coverImageUrl:
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
      featured: false,
      status: NewsStatus.PUBLISHED,
      categorySlug: 'infos-pratiques',
      authorEmail: 'admin@amicale-ragt.local',
      images: [],
    },
    {
      slug: 'sortie-culturelle-a-rodez',
      title: 'Sortie culturelle a Rodez en preparation',
      excerpt:
        "Une visite culturelle suivie d un dejeuner convivial est en cours d organisation pour le mois prochain. Les pre-inscriptions sont ouvertes.",
      content:
        "Le bureau travaille actuellement sur une sortie a Rodez qui combinera visite, temps libre et dejeuner en commun.\n\nL objectif est de proposer une formule simple, accessible et conviviale, avec un rythme adapte a tous.\n\nLes membres interesses peuvent deja se signaler afin d aider a finaliser l organisation et les reservations.",
      coverImageUrl:
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      featured: false,
      status: NewsStatus.PUBLISHED,
      categorySlug: 'evenements',
      authorEmail: 'admin@amicale-ragt.local',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1200&q=80',
          alt: 'Rue animee',
          caption: 'Une idee de parcours pour la prochaine visite.',
        },
      ],
    },
  ] as const

  for (const article of articles) {
    const existing = await prisma.newsArticle.findUnique({
      where: { slug: article.slug },
      select: { id: true },
    })

    if (existing) {
      await prisma.newsImage.deleteMany({
        where: {
          articleId: existing.id,
        },
      })

      await prisma.newsArticle.update({
        where: { id: existing.id },
        data: {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          coverImageUrl: article.coverImageUrl,
          featured: article.featured,
          status: article.status,
          publishedAt: new Date(),
          categoryId: categoryMap.get(article.categorySlug)!,
          authorId: userByEmail.get(article.authorEmail)!,
          images: {
            create: article.images.map((image, index) => ({
              ...image,
              sortOrder: index,
            })),
          },
        },
      })
    } else {
      await prisma.newsArticle.create({
        data: {
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          coverImageUrl: article.coverImageUrl,
          featured: article.featured,
          status: article.status,
          publishedAt: new Date(),
          categoryId: categoryMap.get(article.categorySlug)!,
          authorId: userByEmail.get(article.authorEmail)!,
          images: {
            create: article.images.map((image, index) => ({
              ...image,
              sortOrder: index,
            })),
          },
        },
      })
    }
  }

  console.log('Seed auth termine.')
  console.log('Admin  -> admin@amicale-ragt.local / Admin2030!')
  console.log('Membre -> membre@amicale-ragt.local / Membre2030!')
  console.log('Seed actualites termine.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
