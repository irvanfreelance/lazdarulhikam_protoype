import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Search, Download, FileSpreadsheet, FileText, File, ExternalLink,
  ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import { INITIAL_BUKTI_SETOR, JENIS_SETOR_OPTIONS } from '../utils/buktiSetorStore';
import { OFFICES } from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const YEARS = [2024, 2025, 2026, 2027];
const MONTHS = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' }
];
const PAGE_SIZES = [10, 25, 50, 100];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const BuktiSetor = () => {
  const [jenis, setJenis] = useState('Zakat');
  const [tahun, setTahun] = useState(2026);
  const [bulan, setBulan] = useState('');
  const [kantor, setKantor] = useState('');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [sort, setSort] = useState({ key: 'transaksiTerakhir', dir: 'desc' });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const officeOptions = useMemo(() => OFFICES.map(o => ({ value: o.nama, label: o.nama })), []);
  const activeJenis = JENIS_SETOR_OPTIONS.find(j => j.value === jenis);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const resetAll = () => {
    setJenis('Zakat'); setTahun(2026); setBulan(''); setKantor('');
    setKeywordDraft(''); setKeyword(''); setSort({ key: 'transaksiTerakhir', dir: 'desc' }); setPage(1);
  };

  const toggleSort = (key) => {
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    let rows = INITIAL_BUKTI_SETOR.filter(r => {
      if (r.jenis !== jenis) return false;
      if (tahun && r.tahun !== tahun) return false;
      if (bulan && r.transaksiTerakhir.slice(5, 7) !== bulan) return false;
      if (kantor && r.kantor !== kantor) return false;
      if (k && !(r.id.toLowerCase().includes(k) || r.idDonatur.toLowerCase().includes(k) || r.namaDonatur.toLowerCase().includes(k))) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [jenis, tahun, bulan, kantor, keyword, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const totalPendapatan = filtered.reduce((s, r) => s + r.pendapatan, 0);
  const totalZakat = filtered.reduce((s, r) => s + r.zakat, 0);

  const SortIcon = ({ colKey }) => {
    if (sort.key !== colKey) return <ArrowUpDown size={12} style={{ opacity: 0.4 }} />;
    return sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {activeJenis.title}
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Rekap bukti setor per donatur untuk keperluan laporan/pengurangan pajak</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
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
          <div style={{ width: '150px' }}>
            <SearchableSelect
              options={JENIS_SETOR_OPTIONS.map(j => ({ value: j.value, label: j.label }))}
              value={jenis}
              onChange={v => { setJenis(v); setPage(1); }}
            />
          </div>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <select className="form-select" style={{ width: 'auto' }} value={tahun} onChange={e => { setTahun(Number(e.target.value)); setPage(1); }}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <select className="form-select" style={{ width: 'auto' }} value={bulan} onChange={e => { setBulan(e.target.value); setPage(1); }}>
            <option value="">Bulan</option>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ width: '190px' }}>
            <SearchableSelect
              options={officeOptions}
              value={kantor}
              onChange={v => { setKantor(v); setPage(1); }}
              placeholder="Kantor"
            />
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Data {activeJenis.prefix}</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('id')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>ID {activeJenis.prefix} <SortIcon colKey="id" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('tahun')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Tahun <SortIcon colKey="tahun" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('idDonatur')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>ID Donatur <SortIcon colKey="idDonatur" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('namaDonatur')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nama Donatur <SortIcon colKey="namaDonatur" /></span>
                </th>
                <th style={{ textAlign: 'right', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('pendapatan')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Pendapatan <SortIcon colKey="pendapatan" /></span>
                </th>
                <th style={{ textAlign: 'right', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('zakat')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{jenis} <SortIcon colKey="zakat" /></span>
                </th>
                <th style={{ cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => toggleSort('transaksiTerakhir')}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Transaksi Terakhir <SortIcon colKey="transaksiTerakhir" /></span>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map(r => (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.id}</td>
                  <td>{r.tahun}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.idDonatur}</td>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{r.namaDonatur}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(r.pendapatan)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(r.zakat)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.transaksiTerakhir}</td>
                  <td></td>
                </tr>
              ))}
            </tbody>
            {paged.length > 0 && (
              <tfoot>
                <tr>
                  <td></td><td></td><td></td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>&Sigma; Total :</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalPendapatan)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalZakat)}</td>
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
            <RefreshCw size={16} style={{ cursor: 'pointer', color: '#64748b' }} onClick={resetAll} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuktiSetor;
