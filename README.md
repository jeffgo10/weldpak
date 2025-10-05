# WeldPak - JS & CSS Combiner & Minifier

WeldPak is a powerful Next.js application that allows you to combine and minify JavaScript and CSS files with ease. Built with modern technologies including React Bootstrap, Redux Toolkit, Formik, and Firebase Functions for scalable deployment.

## Features

- **Multi-file Upload**: Upload multiple JavaScript or CSS files simultaneously
- **File Reordering**: Drag and drop to reorder files before processing
- **Smart Minification**: 
  - JavaScript minification using Terser with advanced optimizations
  - CSS minification using CleanCSS
- **Compression Statistics**: View original vs minified file sizes and compression ratios
- **Download Options**: Download combined or minified versions
- **Processing History**: Track and manage previously processed files
- **Responsive Design**: Modern UI built with React Bootstrap
- **State Management**: Redux Toolkit with async thunks for robust state handling
- **Form Validation**: Formik with Yup validation schemas
- **Scheduled Tasks**: Firebase Functions with Cloud Scheduler for automated cleanup
- **Docker Support**: Full containerization for easy deployment
- **Firebase Integration**: Ready for Firebase hosting and functions

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React Bootstrap** - UI components and styling
- **Redux Toolkit** - State management with async thunks
- **Formik** - Form handling and validation
- **Yup** - Schema validation
- **TypeScript** - Type safety

### Backend
- **Next.js API Routes** - REST API endpoints
- **Firebase Functions** - Serverless functions for processing
- **Terser** - JavaScript minification
- **CleanCSS** - CSS minification
- **Cloud Scheduler** - Automated task scheduling

### Infrastructure
- **Docker** - Containerization
- **Firebase Hosting** - Static site hosting
- **Firebase Firestore** - Database for processing history
- **Firebase Storage** - File storage (future use)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker (optional)
- Firebase CLI (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd weldpak
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase Functions dependencies**
   ```bash
   npm run functions:install
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

5. **Run the development server**
   ```bash
   # Use Next.js API routes (default)
   npm run dev
   # OR use Firebase Functions locally
   npm run dev:firebase
   # OR explicitly use local API
   npm run dev:local
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Docker Development

1. **Build and run with Docker Compose**
   ```bash
   npm run docker:dev
   ```

2. **Run with production profile (includes Nginx)**
   ```bash
   npm run docker:prod
   ```

### Firebase Setup

1. **Initialize Firebase**
   ```bash
   npm run firebase:init
   ```

2. **Update `.firebaserc` with your project ID**
   ```json
   {
     "projects": {
       "default": "your-firebase-project-id"
     }
   }
   ```

3. **Deploy to Firebase**
   ```bash
   # Deploy with Next.js API routes (default)
   npm run firebase:deploy
   # OR deploy with Firebase Functions backend
   npm run firebase:deploy:functions
   ```

## Usage

### Uploading Files

1. Select the **JavaScript** or **CSS** tab
2. Click the upload area or drag and drop files
3. Reorder files by dragging them (optional)
4. Click **"Combine & Minify"** to process the files
5. Download the combined or minified results

### File Processing

- **JavaScript**: Uses Terser with console.log removal, debugger removal, and variable mangling
- **CSS**: Uses CleanCSS level 2 optimization for maximum compression
- **Order**: Files are processed in the order they appear in the list

### Processing History

- View all previously processed files
- See compression statistics
- Download results again
- View detailed processing information

## API Endpoints

### `/api/process-files`
- **POST**: Process uploaded files for combining and minification
- **GET**: Health check endpoint

### `/api/health`
- **GET**: Application health status

## Firebase Functions

### `processFiles`
- HTTP function for file processing
- Handles CORS and file validation
- Returns processed results

### `scheduledCleanup`
- Runs daily at 2 AM UTC
- Cleans up old processing tasks (30+ days)
- Maintains database hygiene

### `storeProcessingTask` / `getProcessingTask`
- Callable functions for task management
- Store and retrieve processing status

## Project Structure

```
weldpak/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── WeldPakApp.tsx  # Main application
│   │   ├── FileUploadPanel.tsx
│   │   └── ProcessedFilesList.tsx
│   └── store/              # Redux store
│       ├── index.ts        # Store configuration
│       ├── hooks.ts        # Typed hooks
│       └── slices/
│           └── fileSlice.ts # File state management
├── functions/              # Firebase Functions
│   ├── src/
│   │   └── index.ts        # Function definitions
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile             # Docker image definition
├── firebase.json          # Firebase configuration
└── nginx.conf             # Nginx configuration
```

## Deployment

### Firebase Hosting
```bash
npm run firebase:deploy
```

### Docker
```bash
npm run docker:build
npm run docker:run
```

### Manual Build
```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id

# API Configuration
USE_FIREBASE_FUNCTIONS=false
FIREBASE_FUNCTIONS_URL=https://your-region-your-project.cloudfunctions.net
```

## Backend Configuration

WeldPak supports two backend architectures:

### **Next.js API Routes (Default)**
- **Local Development**: Fast, simple, no external dependencies
- **Deployment**: Works with any Next.js hosting (Vercel, Netlify, etc.)
- **Configuration**: `USE_FIREBASE_FUNCTIONS=false`

### **Firebase Functions**
- **Production**: Auto-scaling, global distribution, scheduled tasks
- **Deployment**: Firebase hosting with serverless functions
- **Configuration**: `USE_FIREBASE_FUNCTIONS=true`

### **Automatic Switching**
The app automatically detects the backend based on environment variables:

```bash
# Development with Next.js API
npm run dev

# Development with Firebase Functions
npm run dev:firebase

# Production with Next.js API
npm run firebase:deploy

# Production with Firebase Functions
npm run firebase:deploy:functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub.
