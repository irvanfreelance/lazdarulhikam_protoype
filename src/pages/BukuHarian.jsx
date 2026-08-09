import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Maximize2, Minimize2, Search, Download, FileSpreadsheet, FileText, File,
  Scissors, Repeat, GitMerge, Columns3
} from 'lucide-react';
import {
  BUKU_ACCOUNTS, STATUS_OPTIONS, INPUT_VIA_OPTIONS, VIEW_OPTIONS, INITIAL_BUKU_HARIAN
} from '../utils/finsBukuHarianStore';
import { OFFICES } from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const todayStr = () => new Date().toISOString().substring(0, 10);
const firstOfMonthStr = () => todayStr().substring(0, 8) + '01';

const formatNum = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const RINGKAS_HIDDEN = ['program', 'idBuku', 'idTransaksi', 'tglInput', 'coaDebet', 'coaKredit', 'idReferensi', 'referensi', 'idDonatur', 'donatur'];

const BukuHarian = () => {
  const [jenisBuku, setJenisBuku] = useState('bank'); // 'bank' | 'kas'
  const bukuOfType = useMemo(() => BUKU_ACCOUNTS.filter(b => b.jenis === jenisBuku), [jenisBuku]);
  const [selectedCoa, setSelectedCoa] = useState(bukuOfType[0]?.coa || '');

  const [periodeDari, setPeriodeDari] = useState(firstOfMonthStr());
  const [periodeSampai, setPeriodeSampai] = useState(todayStr());
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [advKeyword, setAdvKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [inputViaFilter, setInputViaFilter] = useState('all');
  const [view, setView] = useState('Normal');
  const [hiddenCols, setHiddenCols] = useState([]);
  const [kolomOpen, setKolomOpen] = useState(false);
  const [viewLog, setViewLog] = useState('Tidak');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const officeById = useMemo(() => {
    const map = {};
    OFFICES.forEach(o => { map[o.id] = o.nama; });
    return map;
  }, []);

  const selectedBuku = BUKU_ACCOUNTS.find(b => b.coa === selectedCoa);

  const handleTabChange = (type) => {
    setJenisBuku(type);
    const first = BUKU_ACCOUNTS.filter(b => b.jenis === type)[0];
    setSelectedCoa(first?.coa || '');
    setPage(1);
  };

  const handleViewChange = (val) => {
    setView(val);
    setHiddenCols(val === 'Ringkas' ? RINGKAS_HIDDEN : []);
  };

  const toggleColumn = (key) => {
    setHiddenCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };
  const resetPage = (setter) => (val) => { setter(val); setPage(1); };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPeriodeDari(firstOfMonthStr());
    setPeriodeSampai(todayStr());
    setKeywordDraft('');
    setKeyword('');
    setAdvKeyword('');
    setAdvanceOpen(false);
    setStatusFilter('all');
    setOfficeFilter('all');
    setInputViaFilter('all');
    handleViewChange('Normal');
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handlePemisahResi = () => {
    alert('Mencetak lembar pemisah resi untuk transaksi pada halaman ini...');
    window.print();
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const ak = advKeyword.trim().toLowerCase();
    return INITIAL_BUKU_HARIAN.filter(row => {
      if (row.bukuCoa !== selectedCoa) return false;
      const matchesPeriode = row.tanggal >= periodeDari && row.tanggal <= periodeSampai;
      const matchesKeyword = !k ||
        row.jenisTransaksi.toLowerCase().includes(k) ||
        row.keterangan.toLowerCase().includes(k) ||
        row.coa.toLowerCase().includes(k);
      const matchesAdv = !ak || row.noResi.toLowerCase().includes(ak) || row.idTransaksi.toLowerCase().includes(ak);
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesOffice = officeFilter === 'all' || row.officeId === officeFilter;
      const matchesInputVia = inputViaFilter === 'all' || row.inputVia === inputViaFilter;
      return matchesPeriode && matchesKeyword && matchesAdv && matchesStatus && matchesOffice && matchesInputVia;
    }).sort((a, b) => (a.tanggal === b.tanggal ? a.id.localeCompare(b.id) : (a.tanggal < b.tanggal ? -1 : 1)));
  }, [selectedCoa, periodeDari, periodeSampai, keyword, advKeyword, statusFilter, officeFilter, inputViaFilter]);

  const saldoAwal = selectedBuku?.saldoAwal || 0;

  const withSaldo = useMemo(() => {
    let running = saldoAwal;
    return filtered.map(row => {
      running = running + row.debet - row.kredit;
      return { ...row, saldo: running };
    });
  }, [filtered, saldoAwal]);

  const sumDebet = filtered.reduce((s, r) => s + r.debet, 0);
  const sumKredit = filtered.reduce((s, r) => s + r.kredit, 0);
  const countDebet = filtered.filter(r => r.debet > 0).length;
  const countKredit = filtered.filter(r => r.kredit > 0).length;
  const saldoAkhir = saldoAwal + sumDebet - sumKredit;

  const totalPages = Math.max(1, Math.ceil(withSaldo.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = withSaldo.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const ALL_COLUMNS = useMemo(() => ([
    { key: 'tanggal', label: 'Tanggal', core: true, render: r => r.tanggal },
    { key: 'coa', label: 'COA', core: true, mono: true, render: r => r.coa },
    { key: 'jenisTransaksi', label: 'Jenis Transaksi', core: true, render: r => r.jenisTransaksi },
    { key: 'keterangan', label: 'Keterangan', core: true, render: r => r.keterangan },
    { key: 'debet', label: 'Debet', core: true, align: 'right', render: r => formatNum(r.debet) },
    { key: 'kredit', label: 'Kredit', core: true, align: 'right', render: r => formatNum(r.kredit) },
    { key: 'saldo', label: 'Saldo', core: true, align: 'right', render: r => formatNum(r.saldo) },
    { key: 'noResi', label: 'No Resi', mono: true, render: r => r.noResi || '-' },
    { key: 'userInput', label: 'User Input', render: r => r.userInput || '-' },
    { key: 'userApprove', label: 'User Approve', render: r => r.userApprove || '-' },
    { key: 'program', label: 'Program', render: r => r.program || '-' },
    { key: 'idBuku', label: 'ID Buku', mono: true, render: r => r.idBuku },
    { key: 'idTransaksi', label: 'ID Transaksi', mono: true, render: r => r.idTransaksi },
    { key: 'tglInput', label: 'Tgl Input', render: r => r.tglInput },
    { key: 'kantor', label: 'Kantor', render: r => officeById[r.officeId] || '-' },
    { key: 'coaDebet', label: 'COA Debet', mono: true, render: r => r.coaDebet },
    { key: 'coaKredit', label: 'COA Kredit', mono: true, render: r => r.coaKredit },
    { key: 'idReferensi', label: 'ID Referensi', render: r => r.idReferensi || '-' },
    { key: 'referensi', label: 'Referensi', render: r => r.referensi || '-' },
    { key: 'idDonatur', label: 'ID Donatur', render: r => r.idDonatur || '-' },
    { key: 'donatur', label: 'Donatur', render: r => r.donatur || '-' }
  ]), [officeById]);

  const visibleColumns = ALL_COLUMNS.filter(c => c.core || !hiddenCols.includes(c.key));

  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ marginBottom: 0 }}>{jenisBuku === 'bank' ? 'Buku Bank' : 'Buku Kas'}</h1>
          <button onClick={handleRefresh} title="Reset filter" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}>
            <RefreshCw size={20} className={isRefreshing ? 'icon-spin' : ''} />
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>View Log</span>
            <select value={viewLog} onChange={e => setViewLog(e.target.value)}>
              <option value="Tidak">Tidak</option>
              <option value="Ya">Ya</option>
            </select>
          </div>
          <button onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? 'Keluar layar penuh' : 'Perbesar layar penuh'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* BANK / KAS TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {[['bank', 'Bank'], ['kas', 'Kas']].map(([type, label]) => (
            <div key={type} className={`tab-item ${jenisBuku === type ? 'active' : ''}`} onClick={() => handleTabChange(type)}>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* DASHBOARD STRIP */}
      <div className="data-table-container" style={{ marginBottom: '16px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', padding: '16px 20px 0' }}>Dashboard</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Saldo Awal</th>
              <th>Σ Debet</th>
              <th>Σ Kredit</th>
              <th>Saldo Akhir</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatNum(saldoAwal)}</td>
              <td style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatNum(sumDebet)}{countDebet > 0 ? `|${countDebet}` : ''}</td>
              <td style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatNum(sumKredit)}{countKredit > 0 ? `|${countKredit}` : ''}</td>
              <td style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatNum(saldoAkhir)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FILTER ROW 1 */}
      <div className="filters-row">
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '8px' }}>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>Periode</span>
            <input type="date" value={periodeDari} onChange={e => resetPage(setPeriodeDari)(e.target.value)} />
            <span style={{ fontSize: '0.8rem' }}>s/d</span>
            <input type="date" value={periodeSampai} onChange={e => resetPage(setPeriodeSampai)(e.target.value)} />
          </div>
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text" placeholder="Keyword..." value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            <Search size={14} /> Search
          </button>
          <button className="btn" style={{ background: advanceOpen ? '#e0f2fe' : 'white', border: '1px solid #e2e8f0' }} onClick={() => setAdvanceOpen(o => !o)}>
            Advance
          </button>
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setExportOpen(o => !o)}>
              <Download size={16} /> Export
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => setExportOpen(false)}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={() => setExportOpen(false)}><FileText size={14} /> CSV</button>
                <button onClick={() => setExportOpen(false)}><File size={14} /> PDF</button>
              </div>
            )}
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handlePemisahResi}>
            <Scissors size={14} /> Pemisah Resi
          </button>
        </div>
        <div className="filters-right">
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => resetPage(setStatusFilter)(e.target.value)}>
            <option value="all">Status: Semua</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={officeFilter} onChange={e => resetPage(setOfficeFilter)(e.target.value)}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      {advanceOpen && (
        <div className="filters-row" style={{ marginTop: '-16px' }}>
          <div className="filters-left">
            <div className="filter-input">
              <span style={{ fontSize: '0.8rem' }}>No Resi / ID Transaksi</span>
              <input type="text" placeholder="Cari No Resi atau ID Transaksi..." value={advKeyword} onChange={e => resetPage(setAdvKeyword)(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* FILTER ROW 2 */}
      <div className="filters-row">
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '8px' }}>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>Input Via</span>
            <select value={inputViaFilter} onChange={e => resetPage(setInputViaFilter)(e.target.value)}>
              <option value="all">Semua</option>
              {INPUT_VIA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>View</span>
            <select value={view} onChange={e => handleViewChange(e.target.value)}>
              {VIEW_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => alert('Konversi mutasi buku ke format lain — belum tersedia di prototipe ini.')}>
            <Repeat size={14} /> Konversi
          </button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => alert('Rekonsiliasi mutasi buku dengan bank statement — buka menu Rekonsiliasi Bank untuk proses lengkap.')}>
            <GitMerge size={14} /> Rekon
          </button>
        </div>
        <div className="filters-right">
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setKolomOpen(o => !o)}>
              <Columns3 size={16} /> Kolom
            </button>
            {kolomOpen && (
              <div className="export-menu" style={{ minWidth: '220px', maxHeight: '280px', overflowY: 'auto' }}>
                {ALL_COLUMNS.filter(c => !c.core).map(c => (
                  <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!hiddenCols.includes(c.key)} onChange={() => toggleColumn(c.key)} />
                    {c.label}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div style={{ width: '240px' }}>
            <SearchableSelect
              className="form-select"
              options={bukuOfType.map(b => ({ value: b.coa, label: `${b.coa} — ${b.nama}` }))}
              value={selectedCoa}
              onChange={resetPage(setSelectedCoa)}
              placeholder="Buku"
            />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="data-table-container">
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', padding: '16px 20px' }}>
          {jenisBuku === 'bank' ? 'Buku Bank' : 'Buku Kas'} [{selectedBuku ? `${selectedBuku.coa} ${selectedBuku.nama}` : '-'}]
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {visibleColumns.map(c => (
                  <th key={c.key} style={c.align === 'right' ? { textAlign: 'right' } : undefined}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Saldo Awal :</td>
                {visibleColumns.slice(1, -1).map(c => <td key={c.key}></td>)}
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatNum(saldoAwal)}</td>
              </tr>
              {paged.length === 0 && (
                <tr><td colSpan={visibleColumns.length} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada mutasi untuk filter ini</td></tr>
              )}
              {paged.map(row => (
                <tr key={row.id}>
                  {visibleColumns.map(c => (
                    <td
                      key={c.key}
                      style={{
                        ...(c.align === 'right' ? { textAlign: 'right' } : {}),
                        ...(c.mono ? { fontFamily: 'monospace', fontSize: '0.75rem' } : {}),
                        ...(c.key === 'saldo' ? { fontWeight: 600 } : {})
                      }}
                    >
                      {c.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: 700 }}>
                  <td colSpan={visibleColumns.findIndex(c => c.key === 'debet')}>Σ Total :</td>
                  <td style={{ textAlign: 'right' }}>{formatNum(sumDebet)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNum(sumKredit)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNum(saldoAkhir)}</td>
                  <td colSpan={Math.max(0, visibleColumns.length - visibleColumns.findIndex(c => c.key === 'debet') - 3)}></td>
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
            <button onClick={handleRefresh} title="Reset"><RefreshCw size={14} className={isRefreshing ? 'icon-spin' : ''} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BukuHarian;
