import React, { useState, useMemo } from 'react';
import {
  Plus, Repeat2, Upload, Download, FileSpreadsheet, FileText, File, Search, X,
  CheckCircle, XCircle, RotateCcw, Trash2, CheckCheck
} from 'lucide-react';
import { OFFICES, POSITIONS, INITIAL_LEVEL_APPROVE } from '../utils/finsCoaStore';
import { INITIAL_SUMBER_DANA } from '../utils/finsSettingsStore';
import { BUKU_ACCOUNTS } from '../utils/finsBukuHarianStore';
import {
  INITIAL_PENGELUARAN, JENIS_TRANSAKSI_PENGELUARAN,
  CURRENT_USER, CURRENT_APPROVER_JABATAN, generateIdBukuExpense, generateIdBukuMutasi
} from '../utils/pengeluaranStore';
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
const accountByCoa = (coa) => BUKU_ACCOUNTS.find(a => a.coa === coa);
const viaBayarOf = (coaKredit) => (accountByCoa(coaKredit)?.jenis === 'kas' ? 'Cash' : 'Bank');

const emptyHeader = () => ({
  viaBayar: 'Cash',
  bankAccount: kasAccounts[0]?.coa || '',
  sumberDana: INITIAL_SUMBER_DANA[0]?.nama || '',
  officeId: '1',
  departmentId: '',
  tanggal: nowLocal(),
  backDate: false,
  referensi: '',
  program: '',
});
const emptyDraftLine = () => ({ jenisTransaksi: '', nominal: '', keterangan: '' });

const emptyMutasiHeader = () => ({ officeId: '1', tanggal: nowLocal(), backDate: false });
const emptyMutasiDraft = () => ({ pengirim: '', penerima: '', nominal: '', keterangan: '' });

