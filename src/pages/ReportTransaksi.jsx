import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Search, Download, FileSpreadsheet, FileText, File, ExternalLink,
  ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import { INITIAL_TRANSAKSI, PROGRAM_TRANSAKSI, STATUS_TRANSAKSI_OPTIONS } from '../utils/crmTransaksiStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50, 100];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
const fmtRp = (n) => `Rp ${fmt(n)}`;

const ReportTransaksi = () => {
  const kantorOptions = useMemo(() => [...new Set(INITIAL_TRANSAKSI.map(t => t.kantorTransaksi))].sort(), []);

  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');
  const [program, setProgram] = useState('');
  const [kantor, setKantor] = useState('');
  const [status, setStatus] = useState('');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [sort, setSort] = useState({ key: 'tglTransaksi', dir: 'desc' });
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const resetAll = () => {
    setDateFrom('2026-01-01'); setDateTo('2026-12-31'); setProgram(''); setKantor(''); setStatus('');
    setKeywordDraft(''); setKeyword(''); setSort({ key: 'tglTransaksi', dir: 'desc' }); setPage(1);
  };

  const toggleSort = (key) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let rows = INITIAL_TRANSAKSI.filter(t => {
      const d = t.tglTransaksi.slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      if (program && t.program !== program) return false;
      if (kantor && t.kantorTransaksi !== kantor) return false;
      if (status && t.status !== status) return false;
      if (k && !(t.id.toLowerCase().includes(k) || t.idDonatur.toLowerCase().includes(k) || t.namaDonatur.toLowerCase().includes(k))) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [dateFrom, dateTo, program, kantor, status, keyword, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalNominal = filtered.reduce((s, t) => s + t.nominal * t.qty, 0);

  const SortIcon = ({ colKey }) => {
    if (sort.key !== colKey) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Report Transaksi
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Rekap transaksi donasi siap audit/export dalam rentang tanggal tertentu</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Periode:</span>
          <input type="date" className="form-input" style={{ width: 'auto' }} value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }} />
          <span style={{ color: '#94a3b8' }}>-</span>
          <input type="date" className="form-input" style={{ width: 'auto' }} value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }} />
          <div className="filter-input" style={{ width: '190px' }}>
            <Search size={16} />
            <input type="text" placeholder="Keyword..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
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
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <div style={{ width: '190px' }}>
            <SearchableSelect options={PROGRAM_TRANSAKSI.map(p => ({ value: p.nama, label: p.nama }))} value={program} onChange={v => { setProgram(v); setPage(1); }} placeholder="Program" />
          </div>
          <div style={{ width: '170px' }}>
            <SearchableSelect options={kantorOptions.map(k => ({ value: k, label: k }))} value={kantor} onChange={v => { setKantor(v); setPage(1); }} placeholder="Kantor" />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Semua Status</option>
            {STATUS_TRANSAKSI_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '18px', textAlign: 'center', marginBottom: '16px', background: 'var(--bg-card)' }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.02em' }}>LAZ DARUL HIKAM</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>Report Transaksi Donasi</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Periode {dateFrom} s/d {dateTo}</div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Detail Transaksi</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('tglTransaksi')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Tanggal <SortIcon colKey="tglTransaksi" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('id')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>ID Transaksi <SortIcon colKey="id" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('namaDonatur')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nama Donatur <SortIcon colKey="namaDonatur" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('program')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Program <SortIcon colKey="program" /></span>
                </th>
                <th>Kantor</th>
                <th style={{ textAlign: 'right', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('nominal')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nominal <SortIcon colKey="nominal" /></span>
                </th>
                <th>Via</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map(t => (
                <tr key={t.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{t.tglTransaksi}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{t.id}</td>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{t.namaDonatur}</td>
                  <td>{t.program}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{t.kantorTransaksi}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtRp(t.nominal * t.qty)}</td>
                  <td>{t.viaHimpun}</td>
                  <td>
                    <span className={`status-badge ${t.status === 'Approved' ? 'status-success' : t.status === 'Pending' ? 'status-warning' : 'status-danger'}`}>{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            {paged.length > 0 && (
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700 }}>&Sigma; Total ({filtered.length} transaksi) :</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtRp(totalNominal)}</td>
                  <td></td><td></td>
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
      </div>
    </div>
  );
};

export default ReportTransaksi;
