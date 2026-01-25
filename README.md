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

## Getting Started
1. **Clone the repository:**
   ```bash
   git clone https://github.com/tonybynmp4/toiletadvisor
   cd toiletadvisor
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   ```
3. **Set up environment variables:**
   - Copy the example environment files and fill in the required values:
	 ```bash
	 cp .env.dev.example .env
	 cp packages/db/.env.example packages/db/.env
	 ```
4. **Run the development environment using Docker:**
   ```bash
   pnpm dev
   ```
5. **Access the application:**
   - Frontend: `http://localhost:5173`
   - DB: `localhost:3307` (using the credentials from your `.env` file)

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
