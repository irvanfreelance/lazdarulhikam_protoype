import React, { useMemo, useState } from 'react';
import {
  Wallet, Hash, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, ExternalLink,
  Calendar, Clock, Users, Search, Download, FileSpreadsheet, FileText, File,
  ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import { INITIAL_TRANSAKSI, PROGRAM_TRANSAKSI, STATUS_TRANSAKSI_OPTIONS } from '../utils/crmTransaksiStore';
import { HBarList, TrendBars } from '../components/charts/SimpleCharts';
import SearchableSelect from '../components/SearchableSelect';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
const fmtRp = (n) => `Rp ${fmt(n)}`;

const TABS = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'report', label: 'Report' },
];

// --- Tab: Ringkasan (dulu halaman "Analisa Transaksi") ---
const RingkasanTab = () => {
  const years = useMemo(() => [...new Set(INITIAL_TRANSAKSI.map(t => t.tglTransaksi.slice(0, 4)))].sort(), []);
  const kantorOptions = useMemo(() => [...new Set(INITIAL_TRANSAKSI.map(t => t.kantorTransaksi))].sort(), []);

  const [tahun, setTahun] = useState(years[years.length - 1] || '2026');
  const [kantor, setKantor] = useState('');
  const [status, setStatus] = useState('Approved');

  const resetAll = () => { setTahun(years[years.length - 1] || '2026'); setKantor(''); setStatus('Approved'); };

  const scoped = useMemo(() => INITIAL_TRANSAKSI.filter(t =>
    t.tglTransaksi.slice(0, 4) === tahun
    && (!kantor || t.kantorTransaksi === kantor)
    && (!status || t.status === status)
  ), [tahun, kantor, status]);

  const totalNominal = scoped.reduce((s, t) => s + t.nominal * t.qty, 0);
  const jumlahTransaksi = scoped.length;
  const rataRata = jumlahTransaksi > 0 ? totalNominal / jumlahTransaksi : 0;

  const perBulanArr = useMemo(() => {
    const sums = Array(12).fill(0);
    scoped.forEach(t => { sums[Number(t.tglTransaksi.slice(5, 7)) - 1] += t.nominal * t.qty; });
    return sums;
  }, [scoped]);

  const { growthPct, lastMonthLabel } = useMemo(() => {
    const withData = perBulanArr.map((v, i) => ({ i, v })).filter(x => x.v > 0);
    if (withData.length < 2) return { growthPct: null, lastMonthLabel: '' };
    const last = withData[withData.length - 1];
    const prev = withData[withData.length - 2];
    const pct = prev.v > 0 ? ((last.v - prev.v) / prev.v) * 100 : 0;
    return { growthPct: pct, lastMonthLabel: MONTHS[last.i] };
  }, [perBulanArr]);

  const trendPerBulan = perBulanArr.map((v, i) => ({ label: MONTHS[i], value: v }));

  const byProgram = useMemo(() => {
    const groups = {};
    scoped.forEach(t => { groups[t.program] = (groups[t.program] || 0) + t.nominal * t.qty; });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [scoped]);

  const byJenis = useMemo(() => {
    const groups = { Bank: 0, Cash: 0 };
    scoped.forEach(t => { groups[t.jenisTransaksi] = (groups[t.jenisTransaksi] || 0) + t.nominal * t.qty; });
    return Object.entries(groups).map(([label, value]) => ({ label, value }));
  }, [scoped]);

  const byViaHimpun = useMemo(() => {
    const groups = {};
    scoped.forEach(t => { groups[t.viaHimpun] = (groups[t.viaHimpun] || 0) + t.nominal * t.qty; });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [scoped]);

  const programSummary = useMemo(() => {
    return PROGRAM_TRANSAKSI.map(p => {
      const rows = scoped.filter(t => t.program === p.nama);
      const total = rows.reduce((s, t) => s + t.nominal * t.qty, 0);
      return { nama: p.nama, jumlah: rows.length, total, rataRata: rows.length > 0 ? total / rows.length : 0 };
    }).filter(p => p.jumlah > 0).sort((a, b) => b.total - a.total);
  }, [scoped]);

  return (
    <>
      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tahun:</span>
          <select className="form-select" style={{ width: 'auto' }} value={tahun} onChange={e => setTahun(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Kantor:</span>
          <select className="form-select" style={{ width: 'auto' }} value={kantor} onChange={e => setKantor(e.target.value)}>
            <option value="">Semua Kantor</option>
            {kantorOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
          <select className="form-select" style={{ width: 'auto' }} value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Semua Status</option>
            {STATUS_TRANSAKSI_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="filters-right">
          <RefreshCw size={16} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Wallet size={20} /></div>
            <div className="stat-title">Total Nominal</div>
          </div>
          <div className="stat-value">{fmtRp(totalNominal)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><Hash size={20} /></div>
            <div className="stat-title">Jumlah Transaksi</div>
          </div>
          <div className="stat-value">{fmt(jumlahTransaksi)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><TrendingUp size={20} /></div>
            <div className="stat-title">Rata-rata / Transaksi</div>
          </div>
          <div className="stat-value">{fmtRp(rataRata)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: growthPct >= 0 ? '#d1fae5' : '#fee2e2', color: growthPct >= 0 ? '#10b981' : '#ef4444' }}>
              {growthPct === null ? <TrendingUp size={20} /> : growthPct >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
            </div>
            <div className="stat-title">Growth MoM {lastMonthLabel && `(${lastMonthLabel})`}</div>
          </div>
          <div className="stat-value">{growthPct === null ? '-' : `${growthPct >= 0 ? '+' : ''}${growthPct.toFixed(1)}%`}</div>
        </div>
      </div>

      <div className="data-table-container" style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Nominal Transaksi per Bulan ({tahun})</div>
        <TrendBars data={trendPerBulan} valueFormatter={fmtRp} height={180} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Breakdown per Program</div>
          <HBarList data={byProgram} valueFormatter={fmtRp} />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Bank vs Cash</div>
          <HBarList data={byJenis} valueFormatter={fmtRp} color="#eb6834" />
          <div style={{ fontWeight: 700, padding: '20px 4px 16px' }}>Via Himpun</div>
          <HBarList data={byViaHimpun} valueFormatter={fmtRp} maxItems={5} />
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Ringkasan per Program</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Program</th>
                <th style={{ textAlign: 'right' }}>Jml Transaksi</th>
                <th style={{ textAlign: 'right' }}>Total Nominal</th>
                <th style={{ textAlign: 'right' }}>Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {programSummary.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {programSummary.map(p => (
                <tr key={p.nama}>
                  <td style={{ fontWeight: 500 }}>{p.nama}</td>
                  <td style={{ textAlign: 'right' }}>{p.jumlah}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtRp(p.total)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtRp(p.rataRata)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// --- Tab: Dashboard (dulu halaman "Dashboard Transaksi") ---
// Dashboards read "hari ini" relative to the most recent transaction in the
// dataset, not the real wall clock — the seed data is frozen in time, so
// anchoring to actual "now" would always show an empty day.
const DashboardTab = () => {
  const approved = useMemo(() => INITIAL_TRANSAKSI.filter(t => t.status === 'Approved'), []);
  const latestDate = useMemo(() => approved.reduce((max, t) => t.tglTransaksi > max ? t.tglTransaksi : max, ''), [approved]).slice(0, 10);
  const latestMonthKey = latestDate.slice(0, 7);

  const hariIni = approved.filter(t => t.tglTransaksi.slice(0, 10) === latestDate);
  const bulanIni = approved.filter(t => t.tglTransaksi.slice(0, 7) === latestMonthKey);
  const pendingCount = INITIAL_TRANSAKSI.filter(t => t.status === 'Pending').length;
  const donaturAktifBulanIni = new Set(bulanIni.map(t => t.idDonatur)).size;

  const totalHariIni = hariIni.reduce((s, t) => s + t.nominal * t.qty, 0);
  const totalBulanIni = bulanIni.reduce((s, t) => s + t.nominal * t.qty, 0);
  const TARGET_BULANAN = 120000000;
  const targetPct = Math.min(100, (totalBulanIni / TARGET_BULANAN) * 100);

  const last6Months = useMemo(() => {
    if (!latestMonthKey) return [];
    const [ly, lm] = latestMonthKey.split('-').map(Number);
    const arr = [];
    for (let i = 5; i >= 0; i--) {
      let m = lm - i, y = ly;
      while (m <= 0) { m += 12; y -= 1; }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      const sum = approved.filter(t => t.tglTransaksi.slice(0, 7) === key).reduce((s, t) => s + t.nominal * t.qty, 0);
      arr.push({ label: MONTHS[m - 1], value: sum });
    }
    return arr;
  }, [approved, latestMonthKey]);

  const top5Program = useMemo(() => {
    const groups = {};
    bulanIni.forEach(t => { groups[t.program] = (groups[t.program] || 0) + t.nominal * t.qty; });
    return Object.entries(groups).map(([nama, total]) => ({ nama, total })).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [bulanIni]);

  const recent = useMemo(() => [...INITIAL_TRANSAKSI].sort((a, b) => b.tglTransaksi.localeCompare(a.tglTransaksi)).slice(0, 10), []);

  const [ly, lm, ld] = latestDate ? latestDate.split('-') : ['-', '-', '-'];
  const latestLabel = latestDate ? `${ld} ${MONTHS_FULL[Number(lm) - 1]} ${ly}` : '-';

  return (
    <>
      <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 16px' }}>Ringkasan penghimpunan real-time — data per {latestLabel}</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Calendar size={20} /></div>
            <div className="stat-title">Himpunan Hari Ini</div>
          </div>
          <div className="stat-value">{fmtRp(totalHariIni)}</div>
          <div className="stat-change" style={{ color: '#64748b' }}>{hariIni.length} transaksi</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><Wallet size={20} /></div>
            <div className="stat-title">Himpunan Bulan Ini</div>
          </div>
          <div className="stat-value">{fmtRp(totalBulanIni)}</div>
          <div className="stat-change" style={{ color: '#64748b' }}>{targetPct.toFixed(0)}% dari target {fmtRp(TARGET_BULANAN)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={20} /></div>
            <div className="stat-title">Transaksi Pending</div>
          </div>
          <div className="stat-value">{fmt(pendingCount)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><Users size={20} /></div>
            <div className="stat-title">Donatur Aktif Bulan Ini</div>
          </div>
          <div className="stat-value">{fmt(donaturAktifBulanIni)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 6px' }}>Tren 6 Bulan Terakhir</div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', padding: '0 4px 16px' }}>Total himpunan (status Approved)</div>
          <TrendBars data={last6Months} valueFormatter={fmtRp} height={180} />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 14px' }}>Top 5 Program (Bulan Ini)</div>
          {top5Program.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '0.85rem' }}>Belum ada data</div>}
          {top5Program.map((p, i) => (
            <div key={p.nama} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 4px', borderBottom: i < top5Program.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{i + 1}. {p.nama}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{fmtRp(p.total)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Transaksi Terbaru</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Donatur</th>
                <th>Program</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(t => (
                <tr key={t.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{t.tglTransaksi}</td>
                  <td style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{t.namaDonatur}</td>
                  <td>{t.program}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtRp(t.nominal * t.qty)}</td>
                  <td>
                    <span className={`status-badge ${t.status === 'Approved' ? 'status-success' : t.status === 'Pending' ? 'status-warning' : 'status-danger'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// --- Tab: Report (dulu halaman "Report Transaksi") ---
const ReportTab = () => {
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
    <>
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
          <RefreshCw size={16} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
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
              {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s} / halaman</option>)}
            </select>
            <button disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
            <button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>
    </>
  );
};

const AnalisaTransaksi = () => {
  const [tab, setTab] = useState('ringkasan');

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Analisa Transaksi</h1>
          <p>Ringkasan, dashboard real-time, dan report detail transaksi donasi dalam satu tempat</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              borderRadius: '999px', padding: '9px 22px', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem',
              background: tab === t.key ? 'var(--primary-color)' : '#ffffff',
              color: tab === t.key ? '#ffffff' : '#9d174d',
              boxShadow: tab === t.key ? '0 6px 14px -6px rgba(157, 23, 77, 0.5)' : '0 2px 6px -4px rgba(157, 23, 77, 0.3)',
              border: tab === t.key ? 'none' : '1px solid #fce7f3',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'ringkasan' && <RingkasanTab />}
      {tab === 'dashboard' && <DashboardTab />}
      {tab === 'report' && <ReportTab />}
    </div>
  );
};

export default AnalisaTransaksi;
