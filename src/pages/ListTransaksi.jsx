import React, { useMemo, useRef, useState } from 'react';
import {
  Search, SlidersHorizontal, Printer, Download, Upload, RefreshCcw, MessageSquare,
  RefreshCw, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ArrowUpDown, Plus,
  FileSpreadsheet, FileText, File, ExternalLink, Hash, Users, Wallet, Target, Percent, TrendingUp, TrendingDown
} from 'lucide-react';
import { INITIAL_TRANSAKSI, STATUS_TRANSAKSI_OPTIONS } from '../utils/crmTransaksiStore';
import SearchableSelect from '../components/SearchableSelect';
import EntryTransaksiForm from '../components/EntryTransaksiForm';

const PAGE_SIZES = [10, 25, 50, 100];

const fmtMoney = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
const todayStr = () => new Date().toISOString().slice(0, 10);

// Every column here is optional/toggleable via the "Kolom" picker. ID
// Transaksi, ID Donatur, Nama Donatur are fixed and always rendered.
const COLUMN_DEFS = [
  { key: 'program', label: 'Program', sortable: true, render: t => t.program },
  { key: 'nominal', label: '[IDR]Transaksi', sortable: true, align: 'right', render: t => fmtMoney(t.nominal) },
  { key: 'kantorTransaksi', label: 'Kantor Transaksi', render: t => t.kantorTransaksi },
  { key: 'userInsert', label: 'User Insert', render: t => t.userInsert },
  { key: 'tglTransaksi', label: 'Tgl Transaksi', sortable: true, render: t => t.tglTransaksi },
  { key: 'peruntukan', label: 'Peruntukkan', render: t => t.peruntukan },
  { key: 'idTimCrm', label: 'ID Tim CRM', render: t => t.idTimCrm || '-' },
  { key: 'timCrm', label: 'Tim CRM', render: t => t.timCrm || '-' },
  { key: 'viaHimpun', label: 'Via Himpun', render: t => t.viaHimpun },
  { key: 'jenisTransaksi', label: 'Jenis Transaksi', render: t => t.jenisTransaksi },
  { key: 'bank', label: 'Bank', render: t => t.bank || '-' },
  { key: 'qty', label: 'Qty', align: 'center', render: t => t.qty },
  { key: 'status', label: 'Status', render: t => <span className={`status-badge ${t.status === 'Approved' ? 'status-success' : t.status === 'Pending' ? 'status-warning' : 'status-danger'}`}>{t.status}</span> },
  { key: 'keterangan', label: 'Keterangan', render: t => t.keterangan }
];

const DEFAULT_VISIBLE = { kantorTransaksi: true, userInsert: true, idTimCrm: true, timCrm: true, program: true, nominal: true, tglTransaksi: true, peruntukan: true };
const SORTABLE = ['namaDonatur', ...COLUMN_DEFS.filter(c => c.sortable).map(c => c.key)];

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

const StatCard = ({ label, value, icon: Icon, bg, fg }) => (
  <div className="stat-card">
    <div className="stat-header">
      <div className="stat-icon" style={{ background: bg, color: fg }}><Icon size={20} /></div>
      <div className="stat-title">{label}</div>
    </div>
    <div className="stat-value">{value}</div>
  </div>
);

