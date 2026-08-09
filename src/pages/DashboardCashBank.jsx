import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Maximize2, Minimize2, Search, Download, FileSpreadsheet, FileText, File
} from 'lucide-react';
import { INITIAL_CASH_BANK_ACCOUNTS, INITIAL_UNAPPROVED_TODAY } from '../utils/finsSettingsStore';
import { OFFICES } from '../utils/finsCoaStore';
import { formatRupiah } from '../utils/accountingStore';

const todayStr = () => new Date().toISOString().substring(0, 10);
const OVERDUE_DAYS = 30;

const daysBetween = (a, b) => Math.round((a.getTime() - b.getTime()) / 86400000);

const DashboardCashBank = () => {
  const [accounts] = useState(INITIAL_CASH_BANK_ACCOUNTS);
  const [periode, setPeriode] = useState(todayStr());
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [closingFilter, setClosingFilter] = useState('all');
  const [aktifFilter, setAktifFilter] = useState('aktif');
  const [officeFilter, setOfficeFilter] = useState('all');
  const [exportOpen, setExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const officeById = useMemo(() => {
    const map = {};
    OFFICES.forEach(o => { map[o.id] = o.nama; });
    return map;
  }, []);

  const commitSearch = () => setKeyword(keywordDraft);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPeriode(todayStr());
    setKeywordDraft('');
    setKeyword('');
    setClosingFilter('all');
    setAktifFilter('aktif');
    setOfficeFilter('all');
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return accounts.filter(a => {
      const matchesKeyword = !k ||
        a.coa.toLowerCase().includes(k) ||
        a.namaAkun.toLowerCase().includes(k) ||
        (officeById[a.officeId] || '').toLowerCase().includes(k);
      const matchesClosing = closingFilter === 'all' || (closingFilter === 'closing' ? a.closing : !a.closing);
      const matchesAktif = aktifFilter === 'all' || (aktifFilter === 'aktif' ? a.active : !a.active);
      const matchesOffice = officeFilter === 'all' || a.officeId === officeFilter;
      return matchesKeyword && matchesClosing && matchesAktif && matchesOffice;
    });
  }, [accounts, keyword, closingFilter, aktifFilter, officeFilter, officeById]);

  const rowsWithSaldo = useMemo(() => filtered.map(a => ({
    ...a,
    saldoAkhir: a.saldoAwal + a.debet - a.kredit
  })), [filtered]);

  const totals = useMemo(() => rowsWithSaldo.reduce((acc, r) => ({
    saldoAwal: acc.saldoAwal + r.saldoAwal,
    debet: acc.debet + r.debet,
    kredit: acc.kredit + r.kredit,
    saldoAkhir: acc.saldoAkhir + r.saldoAkhir
  }), { saldoAwal: 0, debet: 0, kredit: 0, saldoAkhir: 0 }), [rowsWithSaldo]);

  const totalSaldoCashBank = useMemo(() => accounts
    .filter(a => a.active)
    .reduce((sum, a) => sum + (a.saldoAwal + a.debet - a.kredit), 0), [accounts]);

  const periodeDate = useMemo(() => new Date(periode), [periode]);

  const renderLastOpname = (lastOpname) => {
    if (!lastOpname) {
      return <td style={{ background: '#ef4444' }} title="Belum pernah opname"></td>;
    }
    const overdue = daysBetween(periodeDate, new Date(lastOpname)) > OVERDUE_DAYS;
    return (
      <td style={overdue ? { background: '#ef4444', color: 'white', fontWeight: 600 } : {}}>
        {lastOpname}
      </td>
    );
  };

  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ marginBottom: 0 }}>Dashboard Cash Bank</h1>
          <button
            onClick={handleRefresh}
            title="Muat ulang data"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}
          >
            <RefreshCw size={20} className={isRefreshing ? 'icon-spin' : ''} />
          </button>
        </div>
        <button
          onClick={() => setIsFullscreen(f => !f)}
          title={isFullscreen ? 'Keluar layar penuh' : 'Perbesar layar penuh'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* UNAPPROVED TODAY */}
      <div className="data-table-container" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', padding: '16px 20px 0' }}>Unapproved Today</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Pengajuan</th>
              <th>Pencairan</th>
              <th>Pertanggung Jawaban</th>
              <th>Pengeluaran</th>
              <th>Penerimaan</th>
              <th>Penutupan</th>
              <th>Saldo Cash Bank</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontSize: '1.5rem', fontWeight: 700 }}>{INITIAL_UNAPPROVED_TODAY.pengajuan}</td>
              <td style={{ fontSize: '1.5rem', fontWeight: 700 }}>{INITIAL_UNAPPROVED_TODAY.pencairan}</td>
              <td style={{ fontSize: '1.5rem', fontWeight: 700 }}>{INITIAL_UNAPPROVED_TODAY.pertanggungjawaban}</td>
              <td style={{ fontSize: '1.5rem', fontWeight: 700 }}>{INITIAL_UNAPPROVED_TODAY.pengeluaran}</td>
              <td style={{ fontSize: '1.5rem', fontWeight: 700 }}>{INITIAL_UNAPPROVED_TODAY.penerimaan}</td>
              <td style={{ fontSize: '1.5rem', fontWeight: 700 }}>{INITIAL_UNAPPROVED_TODAY.penutupanClosed}/{INITIAL_UNAPPROVED_TODAY.penutupanTotal}</td>
              <td style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatRupiah(totalSaldoCashBank)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FILTERS */}
      <div className="filters-row">
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '8px' }}>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Periode</span>
            <input type="date" value={periode} onChange={e => setPeriode(e.target.value)} />
          </div>
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
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            <Search size={14} /> Search
          </button>
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
        <div className="filters-right">
          <select className="form-select" style={{ width: 'auto' }} value={closingFilter} onChange={e => setClosingFilter(e.target.value)}>
            <option value="all">Closing: Semua</option>
            <option value="closing">Closing</option>
            <option value="non-closing">Non Closing</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={aktifFilter} onChange={e => setAktifFilter(e.target.value)}>
            <option value="all">Status: Semua</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non Aktif</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={officeFilter} onChange={e => setOfficeFilter(e.target.value)}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
        </div>
      </div>

      {/* SALDO CASH BANK TABLE */}
      <div className="data-table-container">
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', padding: '16px 20px 0' }}>Saldo Cash Bank</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>COA</th>
              <th>Nama Akun</th>
              <th style={{ textAlign: 'right' }}>Saldo Awal</th>
              <th style={{ textAlign: 'right' }}>Debet</th>
              <th style={{ textAlign: 'right' }}>Kredit</th>
              <th style={{ textAlign: 'right' }}>Saldo Akhir</th>
              <th>Last Opname</th>
              <th>Kantor</th>
            </tr>
          </thead>
          <tbody>
            {rowsWithSaldo.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data untuk filter ini</td></tr>
            )}
            {rowsWithSaldo.map(row => (
              <tr key={row.id} style={!row.active ? { opacity: 0.5 } : undefined}>
                <td style={{ fontFamily: 'monospace' }}>{row.coa}</td>
                <td style={{ fontWeight: 500 }}>{row.namaAkun}</td>
                <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatRupiah(row.saldoAwal)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(row.debet)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(row.kredit)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(row.saldoAkhir)}</td>
                {renderLastOpname(row.lastOpname)}
                <td>{officeById[row.officeId] || '-'}</td>
              </tr>
            ))}
          </tbody>
          {rowsWithSaldo.length > 0 && (
            <tfoot>
              <tr style={{ fontWeight: 700 }}>
                <td></td>
                <td>Σ Total :</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(totals.saldoAwal)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(totals.debet)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(totals.kredit)}</td>
                <td style={{ textAlign: 'right' }}>{formatRupiah(totals.saldoAkhir)}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default DashboardCashBank;
