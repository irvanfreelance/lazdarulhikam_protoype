import React, { useState, useEffect } from 'react';
import { Briefcase, Search } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';

const LaporanOperasional = () => {
  const [activeTab, setActiveTab] = useState('Pengeluaran per COA');
  const [data, setData] = useState(() => getAccountingData());

  useEffect(() => { setData(getAccountingData()); }, [activeTab]);

  // Expense by COA
  const expByCoa = {};
  data.pengeluaran.filter(p => p.status === 'PAID').forEach(p => {
    const key = p.coa;
    if (!expByCoa[key]) expByCoa[key] = { coa: p.coa, note: p.note || p.coa, total: 0, count: 0 };
    expByCoa[key].total += p.nominal;
    expByCoa[key].count++;
  });

  // Aging Hutang
  const hutangItems = [
    { vendor: 'PT Cahaya Logistik', total: 12000000, jatuhTempo: '2026-06-15', aging: '31-60', status: 'overdue' },
    { vendor: 'CV Mandiri Catering', total: 8000000, jatuhTempo: '2026-07-01', aging: '0-30', status: 'current' },
    { vendor: 'PT Media Kreatif', total: 5000000, jatuhTempo: '2026-05-10', aging: '61-90', status: 'overdue' },
    { vendor: 'UD Sumber Makmur', total: 3500000, jatuhTempo: '2026-07-20', aging: '0-30', status: 'current' },
  ];

  // Piutang Outstanding
  const piutangItems = [
    { sumber: 'Grant Astra Foundation (Tahap 2)', nominal: 50000000, jatuhTempo: '2026-08-01', umur: '0-30', status: 'outstanding' },
    { sumber: 'Piutang Kas Bon - Ahmad Faisal', nominal: 1500000, jatuhTempo: '2026-07-25', umur: '0-30', status: 'outstanding' },
    { sumber: 'Piutang Kas Bon - Siti Nurhaliza', nominal: 500000, jatuhTempo: '2026-07-10', umur: '31-60', status: 'overdue' },
  ];

  // Aset & Penyusutan
  const asetItems = data.asetTetap || [];

  // Kas Bon Outstanding
  const kasBonActive = data.cashAdvances.filter(c => c.status === 'active');

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan Operasional</h1>
          <p>Rekap pengeluaran per COA, aging hutang, piutang outstanding, aset & penyusutan, kas bon aktif</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {['Pengeluaran per COA', 'Aging Hutang', 'Piutang Outstanding', 'Aset & Penyusutan', 'Kas Bon Belum Settlement'].map(tab => (
            <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        {activeTab === 'Pengeluaran per COA' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Rekapitulasi Pengeluaran per COA</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>COA</th>
                  <th>Keterangan</th>
                  <th>Jumlah Transaksi</th>
                  <th style={{ textAlign: 'right' }}>Total Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(expByCoa).sort((a, b) => b.total - a.total).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.coa}</td>
                    <td style={{ fontWeight: 500 }}>{item.note}</td>
                    <td>{item.count} transaksi</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{formatRupiah(item.total)}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan="3">TOTAL PENGELUARAN</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>
                    {formatRupiah(Object.values(expByCoa).reduce((s, i) => s + i.total, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Aging Hutang' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Aging Hutang Usaha per Vendor</h3>
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">0-30 Hari</div></div>
                <div className="stat-value" style={{ color: '#10b981' }}>
                  {formatRupiah(hutangItems.filter(h => h.aging === '0-30').reduce((s, h) => s + h.total, 0))}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">31-60 Hari</div></div>
                <div className="stat-value" style={{ color: '#f59e0b' }}>
                  {formatRupiah(hutangItems.filter(h => h.aging === '31-60').reduce((s, h) => s + h.total, 0))}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">61-90 Hari</div></div>
                <div className="stat-value" style={{ color: '#ef4444' }}>
                  {formatRupiah(hutangItems.filter(h => h.aging === '61-90').reduce((s, h) => s + h.total, 0))}
                </div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th style={{ textAlign: 'right' }}>Total Hutang</th>
                  <th>Jatuh Tempo</th>
                  <th>Aging</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {hutangItems.map((h, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{h.vendor}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(h.total)}</td>
                    <td>{h.jatuhTempo}</td>
                    <td><span className="status-badge status-info">{h.aging} hari</span></td>
                    <td>
                      <span className={`status-badge ${h.status === 'current' ? 'status-success' : 'status-danger'}`}>
                        {h.status === 'current' ? 'CURRENT' : 'OVERDUE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Piutang Outstanding' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Piutang Belum Tertagih</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sumber Piutang</th>
                  <th style={{ textAlign: 'right' }}>Nominal</th>
                  <th>Jatuh Tempo</th>
                  <th>Umur Piutang</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {piutangItems.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{p.sumber}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(p.nominal)}</td>
                    <td>{p.jatuhTempo}</td>
                    <td><span className="status-badge status-info">{p.umur} hari</span></td>
                    <td>
                      <span className={`status-badge ${p.status === 'outstanding' ? 'status-warning' : 'status-danger'}`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Aset & Penyusutan' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Nilai Buku Aset & Akumulasi Penyusutan</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Aset</th>
                  <th>Nama Aset</th>
                  <th style={{ textAlign: 'right' }}>Harga Perolehan</th>
                  <th style={{ textAlign: 'right' }}>Akum. Penyusutan</th>
                  <th style={{ textAlign: 'right' }}>Nilai Buku</th>
                  <th>Metode</th>
                </tr>
              </thead>
              <tbody>
                {asetItems.map((a, idx) => {
                  const accumDep = (a.depresiasi_per_bulan || 0) * 6;
                  const nilaiBuku = a.harga_perolehan - accumDep;
                  return (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.kode_aset}</td>
                      <td style={{ fontWeight: 500 }}>{a.nama_aset}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(a.harga_perolehan)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(accumDep)})</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(nilaiBuku)}</td>
                      <td>{a.metode || 'Garis Lurus'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Kas Bon Belum Settlement' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Staf dengan Kas Bon Aktif (Belum Settlement)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Staf</th>
                  <th>Keperluan</th>
                  <th>Tanggal Cair</th>
                  <th>Jatuh Tempo</th>
                  <th style={{ textAlign: 'right' }}>Nominal Awal</th>
                  <th style={{ textAlign: 'right' }}>Sisa Kas Bon</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {kasBonActive.map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{c.nama_staf}</td>
                    <td>{c.keperluan}</td>
                    <td>{c.tgl_cair}</td>
                    <td>{c.jatuh_tempo}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(c.nominal)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{formatRupiah(c.sisa_kasbon)}</td>
                    <td>
                      <span className={`status-badge ${new Date(c.jatuh_tempo) < new Date() ? 'status-danger' : 'status-warning'}`}>
                        {new Date(c.jatuh_tempo) < new Date() ? 'OVERDUE' : 'AKTIF'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanOperasional;
