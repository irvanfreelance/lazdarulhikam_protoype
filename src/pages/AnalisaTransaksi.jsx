import React, { useMemo, useState } from 'react';
import { Wallet, Hash, TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw, ExternalLink } from 'lucide-react';
import { INITIAL_TRANSAKSI, PROGRAM_TRANSAKSI, STATUS_TRANSAKSI_OPTIONS } from '../utils/crmTransaksiStore';
import { HBarList, TrendBars } from '../components/charts/SimpleCharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
const fmtRp = (n) => `Rp ${fmt(n)}`;

const AnalisaTransaksi = () => {
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
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Analisa Transaksi
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Tren nominal, breakdown program, dan channel penghimpunan</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

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
    </div>
  );
};

export default AnalisaTransaksi;
