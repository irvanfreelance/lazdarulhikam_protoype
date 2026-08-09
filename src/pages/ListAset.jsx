import React, { useMemo, useRef, useState } from 'react';
import {
  Search, Trash2, Edit2, Plus, Download, Upload, FileSpreadsheet, FileText, File, Settings2, X
} from 'lucide-react';
import {
  INITIAL_COA, OFFICES, getFixedAssets, saveFixedAssets, generateKodeAset,
  ASSET_DEPRECIATION_METHODS, ASET_TETAP_COA
} from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const PAGE_SIZES = [10, 25, 50];

const formatNum = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

// Advances `date` by `months` calendar months, clamping the day to the last
// valid day of the target month instead of letting it roll into the next
// month (JS's native Date behavior for e.g. Jan 31 + 1 month).
const addMonthsClamped = (date, months) => {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
};

// Simulates the monthly depreciation journal: walks each month of the
// asset's useful life and, for every period whose completion date has
// already passed, books the monthly amount into that completion month.
// Assets missing method/COA config (masaManfaatBulan set but nothing else)
// simply never accrue — mirrors "belum dikonfigurasi" assets in the source data.
const buildSchedule = (asset, today) => {
  const result = { bulanan: 0, elapsed: 0, totalSusut: 0, byYear: {} };
  const configured = !asset.nonDepresiasi && asset.metode && asset.masaManfaatBulan
    && asset.akunPenyusutan && asset.akunAkumulasiPenyusutan && asset.biayaPerolehan;
  if (!configured) return result;

  const start = new Date(`${asset.bulanAwalSusut || asset.tanggalPerolehan}T00:00:00`);
  const bulanan = asset.biayaPerolehan / asset.masaManfaatBulan;
  result.bulanan = bulanan;

  for (let k = 1; k <= asset.masaManfaatBulan; k++) {
    const completion = addMonthsClamped(start, k);
    if (completion > today) break;
    result.elapsed = k;
    result.totalSusut += bulanan;
    const y = completion.getFullYear();
    const m = completion.getMonth();
    if (!result.byYear[y]) result.byYear[y] = Array(12).fill(0);
    result.byYear[y][m] += bulanan;
  }
  return result;
};

const akhirSusutDisplay = (asset) => {
  if (asset.nonDepresiasi) return '-';
  if (asset.tglAkhirSusut) return asset.tglAkhirSusut;
  if (!asset.masaManfaatBulan) return '-';
  const start = new Date(`${asset.bulanAwalSusut || asset.tanggalPerolehan}T00:00:00`);
  return addMonthsClamped(start, asset.masaManfaatBulan).toISOString().substring(0, 10);
};

const emptyForm = {
  namaAset: '', akunAsetTetap: ASET_TETAP_COA, deskripsi: '',
  tanggalPerolehan: new Date().toISOString().substring(0, 10),
  biayaPerolehan: '', officeId: '1', nonDepresiasi: false, metode: '', masaManfaatBulan: '',
  tglAkhirSusut: '', nilaiPerBulanPersen: '', akunPenyusutan: '', akunAkumulasiPenyusutan: '', bulanAwalSusut: ''
};

