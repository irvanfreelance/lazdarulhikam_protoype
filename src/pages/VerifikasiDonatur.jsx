import React, { useState, useMemo } from 'react';
import { RefreshCw, ExternalLink, Search, GitMerge, ArrowUpDown } from 'lucide-react';
import { INITIAL_DONATUR } from '../utils/donaturStore';

const MATCH_FIELDS = [
  { value: 'nama', label: 'Nama Donatur' },
  { value: 'hp', label: 'Hp' },
  { value: 'telpon', label: 'Telpon' },
  { value: 'email', label: 'Email' },
  { value: 'alamat', label: 'Alamat' },
];
const EXCLUDED_VALUES = ['', '-', '0', '.'];
const PAGE_SIZE = 10;
const BAR_HUE = 'var(--primary-color)';

const normalize = (val) => (val || '').toString().trim().toLowerCase();
const isExcluded = (val) => EXCLUDED_VALUES.includes(normalize(val));

// Jumlah transaksi semu (deterministik dari ID) — hanya untuk tampilan demo,
// belum terhubung ke data transaksi CRM yang sesungguhnya.
const pseudoTransCount = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 7;
  return hash;
};
const jenisDonaturOf = (nama) => (nama.trim().toUpperCase().startsWith('PT ') ? 'Perusahaan' : 'Perorangan');
const isAktif = (id) => Number(id.slice(-1)) % 5 !== 0;

