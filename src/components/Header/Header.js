import { FiMenu, FiChevronRight, FiLogOut, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ title, subtitle, onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getInitials = () => {
    if (user?.email) {
      const parts = user.email.split('@')[0].split(/[._-]/);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const roleName = user?.role === 'ADMIN' ? 'Administrador' : 'Locador';
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuToggle} title="Abrir menu">
          <FiMenu />
        </button>
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-root">Saqua Locamotos</span>
          {title && (
            <>
              <FiChevronRight className="header-breadcrumb-sep" />
              <span className="header-breadcrumb-page">{title}</span>
            </>
          )}
        </div>
      </div>

      <div className="header-right">
        {isAdmin && (
          <div className="header-badge-admin">
            <FiShield /> Admin
          </div>
        )}
        <div className="header-user">
          <div className="header-user-avatar">{getInitials()}</div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.email || user?.sub || 'Usuário'}</span>
            <span className="header-user-role">{roleName}</span>
          </div>
        </div>
        <button className="header-logout" onClick={handleLogout} title="Sair">
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}

export default Header;
