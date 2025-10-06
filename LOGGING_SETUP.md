# Firebase Realtime Database Logging Setup

This document explains how to set up the Firebase Realtime Database logging feature for WeldPak.

## Features

The logging system tracks:
- **User Location**: Country, region, city, timezone, and approximate coordinates
- **File Processing**: Files processed, compression ratios, processing times
- **User Activities**: Page visits, file uploads, tab switches, errors
- **Session Tracking**: Unique session IDs for tracking user sessions

### Development vs Production UI

**Development Mode** (`NODE_ENV=development`):
- ✅ Location badge in top-left corner
- ✅ Debug panel with session info and test buttons
- ✅ Links to Firebase Emulator UI
- ✅ Detailed logging information visible

**Production Mode** (`NODE_ENV=production`):
- ❌ No location badge visible to users
- ❌ No debug panel
- ❌ No development UI elements
- ✅ Logging still works in background
- ✅ Clean, professional interface

## Setup Instructions

### Option A: Local Development (Recommended for Testing)

For local development and testing, you can use Firebase emulators without needing a Firebase project:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start database emulator + Next.js dev server
npm run dev:db

# Or start all emulators + Next.js dev server  
npm run dev:emulators
```

- **WeldPak App**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Database**: http://localhost:9000

See [LOCAL_DEVELOPMENT.md](./LOCAL_DEVELOPMENT.md) for detailed local development setup.

### Option B: Production Firebase Project Setup

### 1. Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the **Realtime Database** service:
   - Go to "Realtime Database" in the left sidebar
   - Click "Create Database"
   - Choose your region
   - Start in **locked mode** (we'll set up rules later)

### 2. Environment Configuration

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Firebase project configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

   You can find these values in your Firebase project settings under "Project settings" > "General" > "Your apps".

### 3. Database Rules

The database rules are already configured in `database.rules.json`. To deploy them:

```bash
firebase deploy --only database
```

Or if you want to set them manually in the Firebase Console:
1. Go to "Realtime Database" > "Rules"
2. Replace the rules with the content from `database.rules.json`

### 4. Install Dependencies

The required Firebase dependencies are already included in `package.json`. If you need to install them manually:

```bash
npm install firebase
```

### 5. Deploy Configuration

Update your `firebase.json` to include the database configuration (already done):

```json
{
  "database": {
    "rules": "database.rules.json"
  }
}
```

## Data Structure

The logging system stores data in the following structure:

```
logs/
├── file_processing/
│   └── [auto-generated-id]/
│       ├── sessionId: string
│       ├── userId?: string
│       ├── timestamp: string
│       ├── location: {
│       │   ├── country: string
│       │   ├── region: string
│       │   ├── city: string
│       │   ├── timezone: string
│       │   ├── latitude?: number
│       │   ├── longitude?: number
│       │   └── accuracy?: number
│       ├── files: [{
│       │   ├── id: string
│       │   ├── name: string
│       │   ├── size: number
│       │   └── type: string
│       │ }]
│       ├── processingResult: {
│       │   ├── originalSize: number
│       │   ├── minifiedSize: number
│       │   ├── compressionRatio: number
│       │   └── processingTime: number
│       ├── userAgent: string
│       └── ipAddress?: string
└── user_activities/
    └── [auto-generated-id]/
        ├── sessionId: string
        ├── userId?: string
        ├── timestamp: string
        ├── location: {...}
        ├── activity: string
        ├── details?: object
        ├── userAgent: string
        └── ipAddress?: string
```

## Privacy Considerations

- **Location Data**: The system attempts to get precise location via browser geolocation API, but falls back to IP-based location if denied
- **IP Addresses**: IP addresses are logged for analytics but can be removed from the database rules if privacy is a concern
- **Session Tracking**: Sessions are stored in browser sessionStorage and are not persistent across browser sessions
- **Data Retention**: Consider implementing data retention policies in your Firebase project

## Viewing Logs

You can view the logged data in the Firebase Console:
1. Go to "Realtime Database"
2. Navigate to the `logs` node
3. Explore the `file_processing` and `user_activities` branches

## Analytics Queries

You can query the data for analytics. For example, to get processing statistics by location:

```javascript
// In Firebase Console or via Firebase Admin SDK
const db = getDatabase();
const processingRef = ref(db, 'logs/file_processing');
// Query and filter by location, timestamp, etc.
```

## Troubleshooting

1. **Location not detected**: Check if the user has granted location permissions
2. **Database connection issues**: Verify your Firebase configuration in `.env.local`
3. **Permission denied**: Ensure your database rules are correctly deployed
4. **Missing logs**: Check browser console for any JavaScript errors

## Security Notes

- The current database rules require authentication. For anonymous logging, you may need to adjust the rules
- Consider implementing rate limiting for production use
- Regularly review and clean up old log data to manage storage costs
