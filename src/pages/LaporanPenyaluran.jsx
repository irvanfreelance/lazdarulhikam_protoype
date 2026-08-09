import React, { useState, useEffect, useMemo } from 'react';
import { Send, FileCheck, Users, MapPin } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';

const CAMPAIGN_NAMES = {
  1: 'Bantuan Darurat Bencana Banjir',
  2: 'Pembangunan Masjid Pelosok',
  3: 'Beasiswa Santri Tahfidz',
  4: 'Wakaf Sumur Air Bersih',
  5: 'Operasional Panti Asuhan'
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const LaporanPenyaluran = () => {
  const [activeTab, setActiveTab] = useState('Per Program');
  const [data, setData] = useState(() => getAccountingData());
  useEffect(() => { setData(getAccountingData()); }, []);

  const totalDiajukan = data.disbursementRequests.reduce((sum, r) => sum + r.jumlah_diajukan, 0);
  const totalRealisasi = data.disbursementRequests.filter(r => r.status === 'disbursed').reduce((sum, r) => sum + (r.jumlah_disetujui || r.jumlah_diajukan), 0);
  const totalPenerima = data.beneficiaries.length;
  const totalWilayah = new Set(data.beneficiaries.map(b => b.kabupaten).filter(Boolean)).size;

  const perProgram = useMemo(() => {
    const groups = {};
    data.disbursementRequests.forEach(r => {
      const key = r.campaign_id;
      if (!groups[key]) {
        const budget = data.campaignBudgets.find(c => c.campaign_id === key);
        groups[key] = {
          campaign_id: key,
          nama: budget?.name || CAMPAIGN_NAMES[key] || `Campaign #${key}`,
          anggaran: budget?.budget || 0,
          diajukan: 0,
          realisasi: 0,
          jumlahPengajuan: 0
        };
      }
      groups[key].diajukan += r.jumlah_diajukan;
      groups[key].jumlahPengajuan += 1;
      if (r.status === 'disbursed') groups[key].realisasi += (r.jumlah_disetujui || r.jumlah_diajukan);
    });
    return Object.values(groups).sort((a, b) => b.realisasi - a.realisasi);
  }, [data]);

  const perWilayah = useMemo(() => {
    const groups = {};
    data.disbursementRequests.forEach(r => {
      const b = data.beneficiaries.find(x => x.id === r.beneficiary_id);
      const key = b?.kabupaten || 'Tidak diketahui';
      if (!groups[key]) groups[key] = { wilayah: key, diajukan: 0, realisasi: 0, jumlahPenerima: new Set() };
      groups[key].diajukan += r.jumlah_diajukan;
      if (r.status === 'disbursed') groups[key].realisasi += (r.jumlah_disetujui || r.jumlah_diajukan);
      if (b) groups[key].jumlahPenerima.add(b.id);
    });
    return Object.values(groups).map(g => ({ ...g, jumlahPenerima: g.jumlahPenerima.size })).sort((a, b) => b.realisasi - a.realisasi);
  }, [data]);

  const perPeriode = useMemo(() => {
    const groups = {};
    data.disbursementRequests.filter(r => r.status === 'disbursed' && r.tgl_realisasi).forEach(r => {
      const d = new Date(r.tgl_realisasi);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = { periode: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, key, realisasi: 0, jumlahPenyaluran: 0 };
      groups[key].realisasi += (r.jumlah_disetujui || r.jumlah_diajukan);
      groups[key].jumlahPenyaluran += 1;
    });
    return Object.values(groups).sort((a, b) => a.key.localeCompare(b.key));
  }, [data]);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan Penyaluran</h1>
          <p>Rekap anggaran vs realisasi penyaluran dana per program, wilayah, dan periode</p>
        </div>
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
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Users size={20} /></div>
            <div className="stat-title">Total Penerima Manfaat</div>
          </div>
          <div className="stat-value">{totalPenerima} Orang/Lembaga</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0d9488' }}><MapPin size={20} /></div>
            <div className="stat-title">Wilayah Terjangkau</div>
          </div>
          <div className="stat-value">{totalWilayah} Kabupaten/Kota</div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {['Per Program', 'Per Wilayah', 'Per Periode'].map(tab => (
            <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</div>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        {activeTab === 'Per Program' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Program / Campaign</th>
                <th>Jml Pengajuan</th>
                <th style={{ textAlign: 'right' }}>Anggaran</th>
                <th style={{ textAlign: 'right' }}>Diajukan</th>
                <th style={{ textAlign: 'right' }}>Realisasi</th>
                <th>% Realisasi Anggaran</th>
              </tr>
            </thead>
            <tbody>
              {perProgram.map((p, idx) => {
                const pct = p.anggaran > 0 ? Math.min(100, (p.realisasi / p.anggaran) * 100) : 0;
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{p.nama}</td>
                    <td>{p.jumlahPengajuan}</td>
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
        )}

        {activeTab === 'Per Wilayah' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Kabupaten/Kota</th>
                <th>Jml Penerima</th>
                <th style={{ textAlign: 'right' }}>Diajukan</th>
                <th style={{ textAlign: 'right' }}>Realisasi</th>
              </tr>
            </thead>
            <tbody>
              {perWilayah.map((w, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{w.wilayah}</td>
                  <td>{w.jumlahPenerima}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(w.diajukan)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(w.realisasi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Per Periode' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Jml Penyaluran Cair</th>
                <th style={{ textAlign: 'right' }}>Total Realisasi</th>
              </tr>
            </thead>
            <tbody>
              {perPeriode.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada penyaluran yang dicairkan</td></tr>
              )}
              {perPeriode.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 500 }}>{p.periode}</td>
                  <td>{p.jumlahPenyaluran}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(p.realisasi)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LaporanPenyaluran;
