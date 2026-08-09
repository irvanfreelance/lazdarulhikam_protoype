import React, { useState, useMemo } from 'react';
import {
  Plus, Minus, Upload, Download, FileSpreadsheet, FileText, File, Search, X,
  CheckCircle, XCircle, RotateCcw, Trash2, CheckCheck
} from 'lucide-react';
import { OFFICES, POSITIONS, INITIAL_LEVEL_APPROVE } from '../utils/finsCoaStore';
import { INITIAL_SUMBER_DANA } from '../utils/finsSettingsStore';
import { BUKU_ACCOUNTS } from '../utils/finsBukuHarianStore';
import {
  INITIAL_PENGAJUAN_CA, JENIS_TRANSAKSI_CA,
  CURRENT_USER, CURRENT_APPROVER_JABATAN, generateIdBukuCa
} from '../utils/pengajuanCaStore';
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

const kasAccounts = BUKU_ACCOUNTS.filter(a => a.jenis === 'kas');
const bankAccounts = BUKU_ACCOUNTS.filter(a => a.jenis === 'bank');

const emptyHeader = () => ({
  viaBayar: 'Cash',
  bankAccount: kasAccounts[0]?.coa || '',
  sumberDana: INITIAL_SUMBER_DANA[0]?.nama || '',
  officeId: '1',
  departmentId: '',
  tanggal: nowLocal(),
  backDate: false,
});
const emptyDraftLine = () => ({ jenisTransaksi: '', nominal: '', keterangan: '' });

