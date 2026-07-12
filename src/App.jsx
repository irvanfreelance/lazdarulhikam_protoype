import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TransaksiKeuangan from './pages/TransaksiKeuangan';
import DashboardCrowdfunding from './pages/DashboardCrowdfunding';
import KampanyeList from './pages/KampanyeList';
import ComingSoon from './pages/ComingSoon';
import './index.css';

function App() {
  const [currentModule, setCurrentModule] = useState('crowdfunding');
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleModuleChange = (module) => {
    setCurrentModule(module);
    if (module === 'accounting') {
      setActiveMenu('Transaksi Keuangan');
    } else {
      setActiveMenu('Dashboard');
    }
    // Close sidebar on mobile after selecting a module
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);
    // Close sidebar on mobile after selecting a menu
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(!isSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const renderContent = () => {
    if (currentModule === 'accounting') {
      if (activeMenu === 'Transaksi Keuangan') {
        return <TransaksiKeuangan />;
      }
      return <ComingSoon title={activeMenu} />;
    } else if (currentModule === 'crowdfunding') {
      if (activeMenu === 'Dashboard') {
        return <DashboardCrowdfunding />;
      } else if (activeMenu === 'Kampanye') {
        return <KampanyeList />;
      }
      return <ComingSoon title={activeMenu} />;
    }
    return <ComingSoon title={activeMenu} />;
  };

  return (
    <div className={`admin-layout theme-${currentModule} ${isSidebarOpen ? 'sidebar-open' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      <Sidebar 
        currentModule={currentModule} 
        onModuleChange={handleModuleChange}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
        toggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      <div className="main-wrapper">
        <Topbar toggleSidebar={toggleSidebar} />
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
