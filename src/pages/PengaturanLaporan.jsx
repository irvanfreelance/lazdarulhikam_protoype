import React, { useState } from 'react';
import { FileText, GripVertical, Plus, Save } from 'lucide-react';

const PengaturanLaporan = () => {
  const [activeTab, setActiveTab] = useState('Struktur Baris Laporan');

  // Report structure rows
  const [reportRows] = useState([
    { id: 1, report: 'LPK', kode: 'LPK-01', nama: 'Kas dan Setara Kas', coa: '101.xx', sort: 1, active: true },
    { id: 2, report: 'LPK', kode: 'LPK-02', nama: 'Piutang Usaha', coa: '103.xx', sort: 2, active: true },
    { id: 3, report: 'LPK', kode: 'LPK-03', nama: 'Aset Tetap (Bersih)', coa: '102.xx', sort: 3, active: true },
    { id: 4, report: 'LPK', kode: 'LPK-04', nama: 'Hutang Usaha', coa: '201.xx', sort: 4, active: true },
    { id: 5, report: 'LPK', kode: 'LPK-05', nama: 'Dana Tidak Terikat', coa: '300.01', sort: 5, active: true },
    { id: 6, report: 'LPK', kode: 'LPK-06', nama: 'Dana Terikat Sementara', coa: '300.02', sort: 6, active: true },
    { id: 7, report: 'LPK', kode: 'LPK-07', nama: 'Dana Terikat Permanen', coa: '300.03', sort: 7, active: true },
    { id: 8, report: 'LPO', kode: 'LPO-01', nama: 'Donasi Kesehatan', coa: '401.01', sort: 1, active: true },
    { id: 9, report: 'LPO', kode: 'LPO-02', nama: 'Donasi Bencana', coa: '401.02', sort: 2, active: true },
    { id: 10, report: 'LPO', kode: 'LPO-03', nama: 'Sedekah Pangan', coa: '401.04', sort: 3, active: true },
    { id: 11, report: 'LPO', kode: 'LPO-04', nama: 'Zakat Profesi & Maal', coa: '401.05', sort: 4, active: true },
    { id: 12, report: 'LPO', kode: 'LPO-05', nama: 'Biaya Penyaluran Program', coa: '501.xx', sort: 5, active: true },
    { id: 13, report: 'LPO', kode: 'LPO-06', nama: 'Biaya Operasional', coa: '502.xx', sort: 6, active: true },
    { id: 14, report: 'LAK', kode: 'LAK-01', nama: 'Arus Kas Operasi', coa: '401-502', sort: 1, active: true },
    { id: 15, report: 'LAK', kode: 'LAK-02', nama: 'Arus Kas Investasi', coa: '102.xx', sort: 2, active: true },
    { id: 16, report: 'LAK', kode: 'LAK-03', nama: 'Arus Kas Pendanaan', coa: '300.xx', sort: 3, active: true },
  ]);

  const [filterReport, setFilterReport] = useState('ALL');

  // CALK Notes
  const [calkNotes] = useState([
    { id: 1, nomor: 1, judul: 'Gambaran Umum Organisasi', periode: 'TA 2026', isi: 'LAZ Darul Hikam adalah Lembaga Amil Zakat yang bergerak di bidang penghimpunan dan penyaluran dana zakat, infaq, sedekah, dan dana sosial kemanusiaan lainnya. Didirikan berdasarkan akta notaris ...', status: 'draft' },
    { id: 2, nomor: 2, judul: 'Ikhtisar Kebijakan Akuntansi', periode: 'TA 2026', isi: 'Laporan keuangan disusun berdasarkan PSAK 45 tentang Pelaporan Keuangan Organisasi Nirlaba. Dasar penyusunan menggunakan basis akrual ...', status: 'final' },
    { id: 3, nomor: 3, judul: 'Kas dan Setara Kas', periode: 'TA 2026', isi: 'Kas dan setara kas terdiri dari kas di tangan, rekening giro, dan simpanan jangka pendek yang jatuh tempo dalam 3 bulan. Rincian per rekening bank ...', status: 'draft' },
    { id: 4, nomor: 4, judul: 'Aset Tetap', periode: 'TA 2026', isi: 'Aset tetap dicatat pada harga perolehan dikurangi akumulasi penyusutan. Penyusutan dihitung menggunakan metode garis lurus ...', status: 'final' },
    { id: 5, nomor: 5, judul: 'Dana Terikat', periode: 'TA 2026', isi: 'Dana terikat sementara terdiri dari sumbangan donor yang penggunaannya dibatasi oleh pemberi untuk tujuan tertentu. Dana terikat permanen berupa wakaf tanah dan gedung ...', status: 'draft' },
  ]);

  const filtered = filterReport === 'ALL' ? reportRows : reportRows.filter(r => r.report === filterReport);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Pengaturan Laporan</h1>
          <p>Konfigurasi struktur baris laporan keuangan dan Catatan Atas Laporan Keuangan (CALK)</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Struktur Baris Laporan', 'CALK'].map(tab => (
            <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        {activeTab === 'Struktur Baris Laporan' && (
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Filter Jenis Laporan:</span>
              {['ALL', 'LPK', 'LPO', 'LAK'].map(f => (
                <button key={f} className={`btn ${filterReport === f ? 'btn-primary' : ''}`}
                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: filterReport === f ? '' : 'white', border: '1px solid #e2e8f0' }}
                  onClick={() => setFilterReport(f)}>
                  {f === 'ALL' ? 'Semua' : f}
                </button>
              ))}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Jenis Laporan</th>
                  <th>Kode Baris</th>
                  <th>Nama Akun / Baris</th>
                  <th>COA Range</th>
                  <th>Urutan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr key={row.id}>
                    <td style={{ cursor: 'grab', color: '#94a3b8' }}><GripVertical size={14} /></td>
                    <td><span className="status-badge status-info">{row.report}</span></td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{row.kode}</td>
                    <td style={{ fontWeight: 500 }}>{row.nama}</td>
                    <td style={{ fontFamily: 'monospace' }}>{row.coa}</td>
                    <td>{row.sort}</td>
                    <td>
                      <span className={`status-badge ${row.active ? 'status-success' : 'status-danger'}`}>
                        {row.active ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'CALK' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>Catatan Atas Laporan Keuangan (CALK) — TA 2026</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>No.</th>
                  <th>Judul Catatan</th>
                  <th>Periode</th>
                  <th>Isi (Preview)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {calkNotes.map(note => (
                  <tr key={note.id}>
                    <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{note.nomor}</td>
                    <td style={{ fontWeight: 600 }}>{note.judul}</td>
                    <td>{note.periode}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '400px' }}>
                      {note.isi.substring(0, 120)}...
                    </td>
                    <td>
                      <span className={`status-badge ${note.status === 'final' ? 'status-success' : 'status-warning'}`}>
                        {note.status === 'final' ? 'FINAL' : 'DRAFT'}
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

export default PengaturanLaporan;
