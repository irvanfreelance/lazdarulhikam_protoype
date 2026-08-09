import React, { useState, useMemo } from 'react';
import { Edit2, X } from 'lucide-react';
import { INITIAL_LEVEL_APPROVE, POSITIONS } from '../utils/finsCoaStore';
import { formatRupiah } from '../utils/accountingStore';

const emptyForm = { expendMin: 0, expendMax: '', receiptMin: 0, receiptMax: '', aktif: true };

const LevelApprove = () => {
  const [rows, setRows] = useState(INITIAL_LEVEL_APPROVE);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJabatan, setEditingJabatan] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);

  const combined = useMemo(() => POSITIONS.map(pos => {
    const config = rows.find(r => r.jabatan === pos.nama);
    return { jabatan: pos.nama, config: config || null };
  }), [rows]);

  const filtered = combined.filter(item => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'configured') return !!item.config;
    return !item.config;
  });

  const openEdit = (jabatan, config) => {
    setEditingJabatan(jabatan);
    setFormFields({
      expendMin: config?.expendMin ?? 0,
      expendMax: config?.expendMax ?? '',
      receiptMin: config?.receiptMin ?? 0,
      receiptMax: config?.receiptMax ?? '',
      aktif: config?.aktif ?? true,
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      jabatan: editingJabatan,
      expendMin: Number(formFields.expendMin) || 0,
      expendMax: formFields.expendMax === '' ? null : Number(formFields.expendMax),
      receiptMin: Number(formFields.receiptMin) || 0,
      receiptMax: formFields.receiptMax === '' ? null : Number(formFields.receiptMax),
      aktif: formFields.aktif,
    };
    setRows(prev => {
      const exists = prev.find(r => r.jabatan === editingJabatan);
      if (exists) return prev.map(r => r.jabatan === editingJabatan ? { ...r, ...payload } : r);
      return [...prev, { id: String(Date.now()), ...payload }];
    });
    setModalOpen(false);
  };

  const formatRange = (min, max) => `${formatRupiah(min)} s/d ${max === null || max === undefined ? 'Tak Terbatas' : formatRupiah(max)}`;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Level Approve</h1>
          <p>Batas nominal & jenjang approval transaksi keuangan per jabatan</p>
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Status: Semua</option>
            <option value="configured">Sudah diatur</option>
            <option value="unconfigured">Belum diatur</option>
          </select>
        </div>
        <div className="filters-right"></div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Jabatan</th>
              <th>Expend Level</th>
              <th>Receipt Level</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data</td></tr>
            )}
            {filtered.map(item => (
              <tr key={item.jabatan}>
                <td style={{ fontWeight: 600 }}>{item.jabatan}</td>
                <td style={{ fontSize: '0.85rem' }}>{item.config ? formatRange(item.config.expendMin, item.config.expendMax) : '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>{item.config ? formatRange(item.config.receiptMin, item.config.receiptMax) : '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${item.config ? 'status-success' : 'status-warning'}`}>{item.config ? 'Sudah diatur' : 'Belum diatur'}</span>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Edit2 size={18} color="#0ea5e9" title="Atur" onClick={() => openEdit(item.jabatan, item.config)} />
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
              <h2>Atur Level Approve</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Jabatan</label>
                    <input type="text" className="form-input" disabled value={editingJabatan || ''} />
                  </div>
                  <div className="form-group">
                    <label>Expend Min (Rp)</label>
                    <input type="number" className="form-input" value={formFields.expendMin}
                      onChange={e => setFormFields(prev => ({ ...prev, expendMin: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Expend Max (Rp)</label>
                    <input type="number" className="form-input" placeholder="Kosongkan = tak terbatas" value={formFields.expendMax}
                      onChange={e => setFormFields(prev => ({ ...prev, expendMax: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Receipt Min (Rp)</label>
                    <input type="number" className="form-input" value={formFields.receiptMin}
                      onChange={e => setFormFields(prev => ({ ...prev, receiptMin: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Receipt Max (Rp)</label>
                    <input type="number" className="form-input" placeholder="Kosongkan = tak terbatas" value={formFields.receiptMax}
                      onChange={e => setFormFields(prev => ({ ...prev, receiptMax: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <div className="toggle-row" style={{ padding: 0, border: 'none' }}>
                      <span className="toggle-row-label">Aktif</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={formFields.aktif} onChange={e => setFormFields(prev => ({ ...prev, aktif: e.target.checked }))} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelApprove;
