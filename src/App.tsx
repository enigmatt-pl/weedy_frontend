import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { NewDispensaryPage } from './pages/NewDispensaryPage';
import { DispensaryHistoryPage } from './pages/DispensaryHistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { PlatformCallback } from './pages/PlatformCallback';
import { AdminUsersList } from './pages/AdminUsersList';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { useToastStore } from './store/toastStore';
import { Toast } from './components/ui/Toast';
import { AnalyticsService, initEngagementTracking } from './lib/analytics';

/** Fires a page view event on every route change. Renders nothing. */
const PageViewTracker = () => {
  const location = useLocation();
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Cleanup previous page's engagement tracking (flushes data)
    if (cleanupRef.current) cleanupRef.current();

    const path = location.pathname + location.search;
    AnalyticsService.trackPageView(path);

    // Start engagement tracking for this page
    const visitorId = localStorage.getItem('weedy_visitor_id') || 'anonymous';
    cleanupRef.current = initEngagementTracking(visitorId, path);

    // Cleanup on unmount
    return () => { if (cleanupRef.current) cleanupRef.current(); };
  }, [location]);
  return null;
};

export const App = () => {
  const { initialize } = useAuthStore();
  const { message, type, show, hideToast } = useToastStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <PageViewTracker />
      {show && (
        <Toast 
          message={message} 
          type={type} 
          onClose={hideToast} 
        />
      )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="new" replace />} />
            <Route path="new" element={<NewDispensaryPage />} />
            <Route path="history" element={<DispensaryHistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute requiredRole="super_admin" />}>
          <Route path="/admin" element={<Dashboard />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<AdminUsersList />} />
            <Route path="analytics" element={<AdminAnalyticsPage />} />
          </Route>
        </Route>

        <Route path="/dashboard/platform/callback" element={<PlatformCallback />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
