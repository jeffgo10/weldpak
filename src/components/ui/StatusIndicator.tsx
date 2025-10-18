'use client';

import React from 'react';
import { Badge } from './badge';
import { Card, CardContent } from './card';
import { 
  Server, 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  isUsingFirebase: boolean;
  isOnline: boolean;
  isProcessing: boolean;
  lastProcessed?: Date;
  processingCount?: number;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  isUsingFirebase,
  isOnline,
  isProcessing,
  lastProcessed,
  processingCount = 0,
  className
}) => {
  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (isProcessing) return 'secondary';
    return 'default';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isProcessing) return 'Processing';
    return 'Ready';
  };

  const getBackendIcon = () => {
    return isUsingFirebase ? Cloud : Server;
  };

  const BackendIcon = getBackendIcon();

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Connection Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* Backend Type */}
            <div className="flex items-center gap-2">
              <BackendIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isUsingFirebase ? 'Firebase Functions' : 'Next.js API'}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {isProcessing && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            <Badge variant={getStatusColor()}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Processing...
                </>
              ) : isOnline ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {getStatusText()}
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {getStatusText()}
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Processing Stats */}
        {(processingCount > 0 || lastProcessed) && (
          <div className="mt-3 pt-3 border-t border-muted">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Files processed: {processingCount}</span>
              {lastProcessed && (
                <span>
                  Last: {lastProcessed.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
