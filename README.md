# Vueko (WIP)
Vueko is the API used for BATBALL's Gimmick Emporium (BGE), providing team management, OAuth authentication and invitation systems for the osu!tournament ecosystem.

## Features
- OAuth 2.0 authentication (osu! & Discord)
- Team management with captain/member roles
- Invitation system for team recruitment
- PostgreSQL database with Prisma ORM
- TypeScript for type safety
- Comprehensive testing (unit + integration)
- Integrated React admin panel

## Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Passport.js with OAuth 2.0
- **Frontend**: React 19 with Vite
- **Testing**: Vitest
- **CI/CD**: Github Actions

## Quick Start
### Prerequisites
- Node.js 20+
- PostgreSQL database or Neon account
- OAuth credentials for osu! or Discord

### Installation
```bash
npm install
cd admin && npm install && cd ..
npx prisma generate
npx prisma migrate deploy
```

### Configuration
Copy `.env.example` to `.env` and configure:
    - Database connection (`DATABASE_URL`)
    - OAuth client IDs/secrets (`<PROVIDER>_CLIENT_ID` & `<PROVIDER>_SECRET`)
    - Session secrets (`SESSION_SECRET`)

Copy `admin/.env.example` to `admin/.env` and configure:
    - API URL (`VITE_API_URL=http://localhost:3000` for development, `/` for production)
    - Note: The root `npm run build` script automatically sets `VITE_API_URL=/` for production builds

### Running
**Development (backend only):**
    `npm run dev`

**Development (full-stack):**
    `npm run dev:all`

**Production:**
    `npm run build`  # Build React admin panel
    `npm start`      # Start Express server (serves both API and React app)

**Testing (Unit):**
    `npm run test:unit`

**Testing (Integration):**
    `npm run test:integration`
