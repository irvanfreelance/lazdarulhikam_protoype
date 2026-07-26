import React, { useState, useEffect } from 'react';
import { Users, Download } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';

const LaporanSDM = () => {
  const [activeTab, setActiveTab] = useState('Rekap Penggajian');
  const [data, setData] = useState(() => getAccountingData());

  useEffect(() => { setData(getAccountingData()); }, [activeTab]);

  const employees = data.employees || [];
  const payrollPeriods = data.payrollPeriods || [];
  const payrollItems = data.payrollItems || [];

  // Monthly summary
  const monthlySummary = [
    { bulan: 'Januari 2026', bruto: 45000000, pph21: 1250000, bersih: 43750000, status: 'paid' },
    { bulan: 'Februari 2026', bruto: 45000000, pph21: 1250000, bersih: 43750000, status: 'paid' },
    { bulan: 'Maret 2026', bruto: 46500000, pph21: 1350000, bersih: 45150000, status: 'paid' },
    { bulan: 'April 2026', bruto: 46500000, pph21: 1350000, bersih: 45150000, status: 'paid' },
    { bulan: 'Mei 2026', bruto: 47000000, pph21: 1400000, bersih: 45600000, status: 'paid' },
    { bulan: 'Juni 2026', bruto: 47000000, pph21: 1400000, bersih: 45600000, status: 'paid' },
    { bulan: 'Juli 2026', bruto: 47000000, pph21: 1400000, bersih: 45600000, status: 'pending' },
  ];

  const totalBruto = monthlySummary.reduce((s, m) => s + m.bruto, 0);
  const totalPph = monthlySummary.reduce((s, m) => s + m.pph21, 0);
  const totalBersih = monthlySummary.reduce((s, m) => s + m.bersih, 0);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan SDM</h1>
          <p>Rekap penggajian bulanan, slip gaji per karyawan, dan setoran PPh 21</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {['Rekap Penggajian', 'Slip Gaji', 'PPh 21'].map(tab => (
            <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        {activeTab === 'Rekap Penggajian' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Rekap Penggajian per Bulan — Tahun 2026</h3>

            {/* Mini chart */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '0 8px', marginBottom: '20px' }}>
              {monthlySummary.map((m, i) => {
                const maxBruto = Math.max(...monthlySummary.map(x => x.bruto));
                const h = (m.bruto / maxBruto) * 100;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.65rem', color: '#64748b' }}>{(m.bruto / 1000000).toFixed(0)}jt</span>
                    <div style={{
                      width: '100%', maxWidth: '40px',
                      height: `${h}px`,
                      background: m.status === 'paid' ? 'linear-gradient(180deg, #10b981, #34d399)' : 'linear-gradient(180deg, #f59e0b, #fbbf24)',
                      borderRadius: '4px 4px 0 0'
                    }}></div>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{m.bulan.split(' ')[0].substring(0, 3)}</span>
                  </div>
                );
              })}
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Bulan</th>
                  <th style={{ textAlign: 'right' }}>Gaji Bruto</th>
                  <th style={{ textAlign: 'right' }}>PPh 21</th>
                  <th style={{ textAlign: 'right' }}>Gaji Bersih</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{m.bulan}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(m.bruto)}</td>
                    <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(m.pph21)})</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(m.bersih)}</td>
                    <td>
                      <span className={`status-badge ${m.status === 'paid' ? 'status-success' : 'status-warning'}`}>
                        {m.status === 'paid' ? 'DIBAYAR' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                  <td>TOTAL YTD</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(totalBruto)}</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalPph)})</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalBersih)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Slip Gaji' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Slip Gaji per Karyawan — Juli 2026</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>NIK</th>
                  <th>Nama Karyawan</th>
                  <th>Jabatan</th>
                  <th style={{ textAlign: 'right' }}>Gaji Pokok</th>
                  <th style={{ textAlign: 'right' }}>Tunjangan</th>
                  <th style={{ textAlign: 'right' }}>PPh 21</th>
                  <th style={{ textAlign: 'right' }}>Take Home Pay</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => {
                  const tunjangan = emp.gaji_pokok * 0.15;
                  const pph = Math.round((emp.gaji_pokok + tunjangan) * 0.025);
                  const thp = emp.gaji_pokok + tunjangan - pph;
                  return (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace' }}>{emp.nik}</td>
                      <td style={{ fontWeight: 500 }}>{emp.nama}</td>
                      <td>{emp.jabatan}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(emp.gaji_pokok)}</td>
                      <td style={{ textAlign: 'right', color: '#10b981' }}>+ {formatRupiah(tunjangan)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>- {formatRupiah(pph)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(thp)}</td>
                      <td>
                        <button className="btn" style={{ padding: '4px 10px', fontSize: '0.7rem', background: 'white', border: '1px solid #e2e8f0' }}>
                          <Download size={12} /> PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'PPh 21' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Rekap Setoran PPh 21 per Bulan</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Masa Pajak</th>
                  <th>Jumlah Karyawan</th>
                  <th style={{ textAlign: 'right' }}>DPP (Dasar Pengenaan)</th>
                  <th style={{ textAlign: 'right' }}>PPh 21 Terutang</th>
                  <th>Status Setor</th>
                  <th>NTPN</th>
                </tr>
              </thead>
              <tbody>
                {monthlySummary.filter(m => m.status === 'paid').map((m, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{m.bulan}</td>
                    <td>{employees.length} orang</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(m.bruto)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(m.pph21)}</td>
                    <td><span className="status-badge status-success">SETOR</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>NTPN-{String(idx + 1).padStart(6, '0')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', margin: '32px 0 16px' }}>Bukti Potong PPh 21 Tahunan (1721-A1)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Karyawan</th>
                  <th>NPWP</th>
                  <th style={{ textAlign: 'right' }}>Penghasilan Bruto Tahunan</th>
                  <th style={{ textAlign: 'right' }}>PPh 21 Tahunan</th>
                  <th>Bukpot</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, idx) => {
                  const brutoTahunan = emp.gaji_pokok * 12 * 1.15;
                  const pphTahunan = Math.round(brutoTahunan * 0.025);
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{emp.nama}</td>
                      <td style={{ fontFamily: 'monospace' }}>{emp.npwp || '-'}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(brutoTahunan)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(pphTahunan)}</td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>
                          <Download size={12} /> Generate 1721-A1
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanSDM;
