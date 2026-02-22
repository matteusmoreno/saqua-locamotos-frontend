import { FiMenu, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

function Header({ title, subtitle, onMenuToggle }) {
  const { user } = useAuth();

  const getInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const roleName = user?.role === 'ADMIN' ? 'Admin' : 'Locador';

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-menu-btn" onClick={onMenuToggle}>
          <FiMenu />
        </button>
        <div className="header-breadcrumb">
          <span className="header-breadcrumb-root">Painel</span>
          {title && title !== 'Dashboard' && (
            <>
              <FiChevronRight className="header-breadcrumb-sep" />
              <span className="header-breadcrumb-page">{title}</span>
            </>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="header-user">
          <div className="header-user-avatar">{getInitial()}</div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.email || user?.sub || 'Usuário'}</span>
            <span className="header-user-role">{roleName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
