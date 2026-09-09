import React, { useMemo, useState } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';
import { INITIAL_DONATUR } from '../utils/donaturStore';
import { FunnelChart, HBarList } from '../components/charts/SimpleCharts';

const ROUTINE_KESEDIAAN = ['Rutin Bulanan', 'Rutin Mingguan'];
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(n || 0);

const TransaksiFunnel = () => {
  const years = useMemo(() => [...new Set(INITIAL_DONATUR.map(d => d.tglReg.slice(0, 4)))].sort(), []);
  const kantorOptions = useMemo(() => [...new Set(INITIAL_DONATUR.map(d => d.kantor).filter(Boolean))].sort(), []);
  const timCrmOptions = useMemo(() => [...new Set(INITIAL_DONATUR.map(d => d.timCrm).filter(Boolean))].sort(), []);

  const [tahun, setTahun] = useState('');
  const [kantor, setKantor] = useState('');
  const [timCrm, setTimCrm] = useState('');

  const resetAll = () => { setTahun(''); setKantor(''); setTimCrm(''); };

  const scoped = useMemo(() => INITIAL_DONATUR.filter(d =>
    (!tahun || d.tglReg.slice(0, 4) === tahun)
    && (!kantor || d.kantor === kantor)
    && (!timCrm || d.timCrm === timCrm)
  ), [tahun, kantor, timCrm]);

  const stageRegistrasi = scoped.length;
  const stagePertama = scoped.filter(d => d.jumlahTransaksi >= 1).length;
  const stageBerulang = scoped.filter(d => d.jumlahTransaksi >= 2).length;
  const stageRutin = scoped.filter(d => ROUTINE_KESEDIAAN.includes(d.kesediaanDonasi)).length;

  const stages = [
    { label: 'Registrasi', value: stageRegistrasi },
    { label: 'Transaksi Pertama', value: stagePertama },
    { label: 'Transaksi Berulang', value: stageBerulang },
    { label: 'Donatur Rutin', value: stageRutin }
  ];

  const conversionOverall = stageRegistrasi > 0 ? (stageRutin / stageRegistrasi) * 100 : 0;

  const byKantorConversion = useMemo(() => {
    return kantorOptions.map(k => {
      const rows = scoped.filter(d => d.kantor === k);
      const rutin = rows.filter(d => ROUTINE_KESEDIAAN.includes(d.kesediaanDonasi)).length;
      const pct = rows.length > 0 ? (rutin / rows.length) * 100 : 0;
      return { label: k, value: Math.round(pct * 10) / 10 };
    }).sort((a, b) => b.value - a.value);
  }, [scoped, kantorOptions]);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Transaksi Funnel
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Konversi donatur dari registrasi hingga menjadi donatur rutin</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tahun Registrasi:</span>
          <select className="form-select" style={{ width: 'auto' }} value={tahun} onChange={e => setTahun(e.target.value)}>
            <option value="">Semua Tahun</option>
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
          <div className="stat-header"><div className="stat-title">Total Registrasi</div></div>
          <div className="stat-value">{fmt(stageRegistrasi)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">Jadi Donatur Rutin</div></div>
          <div className="stat-value">{fmt(stageRutin)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">Konversi Keseluruhan</div></div>
          <div className="stat-value">{conversionOverall.toFixed(1)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Funnel Konversi Donatur</div>
          <FunnelChart stages={stages} valueFormatter={fmt} />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>% Konversi Rutin per Kantor</div>
          <HBarList data={byKantorConversion} valueFormatter={v => `${v}%`} color="#1baf7a" />
        </div>
      </div>
    </div>
  );
};

export default TransaksiFunnel;
