# Base Next.js 16 + Supabase + Prisma

Socle vierge pour repartir de zero avec la meme stack technique:

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma
- Supabase
- next-intl

## Demarrage local

```bash
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

Application disponible sur `http://localhost:3000`.

## Base de donnees

Pour synchroniser le schema Prisma sur une base vide:

```bash
npm run db:push
```

## Git

Le depot local est initialise sur la branche `main`.

Pour associer un remote plus tard:

```bash
git remote add origin <url-du-repo>
git push -u origin main
```
