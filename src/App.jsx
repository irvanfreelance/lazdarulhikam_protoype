import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import TransaksiKeuangan from './pages/TransaksiKeuangan';
import PenyaluranDana from './pages/PenyaluranDana';
import PengeluaranOps from './pages/PengeluaranOps';
import AnggaranRealisasi from './pages/AnggaranRealisasi';
import AsetTetap from './pages/AsetTetap';
import HutangPiutang from './pages/HutangPiutang';
import ProgramZakatQurban from './pages/ProgramZakatQurban';
import GrantHibah from './pages/GrantHibah';
import SDMPenggajian from './pages/SDMPenggajian';
import MasterDataKeuangan from './pages/MasterDataKeuangan';
import KonfigurasiProgram from './pages/KonfigurasiProgram';
import PeriodeAkuntansi from './pages/PeriodeAkuntansi';
import DashboardAkuntansi from './pages/DashboardAkuntansi';
import PengaturanLaporan from './pages/PengaturanLaporan';
import LaporanDonasi from './pages/LaporanDonasi';
import LaporanOperasional from './pages/LaporanOperasional';
import LaporanGrant from './pages/LaporanGrant';
import LaporanSDM from './pages/LaporanSDM';
import AuditTrail from './pages/AuditTrail';
import RekonsiliasiBank from './pages/RekonsiliasiBank';
import MonitoringSistem from './pages/MonitoringSistem';
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
      switch (activeMenu) {
        case 'Dashboard':
          return <DashboardAkuntansi />;
        case 'Transaksi Keuangan':
          return <TransaksiKeuangan />;
        case 'Penyaluran Dana':
          return <PenyaluranDana />;
        case 'Pengeluaran Ops.':
          return <PengeluaranOps />;
        case 'Anggaran & Realisasi':
          return <AnggaranRealisasi />;
        case 'Aset Tetap':
          return <AsetTetap />;
        case 'Hutang & Piutang':
          return <HutangPiutang />;
        case 'Program Qurban':
        case 'Program Zakat':
          return <ProgramZakatQurban />;
        case 'Grant & Hibah':
          return <GrantHibah />;
        case 'SDM & Penggajian':
          return <SDMPenggajian />;
        case 'Master Data':
          return <MasterDataKeuangan />;
        case 'Konfigurasi Program':
          return <KonfigurasiProgram />;
        case 'Pengaturan Laporan':
          return <PengaturanLaporan />;
        case 'Periode Akuntansi':
          return <PeriodeAkuntansi />;
        case 'Laporan PSAK 45':
          return <LaporanPSAK45 />;
        case 'Laporan Donasi':
          return <LaporanDonasi />;
        case 'Laporan Operasional':
          return <LaporanOperasional />;
        case 'Laporan Grant':
          return <LaporanGrant />;
        case 'Laporan SDM':
          return <LaporanSDM />;
        case 'Rekonsiliasi Bank':
          return <RekonsiliasiBank />;
        case 'Audit Trail':
          return <AuditTrail />;
        case 'Monitoring Sistem':
          return <MonitoringSistem />;
        default:
          return <ComingSoon title={activeMenu} />;
      }
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
