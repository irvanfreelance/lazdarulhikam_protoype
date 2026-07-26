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
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');

  const reloadData = () => setData(getAccountingData());

  const openPeriods = data.accountingPeriods.filter(p => p.status === 'open');
  useEffect(() => {
    if (!selectedPeriodId && openPeriods.length > 0) {
      setSelectedPeriodId(openPeriods[0].id);
    }
  }, [data.accountingPeriods]);

  const yearEndDone = data.jurnalPenyesuaian.some(aje => aje.keterangan.includes(`Jurnal Penutup Tahunan ${selectedYear}`));

  const handleTutupBukuBulanan = () => {
    const period = data.accountingPeriods.find(p => p.id === selectedPeriodId);
    if (!period) { alert('Pilih periode yang akan ditutup terlebih dahulu.'); return; }
    if (!window.confirm(`Yakin ingin menutup buku periode ${period.nama_periode}? Transaksi backdated tidak akan bisa diubah lagi.`)) return;

    const store = getAccountingData();
    let newAje = [...store.jurnalPenyesuaian];
    let message = `Periode ${period.nama_periode} berhasil dikunci. Transaksi backdated sudah tidak diizinkan.`;

    if (generateDepreciation) {
      // Auto-depreciation for active assets, posted straight-line for the period
      store.assets.forEach(asset => {
        if (asset.status === 'aktif') {
          const bebanPenyusutan = Math.round(asset.harga_perolehan / asset.masa_manfaat);
          newAje.push({
            id: String(newAje.length + 1),
            period: period.nama_periode,
            tgl: new Date().toISOString().substring(0, 10),
            jenis_aje: 'depresiasi',
            keterangan: `Penyusutan Otomatis: ${asset.nama_aset}`,
            coa_debet: '502.04.000.000', // Beban Penyusutan
            coa_kredit: '102.01.001.000', // Akumulasi Penyusutan
            nominal: bebanPenyusutan,
            status: 'posted',
            nik_input: 'SYSTEM',
            approved_by: 'SYSTEM',
            approved_at: new Date().toISOString().substring(0, 10)
          });
        }
      });
      message += '\n✅ Jurnal Beban Penyusutan Aset Tetap berhasil di-generate secara otomatis.';
    }

    if (generateReversing) {
      // Reverse accrual (akrual) entries booked in the period being closed
      const accruals = store.jurnalPenyesuaian.filter(aje => aje.jenis_aje === 'akrual' && aje.period === period.nama_periode);
      accruals.forEach(aje => {
        newAje.push({
          id: String(newAje.length + 1),
          period: period.nama_periode,
          tgl: new Date().toISOString().substring(0, 10),
          jenis_aje: 'balik',
          keterangan: `Jurnal Pembalik: ${aje.keterangan}`,
          coa_debet: aje.coa_kredit,
          coa_kredit: aje.coa_debet,
          nominal: aje.nominal,
          status: 'posted',
          nik_input: 'SYSTEM',
          approved_by: 'SYSTEM',
          approved_at: new Date().toISOString().substring(0, 10)
        });
      });
      message += accruals.length > 0
        ? `\n✅ ${accruals.length} Jurnal Pembalik (Reversing Entries) untuk akrual telah di-generate untuk tanggal 1 bulan berikutnya.`
        : '\n⚠️ Tidak ada jurnal akrual pada periode ini yang perlu dibalik.';
    }

    const updatedPeriods = store.accountingPeriods.map(p => p.id === period.id ? {
      ...p,
      status: 'closed',
      closed_at: new Date().toISOString().substring(0, 10),
      closing_summary: `Ditutup dari Monitoring Sistem${generateDepreciation ? ' — termasuk penyusutan otomatis' : ''}${generateReversing ? ' — termasuk jurnal pembalik' : ''}.`
    } : p);

    updateAccountingData('laz_jurnal_penyesuaian', newAje);
    updateAccountingData('laz_accounting_periods', updatedPeriods);
    alert(message);
    reloadData();
  };

  const handleYearEndClosing = () => {
    if (yearEndDone) { alert(`Year-End Closing ${selectedYear} sudah pernah dijalankan.`); return; }
    if (!window.confirm(`Jalankan Year-End Closing ${selectedYear}? Seluruh saldo akun Pendapatan & Beban akan dipindahkan ke Aset Bersih.`)) return;

    const store = getAccountingData();
    const totalPenerimaan = store.penerimaan.filter(p => p.status === 'PAID').reduce((s, p) => s + p.nominal, 0);
    const totalPengeluaran = store.pengeluaran.filter(p => p.status === 'PAID').reduce((s, p) => s + p.nominal, 0);
    const netIncome = totalPenerimaan - totalPengeluaran;

    const closingAje = {
      id: String(store.jurnalPenyesuaian.length + 1),
      period: `Tahun ${selectedYear}`,
      tgl: new Date().toISOString().substring(0, 10),
      jenis_aje: 'penutup',
      keterangan: `Jurnal Penutup Tahunan ${selectedYear}: Pemindahan ${netIncome >= 0 ? 'Surplus' : 'Defisit'} ke Aset Bersih Tidak Terikat`,
      coa_debet: netIncome >= 0 ? '300.09.000.000' : '300.06.000.000',
      coa_kredit: netIncome >= 0 ? '300.06.000.000' : '300.09.000.000',
      nominal: Math.abs(netIncome),
      nik_input: 'SYSTEM',
      approved_by: 'SYSTEM',
      approved_at: new Date().toISOString()
    };

    const updatedPeriods = store.accountingPeriods.map(p => p.nama_periode.endsWith(selectedYear) ? {
      ...p,
      status: 'closed',
      closed_at: new Date().toISOString().substring(0, 10),
      closing_summary: `Year-End Closing ${selectedYear}: ${netIncome >= 0 ? 'Surplus' : 'Defisit'} ${formatRupiah(netIncome)}`
    } : p);

    updateAccountingData('laz_jurnal_penyesuaian', [closingAje, ...store.jurnalPenyesuaian]);
    updateAccountingData('laz_accounting_periods', updatedPeriods);
    alert(`Year-End Closing ${selectedYear} selesai. ${netIncome >= 0 ? 'Surplus' : 'Defisit'} sebesar ${formatRupiah(Math.abs(netIncome))} telah dipindahkan ke Aset Bersih Tidak Terikat.`);
    reloadData();
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
                  <select
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', marginBottom: '16px' }}
                    value={selectedPeriodId}
                    onChange={e => setSelectedPeriodId(e.target.value)}
                  >
                    {openPeriods.length === 0 && <option value="">Tidak ada periode terbuka</option>}
                    {openPeriods.map(p => (
                      <option key={p.id} value={p.id}>{p.nama_periode}</option>
                    ))}
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
                <button className="btn btn-primary" style={{ width: '100%' }} disabled={openPeriods.length === 0} onClick={handleTutupBukuBulanan}>
                  {openPeriods.length === 0 ? 'Tidak Ada Periode Terbuka' : `Kunci Periode ${data.accountingPeriods.find(p => p.id === selectedPeriodId)?.nama_periode || ''}`}
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
                  <select
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={selectedYear}
                    onChange={e => setSelectedYear(e.target.value)}
                  >
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', background: '#8b5cf6', borderColor: '#8b5cf6' }}
                  disabled={yearEndDone}
                  onClick={handleYearEndClosing}
                >
                  {yearEndDone ? `Year-End Closing ${selectedYear} Selesai` : `Jalankan Year-End Closing ${selectedYear}`}
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
