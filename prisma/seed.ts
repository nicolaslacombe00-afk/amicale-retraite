import { PrismaClient, UserRole } from '@prisma/client'
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

  for (const user of users) {
    await prisma.user.upsert({
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
  }

  console.log('Seed auth termine.')
  console.log('Admin  -> admin@amicale-ragt.local / Admin2030!')
  console.log('Membre -> membre@amicale-ragt.local / Membre2030!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
