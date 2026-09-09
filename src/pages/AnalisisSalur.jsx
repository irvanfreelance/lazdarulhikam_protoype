import React, { useEffect, useMemo, useState } from 'react';
import { Send, FileCheck, Clock, Percent, RefreshCw, ExternalLink } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';
import { FunnelChart, HBarList } from '../components/charts/SimpleCharts';

const CAMPAIGN_NAMES = {
  1: 'Bantuan Darurat Bencana Banjir',
  2: 'Pembangunan Masjid Pelosok',
  3: 'Beasiswa Santri Tahfidz',
  4: 'Wakaf Sumur Air Bersih',
  5: 'Operasional Panti Asuhan'
};

const ASNAF_LABELS = {
  fakir: 'Fakir', miskin: 'Miskin', amil: 'Amil', muallaf: 'Muallaf',
  riqab: 'Riqab', gharimin: 'Gharimin', fisabilillah: 'Fisabilillah', ibnu_sabil: 'Ibnu Sabil'
};

const fmtDays = (n) => `${n.toFixed(1)} hari`;

const AnalisisSalur = () => {
  const [data, setData] = useState(() => getAccountingData());
  useEffect(() => { setData(getAccountingData()); }, []);

  const totalDiajukan = data.disbursementRequests.reduce((s, r) => s + r.jumlah_diajukan, 0);
  const totalRealisasi = data.disbursementRequests.filter(r => r.status === 'disbursed').reduce((s, r) => s + (r.jumlah_disetujui || r.jumlah_diajukan), 0);
  const totalAnggaran = data.campaignBudgets.reduce((s, c) => s + c.budget, 0);
  const pctRealisasi = totalAnggaran > 0 ? Math.min(100, (totalRealisasi / totalAnggaran) * 100) : 0;

  const avgProcessDays = useMemo(() => {
    const withBoth = data.disbursementRequests.filter(r => r.status === 'disbursed' && r.tgl_realisasi && r.tgl_pengajuan);
    if (withBoth.length === 0) return 0;
    const totalDays = withBoth.reduce((s, r) => {
      const diff = (new Date(r.tgl_realisasi) - new Date(r.tgl_pengajuan)) / (1000 * 60 * 60 * 24);
      return s + Math.max(0, diff);
    }, 0);
    return totalDays / withBoth.length;
  }, [data]);

  const funnelByStatus = useMemo(() => {
    const draft = data.disbursementRequests.filter(r => r.status === 'draft').length;
    const approved = data.disbursementRequests.filter(r => r.status === 'approved' || r.status === 'disbursed').length;
    const disbursed = data.disbursementRequests.filter(r => r.status === 'disbursed').length;
    return [
      { label: 'Diajukan (Total)', value: data.disbursementRequests.length },
      { label: 'Disetujui', value: approved },
      { label: 'Dicairkan', value: disbursed }
    ];
  }, [data]);

  const perAsnaf = useMemo(() =>
    data.zakatDistributions.map(z => ({ label: ASNAF_LABELS[z.asnaf] || z.asnaf, value: z.jumlah_disalurkan }))
      .sort((a, b) => b.value - a.value),
    [data]
  );

  const perProgram = useMemo(() => {
    const groups = {};
    data.disbursementRequests.forEach(r => {
      const key = r.campaign_id;
      if (!groups[key]) {
        const budget = data.campaignBudgets.find(c => c.campaign_id === key);
        groups[key] = { campaign_id: key, nama: budget?.name || CAMPAIGN_NAMES[key] || `Campaign #${key}`, anggaran: budget?.budget || 0, diajukan: 0, realisasi: 0, jumlahPengajuan: 0 };
      }
      groups[key].diajukan += r.jumlah_diajukan;
      groups[key].jumlahPengajuan += 1;
      if (r.status === 'disbursed') groups[key].realisasi += (r.jumlah_disetujui || r.jumlah_diajukan);
    });
    return Object.values(groups).sort((a, b) => b.realisasi - a.realisasi);
  }, [data]);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Analisis Salur
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Refresh data" onClick={() => setData(getAccountingData())} />
          </h1>
          <p>Kecepatan proses, funnel status, dan distribusi asnaf penyaluran dana</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Send size={20} /></div>
            <div className="stat-title">Total Diajukan</div>
          </div>
          <div className="stat-value">{formatRupiah(totalDiajukan)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><FileCheck size={20} /></div>
            <div className="stat-title">Total Realisasi</div>
          </div>
          <div className="stat-value">{formatRupiah(totalRealisasi)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Clock size={20} /></div>
            <div className="stat-title">Rata-rata Waktu Proses</div>
          </div>
          <div className="stat-value">{fmtDays(avgProcessDays)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><Percent size={20} /></div>
            <div className="stat-title">% Realisasi vs Anggaran</div>
          </div>
          <div className="stat-value">{pctRealisasi.toFixed(0)}%</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Funnel Status Pengajuan</div>
          <FunnelChart stages={funnelByStatus} valueFormatter={v => `${v}`} color="#eb6834" />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Distribusi per Asnaf</div>
          <HBarList data={perAsnaf} valueFormatter={formatRupiah} emptyLabel="Belum ada data distribusi asnaf" />
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Realisasi per Program</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Program / Campaign</th>
                <th style={{ textAlign: 'right' }}>Jml Pengajuan</th>
                <th style={{ textAlign: 'right' }}>Anggaran</th>
                <th style={{ textAlign: 'right' }}>Diajukan</th>
                <th style={{ textAlign: 'right' }}>Realisasi</th>
                <th>% Realisasi Anggaran</th>
              </tr>
            </thead>
            <tbody>
              {perProgram.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {perProgram.map((p, idx) => {
                const pct = p.anggaran > 0 ? Math.min(100, (p.realisasi / p.anggaran) * 100) : 0;
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{p.nama}</td>
                    <td style={{ textAlign: 'right' }}>{p.jumlahPengajuan}</td>
                    <td style={{ textAlign: 'right' }}>{p.anggaran > 0 ? formatRupiah(p.anggaran) : '-'}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(p.diajukan)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(p.realisasi)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: '#10b981' }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalisisSalur;
