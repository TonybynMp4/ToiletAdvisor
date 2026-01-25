# ToiletAdvisor

Ce projet a été structuré à partir d'un template [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack).

## Technologies Utilisées

- **TypeScript** - Pour la "type safety" sur l'ensemble du projet & une meilleure expérience développeur
- **React Router** - Routeur pour React, Plus simple et plus léger que Next.js
- **React** - On le présente plus, le seul vrai framework.
- **TailwindCSS** - Utility-first CSS pour un développement rapide de l'interface utilisateur
- **shadcn/ui & Base-ui** - Je jure j'utilisais ça avant que l'IA le rende populaire
- **Hono** - Framework serveur léger et performant
- **Express** - Framework serveur classique (utilisé pour uploadthing parcequ'ils ont pas d'adapter hono)
- **tRPC** - APIs sécurisées de bout en bout (similaire à GraphQL)
- **Node.js** - J'allais pas faire du PHP j'suis pas a la retraite
- **Drizzle** - ORM qui pue pas contrairement à Prisma
- **MySQL** - Pourquoi prendre autre chose ?
- **Oxlint** - Oxlint + Oxfmt (linting & formatting), pour tester, au final performant mais pas ouf niveau plugins dispos
- **pnpm** - Gestionnaire NPM rapide et efficace en espace disque (+ monorepo, + sécurité)
- **Docker** - Conteneurisation (imagine t'utilise pas docker dans le projet pour le cours de docker la wonte)
- **nginx** - Serveur web et reverse proxy, parce-que c'est demandé
- **GitHub Actions** - Workflows CI, toujours cool de voir des checks vert
- **Uploadthing** - Gestion des uploads de fichiers (parceque c'est galère à faire (bien) soit même)

## Architecture

Le projet est organisé en monorepo avec plusieurs applications et packages partagés:

- **apps/web**: Frontend React
- **apps/api-server**: Serveur API principal -> expose l'API TRPC avec Hono
- **apps/auth-server**: Serveur d'authentification -> expose l'API TRPC avec Hono
- **apps/file-server**: Serveur d'upload des fichiers (API qui renvoi vers uploadthing)
- **packages/api**: API tRPC avec la logique métier
- **packages/auth**: API d'authentification tRPC, session-based avec Redis stockés avec cookies httpOnly
- **packages/db**: Schéma de base de données, requêtes et migrations
- **packages/env**: Schémas de variables d'environnement typées, valide les variables d'environnement au runtime & build time

## Démarrage

Le token d'API Uploadthing est requis pour l'upload de fichiers, sinon le reste de l'application fonctionnera normalement. (c'est gratuit)

1. **Cloner le repository:**
    ```bash
    git clone https://github.com/tonybynmp4/toiletadvisor
    cd toiletadvisor
    ```
2. **Installer les dépendances:**
    ```bash
    pnpm i
    ```
3. **Configurer les variables d'environnement:**
    - Copier les fichiers d'exemple d'environnement et remplir les valeurs requises:
    ```bash
    cp .env.dev.example .env
    cp packages/db/.env.example packages/db/.env
    ```
4. **Lancer l'environnement de développement avec Docker:**
    ```bash
    pnpm dev
    ```
5. **Accéder à l'application:**
    - Frontend: `http://localhost:5173`
    - DB: `localhost:3307` (en utilisant les identifiants de votre fichier `.env`)

## Structure du Projet

```
toiletadvisor/
├── apps/
│   ├── web/         # Frontend application (React + React Router + nginx (serving & reverse proxy))
│   ├── api-server/  # API server (Hono, TRPC)
│   └── auth-server/ # Auth server (Hono, TRPC)
│   └── file-server/ # File server (Express, Uploadthing)
├── packages/
│   ├── api/         # API
│   ├── auth/        # Auth API
│   ├── env/         # Environment variable management
│   └── db/          # Database schema, queries and migrations server
├── scripts/        # Utility scripts
```

### Env structure

```
toiletadvisor/
├── apps/
│   ├── web/
│   │   └── .env.example # CI env
│   ├── api-server/
│   │   └── .env.example # CI env
│   └── auth-server/
│   │   └── .env.example # CI env
│   └── file-server/
│       └── .env.example # CI env
├── packages/
│   └── db/
│       └── .env.example 	# DB connection env for running migrations locally
│   └── env/				# Type-safe environment management package, defines the environment schema
├── .env.prod.example       # Root env for production
├── .env.dev.example        # Root env for development
└── .env             		# Actual env file (gitignored, copy the dev example and fill in values)
```
