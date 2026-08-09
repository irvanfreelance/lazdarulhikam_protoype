import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Edit2, Trash2, X, Search, Download, FileSpreadsheet, FileText, File,
  ArrowUp, ArrowDown, Copy, Upload, Trash
} from 'lucide-react';
import { INITIAL_RUMUS_TEMPLATES } from '../utils/finsCoaStore';

const PAGE_SIZES = [10, 25, 50];
const LEVELS = [1, 2, 3];
const emptyForm = { nama: '', rumus: '', level: 1, kode: '', keterangan: '' };

const RumusReport = () => {
  const [templates, setTemplates] = useState(INITIAL_RUMUS_TEMPLATES);
  const [activeTemplate, setActiveTemplate] = useState(Object.keys(INITIAL_RUMUS_TEMPLATES)[0]);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);
  const [saveAsOpen, setSaveAsOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [saveAsError, setSaveAsError] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef(null);

  const rows = templates[activeTemplate] || [];

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) => a.sort - b.sort);
    if (!k) return sorted;
    return sorted.filter(r =>
      r.nama.toLowerCase().includes(k) ||
      r.rumus.toLowerCase().includes(k) ||
      (r.keterangan || '').toLowerCase().includes(k) ||
      (r.kode || '').toLowerCase().includes(k)
    );
  }, [rows, keyword]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const switchTemplate = (name) => {
    setActiveTemplate(name);
    setKeyword('');
    setKeywordDraft('');
    setPage(1);
  };

  const openAddRow = () => { setEditingRow(null); setFormFields(emptyForm); setModalOpen(true); };
  const openEditRow = (row) => { setEditingRow(row); setFormFields({ nama: row.nama, rumus: row.rumus, level: row.level, kode: row.kode || '', keterangan: row.keterangan || '' }); setModalOpen(true); };

  const handleDeleteRow = (row) => {
    if (row.locked) return;
    if (!window.confirm(`Hapus rumus "${row.nama}"?`)) return;
    setTemplates(prev => ({ ...prev, [activeTemplate]: prev[activeTemplate].filter(r => r.id !== row.id) }));
  };

  const handleSaveRow = (e) => {
    e.preventDefault();
    setTemplates(prev => {
      const current = prev[activeTemplate];
      if (editingRow) {
        return { ...prev, [activeTemplate]: current.map(r => r.id === editingRow.id ? { ...r, ...formFields, level: Number(formFields.level) } : r) };
      }
      const nextId = current.length ? Math.max(...current.map(r => r.id)) + 1 : 1;
      const nextSort = current.length ? Math.max(...current.map(r => r.sort)) + 1 : 1;
      return { ...prev, [activeTemplate]: [...current, { id: nextId, sort: nextSort, locked: false, ...formFields, level: Number(formFields.level) }] };
    });
    setModalOpen(false);
  };

  const handleMove = (row, dir) => {
    setTemplates(prev => {
      const current = [...prev[activeTemplate]].sort((a, b) => a.sort - b.sort);
      const idx = current.findIndex(r => r.id === row.id);
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= current.length) return prev;
      const a = current[idx];
      const b = current[swapIdx];
      const updated = current.map(r => {
        if (r.id === a.id) return { ...r, sort: b.sort };
        if (r.id === b.id) return { ...r, sort: a.sort };
        return r;
      });
      return { ...prev, [activeTemplate]: updated };
    });
  };

  const handleSaveAs = (e) => {
    e.preventDefault();
    const name = saveAsName.trim();
    if (!name) return;
    if (Object.keys(templates).includes(name)) {
      setSaveAsError('Nama report sudah dipakai.');
      return;
    }
    setTemplates(prev => ({ ...prev, [name]: rows.map(r => ({ ...r })) }));
    setActiveTemplate(name);
    setSaveAsOpen(false);
    setSaveAsName('');
    setSaveAsError('');
  };

  const handleDeleteTemplate = () => {
    const names = Object.keys(templates);
    if (names.length <= 1) return;
    if (!window.confirm(`Hapus report "${activeTemplate}" beserta seluruh rumusnya?`)) return;
    setTemplates(prev => {
      const next = { ...prev };
      delete next[activeTemplate];
      return next;
    });
    const remaining = names.filter(n => n !== activeTemplate);
    switchTemplate(remaining[0]);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(`File '${file.name}' siap diimpor ke '${activeTemplate}' (simulasi).`);
    setTimeout(() => setImportMessage(''), 4000);
    e.target.value = '';
  };

  const canSaveRow = formFields.nama.trim() !== '' && formFields.rumus.trim() !== '';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Rumus Report</h1>
          <p>Konfigurasi formula & struktur penyajian baris laporan keuangan per template report</p>
        </div>
        <button className="btn btn-primary" onClick={openAddRow}>
          <Plus size={16} /> Tambah Rumus
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {Object.keys(templates).map(name => (
            <div key={name} className={`tab-item ${activeTemplate === name ? 'active' : ''}`} onClick={() => switchTemplate(name)}>
              {name}
            </div>
          ))}
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama, rumus, keterangan, atau kode..."
              value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>Cari</button>
        </div>
        <div className="filters-right">
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setSaveAsOpen(true)}>
            <Copy size={16} /> Save As
          </button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Import
          </button>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={handleImportFile} />
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
          <button className="btn btn-danger" disabled={Object.keys(templates).length <= 1} onClick={handleDeleteTemplate} title="Hapus report ini">
            <Trash size={16} /> Hapus Report
          </button>
        </div>
      </div>

      {importMessage && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
          {importMessage}
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#ID</th>
              <th>Nama Penyajian</th>
              <th>Rumus</th>
              <th style={{ textAlign: 'center' }}>Level</th>
              <th>Keterangan</th>
              <th>Kode</th>
              <th style={{ textAlign: 'center' }}>Sort</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada rumus pada report ini.</td></tr>
            )}
            {paged.map((row, idx) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td style={{ paddingLeft: `${(row.level - 1) * 16 + 12}px`, fontWeight: row.level === 1 ? 600 : 400 }}>{row.nama}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>{row.rumus}</td>
                <td style={{ textAlign: 'center' }}>{row.level}</td>
                <td style={{ color: '#64748b' }}>{row.keterangan || '-'}</td>
                <td style={{ fontFamily: 'monospace' }}>{row.kode || '-'}</td>
                <td style={{ textAlign: 'center' }}>{row.sort}</td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <ArrowUp size={16} color={idx === 0 && currentPage === 1 ? '#cbd5e1' : '#0ea5e9'} title="Naikkan" onClick={() => handleMove(row, 'up')} />
                    <ArrowDown size={16} color="#0ea5e9" title="Turunkan" onClick={() => handleMove(row, 'down')} />
                    <Edit2 size={18} color="#0ea5e9" title="Ubah" onClick={() => openEditRow(row)} />
                    <Trash2
                      size={18}
                      color={row.locked ? '#cbd5e1' : '#ef4444'}
                      title={row.locked ? 'Baris terkunci, tidak bisa dihapus' : 'Hapus'}
                      style={{ cursor: row.locked ? 'not-allowed' : 'pointer' }}
                      onClick={() => handleDeleteRow(row)}
                    />
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
              <h2>{editingRow ? 'Ubah Rumus' : 'Tambah Rumus'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveRow}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nama Penyajian</label>
                    <input type="text" className="form-input" required value={formFields.nama}
                      onChange={e => setFormFields(prev => ({ ...prev, nama: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <label>Rumus</label>
                    <textarea className="form-textarea" required placeholder="cth. 101.01.000.000+101.02.000.000" style={{ fontFamily: 'monospace' }}
                      value={formFields.rumus} onChange={e => setFormFields(prev => ({ ...prev, rumus: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select className="form-select" value={formFields.level} onChange={e => setFormFields(prev => ({ ...prev, level: e.target.value }))}>
                      {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Kode</label>
                    <input type="text" className="form-input" value={formFields.kode}
                      onChange={e => setFormFields(prev => ({ ...prev, kode: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <label>Keterangan</label>
                    <textarea className="form-textarea" value={formFields.keterangan}
                      onChange={e => setFormFields(prev => ({ ...prev, keterangan: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {editingRow && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginRight: 'auto' }}
                    disabled={editingRow.locked}
                    title={editingRow.locked ? 'Baris terkunci, tidak bisa dihapus' : ''}
                    onClick={() => { handleDeleteRow(editingRow); setModalOpen(false); }}
                  >
                    Hapus
                  </button>
                )}
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={!canSaveRow}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {saveAsOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2>Simpan Sebagai Report Baru</h2>
              <button className="modal-close" onClick={() => setSaveAsOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAs}>
              <div className="modal-body">
                <div className="form-group full-width">
                  <label>Nama Report Baru</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={saveAsName}
                    onChange={e => { setSaveAsName(e.target.value); setSaveAsError(''); }}
                  />
                  {saveAsError && <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '6px' }}>{saveAsError}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setSaveAsOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RumusReport;
