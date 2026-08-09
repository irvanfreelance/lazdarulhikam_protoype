import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { INITIAL_COA, INITIAL_SALDO_DANA, levelOf } from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const emptyForm = { coa: '', coaExpense: '', coaRevenue: '', operasional: false, aktif: true };

const SaldoDana = () => {
  const [rows, setRows] = useState(INITIAL_SALDO_DANA);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);

  const coaByCode = useMemo(() => {
    const map = {};
    INITIAL_COA.forEach(c => { map[c.coa] = c; });
    return map;
  }, []);

  const coaOptions = useMemo(() => INITIAL_COA.map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);

  const openAdd = () => { setEditing(null); setFormFields(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormFields({ ...row }); setModalOpen(true); };
  const handleDelete = (id) => setRows(prev => prev.filter(r => r.id !== id));

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...formFields } : r));
    } else {
      setRows(prev => [...prev, { id: String(Date.now()), ...formFields }]);
    }
    setModalOpen(false);
  };

  const canSave = formFields.coa !== '';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Saldo Dana</h1>
          <p>Mapping akun (COA) ke akun beban/penerimaan untuk perhitungan saldo dana per kategori</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Mapping
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>COA</th>
              <th>Nama COA</th>
              <th>COA Expense</th>
              <th>COA Revenue</th>
              <th style={{ textAlign: 'center' }}>Operasional</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {rows.map(row => {
              const coaInfo = coaByCode[row.coa];
              const depth = coaInfo ? levelOf(row.coa, INITIAL_COA) : 1;
              return (
                <tr key={row.id} style={!row.aktif ? { opacity: 0.5 } : undefined}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{row.coa}</td>
                  <td style={{ paddingLeft: `${(depth - 1) * 16 + 12}px` }}>{coaInfo?.nama || '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.coaExpense || '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.coaRevenue || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-badge ${row.operasional ? 'status-info' : 'status-warning'}`}>{row.operasional ? 'Ya' : 'Tidak'}</span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`status-badge ${row.aktif ? 'status-success' : 'status-danger'}`}>{row.aktif ? 'Aktif' : 'Non Aktif'}</span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <Edit2 size={18} color="#0ea5e9" title="Ubah" onClick={() => openEdit(row)} />
                      <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDelete(row.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Ubah Mapping Saldo Dana' : 'Tambah Mapping Saldo Dana'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>COA</label>
                    <SearchableSelect options={coaOptions} value={formFields.coa} onChange={val => setFormFields(prev => ({ ...prev, coa: val }))} />
                  </div>
                  <div className="form-group">
                    <label>COA Expense</label>
                    <SearchableSelect options={[{ value: '', label: '— Tidak diset —' }, ...coaOptions]} value={formFields.coaExpense} onChange={val => setFormFields(prev => ({ ...prev, coaExpense: val }))} />
                  </div>
                  <div className="form-group">
                    <label>COA Revenue</label>
                    <SearchableSelect options={[{ value: '', label: '— Tidak diset —' }, ...coaOptions]} value={formFields.coaRevenue} onChange={val => setFormFields(prev => ({ ...prev, coaRevenue: val }))} />
                  </div>
                  <div className="form-group">
                    <label>Operasional</label>
                    <SearchableSelect
                      options={[{ value: 'ya', label: 'Ya' }, { value: 'tidak', label: 'Tidak' }]}
                      value={formFields.operasional ? 'ya' : 'tidak'}
                      onChange={val => setFormFields(prev => ({ ...prev, operasional: val === 'ya' }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Aktif</label>
                    <SearchableSelect
                      options={[{ value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Non Aktif' }]}
                      value={formFields.aktif ? 'aktif' : 'nonaktif'}
                      onChange={val => setFormFields(prev => ({ ...prev, aktif: val === 'aktif' }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editing && (
                  <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => { handleDelete(editing.id); setModalOpen(false); }}>Hapus</button>
                )}
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={!canSave}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaldoDana;
