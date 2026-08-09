import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Upload, Download, FileSpreadsheet, FileText, File, Search, X,
  CheckCircle, XCircle, RotateCcw, Trash2, CheckCheck
} from 'lucide-react';
import { OFFICES, INITIAL_LEVEL_APPROVE } from '../utils/finsCoaStore';
import { INITIAL_REKENING_BANK, INITIAL_PROGRAM_PENERIMAAN } from '../utils/finsSettingsStore';
import {
  INITIAL_PENERIMAAN, JENIS_TRANSAKSI_PENERIMAAN, KAS_ACCOUNTS,
  CURRENT_USER, CURRENT_APPROVER_JABATAN, generateIdBuku
} from '../utils/penerimaanStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unapprove', label: 'Unapprove' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'approved', label: 'Approved' },
];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const emptyHeader = () => ({
  viaBayar: 'Bank',
  bankAccount: '',
  officeId: '1',
  tanggal: nowLocal(),
  backDate: false,
  referensi: '',
  program: '',
});
const emptyDraftLine = () => ({ jenisTransaksi: '', nominal: '', keterangan: '' });

const Penerimaan = () => {
  const [records, setRecords] = useState(INITIAL_PENERIMAAN);
  const [view, setView] = useState('list');
  const [editingIdBuku, setEditingIdBuku] = useState(null);

  const [periodeFrom, setPeriodeFrom] = useState('2026-01-01');
  const [periodeTo, setPeriodeTo] = useState(new Date().toISOString().slice(0, 10));
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('unapprove');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [inputViaFilter, setInputViaFilter] = useState('all');
  const [viewMode, setViewMode] = useState('normal');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef(null);

  const [header, setHeader] = useState(emptyHeader());
  const [draftLine, setDraftLine] = useState(emptyDraftLine());
  const [detailLines, setDetailLines] = useState([]);

  const bankOptions = useMemo(() => INITIAL_REKENING_BANK.filter(r => r.active).map(r => ({
    value: `${r.bank} ${r.accountNumber} ${r.description}`,
    label: `${r.bank.toUpperCase()} ${r.accountNumber} ${r.description}`,
  })), []);
  const kasOptions = KAS_ACCOUNTS.map(k => ({ value: k, label: k }));
  const jenisOptions = JENIS_TRANSAKSI_PENERIMAAN.map(j => ({ value: j.nama, label: j.nama }));
  const programOptions = [{ value: '', label: '— Tanpa Program —' }, ...INITIAL_PROGRAM_PENERIMAAN.map(p => ({ value: p.nama, label: p.nama }))];
  const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));

  const approverLevel = INITIAL_LEVEL_APPROVE.find(l => l.jabatan === CURRENT_APPROVER_JABATAN);
  const levelApproveLabel = approverLevel
    ? `${fmt(approverLevel.receiptMin)} < Nominal <= ${approverLevel.receiptMax != null ? fmt(approverLevel.receiptMax) : 'Tak Terbatas'}`
    : 'Tidak terbatas';

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return records.filter(r => {
      const matchesPeriode = (!periodeFrom || r.tanggal >= periodeFrom) && (!periodeTo || r.tanggal <= periodeTo);
      const matchesKeyword = !k || r.idBuku.toLowerCase().includes(k) || r.namaAkun.toLowerCase().includes(k) || r.keterangan.toLowerCase().includes(k);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesOffice = officeFilter === 'all' || r.officeId === officeFilter;
      const matchesVia = inputViaFilter === 'all' || r.viaBayar === inputViaFilter;
      return matchesPeriode && matchesKeyword && matchesStatus && matchesOffice && matchesVia;
    });
  }, [records, periodeFrom, periodeTo, keyword, statusFilter, officeFilter, inputViaFilter]);

  const totalNominal = filtered.reduce((s, r) => s + r.nominal * r.quantity, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const grouped = useMemo(() => {
    if (viewMode !== 'grouped') return null;
    const map = new Map();
    filtered.forEach(r => {
      if (!map.has(r.namaAkun)) map.set(r.namaAkun, []);
      map.get(r.namaAkun).push(r);
    });
    return Array.from(map.entries());
  }, [filtered, viewMode]);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const withinApproverLimit = (nominal) => {
    if (!approverLevel) return true;
    const min = approverLevel.receiptMin ?? 0;
    const max = approverLevel.receiptMax;
    return nominal >= min && (max === null || max === undefined || nominal <= max);
  };

  const handleApprove = (id) => {
    const rec = records.find(r => r.id === id);
    if (!rec) return;
    if (!withinApproverLimit(rec.nominal * rec.quantity)) {
      alert(`Nominal Rp ${fmt(rec.nominal * rec.quantity)} melebihi batas approval jabatan ${CURRENT_APPROVER_JABATAN}.`);
      return;
    }
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', userApprove: CURRENT_USER.nama } : r));
  };
  const handleReject = (id) => {
    if (!window.confirm('Tolak transaksi penerimaan ini?')) return;
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', userApprove: CURRENT_USER.nama } : r));
  };
  const handleSetUnapprove = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'unapprove', userApprove: '' } : r));
  };
  const handleApproveAll = () => {
    const targets = filtered.filter(r => r.status === 'unapprove');
    if (targets.length === 0) { alert('Tidak ada transaksi Unapprove pada tampilan saat ini.'); return; }
    let approvedCount = 0, skippedCount = 0;
    const targetIds = new Set();
    targets.forEach(r => {
      if (withinApproverLimit(r.nominal * r.quantity)) { targetIds.add(r.id); approvedCount++; }
      else skippedCount++;
    });
    if (approvedCount === 0) { alert('Semua transaksi melebihi batas approval Anda.'); return; }
    if (!window.confirm(`Approve ${approvedCount} transaksi Penerimaan?${skippedCount ? ` (${skippedCount} dilewati karena melebihi batas approval)` : ''}`)) return;
    setRecords(prev => prev.map(r => targetIds.has(r.id) ? { ...r, status: 'approved', userApprove: CURRENT_USER.nama } : r));
  };
  const handleDeleteRecord = (id) => {
    if (!window.confirm('Hapus transaksi penerimaan ini?')) return;
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const openAdd = () => {
    setEditingIdBuku(null);
    setHeader(emptyHeader());
    setDetailLines([]);
    setDraftLine(emptyDraftLine());
    setView('form');
  };

  const openEdit = (idBuku) => {
    const lines = records.filter(r => r.idBuku === idBuku);
    if (lines.length === 0) return;
    const first = lines[0];
    setEditingIdBuku(idBuku);
    setHeader({
      viaBayar: first.viaBayar,
      bankAccount: first.bankAccount,
      officeId: first.officeId,
      tanggal: `${first.tanggal}T09:00`,
      backDate: true,
      referensi: first.referensi,
      program: first.program,
    });
    setDetailLines(lines.map(l => ({ key: l.id, coa: l.coa, namaAkun: l.namaAkun, quantity: l.quantity, nominal: l.nominal, keterangan: l.keterangan })));
    setDraftLine(emptyDraftLine());
    setView('form');
  };

  const addDetailLine = () => {
    if (!draftLine.jenisTransaksi || !draftLine.nominal) {
      alert('Pilih Jenis Transaksi dan isi Nominal terlebih dahulu.');
      return;
    }
    const jt = JENIS_TRANSAKSI_PENERIMAAN.find(j => j.nama === draftLine.jenisTransaksi);
    setDetailLines(prev => [...prev, {
      key: `draft-${Date.now()}-${Math.random()}`,
      coa: jt?.coa || '',
      namaAkun: draftLine.jenisTransaksi,
      quantity: 1,
      nominal: Number(draftLine.nominal),
      keterangan: draftLine.keterangan,
    }]);
    setDraftLine(emptyDraftLine());
  };

  const removeDetailLine = (key) => setDetailLines(prev => prev.filter(l => l.key !== key));

  const persistLines = () => {
    if (detailLines.length === 0) {
      alert('Tambahkan minimal satu baris Detail Penerimaan.');
      return false;
    }
    if (!header.bankAccount) {
      alert(`Pilih ${header.viaBayar === 'Bank' ? 'Bank' : 'Kas'} terlebih dahulu.`);
      return false;
    }
    const idBuku = editingIdBuku || generateIdBuku();
    const tanggalDate = header.tanggal.slice(0, 10);
    const newRecords = detailLines.map((l, idx) => ({
      id: `${idBuku}-${idx}-${Date.now()}`,
      idBuku,
      tanggal: tanggalDate,
      coa: l.coa,
      namaAkun: l.namaAkun,
      keterangan: l.keterangan,
      quantity: l.quantity,
      nominal: l.nominal,
      userInput: CURRENT_USER.nama,
      userApprove: '',
      status: 'unapprove',
      referensi: header.referensi,
      program: header.program,
      officeId: header.officeId,
      viaBayar: header.viaBayar,
      bankAccount: header.bankAccount,
    }));
    if (editingIdBuku) {
      setRecords(prev => [...prev.filter(r => r.idBuku !== editingIdBuku), ...newRecords]);
    } else {
      setRecords(prev => [...prev, ...newRecords]);
    }
    return true;
  };

  const handleSaveAndTambah = () => {
    if (!persistLines()) return;
    setEditingIdBuku(null);
    setHeader(emptyHeader());
    setDetailLines([]);
    setDraftLine(emptyDraftLine());
  };
  const handleSave = () => {
    if (!persistLines()) return;
    setView('list');
  };
  const handleCancel = () => setView('list');

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(`File '${file.name}' siap diimpor sebagai transaksi Penerimaan (simulasi).`);
    setTimeout(() => setImportMessage(''), 4000);
    e.target.value = '';
  };

  const renderRow = (r) => (
    <tr key={r.id}>
      <td style={{ whiteSpace: 'nowrap' }}>
        <div className="action-buttons" style={{ marginBottom: '4px' }}>
          {r.status !== 'approved' && <CheckCircle size={16} color="#16a34a" title="Approve" style={{ cursor: 'pointer' }} onClick={() => handleApprove(r.id)} />}
          {r.status !== 'rejected' && <XCircle size={16} color="#ef4444" title="Reject" style={{ cursor: 'pointer' }} onClick={() => handleReject(r.id)} />}
          {r.status !== 'unapprove' && <RotateCcw size={16} color="#64748b" title="Set Unapprove" style={{ cursor: 'pointer' }} onClick={() => handleSetUnapprove(r.id)} />}
          <Trash2 size={16} color="#ef4444" title="Hapus" style={{ cursor: 'pointer' }} onClick={() => handleDeleteRecord(r.id)} />
        </div>
        <span className={`status-badge ${r.status === 'approved' ? 'status-success' : r.status === 'rejected' ? 'status-danger' : 'status-warning'}`}>
          {r.status === 'approved' ? 'Approved' : r.status === 'rejected' ? 'Rejected' : 'UnApprove'}
        </span>
      </td>
      <td>{r.tanggal}</td>
      <td>
        <a href="#" onClick={e => { e.preventDefault(); openEdit(r.idBuku); }} style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.idBuku}</a>
      </td>
      <td>{r.namaAkun}</td>
      <td>{r.keterangan || '-'}</td>
      <td style={{ textAlign: 'center' }}>{r.quantity}</td>
      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(r.nominal * r.quantity)}</td>
      <td>{r.userInput}</td>
      <td>{r.userApprove || '-'}</td>
      <td>{r.referensi || '-'}</td>
      <td>{r.program || '-'}</td>
    </tr>
  );

  if (view === 'form') {
    return (
      <div className="content-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Penerimaan</h1>
            <p>{editingIdBuku ? `Ubah transaksi ${editingIdBuku}` : 'Entry transaksi penerimaan operasional baru'}</p>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700 }}>
            Penerimaan Operasional
          </div>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Penerimaan</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Via Bayar</label>
                <SearchableSelect
                  options={[{ value: 'Bank', label: 'Bank' }, { value: 'Kas', label: 'Kas' }]}
                  value={header.viaBayar}
                  onChange={val => setHeader(prev => ({ ...prev, viaBayar: val, bankAccount: '' }))}
                />
              </div>
              <div className="form-group">
                <label>{header.viaBayar === 'Bank' ? 'Bank' : 'Kas'}</label>
                <SearchableSelect
                  options={header.viaBayar === 'Bank' ? bankOptions : kasOptions}
                  value={header.bankAccount}
                  onChange={val => setHeader(prev => ({ ...prev, bankAccount: val }))}
                  placeholder={header.viaBayar === 'Bank' ? 'Pilih rekening bank' : 'Pilih akun kas'}
                />
              </div>
              <div className="form-group">
                <label>User Input</label>
                <input type="text" className="form-input" disabled value={`${CURRENT_USER.id} - ${CURRENT_USER.nama}`} />
              </div>
              <div className="form-group">
                <label>Kantor</label>
                <SearchableSelect options={officeOptions} value={header.officeId} onChange={val => setHeader(prev => ({ ...prev, officeId: val }))} />
              </div>
              <div className="form-group">
                <label>
                  Tanggal {!header.backDate && (
                    <a href="#" style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginLeft: '6px' }}
                      onClick={e => { e.preventDefault(); setHeader(prev => ({ ...prev, backDate: true })); }}>
                      Back Date
                    </a>
                  )}
                </label>
                <input type="datetime-local" className="form-input" disabled={!header.backDate}
                  value={header.tanggal} onChange={e => setHeader(prev => ({ ...prev, tanggal: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Program</label>
                <SearchableSelect options={programOptions} value={header.program} onChange={val => setHeader(prev => ({ ...prev, program: val }))} />
              </div>
              <div className="form-group full-width">
                <label>Referensi</label>
                <input type="text" className="form-input" value={header.referensi} onChange={e => setHeader(prev => ({ ...prev, referensi: e.target.value }))} />
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '28px 0 16px', fontFamily: 'var(--font-heading)' }}>Detail Penerimaan</h3>
            <div className="form-grid" style={{ alignItems: 'end' }}>
              <div className="form-group">
                <label>Jenis Transaksi</label>
                <SearchableSelect options={jenisOptions} value={draftLine.jenisTransaksi} onChange={val => setDraftLine(prev => ({ ...prev, jenisTransaksi: val }))} placeholder="Jenis Transaksi" />
              </div>
              <div className="form-group">
                <label>Nominal</label>
                <input type="number" className="form-input" placeholder="Nominal" value={draftLine.nominal} onChange={e => setDraftLine(prev => ({ ...prev, nominal: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input type="text" className="form-input" placeholder="Keterangan" value={draftLine.keterangan} onChange={e => setDraftLine(prev => ({ ...prev, keterangan: e.target.value }))} />
              </div>
              <div className="form-group">
                <button type="button" className="btn btn-primary" onClick={addDetailLine}><Plus size={16} /> Tambah Baris</button>
              </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>COA</th>
                    <th>Jenis Transaksi</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Nominal Satuan</th>
                    <th style={{ textAlign: 'right' }}>Total Nominal</th>
                    <th>Keterangan</th>
                    <th>Kantor</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {detailLines.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada baris detail</td></tr>
                  )}
                  {detailLines.map(l => (
                    <tr key={l.key}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.coa}</td>
                      <td>{l.namaAkun}</td>
                      <td style={{ textAlign: 'center' }}>{l.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(l.nominal)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(l.nominal * l.quantity)}</td>
                      <td>{l.keterangan || '-'}</td>
                      <td>{OFFICES.find(o => o.id === header.officeId)?.nama}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} title="Hapus baris" onClick={() => removeDetailLine(l.key)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {detailLines.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(detailLines.reduce((s, l) => s + l.nominal * l.quantity, 0))}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleCancel}><X size={16} /> Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSaveAndTambah}>Save & Tambah</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Penerimaan</h1>
          <p>Daftar transaksi penerimaan operasional beserta status approval</p>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Periode:</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeFrom} onChange={e => setPeriodeFrom(e.target.value)} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>s/d</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeTo} onChange={e => setPeriodeTo(e.target.value)} />
          <div className="filter-input" style={{ width: '200px' }}>
            <Search size={16} />
            <input type="text" placeholder="Keyword..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={officeFilter} onChange={e => { setOfficeFilter(e.target.value); setPage(1); }}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Tambah</button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => fileInputRef.current?.click()}><Upload size={16} /> Import</button>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={handleImportFile} />
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setExportOpen(o => !o)}><Download size={16} /> Export</button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => setExportOpen(false)}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={() => setExportOpen(false)}><FileText size={14} /> CSV</button>
                <button onClick={() => setExportOpen(false)}><File size={14} /> PDF</button>
              </div>
            )}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Input Via:</span>
          <select className="form-select" style={{ width: 'auto' }} value={inputViaFilter} onChange={e => { setInputViaFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="Bank">Bank</option>
            <option value="Kas">Kas</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>View:</span>
          <select className="form-select" style={{ width: 'auto' }} value={viewMode} onChange={e => setViewMode(e.target.value)}>
            <option value="normal">Normal</option>
            <option value="grouped">Grouped</option>
          </select>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--danger-color)', fontWeight: 600 }}>
            Level Approve [{levelApproveLabel}]
          </span>
          <button className="btn btn-success" onClick={handleApproveAll}><CheckCheck size={16} /> Approve All</button>
        </div>
      </div>

      {importMessage && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
          {importMessage}
        </div>
      )}

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Daftar Penerimaan</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Tanggal</th>
                <th>ID Buku</th>
                <th>Nama Akun</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>User Input</th>
                <th>User Approve</th>
                <th>Referensi</th>
                <th>Program</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={11} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {viewMode === 'normal'
                ? paged.map(r => renderRow(r))
                : (grouped || []).map(([nama, rows]) => (
                  <React.Fragment key={nama}>
                    <tr style={{ background: '#f8fafc' }}>
                      <td colSpan={6} style={{ fontWeight: 700 }}>{nama}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(rows.reduce((s, r) => s + r.nominal * r.quantity, 0))}</td>
                      <td colSpan={3}></td>
                    </tr>
                    {rows.map(r => renderRow(r))}
                  </React.Fragment>
                ))}
            </tbody>
            {viewMode === 'normal' && (
              <tfoot>
                <tr>
                  <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700 }}>Σ Total :</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalNominal)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

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
    </div>
  );
};

export default Penerimaan;
