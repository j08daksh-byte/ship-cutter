import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ScrollToHash from './components/common/ScrollToHash';
import ErrorBoundary from './components/common/ErrorBoundary';

import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

import DashboardPage from './pages/DashboardPage';
import PartTrackingPage from './pages/PartTrackingPage';
import MaterialPage from './pages/MaterialPage';
import MaintenancePage from './pages/MaintenancePage';
import FeasibilityPage from './pages/FeasibilityPage';
import HistoryPage from './pages/HistoryPage';
import PhotosPage from './pages/PhotosPage';
import ShipsPage from './pages/ShipsPage';
import ChatbotPage from './pages/ChatbotPage';
import SensorsPage from './pages/SensorsPage';
import DatabaseViewerPage from './pages/DatabaseViewerPage';
import OperationsLivePage from './pages/OperationsLivePage';
import PlaceholderPage from './pages/PlaceholderPage';
import MissionsPage from './pages/MissionsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          <Route element={<DashboardLayout />}>
            <Route path="/operations/live" element={<OperationsLivePage />} />
            <Route path="/operations/missions" element={<MissionsPage />} />
            <Route path="/operations/sensors" element={<SensorsPage />} />
            <Route path="/ships" element={<ShipsPage />} />
            <Route path="/materials" element={<MaterialPage />} />
            <Route path="/parts" element={<PartTrackingPage />} />
            <Route path="/maintenance/health" element={<MaintenancePage />} />
            <Route path="/maintenance/safety" element={<PlaceholderPage title="Safety Logs" />} />
            <Route path="/intelligence/ai" element={<ChatbotPage />} />
            <Route path="/intelligence/history" element={<HistoryPage />} />
            <Route path="/intelligence/analytics" element={<DashboardPage />} />
            <Route path="/settings/users" element={<PlaceholderPage title="User Management" />} />
            <Route path="/settings/config" element={<PlaceholderPage title="System Configuration" />} />
            <Route path="/photos" element={<PhotosPage />} />
            <Route path="/feasibility" element={<FeasibilityPage />} />
            <Route path="/database" element={<DatabaseViewerPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

