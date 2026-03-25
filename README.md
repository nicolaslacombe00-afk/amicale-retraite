# Intranet - Amicale des Retraites RAGT

Projet Next.js 16 pour l'intranet de l'Amicale des Retraites RAGT.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- Auth locale par cookies de session

## Demarrage local

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Application disponible sur `http://localhost:3000`.

## Comptes de demonstration

```text
Admin  -> admin@amicale-ragt.local / Admin2030!
Membre -> membre@amicale-ragt.local / Membre2030!
```

## Git

Le depot local est initialise sur la branche `main`.

Pour associer un remote:

```bash
git remote add origin <url-du-repo>
git push -u origin main
```

## Hebergement O2Switch

Le projet est prepare pour un deploiement Node.js avec `Setup Node.js App`:

- sortie Next.js `standalone`
- fichier de demarrage [`server.js`](/Users/nicolaslacombe/amicale-retraites-ragt/server.js)
- script de build [`scripts/o2switch-deploy.sh`](/Users/nicolaslacombe/amicale-retraites-ragt/scripts/o2switch-deploy.sh)
- fichier [`.cpanel.yml`](/Users/nicolaslacombe/amicale-retraites-ragt/.cpanel.yml)

Configuration recommandee dans cPanel:

1. `Node.js version`: `20`
2. `Application mode`: `production`
3. `Application root`: dossier de l'application, par exemple `/home/<cpanel_user>/apps/amicale-retraites-ragt`
4. `Application URL`: ton domaine ou sous-domaine
5. `Application startup file`: `server.js`

Variables d'environnement a definir:

```bash
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
SESSION_COOKIE_NAME=amicale_session
COOKIE_DOMAIN=votre-domaine.tld
```

## Base PostgreSQL O2Switch

Sur O2Switch, tu peux creer une base PostgreSQL et un utilisateur depuis cPanel.

Sequence recommandee:

1. Cree une base PostgreSQL dediee au projet
2. Cree un utilisateur PostgreSQL dedie
3. Donne tous les droits de cet utilisateur sur la base
4. Renseigne `DATABASE_URL`
5. Lance ensuite:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

## Remarque importante

O2Switch indique que son support PostgreSQL pourrait etre retire a l'avenir et que la version proposee via cPanel est ancienne. Prisma supporte PostgreSQL `9.6+`, donc cela reste compatible a date, mais il est sage de garder ce point en tete pour la suite.

## Depannage preprod

Si `/login` renvoie une erreur serveur juste apres deploiement sur o2switch/cPanel, verifier en priorite les logs Node.js pour Prisma. Le build standalone doit embarquer un moteur Prisma compatible avec l'OS/OpenSSL du serveur cible. Le schema inclut plusieurs `binaryTargets` Linux pour couvrir les variantes Debian et RHEL les plus courantes, puis il faut relancer:

```bash
npm run db:generate
npm run build
```

## Deploiement automatique GitHub Actions

Le repo inclut un workflow [`.github/workflows/deploy.yml`](/Users/nicolaslacombe/amicale-retraites-ragt/.github/workflows/deploy.yml) qui deploie automatiquement sur chaque `push` vers `main`.

Le workflow:

- envoie le code source sur le serveur en SSH
- conserve le fichier `.env` deja present sur le serveur
- lance [`scripts/o2switch-deploy.sh`](/Users/nicolaslacombe/amicale-retraites-ragt/scripts/o2switch-deploy.sh)
- tente un redemarrage via `tmp/restart.txt`

Secrets GitHub a creer dans `Settings > Secrets and variables > Actions`:

- `SSH_HOST`: nom de domaine ou IP du serveur
- `SSH_PORT`: port SSH, generalement `22`
- `SSH_USERNAME`: utilisateur SSH
- `SSH_PRIVATE_KEY`: cle privee de deploiement
- `APP_PATH`: chemin absolu de l'application sur le serveur, par exemple `/home/<cpanel_user>/apps/amicale-retraites-ragt`

Pre-requis cote serveur:

- l'application Node.js existe deja dans cPanel
- le fichier `.env` est deja present dans `APP_PATH`
- SSH est actif pour le compte
- `APP_PATH` pointe bien sur la racine du projet