const ListTransaksi = () => {
  const [transaksiList, setTransaksiList] = useState(INITIAL_TRANSAKSI);
  const [periodeFrom, setPeriodeFrom] = useState('2026-01-01');
  const [periodeTo, setPeriodeTo] = useState(todayStr());
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('Approved');
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE);
  const [sort, setSort] = useState({ key: 'tglTransaksi', dir: 'desc' });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toast, setToast] = useState('');

  const toggleColumn = (key) => setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); setHasSearched(true); };

  const toggleSort = (key) => {
    if (!SORTABLE.includes(key)) return;
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let rows = transaksiList.filter(t => {
      const matchesPeriode = (!periodeFrom || t.tglTransaksi.slice(0, 10) >= periodeFrom) && (!periodeTo || t.tglTransaksi.slice(0, 10) <= periodeTo);
      const matchesStatus = statusFilter === 'Semua Status' || t.status === statusFilter;
      const matchesKeyword = !k
        || t.id.toLowerCase().includes(k)
        || t.idDonatur.toLowerCase().includes(k)
        || t.namaDonatur.toLowerCase().includes(k)
        || t.program.toLowerCase().includes(k)
        || (t.timCrm || '').toLowerCase().includes(k);
      return matchesPeriode && matchesStatus && matchesKeyword;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const an = typeof av === 'number' ? av : (av || '').toString().toLowerCase();
      const bn = typeof bv === 'number' ? bv : (bv || '').toString().toLowerCase();
      if (an < bn) return sort.dir === 'asc' ? -1 : 1;
      if (an > bn) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [transaksiList, periodeFrom, periodeTo, keyword, statusFilter, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleColumnDefs = COLUMN_DEFS.filter(c => visibleCols[c.key]);

  // --- Dashboard stats, computed from the current periode/status/keyword filter ---
  const sumQuantity = filtered.reduce((s, t) => s + t.qty, 0);
  const sumDonatur = new Set(filtered.map(t => t.idDonatur)).size;
  const sumCapaian = filtered.reduce((s, t) => s + t.nominal, 0);
  const target = 0;
  const pctCapaian = target > 0 ? Math.round((sumCapaian / target) * 100) : 0;
  const growth = useMemo(() => {
    if (!periodeFrom || !periodeTo) return 0;
    const days = Math.max(1, Math.round((new Date(periodeTo) - new Date(periodeFrom)) / 86400000) + 1);
    const prevTo = new Date(periodeFrom); prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo); prevFrom.setDate(prevFrom.getDate() - days + 1);
    const prevFromStr = prevFrom.toISOString().slice(0, 10);
    const prevToStr = prevTo.toISOString().slice(0, 10);
    const prevSum = transaksiList
      .filter(t => t.tglTransaksi.slice(0, 10) >= prevFromStr && t.tglTransaksi.slice(0, 10) <= prevToStr && (statusFilter === 'Semua Status' || t.status === statusFilter))
      .reduce((s, t) => s + t.nominal, 0);
    if (prevSum === 0) return 0;
    return Math.round(((sumCapaian - prevSum) / prevSum) * 100);
  }, [transaksiList, periodeFrom, periodeTo, statusFilter, sumCapaian]);

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(`File '${file.name}' siap diimpor sebagai data Transaksi (simulasi).`);
    setTimeout(() => setImportMessage(''), 4000);
    e.target.value = '';
  };

  const handleLps = () => alert('Fitur cetak LPS (Laporan Penerimaan Sementara) belum tersedia di prototipe ini.');
  const handleFinsSync = () => alert('Sinkronisasi ke modul FINS akan mengirim transaksi Approved sebagai jurnal Penerimaan (simulasi).');
  const handleBc = () => alert('Fitur "BC" (Broadcast) belum tersedia di prototipe ini.');

  const closeAdd = () => setIsAddOpen(false);
  const handleAddTransaksi = (newRecords, channels) => {
    setTransaksiList(prev => [...newRecords, ...prev]);
    setIsAddOpen(false);
    const total = newRecords.reduce((s, t) => s + t.nominal * t.qty, 0);
    setToast(`Transaksi ${fmtMoney(total)} untuk "${newRecords[0]?.namaDonatur}" berhasil disimpan.${channels ? ` Notifikasi dikirim via ${channels}.` : ''}`);
    setTimeout(() => setToast(''), 3000);
  };

  const handleReset = () => {
    setKeywordDraft('');
    setKeyword('');
    setStatusFilter('Approved');
    setSort({ key: 'tglTransaksi', dir: 'desc' });
    setVisibleCols(DEFAULT_VISIBLE);
    setPage(1);
    setHasSearched(false);
  };

  const SortIcon = ({ colKey }) => {
    if (sort.key !== colKey) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            List Transaksi
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter & kolom" onClick={handleReset} />
          </h1>
          <p>Daftar transaksi donasi beserta status approval dan sinkronisasi ke FINS</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
            <ExternalLink size={16} />
          </button>
          <button className="btn btn-primary" onClick={() => setIsAddOpen(true)}><Plus size={16} /> Tambah Transaksi</button>
        </div>
      </div>

      {/* --- Dashboard --- */}
      <div className="stats-grid">
        <StatCard label="Σ Quantity" value={sumQuantity.toLocaleString('id-ID')} icon={Hash} bg="#e0f2fe" fg="#0ea5e9" />
        <StatCard label="Σ Donatur" value={sumDonatur.toLocaleString('id-ID')} icon={Users} bg="#fce7f3" fg="#db2777" />
        <StatCard label="Σ Capaian[C]" value={fmtMoney(sumCapaian)} icon={Wallet} bg="#d1fae5" fg="#10b981" />
        <StatCard label="Σ Target[T]" value={fmtMoney(target)} icon={Target} bg="#fef3c7" fg="#d97706" />
        <StatCard label="% Capaian[C/T]" value={`${pctCapaian}%`} icon={Percent} bg="#ede9fe" fg="#7c3aed" />
        <StatCard
          label="% Growth"
          value={`${growth}%`}
          icon={growth < 0 ? TrendingDown : TrendingUp}
          bg={growth < 0 ? '#fee2e2' : '#d1fae5'}
          fg={growth < 0 ? '#ef4444' : '#10b981'}
        />
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Periode:</span>
          <div style={{ width: '130px' }}>
            <SearchableSelect options={[{ value: 'Transaksi', label: 'Transaksi' }]} value="Transaksi" onChange={() => {}} />
          </div>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeFrom} onChange={e => setPeriodeFrom(e.target.value)} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>s/d</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeTo} onChange={e => setPeriodeTo(e.target.value)} />
          <div className="filter-input" style={{ width: '200px' }}>
            <Search size={16} />
            <input type="text" placeholder="Keyword..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
            {!hasSearched && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', left: 0, whiteSpace: 'nowrap', zIndex: 5,
                background: '#fff7ed', border: '1px solid #fdba74', color: '#c2410c', fontSize: '0.75rem',
                padding: '6px 10px', borderRadius: '6px'
              }}>
                Klik melakukan pencarian !
              </div>
            )}
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><SlidersHorizontal size={16} /> Advance</button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleLps}><Printer size={16} /> LPS</button>
        </div>
        <div className="filters-right" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status<sup>(?)</sup>:</span>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="Semua Status">Semua Status</option>
            {STATUS_TRANSAKSI_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
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
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleFinsSync}><RefreshCcw size={16} /> FINS Sync</button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleBc}><MessageSquare size={16} /> BC</button>
        </div>
        <div className="filters-right">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Kolom:</span>
          <ColumnPicker visible={visibleCols} onToggle={toggleColumn} />
        </div>
      </div>

      {importMessage && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
          {importMessage}
        </div>
      )}

      <div className="data-table-container">
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700, padding: '8px 14px', cursor: 'pointer' }}
          onClick={() => setIsTableOpen(o => !o)}
        >
          <span>Data Transaksi</span>
          {isTableOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
        </div>
        {isTableOpen && (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID Transaksi</th>
                    <th>ID Donatur</th>
                    <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('namaDonatur')}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nama Donatur <SortIcon colKey="namaDonatur" /></span>
                    </th>
                    {visibleColumnDefs.map(c => (
                      <th key={c.key} style={{ cursor: c.sortable ? 'pointer' : 'default', whiteSpace: 'nowrap', textAlign: c.align || 'left' }} onClick={() => c.sortable && toggleSort(c.key)}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {c.label} {c.sortable && <SortIcon colKey={c.key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 && (
                    <tr><td colSpan={3 + visibleColumnDefs.length} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
                  )}
                  {paged.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
                        <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--primary-color)' }}>{t.id}</a>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{t.idDonatur}</td>
                      <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{t.namaDonatur}</td>
                      {visibleColumnDefs.map(c => (
                        <td key={c.key} style={{ whiteSpace: 'nowrap', textAlign: c.align || 'left' }}>{c.render(t)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                {paged.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={3}></td>
                      {visibleColumnDefs.map(c => (
                        <td key={c.key} style={{ textAlign: c.align || 'left', fontWeight: c.key === 'nominal' ? 700 : 400 }}>
                          {c.key === 'nominal' ? <>Σ Total : {fmtMoney(filtered.reduce((s, t) => s + t.nominal, 0))}</> : ''}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
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
          </>
        )}
      </div>

      {isAddOpen && (
        <div className="modal-backdrop" onClick={closeAdd}>
          <div className="modal-content" style={{ maxWidth: '1200px' }} onClick={e => e.stopPropagation()}>
            <EntryTransaksiForm onSave={handleAddTransaksi} onCancel={closeAdd} />
          </div>
        </div>
      )}

      {toast && <div className="save-toast">{toast}</div>}
    </div>
  );
};

export default ListTransaksi;
