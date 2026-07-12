import React, { useState } from 'react';
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Wallet, 
  FileText,
  Plus,
  Filter, Search,
  Download,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';

const TransaksiKeuangan = () => {
  const [activeTab, setActiveTab] = useState('Penerimaan');

  const tabs = ['Penerimaan', 'Pengeluaran', 'Jurnal Umum', 'Opname & Saldo'];

  // Mock Data based on the README context
  const mockPenerimaan = [
    { id: '260501070935123456', tgl: '12 Jul 2026 09:35', donatur: 'Hamba Allah', channel: 'Xendit QRIS', coa: '401.01.001.000 (Donasi Kesehatan)', nominal: 'Rp 5.000.000', status: 'PAID' },
    { id: '260501070940987654', tgl: '12 Jul 2026 10:15', donatur: 'Budi Santoso', channel: 'BCA VA', coa: '401.02.001.000 (Pendidikan)', nominal: 'Rp 2.500.000', status: 'PAID' },
    { id: '260501071010112233', tgl: '11 Jul 2026 14:20', donatur: 'PT ABC Sejahtera', channel: 'Mandiri Manual', coa: '401.05.001.000 (Zakat Perusahaan)', nominal: 'Rp 50.000.000', status: 'PENDING' },
    { id: '260501071155445566', tgl: '11 Jul 2026 16:45', donatur: 'Siti Aminah', channel: 'ShopeePay', coa: '401.03.001.000 (Pembangunan Masjid)', nominal: 'Rp 100.000', status: 'PAID' },
    { id: '260501071230998877', tgl: '10 Jul 2026 08:10', donatur: 'Anonim', channel: 'Alfamart', coa: '401.01.001.000 (Donasi Kesehatan)', nominal: 'Rp 50.000', status: 'PAID' },
  ];

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Transaksi Keuangan</h1>
          <p>Kelola penerimaan donasi, pengeluaran, dan jurnal akuntansi</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#64748b' }}>
            <Download size={16} /> Export
          </button>
          <button className="btn btn-primary">
            <Plus size={16} /> Buat Transaksi
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <ArrowDownToLine size={20} />
            </div>
            <div className="stat-title">Total Penerimaan (Bulan ini)</div>
          </div>
          <div className="stat-value">Rp 125.450.000</div>
          <div>
            <span className="stat-trend trend-up">↑ 12.5%</span> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>dari bulan lalu</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <ArrowUpFromLine size={20} />
            </div>
            <div className="stat-title">Total Pengeluaran (Bulan ini)</div>
          </div>
          <div className="stat-value">Rp 84.200.000</div>
          <div>
            <span className="stat-trend" style={{ color: '#ef4444', background: '#fee2e2' }}>↑ 5.2%</span> <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>dari bulan lalu</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Wallet size={20} />
            </div>
            <div className="stat-title">Saldo Kas & Bank</div>
          </div>
          <div className="stat-value">Rp 450.750.000</div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Update terakhir: Hari ini, 09:00</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}>
              <FileText size={20} />
            </div>
            <div className="stat-title">Jurnal Belum Posting</div>
          </div>
          <div className="stat-value">12 Draft</div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b' }}>Perlu review admin</span>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {tabs.map((tab) => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Filter size={16} />
            <select>
              <option>Semua Channel</option>
              <option>Xendit QRIS</option>
              <option>BCA VA</option>
              <option>Mandiri Manual</option>
            </select>
          </div>
          <div className="filter-input">
            <select>
              <option>Bulan Ini</option>
              <option>Bulan Lalu</option>
              <option>Tahun Ini</option>
            </select>
          </div>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input type="text" placeholder="Cari ID Transaksi / Nama..." />
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Transaksi</th>
              <th>Tanggal</th>
              <th>Keterangan / Donatur</th>
              <th>Channel</th>
              <th>Akun Penerimaan (COA)</th>
              <th style={{ textAlign: 'right' }}>Nominal</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {mockPenerimaan.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'monospace', color: '#64748b' }}>{item.id}</td>
                <td>{item.tgl}</td>
                <td style={{ fontWeight: 500 }}>{item.donatur}</td>
                <td>{item.channel}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                    {item.coa}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.nominal}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${item.status === 'PAID' ? 'status-success' : 'status-warning'}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Eye size={18} title="Lihat Jurnal" />
                    {item.status === 'PENDING' && (
                      <CheckCircle size={18} color="#10b981" title="Approve" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransaksiKeuangan;
