'use client';

import React, { useRef } from 'react';
import { Card, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { uploadFiles, processFiles, removeFile, reorderFiles, clearFiles } from '@/store/slices/fileSlice';
import { useUserTracking } from '@/hooks/useUserTracking';
import { Card as ShadcnCard, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button as ShadcnButton } from './ui/button';
import { Badge as ShadcnBadge } from './ui/badge';
import { Alert as ShadcnAlert, AlertDescription } from './ui/alert';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2, GripVertical, Trash2, Minimize2 } from 'lucide-react';

interface FileUploadPanelProps {
  fileType: 'js' | 'css';
}

const FileUploadPanel: React.FC<FileUploadPanelProps> = ({ fileType }) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadedFiles, isLoading, error } = useAppSelector((state) => state.files);
  const { sessionId, location, logActivity } = useUserTracking();

  // Filter files by current tab
  const currentFiles = uploadedFiles.filter(file => 
    (fileType === 'js' && file.name.endsWith('.js')) ||
    (fileType === 'css' && file.name.endsWith('.css'))
  );

  const validationSchema = Yup.object({
    files: Yup.mixed()
      .required('Please select at least one file')
      .test('file-type', `Please select only ${fileType.toUpperCase()} files`, (value) => {
        if (!value || !(value as FileList).length) return true;
        return Array.from(value as FileList).every((file: File) => 
          fileType === 'js' ? file.name.endsWith('.js') : file.name.endsWith('.css')
        );
      }),
  });

  const handleFileUpload = async (values: { files: FileList | null }) => {
    if (values.files) {
      dispatch(uploadFiles(values.files));
      // Log file upload activity
      logActivity('file_upload', { 
        fileCount: values.files.length, 
        fileType,
        fileNames: Array.from(values.files).map(f => f.name)
      });
    }
  };

  const handleProcessFiles = async () => {
    if (currentFiles.length > 0) {
      dispatch(processFiles({ 
        files: currentFiles, 
        sessionId, 
        userLocation: location ? {
          country: location.country || 'Unknown',
          region: location.region || 'Unknown',
          city: location.city || 'Unknown',
          timezone: location.timezone || 'Unknown'
        } : undefined
      }));
      // Log file processing initiation
      logActivity('file_processing_initiated', { 
        fileCount: currentFiles.length, 
        fileType,
        totalSize: currentFiles.reduce((total, file) => total + file.size, 0)
      });
    }
  };

  const handleRemoveFile = (fileId: string) => {
    dispatch(removeFile(fileId));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'));
    if (dragIndex !== dropIndex) {
      dispatch(reorderFiles({ fromIndex: dragIndex, toIndex: dropIndex }));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalSize = () => {
    return currentFiles.reduce((total, file) => total + file.size, 0);
  };

  return (
    <ShadcnCard className="shadow-sm" style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)', borderColor: 'var(--border)' }}>
      <CardHeader style={{ backgroundColor: 'var(--card)' }}>
        <CardTitle className="flex items-center gap-2" style={{ color: 'var(--card-foreground)' }}>
          <File className="h-5 w-5" />
          Upload {fileType.toUpperCase()} Files
        </CardTitle>
        <CardDescription style={{ color: 'var(--muted-foreground)' }}>
          Select multiple {fileType.toUpperCase()} files to combine and minify
        </CardDescription>
      </CardHeader>
      <CardContent style={{ backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}>
        {error && (
          <ShadcnAlert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </ShadcnAlert>
        )}

        <Formik
          initialValues={{ files: null }}
          validationSchema={validationSchema}
          onSubmit={handleFileUpload}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <div className="mb-4">
                <Field name="files">
                  {() => (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={fileType === 'js' ? '.js' : '.css'}
                        className="form-control"
                        onChange={(event) => {
                          setFieldValue('files', event.currentTarget.files);
                        }}
                        style={{ display: 'none' }}
                      />
                      <div
                        className="border border-2 border-dashed border-primary rounded p-5 text-center bg-light"
                        style={{ cursor: 'pointer' }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className={`fas fa-cloud-upload-alt fa-3x text-primary mb-3`}></i>
                        <h5>Click to upload or drag and drop</h5>
                        <p className="text-muted">
                          Select multiple {fileType.toUpperCase()} files to combine and minify
                        </p>
                        {values.files && (values.files as FileList).length > 0 && (
                          <Badge bg="primary" className="mt-2">
                            {(values.files as FileList).length} file(s) selected
                          </Badge>
                        )}
                      </div>
                      <ErrorMessage name="files" component="div" className="text-danger mt-2" />
                    </div>
                  )}
                </Field>
              </div>

              <div className="flex gap-2 mb-4">
                <ShadcnButton
                  type="submit"
                  disabled={!values.files || (values.files as FileList).length === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </>
                  )}
                </ShadcnButton>
                
                {currentFiles.length > 0 && (
                  <>
                    <ShadcnButton
                      variant="default"
                      onClick={handleProcessFiles}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Minimize2 className="h-4 w-4 mr-2" />
                          Combine & Minify
                        </>
                      )}
                    </ShadcnButton>
                    <ShadcnButton
                      variant="outline"
                      onClick={() => dispatch(clearFiles())}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </ShadcnButton>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>

        {/* File List */}
        {currentFiles.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h6 className="flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <File className="h-4 w-4" />
                Uploaded Files ({currentFiles.length})
              </h6>
              <ShadcnBadge variant="secondary">
                Total: {formatFileSize(getTotalSize())}
              </ShadcnBadge>
            </div>
            
            <div className="space-y-2">
              {currentFiles
                .sort((a, b) => a.order - b.order)
                .map((file, index) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                    style={{ 
                      backgroundColor: 'var(--muted)', 
                      borderColor: 'var(--border)',
                      cursor: 'move'
                    }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-4 w-4" style={{ color: 'var(--muted-foreground)' }} />
                      <File className="h-4 w-4" style={{ color: 'var(--primary)' }} />
                      <div>
                        <div className="font-medium" style={{ color: 'var(--foreground)' }}>{file.name}</div>
                        <ShadcnBadge variant="outline" className="text-xs">
                          {formatFileSize(file.size)}
                        </ShadcnBadge>
                      </div>
                    </div>
                    <ShadcnButton
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </ShadcnButton>
                  </div>
                ))}
            </div>
            
            <div className="mt-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Drag and drop to reorder files. Files will be combined in the order shown above.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </ShadcnCard>
  );
};

export default FileUploadPanel;
