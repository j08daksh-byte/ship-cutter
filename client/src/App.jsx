import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Utilities
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ScrollToHash from './components/common/ScrollToHash';
import ErrorBoundary from './components/common/ErrorBoundary';

// Public Pages
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';

// Dashboard Pages
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

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
        {/* Public Website Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        {/* Internal Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="sensors" element={<SensorsPage />} />
          <Route path="database" element={<DatabaseViewerPage />} />
          <Route path="parts" element={<PartTrackingPage />} />
          <Route path="materials" element={<MaterialPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="feasibility" element={<FeasibilityPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="ships" element={<ShipsPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
        </Route>

        {/* Unified Live Operations Route */}
        <Route path="/operations" element={<DashboardLayout />}>
          <Route path="live" element={<OperationsLivePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>
);
}