const VerifikasiDonatur = () => {
  const [donors, setDonors] = useState(INITIAL_DONATUR);
  const [verifiedIds, setVerifiedIds] = useState(() => new Set());
  const [matchField, setMatchField] = useState('nama');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [aktifFilter, setAktifFilter] = useState('aktif');
  const [jenisFilter, setJenisFilter] = useState('all');
  const [kantorFilter, setKantorFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('unverified');
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [hoveredBar, setHoveredBar] = useState(null);

  const kantorOptions = useMemo(() => [...new Set(donors.map(d => d.kantor))], [donors]);

  const duplicateGroups = useMemo(() => {
    const map = new Map();
    donors.forEach(d => {
      const val = normalize(d[matchField]);
      if (isExcluded(val)) return;
      if (!map.has(val)) map.set(val, []);
      map.get(val).push(d);
    });
    return Array.from(map.values()).filter(g => g.length > 1);
  }, [donors, matchField]);

  const duplicateIds = useMemo(() => new Set(duplicateGroups.flat().map(d => d.id)), [duplicateGroups]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return donors.filter(d => {
      if (!duplicateIds.has(d.id)) return false;
      const matchesKeyword = !k || d.nama.toLowerCase().includes(k) || d.id.toLowerCase().includes(k);
      const matchesAktif = aktifFilter === 'all' || (aktifFilter === 'aktif' ? isAktif(d.id) : !isAktif(d.id));
      const matchesJenis = jenisFilter === 'all' || jenisDonaturOf(d.nama) === jenisFilter;
      const matchesKantor = kantorFilter === 'all' || d.kantor === kantorFilter;
      const verified = verifiedIds.has(d.id);
      const matchesVerified = verifiedFilter === 'all' || (verifiedFilter === 'verified' ? verified : !verified);
      return matchesKeyword && matchesAktif && matchesJenis && matchesKantor && matchesVerified;
    });
  }, [donors, duplicateIds, keyword, aktifFilter, jenisFilter, kantorFilter, verifiedFilter, verifiedIds]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => sortAsc ? a.nama.localeCompare(b.nama) : b.nama.localeCompare(a.nama)),
    [filtered, sortAsc]
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const chartData = useMemo(() => {
    return MATCH_FIELDS.map(f => {
      const map = new Map();
      donors.forEach(d => {
        const val = normalize(d[f.value]);
        if (isExcluded(val)) return;
        map.set(val, (map.get(val) || 0) + 1);
      });
      const dupCount = Array.from(map.values()).filter(n => n > 1).reduce((s, n) => s + n, 0);
      return { ...f, count: dupCount };
    }).sort((a, b) => b.count - a.count);
  }, [donors]);
  const maxCount = Math.max(1, ...chartData.map(c => c.count));

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };
  const resetAll = () => {
    setMatchField('nama'); setKeywordDraft(''); setKeyword('');
    setAktifFilter('aktif'); setJenisFilter('all'); setKantorFilter('all'); setVerifiedFilter('unverified');
    setSelectedIds(new Set()); setPage(1);
  };

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const handleMerge = () => {
    if (selectedIds.size < 2) { alert('Pilih minimal 2 data donatur yang akan digabungkan.'); return; }
    const selected = donors.filter(d => selectedIds.has(d.id));
    const key = normalize(selected[0][matchField]);
    const allIdentical = selected.every(d => normalize(d[matchField]) === key);
    if (!allIdentical) {
      alert(`Data yang dipilih harus identik pada kolom "${MATCH_FIELDS.find(f => f.value === matchField)?.label}" untuk bisa digabungkan.`);
      return;
    }
    const target = [...selected].sort((a, b) => a.tglReg.localeCompare(b.tglReg))[0];
    const others = selected.filter(d => d.id !== target.id);
    if (!window.confirm(`Gabungkan ${others.length} data donatur ke "${target.nama}" (${target.id})?\nID Donatur pada transaksi akan dipindahkan ke donatur tujuan.`)) return;

    setDonors(prev => prev.filter(d => !others.some(o => o.id === d.id)));
    setVerifiedIds(prev => new Set(prev).add(target.id));
    setSelectedIds(new Set());
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Verified Donatur
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Deteksi & gabungkan data donatur duplikat</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Verified By:</span>
          <select className="form-select" style={{ width: 'auto' }} value={matchField} onChange={e => { setMatchField(e.target.value); setSelectedIds(new Set()); setPage(1); }}>
            {MATCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <div className="filter-input" style={{ width: '180px' }}>
            <Search size={16} />
            <input type="text" placeholder="Keyword..." value={keywordDraft} onChange={e => setKeywordDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && commitSearch()} />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}><Search size={16} /> Search</button>
          <button className="btn btn-primary" onClick={handleMerge}><GitMerge size={16} /> Merge{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}</button>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <select className="form-select" style={{ width: 'auto' }} value={aktifFilter} onChange={e => { setAktifFilter(e.target.value); setPage(1); }}>
            <option value="all">Status: Semua</option>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Non Aktif</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={jenisFilter} onChange={e => { setJenisFilter(e.target.value); setPage(1); }}>
            <option value="all">Donatur: Semua</option>
            <option value="Perorangan">Perorangan</option>
            <option value="Perusahaan">Perusahaan</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={kantorFilter} onChange={e => { setKantorFilter(e.target.value); setPage(1); }}>
            <option value="all">Kantor: Semua</option>
            {kantorOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={verifiedFilter} onChange={e => { setVerifiedFilter(e.target.value); setPage(1); }}>
            <option value="unverified">Un Verified</option>
            <option value="verified">Verified</option>
            <option value="all">Semua</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px', alignItems: 'start' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Data Donatur</div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '32px' }}></th>
                  <th>ID Donatur</th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => setSortAsc(s => !s)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Nama Donatur <ArrowUpDown size={12} /></span>
                  </th>
                  <th style={{ textAlign: 'center' }}>Σ T</th>
                  <th>Hp</th>
                  <th>Telpon</th>
                  <th>Email</th>
                  <th>Alamat</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data duplikat untuk filter ini</td></tr>
                )}
                {paged.map(d => (
                  <tr key={d.id} style={verifiedIds.has(d.id) ? { opacity: 0.55 } : undefined}>
                    <td><input type="checkbox" checked={selectedIds.has(d.id)} onChange={() => toggleSelect(d.id)} /></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{d.id}</td>
                    <td style={{ fontWeight: 500 }}>{d.nama}</td>
                    <td style={{ textAlign: 'center' }}>{pseudoTransCount(d.id)}</td>
                    <td>{d.hp || '-'}</td>
                    <td>{d.telpon || '-'}</td>
                    <td>{d.email || '-'}</td>
                    <td style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.alamat}>{d.alamat || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination-bar">
            <div className="pagination-info">Menampilkan {sorted.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, sorted.length)} dari {sorted.length} data</div>
            <div className="pagination-controls">
              <button disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
              <button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
              <span className="pagination-info">Hal {currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
              <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
            </div>
          </div>
        </div>

        <div className="data-table-container" style={{ padding: '16px 20px' }}>
          <div style={{ fontWeight: 700, marginBottom: '18px' }}>Grafik Duplicate Categories</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {chartData.map(c => {
              const widthPct = (c.count / maxCount) * 100;
              const isHovered = hoveredBar === c.value;
              return (
                <div key={c.value}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ color: '#475569', fontWeight: c.value === matchField ? 700 : 400 }}>{c.label}</span>
                  </div>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'default' }}
                    onMouseEnter={() => setHoveredBar(c.value)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div style={{ flex: 1, height: '18px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.max(widthPct, c.count > 0 ? 3 : 0)}%`,
                        background: BAR_HUE, borderRadius: '4px',
                        opacity: isHovered ? 0.85 : 1,
                        transition: 'width 0.3s ease, opacity 0.15s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '22px', textAlign: 'right' }}>{c.count}</span>
                  </div>
                  {isHovered && (
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{c.count} data terindikasi duplikat via {c.label.toLowerCase()}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '16px', lineHeight: 1.9 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Note :</div>
        <div>- Data yang diverifikasi ditampilkan {PAGE_SIZE} data donatur per halaman.</div>
        <div>- Jika donatur di-merge, maka ID Donatur pada transaksi akan dipindahkan ke donatur tujuan (data dengan tanggal registrasi paling awal).</div>
        <div>- Data yang akan diverifikasi tidak mengandung karakter (' ', '', '-', '0', '.').</div>
        <div>- Jika "Verified By" dipilih, maka data yang akan di-merge harus identik pada kolom tersebut.</div>
      </div>
    </div>
  );
};

export default VerifikasiDonatur;
