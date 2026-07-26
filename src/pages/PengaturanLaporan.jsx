import React, { useState } from 'react';
import { GripVertical, Plus, Save, Edit2 } from 'lucide-react';
import { getAccountingData, updateAccountingData } from '../utils/accountingStore';

const PengaturanLaporan = () => {
  const [activeTab, setActiveTab] = useState('Struktur Baris Laporan');
  const [reportRows, setReportRows] = useState(() => getAccountingData().reportRows);
  const [calkNotes, setCalkNotes] = useState(() => getAccountingData().calkNotes);
  const [filterReport, setFilterReport] = useState('ALL');
  const [isRowModalOpen, setIsRowModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});

  const toggleRowActive = (rowId) => {
    const updated = reportRows.map(r => r.id === rowId ? { ...r, active: !r.active } : r);
    setReportRows(updated);
    updateAccountingData('laz_report_rows', updated);
  };

  const openAddRow = () => {
    setFormFields({ report: 'LPK', kode: '', nama: '', coa: '', sort: reportRows.length + 1 });
    setIsRowModalOpen(true);
  };

  const handleSaveRow = (e) => {
    e.preventDefault();
    const newRow = {
      id: reportRows.length > 0 ? Math.max(...reportRows.map(r => r.id)) + 1 : 1,
      report: formFields.report,
      kode: formFields.kode,
      nama: formFields.nama,
      coa: formFields.coa,
      sort: parseInt(formFields.sort) || reportRows.length + 1,
      active: true
    };
    const updated = [...reportRows, newRow];
    setReportRows(updated);
    updateAccountingData('laz_report_rows', updated);
    setIsRowModalOpen(false);
    alert('Baris laporan berhasil disimpan.');
  };

  const openEditNote = (note) => {
    setFormFields({ ...note });
    setIsNoteModalOpen(true);
  };

  const openAddNote = () => {
    setFormFields({ nomor: calkNotes.length + 1, judul: '', periode: 'TA 2026', isi: '', status: 'draft' });
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    const isEdit = calkNotes.some(n => n.id === formFields.id);
    let updated;
    if (isEdit) {
      updated = calkNotes.map(n => n.id === formFields.id ? { ...formFields, nomor: parseInt(formFields.nomor) } : n);
    } else {
      const newNote = {
        id: calkNotes.length > 0 ? Math.max(...calkNotes.map(n => n.id)) + 1 : 1,
        nomor: parseInt(formFields.nomor) || calkNotes.length + 1,
        judul: formFields.judul,
        periode: formFields.periode,
        isi: formFields.isi,
        status: formFields.status || 'draft'
      };
      updated = [...calkNotes, newNote];
    }
    setCalkNotes(updated);
    updateAccountingData('laz_calk_notes', updated);
    setIsNoteModalOpen(false);
    alert('Catatan CALK berhasil disimpan.');
  };

  const filtered = filterReport === 'ALL' ? reportRows : reportRows.filter(r => r.report === filterReport);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Pengaturan Laporan</h1>
          <p>Konfigurasi struktur baris laporan keuangan dan Catatan Atas Laporan Keuangan (CALK)</p>
        </div>
        <div>
          {activeTab === 'Struktur Baris Laporan' && (
            <button className="btn btn-primary" onClick={openAddRow}>
              <Plus size={16} /> Tambah Baris
            </button>
          )}
          {activeTab === 'CALK' && (
            <button className="btn btn-primary" onClick={openAddNote}>
              <Plus size={16} /> Tambah Catatan
            </button>
          )}
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
                      <span
                        className={`status-badge ${row.active ? 'status-success' : 'status-danger'}`}
                        style={{ cursor: 'pointer' }}
                        title="Klik untuk mengubah status"
                        onClick={() => toggleRowActive(row.id)}
                      >
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
                  <th>Aksi</th>
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
                    <td>
                      <button className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: '#eef2ff', color: '#4f46e5', border: 'none' }} onClick={() => openEditNote(note)}>
                        <Edit2 size={12} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH BARIS */}
      {isRowModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Baris Laporan</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsRowModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveRow}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jenis Laporan</label>
                  <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.report || 'LPK'} onChange={e => setFormFields({ ...formFields, report: e.target.value })}>
                    <option value="LPK">LPK</option>
                    <option value="LPO">LPO</option>
                    <option value="LAK">LAK</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kode Baris</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.kode || ''} onChange={e => setFormFields({ ...formFields, kode: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Akun / Baris</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.nama || ''} onChange={e => setFormFields({ ...formFields, nama: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>COA Range</label>
                  <input type="text" placeholder="cth. 401.xx" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.coa || ''} onChange={e => setFormFields({ ...formFields, coa: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Urutan</label>
                  <input type="number" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.sort || ''} onChange={e => setFormFields({ ...formFields, sort: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsRowModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary"><Save size={14} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CALK NOTE */}
      {isNoteModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '560px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{formFields.id ? 'Edit' : 'Tambah'} Catatan CALK</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsNoteModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveNote}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Judul Catatan</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.judul || ''} onChange={e => setFormFields({ ...formFields, judul: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Periode</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.periode || ''} onChange={e => setFormFields({ ...formFields, periode: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Isi Catatan</label>
                <textarea rows={5} required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'inherit' }}
                  value={formFields.isi || ''} onChange={e => setFormFields({ ...formFields, isi: e.target.value })} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Status</label>
                <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.status || 'draft'} onChange={e => setFormFields({ ...formFields, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="final">Final</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsNoteModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary"><Save size={14} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengaturanLaporan;
