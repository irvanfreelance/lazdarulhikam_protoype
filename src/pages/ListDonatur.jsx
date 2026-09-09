import React, { useMemo, useRef, useState } from 'react';
import {
  Search, SlidersHorizontal, Plus, Download, Upload, Tag, MessageSquare,
  RefreshCw, ChevronDown, ArrowUp, ArrowDown, ArrowUpDown,
  FileSpreadsheet, FileText, File, X, Check, Users, UserCheck, UserPlus, Mail, Phone
} from 'lucide-react';
import {
  INITIAL_DONATUR, JENIS_DONATUR_OPTIONS, AKTIF_DONATUR_OPTIONS, VERIFIED_FIELD_OPTIONS,
  JENIS_KELAMIN_OPTIONS, PEKERJAAN_OPTIONS, DIHUBUNGI_VIA_OPTIONS, MINAT_PROGRAM_OPTIONS, TIM_CRM_OPTIONS
} from '../utils/donaturStore';
import { OFFICES } from '../utils/finsCoaStore';
import { getAccountingData } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';
import EntryDonaturForm from '../components/EntryDonaturForm';

const AKTIF_LABEL = Object.fromEntries(AKTIF_DONATUR_OPTIONS.map(o => [o.value, o.label]));
const AKTIF_BADGE = { y: 'status-success', prospek: 'status-warning', n: 'status-danger' };
const JENIS_DONATUR_BADGE = { Perorangan: 'status-info', Perusahaan: 'status-success', Lembaga: 'status-warning', Kotak: 'status-danger' };

// --- Advance Search: static option lists & helpers ---
const MONTHS = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

const OPERATOR_PREFIXES = [
  { label: 'Telkomsel', prefixes: ['0811', '0812', '0813', '0821', '0822', '0823', '0851', '0852', '0853'] },
  { label: 'Indosat', prefixes: ['0814', '0815', '0816', '0855', '0856', '0857', '0858'] },
  { label: 'XL', prefixes: ['0817', '0818', '0819', '0859', '0877', '0878'] },
  { label: 'Axis', prefixes: ['0831', '0832', '0833', '0838'] },
  { label: 'Tri', prefixes: ['0895', '0896', '0897', '0898', '0899'] },
  { label: 'Smartfren', prefixes: ['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'] }
];
const OPERATOR_HP_OPTIONS = [...OPERATOR_PREFIXES.map(o => o.label), 'Lainnya'];
const detectOperator = (hp) => {
  if (!hp) return '';
  const local = hp.startsWith('62') ? '0' + hp.slice(2) : hp;
  const prefix = local.slice(0, 4);
  const found = OPERATOR_PREFIXES.find(o => o.prefixes.includes(prefix));
  return found ? found.label : 'Lainnya';
};

const PROPERTY_FIELD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'hp', label: 'Hp' },
  { value: 'alamat', label: 'Alamat' },
  { value: 'pekerjaan', label: 'Pekerjaan' },
  { value: 'koordinat', label: 'Koordinat' },
  { value: 'panggilan', label: 'Panggilan' },
  { value: 'tglLahir', label: 'Tgl Lahir' },
  { value: 'note', label: 'Note' }
];

const emptyAdvanced = () => ({
  jenisDonatur: '', regFrom: '', regTo: '',
  transaksiAktif: '', transaksiMin: '', transaksiMax: '',
  propertyField: '', propertyStatus: '',
  minatProgram: '', updateFrom: '', updateTo: '',
  aktifDonatur: '', operatorHp: '', pekerjaan: '', parentDonatur: '',
  dihubungiVia: '', userInsert: '',
  jenisKelamin: '', kantor: '', miladMonth: '', miladDay: '', timCrm: '', verifiedBy: ''
});

const AdvField = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <label style={{ width: '112px', flexShrink: 0, fontSize: '0.78rem', fontWeight: 600, color: '#475569' }}>{label}</label>
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>{children}</div>
  </div>
);

const PAGE_SIZES = [10, 25, 50, 100];

const fmtMoney = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

