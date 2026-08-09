import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { INITIAL_KODE_BANK } from '../utils/finsSettingsStore';

const PAGE_SIZES = [10, 25, 50];

const KodeBank = () => {
  const [rows, setRows] = useState(INITIAL_KODE_BANK);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState({ kode: '', bank: '', description: '' });
  const [exportOpen, setExportOpen] = useState(false);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(r =>
      r.kode.toLowerCase().includes(k) ||
      r.bank.toLowerCase().includes(k) ||
      (r.description || '').toLowerCase().includes(k)
    );
  }, [rows, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => {
    setKeyword(keywordDraft);
    setPage(1);
  };

  const openAdd = () => {
    setEditing(null);
    setFormFields({ kode: '', bank: '', description: '' });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormFields({ kode: row.kode, bank: row.bank, description: row.description || '' });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...formFields } : r));
    } else {
      setRows(prev => [...prev, { id: String(Date.now()), ...formFields }]);
    }
    setModalOpen(false);
  };

  const canSave = formFields.kode.trim() !== '' && formFields.bank.trim() !== '';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Kode Bank</h1>
          <p>Master kode bank yang digunakan untuk parsing mutasi rekening & referensi rekening bank</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Kode Bank
        </button>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari kode, bank, atau deskripsi..."
              value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            Cari
          </button>
        </div>
        <div className="filters-right">
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setExportOpen(o => !o)}>
              <Download size={16} /> Export
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => setExportOpen(false)}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={() => setExportOpen(false)}><FileText size={14} /> CSV</button>
                <button onClick={() => setExportOpen(false)}><File size={14} /> PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Bank</th>
              <th>Description Code</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {paged.map(row => (
              <tr key={row.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{row.kode}</td>
                <td style={{ fontWeight: 500 }}>{row.bank}</td>
                <td style={{ color: '#64748b' }}>{(row.description || '-').slice(0, 60)}</td>
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

        <div className="pagination-bar">
          <div className="pagination-info">
            Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} data
          </div>
          <div className="pagination-controls">
            <select className="pagination-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / halaman</option>)}
            </select>
            <button disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
            <button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <span className="pagination-info">Hal {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editing ? 'Ubah Kode Bank' : 'Tambah Kode Bank'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Kode Bank</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      maxLength={3}
                      placeholder="cth. 014"
                      value={formFields.kode}
                      onChange={e => setFormFields(prev => ({ ...prev, kode: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nama Bank</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="cth. BCA"
                      value={formFields.bank}
                      onChange={e => setFormFields(prev => ({ ...prev, bank: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Deskripsi kode bank (opsional)"
                      value={formFields.description}
                      onChange={e => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editing && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginRight: 'auto' }}
                    onClick={() => { handleDelete(editing.id); setModalOpen(false); }}
                  >
                    Hapus
                  </button>
                )}
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={!canSave}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KodeBank;
