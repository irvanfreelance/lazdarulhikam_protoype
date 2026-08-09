import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, X, Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { INITIAL_COA, OFFICES, POSITIONS, levelOf } from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const GROUPS = ['Aset', 'Kewajiban', 'Ekuitas', 'Penerimaan', 'Beban'];

const emptyForm = { coa: '', nama: '', parentCoa: '', officeId: '', positionId: '', group: GROUPS[0], aktif: true, includeBuku: false };

const ChartOfAccounts = () => {
  const [rows, setRows] = useState(INITIAL_COA);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [parentFilter, setParentFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [aktifFilter, setAktifFilter] = useState('all');
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);
  const [exportOpen, setExportOpen] = useState(false);

  const officeName = (id) => OFFICES.find(o => o.id === id)?.nama || '-';
  const positionName = (id) => POSITIONS.find(p => p.id === id)?.nama || '-';

  const parentOptions = useMemo(() => [
    { value: '', label: '— Tanpa Induk (Level 1) —' },
    ...rows.map(r => ({ value: r.coa, label: `${r.coa} — ${r.nama}` })),
  ], [rows]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return rows.filter(r => {
      const matchesKeyword = !k || r.coa.includes(k) || r.nama.toLowerCase().includes(k);
      const matchesParent = parentFilter === 'all' || r.parentCoa === parentFilter;
      const matchesGroup = groupFilter === 'all' || r.group === groupFilter;
      const matchesAktif = aktifFilter === 'all' || (aktifFilter === 'aktif' ? r.aktif : !r.aktif);
      return matchesKeyword && matchesParent && matchesGroup && matchesAktif;
    });
  }, [rows, keyword, parentFilter, groupFilter, aktifFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const openAdd = () => { setEditing(null); setFormFields(emptyForm); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setFormFields({ ...row, parentCoa: row.parentCoa || '' }); setModalOpen(true); };
  const handleDelete = (id) => {
    const target = rows.find(r => r.id === id);
    setRows(prev => prev.filter(r => r.id !== id && r.parentCoa !== target?.coa));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const payload = { ...formFields, parentCoa: formFields.parentCoa || null };
    if (editing) {
      setRows(prev => prev.map(r => r.id === editing.id ? { ...r, ...payload } : r));
    } else {
      setRows(prev => [...prev, { id: String(Date.now()), ...payload }]);
    }
    setModalOpen(false);
  };

  const canSave = formFields.coa.trim() !== '' && formFields.nama.trim() !== '';
  const previewLevel = levelOf(formFields.coa, [...rows.filter(r => r.id !== editing?.id), { ...formFields, parentCoa: formFields.parentCoa || null }]);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Chart of Accounts</h1>
          <p>Master hierarki akun (COA) beserta kantor, jabatan, dan grup penyajian</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Akun
        </button>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari kode atau nama akun..."
              value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>Cari</button>
          <select className="form-select" style={{ width: 'auto' }} value={groupFilter} onChange={e => { setGroupFilter(e.target.value); setPage(1); }}>
            <option value="all">Group: Semua</option>
            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={parentFilter} onChange={e => { setParentFilter(e.target.value); setPage(1); }}>
            <option value="all">Induk: Semua</option>
            <option value="">— Level 1 (Tanpa Induk) —</option>
            {rows.filter(r => !r.parentCoa).map(r => <option key={r.coa} value={r.coa}>{r.coa} — {r.nama}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={aktifFilter} onChange={e => { setAktifFilter(e.target.value); setPage(1); }}>
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
              <th>COA</th>
              <th>Nama Akun</th>
              <th>Parent COA</th>
              <th style={{ textAlign: 'center' }}>Level</th>
              <th>Kantor</th>
              <th>Jabatan</th>
              <th>Group</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {paged.map(row => {
              const depth = levelOf(row.coa, rows);
              return (
                <tr key={row.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: depth === 1 ? 'bold' : 'normal' }}>{row.coa}</td>
                  <td style={{ paddingLeft: `${(depth - 1) * 20 + 12}px`, fontWeight: depth === 1 ? 600 : 'normal' }}>{row.nama}</td>
                  <td style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.8rem' }}>{row.parentCoa || '-'}</td>
                  <td style={{ textAlign: 'center' }}>{depth}</td>
                  <td>{officeName(row.officeId) === '-' ? '-' : officeName(row.officeId)}</td>
                  <td>{positionName(row.positionId) === '-' ? '-' : positionName(row.positionId)}</td>
                  <td><span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>{row.group}</span></td>
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
              <h2>{editing ? 'Ubah Akun' : 'Tambah Akun'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Kode COA</label>
                    <input type="text" className="form-input" required placeholder="cth. 101.04.000.000"
                      value={formFields.coa} onChange={e => setFormFields(prev => ({ ...prev, coa: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Nama Akun</label>
                    <input type="text" className="form-input" required
                      value={formFields.nama} onChange={e => setFormFields(prev => ({ ...prev, nama: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <label>COA Parent</label>
                    <SearchableSelect
                      options={parentOptions}
                      value={formFields.parentCoa}
                      onChange={val => setFormFields(prev => ({ ...prev, parentCoa: val }))}
                      allowFreeText={false}
                    />
                  </div>
                  <div className="form-group">
                    <label>Level Otomatis</label>
                    <input type="text" className="form-input" disabled value={`Level ${previewLevel}`} />
                  </div>
                  <div className="form-group">
                    <label>Group</label>
                    <SearchableSelect
                      options={GROUPS.map(g => ({ value: g, label: g }))}
                      value={formFields.group}
                      onChange={val => setFormFields(prev => ({ ...prev, group: val }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Kantor</label>
                    <SearchableSelect
                      options={[{ value: '', label: '— Tidak diset —' }, ...OFFICES.map(o => ({ value: o.id, label: o.nama }))]}
                      value={formFields.officeId}
                      onChange={val => setFormFields(prev => ({ ...prev, officeId: val }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>ID Jabatan</label>
                    <SearchableSelect
                      options={[{ value: '', label: '— Tidak diset —' }, ...POSITIONS.map(p => ({ value: p.id, label: p.nama }))]}
                      value={formFields.positionId}
                      onChange={val => setFormFields(prev => ({ ...prev, positionId: val }))}
                    />
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
                  <div className="form-group">
                    <div className="toggle-row" style={{ padding: 0, border: 'none' }}>
                      <span className="toggle-row-label">Include Buku</span>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={formFields.includeBuku} onChange={e => setFormFields(prev => ({ ...prev, includeBuku: e.target.checked }))} />
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
                <button type="submit" className="btn btn-primary" disabled={!canSave}>Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
