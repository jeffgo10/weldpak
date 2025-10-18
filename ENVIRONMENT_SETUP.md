# Environment Configuration

## Overview

WeldPak uses different environment configurations for local development and production:

- **Local Development**: Uses `.env` file with Firebase Emulator configuration
- **Production**: Uses `.env.production` file with real Firebase credentials

## Local Development (.env)

For local development, the app uses Firebase Emulators and Next.js API routes.

The `.env` file is already configured with emulator values:
- Firebase Emulator at `localhost:9000`
- Emulator UI at `localhost:4000`
- Next.js API routes (not Firebase Functions)

**No real Firebase credentials needed for local development!**

## Production (.env.production)

For production deployment, the app uses real Firebase services.

The `.env.production` file contains:
- Real Firebase project credentials
- Production database URL (asia-southeast1 region)
- Firebase Functions URLs

## Running the App

### Local Development
```bash
npm run dev:local
```

This will:
1. Start Firebase Realtime Database emulator on port 9000
2. Start Emulator UI on port 4000
3. Start Next.js dev server on port 3000
4. All data stays local (never touches production)

### Production Build
```bash
npm run build
```

This will use `.env.production` automatically.

### Production Deployment
```bash
npm run firebase:deploy:all
```

This will deploy to Firebase Hosting with production configuration.

## Environment Variable Sources

- **TypeScript files**: No hardcoded values, strictly use `process.env`
- **Local**: Values from `.env` file (emulator configuration)
- **Production**: Values from `.env.production` file (real Firebase)

## Security Notes

- Never commit `.env` or `.env.production` to git
- `.env` is in `.gitignore`
- Use `env.example` as a template
- Firebase credentials are only in environment files, not in code
