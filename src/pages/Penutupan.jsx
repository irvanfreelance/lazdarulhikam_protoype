import React, { useState, useMemo, useRef } from 'react';
import {
  RefreshCw, Search, Download, FileSpreadsheet, FileText, File, ExternalLink,
  Trash2, X, Eye, Save, RotateCcw
} from 'lucide-react';
import { OFFICES } from '../utils/finsCoaStore';
import { INITIAL_CASH_BANK_ACCOUNTS } from '../utils/finsSettingsStore';
import { CURRENT_USER } from '../utils/penerimaanStore';
import { PECAHAN_KERTAS, PECAHAN_LOGAM, emptyDenom, INITIAL_PENUTUPAN } from '../utils/penutupanStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => new Intl.NumberFormat('id-ID').format(n || 0);
const nowStamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

const isKasAccount = (account) => account.coa.startsWith('101.01');

const Penutupan = () => {
  const accounts = INITIAL_CASH_BANK_ACCOUNTS;
  const [records, setRecords] = useState(INITIAL_PENUTUPAN);
  const [view, setView] = useState('list');
  const [activeAccountId, setActiveAccountId] = useState(null);
  const [activeDate, setActiveDate] = useState(todayStr());

  const [tanggalFrom, setTanggalFrom] = useState(todayStr());
  const [tanggalTo, setTanggalTo] = useState(todayStr());
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [scope, setScope] = useState('harian');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bukuFilter, setBukuFilter] = useState('all');
  const [kantorFilter, setKantorFilter] = useState('all');
  const [akunFilter, setAkunFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const officeOptions = useMemo(() => OFFICES.map(o => ({ value: o.id, label: o.nama })), []);
  const akunOptions = useMemo(() => [{ value: 'all', label: 'Akun: Semua' }, ...accounts.map(a => ({ value: a.id, label: a.namaAkun }))], [accounts]);

  const recordFor = (accountId, tanggal) => records.find(r => r.accountId === accountId && r.tanggal === tanggal);
  const priorRecordFor = (accountId, tanggal) => {
    const priors = records.filter(r => r.accountId === accountId && r.tanggal < tanggal);
    if (priors.length === 0) return null;
    return priors.reduce((latest, r) => (r.tanggal > latest.tanggal ? r : latest));
  };

  const dateRange = useMemo(() => {
    const dates = [];
    let cur = new Date(tanggalFrom);
    const end = new Date(tanggalTo);
    if (isNaN(cur) || isNaN(end) || cur > end) return [tanggalFrom];
    while (cur <= end) {
      dates.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, [tanggalFrom, tanggalTo]);

  const filteredAccounts = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return accounts.filter(a => {
      const matchesKeyword = !k || a.namaAkun.toLowerCase().includes(k) || a.coa.toLowerCase().includes(k);
      const matchesBuku = bukuFilter === 'all' || (bukuFilter === 'kas' ? isKasAccount(a) : !isKasAccount(a));
      const matchesKantor = kantorFilter === 'all' || a.officeId === kantorFilter;
      const matchesAkun = akunFilter === 'all' || a.id === akunFilter;
      return matchesKeyword && matchesBuku && matchesKantor && matchesAkun;
    });
  }, [accounts, keyword, bukuFilter, kantorFilter, akunFilter]);

  const isHarian = scope === 'harian';

  const rows = useMemo(() => {
    if (isHarian) {
      const out = [];
      filteredAccounts.forEach(account => {
        dateRange.forEach(tanggal => {
          const record = recordFor(account.id, tanggal);
          out.push({ account, tanggal, record });
        });
      });
      return out.filter(r => statusFilter === 'all' || (statusFilter === 'closed' ? !!r.record : !r.record));
    }
    // Bulanan/Tahunan: agregat baca-saja, ambil rekaman terakhir per periode.
    const periodOf = (tgl) => (scope === 'bulanan' ? tgl.slice(0, 7) : tgl.slice(0, 4));
    const periods = [...new Set(dateRange.map(periodOf))];
    const out = [];
    filteredAccounts.forEach(account => {
      periods.forEach(period => {
        const matching = records.filter(r => r.accountId === account.id && periodOf(r.tanggal) === period);
        const record = matching.length ? matching.reduce((latest, r) => (r.tanggal > latest.tanggal ? r : latest)) : null;
        out.push({ account, tanggal: period, record, readonly: true });
      });
    });
    return out.filter(r => statusFilter === 'all' || (statusFilter === 'closed' ? !!r.record : !r.record));
  }, [isHarian, filteredAccounts, dateRange, records, statusFilter, scope]);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    saldoAkhir: acc.saldoAkhir + (r.record?.saldoAkhir || 0),
    saldoAwal: acc.saldoAwal + (r.record?.saldoAwal || 0),
    penerimaan: acc.penerimaan + (r.record?.penerimaan || 0),
    pengeluaran: acc.pengeluaran + (r.record?.pengeluaran || 0),
    penyesuaian: acc.penyesuaian + (r.record?.penyesuaian || 0),
  }), { saldoAkhir: 0, saldoAwal: 0, penerimaan: 0, pengeluaran: 0, penyesuaian: 0 }), [rows]);

  const closedCount = rows.filter(r => r.record).length;

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };
  const resetAll = () => {
    setTanggalFrom(todayStr()); setTanggalTo(todayStr());
    setKeywordDraft(''); setKeyword('');
    setScope('harian'); setStatusFilter('all'); setBukuFilter('all'); setKantorFilter('all'); setAkunFilter('all');
    setPage(1); setExportOpen(false); setPreviewOpen(false);
  };

  const openForm = (accountId, tanggal) => {
    setActiveAccountId(accountId);
    setActiveDate(tanggal);
    setView(isKasAccount(accounts.find(a => a.id === accountId)) ? 'co' : 'bo');
  };

  const handleDeleteRecord = (accountId, tanggal) => {
    if (!window.confirm('Hapus penutupan ini? Baris akan kembali ke status "belum ditutup".')) return;
    setRecords(prev => prev.filter(r => !(r.accountId === accountId && r.tanggal === tanggal)));
  };

  const handleImportExport = () => setExportOpen(o => !o);

  if (view === 'co' || view === 'bo') {
    return (
      <OpnameForm
        kind={view}
        accounts={accounts}
        activeAccountId={activeAccountId}
        activeDate={activeDate}
        officeOptions={officeOptions}
        existingRecord={recordFor(activeAccountId, activeDate)}
        priorRecord={priorRecordFor(activeAccountId, activeDate)}
        onCancel={() => setView('list')}
        onSave={(payload) => {
          setRecords(prev => {
            const withoutThis = prev.filter(r => !(r.accountId === payload.accountId && r.tanggal === payload.tanggal));
            return [...withoutThis, payload];
          });
          setView('list');
        }}
      />
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Penutupan {scope === 'harian' ? 'Harian' : scope === 'bulanan' ? 'Bulanan' : 'Tahunan'}
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Rekonsiliasi saldo kas & bank harian (Cash Opname / Bank Opname)</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tanggal:</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={tanggalFrom} onChange={e => setTanggalFrom(e.target.value)} />
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>s/d</span>
          <input type="date" className="form-input" style={{ width: '150px' }} value={tanggalTo} onChange={e => setTanggalTo(e.target.value)} />
          <div className="filter-input" style={{ width: '180px' }}>
            <Search size={16} />
            <input type="text" placeholder="Keyword..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px', alignItems: 'center' }}>
          <div style={{ width: '150px' }}>
            <SearchableSelect options={officeOptions} value={kantorFilter === 'all' ? '' : kantorFilter} onChange={val => setKantorFilter(val || 'all')} placeholder="Semua Kantor" allowFreeText={false} />
          </div>
          <div style={{ width: '190px' }}>
            <SearchableSelect options={akunOptions} value={akunFilter} onChange={setAkunFilter} />
          </div>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Penutupan:</span>
          <select className="form-select" style={{ width: 'auto' }} value={scope} onChange={e => { setScope(e.target.value); setPage(1); }}>
            <option value="harian">Harian</option>
            <option value="bulanan">Bulanan</option>
            <option value="tahunan">Tahunan</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
          <select className="form-select" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="closed">Sudah Ditutup</option>
            <option value="open">Belum Ditutup</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Buku:</span>
          <select className="form-select" style={{ width: 'auto' }} value={bukuFilter} onChange={e => { setBukuFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="kas">Kas</option>
            <option value="bank">Bank</option>
          </select>
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setPreviewOpen(o => !o)}>
              <Eye size={16} /> Preview Saldo
            </button>
            {previewOpen && (
              <div className="export-menu" style={{ minWidth: '260px', padding: '12px 14px' }}>
                <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Akun ditampilkan</span><strong>{filteredAccounts.length}</strong></div>
                <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Sudah ditutup</span><strong>{closedCount} / {rows.length}</strong></div>
                <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}><span>Total Saldo Akhir</span><strong>{fmt(totals.saldoAkhir)}</strong></div>
              </div>
            )}
          </div>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleImportExport}>
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
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Penutupan</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Tanggal</th>
                <th>Akun</th>
                <th style={{ textAlign: 'right' }}>Saldo Akhir</th>
                <th style={{ textAlign: 'right' }}>Saldo Awal</th>
                <th style={{ textAlign: 'right' }}>Debet</th>
                <th style={{ textAlign: 'right' }}>Kredit</th>
                <th style={{ textAlign: 'right' }}>Adjustment</th>
                <th>COA</th>
                <th>User Input</th>
                <th>Updated</th>
                {PECAHAN_KERTAS.map(n => <th key={`hk-${n}`} style={{ textAlign: 'right' }}>K{n}</th>)}
                {PECAHAN_LOGAM.map(n => <th key={`hl-${n}`} style={{ textAlign: 'right' }}>L{n}</th>)}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={11 + PECAHAN_KERTAS.length + PECAHAN_LOGAM.length} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map(({ account, tanggal, record, readonly }) => {
                const kas = isKasAccount(account);
                const closed = !!record;
                const cellStyle = { textAlign: 'right', color: closed ? undefined : '#ef4444', fontWeight: closed ? 400 : 500 };
                return (
                  <tr key={`${account.id}-${tanggal}`}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {readonly ? (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }} title="Gunakan Penutupan Harian untuk mengubah">—</span>
                      ) : (
                        <div className="action-buttons">
                          <a href="#" onClick={e => { e.preventDefault(); openForm(account.id, tanggal); }}
                            style={{ fontWeight: 700, fontSize: '0.78rem', color: kas ? '#dc2626' : '#4f46e5', textDecoration: 'none' }}>
                            {kas ? 'CO' : 'BO'}
                          </a>
                          {closed && (
                            <Trash2 size={14} color="#ef4444" style={{ cursor: 'pointer' }} title="Hapus penutupan" onClick={() => handleDeleteRecord(account.id, tanggal)} />
                          )}
                        </div>
                      )}
                    </td>
                    <td>{tanggal}</td>
                    <td style={{ color: kas ? '#dc2626' : '#4f46e5', fontWeight: 500 }}>{account.namaAkun}</td>
                    <td style={cellStyle}>{fmt(record?.saldoAkhir || 0)}</td>
                    <td style={cellStyle}>{fmt(record?.saldoAwal || 0)}</td>
                    <td style={cellStyle}>{fmt(record?.penerimaan || 0)}</td>
                    <td style={cellStyle}>{fmt(record?.pengeluaran || 0)}</td>
                    <td style={cellStyle}>{fmt(record?.penyesuaian || 0)}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{account.coa}</td>
                    <td>{record?.userInput || '-'}</td>
                    <td style={{ fontSize: '0.72rem' }}>{record?.updatedAt || '-'}</td>
                    {PECAHAN_KERTAS.map(n => (
                      <td key={`k-${n}`} style={{ textAlign: 'right', fontSize: '0.78rem' }}>{kas && record?.kertas?.[n] ? record.kertas[n] : ''}</td>
                    ))}
                    {PECAHAN_LOGAM.map(n => (
                      <td key={`l-${n}`} style={{ textAlign: 'right', fontSize: '0.78rem' }}>{kas && record?.logam?.[n] ? record.logam[n] : ''}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ fontWeight: 700 }}>Σ Total :</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totals.saldoAkhir)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totals.saldoAwal)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totals.penerimaan)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totals.pengeluaran)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totals.penyesuaian)}</td>
                <td colSpan={3 + PECAHAN_KERTAS.length + PECAHAN_LOGAM.length}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Menampilkan {rows.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, rows.length)} dari {rows.length} data
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

