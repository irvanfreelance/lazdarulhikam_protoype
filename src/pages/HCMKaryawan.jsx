import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Briefcase, Search, Plus, Mail, Phone } from 'lucide-react';
import { getAccountingData, updateAccountingData, DEPARTEMEN_OPTIONS, STATUS_KEPEGAWAIAN_OPTIONS } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const getNextNik = (employees) => {
  const nums = employees.map(e => {
    const m = /^EMP(\d+)$/.exec(e.nik || '');
    return m ? parseInt(m[1], 10) : 0;
  });
  const next = (nums.length > 0 ? Math.max(...nums) : 0) + 1;
  return 'EMP' + String(next).padStart(3, '0');
};

const STATUS_BADGE = {
  Tetap: 'status-success',
  Kontrak: 'status-info',
  Magang: 'status-warning',
  'Harian Lepas': 'status-danger'
};

const HCMKaryawan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [data, setData] = useState(() => getAccountingData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});

  const reloadData = () => setData(getAccountingData());

  useEffect(() => {
    reloadData();
  }, []);

  const openAddModal = () => {
    setFormFields({
      nik: getNextNik(data.employees),
      nama: '',
      jabatan: '',
      departemen: DEPARTEMEN_OPTIONS[0],
      status_kepegawaian: 'Tetap',
      tanggal_masuk: new Date().toISOString().substring(0, 10),
      email: '',
      no_hp: '',
      ptkp: 'TK/0',
      gaji_pokok: '',
      bank: '',
      norek: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const newEmployee = {
      id: String(store.employees.length + 1),
      nik: formFields.nik || getNextNik(store.employees),
      nama: formFields.nama,
      jabatan: formFields.jabatan,
      departemen: formFields.departemen,
      status_kepegawaian: formFields.status_kepegawaian,
      tanggal_masuk: formFields.tanggal_masuk,
      email: formFields.email,
      no_hp: formFields.no_hp,
      ptkp: formFields.ptkp || 'TK/0',
      gaji_pokok: parseFloat(formFields.gaji_pokok) || 0,
      bank: formFields.bank,
      norek: formFields.norek,
      active: true
    };

    updateAccountingData('laz_employees', [...store.employees, newEmployee]);
    setIsModalOpen(false);
    reloadData();
  };

  const activeEmployees = data.employees.filter(e => e.active);
  const tetapCount = activeEmployees.filter(e => e.status_kepegawaian === 'Tetap').length;
  const kontrakCount = activeEmployees.filter(e => e.status_kepegawaian === 'Kontrak' || e.status_kepegawaian === 'Magang' || e.status_kepegawaian === 'Harian Lepas').length;

  const filtered = data.employees.filter(e => {
    const matchSearch = (e.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || (e.nik || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = deptFilter ? e.departemen === deptFilter : true;
    return matchSearch && matchDept;
  });

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Data Karyawan</h1>
          <p>Master data kepegawaian yayasan — profil, departemen, status kepegawaian, dan kontak karyawan</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Tambah Karyawan
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Users size={20} />
            </div>
            <div className="stat-title">Total Karyawan Aktif</div>
          </div>
          <div className="stat-value">{activeEmployees.length} Orang</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <UserCheck size={20} />
            </div>
            <div className="stat-title">Karyawan Tetap</div>
          </div>
          <div className="stat-value">{tetapCount} Orang</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <Briefcase size={20} />
            </div>
            <div className="stat-title">Kontrak / Magang / Harian</div>
          </div>
          <div className="stat-value">{kontrakCount} Orang</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">Semua Departemen</option>
              {DEPARTEMEN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama atau NIK..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>NIK</th>
              <th>Nama Karyawan</th>
              <th>Jabatan</th>
              <th>Departemen</th>
              <th>Status Kepegawaian</th>
              <th>Tanggal Masuk</th>
              <th>Kontak</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{e.nik}</td>
                <td style={{ fontWeight: 500 }}>{e.nama}</td>
                <td>{e.jabatan || e.status || '-'}</td>
                <td>{e.departemen || '-'}</td>
                <td>
                  <span className={`status-badge ${STATUS_BADGE[e.status_kepegawaian] || 'status-info'}`}>
                    {(e.status_kepegawaian || '-').toUpperCase()}
                  </span>
                </td>
                <td>{e.tanggal_masuk ? new Date(e.tanggal_masuk).toLocaleDateString('id-ID') : '-'}</td>
                <td>
                  <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {e.email && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><Mail size={12} /> {e.email}</span>}
                    {e.no_hp && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b' }}><Phone size={12} /> {e.no_hp}</span>}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${e.active ? 'status-success' : 'status-danger'}`}>{e.active ? 'AKTIF' : 'NONAKTIF'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ADD EMPLOYEE */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '560px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Karyawan</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>NIK</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.nik || ''} onChange={e => setFormFields({ ...formFields, nik: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Karyawan</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.nama || ''} onChange={e => setFormFields({ ...formFields, nama: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jabatan</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jabatan || ''} onChange={e => setFormFields({ ...formFields, jabatan: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Departemen</label>
                  <SearchableSelect
                    className="form-select"
                    options={DEPARTEMEN_OPTIONS.map(d => ({ value: d, label: d }))}
                    value={formFields.departemen || ''}
                    onChange={val => setFormFields({ ...formFields, departemen: val })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Status Kepegawaian</label>
                  <SearchableSelect
                    className="form-select"
                    options={STATUS_KEPEGAWAIAN_OPTIONS.map(s => ({ value: s, label: s }))}
                    value={formFields.status_kepegawaian || 'Tetap'}
                    onChange={val => setFormFields({ ...formFields, status_kepegawaian: val })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Tanggal Masuk</label>
                  <input type="date" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.tanggal_masuk || ''} onChange={e => setFormFields({ ...formFields, tanggal_masuk: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Email</label>
                  <input type="email" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.email || ''} onChange={e => setFormFields({ ...formFields, email: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>No. HP</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.no_hp || ''} onChange={e => setFormFields({ ...formFields, no_hp: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Gaji Pokok (Rp)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.gaji_pokok || ''} onChange={e => setFormFields({ ...formFields, gaji_pokok: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>PTKP</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.ptkp || ''} onChange={e => setFormFields({ ...formFields, ptkp: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Bank</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.bank || ''} onChange={e => setFormFields({ ...formFields, bank: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>No. Rekening</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
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

export default HCMKaryawan;
