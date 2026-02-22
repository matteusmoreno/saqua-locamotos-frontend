import { NavLink } from 'react-router-dom';
import { FiHome, FiUsers, FiFileText, FiUser, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

function BottomNav() {
  const { isAdmin } = useAuth();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {isAdmin ? (
          <>
            <NavLink
              to="/painel"
              end
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiHome />
              Início
            </NavLink>
            <NavLink
              to="/locadores"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiUsers />
              Locadores
            </NavLink>
            <NavLink
              to="/contratos"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiFileText />
              Contratos
            </NavLink>
            <NavLink
              to="/financeiro"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiDollarSign />
              Financeiro
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/painel"
              end
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiHome />
              Início
            </NavLink>
            <NavLink
              to="/minha-conta"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiUser />
              Perfil
            </NavLink>
            <NavLink
              to="/meus-contratos"
              className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <FiFileText />
              Contratos
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default BottomNav;
