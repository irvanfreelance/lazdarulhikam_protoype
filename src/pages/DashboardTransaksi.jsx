import React, { useMemo } from 'react';
import { Wallet, Calendar, Clock, Users, RefreshCw, ExternalLink } from 'lucide-react';
import { INITIAL_TRANSAKSI } from '../utils/crmTransaksiStore';
import { TrendBars } from '../components/charts/SimpleCharts';

const MONTHS_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
const fmtRp = (n) => `Rp ${fmt(n)}`;

// Dashboards read "hari ini" relative to the most recent transaction in the
// dataset, not the real wall clock — the seed data is frozen in time, so
// anchoring to actual "now" would always show an empty day.
const DashboardTransaksi = () => {
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
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Dashboard Transaksi
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Refresh" onClick={() => window.location.reload()} />
          </h1>
          <p>Ringkasan penghimpunan real-time — data per {latestLabel}</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

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
    </div>
  );
};

export default DashboardTransaksi;