// --- Cash Opname / Bank Opname form ---
const OpnameForm = ({ kind, accounts, activeAccountId, activeDate, officeOptions, existingRecord, priorRecord, onCancel, onSave }) => {
  const isCo = kind === 'co';
  const account = accounts.find(a => a.id === activeAccountId);
  const bankOptions = useMemo(() => accounts.filter(a => !isKasAccount(a)).map(a => ({ value: a.id, label: a.namaAkun })), [accounts]);

  const [formAccountId, setFormAccountId] = useState(activeAccountId);
  const [formDate, setFormDate] = useState(activeDate);
  const [officeId, setOfficeId] = useState(account.officeId);
  const [penerimaan, setPenerimaan] = useState(existingRecord ? existingRecord.penerimaan : account.debet);
  const [pengeluaran, setPengeluaran] = useState(existingRecord ? existingRecord.pengeluaran : account.kredit);
  const [penyesuaian, setPenyesuaian] = useState(existingRecord ? existingRecord.penyesuaian : 0);
  const [kertas, setKertas] = useState(existingRecord?.kertas ? { ...existingRecord.kertas } : emptyDenom(PECAHAN_KERTAS));
  const [logam, setLogam] = useState(existingRecord?.logam ? { ...existingRecord.logam } : emptyDenom(PECAHAN_LOGAM));

  const inputRefs = useRef({});

  const currentAccount = accounts.find(a => a.id === formAccountId) || account;
  const saldoAwal = priorRecord ? priorRecord.saldoAkhir : currentAccount.saldoAwal;
  const saldoAkhir = saldoAwal + Number(penerimaan || 0) - Number(pengeluaran || 0) + Number(penyesuaian || 0);
  const saldoFisik = isCo
    ? PECAHAN_KERTAS.reduce((s, n) => s + n * (Number(kertas[n]) || 0), 0) + PECAHAN_LOGAM.reduce((s, n) => s + n * (Number(logam[n]) || 0), 0)
    : null;
  const isValid = isCo ? saldoFisik === saldoAkhir : true;

  const handleClear = () => {
    setPenerimaan(currentAccount.debet);
    setPengeluaran(currentAccount.kredit);
    setPenyesuaian(0);
    setKertas(emptyDenom(PECAHAN_KERTAS));
    setLogam(emptyDenom(PECAHAN_LOGAM));
  };

  const handleSave = () => {
    if (isCo && !isValid) {
      alert(`Σ Saldo Fisik (${fmt(saldoFisik)}) belum sesuai dengan Saldo Akhir (${fmt(saldoAkhir)}). Silakan lengkapi pecahan uang terlebih dahulu.`);
      return;
    }
    onSave({
      id: existingRecord?.id || `${formAccountId}-${formDate}-${Date.now()}`,
      accountId: formAccountId,
      tanggal: formDate,
      saldoAwal,
      penerimaan: Number(penerimaan || 0),
      pengeluaran: Number(pengeluaran || 0),
      penyesuaian: Number(penyesuaian || 0),
      saldoAkhir,
      kertas: isCo ? kertas : null,
      logam: isCo ? logam : null,
      userInput: CURRENT_USER.nama,
      updatedAt: nowStamp(),
    });
  };

  const focusInput = (key) => inputRefs.current[key]?.focus();

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>{isCo ? 'Cash Opname' : 'Bank Opname'}</h1>
          <p>{currentAccount.namaAkun} — {formDate}</p>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700 }}>
          Penutupan
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: isCo ? '1fr 1fr' : '1fr', gap: '28px' }}>
          <div>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>NIK Input</label>
                <input type="text" className="form-input" disabled value={CURRENT_USER.id} />
              </div>
              <div className="form-group full-width">
                <label>User Input</label>
                <input type="text" className="form-input" disabled value={CURRENT_USER.nama} />
              </div>
              <div className="form-group">
                <label>Periode Tanggal</label>
                <input type="date" className="form-input" value={formDate} onChange={e => setFormDate(e.target.value)} />
              </div>
              {isCo ? (
                <div className="form-group">
                  <label>Kantor</label>
                  <SearchableSelect options={officeOptions} value={officeId} onChange={setOfficeId} />
                </div>
              ) : (
                <div className="form-group">
                  <label>Bank</label>
                  <SearchableSelect options={bankOptions} value={formAccountId} onChange={setFormAccountId} />
                </div>
              )}
              <div className="form-group">
                <label>Saldo Awal</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="text" className="form-input" disabled value={fmt(saldoAwal)} />
                  <span style={{ fontSize: '0.75rem', color: '#dc2626', whiteSpace: 'nowrap' }}>{priorRecord ? priorRecord.tanggal : 'saldo dasar'}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Σ Penerimaan</label>
                <input type="number" className="form-input" value={penerimaan} onChange={e => setPenerimaan(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Σ Pengeluaran</label>
                <input type="number" className="form-input" value={pengeluaran} onChange={e => setPengeluaran(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Penyesuaian</label>
                <input type="number" className="form-input" value={penyesuaian} onChange={e => setPenyesuaian(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Saldo Akhir</label>
                <input type="text" className="form-input" disabled value={fmt(saldoAkhir)} style={{ fontWeight: 700 }} />
              </div>
              {isCo && (
                <div className="form-group">
                  <label>Σ Saldo Fisik</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="text" className="form-input" disabled value={saldoFisik ? fmt(saldoFisik) : ''} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isValid ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                      {isValid ? 'Valid' : 'Not Valid'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {isCo && !isValid && (
              <div style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginTop: '8px' }}>
                Silahkan Anda melakukan penutupan !
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button type="button" className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save</button>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleClear}><RotateCcw size={16} /> Clear</button>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={onCancel}><X size={16} /> Batal</button>
            </div>
          </div>

          {isCo && (
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>Validasi Saldo Fisik (Rp)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Pecahan Kertas</div>
                  <table className="data-table">
                    <thead><tr><th>Pecahan</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                    <tbody>
                      {PECAHAN_KERTAS.map(n => (
                        <tr key={n} style={{ cursor: 'pointer' }} onClick={() => focusInput(`k-${n}`)}>
                          <td>{fmt(n)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              ref={el => { inputRefs.current[`k-${n}`] = el; }}
                              type="number" min="0" style={{ width: '64px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px' }}
                              value={kertas[n] || ''}
                              onClick={e => e.stopPropagation()}
                              onChange={e => setKertas(prev => ({ ...prev, [n]: Number(e.target.value) || 0 }))}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>{fmt(n * (Number(kertas[n]) || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#64748b' }}>Pecahan Logam</div>
                  <table className="data-table">
                    <thead><tr><th>Pecahan</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
                    <tbody>
                      {PECAHAN_LOGAM.map(n => (
                        <tr key={n} style={{ cursor: 'pointer' }} onClick={() => focusInput(`l-${n}`)}>
                          <td>{fmt(n)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              ref={el => { inputRefs.current[`l-${n}`] = el; }}
                              type="number" min="0" style={{ width: '64px', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px' }}
                              value={logam[n] || ''}
                              onClick={e => e.stopPropagation()}
                              onChange={e => setLogam(prev => ({ ...prev, [n]: Number(e.target.value) || 0 }))}
                            />
                          </td>
                          <td style={{ textAlign: 'right' }}>{fmt(n * (Number(logam[n]) || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '12px' }}>
                Note : Klik pada baris pecahan uang untuk mengisi quantity.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Penutupan;