const ListAset = () => {
  const today = useMemo(() => new Date(), []);
  const [assets, setAssets] = useState(() => getFixedAssets());

  const [tahun, setTahun] = useState(String(today.getFullYear()));
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [showMonthly, setShowMonthly] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);
  const importInputRef = useRef(null);

  const coaByCode = useMemo(() => {
    const map = {};
    INITIAL_COA.forEach(c => { map[c.coa] = c; });
    return map;
  }, []);
  const officeById = useMemo(() => {
    const map = {};
    OFFICES.forEach(o => { map[o.id] = o.nama; });
    return map;
  }, []);

  const assetCoaOptions = useMemo(() => INITIAL_COA
    .filter(c => c.coa.startsWith('102.') && c.includeBuku && !c.nama.toLowerCase().includes('akumulasi'))
    .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);
  const bebanCoaOptions = useMemo(() => INITIAL_COA
    .filter(c => c.group === 'Beban' && c.includeBuku)
    .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);
  const akumulasiCoaOptions = useMemo(() => INITIAL_COA
    .filter(c => c.includeBuku && c.nama.toLowerCase().includes('akumulasi'))
    .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);
  const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));

  const years = useMemo(() => {
    const set = new Set([today.getFullYear()]);
    assets.forEach(a => {
      set.add(new Date(`${a.tanggalPerolehan}T00:00:00`).getFullYear());
      const akhir = akhirSusutDisplay(a);
      if (akhir !== '-') set.add(new Date(`${akhir}T00:00:00`).getFullYear());
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [assets, today]);

  const rows = useMemo(() => assets.map(a => {
    const sched = buildSchedule(a, today);
    const monthly = sched.byYear[Number(tahun)] || Array(12).fill(0);
    const susutTahunan = monthly.reduce((s, v) => s + v, 0);
    const bukuAkhir = (a.biayaPerolehan || 0) - sched.totalSusut;
    return {
      asset: a,
      umur: `${sched.elapsed}/${a.masaManfaatBulan || 0}`,
      akhirSusut: akhirSusutDisplay(a),
      bulanan: sched.bulanan,
      susutTahunan,
      susutTotal: sched.totalSusut,
      bukuAkhir,
      monthly
    };
  }), [assets, tahun, today]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return rows;
    return rows.filter(r =>
      r.asset.namaAset.toLowerCase().includes(k) ||
      (r.asset.kodeAset || '').toLowerCase().includes(k) ||
      (r.asset.deskripsi || '').toLowerCase().includes(k)
    );
  }, [rows, keyword]);

  const totals = useMemo(() => filtered.reduce((acc, r) => {
    acc.perolehan += r.asset.biayaPerolehan || 0;
    acc.bulanan += r.bulanan;
    acc.tahunan += r.susutTahunan;
    acc.total += r.susutTotal;
    acc.bukuAkhir += r.bukuAkhir;
    r.monthly.forEach((v, i) => { acc.monthly[i] += v; });
    return acc;
  }, { perolehan: 0, bulanan: 0, tahunan: 0, total: 0, bukuAkhir: 0, monthly: Array(12).fill(0) }), [filtered]);

  const stats = useMemo(() => ({
    totalAset: rows.length,
    totalPerolehan: rows.reduce((s, r) => s + (r.asset.biayaPerolehan || 0), 0),
    totalBukuAkhir: rows.reduce((s, r) => s + r.bukuAkhir, 0),
    belumDikonfigurasi: rows.filter(r => !r.asset.nonDepresiasi && !r.asset.metode).length
  }), [rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const openAdd = () => { setEditing(null); setFormFields(emptyForm); setModalOpen(true); };

  const openEdit = (asset) => {
    setEditing(asset);
    setFormFields({
      namaAset: asset.namaAset,
      akunAsetTetap: asset.akunAsetTetap,
      deskripsi: asset.deskripsi || '',
      tanggalPerolehan: asset.tanggalPerolehan,
      biayaPerolehan: String(asset.biayaPerolehan || ''),
      officeId: asset.officeId || '1',
      nonDepresiasi: asset.nonDepresiasi,
      metode: asset.metode || '',
      masaManfaatBulan: asset.masaManfaatBulan ? String(asset.masaManfaatBulan) : '',
      tglAkhirSusut: asset.tglAkhirSusut || '',
      nilaiPerBulanPersen: asset.nilaiPerBulanPersen ? String(asset.nilaiPerBulanPersen) : '',
      akunPenyusutan: asset.akunPenyusutan || '',
      akunAkumulasiPenyusutan: asset.akunAkumulasiPenyusutan || '',
      bulanAwalSusut: asset.bulanAwalSusut || asset.tanggalPerolehan
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus aset ini dari daftar? Riwayat penyusutan yang sudah dihitung juga akan hilang.')) return;
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    saveFixedAssets(updated);
  };

  const canSave = formFields.namaAset.trim() !== '' && formFields.akunAsetTetap !== ''
    && formFields.biayaPerolehan !== '' && formFields.officeId !== '' && formFields.tanggalPerolehan !== ''
    && (formFields.nonDepresiasi || (
      formFields.metode !== '' && formFields.masaManfaatBulan !== ''
      && formFields.akunPenyusutan !== '' && formFields.akunAkumulasiPenyusutan !== ''
    ));

  const buildAssetPayload = (base) => ({
    ...base,
    namaAset: formFields.namaAset,
    akunAsetTetap: formFields.akunAsetTetap,
    deskripsi: formFields.deskripsi,
    tanggalPerolehan: formFields.tanggalPerolehan,
    biayaPerolehan: parseFloat(formFields.biayaPerolehan) || 0,
    officeId: formFields.officeId,
    nonDepresiasi: formFields.nonDepresiasi,
    metode: formFields.nonDepresiasi ? '' : formFields.metode,
    masaManfaatBulan: formFields.nonDepresiasi ? null : (parseInt(formFields.masaManfaatBulan, 10) || null),
    tglAkhirSusut: formFields.nonDepresiasi ? null : (formFields.tglAkhirSusut || null),
    nilaiPerBulanPersen: formFields.nonDepresiasi ? null : (parseFloat(formFields.nilaiPerBulanPersen) || null),
    akunPenyusutan: formFields.nonDepresiasi ? null : (formFields.akunPenyusutan || null),
    akunAkumulasiPenyusutan: formFields.nonDepresiasi ? null : (formFields.akunAkumulasiPenyusutan || null),
    bulanAwalSusut: formFields.nonDepresiasi ? null : (formFields.bulanAwalSusut || formFields.tanggalPerolehan)
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (!canSave) return;

    if (editing) {
      const updated = assets.map(a => a.id === editing.id
        ? buildAssetPayload({ id: a.id, kodeAset: a.kodeAset || generateKodeAset(formFields.tanggalPerolehan, assets) })
        : a);
      setAssets(updated);
      saveFixedAssets(updated);
    } else {
      const newAsset = buildAssetPayload({
        id: String(Date.now()),
        kodeAset: generateKodeAset(formFields.tanggalPerolehan, assets)
      });
      const updated = [...assets, newAsset];
      setAssets(updated);
      saveFixedAssets(updated);
    }
    setModalOpen(false);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    alert(`File "${file.name}" berhasil diimpor (simulasi). Data aset tidak berubah pada mode demo ini.`);
    e.target.value = '';
  };

  const infoColSpan = 8;
  const summaryColSpan = 6;
  const trailColSpan = 6;
  const totalColSpan = infoColSpan + summaryColSpan + (showMonthly ? 12 : 0) + trailColSpan;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ marginBottom: 0 }}>Aset</h1>
          <button
            type="button"
            title={showMonthly ? 'Sembunyikan kolom bulanan' : 'Tampilkan kolom bulanan'}
            onClick={() => setShowMonthly(s => !s)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: showMonthly ? 'var(--primary-color)' : '#94a3b8', display: 'flex' }}
          >
            <Settings2 size={18} />
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">Total Aset Tercatat</div></div>
          <div className="stat-value">{stats.totalAset} Aset</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">Total Nilai Perolehan</div></div>
          <div className="stat-value">{formatNum(stats.totalPerolehan)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">Total Nilai Buku (Akhir)</div></div>
          <div className="stat-value">{formatNum(stats.totalBukuAkhir)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header"><div className="stat-title">Belum Dikonfigurasi Penyusutan</div></div>
          <div className="stat-value" style={{ color: stats.belumDikonfigurasi ? '#f59e0b' : undefined }}>{stats.belumDikonfigurasi} Aset</div>
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Tahun</span>
          <SearchableSelect
            className="form-select"
            options={years.map(y => ({ value: String(y), label: String(y) }))}
            value={tahun}
            onChange={v => setTahun(v)}
          />
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
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      <div className="filters-row" style={{ marginTop: '-12px' }}>
        <div className="filters-left">
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setExportOpen(o => !o)}>
              <Download size={16} /> Export
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => { setExportOpen(false); alert('Daftar aset berhasil diekspor ke Excel (simulasi).'); }}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={() => { setExportOpen(false); alert('Daftar aset berhasil diekspor ke CSV (simulasi).'); }}><FileText size={14} /> CSV</button>
                <button onClick={() => { setExportOpen(false); alert('Daftar aset berhasil diekspor ke PDF (simulasi).'); }}><File size={14} /> PDF</button>
              </div>
            )}
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => importInputRef.current.click()}>
            <Upload size={16} /> Import
          </button>
          <input type="file" ref={importInputRef} accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImportFile} />
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} /> Entry Aset
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ padding: '16px 24px 4px', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Daftar Aset
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: showMonthly ? '2700px' : '1600px' }}>
            <thead>
              <tr>
                <th>Action</th>
                <th>Umur</th>
                <th>Kode Aset</th>
                <th>Nama Akun</th>
                <th>Nama Aset</th>
                <th>Keterangan</th>
                <th>Tgl Perolehan</th>
                <th>Akhir Susut</th>
                <th style={{ textAlign: 'right' }}>Nilai Perolehan</th>
                <th style={{ textAlign: 'right' }}>Nilai Susut (Bulanan)</th>
                <th style={{ textAlign: 'right' }}>Nilai Susut (Tahunan)</th>
                <th style={{ textAlign: 'right' }}>Nilai Susut (Total)</th>
                <th style={{ textAlign: 'right' }}>Nilai Buku (Tahunan)</th>
                <th style={{ textAlign: 'right' }}>Nilai Buku (Akhir)</th>
                {showMonthly && MONTHS.map(m => <th key={m} style={{ textAlign: 'right' }}>{m}</th>)}
                <th>Kantor</th>
                <th>COA Debet</th>
                <th>COA Kredit</th>
                <th>COA Debet (Adj)</th>
                <th>COA Kredit (Adj)</th>
                <th>Metode</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 && (
                <tr><td colSpan={totalColSpan} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada aset yang cocok. Tambahkan lewat tombol Entry Aset.</td></tr>
              )}
              {paged.map(r => {
                const a = r.asset;
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="action-buttons">
                        <Edit2 size={16} title="Ubah" onClick={() => openEdit(a)} />
                        <Trash2 size={16} color="#ef4444" title="Hapus" onClick={() => handleDelete(a.id)} />
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {a.nonDepresiasi ? <span className="status-badge status-info">NON-SUSUT</span> : r.umur}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.kodeAset}</td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{coaByCode[a.akunAsetTetap]?.nama || a.akunAsetTetap}</td>
                    <td style={{ fontWeight: 500, minWidth: '180px' }}>{a.namaAset}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '220px' }}>{a.deskripsi || '-'}</td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{a.tanggalPerolehan}</td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{r.akhirSusut}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(a.biayaPerolehan)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', background: r.bulanan ? '#fef9c3' : 'transparent' }}>{formatNum(r.bulanan)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', background: r.susutTahunan ? '#fef9c3' : 'transparent' }}>{formatNum(r.susutTahunan)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap', background: r.susutTotal ? '#fef9c3' : 'transparent' }}>{formatNum(r.susutTotal)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(r.bukuAkhir)}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(r.bukuAkhir)}</td>
                    {showMonthly && r.monthly.map((v, i) => (
                      <td key={i} style={{ textAlign: 'right', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{formatNum(v)}</td>
                    ))}
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{officeById[a.officeId] || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.akunPenyusutan || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.akunAkumulasiPenyusutan || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.akunPenyusutan || '-'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{a.akunAkumulasiPenyusutan || '-'}</td>
                    <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{a.metode || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
            {paged.length > 0 && (
              <tfoot>
                <tr style={{ fontWeight: 700, background: '#f8fafc' }}>
                  <td colSpan={infoColSpan} style={{ textAlign: 'right', color: '#64748b' }}>TOTAL (data terfilter)</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(totals.perolehan)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(totals.bulanan)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(totals.tahunan)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(totals.total)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(totals.bukuAkhir)}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatNum(totals.bukuAkhir)}</td>
                  {showMonthly && totals.monthly.map((v, i) => (
                    <td key={i} style={{ textAlign: 'right', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{formatNum(v)}</td>
                  ))}
                  <td colSpan={trailColSpan}></td>
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
            <span className="pagination-info">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>{editing ? 'Ubah Aset' : 'Entry Aset'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nama Aset</label>
                    <input
                      type="text" className="form-input" required placeholder="cth. Kursi Kantor Sandaran Ergonomis"
                      value={formFields.namaAset} onChange={e => setFormFields(prev => ({ ...prev, namaAset: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Akun Aset Tetap</label>
                    <SearchableSelect
                      className="form-select" options={assetCoaOptions}
                      value={formFields.akunAsetTetap} onChange={v => setFormFields(prev => ({ ...prev, akunAsetTetap: v }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kantor</label>
                    <SearchableSelect
                      className="form-select" options={officeOptions}
                      value={formFields.officeId} onChange={v => setFormFields(prev => ({ ...prev, officeId: v }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Perolehan</label>
                    <input
                      type="date" className="form-input" required
                      value={formFields.tanggalPerolehan}
                      onChange={e => setFormFields(prev => ({ ...prev, tanggalPerolehan: e.target.value, bulanAwalSusut: prev.bulanAwalSusut || e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nilai Perolehan (Rp)</label>
                    <input
                      type="number" min="0" className="form-input" required placeholder="0"
                      value={formFields.biayaPerolehan} onChange={e => setFormFields(prev => ({ ...prev, biayaPerolehan: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Keterangan</label>
                    <textarea
                      className="form-textarea" placeholder="Deskripsi singkat aset (opsional)"
                      value={formFields.deskripsi} onChange={e => setFormFields(prev => ({ ...prev, deskripsi: e.target.value }))}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      <input
                        type="checkbox" checked={formFields.nonDepresiasi}
                        onChange={e => setFormFields(prev => ({ ...prev, nonDepresiasi: e.target.checked }))}
                      />
                      Aset non-depresiasi (tidak disusutkan)
                    </label>
                  </div>

                  {!formFields.nonDepresiasi && (
                    <>
                      <div className="form-group full-width" style={{ marginBottom: 0 }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Metode, Masa Manfaat, dan kedua akun COA di bawah ini wajib diisi lengkap agar aset otomatis masuk jadwal penyusutan bulanan.
                        </p>
                      </div>
                      <div className="form-group">
                        <label>Metode Penyusutan</label>
                        <SearchableSelect
                          className="form-select" options={ASSET_DEPRECIATION_METHODS.map(m => ({ value: m, label: m }))}
                          value={formFields.metode} onChange={v => setFormFields(prev => ({ ...prev, metode: v }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Masa Manfaat (Bulan)</label>
                        <input
                          type="number" min="1" className="form-input" placeholder="cth. 48"
                          value={formFields.masaManfaatBulan} onChange={e => setFormFields(prev => ({ ...prev, masaManfaatBulan: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bulan Awal Susut</label>
                        <input
                          type="date" className="form-input"
                          value={formFields.bulanAwalSusut} onChange={e => setFormFields(prev => ({ ...prev, bulanAwalSusut: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tgl Akhir Susut (opsional)</label>
                        <input
                          type="date" className="form-input"
                          value={formFields.tglAkhirSusut} onChange={e => setFormFields(prev => ({ ...prev, tglAkhirSusut: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>COA Debet (Beban Penyusutan)</label>
                        <SearchableSelect
                          className="form-select" options={bebanCoaOptions}
                          value={formFields.akunPenyusutan} onChange={v => setFormFields(prev => ({ ...prev, akunPenyusutan: v }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>COA Kredit (Akumulasi Penyusutan)</label>
                        <SearchableSelect
                          className="form-select" options={akumulasiCoaOptions}
                          value={formFields.akunAkumulasiPenyusutan} onChange={v => setFormFields(prev => ({ ...prev, akunAkumulasiPenyusutan: v }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {editing && (
                  <button
                    type="button" className="btn btn-danger" style={{ marginRight: 'auto' }}
                    onClick={() => { setModalOpen(false); handleDelete(editing.id); }}
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

export default ListAset;
