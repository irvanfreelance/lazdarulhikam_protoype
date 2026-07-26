import React from 'react';
import { 
  LayoutDashboard, Wallet, Send, Receipt, PieChart, Building2, CreditCard,
  Heart, Gift, FileText, Users, Settings, Database, FileBarChart, Calendar,
  BarChart3, TrendingUp, Activity, Briefcase, MonitorCheck, Megaphone,
  MessageSquare, Tag, Repeat, Handshake, LogOut, Bell, Shield, Hash, Search,
  Calculator, Globe, ChevronRight, ChevronLeft, GraduationCap
} from 'lucide-react';

const Sidebar = ({ currentModule, onModuleChange, activeMenu, onMenuChange, isSidebarCollapsed, toggleSidebar }) => {

  const renderMenuItem = (name, Icon) => {
    const isActive = activeMenu === name;
    return (
      <a href="#" className={`menu-item ${isActive ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onMenuChange(name); }}>
        <div className="menu-item-left">
          <Icon className="icon" />
          <span>{name}</span>
        </div>
        {isActive && <ChevronRight size={16} />}
      </a>
    );
  };

  const renderAccountingMenus = () => (
    <>
      <div className="menu-category">Operasional</div>
      {renderMenuItem('Transaksi Keuangan', Wallet)}
      {renderMenuItem('Penyaluran Dana', Send)}
      {renderMenuItem('Pengeluaran Ops.', Receipt)}
      {renderMenuItem('Anggaran & Realisasi', PieChart)}
      {renderMenuItem('Aset Tetap', Building2)}
      {renderMenuItem('Hutang & Piutang', CreditCard)}
      {renderMenuItem('Program Qurban', Activity)}
      {renderMenuItem('Program Zakat', Heart)}
      {renderMenuItem('Grant & Hibah', Gift)}
      {renderMenuItem('SDM & Penggajian', Users)}

      <div className="menu-category">Konfigurasi</div>
      {renderMenuItem('Master Data', Database)}
      {renderMenuItem('Konfigurasi Program', Settings)}
      {renderMenuItem('Pengaturan Laporan', FileText)}
      {renderMenuItem('Periode Akuntansi', Calendar)}

      <div className="menu-category">Laporan</div>
      {renderMenuItem('Laporan PSAK 409', BarChart3)}
      {renderMenuItem('Laporan Donasi', TrendingUp)}
      {renderMenuItem('Laporan Operasional', Briefcase)}
      {renderMenuItem('Laporan Grant', Gift)}
      {renderMenuItem('Laporan SDM', Users)}

      <div className="menu-category">Monitoring</div>
      {renderMenuItem('Rekonsiliasi Bank', FileBarChart)}
      {renderMenuItem('Audit Trail', Shield)}
      {renderMenuItem('Monitoring Sistem', MonitorCheck)}
    </>
  );

  const renderCrowdfundingMenus = () => (
    <>
      {renderMenuItem('Kampanye', Megaphone)}
      {renderMenuItem('Kabar Penyaluran', MessageSquare)}
      {renderMenuItem('Kategori', Tag)}
      {renderMenuItem('Transaksi', Repeat)}
      {renderMenuItem('Donatur', Users)}
      {renderMenuItem('Afiliasi', Handshake)}
      {renderMenuItem('Penarikan', LogOut)}
      {renderMenuItem('Notifikasi', Bell)}
      {renderMenuItem('Admin', Shield)}
      {renderMenuItem('Payment Channels', CreditCard)}
      {renderMenuItem('Log Sistem', Hash)}
      {renderMenuItem('Pengaturan', Settings)}
    </>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-rail">
        <div className="rail-logo">
          <Heart size={32} color="var(--primary-color)" />
        </div>
        
        <button 
          className={`rail-item ${currentModule === 'crowdfunding' ? 'active' : ''}`}
          onClick={() => onModuleChange('crowdfunding')}
          title="Modul Crowdfunding"
        >
          <Globe size={24} />
          <span className="rail-item-caption">Crowdfund</span>
        </button>

        <button 
          className={`rail-item ${currentModule === 'accounting' ? 'active' : ''}`}
          onClick={() => onModuleChange('accounting')}
          title="Modul Akuntansi"
        >
          <Calculator size={24} />
          <span className="rail-item-caption">Akuntansi</span>
        </button>
      </div>

      <div className="sidebar-sub">
        <div className="sidebar-sub-header">
          <div className="sidebar-sub-title">
            {currentModule === 'accounting' ? 'Akuntansi' : 'Crowdfunding'}
          </div>
          <div className="sidebar-sub-subtitle">
            MANAJEMEN
          </div>
        </div>

        <nav style={{ paddingBottom: '32px' }}>
          {renderMenuItem('Dashboard', LayoutDashboard)}

          {currentModule === 'accounting' ? renderAccountingMenus() : renderCrowdfundingMenus()}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
