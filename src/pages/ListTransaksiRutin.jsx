import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Maximize2, Minimize2, Search, Download, FileSpreadsheet, FileText, File,
  ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import { ROUTINE_DONATUR, TAHUN_OPTIONS, MONTHS } from '../utils/transaksiRutinStore';
import { PROGRAM_TRANSAKSI } from '../utils/crmTransaksiStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const TRANSAKSI_MODE_OPTIONS = ['Bulan', 'Tahun'];
const DATE_BY_OPTIONS = ['Transaksi', 'Peruntukan'];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);

const ListTransaksiRutin = () => {
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [transaksiMode, setTransaksiMode] = useState('Bulan');
  const [tahun, setTahun] = useState(2026);
  const [kantor, setKantor] = useState('');
  const [program, setProgram] = useState('');
  const [dateBy, setDateBy] = useState('Transaksi');
  const [sortKey, setSortKey] = useState('nama');
  const [sortDir, setSortDir] = useState('asc');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const kantorOptions = useMemo(() => [...new Set(ROUTINE_DONATUR.map(d => d.kantor).filter(Boolean))], []);
  const programOptions = PROGRAM_TRANSAKSI.map(p => p.nama);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setKeywordDraft('');
    setKeyword('');
    setTransaksiMode('Bulan');
    setTahun(2026);
    setKantor('');
    setProgram('');
    setDateBy('Transaksi');
    setSortKey('nama');
    setSortDir('asc');
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // 1. Filter transaksi per donatur (tahun/kantor/program), lalu agregasi per bulan
  const rows = useMemo(() => {
    return ROUTINE_DONATUR
      .filter(d => !kantor || d.kantor === kantor)
      .map(d => {
        const monthly = Array(12).fill(0);
        d.transaksi.forEach(t => {
          if (program && t.program !== program) return;
          const dateField = dateBy === 'Transaksi' ? t.tanggalTransaksi : t.tanggalPeruntukan;
          const [y, m] = dateField.split('-').map(Number);
          if (y !== tahun) return;
          monthly[m - 1] += t.nominal;
        });
        const total = monthly.reduce((s, v) => s + v, 0);
        return { id: d.id, nama: d.nama, timCrm: d.timCrm, monthly, total };
      })
      .filter(r => {
        const k = keyword.trim().toLowerCase();
        return !k || r.id.toLowerCase().includes(k) || r.nama.toLowerCase().includes(k) || r.timCrm.toLowerCase().includes(k);
      });
  }, [kantor, program, dateBy, tahun, keyword]);

  const sorted = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      if (sortKey === 'total') return (a.total - b.total) * dir;
      return String(a[sortKey]).localeCompare(String(b[sortKey])) * dir;
    });
  }, [rows, sortKey, sortDir]);

  const totals = useMemo(() => {
    const monthly = Array(12).fill(0);
    let total = 0;
    sorted.forEach(r => {
      total += r.total;
      r.monthly.forEach((v, i) => { monthly[i] += v; });
    });
    return { monthly, total };
  }, [sorted]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    return sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            List Transaksi Rutin
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} className={isRefreshing ? 'icon-spin' : ''} title="Reset filter" onClick={handleRefresh} />
          </h1>
          <p>Rekap donatur dengan kesediaan donasi rutin (bulanan/mingguan) beserta riwayat transaksinya</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title={isFullscreen ? 'Keluar layar penuh' : 'Perbesar layar penuh'} onClick={() => setIsFullscreen(f => !f)}>
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* FILTER ROW 1 */}
      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Search :</span>
          <div className="filter-input" style={{ width: '220px' }}>
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
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Transaksi :</span>
          <select className="form-select" style={{ width: 'auto' }} value={transaksiMode} onChange={e => setTransaksiMode(e.target.value)}>
            {TRANSAKSI_MODE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tahun :</span>
          <select className="form-select" style={{ width: 'auto' }} value={tahun} onChange={e => { setTahun(Number(e.target.value)); setPage(1); }}>
            {TAHUN_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>| Kantor :</span>
          <select className="form-select" style={{ width: 'auto' }} value={kantor} onChange={e => { setKantor(e.target.value); setPage(1); }}>
            <option value="">Kantor</option>
            {kantorOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* FILTER ROW 2 */}
      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Program :</span>
          <div style={{ width: '220px' }}>
            <SearchableSelect
              options={[{ value: '', label: 'Program' }, ...programOptions.map(p => ({ value: p, label: p }))]}
              value={program}
              onChange={val => { setProgram(val); setPage(1); }}
            />
          </div>
        </div>
        <div className="filters-right" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Date By</span>
          <select className="form-select" style={{ width: 'auto' }} value={dateBy} onChange={e => setDateBy(e.target.value)}>
            {DATE_BY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Data Donatur</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('id')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>ID Donatur <SortIcon colKey="id" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('nama')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nama Donatur <SortIcon colKey="nama" /></span>
                </th>
                <th>Tim CRM</th>
                <th style={{ textAlign: 'right', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('total')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>Total <SortIcon colKey="total" /></span>
                </th>
                {transaksiMode === 'Bulan' && MONTHS.map(m => <th key={m.key} style={{ textAlign: 'right' }}>{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={transaksiMode === 'Bulan' ? 16 : 4} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data untuk filter ini</td></tr>
              )}
              {paged.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.id}</td>
                  <td style={{ fontWeight: 500 }}>{r.nama}</td>
                  <td>{r.timCrm}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(r.total)}</td>
                  {transaksiMode === 'Bulan' && r.monthly.map((v, i) => (
                    <td key={MONTHS[i].key} style={{ textAlign: 'right', color: v === 0 ? '#cbd5e1' : undefined }}>{fmt(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            {sorted.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: 700 }}>
                  <td colSpan={3}>Σ Total :</td>
                  <td style={{ textAlign: 'right' }}>{fmt(totals.total)}</td>
                  {transaksiMode === 'Bulan' && totals.monthly.map((v, i) => (
                    <td key={MONTHS[i].key} style={{ textAlign: 'right' }}>{fmt(v)}</td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Displaying {sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sorted.length)} of {sorted.length} items
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

export default ListTransaksiRutin;