// Every column here is optional/toggleable via the "Kolom" picker. ID Donatur
// and Nama Donatur are fixed and always rendered outside this list.
const COLUMN_DEFS = [
  { key: 'hp', label: 'Hp', sortable: true, render: d => d.hp || '-' },
  { key: 'email', label: 'Email', render: d => d.email || '-' },
  { key: 'alamat', label: 'Alamat', sortable: true, render: d => d.alamat || '-' },
  { key: 'kantor', label: 'Kantor', render: d => d.kantor || '-' },
  { key: 'tglReg', label: 'Tgl Reg', sortable: true, render: d => d.tglReg || '-' },
  { key: 'panggilan', label: 'Panggilan', render: d => d.panggilan || '-' },
  { key: 'idTimCrm', label: 'ID Tim CRM', render: d => d.idTimCrm || '-' },
  { key: 'timCrm', label: 'Tim CRM', render: d => d.timCrm || '-' },
  { key: 'hpTimCrm', label: 'HP Tim CRM', render: d => d.hpTimCrm || '-' },
  { key: 'jenisKelamin', label: 'Jenis Kelamin', render: d => d.jenisKelamin || '-' },
  { key: 'tglLahir', label: 'Tgl Lahir', render: d => d.tglLahir || '-' },
  { key: 'telpon', label: 'Telpon', render: d => d.telpon || '-' },
  {
    key: 'jenisDonatur', label: 'Jenis Donatur',
    render: d => <span className={`status-badge ${JENIS_DONATUR_BADGE[d.jenisDonatur] || 'status-info'}`}>{(d.jenisDonatur || '-').toUpperCase()}</span>
  },
  {
    key: 'aktif', label: 'Aktif',
    render: d => <span className={`status-badge ${AKTIF_BADGE[d.aktif] || 'status-info'}`}>{(AKTIF_LABEL[d.aktif] || '-').toUpperCase()}</span>
  },
  { key: 'koordinat', label: 'Koordinat', render: d => d.koordinat || '-' },
  { key: 'pekerjaan', label: 'Pekerjaan', render: d => d.pekerjaan || '-' },
  { key: 'kesediaanDonasi', label: 'Kesediaan Donasi', render: d => d.kesediaanDonasi || '-' },
  { key: 'transaksi', label: 'Transaksi (Qty)', render: d => d.jumlahTransaksi > 0 ? `${fmtMoney(d.totalTransaksi)} [${d.jumlahTransaksi}]` : '-' },
  {
    key: 'kontak', label: 'Kontak',
    render: d => (
      <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {d.hp && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><Phone size={12} /> {d.hp}</span>}
        {d.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><Mail size={12} /> {d.email}</span>}
        {!d.hp && !d.email && '-'}
      </div>
    )
  },
  { key: 'userInsert', label: 'User Insert', render: d => d.userInsert || '-' },
  { key: 'idUserInsert', label: 'ID User Insert', render: d => d.idUserInsert || '-' },
  { key: 'note', label: 'Note', render: d => d.note || '-' },
  { key: 'updated', label: 'Updated', render: d => d.updated || '-' },
  {
    key: 'verified', label: 'Verified',
    render: d => (d.verifiedFields && d.verifiedFields.length > 0)
      ? `Y (${d.verifiedFields.length} field${d.verifiedBy ? ' · ' + d.verifiedBy : ''})`
      : '-'
  },
  { key: 'dihubungiVia', label: 'Dihubungi Via', render: d => d.dihubungiVia || '-' },
  { key: 'minatProgram', label: 'Minat Program', render: d => d.minatProgram || '-' },
  { key: 'tipePelayanan', label: 'Tipe Pelayanan', render: d => d.tipePelayanan || '-' }
];

const DEFAULT_VISIBLE_KEYS = ['pekerjaan', 'kantor', 'jenisDonatur', 'tglReg', 'kontak', 'aktif'];
const DEFAULT_VISIBLE = Object.fromEntries(COLUMN_DEFS.map(c => [c.key, DEFAULT_VISIBLE_KEYS.includes(c.key)]));
const SORTABLE = ['nama', ...COLUMN_DEFS.filter(c => c.sortable).map(c => c.key)];