const Pengeluaran = () => {
  const [records, setRecords] = useState(INITIAL_PENGELUARAN);
  const [view, setView] = useState('list'); // 'list' | 'form' | 'mutasi'
  const [editingIdBuku, setEditingIdBuku] = useState(null);

  const [periodeFrom, setPeriodeFrom] = useState('2026-01-01');
  const [periodeTo, setPeriodeTo] = useState(new Date().toISOString().slice(0, 10));
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [inputViaFilter, setInputViaFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const [header, setHeader] = useState(emptyHeader());
  const [draftLine, setDraftLine] = useState(emptyDraftLine());
  const [detailLines, setDetailLines] = useState([]);

  const [mutasiHeader, setMutasiHeader] = useState(emptyMutasiHeader());
  const [mutasiDraft, setMutasiDraft] = useState(emptyMutasiDraft());
  const [mutasiLines, setMutasiLines] = useState([]);

  const jenisOptions = JENIS_TRANSAKSI_PENGELUARAN.map(j => ({ value: j.nama, label: j.nama }));
  const sumberDanaOptions = INITIAL_SUMBER_DANA.filter(s => s.active).map(s => ({ value: s.nama, label: s.nama }));
  const departmentOptions = POSITIONS.map(p => ({ value: p.id, label: p.nama }));
  const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));
  const kasOptions = kasAccounts.map(a => ({ value: a.coa, label: a.nama }));
  const bankOptions = bankAccounts.map(a => ({ value: a.coa, label: a.nama }));
  const allAccountOptions = BUKU_ACCOUNTS.map(a => ({ value: a.coa, label: a.nama }));

  // Live saldo per akun: saldoAwal dikurangi seluruh pengeluaran approved yang
  // dibayar dari akun tsb, dikurangi/ditambah mutasi keluar/masuk approved.
  const liveSaldoByCoa = useMemo(() => {
    const map = {};
    BUKU_ACCOUNTS.forEach(a => { map[a.coa] = a.saldoAwal; });
    records.forEach(r => {
      if (r.status !== 'approved') return;
      if (map[r.coaKredit] !== undefined) map[r.coaKredit] -= r.nominal * r.quantity;
      if (r.isMutasi && map[r.coaDebet] !== undefined) map[r.coaDebet] += r.nominal * r.quantity;
    });
    return map;
  }, [records]);

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
      const matchesVia = inputViaFilter === 'all' || viaBayarOf(r.coaKredit) === inputViaFilter;
      return matchesPeriode && matchesKeyword && matchesStatus && matchesOffice && matchesVia;
    });
  }, [records, periodeFrom, periodeTo, keyword, statusFilter, officeFilter, inputViaFilter]);

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
    if (!window.confirm('Tolak transaksi pengeluaran ini?')) return;
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
    if (!window.confirm(`Approve ${approvedCount} transaksi Pengeluaran?${skippedCount ? ` (${skippedCount} dilewati karena melebihi batas approval)` : ''}`)) return;
    setRecords(prev => prev.map(r => targetIds.has(r.id) ? { ...r, status: 'approved', userApprove: CURRENT_USER.nama } : r));
  };
  const handleDeleteRecord = (id) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  // --- Tambah Pengeluaran ---
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
    if (first.isMutasi) return; // mutasi diedit lewat form Mutasi terpisah, tidak didukung di prototipe ini
    setEditingIdBuku(idBuku);
    setHeader({
      viaBayar: viaBayarOf(first.coaKredit),
      bankAccount: first.coaKredit,
      sumberDana: header.sumberDana || INITIAL_SUMBER_DANA[0]?.nama || '',
      officeId: first.officeId,
      departmentId: '',
      tanggal: `${first.tanggal}T09:00`,
      backDate: true,
      referensi: first.referensi,
      program: first.program,
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
    const jt = JENIS_TRANSAKSI_PENGELUARAN.find(j => j.nama === draftLine.jenisTransaksi);
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
      alert('Tambahkan minimal satu baris Detail Pengeluaran.');
      return false;
    }
    if (!header.bankAccount) {
      alert(`Pilih ${header.viaBayar === 'Bank' ? 'rekening Bank' : 'akun Cash'} terlebih dahulu.`);
      return false;
    }
    const idBuku = editingIdBuku || generateIdBukuExpense();
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
      userInput: CURRENT_USER.nama,
      userApprove: '',
      status: 'unapprove',
      referensi: header.referensi,
      program: header.program,
      officeId: header.officeId,
      noResi: '',
      isMutasi: false,
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

  // --- Mutasi ---
  const openMutasi = () => {
    setMutasiHeader(emptyMutasiHeader());
    setMutasiLines([]);
    setMutasiDraft(emptyMutasiDraft());
    setView('mutasi');
  };

  const addMutasiLine = () => {
    if (!mutasiDraft.pengirim || !mutasiDraft.penerima || !mutasiDraft.nominal) {
      alert('Pilih Pengirim, Penerima, dan isi Nominal terlebih dahulu.');
      return;
    }
    if (mutasiDraft.pengirim === mutasiDraft.penerima) {
      alert('Akun Pengirim dan Penerima tidak boleh sama.');
      return;
    }
    setMutasiLines(prev => [...prev, {
      key: `mut-${Date.now()}-${Math.random()}`,
      pengirim: mutasiDraft.pengirim,
      penerima: mutasiDraft.penerima,
      nominal: Number(mutasiDraft.nominal),
      keterangan: mutasiDraft.keterangan,
    }]);
    setMutasiDraft(emptyMutasiDraft());
  };
  const removeMutasiLine = (key) => setMutasiLines(prev => prev.filter(l => l.key !== key));

  const handleMutasiSaveCore = () => {
    if (mutasiLines.length === 0) {
      alert('Tambahkan minimal satu baris Detail Mutasi.');
      return false;
    }
    const tanggalDate = mutasiHeader.tanggal.slice(0, 10);
    const newRecords = mutasiLines.map((l, idx) => {
      const idBuku = generateIdBukuMutasi();
      const penerimaAkun = accountByCoa(l.penerima);
      return {
        id: `${idBuku}-${idx}-${Date.now()}`,
        idBuku,
        tanggal: tanggalDate,
        coaDebet: l.penerima,
        coaKredit: l.pengirim,
        namaAkun: penerimaAkun?.nama || l.penerima,
        keterangan: l.keterangan || `Mutasi ke ${penerimaAkun?.nama || l.penerima}`,
        quantity: 1,
        nominal: l.nominal,
        userInput: CURRENT_USER.nama,
        userApprove: '',
        status: 'unapprove',
        referensi: '',
        program: '',
        officeId: mutasiHeader.officeId,
        noResi: '',
        isMutasi: true,
      };
    });
    setRecords(prev => [...prev, ...newRecords]);
    return true;
  };
  const handleMutasiSaveAndTambah = () => {
    if (!handleMutasiSaveCore()) return;
    setMutasiHeader(emptyMutasiHeader());
    setMutasiLines([]);
    setMutasiDraft(emptyMutasiDraft());
  };
  const handleMutasiSave = () => {
    if (!handleMutasiSaveCore()) return;
    setView('list');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(`File '${file.name}' siap diimpor sebagai transaksi Pengeluaran (simulasi).`);
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
        {r.isMutasi
          ? <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.idBuku}</span>
          : <a href="#" onClick={e => { e.preventDefault(); openEdit(r.idBuku); }} style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.idBuku}</a>}
      </td>
      <td>{r.namaAkun}</td>
      <td>{r.keterangan || '-'}</td>
      <td style={{ textAlign: 'center' }}>{r.quantity}</td>
      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(r.nominal * r.quantity)}</td>
      <td>{r.userInput}</td>
      <td>{r.userApprove || '-'}</td>
      <td>{r.referensi || '-'}</td>
      <td>{r.program || '-'}</td>
      <td>{OFFICES.find(o => o.id === r.officeId)?.nama || '-'}</td>
      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.coaDebet}</td>
      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.coaKredit}</td>
      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.noResi || '-'}</td>
    </tr>
  );

  // --- FORM: Tambah Pengeluaran ---
  if (view === 'form') {
    const saldoAkun = liveSaldoByCoa[header.bankAccount] ?? 0;
    return (
      <div className="content-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Pengeluaran</h1>
            <p>{editingIdBuku ? `Ubah transaksi ${editingIdBuku}` : 'Entry transaksi pengeluaran operasional baru'}</p>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700 }}>
            Pengeluaran Operasional
          </div>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Pengeluaran</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Via Bayar</label>
                <SearchableSelect
                  options={[{ value: 'Cash', label: 'Cash' }, { value: 'Bank', label: 'Bank' }]}
                  value={header.viaBayar}
                  onChange={val => setHeader(prev => ({ ...prev, viaBayar: val, bankAccount: (val === 'Cash' ? kasAccounts[0]?.coa : bankAccounts[0]?.coa) || '' }))}
                />
              </div>
              <div className="form-group">
                <label>User Input</label>
                <input type="text" className="form-input" disabled value={`${CURRENT_USER.id} - ${CURRENT_USER.nama}`} />
              </div>

              {header.viaBayar === 'Bank' && (
                <div className="form-group">
                  <label>Bank</label>
                  <SearchableSelect options={bankOptions} value={header.bankAccount} onChange={val => setHeader(prev => ({ ...prev, bankAccount: val }))} placeholder="Pilih rekening bank" />
                </div>
              )}
              <div className="form-group">
                <label>Saldo {header.viaBayar}</label>
                <input type="text" className="form-input" disabled value={fmt(saldoAkun)} style={{ color: saldoAkun < 0 ? 'var(--danger-color)' : undefined, fontWeight: 600 }} />
              </div>

              <div className="form-group">
                <label>Sumber Dana</label>
                <SearchableSelect options={sumberDanaOptions} value={header.sumberDana} onChange={val => setHeader(prev => ({ ...prev, sumberDana: val }))} />
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
                <label>Department</label>
                <SearchableSelect options={departmentOptions} value={header.departmentId} onChange={val => setHeader(prev => ({ ...prev, departmentId: val }))} placeholder="Jabatan" />
              </div>

              <div className="form-group">
                <label>Program</label>
                <input type="text" className="form-input" value={header.program} onChange={e => setHeader(prev => ({ ...prev, program: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Referensi</label>
                <input type="text" className="form-input" value={header.referensi} onChange={e => setHeader(prev => ({ ...prev, referensi: e.target.value }))} />
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '28px 0 16px', fontFamily: 'var(--font-heading)' }}>Detail Pengeluaran</h3>
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

  // --- FORM: Mutasi ---
  if (view === 'mutasi') {
    const saldoPengirim = mutasiDraft.pengirim ? (liveSaldoByCoa[mutasiDraft.pengirim] ?? 0) : null;
    const saldoPenerima = mutasiDraft.penerima ? (liveSaldoByCoa[mutasiDraft.penerima] ?? 0) : null;
    return (
      <div className="content-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Pengeluaran</h1>
            <p>Mutasi saldo antar akun Kas/Bank</p>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700 }}>
            Mutasi
          </div>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Mutasi</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>NIK Input</label>
                <input type="text" className="form-input" disabled value={CURRENT_USER.id} />
              </div>
              <div className="form-group">
                <label>User Input</label>
                <input type="text" className="form-input" disabled value={CURRENT_USER.nama} />
              </div>
              <div className="form-group">
                <label>Kantor</label>
                <SearchableSelect options={officeOptions} value={mutasiHeader.officeId} onChange={val => setMutasiHeader(prev => ({ ...prev, officeId: val }))} />
              </div>
              <div className="form-group">
                <label>
                  Tanggal {!mutasiHeader.backDate && (
                    <a href="#" style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginLeft: '6px' }}
                      onClick={e => { e.preventDefault(); setMutasiHeader(prev => ({ ...prev, backDate: true })); }}>
                      Back Date
                    </a>
                  )}
                </label>
                <input type="datetime-local" className="form-input" disabled={!mutasiHeader.backDate}
                  value={mutasiHeader.tanggal} onChange={e => setMutasiHeader(prev => ({ ...prev, tanggal: e.target.value }))} />
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '28px 0 16px', fontFamily: 'var(--font-heading)' }}>Detail Mutasi</h3>
            <div className="form-grid" style={{ alignItems: 'end' }}>
              <div className="form-group">
                <label>Pengirim {saldoPengirim !== null && <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Saldo: {fmt(saldoPengirim)})</span>}</label>
                <SearchableSelect options={allAccountOptions} value={mutasiDraft.pengirim} onChange={val => setMutasiDraft(prev => ({ ...prev, pengirim: val }))} placeholder="Pengirim" />
              </div>
              <div className="form-group">
                <label>Penerima {saldoPenerima !== null && <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(Saldo: {fmt(saldoPenerima)})</span>}</label>
                <SearchableSelect options={allAccountOptions} value={mutasiDraft.penerima} onChange={val => setMutasiDraft(prev => ({ ...prev, penerima: val }))} placeholder="Penerima" />
              </div>
              <div className="form-group">
                <label>Nominal</label>
                <input type="number" className="form-input" placeholder="Nominal" value={mutasiDraft.nominal} onChange={e => setMutasiDraft(prev => ({ ...prev, nominal: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input type="text" className="form-input" placeholder="Keterangan" value={mutasiDraft.keterangan} onChange={e => setMutasiDraft(prev => ({ ...prev, keterangan: e.target.value }))} />
              </div>
              <div className="form-group">
                <button type="button" className="btn btn-primary" onClick={addMutasiLine}><Plus size={16} /> Tambah Baris</button>
              </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Pengirim</th>
                    <th>Penerima</th>
                    <th style={{ textAlign: 'right' }}>Nominal</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mutasiLines.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada baris detail</td></tr>
                  )}
                  {mutasiLines.map(l => (
                    <tr key={l.key}>
                      <td>{accountByCoa(l.pengirim)?.nama || l.pengirim}</td>
                      <td>{accountByCoa(l.penerima)?.nama || l.penerima}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(l.nominal)}</td>
                      <td>{l.keterangan || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} title="Hapus baris" onClick={() => removeMutasiLine(l.key)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {mutasiLines.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(mutasiLines.reduce((s, l) => s + l.nominal, 0))}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setView('list')}><X size={16} /> Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleMutasiSaveAndTambah}>Save & Tambah</button>
              <button type="button" className="btn btn-primary" onClick={handleMutasiSave}>Save</button>
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
          <h1>Pengeluaran</h1>
          <p>Daftar transaksi pengeluaran operasional beserta status approval</p>
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
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={openMutasi}><Repeat2 size={16} /> Mutasi</button>
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
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Input Via:</span>
          <select className="form-select" style={{ width: 'auto' }} value={inputViaFilter} onChange={e => { setInputViaFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
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
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Daftar Pengeluaran</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Tanggal</th>
                <th>ID Buku</th>
                <th>Jenis Transaksi</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>User Input</th>
                <th>User Approve</th>
                <th>Referensi</th>
                <th>Program</th>
                <th>Kantor</th>
                <th>COA Debet</th>
                <th>COA Kredit</th>
                <th>No Resi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={15} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map(r => renderRow(r))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ textAlign: 'right', fontWeight: 700 }}>Σ Total :</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalNominal)}</td>
                <td colSpan={7}></td>
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

export default Pengeluaran;
