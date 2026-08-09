import React, { useEffect, useMemo, useState } from 'react';
import {
  RefreshCw, Search, Download, FileSpreadsheet, FileText, File, Upload,
  Sigma, Copy, Save, X
} from 'lucide-react';
import { INITIAL_COA, OFFICES, getSaldoAwal, saveSaldoAwal, levelOf } from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const EPS = 0.5;

const leafCoa = INITIAL_COA.filter(c => c.includeBuku);
const coaByCode = INITIAL_COA.reduce((map, c) => { map[c.coa] = c; return map; }, {});
const childrenMap = INITIAL_COA.reduce((map, c) => {
  if (c.parentCoa) (map[c.parentCoa] = map[c.parentCoa] || []).push(c);
  return map;
}, {});
const roots = INITIAL_COA.filter(c => !c.parentCoa);

// Flattens the COA tree in display order, tagging each node with its depth
// so "Parent" mode can render the full hierarchy with rollup totals.
const flattenTree = () => {
  const out = [];
  const walk = (coa, depth) => {
    const node = coaByCode[coa];
    out.push({ coa, depth, isParent: !node.includeBuku });
    (childrenMap[coa] || []).slice().sort((a, b) => a.coa.localeCompare(b.coa)).forEach(ch => walk(ch.coa, depth + 1));
  };
  roots.slice().sort((a, b) => a.coa.localeCompare(b.coa)).forEach(r => walk(r.coa, 0));
  return out;
};
const treeRows = flattenTree();

const rollupSaldo = (coa, values) => {
  const children = childrenMap[coa] || [];
  // Number() guards against string+number concatenation: edited cells hold
  // the raw string from the <input>, untouched ones still hold the seeded number.
  if (children.length === 0) return Number(values[coa]) || 0;
  return children.reduce((sum, ch) => sum + rollupSaldo(ch.coa, values), Number(values[coa]) || 0);
};

const todayISO = () => new Date().toISOString().substring(0, 10);

