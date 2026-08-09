import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';
import {
  INITIAL_SUMBER_DANA,
  INITIAL_PROGRAM_PENERIMAAN,
  INITIAL_PROGRAM_PENYALURAN,
} from '../utils/finsSettingsStore';

const TABS = [
  { key: 'sumber-dana', label: 'Sumber Dana' },
  { key: 'penerimaan', label: 'Program Penerimaan' },
  { key: 'penyaluran', label: 'Program Penyaluran' },
];

const SumberDanaTab = ({ rows, onChange }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState({ nama: '', active: true });

  const openAdd = () => { setEditing(null); setFormFields({ nama: '', active: true }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormFields({ nama: row.nama, active: row.active }); setModalOpen(true); };
  const handleDelete = (id) => onChange(rows.filter(r => r.id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      onChange(rows.map(r => r.id === editing.id ? { ...r, ...formFields } : r));
    } else {
      onChange([...rows, { id: String(Date.now()), ...formFields }]);
    }
    setModalOpen(false);
  };

  return (
    <>
      <div className="filters-row">
        <div className="filters-left"></div>
        <div className="filters-right">
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Tambah Sumber Dana
          </button>
        </div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Sumber Dana</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {rows.map(row => (
              <tr key={row.id}>
                <td style={{ fontWeight: 500 }}>{row.nama}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${row.active ? 'status-success' : 'status-danger'}`}>{row.active ? 'Aktif' : 'Non Aktif'}</span>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Edit2 size={18} color="#0ea5e9" title="Ubah" onClick={() => openEdit(row)} />
                    <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(row.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Ubah Sumber Dana' : 'Tambah Sumber Dana'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nama Sumber Dana</label>
                    <input type="text" className="form-input" required value={formFields.nama} onChange={e => setFormFields(prev => ({ ...prev, nama: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <div className="toggle-row" style={{ padding: 0, border: 'none' }}>
                      <span className="toggle-row-label">Status Aktif</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={formFields.active} onChange={e => setFormFields(prev => ({ ...prev, active: e.target.checked }))} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editing && (
                  <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => { handleDelete(editing.id); setModalOpen(false); }}>Hapus</button>
                )}
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={!formFields.nama.trim()}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const ProgramTable = ({ title, rows, onChange, sumberDanaOptions }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const emptyForm = { nama: '', sumberDana: sumberDanaOptions[0]?.value || '', description: '', active: true };
  const [formFields, setFormFields] = useState(emptyForm);

  const openAdd = () => { setEditing(null); setFormFields(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormFields({ nama: row.nama, sumberDana: row.sumberDana, description: row.description, active: row.active }); setModalOpen(true); };
  const handleDelete = (id) => onChange(rows.filter(r => r.id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      onChange(rows.map(r => r.id === editing.id ? { ...r, ...formFields } : r));
    } else {
      onChange([...rows, { id: String(Date.now()), ...formFields }]);
    }
    setModalOpen(false);
  };

  return (
    <>
      <div className="filters-row">
        <div className="filters-left"></div>
        <div className="filters-right">
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Tambah {title}
          </button>
        </div>
      </div>
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Program</th>
              <th>Sumber Dana</th>
              <th>Deskripsi</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {rows.map(row => (
              <tr key={row.id}>
                <td style={{ fontWeight: 500 }}>{row.nama}</td>
                <td>{row.sumberDana}</td>
                <td style={{ color: '#64748b' }}>{row.description || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${row.active ? 'status-success' : 'status-danger'}`}>{row.active ? 'Aktif' : 'Non Aktif'}</span>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Edit2 size={18} color="#0ea5e9" title="Ubah" onClick={() => openEdit(row)} />
                    <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(row.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? `Ubah ${title}` : `Tambah ${title}`}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nama Program</label>
                    <input type="text" className="form-input" required value={formFields.nama} onChange={e => setFormFields(prev => ({ ...prev, nama: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Sumber Dana</label>
                    <SearchableSelect
                      options={sumberDanaOptions}
                      value={formFields.sumberDana}
                      onChange={val => setFormFields(prev => ({ ...prev, sumberDana: val }))}
                    />
                  </div>
                  <div className="form-group">
                    <div className="toggle-row" style={{ padding: 0, border: 'none' }}>
                      <span className="toggle-row-label">Status Aktif</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={formFields.active} onChange={e => setFormFields(prev => ({ ...prev, active: e.target.checked }))} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Deskripsi</label>
                    <textarea className="form-textarea" value={formFields.description} onChange={e => setFormFields(prev => ({ ...prev, description: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editing && (
                  <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => { handleDelete(editing.id); setModalOpen(false); }}>Hapus</button>
                )}
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={!formFields.nama.trim()}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

const Program = () => {
  const [activeTab, setActiveTab] = useState('sumber-dana');
  const [sumberDana, setSumberDana] = useState(INITIAL_SUMBER_DANA);
  const [penerimaan, setPenerimaan] = useState(INITIAL_PROGRAM_PENERIMAAN);
  const [penyaluran, setPenyaluran] = useState(INITIAL_PROGRAM_PENYALURAN);

  const sumberDanaOptions = useMemo(
    () => sumberDana.filter(s => s.active).map(s => ({ value: s.nama, label: s.nama })),
    [sumberDana]
  );

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Program</h1>
          <p>Konfigurasi sumber dana serta program penerimaan dan penyaluran</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {TABS.map(tab => (
            <div
              key={tab.key}
              className={`tab-item ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {activeTab === 'sumber-dana' && <SumberDanaTab rows={sumberDana} onChange={setSumberDana} />}
      {activeTab === 'penerimaan' && (
        <ProgramTable title="Program Penerimaan" rows={penerimaan} onChange={setPenerimaan} sumberDanaOptions={sumberDanaOptions} />
      )}
      {activeTab === 'penyaluran' && (
        <ProgramTable title="Program Penyaluran" rows={penyaluran} onChange={setPenyaluran} sumberDanaOptions={sumberDanaOptions} />
      )}
    </div>
  );
};

export default Program;
