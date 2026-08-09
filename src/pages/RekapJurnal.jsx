import React, { useState, useMemo, useRef } from 'react';
import {
  Plus, Upload, Download, FileSpreadsheet, FileText, File, Search, X, Trash2, FileEdit
} from 'lucide-react';
import { OFFICES } from '../utils/finsCoaStore';
import { CURRENT_USER } from '../utils/penerimaanStore';
import { INITIAL_JURNAL, JURNAL_COA_OPTIONS, generateJurnalIds } from '../utils/jurnalStore';
import SearchableSelect from '../components/SearchableSelect';

const PAGE_SIZES = [10, 25, 50];
const JENIS_LABEL = { penerimaan: 'Penerimaan', pengeluaran: 'Pengeluaran', pengajuan_ca: 'Pengajuan CA', penyesuaian: 'Penyesuaian' };
const GROUP_BY_OPTIONS = [
  { value: 'idJurnalPerhari', label: 'ID Jurnal Perhari' },
  { value: 'tanggal', label: 'Tanggal' },
  { value: 'coa', label: 'COA' },
  { value: 'none', label: 'Tanpa Grup' },
];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const emptyHeader = () => ({ tanggal: new Date().toISOString().slice(0, 10), officeId: '1' });
const emptyDraftLine = () => ({ jenis: 'Debet', jenisTransaksi: '', keterangan: '', nominal: '' });

