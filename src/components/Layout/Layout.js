import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import BottomNav from '../BottomNav/BottomNav';
import './Layout.css';

const ROUTE_TITLES = {
  '/painel': 'Painel',
  '/locadores': 'Locadores',
  '/locadores/novo': 'Novo Locador',
  '/motos': 'Motos',
  '/motos/nova': 'Nova Moto',
  '/contratos': 'Contratos',
  '/contratos/novo': 'Novo Contrato',
  '/financeiro': 'Financeiro',
  '/minha-conta': 'Meu Perfil',
  '/meus-contratos': 'Meus Contratos',
  '/verificar-email': 'Verificar E-mail',
};

function getPageTitle(pathname) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  if (pathname.startsWith('/locadores/') && pathname.includes('/editar')) return 'Editar Locador';
  if (pathname.startsWith('/locadores/')) return 'Detalhes do Locador';
  if (pathname.startsWith('/motos/') && pathname.includes('/editar')) return 'Editar Moto';
  if (pathname.startsWith('/motos/')) return 'Detalhes da Moto';
  if (pathname.startsWith('/contratos/')) return 'Detalhes do Contrato';
  if (pathname.startsWith('/meus-contratos/')) return 'Detalhes do Contrato';
  return null;
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header title={pageTitle} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="layout-content">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export default Layout;
