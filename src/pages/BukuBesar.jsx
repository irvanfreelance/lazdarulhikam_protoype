import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Maximize2, Minimize2, Search, Download, FileSpreadsheet, FileText, File,
  ChevronDown, ChevronUp
} from 'lucide-react';
import {
  INITIAL_BUKU_BESAR, GROUP_BY_OPTIONS, SALDO_AWAL_VIA_OPTIONS, CLOSING_SALDO_AWAL,
  INITIAL_JURNAL_MANUAL
} from '../utils/finsLedgerStore';
import { INITIAL_COA, OFFICES } from '../utils/finsCoaStore';
import { formatRupiah } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const todayStr = () => new Date().toISOString().substring(0, 10);
const firstOfMonthStr = () => todayStr().substring(0, 8) + '01';

const BukuBesar = () => {
  const [periodeDari, setPeriodeDari] = useState(firstOfMonthStr());
  const [periodeSampai, setPeriodeSampai] = useState(todayStr());
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [coaFilter, setCoaFilter] = useState('');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [groupBy, setGroupBy] = useState(GROUP_BY_OPTIONS[0]);
  const [saldoAwalVia, setSaldoAwalVia] = useState('closing');
  const [saldoAwalManual, setSaldoAwalManual] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [jurnalOpen, setJurnalOpen] = useState(false);

  const coaByCode = useMemo(() => {
    const map = {};
    INITIAL_COA.forEach(c => { map[c.coa] = c; });
    return map;
  }, []);

  const officeById = useMemo(() => {
    const map = {};
    OFFICES.forEach(o => { map[o.id] = o.nama; });
    return map;
  }, []);

  const coaOptions = useMemo(() => INITIAL_COA
    .filter(c => c.includeBuku)
    .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };
  const resetPage = (setter) => (val) => { setter(val); setPage(1); };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPeriodeDari(firstOfMonthStr());
    setPeriodeSampai(todayStr());
    setKeywordDraft('');
    setKeyword('');
    setCoaFilter('');
    setOfficeFilter('all');
    setGroupBy(GROUP_BY_OPTIONS[0]);
    setSaldoAwalVia('closing');
    setSaldoAwalManual('');
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // 1. Filter
  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return INITIAL_BUKU_BESAR.filter(row => {
      const matchesPeriode = row.tanggal >= periodeDari && row.tanggal <= periodeSampai;
      const matchesKeyword = !k ||
        row.jenisTransaksi.toLowerCase().includes(k) ||
        row.keterangan.toLowerCase().includes(k) ||
        row.coa.toLowerCase().includes(k) ||
        row.noResi.toLowerCase().includes(k) ||
        row.idTransaksi.toLowerCase().includes(k);
      const matchesCoa = !coaFilter || row.coa === coaFilter;
      const matchesOffice = officeFilter === 'all' || row.officeId === officeFilter;
      return matchesPeriode && matchesKeyword && matchesCoa && matchesOffice;
    });
  }, [periodeDari, periodeSampai, keyword, coaFilter, officeFilter]);

  // 2. Group + sort (grouping just changes display order; a divider row marks each new group)
  const groupKeyOf = (row) => {
    if (groupBy === 'ID Buku Perhari') return row.tanggal;
    if (groupBy === 'COA') return `${row.coa} — ${coaByCode[row.coa]?.nama || ''}`;
    return officeById[row.officeId] || '-';
  };

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ga = groupKeyOf(a);
      const gb = groupKeyOf(b);
      if (ga !== gb) return ga < gb ? -1 : 1;
      return a.tanggal === b.tanggal ? a.id.localeCompare(b.id) : (a.tanggal < b.tanggal ? -1 : 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, groupBy]);

  // 3. Running saldo (computed over the full sorted list, before pagination)
  const effectiveSaldoAwal = saldoAwalVia === 'manual' ? (parseFloat(saldoAwalManual) || 0) : CLOSING_SALDO_AWAL;

  const withSaldo = useMemo(() => {
    let running = effectiveSaldoAwal;
    return sorted.map(row => {
      running = running + row.debet - row.kredit;
      return { ...row, saldo: running, groupKey: groupKeyOf(row) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, effectiveSaldoAwal]);

  const totals = useMemo(() => filtered.reduce((acc, r) => ({
    debet: acc.debet + r.debet,
    kredit: acc.kredit + r.kredit
  }), { debet: 0, kredit: 0 }), [filtered]);

  // 4. Paginate
  const totalPages = Math.max(1, Math.ceil(withSaldo.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = withSaldo.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ marginBottom: 0 }}>Buku Besar</h1>
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
        <div className="filters-right">
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>Group By</span>
            <select value={groupBy} onChange={e => resetPage(setGroupBy)(e.target.value)}>
              {GROUP_BY_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={officeFilter} onChange={e => resetPage(setOfficeFilter)(e.target.value)}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      {/* FILTER ROW 2 */}
      <div className="filters-row">
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '8px' }}>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>Periode</span>
            <input type="date" value={periodeDari} onChange={e => resetPage(setPeriodeDari)(e.target.value)} />
            <span style={{ fontSize: '0.8rem' }}>s/d</span>
            <input type="date" value={periodeSampai} onChange={e => resetPage(setPeriodeSampai)(e.target.value)} />
          </div>
          <div style={{ width: '220px' }}>
            <SearchableSelect
              className="form-select"
              options={[{ value: '', label: 'Semua Akun' }, ...coaOptions]}
              value={coaFilter}
              onChange={resetPage(setCoaFilter)}
              placeholder="Nama Akun"
            />
          </div>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>Saldo Awal Via</span>
            <select value={saldoAwalVia} onChange={e => setSaldoAwalVia(e.target.value)}>
              {SALDO_AWAL_VIA_OPTIONS.map(o => <option key={o} value={o.toLowerCase()}>{o}</option>)}
            </select>
          </div>
          <input
            type="number"
            className="form-input"
            style={{ width: '160px' }}
            placeholder="Saldo awal manual"
            disabled={saldoAwalVia !== 'manual'}
            value={saldoAwalManual}
            onChange={e => setSaldoAwalManual(e.target.value)}
          />
        </div>
      </div>

      {/* REPORT HEADER */}
      <div className="data-table-container" style={{ padding: '24px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.03em' }}>LAZ DARUL HIKAM</div>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', margin: '4px 0' }}>BUKU BESAR</div>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>PERIODE {periodeDari} S/D {periodeSampai}</div>
      </div>

      {/* TABLE */}
      <div className="data-table-container">
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', padding: '16px 20px 0' }}>Buku Besar</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>COA</th>
              <th>Jenis Transaksi</th>
              <th style={{ textAlign: 'right' }}>Debet</th>
              <th style={{ textAlign: 'right' }}>Kredit</th>
              <th style={{ textAlign: 'right' }}>Saldo</th>
              <th>Keterangan</th>
              <th>No Resi</th>
              <th>ID Buku</th>
              <th>ID Transaksi</th>
              <th>Kantor</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={11} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data untuk filter ini</td></tr>
            )}
            {paged.map((row, idx) => {
              const prevGroupKey = idx > 0 ? paged[idx - 1].groupKey : null;
              const showGroupDivider = row.groupKey !== prevGroupKey;
              return (
                <React.Fragment key={row.id}>
                  {showGroupDivider && (
                    <tr>
                      <td colSpan={11} style={{ background: '#f1f5f9', fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>
                        {groupBy}: {row.groupKey}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td>{row.tanggal}</td>
                    <td style={{ fontFamily: 'monospace' }}>{row.coa}</td>
                    <td>{row.jenisTransaksi}</td>
                    <td style={{ textAlign: 'right' }}>{row.debet > 0 ? formatRupiah(row.debet) : '0,00'}</td>
                    <td style={{ textAlign: 'right' }}>{row.kredit > 0 ? formatRupiah(row.kredit) : '0,00'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(row.saldo)}</td>
                    <td style={{ maxWidth: '220px' }}>{row.keterangan}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.noResi || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.idBuku}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.idTransaksi}</td>
                    <td>{officeById[row.officeId] || '-'}</td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td colSpan={3}>Σ Total :</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(totals.debet)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(totals.kredit)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(totals.debet - totals.kredit)}</td>
                <td colSpan={5}></td>
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
          </div>
        </div>
      </div>

      {/* JURNAL (collapsible) */}
      <div className="data-table-container" style={{ marginTop: '16px' }}>
        <div
          onClick={() => setJurnalOpen(o => !o)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', cursor: 'pointer' }}
        >
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Jurnal</h3>
          {jurnalOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
        {jurnalOpen && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>No Jurnal</th>
                <th>Keterangan</th>
                <th>COA Debet</th>
                <th>COA Kredit</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>Dibuat Oleh</th>
              </tr>
            </thead>
            <tbody>
              {INITIAL_JURNAL_MANUAL.map(j => (
                <tr key={j.id}>
                  <td>{j.tanggal}</td>
                  <td style={{ fontFamily: 'monospace' }}>{j.noJurnal}</td>
                  <td>{j.keterangan}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{j.coaDebet}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{j.coaKredit}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(j.nominal)}</td>
                  <td>{j.dibuatOleh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BukuBesar;
