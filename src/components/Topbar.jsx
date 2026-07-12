import React from 'react';
import { Search, Bell, Settings, ChevronDown, Menu } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="hamburger-mobile" onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
          <Menu size={24} />
        </button>
        <div className="topbar-title">ERP LAZ Darul Hikam</div>
      </div>
      
      <div className="topbar-right">
        <div className="search-bar">
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Cari transaksi atau jurnal..." />
        </div>

        <Bell className="topbar-icon" size={20} />

        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 8px' }}></div>

        <div className="user-profile">
          <div className="user-info" style={{ textAlign: 'right' }}>
            <span className="user-name">Irvan</span>
            <span className="user-role">Superadmin</span>
          </div>
          <div className="user-avatar">I</div>
          <ChevronDown size={16} color="#64748b" />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
