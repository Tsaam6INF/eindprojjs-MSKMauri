/**
 * WeTransfer Client App
 * 
 * Dit is de hoofdcomponent van de WeTransfer webapplicatie. De app biedt de volgende functionaliteiten:
 * - Routing tussen verschillende pagina's
 * - Authenticatie en beschermde routes
 * - Navigatie tussen upload en dashboard pagina's
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import UpgradePage from './pages/UpgradePage';

/**
 * ProtectedRoute Component
 * 
 * Een wrapper component die routes beschermt tegen niet-geauthenticeerde gebruikers.
 * Als er geen token in localStorage gevonden wordt, wordt de gebruiker doorgestuurd naar de login pagina.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - De te renderen component als de gebruiker geauthenticeerd is
 * @returns {React.ReactNode} De beschermde route of een redirect naar login
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <UploadPage />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/upgrade" element={
            <ProtectedRoute>
              <UpgradePage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App;
