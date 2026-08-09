import React, { useState, useEffect } from 'react';
import { UserCheck, Clock3, CalendarCheck, UserX, Search, Plus } from 'lucide-react';
import {
  getAccountingData, updateAccountingData,
  ATTENDANCE_STATUS_OPTIONS, ATTENDANCE_METHOD_OPTIONS
} from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const todayStr = () => new Date().toISOString().substring(0, 10);

const STATUS_BADGE = {
  Hadir: 'status-success',
  Terlambat: 'status-warning',
  Sakit: 'status-info',
  Izin: 'status-info',
  Cuti: 'status-info',
  Alpha: 'status-danger'
};

const HCMKehadiran = () => {
  const [data, setData] = useState(() => getAccountingData());
  const [tanggalFilter, setTanggalFilter] = useState(todayStr());
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});

  const reloadData = () => setData(getAccountingData());

  useEffect(() => {
    reloadData();
  }, []);

  const openAddModal = () => {
    setFormFields({
      nik: '',
      tanggal: tanggalFilter || todayStr(),
      jam_masuk: '',
      jam_pulang: '',
      status: 'Hadir',
      metode: 'Manual',
      keterangan: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const emp = store.employees.find(x => x.nik === formFields.nik);
    if (!emp) return;

    const newAttendance = {
      id: String(store.attendance.length + 1),
      tanggal: formFields.tanggal,
      nik: emp.nik,
      nama: emp.nama,
      departemen: emp.departemen || '-',
      jam_masuk: formFields.jam_masuk,
      jam_pulang: formFields.jam_pulang,
      status: formFields.status,
      metode: formFields.metode,
      keterangan: formFields.keterangan
    };

    updateAccountingData('laz_attendance', [newAttendance, ...store.attendance]);
    setIsModalOpen(false);
    reloadData();
  };

  const filtered = data.attendance
    .filter(a => (tanggalFilter ? a.tanggal === tanggalFilter : true))
    .filter(a => (a.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) || (a.nik || '').toLowerCase().includes(searchTerm.toLowerCase()));

  const dayRecords = data.attendance.filter(a => a.tanggal === (tanggalFilter || todayStr()));
  const hadirCount = dayRecords.filter(a => a.status === 'Hadir' || a.status === 'Terlambat').length;
  const terlambatCount = dayRecords.filter(a => a.status === 'Terlambat').length;
  const izinSakitCount = dayRecords.filter(a => ['Izin', 'Sakit', 'Cuti'].includes(a.status)).length;
  const alphaCount = dayRecords.filter(a => a.status === 'Alpha').length;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Kehadiran Karyawan</h1>
          <p>Rekap presensi harian karyawan — jam masuk, jam pulang, dan status kehadiran</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} /> Catat Kehadiran
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <UserCheck size={20} />
            </div>
            <div className="stat-title">Hadir</div>
          </div>
          <div className="stat-value">{hadirCount} Orang</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <Clock3 size={20} />
            </div>
            <div className="stat-title">Terlambat</div>
          </div>
          <div className="stat-value">{terlambatCount} Orang</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <CalendarCheck size={20} />
            </div>
            <div className="stat-title">Izin / Sakit / Cuti</div>
          </div>
          <div className="stat-value">{izinSakitCount} Orang</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <UserX size={20} />
            </div>
            <div className="stat-title">Alpha</div>
          </div>
          <div className="stat-value">{alphaCount} Orang</div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <input type="date" value={tanggalFilter} onChange={e => setTanggalFilter(e.target.value)} />
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
              <th>Tanggal</th>
              <th>NIK</th>
              <th>Nama Karyawan</th>
              <th>Departemen</th>
              <th>Jam Masuk</th>
              <th>Jam Pulang</th>
              <th>Status</th>
              <th>Metode</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data presensi untuk filter ini</td></tr>
            ) : filtered.map((a, idx) => (
              <tr key={idx}>
                <td>{new Date(a.tanggal).toLocaleDateString('id-ID')}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{a.nik}</td>
                <td style={{ fontWeight: 500 }}>{a.nama}</td>
                <td>{a.departemen || '-'}</td>
                <td>{a.jam_masuk || '-'}</td>
                <td>{a.jam_pulang || '-'}</td>
                <td>
                  <span className={`status-badge ${STATUS_BADGE[a.status] || 'status-info'}`}>{a.status.toUpperCase()}</span>
                </td>
                <td>{a.metode || '-'}</td>
                <td style={{ maxWidth: '220px', color: '#64748b', fontSize: '0.8rem' }}>{a.keterangan || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CATAT KEHADIRAN */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Catat Kehadiran</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Karyawan</label>
                <SearchableSelect
                  className="form-select"
                  options={data.employees.filter(e => e.active).map(e => ({ value: e.nik, label: `${e.nama} (${e.nik})` }))}
                  value={formFields.nik || ''}
                  onChange={val => setFormFields({ ...formFields, nik: val })}
                  placeholder="Pilih karyawan..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Tanggal</label>
                  <input type="date" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.tanggal || ''} onChange={e => setFormFields({ ...formFields, tanggal: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Status</label>
                  <SearchableSelect
                    className="form-select"
                    options={ATTENDANCE_STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
                    value={formFields.status || 'Hadir'}
                    onChange={val => setFormFields({ ...formFields, status: val })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jam Masuk</label>
                  <input type="time" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jam_masuk || ''} onChange={e => setFormFields({ ...formFields, jam_masuk: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jam Pulang</label>
                  <input type="time" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jam_pulang || ''} onChange={e => setFormFields({ ...formFields, jam_pulang: e.target.value })} />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Metode Presensi</label>
                <SearchableSelect
                  className="form-select"
                  options={ATTENDANCE_METHOD_OPTIONS.map(m => ({ value: m, label: m }))}
                  value={formFields.metode || 'Manual'}
                  onChange={val => setFormFields({ ...formFields, metode: val })}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Keterangan (opsional)</label>
                <textarea rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={formFields.keterangan || ''} onChange={e => setFormFields({ ...formFields, keterangan: e.target.value })} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={!formFields.nik}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HCMKehadiran;
