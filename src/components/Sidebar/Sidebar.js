import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiTruck, FiFileText, FiLogOut, FiUser, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

function MotoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="34" r="7" stroke="#0b0b0f" strokeWidth="3" fill="none"/>
      <circle cx="38" cy="34" r="7" stroke="#0b0b0f" strokeWidth="3" fill="none"/>
      <path d="M17 34H31" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 12H20L14 28H34L28 12Z" stroke="#0b0b0f" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
      <path d="M20 24H12L10 34" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 24H36L38 34" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M28 12L32 6H38" stroke="#0b0b0f" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="38" cy="6" r="2" fill="#0b0b0f"/>
    </svg>
  );
}

function Sidebar({ isOpen, onClose }) {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <MotoIcon />
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-main">SAQUA<span className="sidebar-logo-accent">LOCA</span></span>
              <span className="sidebar-logo-sub">MOTOS</span>
            </div>
          </div>
          <span className="sidebar-brand-sub">Gestão de Aluguéis</span>
        </div>

        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <div className="sidebar-section-title">Administração</div>
              <NavLink
                to="/painel"
                end
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiHome />
                Dashboard
              </NavLink>
              <NavLink
                to="/locadores"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiUsers />
                Locadores
              </NavLink>
              <NavLink
                to="/motos"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiTruck />
                Motos
              </NavLink>
              <NavLink
                to="/contratos"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiFileText />
                Contratos
              </NavLink>
              <NavLink
                to="/financeiro"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiDollarSign />
                Financeiro
              </NavLink>
            </>
          ) : (
            <>
              <div className="sidebar-section-title">Menu</div>
              <NavLink
                to="/painel"
                end
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiHome />
                Início
              </NavLink>
              <NavLink
                to="/minha-conta"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiUser />
                Meu Perfil
              </NavLink>
              <NavLink
                to="/meus-contratos"
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <FiFileText />
                Meus Contratos
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FiLogOut />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
