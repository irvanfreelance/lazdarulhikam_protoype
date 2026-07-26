import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckSquare, Search, Plus, DollarSign, Eye, ShieldCheck
} from 'lucide-react';
import { getAccountingData, formatRupiah, disbursePayrollAction, updateAccountingData } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const PTKP_OPTIONS = ['TK/0', 'TK/1', 'K/0', 'K/1', 'K/2', 'K/3'];

const getNextNik = (employees) => {
  const nums = employees.map(e => {
    const m = /^EMP(\d+)$/.exec(e.nik || '');
    return m ? parseInt(m[1], 10) : 0;
  });
  const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
  return 'EMP' + String(next).padStart(3, '0');
};

const SDMPenggajian = () => {
  const [activeTab, setActiveTab] = useState('Master Karyawan');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});

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

  const openAddEmployeeModal = () => {
    setFormFields({
      nik: getNextNik(data.employees),
      nama: '',
      jabatan: '',
      ptkp: 'TK/0',
      gaji_pokok: '',
      bank: '',
      norek: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const newEmployee = {
      id: String(store.employees.length + 1),
      nik: formFields.nik || getNextNik(store.employees),
      nama: formFields.nama,
      jabatan: formFields.jabatan,
      ptkp: formFields.ptkp,
      gaji_pokok: parseFloat(formFields.gaji_pokok) || 0,
      bank: formFields.bank,
      norek: formFields.norek,
      active: true
    };

    updateAccountingData('laz_employees', [...store.employees, newEmployee]);
    setIsModalOpen(false);
    reloadData();
  };

  const handleCetakBukpot = (emp) => {
    const brutoTahunan = emp.gaji_pokok * 12;
    alert(
      `BUKTI POTONG PPh PASAL 21\n\n` +
      `Nama Karyawan: ${emp.nama}\nNIK: ${emp.nik}\nPTKP: ${emp.ptkp}\n` +
      `Penghasilan Bruto Setahun: ${formatRupiah(brutoTahunan)}\n` +
      `PPh 21 Dipotong: Rp 0 (Di bawah PTKP)`
    );
    window.print();
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>SDM & Penggajian Karyawan</h1>
          <p>Kelola data kepegawaian yayasan, penggajian bulanan staf, dan slip gaji elektronik</p>
        </div>
        {activeTab === 'Master Karyawan' && (
          <div>
            <button className="btn btn-primary" onClick={openAddEmployeeModal}>
              <Plus size={16} /> Tambah Karyawan
            </button>
          </div>
        )}
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
                    <button className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'white', border: '1px solid #e2e8f0' }} onClick={() => handleCetakBukpot(e)}>
                      <ShieldCheck size={14} color="#10b981" /> Cetak Bukpot
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL ADD EMPLOYEE */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Karyawan</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveEmployee}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>NIK</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.nik || ''} onChange={e => setFormFields({ ...formFields, nik: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>PTKP</label>
                  <SearchableSelect
                    className="form-select"
                    options={PTKP_OPTIONS.map(p => ({ value: p, label: p }))}
                    value={formFields.ptkp || 'TK/0'}
                    onChange={val => setFormFields({ ...formFields, ptkp: val })}
                  />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Karyawan</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.nama || ''} onChange={e => setFormFields({ ...formFields, nama: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jabatan</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jabatan || ''} onChange={e => setFormFields({ ...formFields, jabatan: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Gaji Pokok (Rp)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.gaji_pokok || ''} onChange={e => setFormFields({ ...formFields, gaji_pokok: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Bank</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.bank || ''} onChange={e => setFormFields({ ...formFields, bank: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>No. Rekening</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.norek || ''} onChange={e => setFormFields({ ...formFields, norek: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SDMPenggajian;
