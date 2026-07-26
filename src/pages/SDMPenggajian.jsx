import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckSquare, Search, Plus, DollarSign, Eye, ShieldCheck
} from 'lucide-react';
import { getAccountingData, formatRupiah, disbursePayrollAction, updateAccountingData } from '../utils/accountingStore';

const SDMPenggajian = () => {
  const [activeTab, setActiveTab] = useState('Master Karyawan');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  const handleProcessPayroll = (periodId) => {
    // Total of all employee basic salaries
    const totalPayroll = data.employees
      .filter(e => e.active)
      .reduce((sum, e) => sum + e.gaji_pokok, 0);

    disbursePayrollAction(periodId, totalPayroll);
    alert(`Payroll bulan ini berhasil diproses! Biaya Gaji sebesar ${formatRupiah(totalPayroll)} diposting ke Keuangan.`);
    reloadData();
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>SDM & Penggajian Karyawan</h1>
          <p>Kelola data kepegawaian yayasan, penggajian bulanan staf, dan slip gaji elektronik</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Users size={20} />
            </div>
            <div className="stat-title">Jumlah Karyawan Aktif</div>
          </div>
          <div className="stat-value">{data.employees.filter(e => e.active).length} Orang</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Master Karyawan', 'Penggajian Bulanan', 'Bukti Potong PPh 21'].map(tab => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-row">
        <div className="filters-left"></div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Cari..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Master Karyawan' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama Karyawan</th>
                <th>Jabatan</th>
                <th>PTKP</th>
                <th style={{ textAlign: 'right' }}>Gaji Pokok</th>
                <th>Bank / Rekening</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.employees
                .filter(e => e.nama.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((e, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{e.nik}</td>
                    <td style={{ fontWeight: 500 }}>{e.nama}</td>
                    <td>{e.jabatan || e.status}</td>
                    <td>{e.ptkp}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(e.gaji_pokok)}</td>
                    <td>{e.bank} - {e.norek}</td>
                    <td>
                      <span className="status-badge status-success">AKTIF</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Penggajian Bulanan' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Periode Gaji</th>
                <th style={{ textAlign: 'right' }}>Total Gaji Bruto</th>
                <th>Status Pembayaran</th>
                <th>Tanggal Bayar</th>
                <th>Diproses Oleh</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.payrollPeriods.map((p, idx) => {
                const totalPayroll = data.employees.filter(e => e.active).reduce((sum, e) => sum + e.gaji_pokok, 0);
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{p.periode}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(totalPayroll)}</td>
                    <td>
                      <span className={`status-badge ${p.status === 'disbursed' ? 'status-success' : 'status-warning'}`}>
                        {p.status === 'disbursed' ? 'TERBAYAR (POSTED)' : 'DRAFT'}
                      </span>
                    </td>
                    <td>{p.tgl_bayar ? new Date(p.tgl_bayar).toLocaleString('id-ID') : '-'}</td>
                    <td>{p.approved_by || '-'}</td>
                    <td>
                      {p.status === 'draft' ? (
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleProcessPayroll(p.id)}>
                          <DollarSign size={14} /> Bayar Gaji
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'Bukti Potong PPh 21' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>NIK</th>
                <th>Nama Karyawan</th>
                <th>Jenis Pajak</th>
                <th style={{ textAlign: 'right' }}>Bruto Setahun</th>
                <th style={{ textAlign: 'right' }}>Potongan PPh 21</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.employees.map((e, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace' }}>{e.nik}</td>
                  <td style={{ fontWeight: 500 }}>{e.nama}</td>
                  <td>PPh Pasal 21 Terutang</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(e.gaji_pokok * 12)}</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>Rp 0 (Di bawah PTKP)</td>
                  <td>
                    <button className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', border: '1px solid #e2e8f0' }}>
                      <ShieldCheck size={14} color="#10b981" /> Cetak Bukpot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SDMPenggajian;
