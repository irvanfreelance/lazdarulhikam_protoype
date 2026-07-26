import React, { useState, useEffect } from 'react';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Wallet, 
  FileText,
  Plus,
  Filter, 
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  X,
  Info,
  Coins,
  FileCode
} from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import { getAccountingData } from '../utils/accountingStore';

// --- CONFIG & CONSTANTS ---
const COAS_ALL = {
  // Assets
  '101.01.001.000': '101.01.001.000 (Kas Pusat)',
  '101.02.001.000': '101.02.001.000 (BCA — Transfer Manual)',
  '101.02.002.000': '101.02.002.000 (Mandiri — Transfer Manual)',
  '101.02.004.000': '101.02.004.000 (E-Wallet Xendit)',
  '101.02.006.000': '101.02.006.000 (QRIS Xendit Settlement)',
  '101.02.007.000': '101.02.007.000 (BCA Virtual Account)',
  '102.01.000.000': '102.01.000.000 (Peralatan & Inventaris)',
  
  // Liabilities & Equity
  '201.01.000.000': '201.01.000.000 (Titipan Dana Zakat)',
  '300.01.001.000': '300.01.001.000 (Dana Kesehatan)',
  '300.01.002.000': '300.01.002.000 (Dana Kemanusiaan)',
  '300.02.001.000': '300.02.001.000 (Zakat Profesi & Maal)',
  
  // Revenues (4xx)
  '401.01.001.000': '401.01.001.000 (Donasi Kesehatan Individu)',
  '401.02.001.000': '401.02.001.000 (Donasi Bencana Alam)',
  '401.04.001.000': '401.04.001.000 (Sedekah Berbuka Puasa)',
  '401.05.001.000': '401.05.001.000 (Zakat Profesi & Maal)',
  '401.07.001.000': '401.07.001.000 (Infaq Operasional)',
  '401.08.001.000': '401.08.001.000 (Donasi Pembangunan Masjid)',
  
  // Expenses (5xx)
  '501.01.000.000': '501.01.000.000 (Penyaluran Kesehatan)',
  '501.02.000.000': '501.02.000.000 (Penyaluran Kemanusiaan)',
  '501.03.000.000': '501.03.000.000 (Penyaluran Pangan)',
  '501.05.000.000': '501.05.000.000 (Penyaluran Zakat)',
  '502.01.000.000': '502.01.000.000 (Biaya PG Platform)',
  '502.03.000.000': '502.03.000.000 (Biaya Operasional Kantor)'
};

const CHANNELS = ['Xendit QRIS', 'BCA VA', 'Mandiri Manual', 'ShopeePay', 'Alfamart', 'Transfer Bank', 'Kas Pusat'];
const CATEGORIES = ['barang', 'jasa', 'media', 'konsultan', 'peternak', 'catering', 'logistik', 'lainnya'];
const PERIODS = ['Mei 2026', 'Juni 2026', 'Juli 2026', 'Oktober 2026', 'Januari 2027'];
const AJE_TYPES = ['akrual', 'depresiasi', 'koreksi', 'penutup', 'balik'];

const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num || 0);
};

const generateIdTrans = () => {
  const datePrefix = '2607' + String(new Date().getDate()).padStart(2, '0');
  const randSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
  return datePrefix + randSuffix;
};

