# Vueko Admin Panel

React-based admin panel for the Vueko API (BGE - BATBALL's Gimmick Emporium).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` to set your API URL:
```
VITE_API_URL=http://localhost:3000
```

## Development

Run the development server:
```bash
npm run dev
```

Or from the root directory:
```bash
npm run admin:dev
```

The admin panel will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

Or from the root directory:
```bash
npm run admin:build
```

## Features

- **Authentication**: OAuth integration with Discord and osu!
- **Dashboard**: Overview of user information and system status
- **User Management**: View and manage user accounts
- **Team Management**: Create and manage tournament teams
- **Invitation System**: Handle team invitations and requests

## API Integration

The admin panel connects to the Vueko API through configured proxy settings in `vite.config.ts`. The following endpoints are proxied:

- `/auth/*` - OAuth authentication
- `/api/*` - API endpoints
- `/logout` - Logout endpoint

## Architecture

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **Axios** - HTTP client

## Directory Structure

```
admin/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/      # React contexts (Auth, etc.)
│   ├── lib/           # Utilities and API clients
│   ├── pages/         # Page components
│   ├── types/         # TypeScript type definitions
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── public/            # Static assets
└── package.json       # Dependencies and scripts
```