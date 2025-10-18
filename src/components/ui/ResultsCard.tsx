'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Progress } from './progress';
import { 
  Download, 
  Copy, 
  CheckCircle, 
  FileText, 
  TrendingDown, 
  Clock,
  Zap,
  Eye,
  EyeOff
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

interface ResultsCardProps {
  processedFiles: ProcessedFile[];
  isProcessing: boolean;
  onDownload: (file: ProcessedFile) => void;
  onCopy: (content: string) => void;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({
  processedFiles,
  isProcessing,
  onDownload,
  onCopy
}) => {
  const [showContent, setShowContent] = useState<{ [key: string]: boolean }>({});

  const toggleContent = (fileName: string) => {
    setShowContent(prev => ({
      ...prev,
      [fileName]: !prev[fileName]
    }));
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio > 0.5) return 'text-green-600';
    if (ratio > 0.3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompressionBadgeVariant = (ratio: number) => {
    if (ratio > 0.5) return 'default';
    if (ratio > 0.3) return 'secondary';
    return 'destructive';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const totalOriginalSize = processedFiles.reduce((sum, file) => sum + file.originalSize, 0);
  const totalMinifiedSize = processedFiles.reduce((sum, file) => sum + file.minifiedSize, 0);
  const totalCompressionRatio = totalOriginalSize > 0 ? (totalOriginalSize - totalMinifiedSize) / totalOriginalSize : 0;
  const totalProcessingTime = processedFiles.reduce((sum, file) => sum + file.processingTime, 0);

  if (processedFiles.length === 0 && !isProcessing) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Processing Results
        </CardTitle>
        <CardDescription>
          Your files have been successfully processed and optimized
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Statistics */}
        {processedFiles.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {processedFiles.length}
              </div>
              <div className="text-sm text-muted-foreground">Files Processed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatFileSize(totalOriginalSize)}
              </div>
              <div className="text-sm text-muted-foreground">Original Size</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatFileSize(totalMinifiedSize)}
              </div>
              <div className="text-sm text-muted-foreground">Minified Size</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className={cn("text-2xl font-bold", getCompressionColor(totalCompressionRatio))}>
                {(totalCompressionRatio * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Compression</div>
            </div>
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
              <span className="text-sm font-medium">Processing files...</span>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Individual File Results */}
        {processedFiles.map((file, index) => (
          <Card key={index} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getCompressionBadgeVariant(file.compressionRatio)}>
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {(file.compressionRatio * 100).toFixed(1)}% smaller
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Original Size</div>
                  <div className="font-medium">{formatFileSize(file.originalSize)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Minified Size</div>
                  <div className="font-medium">{formatFileSize(file.minifiedSize)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Saved</div>
                  <div className="font-medium text-green-600">
                    {formatFileSize(file.originalSize - file.minifiedSize)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Processing Time</div>
                  <div className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(file.processingTime)}
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Minified Content</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleContent(file.name)}
                  >
                    {showContent[file.name] ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                </div>
                
                {showContent[file.name] && (
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                      <code>{file.content}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => onCopy(file.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => onDownload(file)}
                  className="flex-1"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCopy(file.content)}
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Summary */}
        {processedFiles.length > 0 && (
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="font-medium">Performance Summary</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Processed {processedFiles.length} files in {formatTime(totalProcessingTime)}. 
              Reduced total size by {formatFileSize(totalOriginalSize - totalMinifiedSize)} 
              ({(totalCompressionRatio * 100).toFixed(1)}% compression).
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