// "Set As" bulk-update targets: which donor field gets overwritten, and the
// value options offered for it in the second dropdown. "timCrm" options are
// injected at render time from real employee data (see buildSetAsFields).
// "verified" is a multi-select of donor fields rather than a single value.
const buildSetAsFields = (employeeOptions) => [
  { value: 'kantor', label: 'Kantor Donatur', placeholder: 'Kantor', type: 'single', options: OFFICES.map(o => ({ value: o.nama, label: o.nama })) },
  { value: 'timCrm', label: 'Tim CRM', placeholder: 'Tim CRM', type: 'single', options: employeeOptions },
  { value: 'jenisDonatur', label: 'Jenis Donatur', placeholder: 'Jenis Donatur', type: 'single', options: JENIS_DONATUR_OPTIONS.map(j => ({ value: j, label: j })) },
  { value: 'aktif', label: 'Aktif Donatur', placeholder: 'Status Aktif', type: 'single', options: AKTIF_DONATUR_OPTIONS },
  { value: 'verified', label: 'Verified', placeholder: 'Verified By', type: 'multi', options: VERIFIED_FIELD_OPTIONS.map(f => ({ value: f.key, label: f.label })) }
];

const ColumnPicker = ({ visible, onToggle }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  React.useEffect(() => {
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selectedCount = COLUMN_DEFS.filter(c => visible[c.key]).length;
  const selectedLabels = selectedCount === COLUMN_DEFS.length
    ? 'Semua kolom'
    : (COLUMN_DEFS.filter(c => visible[c.key]).map(c => c.label).join(',') || 'Pilih kolom');

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', minWidth: '200px', maxWidth: '280px', justifyContent: 'space-between' }} onClick={() => setOpen(o => !o)}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Search size={14} /> {selectedLabels}
        </span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="searchable-select-dropdown" style={{ right: 0, left: 'auto', minWidth: '220px' }}>
          {COLUMN_DEFS.map(c => (
            <label key={c.key} className="searchable-select-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!visible[c.key]} onChange={() => onToggle(c.key)} />
              {c.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const CURRENT_STAFF_NAME = 'Asep Saepul';

// Generic checkbox-list dropdown used by "Set As" -> "Verified" to pick which
// donor fields (plus the special "Verified By" stamp) get marked verified.
const MultiSelectPicker = ({ options, selected, onToggle, placeholder }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  React.useEffect(() => {
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const label = selected.length === 0
    ? placeholder
    : selected.map(v => options.find(o => o.value === v)?.label).filter(Boolean).join(', ');

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', width: '100%', justifyContent: 'space-between' }} onClick={() => setOpen(o => !o)}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected.length === 0 ? '#94a3b8' : 'inherit' }}>{label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="searchable-select-dropdown">
          {options.map(o => (
            <label key={o.value} className="searchable-select-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.includes(o.value)} onChange={() => onToggle(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const emptySetAsForm = () => ({ field: 'kantor', value: '', multiValues: [], limit: 10 });

const ListDonatur = () => {
  const [donaturList, setDonaturList] = useState(INITIAL_DONATUR);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [kantorFilter, setKantorFilter] = useState('');
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [sort, setSort] = useState({ key: 'nama', dir: 'asc' });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [isSetAsOpen, setIsSetAsOpen] = useState(false);
  const [setAsForm, setSetAsForm] = useState(emptySetAsForm());
  const [isAdvanceOpen, setIsAdvanceOpen] = useState(false);
  const [advancedDraft, setAdvancedDraft] = useState(emptyAdvanced());
  const [advanced, setAdvanced] = useState(emptyAdvanced());
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toast, setToast] = useState('');

  const toggleColumn = (key) => setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const setAdv = (key, value) => setAdvancedDraft(prev => ({ ...prev, [key]: value }));

  const applyAdvanced = () => { setAdvanced(advancedDraft); setPage(1); };

  const resetAdvanced = () => { setAdvancedDraft(emptyAdvanced()); setAdvanced(emptyAdvanced()); setPage(1); };

  const activeAdvancedCount = Object.values(advanced).filter(v => v !== '').length;

  const uniqueUserInsert = useMemo(
    () => [...new Set(donaturList.map(d => d.userInsert).filter(Boolean))].sort(),
    [donaturList]
  );
  const uniqueVerifiedBy = useMemo(
    () => [...new Set(donaturList.map(d => d.verifiedBy).filter(Boolean))].sort(),
    [donaturList]
  );
  const kantorOptions = useMemo(
    () => [...new Set(donaturList.map(d => d.kantor).filter(Boolean))].sort(),
    [donaturList]
  );

  const toggleSort = (key) => {
    if (!SORTABLE.includes(key)) return;
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let rows = !k ? donaturList : donaturList.filter(d =>
      d.id.toLowerCase().includes(k)
      || d.nama.toLowerCase().includes(k)
      || (d.hp || '').includes(k)
      || (d.email || '').toLowerCase().includes(k)
      || (d.alamat || '').toLowerCase().includes(k)
      || (d.kantor || '').toLowerCase().includes(k)
      || (d.timCrm || '').toLowerCase().includes(k)
      || (d.note || '').toLowerCase().includes(k)
    );
    if (kantorFilter) rows = rows.filter(d => d.kantor === kantorFilter);
    rows = rows.filter(d => {
      const a = advanced;
      if (a.jenisDonatur && d.jenisDonatur !== a.jenisDonatur) return false;
      if (a.regFrom && d.tglReg < a.regFrom) return false;
      if (a.regTo && d.tglReg > a.regTo) return false;
      if (a.transaksiAktif === 'y' && !(d.jumlahTransaksi > 0)) return false;
      if (a.transaksiAktif === 'n' && !(d.jumlahTransaksi === 0)) return false;
      if (a.transaksiMin !== '' && !(d.jumlahTransaksi >= Number(a.transaksiMin))) return false;
      if (a.transaksiMax !== '' && !(d.jumlahTransaksi <= Number(a.transaksiMax))) return false;
      if (a.propertyField && a.propertyStatus) {
        const isEmpty = !(d[a.propertyField] || '').toString().trim();
        if (a.propertyStatus === 'kosong' && !isEmpty) return false;
        if (a.propertyStatus === 'terisi' && isEmpty) return false;
      }
      if (a.minatProgram && d.minatProgram !== a.minatProgram) return false;
      if (a.updateFrom && d.updated.slice(0, 10) < a.updateFrom) return false;
      if (a.updateTo && d.updated.slice(0, 10) > a.updateTo) return false;
      if (a.aktifDonatur && d.aktif !== a.aktifDonatur) return false;
      if (a.operatorHp && detectOperator(d.hp) !== a.operatorHp) return false;
      if (a.pekerjaan && d.pekerjaan !== a.pekerjaan) return false;
      if (a.parentDonatur && !(d.parentDonatur || '').toLowerCase().includes(a.parentDonatur.toLowerCase())) return false;
      if (a.dihubungiVia && d.dihubungiVia !== a.dihubungiVia) return false;
      if (a.userInsert && d.userInsert !== a.userInsert) return false;
      if (a.jenisKelamin && d.jenisKelamin !== a.jenisKelamin) return false;
      if (a.kantor && d.kantor !== a.kantor) return false;
      if (a.miladMonth && (d.tglLahir || '').slice(5, 7) !== a.miladMonth) return false;
      if (a.miladDay && (d.tglLahir || '').slice(8, 10) !== a.miladDay) return false;
      if (a.timCrm && d.timCrm !== a.timCrm) return false;
      if (a.verifiedBy && d.verifiedBy !== a.verifiedBy) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [donaturList, keyword, kantorFilter, sort, advanced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleColumnDefs = COLUMN_DEFS.filter(c => visibleCols[c.key]);

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(`File '${file.name}' siap diimpor sebagai data Donatur (simulasi).`);
    setTimeout(() => setImportMessage(''), 4000);
    e.target.value = '';
  };

  const handleTambah = () => setIsAddOpen(true);
  const closeAdd = () => setIsAddOpen(false);

  const handleAddDonatur = (newDonatur) => {
    setDonaturList(prev => [newDonatur, ...prev]);
    setIsAddOpen(false);
    setToast(`Donatur "${newDonatur.nama}" berhasil disimpan (${newDonatur.id}).`);
    setTimeout(() => setToast(''), 2500);
  };

  const handleBc = () => alert('Fitur "BC" (Broadcast) belum tersedia di prototipe ini.');

  // "Tim CRM" pulls real employee data (karyawan) instead of a static list,
  // so Set As -> Tim CRM assigns donors to an actual staff member.
  const employeeOptions = useMemo(
    () => getAccountingData().employees.map(e => ({ value: e.nama, label: `${e.nama} — ${e.jabatan}` })),
    []
  );
  const SET_AS_FIELDS = useMemo(() => buildSetAsFields(employeeOptions), [employeeOptions]);
  const activeSetAsField = SET_AS_FIELDS.find(f => f.value === setAsForm.field);

  const openSetAs = () => {
    setSetAsForm(emptySetAsForm());
    setIsSetAsOpen(true);
  };
  const closeSetAs = () => setIsSetAsOpen(false);

  const handleSetAsFieldChange = (fieldValue) => {
    setSetAsForm(prev => ({ ...prev, field: fieldValue, value: '', multiValues: [] }));
  };

  const toggleSetAsMultiValue = (key) => {
    setSetAsForm(prev => ({
      ...prev,
      multiValues: prev.multiValues.includes(key) ? prev.multiValues.filter(k => k !== key) : [...prev.multiValues, key]
    }));
  };

  const handleSetAsSave = () => {
    const limit = Math.max(1, parseInt(setAsForm.limit, 10) || 1);
    const targetIds = new Set(filtered.slice(0, limit).map(d => d.id));
    if (targetIds.size === 0) {
      alert('Tidak ada data pada tampilan saat ini untuk diubah.');
      return;
    }

    if (activeSetAsField.type === 'multi') {
      if (setAsForm.multiValues.length === 0) {
        alert('Pilih minimal satu field untuk "Set As" -> Verified.');
        return;
      }
      const verifyingBy = setAsForm.multiValues.includes('verifiedBy');
      const fieldKeys = setAsForm.multiValues.filter(k => k !== 'verifiedBy');
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      setDonaturList(prev => prev.map(d => {
        if (!targetIds.has(d.id)) return d;
        const merged = new Set([...(d.verifiedFields || []), ...fieldKeys]);
        return {
          ...d,
          verifiedFields: [...merged],
          verifiedBy: verifyingBy ? CURRENT_STAFF_NAME : d.verifiedBy,
          verifiedAt: verifyingBy ? now : d.verifiedAt
        };
      }));
      alert(`${targetIds.size} data donatur berhasil ditandai Verified (${setAsForm.multiValues.map(k => VERIFIED_FIELD_OPTIONS.find(f => f.key === k)?.label).join(', ')}).`);
      setIsSetAsOpen(false);
      return;
    }

    if (!setAsForm.value) {
      alert('Pilih nilai tujuan "Set As" terlebih dahulu.');
      return;
    }
    const dataKey = activeSetAsField.value;
    setDonaturList(prev => prev.map(d => targetIds.has(d.id) ? { ...d, [dataKey]: setAsForm.value } : d));
    alert(`${targetIds.size} data donatur berhasil diubah "${activeSetAsField.label}" menjadi "${activeSetAsField.options.find(o => o.value === setAsForm.value)?.label}".`);
    setIsSetAsOpen(false);
  };

  const handleReset = () => {
    setKeywordDraft('');
    setKeyword('');
    setKantorFilter('');
    setSort({ key: 'nama', dir: 'asc' });
    setVisibleCols(DEFAULT_VISIBLE);
    setAdvancedDraft(emptyAdvanced());
    setAdvanced(emptyAdvanced());
    setPage(1);
  };

  const SortIcon = ({ colKey }) => {
    if (sort.key !== colKey) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const totalDonatur = donaturList.length;
  const donaturAktifCount = donaturList.filter(d => d.aktif === 'y').length;
  const donaturProspekCount = donaturList.filter(d => d.aktif === 'prospek').length;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Data Donatur
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter & kolom" onClick={handleReset} />
          </h1>
          <p>Daftar donatur terdaftar beserta riwayat transaksi dan status verifikasi</p>
        </div>
        <button className="btn btn-primary" onClick={handleTambah}><Plus size={16} /> Tambah Donatur</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Users size={20} /></div>
            <div className="stat-title">Total Donatur</div>
          </div>
          <div className="stat-value">{totalDonatur} Orang</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><UserCheck size={20} /></div>
            <div className="stat-title">Donatur Aktif</div>
          </div>
          <div className="stat-value">{donaturAktifCount} Orang</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><UserPlus size={20} /></div>
            <div className="stat-title">Prospek</div>
          </div>
          <div className="stat-value">{donaturProspekCount} Orang</div>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <div className="filter-input" style={{ width: '190px' }}>
            <select value={kantorFilter} onChange={e => { setKantorFilter(e.target.value); setPage(1); }}>
              <option value="">Semua Kantor</option>
              {kantorOptions.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <button
            className="btn"
            style={{ background: isAdvanceOpen ? 'var(--primary-color)' : 'white', color: isAdvanceOpen ? 'white' : 'inherit', border: '1px solid #e2e8f0' }}
            onClick={() => { setAdvancedDraft(advanced); setIsAdvanceOpen(o => !o); }}
          >
            <SlidersHorizontal size={16} /> Advance{activeAdvancedCount > 0 ? ` (${activeAdvancedCount})` : ''}
          </button>

          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setExportOpen(o => !o)}><Download size={16} /> Export</button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => setExportOpen(false)}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={() => setExportOpen(false)}><FileText size={14} /> CSV</button>
                <button onClick={() => setExportOpen(false)}><File size={14} /> PDF</button>
              </div>
            )}
          </div>

          <label className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <Upload size={16} /> Import
            <input type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={handleImportFile} />
          </label>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={openSetAs}><Tag size={16} /> Set As</button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleBc}><MessageSquare size={16} /> BC</button>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <div className="filter-input" style={{ width: '220px' }}>
            <Search size={16} />
            <input type="text" placeholder="Cari nama atau ID Donatur..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Kolom:</span>
          <ColumnPicker visible={visibleCols} onToggle={toggleColumn} />
        </div>
      </div>

      {isAdvanceOpen && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Advance Search</div>
            <X size={18} style={{ cursor: 'pointer', color: '#64748b' }} onClick={() => setIsAdvanceOpen(false)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 28px' }}>
            <AdvField label="Jenis Donatur">
              <select className="form-select" value={advancedDraft.jenisDonatur} onChange={e => setAdv('jenisDonatur', e.target.value)}>
                <option value="">Semua</option>
                {JENIS_DONATUR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>
            <AdvField label="Aktif Donatur">
              <select className="form-select" value={advancedDraft.aktifDonatur} onChange={e => setAdv('aktifDonatur', e.target.value)}>
                <option value="">Semua</option>
                {AKTIF_DONATUR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </AdvField>
            <AdvField label="Jenis Kelamin">
              <select className="form-select" value={advancedDraft.jenisKelamin} onChange={e => setAdv('jenisKelamin', e.target.value)}>
                <option value="">Semua</option>
                {JENIS_KELAMIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>

            <AdvField label="Registrasi">
              <input type="date" className="form-input" value={advancedDraft.regFrom} onChange={e => setAdv('regFrom', e.target.value)} />
              <span style={{ color: '#94a3b8' }}>-</span>
              <input type="date" className="form-input" value={advancedDraft.regTo} onChange={e => setAdv('regTo', e.target.value)} />
            </AdvField>
            <AdvField label="Operator Hp">
              <select className="form-select" value={advancedDraft.operatorHp} onChange={e => setAdv('operatorHp', e.target.value)}>
                <option value="">Semua</option>
                {OPERATOR_HP_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>
            <AdvField label="Kantor">
              <select className="form-select" value={advancedDraft.kantor} onChange={e => setAdv('kantor', e.target.value)}>
                <option value="">Semua</option>
                {OFFICES.map(o => <option key={o.id} value={o.nama}>{o.nama}</option>)}
              </select>
            </AdvField>

            <AdvField label="Transaksi Aktif">
              <select className="form-select" style={{ maxWidth: '86px' }} value={advancedDraft.transaksiAktif} onChange={e => setAdv('transaksiAktif', e.target.value)}>
                <option value="">Semua</option>
                <option value="y">Ya</option>
                <option value="n">Tidak</option>
              </select>
              <input type="number" min="0" className="form-input" placeholder="Min" style={{ width: '60px' }} value={advancedDraft.transaksiMin} onChange={e => setAdv('transaksiMin', e.target.value)} />
              <span style={{ color: '#94a3b8' }}>-</span>
              <input type="number" min="0" className="form-input" placeholder="Max" style={{ width: '60px' }} value={advancedDraft.transaksiMax} onChange={e => setAdv('transaksiMax', e.target.value)} />
            </AdvField>
            <AdvField label="Pekerjaan">
              <select className="form-select" value={advancedDraft.pekerjaan} onChange={e => setAdv('pekerjaan', e.target.value)}>
                <option value="">Semua</option>
                {PEKERJAAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>
            <AdvField label="Milad">
              <select className="form-select" value={advancedDraft.miladMonth} onChange={e => setAdv('miladMonth', e.target.value)}>
                <option value="">Bulan</option>
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select className="form-select" value={advancedDraft.miladDay} onChange={e => setAdv('miladDay', e.target.value)}>
                <option value="">Tgl</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </AdvField>

            <AdvField label="Properties">
              <select className="form-select" value={advancedDraft.propertyField} onChange={e => setAdv('propertyField', e.target.value)}>
                <option value="">Pilih Field</option>
                {PROPERTY_FIELD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select className="form-select" value={advancedDraft.propertyStatus} onChange={e => setAdv('propertyStatus', e.target.value)}>
                <option value="">Status</option>
                <option value="kosong">Kosong</option>
                <option value="terisi">Terisi</option>
              </select>
            </AdvField>
            <AdvField label="Parent Donatur">
              <input type="text" className="form-input" placeholder="Nama parent donatur..." value={advancedDraft.parentDonatur} onChange={e => setAdv('parentDonatur', e.target.value)} />
            </AdvField>
            <AdvField label="Tim CRM">
              <select className="form-select" value={advancedDraft.timCrm} onChange={e => setAdv('timCrm', e.target.value)}>
                <option value="">Semua</option>
                {TIM_CRM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>

            <AdvField label="Minat Program">
              <select className="form-select" value={advancedDraft.minatProgram} onChange={e => setAdv('minatProgram', e.target.value)}>
                <option value="">Semua</option>
                {MINAT_PROGRAM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>
            <AdvField label="Dihubungi Via">
              <select className="form-select" value={advancedDraft.dihubungiVia} onChange={e => setAdv('dihubungiVia', e.target.value)}>
                <option value="">Semua</option>
                {DIHUBUNGI_VIA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>
            <AdvField label="Verified By">
              <select className="form-select" value={advancedDraft.verifiedBy} onChange={e => setAdv('verifiedBy', e.target.value)}>
                <option value="">Semua</option>
                {uniqueVerifiedBy.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>

            <AdvField label="Tgl Update">
              <input type="date" className="form-input" value={advancedDraft.updateFrom} onChange={e => setAdv('updateFrom', e.target.value)} />
              <span style={{ color: '#94a3b8' }}>-</span>
              <input type="date" className="form-input" value={advancedDraft.updateTo} onChange={e => setAdv('updateTo', e.target.value)} />
            </AdvField>
            <AdvField label="User Insert">
              <select className="form-select" value={advancedDraft.userInsert} onChange={e => setAdv('userInsert', e.target.value)}>
                <option value="">Semua</option>
                {uniqueUserInsert.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </AdvField>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
            <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={resetAdvanced}><RefreshCw size={16} /> Reset</button>
            <button type="button" className="btn btn-primary" onClick={applyAdvanced}><Search size={16} /> Terapkan Filter</button>
          </div>
        </div>
      )}

      {importMessage && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
          {importMessage}
        </div>
      )}

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Data Donatur</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Donatur</th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('nama')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nama Donatur <SortIcon colKey="nama" /></span>
                </th>
                {visibleColumnDefs.map(c => (
                  <th key={c.key} style={{ cursor: c.sortable ? 'pointer' : 'default', whiteSpace: 'nowrap' }} onClick={() => c.sortable && toggleSort(c.key)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {c.label} {c.sortable && <SortIcon colKey={c.key} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={2 + visibleColumnDefs.length} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map(d => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{d.id}</td>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{d.nama}</td>
                  {visibleColumnDefs.map(c => (
                    <td key={c.key} style={{ whiteSpace: 'nowrap' }}>{c.render(d)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Displaying {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} items
          </div>
          <div className="pagination-controls">
            <select className="pagination-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / halaman</option>)}
            </select>
            <button disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
            <button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>

      {isSetAsOpen && (
        <div className="modal-backdrop" onClick={closeSetAs}>
          <div className="modal-content" style={{ width: '620px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ background: 'var(--primary-color)' }}>
              <h2 style={{ color: 'white' }}>Set As</h2>
              <button className="modal-close" onClick={closeSetAs}><X size={20} color="white" /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <label style={{ width: '70px', flexShrink: 0, fontWeight: 600, fontSize: '0.9rem' }}>Set As</label>
                <div style={{ flex: 1.3 }}>
                  <SearchableSelect
                    options={SET_AS_FIELDS.map(f => ({ value: f.value, label: f.label }))}
                    value={setAsForm.field}
                    onChange={handleSetAsFieldChange}
                  />
                </div>
                <div style={{ flex: 1.3, position: 'relative' }}>
                  {activeSetAsField.type === 'multi' ? (
                    <MultiSelectPicker
                      options={activeSetAsField.options}
                      selected={setAsForm.multiValues}
                      onToggle={toggleSetAsMultiValue}
                      placeholder={activeSetAsField.placeholder}
                    />
                  ) : (
                    <SearchableSelect
                      options={activeSetAsField.options}
                      value={setAsForm.value}
                      onChange={val => setSetAsForm(prev => ({ ...prev, value: val }))}
                      placeholder={activeSetAsField.placeholder}
                    />
                  )}
                </div>
                <label style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Limit:</label>
                <input
                  type="number" min="1" className="form-input" style={{ width: '80px' }}
                  value={setAsForm.limit}
                  onChange={e => setSetAsForm(prev => ({ ...prev, limit: e.target.value }))}
                />
              </div>

              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                <strong>Note :</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: '20px', lineHeight: 1.7 }}>
                  <li>Semua data pada hasil pencarian/filter saat ini akan diubah sesuai "Set As" tujuan.</li>
                  <li>Pastikan filter/keyword pencarian sudah tepat sebelum menyimpan — perubahan tidak bisa dibatalkan otomatis!</li>
                  <li>Limit membatasi jumlah maksimum data yang diubah dalam satu kali eksekusi update data.</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-success" onClick={handleSetAsSave}><Check size={16} /> Save</button>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={closeSetAs}><X size={16} /> Cancel</button>
            </div>
          </div>
        </div>
      )}

      {isAddOpen && (
        <div className="modal-backdrop" onClick={closeAdd}>
          <div className="modal-content" style={{ maxWidth: '1200px' }} onClick={e => e.stopPropagation()}>
            <EntryDonaturForm donaturList={donaturList} onSave={handleAddDonatur} onCancel={closeAdd} />
          </div>
        </div>
      )}

      {toast && <div className="save-toast">{toast}</div>}
    </div>
  );
};

export default ListDonatur;
