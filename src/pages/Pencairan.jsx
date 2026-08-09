import React, { useState, useMemo } from 'react';
import {
  RefreshCw, Search, Download, FileSpreadsheet, FileText, File, ExternalLink,
  SlidersHorizontal, X, Check, Ban, Trash2
} from 'lucide-react';
import { OFFICES } from '../utils/finsCoaStore';
import { INITIAL_REKENING_BANK, INITIAL_CASH_BANK_ACCOUNTS } from '../utils/finsSettingsStore';
import { CURRENT_USER } from '../utils/penerimaanStore';
import { INITIAL_PENCAIRAN } from '../utils/pencairanStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unapprove', label: 'Unapprove' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const todayStr = () => new Date().toISOString().slice(0, 10);

const rowColor = (status) => (status === 'unapprove' ? '#16a34a' : status === 'rejected' ? '#94a3b8' : 'var(--text-primary)');

const Pencairan = () => {
  const [records, setRecords] = useState(INITIAL_PENCAIRAN);
  const [periodeFrom, setPeriodeFrom] = useState('2026-01-01');
  const [periodeTo, setPeriodeTo] = useState(todayStr());
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('unapprove');
  const [kantorFilter, setKantorFilter] = useState('1');
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [nominalMin, setNominalMin] = useState('');
  const [nominalMax, setNominalMax] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [activeRecordId, setActiveRecordId] = useState(null);

  const officeOptions = useMemo(() => OFFICES.map(o => ({ value: o.id, label: o.nama })), []);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return records.filter(r => {
      const matchesPeriode = (!periodeFrom || r.tanggal >= periodeFrom) && (!periodeTo || r.tanggal <= periodeTo);
      const matchesKeyword = !k || r.idBuku.toLowerCase().includes(k) || r.namaAkun.toLowerCase().includes(k) || r.keterangan.toLowerCase().includes(k);
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesKantor = kantorFilter === 'all' || r.officeId === kantorFilter;
      const matchesMin = !nominalMin || r.nominal >= Number(nominalMin);
      const matchesMax = !nominalMax || r.nominal <= Number(nominalMax);
      return matchesPeriode && matchesKeyword && matchesStatus && matchesKantor && matchesMin && matchesMax;
    });
  }, [records, periodeFrom, periodeTo, keyword, statusFilter, kantorFilter, nominalMin, nominalMax]);

  const totals = filtered.reduce((acc, r) => ({ nominal: acc.nominal + r.nominal, realisasi: acc.realisasi + r.realisasi }), { nominal: 0, realisasi: 0 });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetAll = () => {
    setPeriodeFrom('2026-01-01'); setPeriodeTo(todayStr());
    setKeywordDraft(''); setKeyword('');
    setStatusFilter('unapprove'); setKantorFilter('1');
    setAdvanceOpen(false); setNominalMin(''); setNominalMax('');
    setExportOpen(false); setPage(1);
  };

  const activeRecord = records.find(r => r.id === activeRecordId) || null;

  const handleAction = (id, status, extra) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status, ...extra } : r));
    setActiveRecordId(null);
  };
  const handleDeleteRecord = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    setActiveRecordId(null);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Pencairan
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Pencairan dana atas Pengajuan Cash Advance (CA) yang sudah disetujui</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Periode:</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeFrom} onChange={e => setPeriodeFrom(e.target.value)} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>s/d</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={periodeTo} onChange={e => setPeriodeTo(e.target.value)} />
          <div className="filter-input" style={{ width: '180px' }}>
            <Search size={16} />
            <input type="text" placeholder="Keyword..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
          <button className="btn" style={{ background: advanceOpen ? '#eff6ff' : 'white', border: '1px solid #e2e8f0' }} onClick={() => setAdvanceOpen(o => !o)}>
            <SlidersHorizontal size={16} /> Advance
          </button>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={kantorFilter} onChange={e => { setKantorFilter(e.target.value); setPage(1); }}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      {advanceOpen && (
        <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Nominal:</span>
            <input type="number" className="form-input" style={{ width: '150px' }} placeholder="Min" value={nominalMin} onChange={e => setNominalMin(e.target.value)} />
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>s/d</span>
            <input type="number" className="form-input" style={{ width: '150px' }} placeholder="Max" value={nominalMax} onChange={e => setNominalMax(e.target.value)} />
          </div>
        </div>
      )}

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left">
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
        <div className="filters-right"></div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Daftar Pencairan</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>ID Buku</th>
              <th>Nama Akun</th>
              <th>Keterangan</th>
              <th style={{ textAlign: 'center' }}>Quantity</th>
              <th style={{ textAlign: 'right' }}>Nominal</th>
              <th style={{ textAlign: 'right' }}>Realisasi</th>
              <th>Pencair</th>
              <th>Kantor</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
            )}
            {paged.map(r => (
              <tr key={r.id} style={{ cursor: 'pointer' }} title="Double-click untuk membuka detail" onDoubleClick={() => setActiveRecordId(r.id)}>
                <td style={{ color: rowColor(r.status) }}>{r.tanggal}</td>
                <td style={{ color: rowColor(r.status), fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.idBuku}</td>
                <td style={{ color: rowColor(r.status) }}>{r.namaAkun}</td>
                <td style={{ color: rowColor(r.status) }}>{r.keterangan}</td>
                <td style={{ textAlign: 'center', color: rowColor(r.status) }}>{r.quantity}</td>
                <td style={{ textAlign: 'right', color: rowColor(r.status) }}>{fmt(r.nominal)}</td>
                <td style={{ textAlign: 'right', color: rowColor(r.status) }}>{fmt(r.realisasi)}</td>
                <td style={{ color: rowColor(r.status) }}>{r.pencairName || '-'}</td>
                <td style={{ color: rowColor(r.status) }}>{OFFICES.find(o => o.id === r.officeId)?.nama}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}></td>
              <td style={{ fontWeight: 700 }}>Σ Total :</td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totals.nominal)}</td>
              <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totals.realisasi)}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
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

      {activeRecord && (
        <PencairanModal
          record={activeRecord}
          officeOptions={officeOptions}
          onClose={() => setActiveRecordId(null)}
          onApprove={(extra) => handleAction(activeRecord.id, 'approved', extra)}
          onReject={(extra) => handleAction(activeRecord.id, 'rejected', extra)}
          onDelete={() => handleDeleteRecord(activeRecord.id)}
        />
      )}
    </div>
  );
};