const RekapJurnal = () => {
  const [records, setRecords] = useState(INITIAL_JURNAL);
  const [view, setView] = useState('list');
  const [editingGroupId, setEditingGroupId] = useState(null);

  const [periodeFrom, setPeriodeFrom] = useState('2026-07-27');
  const [periodeTo, setPeriodeTo] = useState(new Date().toISOString().slice(0, 10));
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [groupBy, setGroupBy] = useState('idJurnalPerhari');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [viaImportFilter, setViaImportFilter] = useState('all');
  const [viaJurnalFilter, setViaJurnalFilter] = useState('all');
  const [kantorFilter, setKantorFilter] = useState('all');
  const [jenisTransaksiFilter, setJenisTransaksiFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [tambahOpen, setTambahOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const fileInputRef = useRef(null);

  const [header, setHeader] = useState(emptyHeader());
  const [draftLine, setDraftLine] = useState(emptyDraftLine());
  const [detailLines, setDetailLines] = useState([]);

  const officeOptions = useMemo(() => OFFICES.map(o => ({ value: o.id, label: o.nama })), []);
  const coaJenisOptions = useMemo(() => JURNAL_COA_OPTIONS.map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return records.filter(r => {
      const matchesPeriode = (!periodeFrom || r.tanggal >= periodeFrom) && (!periodeTo || r.tanggal <= periodeTo);
      const matchesKeyword = !k || r.idBuku.toLowerCase().includes(k) || r.coa.toLowerCase().includes(k) ||
        r.namaAkun.toLowerCase().includes(k) || r.keterangan.toLowerCase().includes(k) || r.idJurnal.toLowerCase().includes(k);
      const matchesJenis = jenisFilter === 'all' || r.sourceType === jenisFilter;
      const matchesViaImport = viaImportFilter === 'all' || String(r.viaImport) === viaImportFilter;
      const matchesViaJurnal = viaJurnalFilter === 'all' || r.viaJurnal === viaJurnalFilter;
      const matchesKantor = kantorFilter === 'all' || r.officeId === kantorFilter;
      const matchesJenisTransaksi = jenisTransaksiFilter === 'all' || r.coa === jenisTransaksiFilter;
      return matchesPeriode && matchesKeyword && matchesJenis && matchesViaImport && matchesViaJurnal && matchesKantor && matchesJenisTransaksi;
    });
  }, [records, periodeFrom, periodeTo, keyword, jenisFilter, viaImportFilter, viaJurnalFilter, kantorFilter, jenisTransaksiFilter]);

  const totalDebet = filtered.reduce((s, r) => s + r.debet, 0);
  const totalKredit = filtered.reduce((s, r) => s + r.kredit, 0);

  const sorted = useMemo(() => [...filtered].sort((a, b) => a.tanggal === b.tanggal ? a.idJurnal.localeCompare(b.idJurnal) : a.tanggal.localeCompare(b.tanggal)), [filtered]);

  const groupKeyOf = (r) => {
    if (groupBy === 'tanggal') return r.tanggal;
    if (groupBy === 'coa') return `${r.coa} — ${r.namaAkun}`;
    if (groupBy === 'idJurnalPerhari') return `${r.tanggal} — ${r.idBuku}`;
    return null;
  };

  const groups = useMemo(() => {
    if (groupBy === 'none') return [[null, sorted]];
    const map = new Map();
    sorted.forEach(r => {
      const key = groupKeyOf(r);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(r);
    });
    return Array.from(map.entries());
  }, [sorted, groupBy]);

  const flatWithGroups = useMemo(() => {
    const out = [];
    groups.forEach(([key, rows]) => {
      if (key) out.push({ isHeader: true, key, rows });
      rows.forEach(r => out.push({ isHeader: false, row: r }));
    });
    return out;
  }, [groups]);

  const totalPages = Math.max(1, Math.ceil(flatWithGroups.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = flatWithGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const openAddPenyesuaian = () => {
    setEditingGroupId(null);
    setHeader(emptyHeader());
    setDetailLines([]);
    setDraftLine(emptyDraftLine());
    setView('form');
  };

  const openEditPenyesuaian = (jurnalGroupId) => {
    const lines = records.filter(r => r.jurnalGroupId === jurnalGroupId);
    if (lines.length === 0 || lines[0].sourceType !== 'penyesuaian') return;
    setEditingGroupId(jurnalGroupId);
    setHeader({ tanggal: lines[0].tanggal, officeId: lines[0].officeId });
    setDetailLines(lines.map(l => ({ key: l.id, coa: l.coa, namaAkun: l.namaAkun, debet: l.debet, kredit: l.kredit, keterangan: l.keterangan })));
    setDraftLine(emptyDraftLine());
    setView('form');
  };

  const addDetailLine = () => {
    if (!draftLine.jenisTransaksi || !draftLine.nominal) {
      alert('Pilih Jenis Transaksi dan isi Nominal terlebih dahulu.');
      return;
    }
    const jt = JURNAL_COA_OPTIONS.find(c => c.coa === draftLine.jenisTransaksi);
    const nominal = Number(draftLine.nominal);
    setDetailLines(prev => [...prev, {
      key: `draft-${Date.now()}-${Math.random()}`,
      coa: jt?.coa || '',
      namaAkun: jt?.nama || '',
      debet: draftLine.jenis === 'Debet' ? nominal : 0,
      kredit: draftLine.jenis === 'Kredit' ? nominal : 0,
      keterangan: draftLine.keterangan,
    }]);
    setDraftLine(emptyDraftLine());
  };
  const removeDetailLine = (key) => setDetailLines(prev => prev.filter(l => l.key !== key));

  const lineTotalDebet = detailLines.reduce((s, l) => s + l.debet, 0);
  const lineTotalKredit = detailLines.reduce((s, l) => s + l.kredit, 0);
  const isBalanced = detailLines.length > 0 && lineTotalDebet === lineTotalKredit;

  const handleSave = () => {
    if (detailLines.length === 0) { alert('Tambahkan minimal satu baris Detail Jurnal Penyesuaian.'); return; }
    if (!isBalanced) { alert(`Jurnal belum balance. Debet ${fmt(lineTotalDebet)} ≠ Kredit ${fmt(lineTotalKredit)}.`); return; }

    const officeName = OFFICES.find(o => o.id === header.officeId)?.nama || '';
    if (editingGroupId) {
      setRecords(prev => [
        ...prev.filter(r => r.jurnalGroupId !== editingGroupId),
        ...detailLines.map((l, idx) => ({
          id: `${editingGroupId}-${idx}`,
          idBuku: editingGroupId,
          jurnalGroupId: editingGroupId,
          idJurnal: `${editingGroupId}-J${idx}`,
          tanggal: header.tanggal,
          coa: l.coa,
          namaAkun: l.namaAkun,
          jenisTransaksi: 'Jurnal Penyesuaian',
          debet: l.debet,
          kredit: l.kredit,
          keterangan: l.keterangan,
          viaJurnal: 'Manual',
          viaImport: false,
          userInput: CURRENT_USER.nama,
          officeId: header.officeId,
          program: '',
          note: officeName,
          sourceType: 'penyesuaian',
        })),
      ]);
    } else {
      const { idBuku, idJurnalOf } = generateJurnalIds('J');
      setRecords(prev => [
        ...prev,
        ...detailLines.map((l, idx) => ({
          id: `${idBuku}-${idx}`,
          idBuku,
          jurnalGroupId: idBuku,
          idJurnal: idJurnalOf(idx),
          tanggal: header.tanggal,
          coa: l.coa,
          namaAkun: l.namaAkun,
          jenisTransaksi: 'Jurnal Penyesuaian',
          debet: l.debet,
          kredit: l.kredit,
          keterangan: l.keterangan,
          viaJurnal: 'Manual',
          viaImport: false,
          userInput: CURRENT_USER.nama,
          officeId: header.officeId,
          program: '',
          note: officeName,
          sourceType: 'penyesuaian',
        })),
      ]);
    }
    setView('list');
  };
  const handleCancel = () => setView('list');

  const handleDeleteGroup = (jurnalGroupId) => {
    const lines = records.filter(r => r.jurnalGroupId === jurnalGroupId);
    if (lines.length === 0 || lines[0].sourceType !== 'penyesuaian') return;
    if (!window.confirm(`Hapus jurnal penyesuaian ini? (${lines.length} baris akan dihapus)`)) return;
    setRecords(prev => prev.filter(r => r.jurnalGroupId !== jurnalGroupId));
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMessage(`File '${file.name}' siap diimpor sebagai Jurnal (simulasi).`);
    setTimeout(() => setImportMessage(''), 4000);
    e.target.value = '';
  };

  const handleTambahOption = (option) => {
    setTambahOpen(false);
    if (option === 'penyesuaian') { openAddPenyesuaian(); return; }
    const labels = { pengajuan_ca: 'Pengajuan CA', penerimaan: 'Penerimaan', pengeluaran: 'Pengeluaran' };
    alert(`Silakan gunakan menu FINS > Home > ${labels[option]} untuk mencatat transaksi ini.`);
  };

  if (view === 'form') {
    return (
      <div className="content-area">
        <div className="page-header">
          <div className="page-title">
            <h1>Rekap Jurnal</h1>
            <p>{editingGroupId ? `Ubah Jurnal Penyesuaian ${editingGroupId}` : 'Tambah Jurnal Penyesuaian baru'}</p>
          </div>
        </div>

        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', background: 'var(--bg-card)' }}>
          <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700 }}>
            Jurnal Penyesuaian
          </div>
          <div style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Jurnal Penyesuaian</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Tanggal</label>
                <input type="date" className="form-input" value={header.tanggal} onChange={e => setHeader(prev => ({ ...prev, tanggal: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Kantor</label>
                <SearchableSelect options={officeOptions} value={header.officeId} onChange={val => setHeader(prev => ({ ...prev, officeId: val }))} />
              </div>
              <div className="form-group">
                <label>NIK Input</label>
                <input type="text" className="form-input" disabled value={CURRENT_USER.id} />
              </div>
              <div className="form-group">
                <label>User Input</label>
                <input type="text" className="form-input" disabled value={CURRENT_USER.nama} />
              </div>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '28px 0 16px', fontFamily: 'var(--font-heading)' }}>Detail Jurnal Penyesuaian</h3>
            <div className="form-grid" style={{ alignItems: 'end' }}>
              <div className="form-group">
                <label>Jenis</label>
                <select className="form-select" value={draftLine.jenis} onChange={e => setDraftLine(prev => ({ ...prev, jenis: e.target.value }))}>
                  <option value="Debet">Debet</option>
                  <option value="Kredit">Kredit</option>
                </select>
              </div>
              <div className="form-group">
                <label>Jenis Transaksi</label>
                <SearchableSelect options={coaJenisOptions} value={draftLine.jenisTransaksi} onChange={val => setDraftLine(prev => ({ ...prev, jenisTransaksi: val }))} placeholder="Jenis Transaksi" />
              </div>
              <div className="form-group">
                <label>Keterangan</label>
                <input type="text" className="form-input" placeholder="Keterangan" value={draftLine.keterangan} onChange={e => setDraftLine(prev => ({ ...prev, keterangan: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Nominal</label>
                <input type="number" className="form-input" placeholder="Nominal" value={draftLine.nominal} onChange={e => setDraftLine(prev => ({ ...prev, nominal: e.target.value }))} />
              </div>
              <div className="form-group">
                <button type="button" className="btn btn-primary" onClick={addDetailLine}><Plus size={16} /> Tambah</button>
              </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>COA</th>
                    <th>Nama Akun</th>
                    <th style={{ textAlign: 'right' }}>Debet</th>
                    <th style={{ textAlign: 'right' }}>Kredit</th>
                    <th>Keterangan</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {detailLines.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada baris detail</td></tr>
                  )}
                  {detailLines.map(l => (
                    <tr key={l.key}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{l.coa}</td>
                      <td>{l.namaAkun}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(l.debet)}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(l.kredit)}</td>
                      <td>{l.keterangan || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeDetailLine(l.key)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {detailLines.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={2} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isBalanced ? '#16a34a' : '#dc2626' }}>{fmt(lineTotalDebet)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isBalanced ? '#16a34a' : '#dc2626' }}>{fmt(lineTotalKredit)}</td>
                      <td colSpan={2} style={{ fontWeight: 700, color: isBalanced ? '#16a34a' : '#dc2626' }}>{isBalanced ? 'Balance' : 'Belum Balance'}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleCancel}><X size={16} /> Cancel</button>
              <button type="button" className="btn btn-primary" disabled={!isBalanced} onClick={handleSave}>Save</button>
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
          <h1>Rekap Jurnal</h1>
          <p>Jurnal umum seluruh transaksi (otomatis & manual) beserta jurnal penyesuaian</p>
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
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Group By:</span>
          <select className="form-select" style={{ width: 'auto' }} value={groupBy} onChange={e => { setGroupBy(e.target.value); setPage(1); }}>
            {GROUP_BY_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Jenis:</span>
          <select className="form-select" style={{ width: 'auto' }} value={jenisFilter} onChange={e => { setJenisFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            {Object.entries(JENIS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <div className="export-menu-wrap">
            <button className="btn btn-primary" onClick={() => setTambahOpen(o => !o)}><Plus size={16} /> Tambah</button>
            {tambahOpen && (
              <div className="export-menu">
                <button onClick={() => handleTambahOption('penyesuaian')}><FileEdit size={14} /> Jurnal Penyesuaian</button>
                <button onClick={() => handleTambahOption('pengajuan_ca')}><FileEdit size={14} /> Pengajuan CA</button>
                <button onClick={() => handleTambahOption('penerimaan')}><FileEdit size={14} /> Penerimaan</button>
                <button onClick={() => handleTambahOption('pengeluaran')}><FileEdit size={14} /> Pengeluaran</button>
              </div>
            )}
          </div>
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
          <select className="form-select" style={{ width: 'auto' }} value={kantorFilter} onChange={e => { setKantorFilter(e.target.value); setPage(1); }}>
            <option value="all">Semua Kantor</option>
            {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={jenisTransaksiFilter} onChange={e => { setJenisTransaksiFilter(e.target.value); setPage(1); }}>
            <option value="all">Jenis Transaksi: Semua</option>
            {JURNAL_COA_OPTIONS.map(c => <option key={c.coa} value={c.coa}>{c.coa} — {c.nama}</option>)}
          </select>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Via Import:</span>
          <select className="form-select" style={{ width: 'auto' }} value={viaImportFilter} onChange={e => { setViaImportFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="true">Ya</option>
            <option value="false">Tidak</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Via Jurnal:</span>
          <select className="form-select" style={{ width: 'auto' }} value={viaJurnalFilter} onChange={e => { setViaJurnalFilter(e.target.value); setPage(1); }}>
            <option value="all">All</option>
            <option value="Otomatis">Otomatis</option>
            <option value="Manual">Manual</option>
          </select>
        </div>
      </div>

      {importMessage && (
        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem' }}>
          {importMessage}
        </div>
      )}

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Jurnal</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>COA</th>
                <th>Jenis Transaksi</th>
                <th style={{ textAlign: 'right' }}>Debet</th>
                <th style={{ textAlign: 'right' }}>Kredit</th>
                <th>Keterangan</th>
                <th>Via Jurnal</th>
                <th>User Input</th>
                <th>Kantor</th>
                <th>Program</th>
                <th>ID Buku</th>
                <th>Note</th>
                <th>ID Jurnal</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={14} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {paged.map((item, idx) => item.isHeader ? (
                <tr key={`h-${item.key}-${idx}`} style={{ background: '#f8fafc' }}>
                  <td colSpan={3} style={{ fontWeight: 700 }}>{item.key}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(item.rows.reduce((s, r) => s + r.debet, 0))}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(item.rows.reduce((s, r) => s + r.kredit, 0))}</td>
                  <td colSpan={9}></td>
                </tr>
              ) : (
                <tr key={item.row.id}>
                  <td>{item.row.tanggal}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.row.coa}</td>
                  <td>
                    {item.row.jenisTransaksi}
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.row.namaAkun}</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>{fmt(item.row.debet)}</td>
                  <td style={{ textAlign: 'right' }}>{fmt(item.row.kredit)}</td>
                  <td>{item.row.keterangan}</td>
                  <td>{item.row.viaJurnal}</td>
                  <td>{item.row.userInput}</td>
                  <td>{OFFICES.find(o => o.id === item.row.officeId)?.nama}</td>
                  <td>{item.row.program || '-'}</td>
                  <td>
                    {item.row.sourceType === 'penyesuaian' ? (
                      <a href="#" onClick={e => { e.preventDefault(); openEditPenyesuaian(item.row.jurnalGroupId); }} style={{ color: 'var(--primary-color)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{item.row.idBuku}</a>
                    ) : (
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }} title="Jurnal otomatis, ubah lewat Jurnal Penyesuaian">{item.row.idBuku}</span>
                    )}
                  </td>
                  <td>{item.row.note}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{item.row.idJurnal}</td>
                  <td style={{ textAlign: 'center' }}>
                    {item.row.sourceType === 'penyesuaian' && (
                      <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} title="Hapus" onClick={() => handleDeleteGroup(item.row.jurnalGroupId)} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Σ Total :</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalDebet)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(totalKredit)}</td>
                <td colSpan={9}></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="pagination-bar">
          <div className="pagination-info">
            Menampilkan {flatWithGroups.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, flatWithGroups.length)} dari {flatWithGroups.length} baris
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

export default RekapJurnal;
