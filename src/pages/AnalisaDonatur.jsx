import React, { useMemo, useState } from 'react';
import { Users, UserCheck, UserPlus, Repeat, RefreshCw, ExternalLink } from 'lucide-react';
import { INITIAL_DONATUR } from '../utils/donaturStore';
import { HBarList, TrendBars } from '../components/charts/SimpleCharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);
const fmtRp = (n) => `Rp ${fmt(n)}`;

const AnalisaDonatur = () => {
  const years = useMemo(() => [...new Set(INITIAL_DONATUR.map(d => d.tglReg.slice(0, 4)))].sort(), []);
  const kantorOptions = useMemo(() => [...new Set(INITIAL_DONATUR.map(d => d.kantor).filter(Boolean))].sort(), []);
  const timCrmOptions = useMemo(() => [...new Set(INITIAL_DONATUR.map(d => d.timCrm).filter(Boolean))].sort(), []);

  const [tahun, setTahun] = useState(years[years.length - 1] || '2026');
  const [kantor, setKantor] = useState('');
  const [timCrm, setTimCrm] = useState('');

  const resetAll = () => { setTahun(years[years.length - 1] || '2026'); setKantor(''); setTimCrm(''); };

  const scoped = useMemo(() => INITIAL_DONATUR.filter(d =>
    (!kantor || d.kantor === kantor) && (!timCrm || d.timCrm === timCrm)
  ), [kantor, timCrm]);

  const inYear = useMemo(() => scoped.filter(d => d.tglReg.slice(0, 4) === tahun), [scoped, tahun]);

  const totalDonatur = scoped.length;
  const donaturAktif = scoped.filter(d => d.aktif === 'y').length;
  const donaturBaru = inYear.length;
  const withTx = scoped.filter(d => d.jumlahTransaksi > 0).length;
  const repeatTx = scoped.filter(d => d.jumlahTransaksi > 1).length;
  const retensiPct = withTx > 0 ? (repeatTx / withTx) * 100 : 0;

  const trendPerBulan = useMemo(() => {
    const counts = Array(12).fill(0);
    inYear.forEach(d => { counts[Number(d.tglReg.slice(5, 7)) - 1]++; });
    return counts.map((v, i) => ({ label: MONTHS[i], value: v }));
  }, [inYear]);

  const byJenisDonatur = useMemo(() => {
    const groups = {};
    scoped.forEach(d => { groups[d.jenisDonatur] = (groups[d.jenisDonatur] || 0) + 1; });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [scoped]);

  const byKantor = useMemo(() => {
    const groups = {};
    scoped.forEach(d => { groups[d.kantor] = (groups[d.kantor] || 0) + 1; });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [scoped]);

  const byMinat = useMemo(() => {
    const groups = {};
    scoped.forEach(d => { if (d.minatProgram) groups[d.minatProgram] = (groups[d.minatProgram] || 0) + 1; });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [scoped]);

  const topDonatur = useMemo(() =>
    [...scoped].sort((a, b) => b.totalTransaksi - a.totalTransaksi).slice(0, 10),
    [scoped]
  );

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Analisa Donatur
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Segmentasi, tren registrasi, dan retensi donatur</p>
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
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tim CRM:</span>
          <select className="form-select" style={{ width: 'auto' }} value={timCrm} onChange={e => setTimCrm(e.target.value)}>
            <option value="">Semua Tim</option>
            {timCrmOptions.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Users size={20} /></div>
            <div className="stat-title">Total Donatur</div>
          </div>
          <div className="stat-value">{fmt(totalDonatur)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><UserCheck size={20} /></div>
            <div className="stat-title">Donatur Aktif</div>
          </div>
          <div className="stat-value">{fmt(donaturAktif)} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>({totalDonatur > 0 ? ((donaturAktif / totalDonatur) * 100).toFixed(0) : 0}%)</span></div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><UserPlus size={20} /></div>
            <div className="stat-title">Donatur Baru ({tahun})</div>
          </div>
          <div className="stat-value">{fmt(donaturBaru)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><Repeat size={20} /></div>
            <div className="stat-title">Retensi (Transaksi Berulang)</div>
          </div>
          <div className="stat-value">{retensiPct.toFixed(0)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Donatur Baru per Bulan ({tahun})</div>
          <TrendBars data={trendPerBulan} />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Distribusi Jenis Donatur</div>
          <HBarList data={byJenisDonatur} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Distribusi per Kantor</div>
          <HBarList data={byKantor} />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Distribusi Minat Program</div>
          <HBarList data={byMinat} emptyLabel="Belum ada data minat program" />
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Top 10 Donatur (by Total Transaksi)</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Donatur</th>
                <th>Kantor</th>
                <th>Tim CRM</th>
                <th style={{ textAlign: 'right' }}>Jml Transaksi</th>
                <th style={{ textAlign: 'right' }}>Total Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {topDonatur.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {topDonatur.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>{d.nama}</td>
                  <td>{d.kantor}</td>
                  <td>{d.timCrm || '-'}</td>
                  <td style={{ textAlign: 'right' }}>{d.jumlahTransaksi}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmtRp(d.totalTransaksi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalisaDonatur;
