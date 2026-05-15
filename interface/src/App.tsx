import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ProductCatalog } from './pages/ProductCatalog';
import { InventoryTracking } from './pages/InventoryTracking';
import { NewTransaction } from './pages/NewTransaction';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { UserHome } from './pages/UserHome';
import { Register } from './pages/Register';

import { ModalProvider } from './context/ModalContext';

// Redirect authenticated users away from login
const LoginRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login />;
};

const IndexRoute = () => {
  const { user } = useAuth();
  return user?.role === 'ROLE_ADMIN' ? <Dashboard /> : <UserHome />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <Routes>
              {/* Public route */}
              <Route path="/login" element={<LoginRoute />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<IndexRoute />} />
                <Route path="catalog" element={<ProductCatalog />} />
                <Route path="tracking" element={<InventoryTracking />} />
                <Route path="transactions" element={<NewTransaction />} />
                <Route path="reports" element={<ReportsAnalytics />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
