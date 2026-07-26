import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, PieChart, Search, Download
} from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';

const LaporanDonasi = () => {
  const [activeTab, setActiveTab] = useState('Penerimaan Donasi (LPD)');
  const [data, setData] = useState(() => getAccountingData());

  useEffect(() => { setData(getAccountingData()); }, [activeTab]);

  // Penerimaan by campaign/note
  const byCampaign = {};
  data.penerimaan.filter(p => p.status === 'PAID').forEach(p => {
    const key = p.note || 'Lainnya';
    if (!byCampaign[key]) byCampaign[key] = { count: 0, total: 0 };
    byCampaign[key].count++;
    byCampaign[key].total += p.nominal;
  });

  // By channel
  const byChannel = {};
  data.penerimaan.filter(p => p.status === 'PAID').forEach(p => {
    const ch = p.channel || 'Manual';
    if (!byChannel[ch]) byChannel[ch] = { count: 0, total: 0 };
    byChannel[ch].count++;
    byChannel[ch].total += p.nominal;
  });

  const totalPenerimaan = data.penerimaan.filter(p => p.status === 'PAID').reduce((s, p) => s + p.nominal, 0);

  // Realisasi vs Anggaran
  const budgetItems = data.anggaranItems || [];

  // Zakat distribution by asnaf
  const zakatAsnaf = data.zakatDistributions || [];
  const zakatAmil = data.zakatAmilFee || [];

  // Qurban
  const qurbanAnimals = data.qurbanAnimals || [];

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan Donasi & Program</h1>
          <p>Analisis penerimaan donasi per campaign, per channel, realisasi penyaluran, laporan zakat & qurban</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {['Penerimaan Donasi (LPD)', 'Realisasi Penyaluran', 'Laporan Qurban', 'Laporan Zakat & Asnaf', 'Sertifikat Donasi'].map(tab => (
            <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        {activeTab === 'Penerimaan Donasi (LPD)' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Rekapitulasi Penerimaan Donasi per Campaign</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Campaign / Kategori</th>
                  <th>Jumlah Transaksi</th>
                  <th style={{ textAlign: 'right' }}>Total Penerimaan</th>
                  <th>% dari Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byCampaign).sort((a, b) => b[1].total - a[1].total).map(([key, val], idx) => {
                  const pct = totalPenerimaan > 0 ? (val.total / totalPenerimaan * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{key}</td>
                      <td>{val.count} donasi</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(val.total)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '6px', height: '6px', overflow: 'hidden', maxWidth: '100px' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: '6px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem' }}>{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ fontWeight: 'bold', background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan="3">TOTAL PENERIMAAN</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalPenerimaan)}</td>
                  <td>100%</td>
                </tr>
              </tbody>
            </table>

            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', margin: '32px 0 16px' }}>Penerimaan per Channel Pembayaran</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Jumlah Transaksi</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>% dari Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(byChannel).sort((a, b) => b[1].total - a[1].total).map(([ch, val], idx) => {
                  const pct = totalPenerimaan > 0 ? (val.total / totalPenerimaan * 100) : 0;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{ch}</td>
                      <td>{val.count}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(val.total)}</td>
                      <td><span style={{ fontSize: '0.8rem' }}>{pct.toFixed(1)}%</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Realisasi Penyaluran' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Realisasi Penyaluran vs Anggaran</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign / Program</th>
                  <th style={{ textAlign: 'right' }}>Anggaran</th>
                  <th style={{ textAlign: 'right' }}>Realisasi</th>
                  <th>% Serapan</th>
                  <th style={{ textAlign: 'right' }}>Gap</th>
                </tr>
              </thead>
              <tbody>
                {budgetItems.map((b, idx) => {
                  const pct = b.anggaran > 0 ? (b.realisasi / b.anggaran * 100) : 0;
                  const gap = b.anggaran - b.realisasi;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{b.campaign}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(b.anggaran)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(b.realisasi)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '6px', height: '8px', overflow: 'hidden', maxWidth: '100px' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct > 90 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444', borderRadius: '6px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', color: gap >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(gap)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Laporan Qurban' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Rekapitulasi Hewan Qurban</h3>
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">Total Hewan</div></div>
                <div className="stat-value">{qurbanAnimals.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">Sudah Disembelih</div></div>
                <div className="stat-value">{qurbanAnimals.filter(q => q.status === 'disembelih' || q.status === 'didistribusikan').length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">Total Biaya</div></div>
                <div className="stat-value">{formatRupiah(qurbanAnimals.reduce((s, q) => s + q.total_biaya, 0))}</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Hewan</th>
                  <th>Jenis</th>
                  <th>Berat (kg)</th>
                  <th>Peserta</th>
                  <th>Lokasi Sembelih</th>
                  <th style={{ textAlign: 'right' }}>Total Biaya</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {qurbanAnimals.map((q, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{q.kode_hewan}</td>
                    <td style={{ textTransform: 'capitalize' }}>{q.jenis_hewan}</td>
                    <td>{q.berat_kg} kg</td>
                    <td>{q.peserta_count}/{q.kapasitas_peserta}</td>
                    <td>{q.lokasi_sembelih}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(q.total_biaya)}</td>
                    <td>
                      <span className={`status-badge ${q.status === 'didistribusikan' ? 'status-success' : q.status === 'disembelih' ? 'status-info' : 'status-warning'}`}>
                        {q.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Laporan Zakat & Asnaf' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Distribusi Zakat per Asnaf</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Golongan Asnaf</th>
                  <th>Jumlah Penerima</th>
                  <th style={{ textAlign: 'right' }}>Total Disalurkan</th>
                  <th>Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {zakatAsnaf.map((z, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>{z.asnaf}</td>
                    <td>{z.jumlah_penerima} orang</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(z.jumlah_disalurkan)}</td>
                    <td>{z.lokasi_distribusi}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', margin: '32px 0 16px' }}>Hak Amil per Periode</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Periode</th>
                  <th style={{ textAlign: 'right' }}>Total Zakat Diterima</th>
                  <th>%</th>
                  <th style={{ textAlign: 'right' }}>Hak Amil</th>
                  <th style={{ textAlign: 'right' }}>Disalurkan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {zakatAmil.map((a, idx) => (
                  <tr key={idx}>
                    <td>{a.periode_bulan}/{a.periode_tahun}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(a.total_zakat_diterima)}</td>
                    <td>{a.persentase_amil}%</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(a.jumlah_amil)}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(a.jumlah_disalurkan)}</td>
                    <td>
                      <span className={`status-badge ${a.status === 'disbursed' ? 'status-success' : a.status === 'approved' ? 'status-info' : 'status-warning'}`}>
                        {a.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Sertifikat Donasi' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Sertifikat Donasi Tahunan per Donatur</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Donatur</th>
                  <th>Tahun</th>
                  <th style={{ textAlign: 'right' }}>Total Donasi</th>
                  <th>Jumlah Transaksi</th>
                  <th>Status Sertifikat</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const donaturMap = {};
                  data.penerimaan.filter(p => p.status === 'PAID').forEach(p => {
                    if (!donaturMap[p.donatur]) donaturMap[p.donatur] = { total: 0, count: 0 };
                    donaturMap[p.donatur].total += p.nominal;
                    donaturMap[p.donatur].count++;
                  });
                  return Object.entries(donaturMap).sort((a, b) => b[1].total - a[1].total).map(([name, val], idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{name}</td>
                      <td>2026</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(val.total)}</td>
                      <td>{val.count} kali</td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
                          <Download size={12} style={{ marginRight: '4px' }} /> Generate PDF
                        </button>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanDonasi;
