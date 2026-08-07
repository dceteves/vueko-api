# Deployment Guide

This application is bundled - the Express backend serves the React admin panel in production.

## Local Production Testing

```bash
# Build the admin panel and start the server
npm run start

# Or explicitly for production
NODE_ENV=production npm run start:prod
```

## Environment Variables

Required environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secret for session encryption
- `DISCORD_CLIENT_ID` - Discord OAuth app ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth app secret
- `OSU_CLIENT_ID` - osu! OAuth app ID
- `OSU_CLIENT_SECRET` - osu! OAuth app secret
- `OSU_REDIRECT_URI` - osu! OAuth redirect URI

## Deployment Services

### Render (Recommended)

1. Create a PostgreSQL database in Render
2. Create a new Web Service
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Use build command: `npm run build`
6. Use start command: `npm run start:prod`
7. The app will automatically build the React admin panel and serve it

### Railway

1. Create a new project in Railway
2. Add a PostgreSQL database
3. Add your GitHub repository
4. Railway will detect the Node.js setup
5. Set environment variables in Railway dashboard
6. Deploy - Railway will build and run the bundled app

### Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Launch: `fly launch`
4. Add a PostgreSQL database: `fly postgres create`
5. Set environment variables: `fly secrets set ...`
6. Deploy: `fly deploy`

## Build Process

The build process:
1. Runs `npm run build:admin` which builds the React app to `admin/dist/`
2. Express serves static files from `admin/dist/` in production
3. API routes are served from `/api`, `/auth`, `/logout`
4. All other routes serve the React SPA (with admin authentication)

## Production Notes

- The React admin panel is protected by Express authentication middleware
- Users must be authenticated admins to access the UI
- In development, use `npm run dev:all` to run both backend and frontend separately
- The `prestart` script ensures the admin panel is built before the server starts