const TransaksiKeuangan = () => {
  const [activeTab, setActiveTab] = useState('Penerimaan');
  const [activeSubTab, setActiveSubTab] = useState('saldo'); // for Opname & Saldo tab

  // --- PERSISTED STATES ---
  const [penerimaan, setPenerimaan] = useState(() => getAccountingData().penerimaan);
  const [pengeluaran, setPengeluaran] = useState(() => getAccountingData().pengeluaran);
  const [saldo, setSaldo] = useState(() => getAccountingData().saldo);
  const [opname, setOpname] = useState(() => getAccountingData().opname);
  const [jurnalPenyesuaian, setJurnalPenyesuaian] = useState(() => getAccountingData().jurnalPenyesuaian);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('laz_penerimaan', JSON.stringify(penerimaan));
  }, [penerimaan]);

  useEffect(() => {
    localStorage.setItem('laz_pengeluaran', JSON.stringify(pengeluaran));
  }, [pengeluaran]);

  useEffect(() => {
    localStorage.setItem('laz_saldo', JSON.stringify(saldo));
  }, [saldo]);

  useEffect(() => {
    localStorage.setItem('laz_opname', JSON.stringify(opname));
  }, [opname]);

  useEffect(() => {
    localStorage.setItem('laz_jurnal_penyesuaian', JSON.stringify(jurnalPenyesuaian));
  }, [jurnalPenyesuaian]);

  // --- FILTERS & SEARCH STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChannel, setFilterChannel] = useState('Semua Channel');
  const [filterCategory, setFilterCategory] = useState('Semua Kategori');
  const [filterPeriod, setFilterPeriod] = useState('Semua Periode');

  // --- MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [selectedItem, setSelectedItem] = useState(null);

  // Form Fields State
  const [formFields, setFormFields] = useState({});

  // Cash Opname Calculator State
  const [denom, setDenom] = useState({
    c100k: 0, c50k: 0, c20k: 0, c10k: 0, c5k: 0, c2k: 0, c1k: 0,
    l500: 0, l200: 0, l100: 0
  });

  const handleDenomChange = (field, val) => {
    const numericVal = Math.max(0, parseInt(val) || 0);
    setDenom(prev => ({
      ...prev,
      [field]: numericVal
    }));
  };

  const getDenomTotal = () => {
    return (
      denom.c100k * 100000 +
      denom.c50k * 50000 +
      denom.c20k * 20000 +
      denom.c10k * 10000 +
      denom.c5k * 5000 +
      denom.c2k * 2000 +
      denom.c1k * 1000 +
      denom.l500 * 500 +
      denom.l200 * 200 +
      denom.l100 * 100
    );
  };

  const getDenomString = (type) => {
    if (type === 'kertas') {
      const parts = [];
      if (denom.c100k) parts.push(`100k x ${denom.c100k}`);
      if (denom.c50k) parts.push(`50k x ${denom.c50k}`);
      if (denom.c20k) parts.push(`20k x ${denom.c20k}`);
      if (denom.c10k) parts.push(`10k x ${denom.c10k}`);
      if (denom.c5k) parts.push(`5k x ${denom.c5k}`);
      if (denom.c2k) parts.push(`2k x ${denom.c2k}`);
      if (denom.c1k) parts.push(`1k x ${denom.c1k}`);
      return parts.join(', ') || '0';
    } else {
      const parts = [];
      if (denom.l500) parts.push(`500 x ${denom.l500}`);
      if (denom.l200) parts.push(`200 x ${denom.l200}`);
      if (denom.l100) parts.push(`100 x ${denom.l100}`);
      return parts.join(', ') || '0';
    }
  };

  // Populate calculator fields on edit
  const populateDenomFromStrings = (kertas, logam) => {
    const newDenom = { c100k: 0, c50k: 0, c20k: 0, c10k: 0, c5k: 0, c2k: 0, c1k: 0, l500: 0, l200: 0, l100: 0 };
    
    const parse = (str, mapping) => {
      if (!str) return;
      str.split(',').forEach(part => {
        const matches = part.trim().match(/(\d+[k]?)\s*x\s*(\d+)/);
        if (matches) {
          const denomName = matches[1];
          const qty = parseInt(matches[2]);
          const key = mapping[denomName];
          if (key) newDenom[key] = qty;
        }
      });
    };

    parse(kertas, { '100k': 'c100k', '50k': 'c50k', '20k': 'c20k', '10k': 'c10k', '5k': 'c5k', '2k': 'c2k', '1k': 'c1k' });
    parse(logam, { '500': 'l500', '200': 'l200', '100': 'l100' });
    setDenom(newDenom);
  };

  // --- STATS DYNAMIC CALCULATION ---
  const totalPenerimaanBulanIni = penerimaan
    .filter(item => item.status === 'PAID')
    .reduce((sum, item) => sum + item.nominal, 0);

  const totalPengeluaranBulanIni = pengeluaran
    .filter(item => item.status === 'PAID')
    .reduce((sum, item) => sum + item.nominal, 0);

  const totalSaldoKasBank = saldo.reduce((sum, item) => sum + item.saldo, 0);

  const jurnalDraftReviewCount = 
    penerimaan.filter(item => item.status === 'PENDING').length +
    pengeluaran.filter(item => item.status === 'PENDING').length;

  // --- CRUD ACTION HANDLERS ---
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);

    if (type.includes('add')) {
      if (type === 'penerimaan_add') {
        setFormFields({
          tgl: new Date().toISOString().substring(0, 16),
          donatur: '',
          channel: CHANNELS[0],
          coa: '401.01.001.000',
          nominal: '',
          status: 'PAID',
          note: '',
          splitAmil: false
        });
      } else if (type === 'pengeluaran_add') {
        setFormFields({
          tgl: new Date().toISOString().substring(0, 16),
          vendor: '',
          kategori: CATEGORIES[0],
          coa: '501.03.000.000',
          nominal: '',
          status: 'PAID',
          coa_bayar: '101.02.001.000',
          note: ''
        });
      } else if (type === 'jurnal_add') {
        setFormFields({
          period: PERIODS[3], // Oktober 2026 default
          jenis_aje: AJE_TYPES[0],
          keterangan: '',
          coa_debet: '502.03.000.000',
          coa_kredit: '102.01.000.000',
          nominal: ''
        });
      } else if (type === 'saldo_add') {
        setFormFields({
          coa: '',
          nama: '',
          saldo: ''
        });
      } else if (type === 'opname_add') {
        setDenom({ c100k: 0, c50k: 0, c20k: 0, c10k: 0, c5k: 0, c2k: 0, c1k: 0, l500: 0, l200: 0, l100: 0 });
        setFormFields({
          tanggal: new Date().toISOString().substring(0, 10),
          coa: '101.01.001.000',
          keterangan: '',
          per: 'd'
        });
      }
    } else if (type.includes('edit')) {
      setFormFields({ ...item });
      if (type === 'opname_edit') {
        populateDenomFromStrings(item.detail_kertas, item.detail_logam);
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (modalType === 'penerimaan_add') {
      const nominalAsli = parseFloat(formFields.nominal) || 0;
      const refIdTrans = generateIdTrans();
      
      // Auto-Split Amil Zakat Logic
      if (formFields.coa.startsWith('401.05') && formFields.splitAmil) {
        const nominalZakat = nominalAsli * 0.875;
        const nominalAmil = nominalAsli * 0.125;
        
        const itemZakat = {
          id: String(penerimaan.length + 1),
          id_trans: refIdTrans,
          ...formFields,
          nominal: nominalZakat,
          note: `${formFields.note} (Porsi Zakat 87.5%)`
        };
        const itemAmil = {
          id: String(penerimaan.length + 2),
          id_trans: refIdTrans,
          ...formFields,
          coa: '401.07.001.000', // Infaq Operasional (Amil)
          nominal: nominalAmil,
          note: `${formFields.note} (Porsi Amil 12.5%)`
        };
        
        setPenerimaan(prev => [itemZakat, itemAmil, ...prev]);

        if (itemZakat.status === 'PAID') {
          adjustSaldo(itemZakat.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000', nominalAsli, 'add');
        }
      } else {
        const newItem = {
          id: String(penerimaan.length + 1),
          id_trans: refIdTrans,
          ...formFields,
          nominal: nominalAsli
        };
        setPenerimaan(prev => [newItem, ...prev]);

        // If PAID, adjust cash balance
        if (newItem.status === 'PAID') {
          adjustSaldo(newItem.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000', newItem.nominal, 'add');
        }
      }
    } else if (modalType === 'penerimaan_edit') {
      // Find diff for balance update if paid state changes
      const oldItem = penerimaan.find(x => x.id === selectedItem.id);
      const updatedItem = {
        ...selectedItem,
        ...formFields,
        nominal: parseFloat(formFields.nominal) || 0
      };
      setPenerimaan(prev => prev.map(x => x.id === selectedItem.id ? updatedItem : x));
      
      // Basic balance correction
      if (oldItem.status === 'PAID') {
        adjustSaldo(oldItem.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000', oldItem.nominal, 'sub');
      }
      if (updatedItem.status === 'PAID') {
        adjustSaldo(updatedItem.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000', updatedItem.nominal, 'add');
      }
    } else if (modalType === 'pengeluaran_add') {
      const newItem = {
        id: String(pengeluaran.length + 1),
        id_trans: generateIdTrans(),
        ...formFields,
        nominal: parseFloat(formFields.nominal) || 0
      };
      setPengeluaran(prev => [newItem, ...prev]);

      if (newItem.status === 'PAID') {
        adjustSaldo(newItem.coa_bayar, newItem.nominal, 'sub');
      }
    } else if (modalType === 'pengeluaran_edit') {
      const oldItem = pengeluaran.find(x => x.id === selectedItem.id);
      const updatedItem = {
        ...selectedItem,
        ...formFields,
        nominal: parseFloat(formFields.nominal) || 0
      };
      setPengeluaran(prev => prev.map(x => x.id === selectedItem.id ? updatedItem : x));

      if (oldItem.status === 'PAID') {
        adjustSaldo(oldItem.coa_bayar, oldItem.nominal, 'add');
      }
      if (updatedItem.status === 'PAID') {
        adjustSaldo(updatedItem.coa_bayar, updatedItem.nominal, 'sub');
      }
    } else if (modalType === 'jurnal_add') {
      const newItem = {
        id: String(jurnalPenyesuaian.length + 1),
        ...formFields,
        nominal: parseFloat(formFields.nominal) || 0,
        nik_input: 'ADMIN001',
        approved_by: 'Irvan Superadmin',
        approved_at: new Date().toISOString()
      };
      setJurnalPenyesuaian(prev => [newItem, ...prev]);
    } else if (modalType === 'saldo_add') {
      const newItem = {
        coa: formFields.coa,
        nama: formFields.nama,
        saldo: parseFloat(formFields.saldo) || 0
      };
      setSaldo(prev => [...prev, newItem]);
    } else if (modalType === 'saldo_edit') {
      setSaldo(prev => prev.map(x => x.coa === selectedItem.coa ? { ...x, ...formFields, saldo: parseFloat(formFields.saldo) || 0 } : x));
    } else if (modalType === 'opname_add') {
      const targetCoa = formFields.coa;
      const ledgerBal = saldo.find(x => x.coa === targetCoa)?.saldo || 0;
      const physicalCount = getDenomTotal();
      const adjustment = physicalCount - ledgerBal;

      const newItem = {
        id: String(opname.length + 1),
        tanggal: formFields.tanggal,
        coa: targetCoa,
        saldo_awal: ledgerBal,
        debet: 0,
        kredit: 0,
        adjustment: adjustment,
        saldo_akhir: physicalCount,
        detail_kertas: getDenomString('kertas'),
        detail_logam: getDenomString('logam'),
        per: formFields.per,
        keterangan: formFields.keterangan || 'Penyesuaian saldo opname',
        via: 'user'
      };

      setOpname(prev => [newItem, ...prev]);
      // Adjust the actual ledger balance to match physical
      setSaldo(prev => prev.map(x => x.coa === targetCoa ? { ...x, saldo: physicalCount } : x));
    } else if (modalType === 'opname_edit') {
      const targetCoa = formFields.coa;
      const physicalCount = getDenomTotal();
      const adjustment = physicalCount - selectedItem.saldo_awal;

      const updatedItem = {
        ...selectedItem,
        ...formFields,
        adjustment: adjustment,
        saldo_akhir: physicalCount,
        detail_kertas: getDenomString('kertas'),
        detail_logam: getDenomString('logam')
      };

      setOpname(prev => prev.map(x => x.id === selectedItem.id ? updatedItem : x));
      setSaldo(prev => prev.map(x => x.coa === targetCoa ? { ...x, saldo: physicalCount } : x));
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id, type) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      if (type === 'penerimaan') {
        const item = penerimaan.find(x => x.id === id);
        if (item.status === 'PAID') {
          adjustSaldo(item.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000', item.nominal, 'sub');
        }
        setPenerimaan(prev => prev.filter(x => x.id !== id));
      } else if (type === 'pengeluaran') {
        const item = pengeluaran.find(x => x.id === id);
        if (item.status === 'PAID') {
          adjustSaldo(item.coa_bayar, item.nominal, 'add');
        }
        setPengeluaran(prev => prev.filter(x => x.id !== id));
      } else if (type === 'saldo') {
        setSaldo(prev => prev.filter(x => x.coa !== id));
      } else if (type === 'opname') {
        setOpname(prev => prev.filter(x => x.id !== id));
      } else if (type === 'jurnal') {
        setJurnalPenyesuaian(prev => prev.filter(x => x.id !== id));
      }
    }
  };

  const toggleApproveReject = (id, newStatus, type) => {
    if (type === 'penerimaan') {
      const oldItem = penerimaan.find(x => x.id === id);
      if (oldItem.status === newStatus) return;

      const updatedItem = { ...oldItem, status: newStatus };
      setPenerimaan(prev => prev.map(x => x.id === id ? updatedItem : x));

      // Correct balance
      if (oldItem.status === 'PAID') {
        adjustSaldo(oldItem.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000', oldItem.nominal, 'sub');
      }
      if (newStatus === 'PAID') {
        adjustSaldo(updatedItem.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000', updatedItem.nominal, 'add');
      }
    } else if (type === 'pengeluaran') {
      const oldItem = pengeluaran.find(x => x.id === id);
      if (oldItem.status === newStatus) return;

      const updatedItem = { ...oldItem, status: newStatus };
      setPengeluaran(prev => prev.map(x => x.id === id ? updatedItem : x));

      // Correct balance
      if (oldItem.status === 'PAID') {
        adjustSaldo(oldItem.coa_bayar, oldItem.nominal, 'add');
      }
      if (newStatus === 'PAID') {
        adjustSaldo(updatedItem.coa_bayar, updatedItem.nominal, 'sub');
      }
    }
  };

  const adjustSaldo = (coaCode, amount, action) => {
    setSaldo(prev => prev.map(acc => {
      if (acc.coa === coaCode) {
        return {
          ...acc,
          saldo: action === 'add' ? acc.saldo + amount : acc.saldo - amount
        };
      }
      return acc;
    }));
  };

  // Dynamic Double-Entry generator for viewing details
  const getJournalDetails = (item, type) => {
    if (type === 'penerimaan') {
      const bankCoa = item.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000';
      return [
        { coa: bankCoa, nama: COAS_ALL[bankCoa] || 'Bank', debet: item.nominal, kredit: 0 },
        { coa: item.coa, nama: COAS_ALL[item.coa] || 'Donasi', debet: 0, kredit: item.nominal }
      ];
    } else if (type === 'pengeluaran') {
      return [
        { coa: item.coa, nama: COAS_ALL[item.coa] || 'Beban', debet: item.nominal, kredit: 0 },
        { coa: item.coa_bayar, nama: COAS_ALL[item.coa_bayar] || 'Kas/Bank', debet: 0, kredit: item.nominal }
      ];
    } else if (type === 'jurnal') {
      return [
        { coa: item.coa_debet, nama: COAS_ALL[item.coa_debet] || 'Coa Debet', debet: item.nominal, kredit: 0 },
        { coa: item.coa_kredit, nama: COAS_ALL[item.coa_kredit] || 'Coa Kredit', debet: 0, kredit: item.nominal }
      ];
    }
    return [];
  };

  // --- EXPORT TO CSV (PROTOTYPE FUNCTION) ---
  const handleExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (activeTab === 'Penerimaan') {
      csvContent += "ID Transaksi,Tanggal,Donatur,Channel,COA,Nominal,Status,Keterangan\n";
      penerimaan.forEach(row => {
        csvContent += `"${row.id_trans}","${row.tgl}","${row.donatur}","${row.channel}","${row.coa}",${row.nominal},"${row.status}","${row.note}"\n`;
      });
    } else if (activeTab === 'Pengeluaran') {
      csvContent += "ID Transaksi,Tanggal,Vendor,Kategori,COA,Nominal,Status,Rekening Bayar,Keterangan\n";
      pengeluaran.forEach(row => {
        csvContent += `"${row.id_trans}","${row.tgl}","${row.vendor}","${row.kategori}","${row.coa}",${row.nominal},"${row.status}","${row.coa_bayar}","${row.note}"\n`;
      });
    } else if (activeTab === 'Jurnal Umum') {
      csvContent += "Periode,Jenis AJE,Keterangan,COA Debet,COA Kredit,Nominal,NIK Input\n";
      jurnalPenyesuaian.forEach(row => {
        csvContent += `"${row.period}","${row.jenis_aje}","${row.keterangan}","${row.coa_debet}","${row.coa_kredit}",${row.nominal},"${row.nik_input}"\n`;
      });
    } else {
      csvContent += "COA,Nama Akun,Saldo Akhir\n";
      saldo.forEach(row => {
        csvContent += `"${row.coa}","${row.nama}",${row.saldo}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_${activeTab.toLowerCase().replace(/ & /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="content-area">
      {/* HEADER PAGE */}
      <div className="page-header">
        <div className="page-title">
          <h1>Transaksi Keuangan</h1>
          <p>Kelola penerimaan donasi, pengeluaran, dan jurnal penyesuaian akuntansi</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={handleExport}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => {
            if (activeTab === 'Penerimaan') openModal('penerimaan_add');
            else if (activeTab === 'Pengeluaran') openModal('pengeluaran_add');
            else if (activeTab === 'Jurnal Umum') openModal('jurnal_add');
            else {
              if (activeSubTab === 'saldo') openModal('saldo_add');
              else openModal('opname_add');
            }
          }}>
            <Plus size={16} /> 
            {activeTab === 'Penerimaan' && ' Buat Penerimaan'}
            {activeTab === 'Pengeluaran' && ' Buat Pengeluaran'}
            {activeTab === 'Jurnal Umum' && ' Jurnal Penyesuaian'}
            {activeTab === 'Opname & Saldo' && (activeSubTab === 'saldo' ? ' Tambah Akun' : ' Buat Opname')}
          </button>
        </div>
      </div>

      {/* STATISTICAL WIDGETS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <ArrowDownToLine size={20} />
            </div>
            <div className="stat-title">Total Penerimaan (Bulan ini)</div>
          </div>
          <div className="stat-value">{formatRupiah(totalPenerimaanBulanIni)}</div>
          <div>
            <span className="stat-trend trend-up">↑ 12.5%</span> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>dari bulan lalu</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <ArrowUpFromLine size={20} />
            </div>
            <div className="stat-title">Total Pengeluaran (Bulan ini)</div>
          </div>
          <div className="stat-value">{formatRupiah(totalPengeluaranBulanIni)}</div>
          <div>
            <span className="stat-trend" style={{ color: '#ef4444', background: '#fee2e2' }}>↑ 5.2%</span> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>dari bulan lalu</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Wallet size={20} />
            </div>
            <div className="stat-title">Saldo Kas & Bank</div>
          </div>
          <div className="stat-value">{formatRupiah(totalSaldoKasBank)}</div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Update terakhir: Realtime</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}>
              <FileText size={20} />
            </div>
            <div className="stat-title">Jurnal Belum Posting</div>
          </div>
          <div className="stat-value">{jurnalDraftReviewCount} Draft</div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Perlu review finance admin</span>
          </div>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Penerimaan', 'Pengeluaran', 'Jurnal Umum', 'Opname & Saldo'].map((tab) => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                setSearchTerm('');
              }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* SUB TABS FOR OPNAME & SALDO */}
      {activeTab === 'Opname & Saldo' && (
        <div className="subtabs-list">
          <div className={`subtab-item ${activeSubTab === 'saldo' ? 'active' : ''}`} onClick={() => setActiveSubTab('saldo')}>
            Saldo Kas & Bank
          </div>
          <div className={`subtab-item ${activeSubTab === 'opname' ? 'active' : ''}`} onClick={() => setActiveSubTab('opname')}>
            Opname Fisik Kas/Bank
          </div>
        </div>
      )}

      {/* FILTERS & SEARCH */}
      <div className="filters-row">
        <div className="filters-left">
          {activeTab === 'Penerimaan' && (
            <div className="filter-input">
              <Filter size={16} />
              <SearchableSelect
                className=""
                options={['Semua Channel', ...CHANNELS].map(ch => ({ value: ch, label: ch }))}
                value={filterChannel}
                onChange={setFilterChannel}
              />
            </div>
          )}

          {activeTab === 'Pengeluaran' && (
            <div className="filter-input">
              <Filter size={16} />
              <SearchableSelect
                className=""
                options={['Semua Kategori', ...CATEGORIES].map(cat => ({ value: cat, label: cat }))}
                value={filterCategory}
                onChange={setFilterCategory}
              />
            </div>
          )}

          {activeTab === 'Jurnal Umum' && (
            <div className="filter-input">
              <Filter size={16} />
              <SearchableSelect
                className=""
                options={['Semua Periode', ...PERIODS].map(pd => ({ value: pd, label: pd }))}
                value={filterPeriod}
                onChange={setFilterPeriod}
              />
            </div>
          )}
        </div>

        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input 
              type="text" 
              placeholder={
                activeTab === 'Penerimaan' ? "Cari ID / Donatur / COA..." :
                activeTab === 'Pengeluaran' ? "Cari ID / Vendor / COA..." :
                activeTab === 'Jurnal Umum' ? "Cari Jurnal / Keterangan..." :
                "Cari nama / kode COA..."
              }
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TAB CONTENT DATA TABLES */}
      <div className="data-table-container">
        {/* TAMPILAN TAB PENERIMAAN */}
        {activeTab === 'Penerimaan' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Donatur</th>
                <th>Channel</th>
                <th>Akun Penerimaan (COA)</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {penerimaan
                .filter(item => {
                  const matchSearch = item.id_trans.includes(searchTerm) || 
                                      item.donatur.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));
                  const matchCh = filterChannel === 'Semua Channel' || item.channel === filterChannel;
                  return matchSearch && matchCh;
                })
                .map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{item.id_trans}</td>
                    <td>{new Date(item.tgl).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontWeight: 500 }}>{item.donatur}</td>
                    <td>{item.channel}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
                        {item.coa}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(item.nominal)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${item.status === 'PAID' ? 'status-success' : item.status === 'PENDING' ? 'status-warning' : 'btn-danger'}`} style={{ color: item.status === 'REJECTED' ? 'white' : '' }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'center' }}>
                        <Eye size={18} title="Lihat Jurnal" onClick={() => openModal('journal_preview', { ...item, type: 'penerimaan' })} />
                        <Edit2 size={18} color="#0ea5e9" title="Ubah" onClick={() => openModal('penerimaan_edit', item)} />
                        {item.status === 'PENDING' && (
                          <>
                            <CheckCircle size={18} color="#10b981" title="Approve" onClick={() => toggleApproveReject(item.id, 'PAID', 'penerimaan')} />
                            <XCircle size={18} color="#ef4444" title="Reject" onClick={() => toggleApproveReject(item.id, 'REJECTED', 'penerimaan')} />
                          </>
                        )}
                        <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(item.id, 'penerimaan')} />
                      </div>
                    </td>
                  </tr>
                ))}
              {penerimaan.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#64748b' }}>Belum ada data penerimaan donasi.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAMPILAN TAB PENGELUARAN */}
        {activeTab === 'Pengeluaran' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Transaksi</th>
                <th>Tanggal</th>
                <th>Penerima / Vendor</th>
                <th>Kategori</th>
                <th>Akun Pengeluaran (COA)</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pengeluaran
                .filter(item => {
                  const matchSearch = item.id_trans.includes(searchTerm) || 
                                      item.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()));
                  const matchCat = filterCategory === 'Semua Kategori' || item.kategori === filterCategory;
                  return matchSearch && matchCat;
                })
                .map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{item.id_trans}</td>
                    <td>{new Date(item.tgl).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontWeight: 500 }}>{item.vendor}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
                        {item.kategori}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
                        {item.coa}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(item.nominal)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`status-badge ${item.status === 'PAID' ? 'status-success' : item.status === 'PENDING' ? 'status-warning' : 'btn-danger'}`} style={{ color: item.status === 'REJECTED' ? 'white' : '' }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'center' }}>
                        <Eye size={18} title="Lihat Jurnal" onClick={() => openModal('journal_preview', { ...item, type: 'pengeluaran' })} />
                        <Edit2 size={18} color="#0ea5e9" title="Ubah" onClick={() => openModal('pengeluaran_edit', item)} />
                        {item.status === 'PENDING' && (
                          <>
                            <CheckCircle size={18} color="#10b981" title="Approve" onClick={() => toggleApproveReject(item.id, 'PAID', 'pengeluaran')} />
                            <XCircle size={18} color="#ef4444" title="Reject" onClick={() => toggleApproveReject(item.id, 'REJECTED', 'pengeluaran')} />
                          </>
                        )}
                        <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(item.id, 'pengeluaran')} />
                      </div>
                    </td>
                  </tr>
                ))}
              {pengeluaran.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#64748b' }}>Belum ada data pengeluaran.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAMPILAN TAB JURNAL UMUM (JURNAL PENYESUAIAN) */}
        {activeTab === 'Jurnal Umum' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Jenis AJE</th>
                <th>Keterangan</th>
                <th>Akun Debet</th>
                <th>Akun Kredit</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jurnalPenyesuaian
                .filter(item => {
                  const matchSearch = item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                      item.jenis_aje.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchPeriod = filterPeriod === 'Semua Periode' || item.period === filterPeriod;
                  return matchSearch && matchPeriod;
                })
                .map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{item.period}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f3e8ff', color: '#6b21a8', padding: '4px 8px', borderRadius: '4px', fontWeight: 600, textTransform: 'capitalize' }}>
                        {item.jenis_aje}
                      </span>
                    </td>
                    <td>{item.keterangan}</td>
                    <td style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>{item.coa_debet}</td>
                    <td style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600 }}>{item.coa_kredit}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{formatRupiah(item.nominal)}</td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'center' }}>
                        <Eye size={18} title="Lihat Ledger" onClick={() => openModal('journal_preview', { ...item, type: 'jurnal' })} />
                        <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(item.id, 'jurnal')} />
                      </div>
                    </td>
                  </tr>
                ))}
              {jurnalPenyesuaian.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: '#64748b' }}>Belum ada entri jurnal penyesuaian (AJE).</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAMPILAN TAB OPNAME & SALDO */}
        {activeTab === 'Opname & Saldo' && activeSubTab === 'saldo' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode COA</th>
                <th>Nama Rekening</th>
                <th style={{ textAlign: 'right' }}>Saldo Akhir Buku</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {saldo
                .filter(item => item.coa.includes(searchTerm) || item.nama.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.coa}</td>
                    <td style={{ fontWeight: 500 }}>{item.nama}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>{formatRupiah(item.saldo)}</td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'center' }}>
                        <Edit2 size={18} color="#0ea5e9" title="Ubah Saldo" onClick={() => openModal('saldo_edit', item)} />
                        <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(item.coa, 'saldo')} />
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Opname & Saldo' && activeSubTab === 'opname' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Kas / Bank COA</th>
                <th style={{ textAlign: 'right' }}>Saldo Awal</th>
                <th style={{ textAlign: 'right' }}>Selisih (Adj)</th>
                <th style={{ textAlign: 'right' }}>Saldo Fisik</th>
                <th>Detail Kertas / Logam</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {opname
                .filter(item => item.coa.includes(searchTerm) || (item.keterangan && item.keterangan.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((item, idx) => (
                  <tr key={idx}>
                    <td>{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{COAS_ALL[item.coa] || item.coa}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{formatRupiah(item.saldo_awal)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600, color: item.adjustment < 0 ? '#ef4444' : item.adjustment > 0 ? '#10b981' : '#64748b' }}>
                      {item.adjustment > 0 ? '+' : ''}{formatRupiah(item.adjustment)}
                    </td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>{formatRupiah(item.saldo_akhir)}</td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      <div>📄 {item.detail_kertas}</div>
                      <div>🪙 {item.detail_logam}</div>
                    </td>
                    <td>{item.keterangan}</td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'center' }}>
                        <Edit2 size={18} color="#0ea5e9" title="Ubah Opname" onClick={() => openModal('opname_edit', item)} />
                        <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(item.id, 'opname')} />
                      </div>
                    </td>
                  </tr>
                ))}
              {opname.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: '#64748b' }}>Belum ada riwayat opname kas/bank.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* --- FORM MODALS --- */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className={`modal-content ${modalType.startsWith('opname') ? 'modal-large' : ''}`}>
            
            {/* Modal Header */}
            <div className="modal-header">
              <h2>
                {modalType === 'penerimaan_add' && 'Buat Transaksi Penerimaan'}
                {modalType === 'penerimaan_edit' && 'Ubah Transaksi Penerimaan'}
                {modalType === 'pengeluaran_add' && 'Buat Transaksi Pengeluaran'}
                {modalType === 'pengeluaran_edit' && 'Ubah Transaksi Pengeluaran'}
                {modalType === 'jurnal_add' && 'Buat Jurnal Penyesuaian (AJE)'}
                {modalType === 'saldo_add' && 'Tambah Akun Kas / Bank'}
                {modalType === 'saldo_edit' && 'Ubah Saldo Akun'}
                {modalType === 'opname_add' && 'Rekonsiliasi / Opname Fisik Kas & Bank'}
                {modalType === 'opname_edit' && 'Ubah Catatan Opname Fisik'}
                {modalType === 'journal_preview' && 'Double-Entry Ledger Detail'}
              </h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave}>
              <div className="modal-body">
                
                {/* FORM FOR PENERIMAAN */}
                {(modalType === 'penerimaan_add' || modalType === 'penerimaan_edit') && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Tanggal & Jam</label>
                      <input 
                        type="datetime-local" 
                        className="form-input" 
                        required
                        value={formFields.tgl || ''} 
                        onChange={e => setFormFields(prev => ({ ...prev, tgl: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nama Donatur / Keterangan</label>
                      <SearchableSelect
                        options={Array.from(new Set(penerimaan.map(p => p.donatur).filter(Boolean)))
                          .map(name => ({ value: name, label: name }))}
                        value={formFields.donatur || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, donatur: val }))}
                        placeholder="e.g. Budi Santoso / Hamba Allah"
                        allowFreeText
                      />
                    </div>
                    <div className="form-group">
                      <label>Payment Channel</label>
                      <SearchableSelect
                        options={CHANNELS.map(ch => ({ value: ch, label: ch }))}
                        value={formFields.channel || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, channel: val }))}
                        placeholder="Cari channel..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Akun Penerimaan (COA)</label>
                      <SearchableSelect
                        options={Object.entries(COAS_ALL)
                          .filter(([key]) => key.startsWith('401'))
                          .map(([key, val]) => ({ value: key, label: val }))}
                        value={formFields.coa || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, coa: val }))}
                        placeholder="Cari akun COA..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominal (Rp)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="100" 
                        placeholder="Nominal transaksi"
                        required
                        value={formFields.nominal || ''} 
                        onChange={e => setFormFields(prev => ({ ...prev, nominal: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <SearchableSelect
                        className="form-select"
                        options={[
                          { value: 'PAID', label: 'PAID (Lunas)' },
                          { value: 'PENDING', label: 'PENDING (Draft)' }
                        ]}
                        value={formFields.status || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, status: val }))}
                      />
                    </div>
                    {formFields.coa?.startsWith('401.05') && modalType === 'penerimaan_add' && (
                      <div className="form-group full-width" style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input 
                          type="checkbox" 
                          id="splitAmil"
                          checked={formFields.splitAmil || false}
                          onChange={e => setFormFields(prev => ({ ...prev, splitAmil: e.target.checked }))}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <label htmlFor="splitAmil" style={{ margin: 0, fontWeight: 500, color: '#3b82f6', cursor: 'pointer' }}>
                          Otomatis Pisahkan Hak Amil (12.5% ke Operasional)
                        </label>
                      </div>
                    )}
                    <div className="form-group full-width">
                      <label>Catatan Tambahan</label>
                      <textarea 
                        className="form-textarea" 
                        rows="3"
                        placeholder="Tuliskan keterangan detail transaksi..."
                        value={formFields.note || ''}
                        onChange={e => setFormFields(prev => ({ ...prev, note: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* FORM FOR PENGELUARAN */}
                {(modalType === 'pengeluaran_add' || modalType === 'pengeluaran_edit') && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Tanggal & Jam</label>
                      <input 
                        type="datetime-local" 
                        className="form-input" 
                        required
                        value={formFields.tgl || ''} 
                        onChange={e => setFormFields(prev => ({ ...prev, tgl: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nama Vendor / Penerima</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. CV Logistik Utama"
                        required
                        value={formFields.vendor || ''} 
                        onChange={e => setFormFields(prev => ({ ...prev, vendor: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Kategori Vendor</label>
                      <SearchableSelect
                        className="form-select"
                        options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                        value={formFields.kategori || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, kategori: val }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Sumber Dana Keluar (Kas/Bank)</label>
                      <SearchableSelect
                        className="form-select"
                        options={Object.entries(COAS_ALL)
                          .filter(([key]) => key.startsWith('101.01') || key.startsWith('101.02'))
                          .map(([key, val]) => ({ value: key, label: val }))}
                        value={formFields.coa_bayar || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, coa_bayar: val }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Akun Pengeluaran (COA)</label>
                      <SearchableSelect
                        className="form-select"
                        options={Object.entries(COAS_ALL)
                          .filter(([key]) => key.startsWith('501') || key.startsWith('502'))
                          .map(([key, val]) => ({ value: key, label: val }))}
                        value={formFields.coa || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, coa: val }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nominal (Rp)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        min="100" 
                        placeholder="Nominal dana keluar"
                        required
                        value={formFields.nominal || ''} 
                        onChange={e => setFormFields(prev => ({ ...prev, nominal: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <SearchableSelect
                        className="form-select"
                        options={[
                          { value: 'PAID', label: 'PAID (Disbursed)' },
                          { value: 'PENDING', label: 'PENDING (Draft)' }
                        ]}
                        value={formFields.status || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, status: val }))}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Catatan Detail</label>
                      <textarea 
                        className="form-textarea" 
                        rows="3"
                        placeholder="Tuliskan tujuan spesifik penyaluran/pengeluaran..."
                        value={formFields.note || ''}
                        onChange={e => setFormFields(prev => ({ ...prev, note: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* FORM FOR JURNAL PENYESUAIAN */}
                {modalType === 'jurnal_add' && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Periode Akuntansi</label>
                      <SearchableSelect
                        className="form-select"
                        options={PERIODS.map(pd => ({ value: pd, label: pd }))}
                        value={formFields.period || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, period: val }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Jenis Penyesuaian (AJE)</label>
                      <SearchableSelect
                        className="form-select"
                        options={AJE_TYPES.map(type => ({ value: type, label: type.toUpperCase() }))}
                        value={formFields.jenis_aje || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, jenis_aje: val }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Akun Debet (COA)</label>
                      <SearchableSelect
                        className="form-select"
                        options={Object.entries(COAS_ALL).map(([key, val]) => ({ value: key, label: val }))}
                        value={formFields.coa_debet || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, coa_debet: val }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Akun Kredit (COA)</label>
                      <SearchableSelect
                        className="form-select"
                        options={Object.entries(COAS_ALL).map(([key, val]) => ({ value: key, label: val }))}
                        value={formFields.coa_kredit || ''}
                        onChange={val => setFormFields(prev => ({ ...prev, coa_kredit: val }))}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Nominal Penyesuaian (Rp)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        required 
                        min="1"
                        value={formFields.nominal || ''}
                        onChange={e => setFormFields(prev => ({ ...prev, nominal: e.target.value }))}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Deskripsi Penyesuaian</label>
                      <textarea 
                        className="form-textarea" 
                        required
                        placeholder="Contoh: Akrual beban sewa kantor bulan berjalan..."
                        value={formFields.keterangan || ''}
                        onChange={e => setFormFields(prev => ({ ...prev, keterangan: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* FORM FOR SALDO KAS & BANK */}
                {(modalType === 'saldo_add' || modalType === 'saldo_edit') && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nomor COA</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="e.g. 101.02.099.000"
                        disabled={modalType === 'saldo_edit'}
                        value={formFields.coa || ''}
                        onChange={e => setFormFields(prev => ({ ...prev, coa: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Nama Akun Rekening</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        required 
                        placeholder="e.g. Bank Jabar Banten Syariah"
                        value={formFields.nama || ''}
                        onChange={e => setFormFields(prev => ({ ...prev, nama: e.target.value }))}
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Saldo Akhir (Rp)</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        required 
                        placeholder="Saldo kas saat ini"
                        value={formFields.saldo || ''}
                        onChange={e => setFormFields(prev => ({ ...prev, saldo: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {/* FORM FOR PHYSICAL OPNAME & INTERACTIVE CALCULATOR */}
                {(modalType === 'opname_add' || modalType === 'opname_edit') && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Tanggal Opname</label>
                        <input 
                          type="date" 
                          className="form-input" 
                          required 
                          value={formFields.tanggal || ''}
                          onChange={e => setFormFields(prev => ({ ...prev, tanggal: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Akun Kas / Bank Yang Diperiksa</label>
                        <SearchableSelect
                          className="form-select"
                          options={saldo.map(acc => ({ value: acc.coa, label: `${acc.nama} (${acc.coa})` }))}
                          value={formFields.coa || ''}
                          onChange={val => setFormFields(prev => ({ ...prev, coa: val }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Frekuensi Rekonsiliasi</label>
                        <SearchableSelect
                          className="form-select"
                          options={[
                            { value: 'd', label: 'Harian (Daily)' },
                            { value: 'm', label: 'Bulanan (Monthly)' },
                            { value: 'y', label: 'Tahunan (Yearly)' }
                          ]}
                          value={formFields.per || ''}
                          onChange={val => setFormFields(prev => ({ ...prev, per: val }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Keterangan / Temuan</label>
                        <input 
                          type="text" 
                          className="form-input"
                          placeholder="e.g. Kas balance, selisih 10rb, dll." 
                          value={formFields.keterangan || ''}
                          onChange={e => setFormFields(prev => ({ ...prev, keterangan: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Interactive Denomination Grid */}
                    <div className="calc-container">
                      <div className="calc-section-title">Denominasi Uang Kertas</div>
                      <div className="calc-grid">
                        {[
                          { label: 'Rp 100.000', key: 'c100k' },
                          { label: 'Rp 50.000', key: 'c50k' },
                          { label: 'Rp 20.000', key: 'c20k' },
                          { label: 'Rp 10.000', key: 'c10k' },
                          { label: 'Rp 5.000', key: 'c5k' },
                          { label: 'Rp 2.000', key: 'c2k' },
                          { label: 'Rp 1.000', key: 'c1k' }
                        ].map((item) => {
                          const multiplier = parseInt(item.label.replace(/\D/g, ''));
                          const qty = denom[item.key] || 0;
                          return (
                            <div className="calc-row" key={item.key}>
                              <div className="calc-label">{item.label}</div>
                              <div className="calc-multiply">×</div>
                              <input 
                                type="number" 
                                className="calc-input" 
                                min="0" 
                                value={qty || ''} 
                                onChange={e => handleDenomChange(item.key, e.target.value)}
                              />
                              <div className="calc-subtotal">{formatRupiah(qty * multiplier)}</div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="calc-section-title" style={{ marginTop: '12px' }}>Denominasi Koin logam</div>
                      <div className="calc-grid">
                        {[
                          { label: 'Rp 500', key: 'l500' },
                          { label: 'Rp 200', key: 'l200' },
                          { label: 'Rp 100', key: 'l100' }
                        ].map((item) => {
                          const multiplier = parseInt(item.label.replace(/\D/g, ''));
                          const qty = denom[item.key] || 0;
                          return (
                            <div className="calc-row" key={item.key}>
                              <div className="calc-label">{item.label}</div>
                              <div className="calc-multiply">×</div>
                              <input 
                                type="number" 
                                className="calc-input" 
                                min="0" 
                                value={qty || ''} 
                                onChange={e => handleDenomChange(item.key, e.target.value)}
                              />
                              <div className="calc-subtotal">{formatRupiah(qty * multiplier)}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Calculations summary box */}
                      <div className="calc-summary">
                        <div className="summary-box">
                          <span className="summary-box-title">Saldo Buku (System)</span>
                          <span className="summary-box-val" style={{ color: '#475569' }}>
                            {formatRupiah(saldo.find(x => x.coa === formFields.coa)?.saldo || 0)}
                          </span>
                        </div>
                        <div className="summary-box">
                          <span className="summary-box-title">Total Fisik dihitung</span>
                          <span className="summary-box-val" style={{ color: 'var(--primary-color)' }}>
                            {formatRupiah(getDenomTotal())}
                          </span>
                        </div>
                        <div className="summary-box">
                          <span className="summary-box-title">Selisih Reinkonsiliasi</span>
                          {(() => {
                            const systemBal = saldo.find(x => x.coa === formFields.coa)?.saldo || 0;
                            const physical = getDenomTotal();
                            const diff = physical - systemBal;
                            return (
                              <span className="summary-box-val" style={{ color: diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#64748b' }}>
                                {diff > 0 ? '+' : ''}{formatRupiah(diff)}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOUBLE ENTRY LEDGER JOURNAL PREVIEW */}
                {modalType === 'journal_preview' && selectedItem && (
                  <div>
                    <div style={{ display: 'flex', gap: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '16px', fontSize: '0.875rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>ID REFERENSI</div>
                        <div style={{ fontWeight: 700, marginTop: '4px', fontFamily: 'monospace' }}>
                          {selectedItem.id_trans || `AJE-SYS-${selectedItem.id}`}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>TANGGAL</div>
                        <div style={{ fontWeight: 700, marginTop: '4px' }}>
                          {selectedItem.tgl ? new Date(selectedItem.tgl).toLocaleDateString('id-ID') : 'Penutupan Periode'}
                        </div>
                      </div>
                      <div style={{ flex: 2 }}>
                        <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>KETERANGAN</div>
                        <div style={{ fontWeight: 700, marginTop: '4px' }}>
                          {selectedItem.note || selectedItem.keterangan || 'Jurnal penyesuaian'}
                        </div>
                      </div>
                    </div>

                    <div className="journal-entry-card">
                      <div className="journal-header">
                        <span>Double-Entry General Journal Breakdown</span>
                        <span style={{ color: 'var(--success-color)' }}>Balanced Ledger</span>
                      </div>
                      <table className="journal-table">
                        <thead>
                          <tr>
                            <th>Akun COA</th>
                            <th>Nama Rekening Ledger</th>
                            <th style={{ textAlign: 'right' }}>Debet</th>
                            <th style={{ textAlign: 'right' }}>Kredit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getJournalDetails(selectedItem, selectedItem.type).map((ledgerRow, idx) => (
                            <tr key={idx}>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{ledgerRow.coa}</td>
                              <td style={{ paddingLeft: ledgerRow.kredit > 0 ? '30px' : '16px', color: ledgerRow.kredit > 0 ? '#475569' : '#0f172a', fontWeight: ledgerRow.kredit > 0 ? 400 : 600 }}>
                                {ledgerRow.nama}
                              </td>
                              <td className="amount" style={{ color: ledgerRow.debet > 0 ? '#16a34a' : '#94a3b8' }}>
                                {ledgerRow.debet > 0 ? formatRupiah(ledgerRow.debet) : 'Rp 0'}
                              </td>
                              <td className="amount" style={{ color: ledgerRow.kredit > 0 ? '#dc2626' : '#94a3b8' }}>
                                {ledgerRow.kredit > 0 ? formatRupiah(ledgerRow.kredit) : 'Rp 0'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }} onClick={() => setIsModalOpen(false)}>
                  Batal / Tutup
                </button>
                {modalType !== 'journal_preview' && (
                  <button type="submit" className="btn btn-primary">
                    Simpan Perubahan
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default TransaksiKeuangan;
