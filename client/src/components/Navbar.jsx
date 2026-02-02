import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css'; 

const Navbar = () => {
  const { logout } = useAuth();

  return (
    <nav className="sidebar">
      <div className="app-logo">
        <div className="logo-icon-bg">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 11H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M16 15H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M4 19V9.5C4 7.01472 6.01472 5 8.5 5H15.5C17.9853 5 20 7.01472 20 9.5V19" stroke="currentColor" strokeWidth="2"/>
            <path d="M4 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M6 22V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 22V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span>Gestão Passe</span>
      </div>

      <div className="nav-menu">
        <NavLink to="/pendentes" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 16H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Solicitações
        </NavLink>

        <NavLink to="/emitidas" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L11 13L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Emitidas
        </NavLink>

        <NavLink to="/calcular-rota" className={({ isActive }) => `nav-btn ${isActive ? "active" : ""}`}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.959-.24 1.962 0 2.92L1 17h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="17" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="5" cy="17" r="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M16 5l-1-4H7L6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Calcular Rota
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sair do Sistema
        </button>
        
        <div className="footer-version">
          v1.0.5 • Transporte
        </div>
      </div>
    </nav>
  );
};

export default Navbar;