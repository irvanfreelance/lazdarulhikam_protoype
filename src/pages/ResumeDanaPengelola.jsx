import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Maximize2, Minimize2, Search, Plus, Download, FileSpreadsheet, FileText, File, X
} from 'lucide-react';
import { INITIAL_PROGRAM_DP, INITIAL_TRANSAKSI_DP, KATEGORI_OPTIONS } from '../utils/resumeDanaPengelolaStore';
import { OFFICES } from '../utils/finsCoaStore';

const PAGE_SIZES = [10, 25, 50];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const ResumeDanaPengelola = () => {
  const [programDp, setProgramDp] = useState(INITIAL_PROGRAM_DP);
  const [periodeDari, setPeriodeDari] = useState('2026-08-01');
  const [periodeSampai, setPeriodeSampai] = useState('2026-08-09');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [dpMin, setDpMin] = useState('');
  const [dpMax, setDpMax] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [setDpOpen, setSetDpOpen] = useState(false);
  const [dpDraft, setDpDraft] = useState([]);

  const dpByProgram = useMemo(() => {
    const map = {};
    programDp.forEach(p => { map[p.program] = p; });
    return map;
  }, [programDp]);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPeriodeDari('2026-08-01');
    setPeriodeSampai('2026-08-09');
    setKeywordDraft('');
    setKeyword('');
    setDpMin('');
    setDpMax('');
    setKategoriFilter('all');
    setOfficeFilter('all');
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // 1. Filter itemized transactions by periode + kantor
  const filteredTrans = useMemo(() => INITIAL_TRANSAKSI_DP.filter(t =>
    t.tanggal >= periodeDari && t.tanggal <= periodeSampai &&
    (officeFilter === 'all' || t.officeId === officeFilter)
  ), [periodeDari, periodeSampai, officeFilter]);

  // 2. Group by program -> sum Transaksi & Quantity, compute DP from configured %
  const grouped = useMemo(() => {
    const map = new Map();
    filteredTrans.forEach(t => {
      if (!map.has(t.program)) map.set(t.program, { program: t.program, transaksi: 0, quantity: 0 });
      const g = map.get(t.program);
      g.transaksi += t.nominal;
      g.quantity += t.quantity;
    });
    return Array.from(map.values()).map(g => {
      const cfg = dpByProgram[g.program];
      const dpPercent = cfg?.dpPercent ?? 0;
      const dana = g.transaksi * (dpPercent / 100);
      return { ...g, kategori: cfg?.kategori || '-', dpPercent, dana };
    });
  }, [filteredTrans, dpByProgram]);

  // 3. Apply keyword / kategori / %DP range filters, sort alphabetically
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const min = dpMin === '' ? null : parseFloat(dpMin);
    const max = dpMax === '' ? null : parseFloat(dpMax);
    return grouped
      .filter(g => !k || g.program.toLowerCase().includes(k))
      .filter(g => kategoriFilter === 'all' || g.kategori === kategoriFilter)
      .filter(g => (min === null || g.dpPercent >= min) && (max === null || g.dpPercent <= max))
      .sort((a, b) => a.program.localeCompare(b.program));
  }, [grouped, keyword, kategoriFilter, dpMin, dpMax]);

  const totals = filtered.reduce((acc, g) => ({
    transaksi: acc.transaksi + g.transaksi,
    quantity: acc.quantity + g.quantity,
    dana: acc.dana + g.dana
  }), { transaksi: 0, quantity: 0, dana: 0 });
  const totalPct = totals.transaksi > 0 ? (totals.dana / totals.transaksi) * 100 : 0;

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openSetDp = () => {
    setDpDraft(programDp.map(p => ({ ...p })));
    setSetDpOpen(true);
  };
  const updateDraftPercent = (program, val) => {
    setDpDraft(prev => prev.map(p => p.program === program ? { ...p, dpPercent: val } : p));
  };
  const saveSetDp = () => {
    const parsed = dpDraft.map(p => ({ ...p, dpPercent: parseFloat(p.dpPercent) || 0 }));
    setProgramDp(parsed);
    setSetDpOpen(false);
  };

  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ marginBottom: 0 }}>Resume Dana Pengelola</h1>
          <button onClick={handleRefresh} title="Reset filter" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}>
            <RefreshCw size={20} className={isRefreshing ? 'icon-spin' : ''} />
          </button>
        </div>
        <button onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? 'Keluar layar penuh' : 'Perbesar layar penuh'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* FILTER ROW 1 */}
      <div className="filters-row">
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '8px' }}>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>Periode</span>
            <input type="date" value={periodeDari} onChange={e => { setPeriodeDari(e.target.value); setPage(1); }} />
            <span style={{ fontSize: '0.8rem' }}>s/d</span>
            <input type="date" value={periodeSampai} onChange={e => { setPeriodeSampai(e.target.value); setPage(1); }} />
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
          <button className="btn btn-primary" onClick={openSetDp}>
            <Plus size={16} /> Set DP
          </button>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>% DP</span>
            <input type="number" style={{ width: '64px' }} placeholder="0" value={dpMin} onChange={e => { setDpMin(e.target.value); setPage(1); }} />
            <span style={{ fontSize: '0.8rem' }}>s/d</span>
            <input type="number" style={{ width: '64px' }} placeholder="100" value={dpMax} onChange={e => { setDpMax(e.target.value); setPage(1); }} />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={kategoriFilter} onChange={e => { setKategoriFilter(e.target.value); setPage(1); }}>
            <option value="all">Zakat, Infaq Shodaqoh</option>
            {KATEGORI_OPTIONS.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={officeFilter} onChange={e => { setOfficeFilter(e.target.value); setPage(1); }}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      {/* FILTER ROW 2 */}
      <div className="filters-row">
        <div className="filters-left">
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
        </div>
      </div>

      {/* TABLE */}
      <div className="data-table-container">
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', padding: '16px 20px' }}>Resume Transaksi Dana Pengelola</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Program</th>
              <th style={{ textAlign: 'right' }}>Σ Transaksi [T]</th>
              <th style={{ textAlign: 'right' }}>Σ Quantity</th>
              <th style={{ textAlign: 'right' }}>Σ Dana Pengelola [DP]</th>
              <th style={{ textAlign: 'right' }}>% DP/T</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data untuk filter ini</td></tr>
            )}
            {paged.map(g => (
              <tr key={g.program}>
                <td style={{ fontWeight: 500 }}>{g.program}</td>
                <td style={{ textAlign: 'right' }}>{fmt(g.transaksi)}</td>
                <td style={{ textAlign: 'right' }}>{g.quantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(g.dana)}</td>
                <td style={{ textAlign: 'right' }}>{fmt(g.dpPercent)}</td>
              </tr>
            ))}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td>Σ Total :</td>
                <td style={{ textAlign: 'right' }}>{fmt(totals.transaksi)}</td>
                <td style={{ textAlign: 'right' }}>{totals.quantity}</td>
                <td style={{ textAlign: 'right' }}>{fmt(totals.dana)}</td>
                <td style={{ textAlign: 'right' }}>{fmt(totalPct)}</td>
              </tr>
            </tfoot>
          )}
        </table>

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

      {/* MODAL: SET DP */}
      {setDpOpen && (
        <div className="modal-backdrop">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Set % Dana Pengelola per Program</h2>
              <button className="modal-close" onClick={() => setSetDpOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Kategori</th>
                    <th style={{ textAlign: 'right' }}>% DP</th>
                  </tr>
                </thead>
                <tbody>
                  {dpDraft.map(p => (
                    <tr key={p.program}>
                      <td>{p.program}</td>
                      <td>{p.kategori}</td>
                      <td style={{ textAlign: 'right' }}>
                        <input
                          type="number" min="0" max="100" step="0.01" className="form-input"
                          style={{ width: '100px', textAlign: 'right', marginLeft: 'auto' }}
                          value={p.dpPercent}
                          onChange={e => updateDraftPercent(p.program, e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setSetDpOpen(false)}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={saveSetDp}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeDanaPengelola;
