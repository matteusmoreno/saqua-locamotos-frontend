import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import BottomNav from '../BottomNav/BottomNav';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="layout-main">
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="layout-content">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export default Layout;