const SaldoAwal = () => {
  const [snapshots, setSnapshots] = useState(() => getSaldoAwal());
  const [tanggal, setTanggal] = useState(() => {
    const dates = Array.from(new Set(getSaldoAwal().map(r => r.tanggal))).sort();
    return dates.length ? dates[dates.length - 1] : todayISO();
  });
  const [periode, setPeriode] = useState('Year');
  const [parentMode, setParentMode] = useState('child');
  const [kantorFilter, setKantorFilter] = useState('');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [exportOpen, setExportOpen] = useState(false);

  const [editValues, setEditValues] = useState({});
  const [editOffice, setEditOffice] = useState({});
  const [dirty, setDirty] = useState(false);

  const availableDates = useMemo(() => Array.from(new Set(snapshots.map(r => r.tanggal))).sort(), [snapshots]);

  const loadSnapshot = (targetDate, source = snapshots) => {
    const rows = source.filter(r => r.tanggal === targetDate);
    const values = {};
    const offices = {};
    leafCoa.forEach(c => {
      const row = rows.find(r => r.coa === c.coa && (!kantorFilter || r.officeId === kantorFilter));
      values[c.coa] = row ? row.saldoAkhir : 0;
      offices[c.coa] = row ? (row.officeId || '') : '';
    });
    setEditValues(values);
    setEditOffice(offices);
    setDirty(false);
  };

  useEffect(() => { loadSnapshot(tanggal); }, [tanggal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleValueChange = (coa, val) => {
    setEditValues(prev => ({ ...prev, [coa]: val }));
    setDirty(true);
  };
  const handleOfficeChange = (coa, val) => {
    setEditOffice(prev => ({ ...prev, [coa]: val }));
    setDirty(true);
  };

  const commitSearch = () => setKeyword(keywordDraft);

  const handleSave = () => {
    const others = snapshots.filter(r => r.tanggal !== tanggal);
    const updatedRows = leafCoa.map((c, idx) => ({
      id: `${tanggal}-${c.coa}-${idx}`,
      coa: c.coa,
      tanggal,
      saldoAkhir: parseFloat(editValues[c.coa]) || 0,
      officeId: editOffice[c.coa] || ''
    }));
    const merged = [...others, ...updatedRows];
    setSnapshots(merged);
    saveSaldoAwal(merged);
    setDirty(false);
    alert(`Saldo Awal per ${tanggal} berhasil disimpan. Nilai ini akan langsung tercermin sebagai "Saldo Awal" di Trial Balance untuk periode setelah tanggal ini.`);
  };

  const handleCancel = () => loadSnapshot(tanggal);

  const handleDuplicate = () => {
    const suggestion = (() => {
      const d = new Date(`${tanggal}T00:00:00`);
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().substring(0, 10);
    })();
    const target = window.prompt('Duplikat saldo saat ini ke tanggal berapa? (YYYY-MM-DD)', suggestion);
    if (!target || !/^\d{4}-\d{2}-\d{2}$/.test(target)) {
      if (target !== null) alert('Format tanggal tidak valid. Gunakan YYYY-MM-DD.');
      return;
    }
    const others = snapshots.filter(r => r.tanggal !== target);
    const duplicated = leafCoa.map((c, idx) => ({
      id: `${target}-${c.coa}-${idx}`,
      coa: c.coa,
      tanggal: target,
      saldoAkhir: parseFloat(editValues[c.coa]) || 0,
      officeId: editOffice[c.coa] || ''
    }));
    const merged = [...others, ...duplicated];
    setSnapshots(merged);
    saveSaldoAwal(merged);
    setTanggal(target);
    alert(`Saldo per ${tanggal} berhasil diduplikat menjadi snapshot baru tanggal ${target}.`);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    alert(`File "${file.name}" berhasil diimpor (simulasi). Data saldo tidak berubah pada mode demo ini.`);
    e.target.value = '';
  };

  const handleRefresh = () => {
    const fresh = getSaldoAwal();
    setSnapshots(fresh);
    loadSnapshot(tanggal, fresh);
    setKeyword(''); setKeywordDraft('');
  };

  const matchesKeyword = (coa) => {
    if (!keyword.trim()) return true;
    const k = keyword.trim().toLowerCase();
    const node = coaByCode[coa];
    return coa.toLowerCase().includes(k) || (node?.nama || '').toLowerCase().includes(k);
  };

  const visibleRows = useMemo(() => {
    if (parentMode === 'child') {
      return leafCoa.filter(c => matchesKeyword(c.coa)).map(c => ({ coa: c.coa, depth: 0, isParent: false }));
    }
    return treeRows.filter(r => matchesKeyword(r.coa));
  }, [parentMode, keyword]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalAset = leafCoa
    .filter(c => c.group === 'Aset')
    .reduce((s, c) => s + (parseFloat(editValues[c.coa]) || 0), 0);
  const totalKewajibanEkuitas = leafCoa
    .filter(c => c.group === 'Kewajiban' || c.group === 'Ekuitas')
    .reduce((s, c) => s + (parseFloat(editValues[c.coa]) || 0), 0);
  const balanced = Math.abs(totalAset - totalKewajibanEkuitas) < EPS;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ marginBottom: 0 }}>Saldo Awal</h1>
          <button type="button" title="Muat ulang" onClick={handleRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tanggal :</span>
          <input
            type="date" className="form-input" style={{ width: 'auto' }}
            value={tanggal} onChange={e => setTanggal(e.target.value)}
          />
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text" placeholder="Keyword..." value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            <Search size={16} /> Search
          </button>
        </div>
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Periode :</span>
          <select className="form-select" style={{ width: 'auto' }} value={periode} onChange={e => setPeriode(e.target.value)}>
            <option value="Year">Year</option>
            <option value="Month">Month</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Parent :</span>
          <select className="form-select" style={{ width: 'auto' }} value={parentMode} onChange={e => setParentMode(e.target.value)}>
            <option value="child">Child</option>
            <option value="all">Parent</option>
          </select>
          <div style={{ width: '180px' }}>
            <SearchableSelect
              options={[{ value: '', label: 'Semua Kantor' }, ...OFFICES.map(o => ({ value: o.id, label: o.nama }))]}
              value={kantorFilter}
              onChange={v => { setKantorFilter(v); loadSnapshot(tanggal); }}
              placeholder="Kantor"
            />
          </div>
        </div>
      </div>

      <div className="filters-row" style={{ marginTop: '-12px' }}>
        <div className="filters-left">
          <button
            className="btn" style={{ background: parentMode === 'all' ? '#e0f2fe' : 'white', border: '1px solid #e2e8f0' }}
            title="Tampilkan/sembunyikan akun induk (rollup)"
            onClick={() => setParentMode(m => m === 'child' ? 'all' : 'child')}
          >
            <Sigma size={16} /> Parent
          </button>
          <div className="export-menu-wrap">
            <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setExportOpen(o => !o)}>
              <Download size={16} /> Export
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button onClick={() => { setExportOpen(false); alert('Saldo awal berhasil diekspor ke Excel (simulasi).'); }}><FileSpreadsheet size={14} /> Excel</button>
                <button onClick={() => { setExportOpen(false); alert('Saldo awal berhasil diekspor ke CSV (simulasi).'); }}><FileText size={14} /> CSV</button>
                <button onClick={() => { setExportOpen(false); alert('Saldo awal berhasil diekspor ke PDF (simulasi).'); }}><File size={14} /> PDF</button>
              </div>
            )}
          </div>
          <label className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            <Upload size={16} /> Import
            <input type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
          </label>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handleDuplicate} title="Duplikat saldo ke tanggal lain">
            <Copy size={16} /> Duplicate
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <div style={{ padding: '12px 20px', fontWeight: 700, background: '#fdf2f8', borderBottom: '1px solid var(--border-color)' }}>
          Saldo
        </div>
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary" disabled={!dirty} onClick={handleSave}>
            <Save size={16} /> Save
          </button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} disabled={!dirty} onClick={handleCancel}>
            <X size={16} /> Cancel
          </button>
          {dirty && <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>Ada perubahan belum disimpan</span>}
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>COA</th>
              <th>Nama Akun</th>
              <th>Tanggal</th>
              <th style={{ textAlign: 'right' }}>Saldo Akhir</th>
              <th>Kantor</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada akun yang cocok</td></tr>
            )}
            {visibleRows.map(r => {
              if (r.isParent) {
                const total = rollupSaldo(r.coa, editValues);
                return (
                  <tr key={r.coa} style={{ background: '#f8fafc' }}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{r.coa}</td>
                    <td style={{ paddingLeft: `${r.depth * 18 + 12}px`, fontWeight: 700 }}>{coaByCode[r.coa]?.nama}</td>
                    <td style={{ color: '#94a3b8' }}>-</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(total)}</td>
                    <td style={{ color: '#94a3b8' }}>-</td>
                  </tr>
                );
              }
              const node = coaByCode[r.coa];
              return (
                <tr key={r.coa}>
                  <td style={{ fontFamily: 'monospace' }}>{r.coa}</td>
                  <td style={{ paddingLeft: `${r.depth * 18 + 12}px` }}>{node?.nama}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{tanggal}</td>
                  <td style={{ textAlign: 'right' }}>
                    <input
                      type="number" step="0.01" className="form-input"
                      style={{ textAlign: 'right', width: '180px', marginLeft: 'auto' }}
                      value={editValues[r.coa] ?? 0}
                      onChange={e => handleValueChange(r.coa, e.target.value)}
                    />
                  </td>
                  <td style={{ width: '190px' }}>
                    <SearchableSelect
                      options={[{ value: '', label: '-' }, ...OFFICES.map(o => ({ value: o.id, label: o.nama }))]}
                      value={editOffice[r.coa] || ''}
                      onChange={v => handleOfficeChange(r.coa, v)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          {parentMode === 'child' && visibleRows.length > 0 && (
            <tfoot>
              <tr style={{ fontWeight: 700, background: '#f8fafc' }}>
                <td colSpan={2} style={{ color: balanced ? '#16a34a' : '#dc2626' }}>
                  Saldo Awal [Aset Vs (Kewajiban+Ekuitas)]
                </td>
                <td></td>
                <td style={{ textAlign: 'right', color: balanced ? '#16a34a' : '#dc2626' }}>
                  {fmt(totalAset)} vs {fmt(totalKewajibanEkuitas)}
                </td>
                <td style={{ color: balanced ? '#16a34a' : '#dc2626' }}>{balanced ? 'BALANCE' : 'UNBALANCE'}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '14px', lineHeight: 1.9 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Note :</div>
        <div>- Saldo Akhir yang disimpan di sini menjadi "Saldo Awal" di Trial Balance untuk periode setelah tanggal ini.</div>
        <div>- Snapshot tersimpan: {availableDates.length ? availableDates.join(', ') : '-'}</div>
        <div>- Gunakan "Duplicate" untuk menyalin saldo saat ini sebagai draf pembukaan periode berikutnya.</div>
      </div>
    </div>
  );
};

export default SaldoAwal;
