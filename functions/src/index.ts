import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { minify } from 'terser';
import { CleanCSS } from 'clean-css';
import * as cron from 'node-cron';

// Initialize Firebase Admin
admin.initializeApp();

// Interface for file processing tasks
interface ProcessingTask {
  id: string;
  files: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: admin.firestore.Timestamp;
  completedAt?: admin.firestore.Timestamp;
  result?: {
    combinedContent: string;
    minifiedContent: string;
    originalSize: number;
    minifiedSize: number;
    compressionRatio: number;
  };
  error?: string;
}

// Health check endpoint
export const health = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'WeldPak Firebase Functions',
    version: '1.0.0',
    backend: 'firebase-functions',
  });
});

// HTTP function to process files
export const processFiles = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { files } = req.body;

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    // Process files
    const result = await processFileContent(files);

    res.status(200).json(result);
  } catch (error) {
    console.error('Processing error:', error);
    res.status(500).json({ error: 'Failed to process files' });
  }
});

// Function to process file content
async function processFileContent(files: any[]): Promise<any> {
  // Combine files
  const combinedContent = files
    .map((file: any) => file.content)
    .join('\n\n');

  const originalSize = combinedContent.length;

  // Determine file type based on first file extension
  const isJS = files[0].name.endsWith('.js');
  let minifiedContent = '';

  try {
    if (isJS) {
      // Minify JavaScript using Terser
      const result = await minify(combinedContent, {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        mangle: {
          toplevel: false,
        },
        format: {
          comments: false,
        },
      });
      minifiedContent = result.code || combinedContent;
    } else {
      // Minify CSS using CleanCSS
      const cleanCSS = new CleanCSS({
        level: 2,
        returnPromise: true,
      });
      const result = await cleanCSS.minify(combinedContent);
      minifiedContent = result.styles || combinedContent;
    }
  } catch (minifyError) {
    console.error('Minification error:', minifyError);
    minifiedContent = combinedContent;
  }

  const minifiedSize = minifiedContent.length;
  const compressionRatio = originalSize > 0 ? (originalSize - minifiedSize) / originalSize : 0;

  return {
    id: `processed-${Date.now()}`,
    originalFiles: files,
    combinedContent,
    minifiedContent,
    originalSize,
    minifiedSize,
    compressionRatio,
    timestamp: new Date().toISOString(),
  };
}

// Scheduled function for cleanup tasks (runs daily at 2 AM)
export const scheduledCleanup = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running scheduled cleanup task');
    
    try {
      const db = admin.firestore();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep files for 30 days

      // Clean up old processing tasks
      const oldTasks = await db
        .collection('processingTasks')
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(cutoffDate))
        .get();

      const batch = db.batch();
      oldTasks.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`Cleaned up ${oldTasks.size} old processing tasks`);
    } catch (error) {
      console.error('Cleanup task failed:', error);
    }
  });

// Function to store processing task in Firestore
export const storeProcessingTask = functions.https.onCall(async (data, context) => {
  try {
    const db = admin.firestore();
    const taskRef = db.collection('processingTasks').doc();
    
    const task: ProcessingTask = {
      id: taskRef.id,
      files: data.files,
      status: 'pending',
      createdAt: admin.firestore.Timestamp.now(),
    };

    await taskRef.set(task);
    return { taskId: task.id };
  } catch (error) {
    console.error('Error storing task:', error);
    throw new functions.https.HttpsError('internal', 'Failed to store processing task');
  }
});

// Function to get processing task status
export const getProcessingTask = functions.https.onCall(async (data, context) => {
  try {
    const db = admin.firestore();
    const taskDoc = await db.collection('processingTasks').doc(data.taskId).get();
    
    if (!taskDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Task not found');
    }

    return taskDoc.data();
  } catch (error) {
    console.error('Error getting task:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get processing task');
  }
});
