import { NextRequest, NextResponse } from 'next/server';
import { minify } from 'terser';
import CleanCSS from 'clean-css';
// CSRF imports removed
import { logFileProcessing, logUserActivity } from '@/services/loggingService';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  order: number;
}

interface ProcessedFile {
  id: string;
  originalFiles: UploadedFile[];
  combinedContent: string;
  minifiedContent: string;
  originalSize: number;
  minifiedSize: number;
  compressionRatio: number;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let sessionId = '';
  let userLocation = {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    timezone: 'Unknown',
  };

  try {
    // CSRF validation disabled for now
    console.log('CSRF validation disabled');

     const { files, sessionId: clientSessionId, userLocation: clientLocation }: { 
       files: UploadedFile[];
       sessionId?: string;
       userLocation?: {
         country: string;
         region: string;
         city: string;
         timezone: string;
       };
     } = await request.json();

    // Use client session ID or generate new one
    sessionId = clientSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Use client location data if provided
    if (clientLocation) {
      userLocation = clientLocation;
    }

    // Get IP address from request headers
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'Unknown';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Sort files by order
    const sortedFiles = [...files].sort((a, b) => a.order - b.order);

    // Combine files
    const combinedContent = sortedFiles
      .map(file => file.content)
      .join('\n\n');

    const originalSize = combinedContent.length;

    // Determine file type based on first file extension
    const isJS = sortedFiles[0].name.endsWith('.js');
    let minifiedContent = '';

    try {
      if (isJS) {
        // Minify JavaScript using Terser
        const result = await minify(combinedContent, {
          compress: false, // Disable compression to avoid parsing issues
          mangle: false,
          format: {
            comments: false,
            beautify: false,
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
      // Fallback to original content if minification fails
      minifiedContent = combinedContent;
    }

    const minifiedSize = minifiedContent.length;
    const compressionRatio = originalSize > 0 ? (originalSize - minifiedSize) / originalSize : 0;

    const processingTime = Date.now() - startTime;
    
    const processedFile: ProcessedFile = {
      id: `processed-${Date.now()}`,
      originalFiles: sortedFiles,
      combinedContent,
      minifiedContent,
      originalSize,
      minifiedSize,
      compressionRatio,
      timestamp: new Date().toISOString(),
    };

    // Log file processing activity (async, don't wait for completion)
    logFileProcessing({
      sessionId,
      location: userLocation,
      files: sortedFiles.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
      })),
      processingResult: {
        originalSize,
        minifiedSize,
        compressionRatio,
        processingTime,
      },
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: ip,
    }).catch(error => {
      console.error('Failed to log file processing:', error);
    });

    // Log general file processing activity
    logUserActivity({
      sessionId,
      location: userLocation,
      activity: 'file_processing',
      details: {
        fileCount: sortedFiles.length,
        totalSize: originalSize,
        compressedSize: minifiedSize,
        compressionRatio,
        processingTime,
      },
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: ip,
    }).catch(error => {
      console.error('Failed to log user activity:', error);
    });

    return NextResponse.json({
      ...processedFile,
      sessionId, // Include session ID in response for client tracking
    });
  } catch (error) {
    console.error('Processing error:', error);
    
    // Log error activity
    logUserActivity({
      sessionId: sessionId || `error_${Date.now()}`,
      location: userLocation,
      activity: 'error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        endpoint: 'process-files',
      },
      userAgent: request.headers.get('user-agent') || 'Unknown',
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'Unknown',
    }).catch(logError => {
      console.error('Failed to log error activity:', logError);
    });
    
    return NextResponse.json(
      { error: 'Failed to process files' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'WeldPak API - Process Files Endpoint' },
    { status: 200 }
  );
}
