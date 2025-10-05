'use client';

import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Modal, Alert } from 'react-bootstrap';
import { useAppSelector } from '@/store/hooks';
import { ProcessedFile } from '@/store/slices/fileSlice';

const ProcessedFilesList: React.FC = () => {
  const { processedFiles } = useAppSelector((state) => state.files);
  const [selectedFile, setSelectedFile] = useState<ProcessedFile | null>(null);
  const [showModal, setShowModal] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleDownload = (file: ProcessedFile, type: 'combined' | 'minified') => {
    const content = type === 'combined' ? file.combinedContent : file.minifiedContent;
    const filename = `weldpak-${type}-${Date.now()}.${file.originalFiles[0]?.name.endsWith('.js') ? 'js' : 'css'}`;
    
    const blob = new Blob([content], { 
      type: file.originalFiles[0]?.name.endsWith('.js') ? 'application/javascript' : 'text/css' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleViewDetails = (file: ProcessedFile) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const getCompressionColor = (ratio: number) => {
    if (ratio >= 0.7) return 'success';
    if (ratio >= 0.5) return 'warning';
    return 'danger';
  };

  if (processedFiles.length === 0) {
    return (
      <Card className="mt-4 shadow-sm">
        <Card.Body className="text-center py-5">
          <i className="fas fa-history fa-3x text-muted mb-3"></i>
          <h5 className="text-muted">No processed files yet</h5>
          <p className="text-muted">
            Upload and process some files to see them here
          </p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-4 shadow-sm">
        <Card.Header className="bg-secondary text-white">
          <h5 className="mb-0">
            <i className="fas fa-history me-2"></i>
            Processed Files ({processedFiles.length})
          </h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {processedFiles.map((file) => (
              <Col md={6} lg={4} key={file.id} className="mb-3">
                <Card className="h-100 border">
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <Badge bg="primary" className="mb-2">
                        {file.originalFiles[0]?.name.endsWith('.js') ? 'JavaScript' : 'CSS'}
                      </Badge>
                      <div className="text-muted small">
                        {formatDate(file.timestamp)}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="small text-muted">
                        <strong>{file.originalFiles.length}</strong> files combined
                      </div>
                      <div className="small text-muted">
                        <strong>{formatFileSize(file.originalSize)}</strong> → <strong>{formatFileSize(file.minifiedSize)}</strong>
                      </div>
                      <Badge bg={getCompressionColor(file.compressionRatio)} className="mt-1">
                        {Math.round(file.compressionRatio * 100)}% compressed
                      </Badge>
                    </div>

                    <div className="mt-auto">
                      <div className="d-grid gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleViewDetails(file)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          View Details
                        </Button>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="flex-fill"
                            onClick={() => handleDownload(file, 'minified')}
                          >
                            <i className="fas fa-download me-1"></i>
                            Minified
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            className="flex-fill"
                            onClick={() => handleDownload(file, 'combined')}
                          >
                            <i className="fas fa-download me-1"></i>
                            Combined
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fas fa-info-circle me-2"></i>
            File Processing Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFile && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <Alert variant="info">
                    <strong>Original Files:</strong>
                    <ul className="mb-0 mt-2">
                      {selectedFile.originalFiles.map((file) => (
                        <li key={file.id}>
                          {file.name} ({formatFileSize(file.size)})
                        </li>
                      ))}
                    </ul>
                  </Alert>
                </Col>
                <Col md={6}>
                  <Alert variant="success">
                    <strong>Processing Results:</strong>
                    <div className="mt-2">
                      <div>Original Size: {formatFileSize(selectedFile.originalSize)}</div>
                      <div>Minified Size: {formatFileSize(selectedFile.minifiedSize)}</div>
                      <div>Compression: {Math.round(selectedFile.compressionRatio * 100)}%</div>
                      <div>Processed: {formatDate(selectedFile.timestamp)}</div>
                    </div>
                  </Alert>
                </Col>
              </Row>

              <div className="mb-3">
                <h6>Minified Content Preview:</h6>
                <pre className="bg-light p-3 rounded" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  <code>{selectedFile.minifiedContent.substring(0, 500)}...</code>
                </pre>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {selectedFile && (
            <>
              <Button
                variant="success"
                onClick={() => handleDownload(selectedFile, 'minified')}
              >
                <i className="fas fa-download me-1"></i>
                Download Minified
              </Button>
              <Button
                variant="info"
                onClick={() => handleDownload(selectedFile, 'combined')}
              >
                <i className="fas fa-download me-1"></i>
                Download Combined
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ProcessedFilesList;
