import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Maximize2, Minimize2, Search, Download, FileSpreadsheet, FileText, File,
  Plus, Trash2, X, Check, CheckCircle2, Circle, ScanLine, FileSearch, CheckCheck
} from 'lucide-react';
import { OFFICES } from '../utils/finsCoaStore';
import { BUKU_ACCOUNTS } from '../utils/finsBukuHarianStore';
import {
  INITIAL_PERTANGGUNGJAWABAN, JENIS_TRANSAKSI_REALISASI
} from '../utils/pertanggungjawabanStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unapprove', label: 'Unapprove' },
  { value: 'approved', label: 'Approved' }
];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const emptyDraftLine = () => ({ jenisTransaksi: '', realisasi: '', keterangan: '' });

const Pertanggungjawaban = () => {
  const [records, setRecords] = useState(INITIAL_PERTANGGUNGJAWABAN);
  const [view, setView] = useState('list');
  const [activeId, setActiveId] = useState(null);

  const [periodeFrom, setPeriodeFrom] = useState('2026-01-01');
  const [periodeTo, setPeriodeTo] = useState(new Date().toISOString().slice(0, 10));
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [advKeyword, setAdvKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('unapprove');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [bukuFilter, setBukuFilter] = useState('');
  const [multipleSelect, setMultipleSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [header, setHeader] = useState({ viaBayar: 'Bank', bankAccount: '', officeId: '1', tanggal: nowLocal(), backDate: false });
  const [lineChecked, setLineChecked] = useState(true);
  const [draftLine, setDraftLine] = useState(emptyDraftLine());
  const [breakdownLines, setBreakdownLines] = useState([]);

  const bankOptions = BUKU_ACCOUNTS.filter(a => a.jenis === 'bank').map(a => ({ value: a.coa, label: a.nama }));
  const jenisOptions = JENIS_TRANSAKSI_REALISASI.map(j => ({ value: j.nama, label: j.nama }));
  const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));
  const bukuOptions = [...new Set(records.map(r => r.namaAkunKredit))].map(n => ({ value: n, label: n }));

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPeriodeFrom('2026-01-01');
    setPeriodeTo(new Date().toISOString().slice(0, 10));
    setKeywordDraft('');
    setKeyword('');
    setAdvKeyword('');
    setAdvanceOpen(false);
    setStatusFilter('unapprove');
    setOfficeFilter('all');
    setBukuFilter('');
    setMultipleSelect(false);
    setSelectedIds(new Set());
    setPage(1);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const ak = advKeyword.trim().toLowerCase();
    return records.filter(r => {
      const matchesPeriode = r.tanggal >= periodeFrom && r.tanggal <= periodeTo;
      const matchesKeyword = !k || r.idBuku.toLowerCase().includes(k) || r.namaAkun.toLowerCase().includes(k) || r.keterangan.toLowerCase().includes(k);
      const matchesAdv = !ak || r.noResi.toLowerCase().includes(ak) || r.idBuku.toLowerCase().includes(ak);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesOffice = officeFilter === 'all' || r.officeId === officeFilter;
      const matchesBuku = !bukuFilter || r.namaAkunKredit === bukuFilter;
      return matchesPeriode && matchesKeyword && matchesAdv && matchesStatus && matchesOffice && matchesBuku;
    });
  }, [records, periodeFrom, periodeTo, keyword, advKeyword, statusFilter, officeFilter, bukuFilter]);

  const totalNominal = filtered.reduce((s, r) => s + r.nominal * r.quantity, 0);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleRowSelected = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleApproveSelected = () => {
    if (selectedIds.size === 0) { alert('Pilih minimal satu baris terlebih dahulu.'); return; }
    if (!window.confirm(`Approve ${selectedIds.size} pertanggungjawaban terpilih tanpa breakdown detail?`)) return;
    setRecords(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status: 'approved' } : r));
    setSelectedIds(new Set());
  };

  const openForm = (record) => {
    setActiveId(record.id);
    setHeader({ viaBayar: 'Bank', bankAccount: record.coaKredit, officeId: record.officeId, tanggal: nowLocal(), backDate: false });
    setLineChecked(true);
    setBreakdownLines(record.realisasiLines.map((l, idx) => ({ key: `existing-${idx}`, ...l })));
    setDraftLine(emptyDraftLine());
    setView('form');
  };

  const activeRecord = records.find(r => r.id === activeId);

  const addBreakdownLine = () => {
    if (!draftLine.jenisTransaksi || !draftLine.realisasi) {
      alert('Pilih Jenis Transaksi dan isi Realisasi terlebih dahulu.');
      return;
    }
    const jt = JENIS_TRANSAKSI_REALISASI.find(j => j.nama === draftLine.jenisTransaksi);
    setBreakdownLines(prev => [...prev, {
      key: `draft-${Date.now()}-${Math.random()}`,
      coa: jt?.coa || '',
      namaAkun: draftLine.jenisTransaksi,
      quantity: 1,
      nominal: Number(draftLine.realisasi),
      keterangan: draftLine.keterangan
    }]);
    setDraftLine(emptyDraftLine());
  };
  const removeBreakdownLine = (key) => setBreakdownLines(prev => prev.filter(l => l.key !== key));

  const realisasiTotal = breakdownLines.reduce((s, l) => s + l.nominal * l.quantity, 0);
  const isFullyReconciled = activeRecord ? Math.abs(realisasiTotal - activeRecord.nominal * activeRecord.quantity) < 0.5 : false;

  const handleCancel = () => { setView('list'); setActiveId(null); };

  const persist = (nextStatus) => {
    if (breakdownLines.length === 0) {
      alert('Tambahkan minimal satu baris Break Pertanggungjawaban.');
      return false;
    }
    if (!header.bankAccount) {
      alert('Pilih Bank terlebih dahulu.');
      return false;
    }
    setRecords(prev => prev.map(r => r.id === activeId
      ? { ...r, status: nextStatus, realisasiLines: breakdownLines.map(({ key, ...rest }) => rest) }
      : r));
    return true;
  };

  const handleSave = () => {
    if (!persist(isFullyReconciled ? 'approved' : 'unapprove')) return;
    if (!isFullyReconciled) {
      alert(`Tersimpan sebagai draft. Realisasi (${fmt(realisasiTotal)}) belum sama dengan Nominal CA (${fmt(activeRecord.nominal * activeRecord.quantity)}).`);
    } else {
      alert('Pertanggungjawaban berhasil disimpan & direkonsiliasi penuh.');
    }
    setView('list');
    setActiveId(null);
  };

  const handleDeleteRecord = (id) => {
    if (!window.confirm('Hapus pengajuan pertanggungjawaban ini?')) return;
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleImportFile = () => alert('Import Pertanggungjawaban dari file — belum tersedia di prototipe ini.');

  // --- FORM ---
  if (view === 'form' && activeRecord) {
    return (
      <div className="content-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Pertanggungjawaban Cash Advance (CA)</h1>
            <p>No Resi {activeRecord.noResi} — {activeRecord.namaAkun}</p>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700 }}>
            Pertanggungjawaban Cash Advance (CA)
          </div>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Pertanggungjawaban</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>No Resi</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" className="form-input" disabled value={activeRecord.noResi} />
                  <FileSearch size={18} color="#64748b" title="Lihat dokumen resi" />
                </div>
              </div>
              <div className="form-group">
                <label>Approver</label>
                <input type="text" className="form-input" disabled value={`${activeRecord.approver} [${activeRecord.approverJabatan}]`} />
              </div>

              <div className="form-group">
                <label>Pengaju</label>
                <input type="text" className="form-input" disabled value={`${activeRecord.pengaju} [${activeRecord.pengajuJabatan}]`} />
              </div>
              <div className="form-group">
                <label>Pengembali</label>
                <input type="text" className="form-input" disabled value={`${activeRecord.pengembali} [${activeRecord.pengembaliJabatan}]`} />
              </div>

              <div className="form-group">
                <label>Pencair</label>
                <input type="text" className="form-input" disabled value={`${activeRecord.pencair} [${activeRecord.pencairJabatan}]`} />
              </div>
              <div className="form-group">
                <label>Kantor</label>
                <SearchableSelect options={officeOptions} value={header.officeId} onChange={val => setHeader(prev => ({ ...prev, officeId: val }))} />
              </div>

              <div className="form-group">
                <label>Via Bayar</label>
                <SearchableSelect
                  options={[{ value: 'Bank', label: 'Bank' }, { value: 'Cash', label: 'Cash' }]}
                  value={header.viaBayar}
                  onChange={val => setHeader(prev => ({ ...prev, viaBayar: val, bankAccount: '' }))}
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

              <div className="form-group">
                <label>{header.viaBayar === 'Bank' ? 'Bank' : 'Kas'}</label>
                <SearchableSelect
                  options={header.viaBayar === 'Bank' ? bankOptions : BUKU_ACCOUNTS.filter(a => a.jenis === 'kas').map(a => ({ value: a.coa, label: a.nama }))}
                  value={header.bankAccount}
                  onChange={val => setHeader(prev => ({ ...prev, bankAccount: val }))}
                  placeholder={header.viaBayar === 'Bank' ? 'Pilih rekening bank' : 'Pilih akun kas'}
                />
              </div>
            </div>

            {/* ORIGINAL CA LINE */}
            <div className="data-table-container" style={{ marginTop: '8px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>COA</th>
                    <th>Nama Akun</th>
                    <th style={{ textAlign: 'center' }}>Quantity</th>
                    <th style={{ textAlign: 'right' }}>Nominal Satuan</th>
                    <th style={{ textAlign: 'right' }}>Total Nominal</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign: 'right' }}>Realisasi</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                    <th style={{ textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={isFullyReconciled ? { background: '#f0fdf4' } : { background: '#fef2f2' }}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{activeRecord.coaDebet}</td>
                    <td>{activeRecord.namaAkun}</td>
                    <td style={{ textAlign: 'center' }}>{activeRecord.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(activeRecord.nominal)}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(activeRecord.nominal * activeRecord.quantity)}</td>
                    <td>{activeRecord.keterangan}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(realisasiTotal)}</td>
                    <td style={{ textAlign: 'center' }}>
                      {isFullyReconciled ? <CheckCircle2 size={18} color="#16a34a" /> : <Circle size={18} color="#cbd5e1" />}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={lineChecked} onChange={e => setLineChecked(e.target.checked)} />
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr style={{ fontWeight: 700 }}>
                    <td colSpan={4}>Total :</td>
                    <td style={{ textAlign: 'right' }}>{fmt(activeRecord.nominal * activeRecord.quantity)}</td>
                    <td></td>
                    <td style={{ textAlign: 'right' }}>{fmt(realisasiTotal)}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '28px 0 16px', fontFamily: 'var(--font-heading)' }}>Break Pertanggungjawaban</h3>
            <div className="form-grid" style={{ alignItems: 'end' }}>
              <div className="form-group">
                <label>Jenis Transaksi</label>
                <SearchableSelect options={jenisOptions} value={draftLine.jenisTransaksi} onChange={val => setDraftLine(prev => ({ ...prev, jenisTransaksi: val }))} placeholder="Jenis Transaksi" />
              </div>
              <div className="form-group">
                <label>Realisasi</label>
                <input type="number" className="form-input" placeholder="Realisasi" value={draftLine.realisasi} onChange={e => setDraftLine(prev => ({ ...prev, realisasi: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input type="text" className="form-input" placeholder="Keterangan" value={draftLine.keterangan} onChange={e => setDraftLine(prev => ({ ...prev, keterangan: e.target.value }))} />
              </div>
              <div className="form-group" style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-primary" onClick={addBreakdownLine}><Plus size={16} /> Tambah</button>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Scan bukti/kwitansi" onClick={() => alert('Scan bukti/kwitansi — belum tersedia di prototipe ini.')}>
                  <ScanLine size={16} />
                </button>
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
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownLines.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada baris breakdown</td></tr>
                  )}
                  {breakdownLines.map(l => (
                    <tr key={l.key}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.coa}</td>
                      <td>{l.namaAkun}</td>
                      <td style={{ textAlign: 'center' }}>{l.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(l.nominal)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(l.nominal * l.quantity)}</td>
                      <td>{l.keterangan || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} title="Hapus baris" onClick={() => removeBreakdownLine(l.key)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {breakdownLines.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Total :</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(realisasiTotal)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {!isFullyReconciled && breakdownLines.length > 0 && (
              <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--danger-color)' }}>
                Selisih {fmt(Math.abs(realisasiTotal - activeRecord.nominal * activeRecord.quantity))} — realisasi belum sama dengan nominal CA yang dicairkan.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleCancel}><X size={16} /> Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleSave}><Check size={16} /> Save</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST ---
  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ marginBottom: 0 }}>Pertanggungjawaban</h1>
          <button onClick={handleRefresh} title="Reset filter" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}>
            <RefreshCw size={20} className={isRefreshing ? 'icon-spin' : ''} />
          </button>
        </div>
        <button onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? 'Keluar layar penuh' : 'Perbesar layar penuh'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Periode :</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeFrom} onChange={e => setPeriodeFrom(e.target.value)} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>s/d</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeTo} onChange={e => setPeriodeTo(e.target.value)} />
          <div className="filter-input" style={{ width: '200px' }}>
            <Search size={16} />
            <input type="text" placeholder="Keyword..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
          <button className="btn" style={{ background: advanceOpen ? '#e0f2fe' : 'white', border: '1px solid #e2e8f0' }} onClick={() => setAdvanceOpen(o => !o)}>
            <FileSearch size={16} /> Advance
          </button>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status<sup>(?)</sup> :</span>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={officeFilter} onChange={e => { setOfficeFilter(e.target.value); setPage(1); }}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      {advanceOpen && (
        <div className="filters-row" style={{ marginTop: '-16px' }}>
          <div className="filters-left">
            <div className="filter-input">
              <span style={{ fontSize: '0.8rem' }}>No Resi / ID Buku</span>
              <input type="text" placeholder="Cari No Resi atau ID Buku..." value={advKeyword} onChange={e => { setAdvKeyword(e.target.value); setPage(1); }} />
            </div>
          </div>
        </div>
      )}

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
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
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleImportFile}>Import</button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={multipleSelect} onChange={e => { setMultipleSelect(e.target.checked); setSelectedIds(new Set()); }} /> Multiple Select
          </label>
          {multipleSelect && (
            <button className="btn btn-success" onClick={handleApproveSelected}><CheckCheck size={16} /> Approve Terpilih ({selectedIds.size})</button>
          )}
        </div>
        <div className="filters-right" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Buku :</span>
          <div style={{ width: '220px' }}>
            <SearchableSelect options={[{ value: '', label: 'Semua Akun' }, ...bukuOptions]} value={bukuFilter} onChange={val => { setBukuFilter(val); setPage(1); }} placeholder="Nama Akun" />
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Daftar Pertanggungjawaban</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {multipleSelect && <th style={{ width: '32px' }}></th>}
                <th>Tanggal</th>
                <th>ID Buku</th>
                <th>Nama Akun</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>User Input</th>
                <th>Kantor</th>
                <th>COA Debet</th>
                <th>COA Kredit</th>
                <th>Nama Akun Kredit</th>
                <th>No Resi</th>
                <th>Referensi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={multipleSelect ? 14 : 13} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map(r => (
                <tr
                  key={r.id}
                  onDoubleClick={() => openForm(r)}
                  title="Double click untuk buka Pertanggungjawaban"
                  style={{ cursor: 'pointer', opacity: r.status === 'approved' ? 0.6 : 1 }}
                >
                  {multipleSelect && (
                    <td onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleRowSelected(r.id)} />
                    </td>
                  )}
                  <td>{r.tanggal}</td>
                  <td style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.idBuku}</td>
                  <td>{r.namaAkun}</td>
                  <td>{r.keterangan}</td>
                  <td style={{ textAlign: 'center' }}>{r.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(r.nominal * r.quantity)}</td>
                  <td>{r.userInput}</td>
                  <td>{OFFICES.find(o => o.id === r.officeId)?.nama}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.coaDebet}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.coaKredit}</td>
                  <td>{r.namaAkunKredit}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{r.noResi}</td>
                  <td>{r.referensi || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={multipleSelect ? 6 : 5} style={{ textAlign: 'right', fontWeight: 700 }}>Σ Total :</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalNominal)}</td>
                <td colSpan={multipleSelect ? 7 : 7}></td>
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

export default Pertanggungjawaban;
