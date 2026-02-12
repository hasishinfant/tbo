// Main App component
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './context/AppContext';

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const TripPlannerPage = React.lazy(() => import('./pages/TripPlannerPage'));
const ItineraryPage = React.lazy(() => import('./pages/ItineraryPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const EmergencyPage = React.lazy(() => import('./pages/EmergencyPage'));

// Shared Components
import Navbar from './components/shared/Navbar';
// import Header from './components/shared/Header'; // Deprecated for redesign
import ErrorBoundary from './components/shared/ErrorBoundary';
import NetworkStatus from './components/shared/NetworkStatus';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { GlobalLoadingManager } from './components/shared/GlobalLoadingManager';
import { AIAssistantWidget } from './confidence-engine/components/AIAssistantWidget';

// Styles
import './styles/global.css';

// Create a client for React Query with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  
  // Use basename only in production
  const basename = import.meta.env.PROD ? '/tbo' : '/';

  React.useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <GlobalLoadingManager>
            <Router basename={basename}>
              <div className="app">
                <NetworkStatus />
                {isAuthenticated && <Navbar />}
                {isAuthenticated && <AIAssistantWidget />}
                <main className="main-content">
                  <Suspense fallback={
                    <div className="page-loading">
                      <LoadingSpinner 
                        size="lg" 
                        message="Loading page..." 
                        className="page-loader"
                      />
                    </div>
                  }>
                    <Routes>
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/" element={isAuthenticated ? <HomePage /> : <LoginPage />} />
                      <Route path="/plan-trip" element={isAuthenticated ? <TripPlannerPage /> : <LoginPage />} />
                      <Route path="/itinerary" element={isAuthenticated ? <ItineraryPage /> : <LoginPage />} />
                      <Route path="/itinerary/:tripId" element={isAuthenticated ? <ItineraryPage /> : <LoginPage />} />
                      <Route path="/chat" element={isAuthenticated ? <ChatPage /> : <LoginPage />} />
                      <Route path="/chat/:tripId" element={isAuthenticated ? <ChatPage /> : <LoginPage />} />
                      <Route path="/emergency-support" element={isAuthenticated ? <EmergencyPage /> : <LoginPage />} />
                      {/* Catch-all route for 404 */}
                      <Route path="*" element={
                        <div className="not-found">
                          <h1>Page Not Found</h1>
                          <p>The page you're looking for doesn't exist.</p>
                          <a href="/">Go back to home</a>
                        </div>
                      } />
                    </Routes>
                  </Suspense>
                </main>
              </div>
            </Router>
          </GlobalLoadingManager>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;