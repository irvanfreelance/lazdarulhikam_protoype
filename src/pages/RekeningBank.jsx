import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { INITIAL_REKENING_BANK, INITIAL_KODE_BANK } from '../utils/finsSettingsStore';
import { COAS_ALL } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const BANK_OPTIONS = INITIAL_KODE_BANK.map(b => ({ value: b.bank, label: `${b.bank} (${b.kode})` }));
const COA_OPTIONS = Object.entries(COAS_ALL).map(([coa, label]) => ({ value: coa, label }));

const emptyForm = { bank: BANK_OPTIONS[0]?.value || '', accountNumber: '', description: '', coa: '', scrap: false, active: true, note: '' };

const RekeningBank = () => {
  const [rows, setRows] = useState(INITIAL_REKENING_BANK);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [scrapFilter, setScrapFilter] = useState('all');
  const [coaFilter, setCoaFilter] = useState('all');
  const [aktifFilter, setAktifFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);
  const [exportOpen, setExportOpen] = useState(false);

  const coaFilterOptions = useMemo(() => {
    const distinct = [...new Set(rows.map(r => r.coa))];
    return distinct.map(coa => ({ value: coa, label: COAS_ALL[coa] || coa }));
  }, [rows]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return rows.filter(r => {
      const matchesKeyword = !k ||
        r.bank.toLowerCase().includes(k) ||
        r.accountNumber.toLowerCase().includes(k) ||
        (r.description || '').toLowerCase().includes(k) ||
        r.coa.toLowerCase().includes(k);
      const matchesScrap = scrapFilter === 'all' || (scrapFilter === 'ya' ? r.scrap : !r.scrap);
      const matchesCoa = coaFilter === 'all' || r.coa === coaFilter;
      const matchesAktif = aktifFilter === 'all' || (aktifFilter === 'aktif' ? r.active : !r.active);
      return matchesKeyword && matchesScrap && matchesCoa && matchesAktif;
    });
  }, [rows, keyword, scrapFilter, coaFilter, aktifFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };
  const resetPage = (setter) => (val) => { setter(val); setPage(1); };

  const openAdd = () => {
    setEditing(null);
    setFormFields(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormFields({ ...row });
    setModalOpen(true);
  };

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

  const canSave = formFields.accountNumber.trim() !== '';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Rekening Bank</h1>
          <p>Master rekening bank organisasi beserta mapping COA kas/bank & status keaktifan</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Rekening
        </button>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari bank, no rekening, deskripsi, atau COA..."
              value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            Cari
          </button>
          <select className="form-select" style={{ width: 'auto' }} value={scrapFilter} onChange={e => resetPage(setScrapFilter)(e.target.value)}>
            <option value="all">Scrap: Semua</option>
            <option value="ya">Scrap: Ya</option>
            <option value="tidak">Scrap: Tidak</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={coaFilter} onChange={e => resetPage(setCoaFilter)(e.target.value)}>
            <option value="all">COA: Semua</option>
            {coaFilterOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={aktifFilter} onChange={e => resetPage(setAktifFilter)(e.target.value)}>
            <option value="all">Status: Semua</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non Aktif</option>
          </select>
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
              <th>Bank</th>
              <th>No. Rekening</th>
              <th>Description</th>
              <th>COA</th>
              <th style={{ textAlign: 'center' }}>Scrap</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {paged.map(row => (
              <tr key={row.id} style={!row.active ? { opacity: 0.5 } : undefined}>
                <td style={{ fontWeight: 600 }}>{row.bank}</td>
                <td style={{ fontFamily: 'monospace' }}>{row.accountNumber}</td>
                <td style={{ color: '#64748b' }}>{row.description || '-'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{row.coa || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className={`status-badge ${row.scrap ? 'status-info' : 'status-warning'}`}>{row.scrap ? 'Ya' : 'Tidak'}</span>
                </td>
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
              <h2>{editing ? 'Ubah Rekening Bank' : 'Tambah Rekening Bank'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Bank</label>
                    <SearchableSelect
                      options={BANK_OPTIONS}
                      value={formFields.bank}
                      onChange={val => setFormFields(prev => ({ ...prev, bank: val }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>No. Rekening</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="cth. 2450123456"
                      value={formFields.accountNumber}
                      onChange={e => setFormFields(prev => ({ ...prev, accountNumber: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formFields.description}
                      onChange={e => setFormFields(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>COA Kas/Bank</label>
                    <SearchableSelect
                      options={COA_OPTIONS}
                      value={formFields.coa}
                      onChange={val => setFormFields(prev => ({ ...prev, coa: val }))}
                    />
                  </div>
                  <div className="form-group">
                    <div className="toggle-row" style={{ padding: 0, border: 'none' }}>
                      <span className="toggle-row-label">Scrap (mutasi otomatis)</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={formFields.scrap} onChange={e => setFormFields(prev => ({ ...prev, scrap: e.target.checked }))} />
                        <span className="toggle-slider" />
                      </label>
                    </div>
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
                    <label>Catatan</label>
                    <textarea
                      className="form-textarea"
                      value={formFields.note}
                      onChange={e => setFormFields(prev => ({ ...prev, note: e.target.value }))}
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

export default RekeningBank;