const PengajuanCA = () => {
  const [records, setRecords] = useState(INITIAL_PENGAJUAN_CA);
  const [view, setView] = useState('list'); // 'list' | 'form'
  const [editingIdBuku, setEditingIdBuku] = useState(null);

  const [periodeFrom, setPeriodeFrom] = useState('2026-01-01');
  const [periodeTo, setPeriodeTo] = useState(new Date().toISOString().slice(0, 10));
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('unapprove');
  const [officeFilter, setOfficeFilter] = useState('1');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const [header, setHeader] = useState(emptyHeader());
  const [draftLine, setDraftLine] = useState(emptyDraftLine());
  const [detailLines, setDetailLines] = useState([]);

  const jenisOptions = JENIS_TRANSAKSI_CA.map(j => ({ value: j.nama, label: j.nama }));
  const sumberDanaOptions = INITIAL_SUMBER_DANA.filter(s => s.active).map(s => ({ value: s.nama, label: s.nama }));
  const departmentOptions = POSITIONS.map(p => ({ value: p.id, label: p.nama }));
  const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));
  const bankOptions = bankAccounts.map(a => ({ value: a.coa, label: a.nama }));

  const approverLevel = INITIAL_LEVEL_APPROVE.find(l => l.jabatan === CURRENT_APPROVER_JABATAN);
  const levelApproveLabel = approverLevel
    ? `${fmt(approverLevel.expendMin)} < Nominal <= ${approverLevel.expendMax != null ? fmt(approverLevel.expendMax) : 'Tak Terbatas'}`
    : 'Tidak terbatas';

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return records.filter(r => {
      const matchesPeriode = (!periodeFrom || r.tanggal >= periodeFrom) && (!periodeTo || r.tanggal <= periodeTo);
      const matchesKeyword = !k || r.idBuku.toLowerCase().includes(k) || r.namaAkun.toLowerCase().includes(k) || r.keterangan.toLowerCase().includes(k);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesOffice = officeFilter === 'all' || r.officeId === officeFilter;
      return matchesPeriode && matchesKeyword && matchesStatus && matchesOffice;
    });
  }, [records, periodeFrom, periodeTo, keyword, statusFilter, officeFilter]);

  const totalNominal = filtered.reduce((s, r) => s + r.nominal * r.quantity, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const withinApproverLimit = (nominal) => {
    if (!approverLevel) return true;
    const min = approverLevel.expendMin ?? 0;
    const max = approverLevel.expendMax;
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
    if (!window.confirm('Tolak pengajuan CA ini?')) return;
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected', userApprove: CURRENT_USER.nama } : r));
  };
  const handleSetUnapprove = (id) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'unapprove', userApprove: '' } : r));
  };
  const handleApproveAll = () => {
    const targets = filtered.filter(r => r.status === 'unapprove');
    if (targets.length === 0) { alert('Tidak ada pengajuan Unapprove pada tampilan saat ini.'); return; }
    let approvedCount = 0, skippedCount = 0;
    const targetIds = new Set();
    targets.forEach(r => {
      if (withinApproverLimit(r.nominal * r.quantity)) { targetIds.add(r.id); approvedCount++; }
      else skippedCount++;
    });
    if (approvedCount === 0) { alert('Semua pengajuan melebihi batas approval Anda.'); return; }
    if (!window.confirm(`Approve ${approvedCount} pengajuan CA?${skippedCount ? ` (${skippedCount} dilewati karena melebihi batas approval)` : ''}`)) return;
    setRecords(prev => prev.map(r => targetIds.has(r.id) ? { ...r, status: 'approved', userApprove: CURRENT_USER.nama } : r));
  };
  const handleDeleteRecord = (id) => {
    if (!window.confirm('Hapus pengajuan ini?')) return;
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // --- Tambah Pengajuan CA ---
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
      viaBayar: BUKU_ACCOUNTS.find(a => a.coa === first.coaKredit)?.jenis === 'bank' ? 'Bank' : 'Cash',
      bankAccount: first.coaKredit,
      sumberDana: first.sumberDana || INITIAL_SUMBER_DANA[0]?.nama || '',
      officeId: first.officeId,
      departmentId: first.departmentId || '',
      tanggal: `${first.tanggal}T09:00`,
      backDate: true,
    });
    setDetailLines(lines.map(l => ({ key: l.id, coa: l.coaDebet, namaAkun: l.namaAkun, quantity: l.quantity, nominal: l.nominal, keterangan: l.keterangan })));
    setDraftLine(emptyDraftLine());
    setView('form');
  };

  const addDetailLine = () => {
    if (!draftLine.jenisTransaksi || !draftLine.nominal) {
      alert('Pilih Jenis Transaksi dan isi Nominal terlebih dahulu.');
      return;
    }
    const jt = JENIS_TRANSAKSI_CA.find(j => j.nama === draftLine.jenisTransaksi);
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
  const clearDraftLine = () => setDraftLine(emptyDraftLine());
  const removeDetailLine = (key) => setDetailLines(prev => prev.filter(l => l.key !== key));

  const persistLines = () => {
    if (detailLines.length === 0) {
      alert('Tambahkan minimal satu baris Detail Pengajuan.');
      return false;
    }
    if (!header.bankAccount) {
      alert(`Pilih ${header.viaBayar === 'Bank' ? 'rekening Bank' : 'akun Cash'} terlebih dahulu.`);
      return false;
    }
    const idBuku = editingIdBuku || generateIdBukuCa();
    const tanggalDate = header.tanggal.slice(0, 10);
    const newRecords = detailLines.map((l, idx) => ({
      id: `${idBuku}-${idx}-${Date.now()}`,
      idBuku,
      tanggal: tanggalDate,
      coaDebet: l.coa,
      coaKredit: header.bankAccount,
      namaAkun: l.namaAkun,
      keterangan: l.keterangan,
      quantity: l.quantity,
      nominal: l.nominal,
      realisasi: editingIdBuku ? (records.find(r => r.id === l.key)?.realisasi || 0) : 0,
      userInput: CURRENT_USER.nama,
      userApprove: '',
      status: 'unapprove',
      officeId: header.officeId,
      sumberDana: header.sumberDana,
      departmentId: header.departmentId,
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
    setImportMessage(`File '${file.name}' siap diimpor sebagai Pengajuan CA (simulasi).`);
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
      <td style={{ textAlign: 'right' }}>{fmt(r.realisasi)}</td>
      <td>{r.userInput}</td>
      <td>{r.userApprove || '-'}</td>
    </tr>
  );

  // --- FORM: Tambah/Ubah Pengajuan CA ---
  if (view === 'form') {
    return (
      <div className="content-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Pengajuan CA</h1>
            <p>{editingIdBuku ? `Ubah pengajuan ${editingIdBuku}` : 'Ajukan Cash Advance (CA) baru'}</p>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700 }}>
            Pengajuan Cash Advance (CA)
          </div>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Pengajuan</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Pengaju</label>
                <input type="text" className="form-input" disabled value={`${CURRENT_USER.nama} [${CURRENT_USER.jabatan}]`} />
              </div>
              <div className="form-group">
                <label>Kantor</label>
                <SearchableSelect options={officeOptions} value={header.officeId} onChange={val => setHeader(prev => ({ ...prev, officeId: val }))} />
              </div>

              <div className="form-group">
                <label>Via Bayar</label>
                <SearchableSelect
                  options={[{ value: 'Cash', label: 'Cash' }, { value: 'Bank', label: 'Bank' }]}
                  value={header.viaBayar}
                  onChange={val => setHeader(prev => ({ ...prev, viaBayar: val, bankAccount: (val === 'Cash' ? kasAccounts[0]?.coa : bankAccounts[0]?.coa) || '' }))}
                />
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

              {header.viaBayar === 'Bank' && (
                <div className="form-group">
                  <label>Bank</label>
                  <SearchableSelect options={bankOptions} value={header.bankAccount} onChange={val => setHeader(prev => ({ ...prev, bankAccount: val }))} placeholder="Pilih rekening bank" />
                </div>
              )}
              <div className="form-group">
                <label>Department</label>
                <SearchableSelect options={departmentOptions} value={header.departmentId} onChange={val => setHeader(prev => ({ ...prev, departmentId: val }))} placeholder="Jabatan" />
              </div>

              <div className="form-group">
                <label>Sumber Dana</label>
                <SearchableSelect options={sumberDanaOptions} value={header.sumberDana} onChange={val => setHeader(prev => ({ ...prev, sumberDana: val }))} placeholder="Sumber Dana" />
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '28px 0 16px', fontFamily: 'var(--font-heading)' }}>Detail Pengajuan</h3>
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
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="form-input" placeholder="Keterangan" value={draftLine.keterangan} onChange={e => setDraftLine(prev => ({ ...prev, keterangan: e.target.value }))} />
                  <button type="button" className="btn btn-primary" style={{ padding: '0 10px' }} title="Tambah Baris" onClick={addDetailLine}><Plus size={16} /></button>
                  <button type="button" className="btn" style={{ padding: '0 10px', background: 'white', border: '1px solid #e2e8f0' }} title="Kosongkan" onClick={clearDraftLine}><Minus size={16} /></button>
                </div>
              </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>COA</th>
                    <th>Nama Akun</th>
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

  // --- LIST ---
  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Pengajuan</h1>
          <p>Daftar pengajuan Cash Advance (CA) beserta status approval dan realisasi pertanggungjawaban</p>
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
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status<sup>(?)</sup>:</span>
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
          <label className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <Upload size={16} /> Import
            <input type="file" accept=".csv,.xlsx" style={{ display: 'none' }} onChange={handleImportFile} />
          </label>
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
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Daftar Pengajuan</div>
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
                <th style={{ textAlign: 'right' }}>Realisasi</th>
                <th>Pengaju</th>
                <th>Approver</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map(r => renderRow(r))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700 }}>Σ Total :</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalNominal)}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Displaying {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} items
          </div>
          <div className="pagination-controls">
            <select className="pagination-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / halaman</option>)}
            </select>
            <button disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
            <button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PengajuanCA;
