# Local Development with Firebase Emulators

This guide explains how to run WeldPak locally using Firebase Realtime Database emulators for development and testing.

## Why Use Firebase Emulators?

- **No Internet Required**: Work offline without needing a Firebase project
- **Free**: No Firebase usage costs during development
- **Fast**: Local database operations are much faster
- **Safe**: Test features without affecting production data
- **Realistic**: Emulators behave exactly like the real Firebase services

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm install -g firebase-tools
```

### 2. Start Firebase Emulators

```bash
# Start only the Realtime Database emulator
npm run firebase:emulators:db

# Or start all Firebase emulators (Database, Auth, Firestore, Storage)
npm run firebase:emulators
```

### 3. Start Development Server

In a separate terminal:

```bash
npm run dev
```

### 4. Or Run Both Together

```bash
# Start database emulator + Next.js dev server
npm run dev:db

# Start all emulators + Next.js dev server
npm run dev:emulators
```

## Emulator URLs

When running locally, you'll have access to:

- **WeldPak App**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Realtime Database**: http://localhost:9000
- **Authentication**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Storage**: http://localhost:9199

## Firebase Emulator UI

The Firebase Emulator UI (http://localhost:4000) provides:

- **Real-time Database Viewer**: Browse your logged data
- **Data Export/Import**: Save and restore test data
- **Rules Testing**: Test your database security rules
- **Logs**: View all database operations

## Environment Configuration

For local development, create a `.env.local` file:

```env
# Development Configuration
NODE_ENV=development

# Firebase Configuration (can use dummy values for local development)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-project
NEXT_PUBLIC_FIREBASE_API_KEY=demo-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=http://localhost:9000?ns=demo-project-default-rtdb
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# API Configuration
NEXT_PUBLIC_USE_FIREBASE_FUNCTIONS=false
```

## Automatic Emulator Connection

The logging service automatically detects development mode and connects to the emulator:

```typescript
// This happens automatically in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  connectDatabaseEmulator(database, 'localhost', 9000);
}
```

## Testing the Logging Feature

1. **Start the emulators and app**:
   ```bash
   npm run dev:db
   ```

2. **Open the app**: http://localhost:3000

3. **Upload and process files**: The logging will work exactly as in production

4. **View logged data**: 
   - Go to http://localhost:4000
   - Click on "Realtime Database"
   - Browse the `logs` node to see your test data

## Data Persistence

By default, emulator data is stored in memory and lost when you restart. To persist data:

1. **Export data before stopping**:
   ```bash
   firebase emulators:export ./emulator-data
   ```

2. **Import data when starting**:
   ```bash
   firebase emulators:start --import ./emulator-data
   ```

3. **Auto-export on exit** (add to firebase.json):
   ```json
   {
     "emulators": {
       "database": {
         "port": 9000,
         "host": "localhost"
       },
       "ui": {
         "enabled": true,
         "port": 4000
       }
     }
   }
   ```

## Troubleshooting

### Emulator Won't Start

```bash
# Check if ports are available
lsof -i :9000
lsof -i :4000

# Kill processes using those ports if needed
kill -9 <PID>
```

### Connection Issues

1. **Check emulator status**: Visit http://localhost:4000
2. **Check browser console**: Look for Firebase connection messages
3. **Verify environment variables**: Ensure `NODE_ENV=development`

### Database Rules Not Working

1. **Deploy rules to emulator**:
   ```bash
   firebase deploy --only database:rules --project demo-project
   ```

2. **Or test rules in Emulator UI**: Go to Rules tab in http://localhost:4000

## Development Workflow

### 1. Start Fresh Each Day
```bash
npm run dev:db
```

### 2. Export Test Data
```bash
firebase emulators:export ./test-data
```

### 3. Import Previous Data
```bash
firebase emulators:start --import ./test-data
```

### 4. Clear All Data
```bash
# Stop emulators and delete export folder
rm -rf ./emulator-data
npm run dev:db
```

## Production vs Development

| Feature | Development (Emulator) | Production (Firebase) |
|---------|----------------------|---------------------|
| Database URL | `http://localhost:9000` | `https://project-default-rtdb.firebaseio.com` |
| Data Persistence | Memory only | Permanent |
| Performance | Very fast | Network dependent |
| Cost | Free | Usage-based |
| Internet Required | No | Yes |

## Advanced Configuration

### Custom Emulator Ports

Update `firebase.json`:
```json
{
  "emulators": {
    "database": {
      "port": 9001
    },
    "ui": {
      "port": 4001
    }
  }
}
```

### Multiple Projects

```bash
# Start emulator for specific project
firebase emulators:start --project your-project-id
```

## Debugging Tips

1. **Check Emulator UI**: Always check http://localhost:4000 for database state
2. **Browser DevTools**: Check Console tab for Firebase connection messages
3. **Network Tab**: Monitor Firebase API calls
4. **Database Rules**: Test rules in the Emulator UI Rules tab

## Sample Test Data

You can manually add test data in the Emulator UI:

```json
{
  "logs": {
    "user_activities": {
      "test-session-1": {
        "sessionId": "test-session-1",
        "timestamp": "2024-01-15T10:00:00.000Z",
        "location": {
          "country": "United States",
          "region": "California",
          "city": "San Francisco",
          "timezone": "America/Los_Angeles"
        },
        "activity": "page_visit",
        "userAgent": "Mozilla/5.0 (Test Browser)"
      }
    }
  }
}
```

This setup gives you a complete local development environment that mirrors your production Firebase setup!
