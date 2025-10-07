'use client';

import React from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setActiveTab } from '@/store/slices/fileSlice';
import FileUploadPanel from './FileUploadPanel';
import ProcessedFilesList from './ProcessedFilesList';
import ApiStatusIndicator from './ApiStatusIndicator';
import ThemeToggle from './ThemeToggle';
import LocationIndicator from './LocationIndicator';
import DevDebugPanel from './DevDebugPanel';
import { useUserTracking } from '@/hooks/useUserTracking';

const WeldPakApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeTab } = useAppSelector((state) => state.files);
  const { logActivity } = useUserTracking();

  const handleTabSelect = (tabKey: string | null) => {
    if (tabKey === 'js' || tabKey === 'css') {
      dispatch(setActiveTab(tabKey));
      // Log tab switch activity
      logActivity('tab_switch', { tab: tabKey });
    }
  };

  return (
    <div className="min-vh-100 bg-body">
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            {/* Theme Toggle and Location */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <LocationIndicator />
              <ThemeToggle />
            </div>
            
            {/* Development Debug Panel */}
            <DevDebugPanel />
            
            {/* Header */}
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-primary mb-3">
                <i className="fas fa-code me-3"></i>
                WeldPak
              </h1>
              <p className="lead text-muted">
                Combine and minify JavaScript and CSS files with ease
              </p>
              <ApiStatusIndicator />
            </div>

            {/* Main Content */}
            <Tab.Container
              activeKey={activeTab}
              onSelect={handleTabSelect}
            >
              <Nav variant="pills" className="justify-content-center mb-4">
                <Nav.Item>
                  <Nav.Link eventKey="js" className="px-4 py-2">
                    <i className="fab fa-js-square me-2"></i>
                    JavaScript Files
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="css" className="px-4 py-2">
                    <i className="fab fa-css3-alt me-2"></i>
                    CSS Files
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <Tab.Content>
                <Tab.Pane eventKey="js">
                  <FileUploadPanel fileType="js" />
                </Tab.Pane>
                <Tab.Pane eventKey="css">
                  <FileUploadPanel fileType="css" />
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>

            {/* Processed Files History */}
            <ProcessedFilesList />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default WeldPakApp;
