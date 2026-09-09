import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, Scale, Percent, RefreshCw, ExternalLink } from 'lucide-react';
import { INITIAL_TRANSAKSI } from '../utils/crmTransaksiStore';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';
import { GroupedTrendBars } from '../components/charts/SimpleCharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const HimpunVsSalur = () => {
  const [data, setData] = useState(() => getAccountingData());
  useEffect(() => { setData(getAccountingData()); }, []);

  const years = useMemo(() => {
    const himpunYears = INITIAL_TRANSAKSI.map(t => t.tglTransaksi.slice(0, 4));
    const salurYears = data.disbursementRequests.filter(r => r.tgl_realisasi).map(r => r.tgl_realisasi.slice(0, 4));
    return [...new Set([...himpunYears, ...salurYears])].sort();
  }, [data]);

  const [tahun, setTahun] = useState(years[years.length - 1] || '2026');

  const perBulan = useMemo(() => {
    const himpun = Array(12).fill(0);
    INITIAL_TRANSAKSI.filter(t => t.status === 'Approved' && t.tglTransaksi.slice(0, 4) === tahun)
      .forEach(t => { himpun[Number(t.tglTransaksi.slice(5, 7)) - 1] += t.nominal * t.qty; });

    const salur = Array(12).fill(0);
    data.disbursementRequests.filter(r => r.status === 'disbursed' && r.tgl_realisasi && r.tgl_realisasi.slice(0, 4) === tahun)
      .forEach(r => { salur[Number(r.tgl_realisasi.slice(5, 7)) - 1] += (r.jumlah_disetujui || r.jumlah_diajukan); });

    let cumHimpun = 0, cumSalur = 0;
    return MONTHS.map((label, i) => {
      cumHimpun += himpun[i]; cumSalur += salur[i];
      return { label, himpun: himpun[i], salur: salur[i], cumHimpun, cumSalur };
    });
  }, [tahun, data]);

  const totalHimpun = perBulan.reduce((s, m) => s + m.himpun, 0);
  const totalSalur = perBulan.reduce((s, m) => s + m.salur, 0);
  const net = totalHimpun - totalSalur;
  const rasio = totalHimpun > 0 ? (totalSalur / totalHimpun) * 100 : 0;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Himpun Vs Salur
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Refresh data" onClick={() => setData(getAccountingData())} />
          </h1>
          <p>Perbandingan penghimpunan dana (CRM) dengan realisasi penyaluran (Penyaluran)</p>
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
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><ArrowDownCircle size={20} /></div>
            <div className="stat-title">Total Himpun</div>
          </div>
          <div className="stat-value">{formatRupiah(totalHimpun)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#ffedd5', color: '#c2410c' }}><ArrowUpCircle size={20} /></div>
            <div className="stat-title">Total Salur</div>
          </div>
          <div className="stat-value">{formatRupiah(totalSalur)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><Scale size={20} /></div>
            <div className="stat-title">Net (Himpun - Salur)</div>
          </div>
          <div className="stat-value">{formatRupiah(net)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><Percent size={20} /></div>
            <div className="stat-title">Rasio Salur / Himpun</div>
          </div>
          <div className="stat-value">{rasio.toFixed(1)}%</div>
        </div>
      </div>

      <div className="data-table-container" style={{ marginBottom: '16px' }}>
        <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Himpun vs Salur per Bulan ({tahun})</div>
        <GroupedTrendBars
          data={perBulan}
          seriesA={{ key: 'himpun', label: 'Himpun' }}
          seriesB={{ key: 'salur', label: 'Salur' }}
          valueFormatter={formatRupiah}
        />
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Rekap Bulanan</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Bulan</th>
                <th style={{ textAlign: 'right' }}>Himpun</th>
                <th style={{ textAlign: 'right' }}>Salur</th>
                <th style={{ textAlign: 'right' }}>Net Bulanan</th>
                <th style={{ textAlign: 'right' }}>Himpun Kumulatif</th>
                <th style={{ textAlign: 'right' }}>Salur Kumulatif</th>
              </tr>
            </thead>
            <tbody>
              {perBulan.map(m => (
                <tr key={m.label}>
                  <td style={{ fontWeight: 500 }}>{m.label}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(m.himpun)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(m.salur)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(m.himpun - m.salur)}</td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>{formatRupiah(m.cumHimpun)}</td>
                  <td style={{ textAlign: 'right', color: '#64748b' }}>{formatRupiah(m.cumSalur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HimpunVsSalur;
