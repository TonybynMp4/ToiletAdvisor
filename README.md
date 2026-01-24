# ToiletAdvisor

This project structure was initiated with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack).

## Features

- **TypeScript** - For type safety and improved developer experience
- **React Router** - Declarative routing for React
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **MySQL** - Database engine
- **Oxlint** - Oxlint + Oxfmt (linting & formatting)

## Project Structure

```
toiletadvisor/
├── apps/
│   ├── web/         # Frontend application (React + React Router + nginx (serving & reverse proxy))
│   ├── api-server/  # API server (Hono, TRPC)
│   └── auth-server/ # Auth server (Hono, TRPC)
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
│       └── .env.example # CI env
├── packages/
│   └── db/
│       └── .env.example # DB connection env for running migrations locally
│   └── env/ # Type-safe environment management package, defines the environment schema
├── .env.prod.example       # Root env for production
├── .env.dev.example        # Root env for development
└── .env              # Actual env file (gitignored, copy the dev example and fill in values)
```
