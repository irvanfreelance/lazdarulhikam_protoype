import React, { useMemo } from 'react';
import { Wallet, TrendingUp, Calendar, Users, RefreshCw, ExternalLink } from 'lucide-react';
import { INITIAL_TRANSAKSI, PROGRAM_TRANSAKSI } from '../utils/crmTransaksiStore';
import { HBarList, TrendBars } from '../components/charts/SimpleCharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
const fmtRp = (n) => `Rp ${fmt(n)}`;

const DashboardPenghimpunan = () => {
  const approved = useMemo(() => INITIAL_TRANSAKSI.filter(t => t.status === 'Approved'), []);
  const latestMonthKey = useMemo(() => approved.reduce((max, t) => t.tglTransaksi.slice(0, 7) > max ? t.tglTransaksi.slice(0, 7) : max, ''), [approved]);
  const [latestYear, latestMonth] = latestMonthKey ? latestMonthKey.split('-').map(Number) : [null, null];

  const prevMonthKey = useMemo(() => {
    if (!latestMonthKey) return '';
    let y = latestYear, m = latestMonth - 1;
    if (m <= 0) { m = 12; y -= 1; }
    return `${y}-${String(m).padStart(2, '0')}`;
  }, [latestMonthKey, latestYear, latestMonth]);

  const prevYearKey = latestMonthKey ? `${latestYear - 1}-${String(latestMonth).padStart(2, '0')}` : '';

  const sumByMonthKey = (key) => approved.filter(t => t.tglTransaksi.slice(0, 7) === key).reduce((s, t) => s + t.nominal * t.qty, 0);

  const totalBulanIni = sumByMonthKey(latestMonthKey);
  const totalBulanLalu = sumByMonthKey(prevMonthKey);
  const totalTahunLalu = sumByMonthKey(prevYearKey);

  const growthMoM = totalBulanLalu > 0 ? ((totalBulanIni - totalBulanLalu) / totalBulanLalu) * 100 : null;
  const growthYoY = totalTahunLalu > 0 ? ((totalBulanIni - totalTahunLalu) / totalTahunLalu) * 100 : null;

  const donaturAktifBulanIni = new Set(approved.filter(t => t.tglTransaksi.slice(0, 7) === latestMonthKey).map(t => t.idDonatur)).size;

  const trend12Bulan = useMemo(() => {
    if (!latestMonthKey) return [];
    const arr = [];
    for (let i = 11; i >= 0; i--) {
      let m = latestMonth - i, y = latestYear;
      while (m <= 0) { m += 12; y -= 1; }
      const key = `${y}-${String(m).padStart(2, '0')}`;
      arr.push({ label: MONTHS[m - 1], value: sumByMonthKey(key) });
    }
    return arr;
  }, [approved, latestMonthKey, latestYear, latestMonth]);

  const perJenisDana = useMemo(() => {
    const groups = {};
    approved.filter(t => t.tglTransaksi.slice(0, 7) === latestMonthKey).forEach(t => {
      groups[t.program] = (groups[t.program] || 0) + t.nominal * t.qty;
    });
    return PROGRAM_TRANSAKSI.map(p => ({ label: p.nama, value: groups[p.nama] || 0 })).filter(p => p.value > 0).sort((a, b) => b.value - a.value);
  }, [approved, latestMonthKey]);

  const perKantor = useMemo(() => {
    const groups = {};
    approved.filter(t => t.tglTransaksi.slice(0, 7) === latestMonthKey).forEach(t => {
      groups[t.kantorTransaksi] = (groups[t.kantorTransaksi] || 0) + t.nominal * t.qty;
    });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [approved, latestMonthKey]);

  const leaderboardTimCrm = useMemo(() => {
    const groups = {};
    approved.filter(t => t.tglTransaksi.slice(0, 7) === latestMonthKey && t.timCrm).forEach(t => {
      if (!groups[t.timCrm]) groups[t.timCrm] = { nama: t.timCrm, total: 0, jumlah: 0 };
      groups[t.timCrm].total += t.nominal * t.qty;
      groups[t.timCrm].jumlah += 1;
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [approved, latestMonthKey]);

  const growthBadge = (pct) => {
    if (pct === null) return <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Data tidak mencukupi</span>;
    const positive = pct >= 0;
    return <span style={{ color: positive ? '#10b981' : '#ef4444', fontWeight: 700, fontSize: '1.4rem' }}>{positive ? '+' : ''}{pct.toFixed(1)}%</span>;
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Dashboard Penghimpunan
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Refresh" onClick={() => window.location.reload()} />
          </h1>
          <p>Ringkasan fundraising — periode {MONTHS[(latestMonth || 1) - 1]} {latestYear}</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Wallet size={20} /></div>
            <div className="stat-title">Himpunan Bulan Ini</div>
          </div>
          <div className="stat-value">{fmtRp(totalBulanIni)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><TrendingUp size={20} /></div>
            <div className="stat-title">Growth MoM</div>
          </div>
          {growthBadge(growthMoM)}
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Calendar size={20} /></div>
            <div className="stat-title">Growth YoY</div>
          </div>
          {growthBadge(growthYoY)}
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><Users size={20} /></div>
            <div className="stat-title">Donatur Aktif Bulan Ini</div>
          </div>
          <div className="stat-value">{fmt(donaturAktifBulanIni)}</div>
        </div>
      </div>

      <div className="data-table-container" style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Tren Himpunan 12 Bulan Terakhir</div>
        <TrendBars data={trend12Bulan} valueFormatter={fmtRp} height={180} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Per Jenis Dana (Bulan Ini)</div>
          <HBarList data={perJenisDana} valueFormatter={fmtRp} />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Per Kantor (Bulan Ini)</div>
          <HBarList data={perKantor} valueFormatter={fmtRp} color="#1baf7a" />
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Leaderboard Tim CRM (Bulan Ini)</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Tim CRM</th>
                <th style={{ textAlign: 'right' }}>Jml Transaksi</th>
                <th style={{ textAlign: 'right' }}>Total Himpunan</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardTimCrm.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {leaderboardTimCrm.map((t, i) => (
                <tr key={t.nama}>
                  <td style={{ fontWeight: 700 }}>#{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{t.nama}</td>
                  <td style={{ textAlign: 'right' }}>{t.jumlah}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtRp(t.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPenghimpunan;
