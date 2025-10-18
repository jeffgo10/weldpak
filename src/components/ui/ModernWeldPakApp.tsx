'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { FileUploadCard } from './FileUploadCard';
import { ResultsCard } from './ResultsCard';
import { StatusIndicator } from './StatusIndicator';
import { ThemeToggle } from './ThemeToggle';
import { ToastProvider } from './ToastProvider';
import { toast } from 'sonner';
import { 
  Code, 
  FileText, 
  Settings, 
  Download,
  Copy,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProcessedFile {
  name: string;
  content: string;
  originalSize: number;
  minifiedSize: number;
  compressionRatio: number;
  processingTime: number;
}

interface ModernWeldPakAppProps {
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}

export const ModernWeldPakApp: React.FC<ModernWeldPakAppProps> = ({
  theme,
  onThemeChange
}) => {
  const [jsFiles, setJsFiles] = useState<File[]>([]);
  const [cssFiles, setCssFiles] = useState<File[]>([]);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [processingCount, setProcessingCount] = useState(0);
  const [lastProcessed, setLastProcessed] = useState<Date | undefined>();

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processFiles = async (files: File[], type: 'js' | 'css') => {
    if (files.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      const processed: ProcessedFile[] = files.map(file => {
        const originalSize = file.size;
        const minifiedSize = Math.floor(originalSize * 0.3); // Simulate 70% compression
        const compressionRatio = (originalSize - minifiedSize) / originalSize;
        const processingTime = Math.floor(Math.random() * 1000) + 500;

        return {
          name: file.name.replace(/\.[^/.]+$/, `.min.${type}`),
          content: `// Minified ${type.toUpperCase()} content for ${file.name}\n// This is a simulation of minified content`,
          originalSize,
          minifiedSize,
          compressionRatio,
          processingTime
        };
      });

      setProcessedFiles(prev => [...prev, ...processed]);
      setProcessingCount(prev => prev + files.length);
      setLastProcessed(new Date());

      toast.success(`Successfully processed ${files.length} ${type.toUpperCase()} file(s)!`, {
        description: `Total compression: ${((processed.reduce((sum, f) => sum + f.compressionRatio, 0) / processed.length) * 100).toFixed(1)}%`
      });

    } catch (error) {
      toast.error('Failed to process files', {
        description: 'Please try again or check your connection'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (file: ProcessedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('File downloaded successfully!');
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const clearAll = () => {
    setJsFiles([]);
    setCssFiles([]);
    setProcessedFiles([]);
    toast.info('All files cleared');
  };

  return (
    <div className="min-h-screen bg-background">
      <ToastProvider />
      
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Code className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">WeldPak</h1>
                  <p className="text-sm text-muted-foreground">JS & CSS Combiner & Minifier</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Status Indicator */}
          <StatusIndicator
            isUsingFirebase={false} // This would come from your API service
            isOnline={isOnline}
            isProcessing={isProcessing}
            lastProcessed={lastProcessed}
            processingCount={processingCount}
          />

          {/* File Upload Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FileUploadCard
              fileType="js"
              files={jsFiles}
              onFilesChange={setJsFiles}
              onProcess={() => processFiles(jsFiles, 'js')}
              isProcessing={isProcessing}
              maxFiles={10}
              maxSize={10}
            />
            
            <FileUploadCard
              fileType="css"
              files={cssFiles}
              onFilesChange={setCssFiles}
              onProcess={() => processFiles(cssFiles, 'css')}
              isProcessing={isProcessing}
              maxFiles={10}
              maxSize={10}
            />
          </div>

          {/* Results */}
          {processedFiles.length > 0 && (
            <ResultsCard
              processedFiles={processedFiles}
              isProcessing={isProcessing}
              onDownload={handleDownload}
              onCopy={handleCopy}
            />
          )}

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Features
              </CardTitle>
              <CardDescription>
                What makes WeldPak the best choice for your file optimization needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Lightning Fast</h3>
                  <p className="text-sm text-muted-foreground">
                    Process multiple files in seconds with our optimized algorithms
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Smart Compression</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced minification techniques for maximum file size reduction
                  </p>
                </div>
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">Easy to Use</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop interface with real-time progress tracking
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
