import React, { useState } from 'react';
import { Shield, Search, Filter } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const AuditTrail = () => {
  const [filterModul, setFilterModul] = useState('Semua');
  const [searchTerm, setSearchTerm] = useState('');

  const auditLogs = [
    { id: 1, waktu: '2026-07-12 16:05:23', user: 'admin@dh.or.id', role: 'Finance Admin', modul: 'Transaksi Keuangan', aksi: 'CREATE', detail: 'Membuat transaksi penerimaan donasi #2607120935 - Rp 5.000.000 dari Hasan Ali', ip: '103.28.12.45' },
    { id: 2, waktu: '2026-07-12 14:30:10', user: 'manager@dh.or.id', role: 'Finance Manager', modul: 'Penyaluran Dana', aksi: 'APPROVE', detail: 'Menyetujui pengajuan penyaluran DSB-2026-003 - Bantuan Biaya Pengobatan Syarifudin', ip: '103.28.12.46' },
    { id: 3, waktu: '2026-07-12 11:20:55', user: 'admin@dh.or.id', role: 'Finance Admin', modul: 'Penyaluran Dana', aksi: 'DISBURSE', detail: 'Mencairkan dana DSB-2026-003 sebesar Rp 8.000.000 ke rekening penerima', ip: '103.28.12.45' },
    { id: 4, waktu: '2026-07-11 09:15:33', user: 'staff@dh.or.id', role: 'Finance Staff', modul: 'Pengeluaran Ops', aksi: 'CREATE', detail: 'Mengajukan reimbursement EXP-2026-001 - Transport survei lapangan Rp 750.000', ip: '192.168.1.10' },
    { id: 5, waktu: '2026-07-11 08:00:01', user: 'system', role: 'Cron Job', modul: 'Periode Akuntansi', aksi: 'AUTO', detail: 'Menjalankan opname-daily-cron untuk tanggal 2026-07-10', ip: '0.0.0.0' },
    { id: 6, waktu: '2026-07-10 15:45:12', user: 'manager@dh.or.id', role: 'Finance Manager', modul: 'SDM & Penggajian', aksi: 'APPROVE', detail: 'Menyetujui dan memproses payroll bulan Juni 2026 untuk 5 karyawan', ip: '103.28.12.46' },
    { id: 7, waktu: '2026-07-10 14:20:08', user: 'admin@dh.or.id', role: 'Finance Admin', modul: 'Aset Tetap', aksi: 'POST', detail: 'Memposting depresiasi bulan Juni untuk Laptop ASUS ROG - Rp 208.333', ip: '103.28.12.45' },
    { id: 8, waktu: '2026-07-10 10:30:00', user: 'staff@dh.or.id', role: 'Finance Staff', modul: 'Kas Bon', aksi: 'SETTLE', detail: 'Settlement kas bon Ahmad Faisal - Realisasi Rp 1.200.000, Kembalian Rp 300.000', ip: '192.168.1.10' },
    { id: 9, waktu: '2026-07-09 16:00:00', user: 'system', role: 'Webhook', modul: 'Transaksi Keuangan', aksi: 'WEBHOOK', detail: 'INVOICE_PAID webhook diterima dari Xendit - Invoice INV-2607090935 - Rp 2.500.000', ip: '52.77.84.123' },
    { id: 10, waktu: '2026-07-09 11:15:45', user: 'admin@dh.or.id', role: 'Finance Admin', modul: 'Grant & Hibah', aksi: 'DISBURSE', detail: 'Mencairkan termin 1 Grant Astra Foundation sebesar Rp 50.000.000', ip: '103.28.12.45' },
    { id: 11, waktu: '2026-07-08 09:00:00', user: 'manager@dh.or.id', role: 'Finance Manager', modul: 'Periode Akuntansi', aksi: 'CLOSE', detail: 'Menutup periode akuntansi bulan Mei 2026 - status: CLOSED', ip: '103.28.12.46' },
    { id: 12, waktu: '2026-07-07 14:30:22', user: 'admin@dh.or.id', role: 'Finance Admin', modul: 'Hutang & Piutang', aksi: 'TRANSFER', detail: 'Transfer internal BCA → Mandiri sebesar Rp 25.000.000 - biaya admin Rp 6.500', ip: '103.28.12.45' },
  ];

  const modules = ['Semua', ...new Set(auditLogs.map(l => l.modul))];

  const filtered = auditLogs
    .filter(l => filterModul === 'Semua' || l.modul === filterModul)
    .filter(l => searchTerm === '' || l.detail.toLowerCase().includes(searchTerm.toLowerCase()) || l.user.toLowerCase().includes(searchTerm.toLowerCase()));

  const getAksiColor = (aksi) => {
    switch (aksi) {
      case 'CREATE': return 'status-success';
      case 'APPROVE': return 'status-info';
      case 'DISBURSE': case 'POST': case 'SETTLE': case 'TRANSFER': return 'status-warning';
      case 'CLOSE': case 'DELETE': return 'status-danger';
      case 'AUTO': case 'WEBHOOK': return 'status-info';
      default: return '';
    }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Audit Trail</h1>
          <p>Log aktivitas pengguna & sistem untuk akuntabilitas dan jejak audit organisasi nirlaba</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
              <Shield size={20} />
            </div>
            <div className="stat-title">Total Log Tercatat</div>
          </div>
          <div className="stat-value">{auditLogs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">User Aktif</div></div>
          <div className="stat-value">{new Set(auditLogs.filter(l => l.user !== 'system').map(l => l.user)).size}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">Aksi Kritikal (Disburse/Close)</div></div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>
            {auditLogs.filter(l => ['DISBURSE', 'CLOSE', 'DELETE'].includes(l.aksi)).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="filters-left">
          <SearchableSelect
            className="form-select"
            options={modules.map(m => ({ value: m, label: m }))}
            value={filterModul}
            onChange={setFilterModul}
          />
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input type="text" placeholder="Cari user atau detail..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>User</th>
              <th>Role</th>
              <th>Modul</th>
              <th>Aksi</th>
              <th>Detail</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(log => (
              <tr key={log.id}>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.waktu}</td>
                <td style={{ fontWeight: 500, fontSize: '0.8rem' }}>{log.user}</td>
                <td style={{ fontSize: '0.75rem' }}>{log.role}</td>
                <td style={{ fontSize: '0.8rem' }}>{log.modul}</td>
                <td>
                  <span className={`status-badge ${getAksiColor(log.aksi)}`}>{log.aksi}</span>
                </td>
                <td style={{ fontSize: '0.8rem', maxWidth: '350px' }}>{log.detail}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
