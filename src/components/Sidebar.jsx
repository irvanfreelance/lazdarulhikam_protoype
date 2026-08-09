import React from 'react';
import {
  LayoutDashboard, Wallet, Send, Receipt, PieChart, Building2, CreditCard,
  Heart, Gift, FileText, Users, Settings, Database, FileBarChart, Calendar,
  BarChart3, TrendingUp, Activity, Briefcase, MonitorCheck, Megaphone,
  MessageSquare, Tag, Repeat, Handshake, LogOut, Bell, Shield, Hash, Search,
  Calculator, Globe, ChevronRight, ChevronLeft, GraduationCap, Landmark,
  ClipboardCheck, BookOpen, Lock, CheckCircle, BookText, Scale, BadgeCheck,
  FileSpreadsheet, Book, IdCard, CalendarCheck, Folder, Mail, Truck, MapPin
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

  const renderPenyaluranMenus = () => (
    <>
      <div className="menu-category">Operasional</div>
      {renderMenuItem('Peta Penyaluran', MapPin)}
      {renderMenuItem('Pengajuan Penyaluran', Send)}
      {renderMenuItem('Penerima Manfaat', Users)}
      {renderMenuItem('Distribusi Massal', Repeat)}

      <div className="menu-category">Pertanggungjawaban</div>
      {renderMenuItem('Pertanggungjawaban', ClipboardCheck)}

      <div className="menu-category">Laporan</div>
      {renderMenuItem('Laporan Penyaluran', BarChart3)}
    </>
  );

  const renderFinsMenus = () => (
    <>
      <div className="menu-category">Home</div>
      {renderMenuItem('Dashboard Cash Bank', LayoutDashboard)}
      {renderMenuItem('Pengajuan CA', FileText)}
      {renderMenuItem('Pencairan', Send)}
      {renderMenuItem('Pertanggungjawaban CA', ClipboardCheck)}
      {renderMenuItem('Pengeluaran', Receipt)}
      {renderMenuItem('Penerimaan', Wallet)}
      {renderMenuItem('Buku Harian', BookOpen)}
      {renderMenuItem('Penutupan', Lock)}
      {renderMenuItem('Resume Dana Pengelola', FileBarChart)}
      {renderMenuItem('Bank Statement', CreditCard)}

      <div className="menu-category">Anggaran</div>
      {renderMenuItem('Resume Anggaran', PieChart)}
      {renderMenuItem('Approve Anggaran', CheckCircle)}

      <div className="menu-category">Akuntansi</div>
      {renderMenuItem('Saldo Awal', Landmark)}
      {renderMenuItem('Rekap Jurnal', BookText)}
      {renderMenuItem('Buku Besar', Book)}
      {renderMenuItem('Trial Balance', Scale)}

      <div className="menu-category">Laporan</div>
      {renderMenuItem('Laporan Keuangan', BarChart3)}
      {renderMenuItem('Laporan Bulanan', Calendar)}

      <div className="menu-category">Aset</div>
      {renderMenuItem('Entry Aset', Building2)}
      {renderMenuItem('List Aset', Database)}

      <div className="menu-category">Setting Configuration</div>
      {renderMenuItem('Profile Lembaga', Briefcase)}
      {renderMenuItem('Program', Settings)}

      <div className="menu-category">FINS</div>
      {renderMenuItem('Kode Bank', Hash)}
      {renderMenuItem('Rekening Bank', CreditCard)}
      {renderMenuItem('Chart of Accounts', FileSpreadsheet)}
      {renderMenuItem('COA Kantor', Building2)}
      {renderMenuItem('Saldo Dana', Wallet)}
      {renderMenuItem('Level Approve', BadgeCheck)}
      {renderMenuItem('Rumus Report', Calculator)}
    </>
  );

  const renderHcmMenus = () => (
    <>
      <div className="menu-category">Kepegawaian</div>
      {renderMenuItem('Data Karyawan', Users)}

      <div className="menu-category">Presensi</div>
      {renderMenuItem('Kehadiran Karyawan', CalendarCheck)}
    </>
  );

  const renderDocumentMenus = () => (
    <>
      <div className="menu-category">Kearsipan</div>
      {renderMenuItem('Daftar Dokumen', FileText)}
      {renderMenuItem('Surat Menyurat', Mail)}
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
          className={`rail-item ${currentModule === 'penyaluran' ? 'active' : ''}`}
          onClick={() => onModuleChange('penyaluran')}
          title="Modul Penyaluran"
        >
          <Truck size={24} />
          <span className="rail-item-caption">Penyaluran</span>
        </button>

        <button
          className={`rail-item ${currentModule === 'accounting' ? 'active' : ''}`}
          onClick={() => onModuleChange('accounting')}
          title="Modul Akuntansi"
        >
          <Calculator size={24} />
          <span className="rail-item-caption">Akuntansi</span>
        </button>

        <button
          className={`rail-item ${currentModule === 'fins' ? 'active' : ''}`}
          onClick={() => onModuleChange('fins')}
          title="Modul FINS"
        >
          <Landmark size={24} />
          <span className="rail-item-caption">FINS</span>
        </button>

        <button
          className={`rail-item ${currentModule === 'hcm' ? 'active' : ''}`}
          onClick={() => onModuleChange('hcm')}
          title="Modul HCM"
        >
          <IdCard size={24} />
          <span className="rail-item-caption">HCM</span>
        </button>

        <button
          className={`rail-item ${currentModule === 'document' ? 'active' : ''}`}
          onClick={() => onModuleChange('document')}
          title="Modul Document"
        >
          <Folder size={24} />
          <span className="rail-item-caption">Document</span>
        </button>
      </div>

      <div className="sidebar-sub">
        <div className="sidebar-sub-header">
          <div className="sidebar-sub-title">
            {currentModule === 'accounting' ? 'Akuntansi' : currentModule === 'fins' ? 'FINS' : currentModule === 'hcm' ? 'HCM' : currentModule === 'document' ? 'Document' : currentModule === 'penyaluran' ? 'Penyaluran' : 'Crowdfunding'}
          </div>
          <div className="sidebar-sub-subtitle">
            MANAJEMEN
          </div>
        </div>

        <nav style={{ paddingBottom: '32px' }}>
          {(currentModule === 'fins' || currentModule === 'document') ? null : renderMenuItem('Dashboard', LayoutDashboard)}

          {currentModule === 'accounting'
            ? renderAccountingMenus()
            : currentModule === 'fins'
              ? renderFinsMenus()
              : currentModule === 'hcm'
                ? renderHcmMenus()
                : currentModule === 'document'
                  ? renderDocumentMenus()
                  : currentModule === 'penyaluran'
                    ? renderPenyaluranMenus()
                    : renderCrowdfundingMenus()}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