const PencairanModal = ({ record, officeOptions, onClose, onApprove, onReject, onDelete }) => {
  const [viaBayar, setViaBayar] = useState(record.viaBayar || 'Bank');
  const [bankAccount, setBankAccount] = useState(record.bankAccount || '');
  const [officeId, setOfficeId] = useState(record.officeId);
  const [tag, setTag] = useState(record.tag || 'Internal');
  const [referensiMitra, setReferensiMitra] = useState(record.referensiMitra || '');
  const [checked, setChecked] = useState(true);

  const bankOptions = useMemo(() => INITIAL_REKENING_BANK.filter(b => b.active).map(b => ({
    value: `${b.bank} ${b.accountNumber}`,
    label: `${b.bank.toUpperCase()} ${b.accountNumber} ${b.description}`,
  })), []);

  const saldoBank = useMemo(() => {
    if (!bankAccount) return 0;
    const bankName = bankAccount.split(' ')[0];
    const acc = INITIAL_CASH_BANK_ACCOUNTS.find(a => a.namaAkun.toLowerCase().includes(bankName.toLowerCase()));
    return acc ? acc.saldoAwal + acc.debet - acc.kredit : 0;
  }, [bankAccount]);

  const isProcessed = record.status !== 'unapprove';
  const canSave = viaBayar === 'Cash' || !!bankAccount;

  const buildExtra = () => ({
    viaBayar,
    bankAccount,
    officeId,
    tag,
    referensiMitra,
    pencairName: CURRENT_USER.nama,
    realisasi: checked ? record.nominal : 0,
  });

  const handleSave = () => {
    if (!canSave) { alert('Pilih Bank terlebih dahulu untuk pencairan via Bank.'); return; }
    if (!window.confirm(`Cairkan dana sebesar ${fmt(record.nominal)} untuk "${record.namaAkun}"?`)) return;
    onApprove(buildExtra());
  };
  const handleReject = () => {
    if (!window.confirm('Tolak pencairan CA ini?')) return;
    onReject(buildExtra());
  };
  const handleDelete = () => {
    if (!window.confirm('Hapus rekaman pencairan ini secara permanen?')) return;
    onDelete();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2>Pencairan Cash Advance (CA)</h2>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <h3 style={{ fontSize: '0.9rem', marginBottom: '14px', fontFamily: 'var(--font-heading)' }}>Informasi Pencairan</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>No Resi</label>
              <input type="text" className="form-input" disabled value={record.noResi} />
            </div>
            <div className="form-group">
              <label>Approver</label>
              <input type="text" className="form-input" disabled value={`${record.approverName} [${record.approverRole}]`} />
            </div>
            <div className="form-group">
              <label>Pengaju</label>
              <input type="text" className="form-input" disabled value={`${record.pengaju} [${record.pengajuRole}]`} />
            </div>
            <div className="form-group">
              <label>Kantor</label>
              <SearchableSelect options={officeOptions} value={officeId} onChange={setOfficeId} />
            </div>
            <div className="form-group">
              <label>Pencair</label>
              <input type="text" className="form-input" disabled value={record.pencairName || `${CURRENT_USER.nama} (Anda)`} />
            </div>
            <div className="form-group">
              <label>Tanggal</label>
              <input type="text" className="form-input" disabled value={record.tanggal} />
            </div>
            <div className="form-group">
              <label>Via Bayar</label>
              <select className="form-select" value={viaBayar} onChange={e => { setViaBayar(e.target.value); setBankAccount(''); }} disabled={isProcessed}>
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tag</label>
              <select className="form-select" value={tag} onChange={e => setTag(e.target.value)} disabled={isProcessed}>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
              </select>
            </div>
            {viaBayar === 'Bank' && (
              <div className="form-group">
                <label>Bank</label>
                <SearchableSelect options={bankOptions} value={bankAccount} onChange={setBankAccount} placeholder="Pilih rekening bank" />
              </div>
            )}
            <div className="form-group">
              <label>Saldo Bank</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input type="text" className="form-input" disabled value={fmt(saldoBank)} />
                <span style={{ fontSize: '0.72rem', color: '#dc2626', whiteSpace: 'nowrap' }}>Tanggal: {todayStr()}</span>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Referensi/Mitra</label>
              <input type="text" className="form-input" value={referensiMitra} onChange={e => setReferensiMitra(e.target.value)} disabled={isProcessed} />
            </div>
          </div>

          <h3 style={{ fontSize: '0.9rem', margin: '20px 0 12px', fontFamily: 'var(--font-heading)' }}>Detail Pencairan</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>COA</th>
                <th>Nama Akun</th>
                <th style={{ textAlign: 'center' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Nominal Satuan</th>
                <th style={{ textAlign: 'right' }}>Total Nominal</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center' }}>Cairkan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{record.coa}</td>
                <td>{record.namaAkun}</td>
                <td style={{ textAlign: 'center' }}>{record.quantity}</td>
                <td style={{ textAlign: 'right' }}>{fmt(record.nominal)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(record.nominal * record.quantity)}</td>
                <td>{record.keterangan}</td>
                <td style={{ textAlign: 'center' }}>
                  <input type="checkbox" checked={checked} disabled={isProcessed} onChange={e => setChecked(e.target.checked)} />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>Total :</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(record.nominal * record.quantity)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>

          {isProcessed && (
            <div style={{ marginTop: '14px', fontSize: '0.8rem', fontWeight: 600, color: record.status === 'approved' ? '#16a34a' : '#dc2626' }}>
              Status saat ini: {record.status === 'approved' ? 'Sudah Dicairkan' : 'Ditolak'} — {record.pencairName ? `oleh ${record.pencairName}` : ''}
            </div>
          )}
        </div>
        <div className="modal-footer">
          {isProcessed ? (
            <>
              <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={handleDelete}><Trash2 size={16} /> Hapus</button>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={onClose}>Cancel</button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-success" onClick={handleSave}><Check size={16} /> Save</button>
              <button type="button" className="btn btn-danger" onClick={handleReject}><Ban size={16} /> Reject</button>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={onClose}><X size={16} /> Cancel</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pencairan;
