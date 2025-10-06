'use client';

import React, { useRef } from 'react';
import { Card, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { uploadFiles, processFiles, removeFile, reorderFiles, clearFiles } from '@/store/slices/fileSlice';
import { useUserTracking } from '@/hooks/useUserTracking';

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
        userLocation: location 
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
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <i className={`fab fa-${fileType === 'js' ? 'js-square' : 'css3-alt'} me-2`}></i>
          Upload {fileType.toUpperCase()} Files
        </h5>
      </Card.Header>
      <Card.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
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

              <div className="d-flex gap-2 mb-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!values.files || (values.files as FileList).length === 0 || isLoading}
                >
                  <i className="fas fa-upload me-2"></i>
                  Upload Files
                </Button>
                
                {currentFiles.length > 0 && (
                  <>
                    <Button
                      variant="success"
                      onClick={handleProcessFiles}
                      disabled={isLoading}
                    >
                      <i className="fas fa-compress me-2"></i>
                      {isLoading ? 'Processing...' : 'Combine & Minify'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => dispatch(clearFiles())}
                    >
                      <i className="fas fa-trash me-2"></i>
                      Clear All
                    </Button>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>

        {/* File List */}
        {currentFiles.length > 0 && (
          <div className="mt-4">
            <h6 className="mb-3">
              <i className="fas fa-list me-2"></i>
              Uploaded Files ({currentFiles.length})
              <Badge bg="info" className="ms-2">
                Total: {formatFileSize(getTotalSize())}
              </Badge>
            </h6>
            
            <ListGroup>
              {currentFiles
                .sort((a, b) => a.order - b.order)
                .map((file, index) => (
                  <ListGroup.Item
                    key={file.id}
                    className="d-flex justify-content-between align-items-center"
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{ cursor: 'move' }}
                  >
                    <div className="d-flex align-items-center">
                      <i className={`fas fa-grip-vertical text-muted me-3`}></i>
                      <i className={`fab fa-${fileType === 'js' ? 'js-square' : 'css3-alt'} text-primary me-2`}></i>
                      <span className="fw-medium">{file.name}</span>
                      <Badge bg="secondary" className="ms-2">
                        {formatFileSize(file.size)}
                      </Badge>
                    </div>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </ListGroup.Item>
                ))}
            </ListGroup>
            
            <div className="mt-3 text-muted">
              <small>
                <i className="fas fa-info-circle me-1"></i>
                Drag and drop to reorder files. Files will be combined in the order shown above.
              </small>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FileUploadPanel;
