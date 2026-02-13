import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; 

import Navbar from './components/Navbar';
import PendingCards from './pages/PendingCards';
import IssuedCards from './pages/IssuedCards';
import CalcularRota from './pages/CalcularRota';
import TrashCards from './pages/TrashCards';
import Login from './pages/Login';
import './styles/App.css';

const PrivateRoutes = () => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  return user ? <Outlet /> : <Navigate to="/login" />;
};

const MainLayout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoutes />}>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/pendentes" replace />} />
                <Route path="/pendentes" element={<PendingCards />} />
                <Route path="/emitidas" element={<IssuedCards />} />
                <Route path="/calcular-rota" element={<CalcularRota />} />
                <Route path="/lixeira" element={<TrashCards />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;