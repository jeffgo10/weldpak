import { NextRequest, NextResponse } from 'next/server';
import { minify } from 'terser';
import CleanCSS from 'clean-css';

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
  try {
    const { files }: { files: UploadedFile[] } = await request.json();

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

    return NextResponse.json(processedFile);
  } catch (error) {
    console.error('Processing error:', error);
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
