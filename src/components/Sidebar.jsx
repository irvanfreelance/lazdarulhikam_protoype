import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Wallet, Send, Receipt, PieChart, Building2, CreditCard,
  Heart, Gift, FileText, Users, Settings, Database, FileBarChart, Calendar,
  BarChart3, TrendingUp, Activity, Briefcase, MonitorCheck, Megaphone,
  MessageSquare, Tag, Repeat, Handshake, LogOut, Bell, Shield, Hash, Search,
  Calculator, Globe, ChevronRight, ChevronDown, ChevronLeft, GraduationCap, Landmark,
  ClipboardCheck, BookOpen, Lock, CheckCircle, BookText, Scale, BadgeCheck,
  FileSpreadsheet, Book, IdCard, CalendarCheck, Folder, Mail, Truck, MapPin,
  ListChecks
} from 'lucide-react';

// Grouped menu definitions per module. Each group renders as a collapsible
// accordion section so long menus don't push the sidebar into an endless
// vertical scroll. `null` (crowdfunding) means "flat list, no accordion".
const MODULE_GROUPS = {
  accounting: [
    { category: 'Operasional', items: [
      ['Transaksi Keuangan', Wallet],
      ['Pengeluaran Ops.', Receipt],
      ['Anggaran & Realisasi', PieChart],
      ['Aset Tetap', Building2],
      ['Hutang & Piutang', CreditCard],
      ['Program Qurban', Activity],
      ['Program Zakat', Heart],
      ['Grant & Hibah', Gift],
      ['SDM & Penggajian', Users]
    ]},
    { category: 'Konfigurasi', items: [
      ['Master Data', Database],
      ['Konfigurasi Program', Settings],
      ['Pengaturan Laporan', FileText],
      ['Periode Akuntansi', Calendar]
    ]},
    { category: 'Laporan', items: [
      ['Laporan PSAK 409', BarChart3],
      ['Laporan Donasi', TrendingUp],
      ['Laporan Operasional', Briefcase],
      ['Laporan Grant', Gift],
      ['Laporan SDM', Users]
    ]},
    { category: 'Monitoring', items: [
      ['Rekonsiliasi Bank', FileBarChart],
      ['Audit Trail', Shield],
      ['Monitoring Sistem', MonitorCheck]
    ]}
  ],

  penyaluran: [
    { category: 'Operasional', items: [
      ['Peta Penyaluran', MapPin],
      ['Pengajuan Penyaluran', Send],
      ['Penerima Manfaat', Users],
      ['Distribusi Massal', Repeat]
    ]},
    { category: 'Pertanggungjawaban', items: [
      ['Pertanggungjawaban', ClipboardCheck]
    ]},
    { category: 'Laporan', items: [
      ['Laporan Penyaluran', BarChart3]
    ]}
  ],

  fins: [
    { category: 'Home', items: [
      ['Dashboard Cash Bank', LayoutDashboard],
      ['Pengajuan CA', FileText],
      ['Pencairan', Send],
      ['Pertanggungjawaban CA', ClipboardCheck],
      ['Pengeluaran', Receipt],
      ['Penerimaan', Wallet],
      ['Buku Harian', BookOpen],
      ['Penutupan', Lock],
      ['Resume Dana Pengelola', FileBarChart],
      ['Bank Statement', CreditCard]
    ]},
    { category: 'Anggaran', items: [
      ['Resume Anggaran', PieChart],
      ['Approve Anggaran', CheckCircle]
    ]},
    { category: 'Akuntansi', items: [
      ['Saldo Awal', Landmark],
      ['Rekap Jurnal', BookText],
      ['Buku Besar', Book],
      ['Trial Balance', Scale]
    ]},
    { category: 'Laporan', items: [
      ['Laporan Keuangan', BarChart3],
      ['Laporan Bulanan', Calendar]
    ]},
    { category: 'Aset', items: [
      ['Entry Aset', Building2],
      ['List Aset', Database]
    ]},
    { category: 'Setting Configuration', items: [
      ['Profile Lembaga', Briefcase],
      ['Program', Settings]
    ]},
    { category: 'FINS', items: [
      ['Kode Bank', Hash],
      ['Rekening Bank', CreditCard],
      ['Chart of Accounts', FileSpreadsheet],
      ['COA Kantor', Building2],
      ['Saldo Dana', Wallet],
      ['Level Approve', BadgeCheck],
      ['Rumus Report', Calculator]
    ]}
  ],

  hcm: [
    { category: 'Kepegawaian', items: [
      ['Data Karyawan', Users]
    ]},
    { category: 'Presensi', items: [
      ['Kehadiran Karyawan', CalendarCheck]
    ]},
    { category: 'Produktivitas', items: [
      ['Aktivitas Harian', ListChecks]
    ]}
  ],

  document: [
    { category: 'Kearsipan', items: [
      ['Daftar Dokumen', FileText],
      ['Surat Menyurat', Mail]
    ]}
  ],

  crowdfunding: null
};

