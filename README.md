# Vueko (WIP)
Vueko is the API used for BATBALL's Gimmick Emporium (BGE), providing team management, OAuth authentication and invitation systems for the osu!tournament ecosystem.

## Features
- OAuth 2.0 authentication (osu! & Discord)
- Team management with captain/member roles
- Invitation system for team recruitment
- PostgreSQL database with Prisma ORM
- TypeScript for type safety 
- Comprehensive testing (unit + integration)

## Tech Stack 
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Passport.js with OAuth 2.0
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
npx prisma generate
npx prisma migrate deploy
```

### Configuration 
Copy `.env.example` to `.env` and configure: 
    - Database connection (`DATABASE_URL`)
    - OAuth client IDs/secrets (`<PROVIDER>_CLIENT_ID` & `<PROVIDER>_SECRET`)
    - Session secrets (`AUTH_SECRETS`, etc.)

### Running
Development: 
    `npm run dev`
Production: 
    `npm start`
Testing (Unit):
    `npm run test:unit`
Testing (Integration):
    `npm run test:integration`
