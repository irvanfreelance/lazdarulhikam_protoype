import React, { useState, useEffect } from 'react';
import { 
  Activity, MonitorCheck, RefreshCw, Search
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';

const MonitoringSistem = () => {
  const [activeTab, setActiveTab] = useState('Upstash Events');
  const [data, setData] = useState(() => getAccountingData());
  const [generateDepreciation, setGenerateDepreciation] = useState(true);
  const [generateReversing, setGenerateReversing] = useState(false);

  const handleTutupBukuBulanan = () => {
    let message = 'Periode berhasil dikunci. Transaksi backdated sudah tidak diizinkan.';
    const store = getAccountingData();
    let newAje = [...store.jurnalPenyesuaian];

    if (generateDepreciation) {
      // Simulate auto-depreciation for active assets
      store.assets.forEach(asset => {
        if (asset.status === 'aktif') {
          const bebanPenyusutan = Math.round(asset.harga_perolehan / asset.masa_manfaat);
          newAje.push({
            id: String(newAje.length + 1),
            period: 'Juli 2026',
            tgl: new Date().toISOString().substring(0, 10),
            keterangan: `Penyusutan Otomatis: ${asset.nama_aset}`,
            coa_debet: '502.04.000.000', // Beban Penyusutan
            coa_kredit: '102.01.001.000', // Akumulasi Penyusutan
            nominal: bebanPenyusutan,
            status: 'posted',
            approved_by: 'SYSTEM',
            approved_at: new Date().toISOString().substring(0, 10)
          });
        }
      });
      message += '\n✅ Jurnal Beban Penyusutan Aset Tetap berhasil di-generate secara otomatis.';
    }

    if (generateReversing) {
      // Simulate reversing entries (mock)
      message += '\n✅ Jurnal Pembalik (Reversing Entries) untuk akrual telah di-generate untuk tanggal 1 bulan berikutnya.';
    }

    updateAccountingData('laz_jurnal_penyesuaian', newAje);
    alert(message);
    setData(getAccountingData());
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Monitoring Sistem Keuangan</h1>
          <p>Memonitor event real-time webhook, status cron job rekonsiliasi kas harian, dan mutasi dana terikat aktif</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Upstash Events', 'Dana Terikat Aktif', 'Tutup Buku'].map(tab => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Upstash Events' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>Event Webhook & Cron Jobs (QStash)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Name</th>
                  <th>Payload Ref</th>
                  <th>Retries</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: '2026-07-12 16:00:00', name: 'opname-daily-cron', payload: 'cron-98731', retries: 0, status: 'SUCCESS' },
                  { time: '2026-07-12 09:35:12', name: 'INVOICE_PAID_WEBHOOK', payload: 'inv_2607120935', retries: 0, status: 'SUCCESS' },
                  { time: '2026-07-12 10:15:45', name: 'INVOICE_PAID_WEBHOOK', payload: 'inv_2607121015', retries: 0, status: 'SUCCESS' },
                  { time: '2026-07-10 01:00:00', name: 'campaign-budget-sync-cron', payload: 'cron-77621', retries: 1, status: 'SUCCESS' }
                ].map((e, idx) => (
                  <tr key={idx}>
                    <td>{e.time}</td>
                    <td style={{ fontWeight: 600 }}>{e.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{e.payload}</td>
                    <td>{e.retries}</td>
                    <td>
                      <span className="status-badge status-success">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Dana Terikat Aktif' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>Daftar Pembatasan Dana Aktif (PSAK 45)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Sumber Dana</th>
                  <th>Klasifikasi</th>
                  <th style={{ textAlign: 'right' }}>Saldo Terikat</th>
                  <th>Tanggal Jatuh Tempo Batasan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Beasiswa Astra Foundation</td>
                  <td>Terikat Sementara</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Rp 100.000.000</td>
                  <td>2026-12-31</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Donasi Pembangunan Masjid Pelosok</td>
                  <td>Terikat Sementara (Campaign)</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Rp 300.000.000</td>
                  <td>Tujuan Tercapai</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Wakaf Tanah & Gedung Pusat</td>
                  <td>Terikat Permanen (Endowment)</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>Rp 50.000.000</td>
                  <td>Permanen</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Tutup Buku' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>Proses Tutup Buku Bulanan / Tahunan</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: 1, padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={18} color="#3b82f6" /> Tutup Buku Bulanan
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
                  Kunci seluruh transaksi penerimaan, pengeluaran, dan jurnal penyesuaian untuk periode berjalan agar tidak ada lagi perubahan (prevent backdated entries).
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>Periode yang Akan Ditutup:</label>
                  <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}>
                    <option>Juli 2026</option>
                  </select>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <input type="checkbox" id="depreciation" checked={generateDepreciation} onChange={e => setGenerateDepreciation(e.target.checked)} />
                    <label htmlFor="depreciation" style={{ fontSize: '0.85rem' }}>Otomatis Jurnal Penyusutan Aset Tetap (Auto-Depreciation)</label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="checkbox" id="reversing" checked={generateReversing} onChange={e => setGenerateReversing(e.target.checked)} />
                    <label htmlFor="reversing" style={{ fontSize: '0.85rem' }}>Generate Jurnal Pembalik (Reversing Entries) tgl 1 Bln Depan</label>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleTutupBukuBulanan}>
                  Kunci Periode Juli 2026
                </button>
              </div>

              <div style={{ flex: 1, padding: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
                  <RefreshCw size={18} color="#8b5cf6" /> Tutup Buku Tahunan (Year End)
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '20px' }}>
                  Pindahkan seluruh saldo akun Laba/Rugi (Revenues & Expenses) ke akun Aset Bersih (Ekuitas) dan buat saldo awal neraca untuk tahun berikutnya.
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>Tahun yang Akan Ditutup:</label>
                  <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                    <option>2026</option>
                  </select>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6' }} onClick={() => alert('Proses Year-End Closing dimulai. Saldo L/R sedang di-nol-kan dan dipindah ke Aset Bersih.')}>
                  Jalankan Year-End Closing 2026
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringSistem;