const CROWDFUNDING_ITEMS = [
  ['Kampanye', Megaphone],
  ['Kabar Penyaluran', MessageSquare],
  ['Kategori', Tag],
  ['Transaksi', Repeat],
  ['Donatur', Users],
  ['Afiliasi', Handshake],
  ['Penarikan', LogOut],
  ['Notifikasi', Bell],
  ['Admin', Shield],
  ['Payment Channels', CreditCard],
  ['Log Sistem', Hash],
  ['Pengaturan', Settings]
];

const Sidebar = ({ currentModule, onModuleChange, activeMenu, onMenuChange, isSidebarCollapsed, toggleSidebar }) => {
  // Tracks which accordion category is open per module, e.g. { accounting: 'Operasional' }
  const [openGroup, setOpenGroup] = useState(() => {
    const initial = {};
    Object.entries(MODULE_GROUPS).forEach(([mod, groups]) => {
      if (groups && groups.length) initial[mod] = groups[0].category;
    });
    return initial;
  });

  // Keep the group containing the active menu item expanded, so navigating
  // (including via deep links/state restoration) never hides the current page.
  useEffect(() => {
    const groups = MODULE_GROUPS[currentModule];
    if (!groups) return;
    const match = groups.find(g => g.items.some(([name]) => name === activeMenu));
    if (match) {
      setOpenGroup(prev => (prev[currentModule] === match.category ? prev : { ...prev, [currentModule]: match.category }));
    }
  }, [currentModule, activeMenu]);

  const toggleGroup = (moduleKey, category) => {
    setOpenGroup(prev => ({ ...prev, [moduleKey]: prev[moduleKey] === category ? null : category }));
  };

  const renderMenuItem = (name, Icon) => {
    const isActive = activeMenu === name;
    return (
      <a key={name} href="#" className={`menu-item ${isActive ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); onMenuChange(name); }}>
        <div className="menu-item-left">
          <Icon className="icon" />
          <span>{name}</span>
        </div>
        {isActive && <ChevronRight size={16} />}
      </a>
    );
  };

  const renderAccordionMenus = (moduleKey) => {
    const groups = MODULE_GROUPS[moduleKey];
    if (!groups) return null;
    return groups.map(group => {
      const isOpen = openGroup[moduleKey] === group.category;
      return (
        <div key={group.category} className="menu-accordion-group">
          <button
            type="button"
            className={`menu-category-toggle ${isOpen ? 'open' : ''}`}
            onClick={() => toggleGroup(moduleKey, group.category)}
          >
            <span>{group.category}</span>
            <ChevronDown size={14} className="menu-category-chevron" />
          </button>
          {isOpen && (
            <div className="menu-accordion-body">
              {group.items.map(([name, Icon]) => renderMenuItem(name, Icon))}
            </div>
          )}
        </div>
      );
    });
  };

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

          {currentModule === 'crowdfunding'
            ? CROWDFUNDING_ITEMS.map(([name, Icon]) => renderMenuItem(name, Icon))
            : renderAccordionMenus(currentModule)}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
