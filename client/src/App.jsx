import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import DailyPricesPage from './pages/DailyPricesPage.jsx';
import PriceComparePage from './pages/PriceComparePage.jsx';
import FindOpportunityPage from './pages/FindOpportunityPage.jsx';
import BuyerPage from './pages/BuyerPage.jsx';
import PostRequirementPage from './pages/PostRequirementPage.jsx';
import AssistantPage from './pages/AssistantPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

// Security & Operations Portal
import { AuthProvider } from './contexts/AuthContext.jsx';
import ProtectedRoute from './portal/ProtectedRoute.jsx';
import PortalLayout from './portal/PortalLayout.jsx';
import PortalLandingPage from './portal/PortalLandingPage.jsx';
import PortalLoginPage from './portal/PortalLoginPage.jsx';
import PortalRegisterPage from './portal/PortalRegisterPage.jsx';
import OfficialDashboardPage from './portal/OfficialDashboardPage.jsx';
import OfficialPriceSubmitPage from './portal/OfficialPriceSubmitPage.jsx';
import OfficialSubmissionsPage from './portal/OfficialSubmissionsPage.jsx';
import AdminDashboardPage from './portal/AdminDashboardPage.jsx';
import AdminOfficialsPage from './portal/AdminOfficialsPage.jsx';
import AdminPriceQueuePage from './portal/AdminPriceQueuePage.jsx';
import AdminMarketsPage from './portal/AdminMarketsPage.jsx';
import AdminAuditPage from './portal/AdminAuditPage.jsx';

import { LanguageProvider } from './contexts/LanguageContext.jsx';
import LanguageSelector from './components/LanguageSelector.jsx';

function MainAppShell() {
  const location = useLocation();
  const isPortal = location.pathname.startsWith('/portal');

  return (
    <div className={isPortal ? 'portal-app-shell' : 'mobile-app-shell'}>
      {!isPortal && <LanguageSelector />}
      <Navbar />
      <main className={isPortal ? 'portal-viewport' : 'main-content-viewport'}>
        <div className={isPortal ? 'portal-container' : 'content-container'}>
          <Routes>
            {/* Root 1: Normal User / Farmer Safe Route System */}
            <Route path="/" element={<HomePage />} />
            <Route path="/prices" element={<DailyPricesPage />} />
            <Route path="/compare" element={<PriceComparePage />} />
            <Route path="/find" element={<FindOpportunityPage />} />
            <Route path="/buyers" element={<BuyerPage />} />
            <Route path="/post-requirement" element={<PostRequirementPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Root 2: Secure Management & Administrative Safe System */}
            <Route path="/portal" element={<PortalLayout />}>
              <Route index element={<PortalLandingPage />} />
              <Route path="login" element={<PortalLoginPage />} />
              <Route path="register" element={<PortalRegisterPage />} />
              
              {/* Mandi Official Guarded Sub-Routes */}
              <Route
                path="official"
                element={
                  <ProtectedRoute allowedRoles={['official', 'admin']}>
                    <OfficialDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="official/submit"
                element={
                  <ProtectedRoute allowedRoles={['official', 'admin']}>
                    <OfficialPriceSubmitPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="official/submissions"
                element={
                  <ProtectedRoute allowedRoles={['official', 'admin']}>
                    <OfficialSubmissionsPage />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Guarded Sub-Routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/officials"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminOfficialsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/prices"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPriceQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/markets"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminMarketsPage initialTab="MARKETS" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/commodities"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminMarketsPage initialTab="COMMODITIES" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminAuditPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppShell />
      </AuthProvider>
    </LanguageProvider>
  );
}
