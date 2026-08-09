import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, X, Search, RefreshCw } from 'lucide-react';
import { INITIAL_SALDO_DANA } from '../utils/finsCoaStore';

const PAGE_SIZES = [10, 25, 50];

const emptyForm = { coa: '', namaCoa: '', coaExpenseText: '', coaRevenueText: '', operasional: false, level: 1, aktif: true };

const toText = (arr) => (arr || []).join(', ');
const toArray = (text) => text.split(',').map(s => s.trim()).filter(Boolean);

const SaldoDana = () => {
  const [rows, setRows] = useState(INITIAL_SALDO_DANA);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return rows.filter(r => {
      const matchesKeyword = !k ||
        r.coa.toLowerCase().includes(k) ||
        r.namaCoa.toLowerCase().includes(k) ||
        toText(r.coaExpense).toLowerCase().includes(k) ||
        toText(r.coaRevenue).toLowerCase().includes(k);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'aktif' ? r.aktif : !r.aktif);
      return matchesKeyword && matchesStatus;
    });
  }, [rows, keyword, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };
  const refresh = () => { setKeywordDraft(''); setKeyword(''); setStatusFilter('all'); setPage(1); setSelectedIds(new Set()); };

  const allOnPageSelected = paged.length > 0 && paged.every(r => selectedIds.has(r.id));
  const toggleSelectAllOnPage = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        paged.forEach(r => next.delete(r.id));
      } else {
        paged.forEach(r => next.add(r.id));
      }
      return next;
    });
  };
  const toggleSelectRow = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Hapus ${selectedIds.size} baris saldo dana terpilih?`)) return;
    setRows(prev => prev.filter(r => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  const handleDeleteOne = (id) => {
    if (!window.confirm('Hapus baris ini?')) return;
    setRows(prev => prev.filter(r => r.id !== id));
    setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const openAdd = () => { setEditing(null); setFormFields(emptyForm); setModalOpen(true); };
  const openEdit = (row) => {
    setEditing(row);
    setFormFields({
      coa: row.coa,
      namaCoa: row.namaCoa,
      coaExpenseText: toText(row.coaExpense),
      coaRevenueText: toText(row.coaRevenue),
      operasional: row.operasional,
      level: row.level,
      aktif: row.aktif,
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = {
      coa: formFields.coa,
      namaCoa: formFields.namaCoa,
      coaExpense: toArray(formFields.coaExpenseText),
      coaRevenue: toArray(formFields.coaRevenueText),
      operasional: formFields.operasional,
      level: Number(formFields.level),
      aktif: formFields.aktif,
    };
    if (editing) {
      setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...payload } : r));
    } else {
      setRows(prev => [...prev, { id: String(Date.now()), ...payload }]);
    }
    setModalOpen(false);
  };

  const canSave = formFields.coa.trim() !== '' && formFields.namaCoa.trim() !== '';

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

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Keyword..."
              value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>Search</button>
          <button
            className="btn btn-danger"
            disabled={selectedIds.size === 0}
            onClick={handleDeleteSelected}
          >
            <Trash2 size={16} /> Delete{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
          </button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={refresh} title="Reset filter">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="filters-right">
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">Status: Semua</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non Aktif</option>
          </select>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '32px' }}>
                <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAllOnPage} />
              </th>
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
            {paged.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {paged.map(row => (
              <tr key={row.id} style={!row.aktif ? { opacity: 0.5 } : undefined}>
                <td>
                  <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelectRow(row.id)} />
                </td>
                <td style={{ fontFamily: 'monospace', fontWeight: row.level === 1 ? 'bold' : 'normal' }}>{row.coa}</td>
                <td style={{ paddingLeft: `${(row.level - 1) * 20 + 12}px`, fontWeight: row.level === 1 ? 700 : 400 }}>{row.namaCoa}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>{toText(row.coaExpense) || '-'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>{toText(row.coaRevenue) || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${row.operasional ? 'status-info' : 'status-warning'}`}>{row.operasional ? 'Ya' : 'Tidak'}</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${row.aktif ? 'status-success' : 'status-danger'}`}>{row.aktif ? 'Aktif' : 'Non Aktif'}</span>
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Edit2 size={18} color="#0ea5e9" title="Ubah" onClick={() => openEdit(row)} />
                    <Trash2 size={18} color="#ef4444" title="Hapus" onClick={() => handleDeleteOne(row.id)} />
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
              <h2>{editing ? 'Ubah Mapping Saldo Dana' : 'Tambah Mapping Saldo Dana'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>COA</label>
                    <input type="text" className="form-input" required style={{ fontFamily: 'monospace' }} placeholder="cth. 301.00.000.000"
                      value={formFields.coa} onChange={e => setFormFields(prev => ({ ...prev, coa: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Nama COA</label>
                    <input type="text" className="form-input" required
                      value={formFields.namaCoa} onChange={e => setFormFields(prev => ({ ...prev, namaCoa: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <label>COA Expense</label>
                    <input type="text" className="form-input" style={{ fontFamily: 'monospace' }} placeholder="Pisahkan dengan koma, cth. 501.00.000.000, 502.01.000.000"
                      value={formFields.coaExpenseText} onChange={e => setFormFields(prev => ({ ...prev, coaExpenseText: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <label>COA Revenue</label>
                    <input type="text" className="form-input" style={{ fontFamily: 'monospace' }} placeholder="Pisahkan dengan koma, cth. 401.00.000.000, 402.01.000.000"
                      value={formFields.coaRevenueText} onChange={e => setFormFields(prev => ({ ...prev, coaRevenueText: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select className="form-select" value={formFields.level} onChange={e => setFormFields(prev => ({ ...prev, level: e.target.value }))}>
                      <option value={1}>Level 1 (Header Kategori)</option>
                      <option value={2}>Level 2 (Rincian)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <div className="toggle-row" style={{ padding: 0, border: 'none' }}>
                      <span className="toggle-row-label">Operasional</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={formFields.operasional} onChange={e => setFormFields(prev => ({ ...prev, operasional: e.target.checked }))} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
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
                {editing && (
                  <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => { handleDeleteOne(editing.id); setModalOpen(false); }}>Hapus</button>
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
