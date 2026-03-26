import { PrismaClient, UserRole, NewsStatus, EventStatus, NavigationSection } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

async function main() {
  const users = [
    {
      email: 'admin@amicale-ragt.local',
      name: 'Jean-Pierre Martin',
      password: 'Admin2030!',
      role: UserRole.ADMIN,
      city: 'Rodez',
      phone: '06 12 34 56 78',
      formerJobTitle: 'Responsable logistique',
      formerDepartment: 'Exploitation agricole',
      bio: "Passionne de randonnee et membre actif du bureau, Jean-Pierre anime plusieurs temps forts de l'amicale.",
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80',
      joinedAmicaleAt: new Date('2021-02-10T00:00:00.000Z'),
    },
    {
      email: 'membre@amicale-ragt.local',
      name: 'Sophie Laurent',
      password: 'Membre2030!',
      role: UserRole.USER,
      city: 'Onet-le-Chateau',
      phone: '06 98 76 54 32',
      formerJobTitle: 'Assistante RH',
      formerDepartment: 'Ressources humaines',
      bio: "Sophie aime organiser les sorties culturelles et participer aux ateliers memoire proposes par l'amicale.",
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
      joinedAmicaleAt: new Date('2023-09-18T00:00:00.000Z'),
    },
    {
      email: 'marc@amicale-ragt.local',
      name: 'Marc Lenoir',
      password: 'Marc2030!',
      role: UserRole.USER,
      city: 'Luc-la-Primaube',
      phone: '06 11 22 33 44',
      formerJobTitle: 'Technicien maintenance',
      formerDepartment: 'Services techniques',
      bio: "Marc suit de pres la galerie photo et partage volontiers ses souvenirs de sorties nature.",
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      joinedAmicaleAt: new Date('2022-04-07T00:00:00.000Z'),
    },
    {
      email: 'anne@amicale-ragt.local',
      name: 'Anne Viala',
      password: 'Anne2030!',
      role: UserRole.USER,
      city: 'Villefranche-de-Rouergue',
      phone: '06 55 44 33 22',
      formerJobTitle: 'Chargee communication',
      formerDepartment: 'Communication',
      bio: "Anne coordonne volontiers les comptes-rendus et aide a la mise en forme des documents internes.",
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
      joinedAmicaleAt: new Date('2024-01-12T00:00:00.000Z'),
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
        city: user.city,
        phone: user.phone,
        formerJobTitle: user.formerJobTitle,
        formerDepartment: user.formerDepartment,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        joinedAmicaleAt: user.joinedAmicaleAt,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: true,
        passwordHash: await hashPassword(user.password),
        city: user.city,
        phone: user.phone,
        formerJobTitle: user.formerJobTitle,
        formerDepartment: user.formerDepartment,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        joinedAmicaleAt: user.joinedAmicaleAt,
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

  const events = [
    {
      slug: 'pot-accueil-nouveaux-membres',
      title: "Pot d'accueil des nouveaux membres",
      summary: 'Une rencontre conviviale pour accueillir les nouveaux adherents de l amicale.',
      description:
        "Cette rencontre est pensee comme un temps simple et chaleureux pour faire connaissance avec les nouveaux membres.\n\nLe bureau presentera les activites a venir, les groupes de sortie et les habitudes de fonctionnement de l amicale.\n\nUn buffet leger cloturera la soiree afin de laisser place aux echanges informels.",
      location: 'Maison des associations de Rodez',
      coverImageUrl: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
      startAt: new Date('2026-11-12T18:30:00.000Z'),
      endAt: new Date('2026-11-12T21:00:00.000Z'),
      status: EventStatus.UPCOMING,
    },
    {
      slug: 'randonnee-fontainebleau',
      title: 'Randonnee Fontainebleau',
      summary: 'Une journee au vert avec un parcours adapte a tous les niveaux.',
      description:
        "La randonnee de Fontainebleau fait partie des sorties preferees des membres.\n\nCette edition proposera un parcours de 12 km, avec plusieurs haltes et un pique-nique partage.\n\nLe rendez-vous est prevu tot le matin afin de profiter au maximum de la journee.",
      location: 'Depart parking du stade - Fontainebleau',
      coverImageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      startAt: new Date('2026-11-24T08:00:00.000Z'),
      endAt: new Date('2026-11-24T17:30:00.000Z'),
      status: EventStatus.UPCOMING,
    },
    {
      slug: 'visite-culturelle-rodez',
      title: 'Visite culturelle a Rodez',
      summary: 'Retour sur une sortie culturelle tres appreciee en centre-ville.',
      description:
        "Une trentaine de membres ont participe a la visite culturelle organisee a Rodez.\n\nLe groupe a alterne patrimoine local, visite guidee et dejeuner convivial.\n\nCette sortie servira de base pour les prochains rendez-vous culturels de la saison.",
      location: 'Centre historique de Rodez',
      coverImageUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
      startAt: new Date('2026-09-18T09:00:00.000Z'),
      endAt: new Date('2026-09-18T16:30:00.000Z'),
      status: EventStatus.COMPLETED,
    },
  ] as const

  for (const event of events) {
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: event,
      create: event,
    })
  }

  const eventMap = new Map(
    (
      await prisma.event.findMany({
        select: {
          id: true,
          slug: true,
        },
      })
    ).map((event) => [event.slug, event.id]),
  )

  const albums = [
    {
      slug: 'soiree-annuelle-2026',
      title: 'Soiree annuelle 2026',
      summary: 'Les meilleurs moments de la soiree annuelle en images.',
      coverImageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
      eventSlug: 'pot-accueil-nouveaux-membres',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
          alt: 'Discours de bienvenue',
          caption: "Le mot d'accueil du bureau.",
        },
        {
          url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
          alt: 'Tables pendant la soiree',
          caption: 'Un beau moment de convivialite partagee.',
        },
      ],
    },
    {
      slug: 'visite-culturelle-rodez-2026',
      title: 'Visite culturelle a Rodez',
      summary: 'Album photo de la derniere sortie culturelle en centre-ville.',
      coverImageUrl: 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1200&q=80',
      eventSlug: 'visite-culturelle-rodez',
      photos: [
        {
          url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
          alt: 'Ruelle de centre-ville',
          caption: 'Le groupe pendant la promenade guidee.',
        },
        {
          url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
          alt: 'Photo de groupe',
          caption: 'Photo souvenir avant le dejeuner.',
        },
      ],
    },
  ] as const

  for (const album of albums) {
    const existingAlbum = await prisma.photoAlbum.findUnique({
      where: { slug: album.slug },
      select: { id: true },
    })

    if (existingAlbum) {
      await prisma.photoItem.deleteMany({
        where: {
          albumId: existingAlbum.id,
        },
      })

      await prisma.photoAlbum.update({
        where: { id: existingAlbum.id },
        data: {
          title: album.title,
          summary: album.summary,
          coverImageUrl: album.coverImageUrl,
          eventId: eventMap.get(album.eventSlug) ?? null,
          photos: {
            create: album.photos.map((photo, index) => ({
              ...photo,
              sortOrder: index,
            })),
          },
        },
      })
    } else {
      await prisma.photoAlbum.create({
        data: {
          slug: album.slug,
          title: album.title,
          summary: album.summary,
          coverImageUrl: album.coverImageUrl,
          eventId: eventMap.get(album.eventSlug) ?? null,
          photos: {
            create: album.photos.map((photo, index) => ({
              ...photo,
              sortOrder: index,
            })),
          },
        },
      })
    }
  }

  const documents = [
    {
      slug: 'reglement-interieur-2026',
      title: 'Reglement interieur 2026',
      description: "Version actualisee du reglement interieur de l'amicale.",
      fileName: 'reglement-interieur-2026.txt',
      filePath: '/documents/reglement-interieur-2026.txt',
      mimeType: 'text/plain',
      sizeBytes: 1820,
      uploadedByEmail: 'admin@amicale-ragt.local',
    },
    {
      slug: 'compte-rendu-assemblee-generale',
      title: "Compte-rendu de l'assemblee generale",
      description: 'Synthese des decisions et points marquants de la derniere assemblee generale.',
      fileName: 'compte-rendu-ag.txt',
      filePath: '/documents/compte-rendu-ag.txt',
      mimeType: 'text/plain',
      sizeBytes: 2411,
      uploadedByEmail: 'anne@amicale-ragt.local',
    },
  ] as const

  for (const document of documents) {
    await prisma.document.upsert({
      where: { slug: document.slug },
      update: {
        title: document.title,
        description: document.description,
        fileName: document.fileName,
        filePath: document.filePath,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        uploadedById: userByEmail.get(document.uploadedByEmail)!,
      },
      create: {
        title: document.title,
        slug: document.slug,
        description: document.description,
        fileName: document.fileName,
        filePath: document.filePath,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        uploadedById: userByEmail.get(document.uploadedByEmail)!,
      },
    })
  }

  const navigationItems = [
    {
      key: 'home',
      label: 'Accueil',
      href: null,
      icon: 'home',
      section: NavigationSection.PRIMARY,
      sortOrder: 0,
      parentKey: null,
    },
    {
      key: 'home-dashboard',
      label: 'Tableau de bord',
      href: '/',
      icon: 'home',
      section: NavigationSection.PRIMARY,
      sortOrder: 0,
      parentKey: 'home',
    },
    {
      key: 'home-important-news',
      label: 'Messages Importants',
      href: '/actualites',
      icon: 'newspaper',
      section: NavigationSection.PRIMARY,
      sortOrder: 1,
      parentKey: 'home',
    },
    {
      key: 'news',
      label: 'Actualites',
      href: '/actualites',
      icon: 'newspaper',
      section: NavigationSection.PRIMARY,
      sortOrder: 1,
      parentKey: null,
    },
    {
      key: 'events',
      label: 'Evenements',
      href: '/evenements',
      icon: 'calendar',
      section: NavigationSection.PRIMARY,
      sortOrder: 2,
      parentKey: null,
    },
    {
      key: 'members',
      label: 'Membres',
      href: '/membres',
      icon: 'users',
      section: NavigationSection.PRIMARY,
      sortOrder: 3,
      parentKey: null,
    },
    {
      key: 'gallery',
      label: 'Galerie photo',
      href: '/galerie-photo',
      icon: 'camera',
      section: NavigationSection.PRIMARY,
      sortOrder: 4,
      parentKey: null,
    },
    {
      key: 'documents',
      label: 'Documents',
      href: '/documents',
      icon: 'file-text',
      section: NavigationSection.PRIMARY,
      sortOrder: 5,
      parentKey: null,
    },
    {
      key: 'amicale',
      label: "L'Amicale",
      href: null,
      icon: 'heart',
      section: NavigationSection.SECONDARY,
      sortOrder: 0,
      parentKey: null,
    },
    {
      key: 'profile',
      label: 'Mon profil',
      href: null,
      icon: 'user',
      section: NavigationSection.SECONDARY,
      sortOrder: 1,
      parentKey: null,
    },
    {
      key: 'help',
      label: 'Aide',
      href: null,
      icon: 'help-circle',
      section: NavigationSection.SECONDARY,
      sortOrder: 2,
      parentKey: null,
    },
  ] as const

  const navIds = new Map<string, string>()

  for (const item of navigationItems.filter((entry) => !entry.parentKey)) {
    const existing = await prisma.navigationItem.findFirst({
      where: {
        label: item.label,
        parentId: null,
        section: item.section,
      },
    })

    const saved = existing
      ? await prisma.navigationItem.update({
          where: { id: existing.id },
          data: {
            href: item.href,
            icon: item.icon,
            sortOrder: item.sortOrder,
            isVisible: true,
          },
        })
      : await prisma.navigationItem.create({
          data: {
            label: item.label,
            href: item.href,
            icon: item.icon,
            section: item.section,
            sortOrder: item.sortOrder,
            isVisible: true,
          },
        })

    navIds.set(item.key, saved.id)
  }

  for (const item of navigationItems.filter((entry) => entry.parentKey)) {
    const parentId = navIds.get(item.parentKey!)

    if (!parentId) {
      continue
    }

    const existing = await prisma.navigationItem.findFirst({
      where: {
        label: item.label,
        parentId,
      },
    })

    if (existing) {
      await prisma.navigationItem.update({
        where: { id: existing.id },
        data: {
          href: item.href,
          icon: item.icon,
          sortOrder: item.sortOrder,
          isVisible: true,
        },
      })
    } else {
      await prisma.navigationItem.create({
        data: {
          label: item.label,
          href: item.href,
          icon: item.icon,
          section: item.section,
          sortOrder: item.sortOrder,
          isVisible: true,
          parentId,
        },
      })
    }
  }

  console.log('Seed auth termine.')
  console.log('Admin  -> admin@amicale-ragt.local / Admin2030!')
  console.log('Membre -> membre@amicale-ragt.local / Membre2030!')
  console.log('Seed actualites termine.')
  console.log('Seed intranet termine.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
