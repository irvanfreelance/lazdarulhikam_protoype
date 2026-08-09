import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { INITIAL_COA, INITIAL_COA_KANTOR, OFFICES } from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const emptyForm = { officeId: OFFICES[0]?.id || '', coaCash: '', coaNonCash: '' };

const CoaKantor = () => {
  const [rows, setRows] = useState(INITIAL_COA_KANTOR);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);

  const coaByCode = useMemo(() => {
    const map = {};
    INITIAL_COA.forEach(c => { map[c.coa] = c.nama; });
    return map;
  }, []);

  const leafCoaOptions = useMemo(() => {
    const parentCodes = new Set(INITIAL_COA.map(c => c.parentCoa).filter(Boolean));
    return INITIAL_COA
      .filter(c => !parentCodes.has(c.coa))
      .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` }));
  }, []);

  const officeName = (id) => OFFICES.find(o => o.id === id)?.nama || '-';

  const duplicateCashCodes = useMemo(() => {
    const counts = {};
    rows.forEach(r => { if (r.coaCash) counts[r.coaCash] = (counts[r.coaCash] || 0) + 1; });
    return new Set(Object.keys(counts).filter(code => counts[code] > 1));
  }, [rows]);

  const openAdd = () => { setEditing(null); setFormFields(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormFields({ officeId: row.officeId, coaCash: row.coaCash, coaNonCash: row.coaNonCash }); setModalOpen(true); };
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

  const canSave = formFields.officeId !== '' && formFields.coaCash !== '';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>COA Kantor</h1>
          <p>Pemetaan akun kas & non kas (COA) untuk setiap kantor/cabang</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Mapping
        </button>
      </div>

      {duplicateCashCodes.size > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
          <AlertTriangle size={16} />
          Terdapat COA Cash yang dipakai lebih dari satu kantor — periksa baris yang ditandai merah.
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kantor</th>
              <th>COA Cash</th>
              <th>Nama COA Cash</th>
              <th>COA Non Cash</th>
              <th>Nama COA Non Cash</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {rows.map(row => {
              const isDup = duplicateCashCodes.has(row.coaCash);
              return (
                <tr key={row.id} style={isDup ? { background: '#fef2f2' } : undefined}>
                  <td style={{ fontWeight: 600 }}>{officeName(row.officeId)}</td>
                  <td style={{ fontFamily: 'monospace', color: isDup ? '#b91c1c' : undefined, fontWeight: isDup ? 700 : 400 }}>{row.coaCash || '-'}</td>
                  <td>{coaByCode[row.coaCash] || '-'}</td>
                  <td style={{ fontFamily: 'monospace' }}>{row.coaNonCash || '-'}</td>
                  <td>{coaByCode[row.coaNonCash] || '-'}</td>
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
              <h2>{editing ? 'Ubah Mapping COA Kantor' : 'Tambah Mapping COA Kantor'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Kantor</label>
                    <SearchableSelect
                      options={OFFICES.map(o => ({ value: o.id, label: o.nama }))}
                      value={formFields.officeId}
                      onChange={val => setFormFields(prev => ({ ...prev, officeId: val }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>COA Cash</label>
                    <SearchableSelect
                      options={leafCoaOptions}
                      value={formFields.coaCash}
                      onChange={val => setFormFields(prev => ({ ...prev, coaCash: val }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>COA Non Cash</label>
                    <SearchableSelect
                      options={leafCoaOptions}
                      value={formFields.coaNonCash}
                      onChange={val => setFormFields(prev => ({ ...prev, coaNonCash: val }))}
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

export default CoaKantor;
