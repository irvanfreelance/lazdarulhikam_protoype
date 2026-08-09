import React, { useState, useMemo } from 'react';
import {
  RefreshCw, Search, Download, FileSpreadsheet, FileText, File,
  ChevronRight, ChevronDown, Folder, ExternalLink, Lock, Unlock
} from 'lucide-react';
import { INITIAL_COA, INITIAL_TRIAL_BALANCE, OFFICES, levelOf, getSaldoAwalMap } from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const YEARS = [2024, 2025, 2026, 2027];
const MONTHS = [
  { value: '01', label: 'Januari' }, { value: '02', label: 'Februari' }, { value: '03', label: 'Maret' },
  { value: '04', label: 'April' }, { value: '05', label: 'Mei' }, { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' }, { value: '08', label: 'Agustus' }, { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' }, { value: '11', label: 'November' }, { value: '12', label: 'Desember' },
];
const GROUPS = ['Aset', 'Kewajiban', 'Ekuitas', 'Penerimaan', 'Beban'];
const LEVELS = [1, 2, 3, 4];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const EPS = 0.5;

const coaByCode = INITIAL_COA.reduce((map, c) => { map[c.coa] = c; return map; }, {});
const childrenMap = INITIAL_COA.reduce((map, c) => {
  if (c.parentCoa) { (map[c.parentCoa] = map[c.parentCoa] || []).push(c); }
  return map;
}, {});
const roots = INITIAL_COA.filter(c => !c.parentCoa);

const emptyMutasi = { saldoAwal: 0, debetMutasi: 0, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 };

// mutasiByCoa is passed in (not module-level) because saldoAwal now comes
// from the editable Saldo Awal page and varies with the selected period.
const rollup = (coa, mutasiByCoa) => {
  const children = childrenMap[coa] || [];
  const own = mutasiByCoa[coa] || emptyMutasi;
  if (children.length === 0) return { ...own };
  // A node can carry its own mutasi (e.g. a leaf-like account such as Aset
  // Inventaris) AND have children (e.g. its Akumulasi Penyusutan contra
  // account) at the same time, so both must be summed together.
  return children.reduce((acc, child) => {
    const v = rollup(child.coa, mutasiByCoa);
    return {
      saldoAwal: acc.saldoAwal + v.saldoAwal,
      debetMutasi: acc.debetMutasi + v.debetMutasi,
      kreditMutasi: acc.kreditMutasi + v.kreditMutasi,
      debetDisesuaikan: acc.debetDisesuaikan + v.debetDisesuaikan,
      kreditDisesuaikan: acc.kreditDisesuaikan + v.kreditDisesuaikan,
    };
  }, { ...own });
};

const withComputed = (v) => ({
  ...v,
  neracaSaldo: v.saldoAwal + v.debetMutasi - v.kreditMutasi,
  neracaDisesuaikan: (v.saldoAwal + v.debetMutasi - v.kreditMutasi) + v.debetDisesuaikan - v.kreditDisesuaikan,
});

const TrialBalance = () => {
  const [tahun, setTahun] = useState(2026);
  const [bulan, setBulan] = useState('08');
  const [kantor, setKantor] = useState('1');
  const [appliedPeriod, setAppliedPeriod] = useState({ tahun: 2026, bulan: '08', kantor: '1' });

  const [expandedSet, setExpandedSet] = useState(() => new Set());
  const [groupFilter, setGroupFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [coaFocus, setCoaFocus] = useState('all');
  const [expandTo, setExpandTo] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [closedPeriods, setClosedPeriods] = useState(() => new Set());

  const periodKey = `${appliedPeriod.kantor}-${appliedPeriod.tahun}-${appliedPeriod.bulan}`;
  const isClosed = closedPeriods.has(periodKey);

  // Saldo Awal for this period = the latest Saldo Awal snapshot saved on or
  // before the last day of the month prior to the selected period, so e.g. a
  // 2024-12-31 snapshot feeds Jan..Dec 2025 (and later) until a newer one is saved.
  const throughDate = useMemo(() => {
    const d = new Date(Number(appliedPeriod.tahun), Number(appliedPeriod.bulan) - 1, 1);
    d.setDate(d.getDate() - 1);
    return d.toISOString().substring(0, 10);
  }, [appliedPeriod]);

  const mutasiByCoa = useMemo(() => {
    const saldoAwalMap = getSaldoAwalMap(throughDate);
    const map = {};
    INITIAL_TRIAL_BALANCE.forEach(m => {
      map[m.coa] = { ...m, saldoAwal: saldoAwalMap[m.coa] ?? m.saldoAwal };
    });
    return map;
  }, [throughDate]);

  const officeOptions = useMemo(() => OFFICES.map(o => ({ value: o.id, label: o.nama })), []);
  const coaOptions = useMemo(() => [
    { value: 'all', label: 'All COA' },
    ...INITIAL_COA.map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })),
  ], []);

  const commitSearch = () => setAppliedPeriod({ tahun, bulan, kantor });

  const resetAll = () => {
    setTahun(2026); setBulan('08'); setKantor('1');
    setAppliedPeriod({ tahun: 2026, bulan: '08', kantor: '1' });
    setExpandedSet(new Set());
    setGroupFilter('all'); setLevelFilter('all'); setCoaFocus('all'); setExpandTo('');
    setExportOpen(false);
  };

  const toggleExpand = (coa) => {
    setExpandedSet(prev => {
      const next = new Set(prev);
      if (next.has(coa)) next.delete(coa); else next.add(coa);
      return next;
    });
  };

  const collapseAll = () => setExpandedSet(new Set());
  const expandAll = () => setExpandedSet(new Set(INITIAL_COA.filter(c => (childrenMap[c.coa] || []).length > 0).map(c => c.coa)));

  const handleExpandTo = (val) => {
    setExpandTo(val);
    if (!val) return;
    const targetLevel = Number(val);
    const next = new Set();
    INITIAL_COA.forEach(c => {
      if ((childrenMap[c.coa] || []).length > 0 && levelOf(c.coa, INITIAL_COA) < targetLevel) next.add(c.coa);
    });
    setExpandedSet(next);
  };

  const coaFocusVisibleSet = useMemo(() => {
    if (coaFocus === 'all') return null;
    const set = new Set();
    let cur = coaByCode[coaFocus];
    while (cur) { set.add(cur.coa); cur = cur.parentCoa ? coaByCode[cur.parentCoa] : null; }
    const stack = [coaFocus];
    while (stack.length) {
      const c = stack.pop();
      set.add(c);
      (childrenMap[c] || []).forEach(ch => stack.push(ch.coa));
    }
    return set;
  }, [coaFocus]);

  const handleClosing = () => {
    if (isClosed) {
      if (window.confirm(`Buka kembali periode ${MONTHS.find(m => m.value === appliedPeriod.bulan)?.label} ${appliedPeriod.tahun} untuk ${OFFICES.find(o => o.id === appliedPeriod.kantor)?.nama}?`)) {
        setClosedPeriods(prev => { const next = new Set(prev); next.delete(periodKey); return next; });
      }
    } else {
      if (window.confirm(`Tutup Neraca Disesuaikan periode ${MONTHS.find(m => m.value === appliedPeriod.bulan)?.label} ${appliedPeriod.tahun} untuk ${OFFICES.find(o => o.id === appliedPeriod.kantor)?.nama} menjadi saldo akhir?`)) {
        setClosedPeriods(prev => new Set(prev).add(periodKey));
      }
    }
  };

  const renderNode = (coa, depth) => {
    const node = coaByCode[coa];
    if (!node) return null;
    if (coaFocusVisibleSet && !coaFocusVisibleSet.has(coa)) return null;
    const depthLevel = levelOf(coa, INITIAL_COA);
    if (levelFilter !== 'all' && depthLevel > Number(levelFilter)) return null;

    const children = childrenMap[coa] || [];
    const hasChildren = children.length > 0;
    const forcedOpen = coaFocusVisibleSet ? coaFocusVisibleSet.has(coa) && coaFocus !== coa : false;
    const isOpen = hasChildren && (expandedSet.has(coa) || forcedOpen);
    const values = withComputed(rollup(coa, mutasiByCoa));

    return (
      <React.Fragment key={coa}>
        <tr>
          <td style={{ paddingLeft: `${depth * 20 + 8}px`, cursor: hasChildren ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
            onClick={() => hasChildren && toggleExpand(coa)}>
            {hasChildren ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#64748b' }}>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Folder size={14} />
              </span>
            ) : (
              <span style={{ display: 'inline-block', width: '18px' }} />
            )}
          </td>
          <td style={{ fontFamily: 'monospace', fontWeight: hasChildren ? 700 : 400 }}>{node.coa}</td>
          <td style={{ fontWeight: hasChildren ? 700 : 400 }}>{node.nama}</td>
          <td style={{ textAlign: 'right' }}>{fmt(values.saldoAwal)}</td>
          <td style={{ textAlign: 'right' }}>{fmt(values.debetMutasi)}</td>
          <td style={{ textAlign: 'right' }}>{fmt(values.kreditMutasi)}</td>
          <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(values.neracaSaldo)}</td>
          <td style={{ textAlign: 'right' }}>{fmt(values.debetDisesuaikan)}</td>
          <td style={{ textAlign: 'right' }}>{fmt(values.kreditDisesuaikan)}</td>
          <td style={{ textAlign: 'right', fontWeight: 700, background: isClosed ? '#bbf7d0' : '#fbcfe8' }}>{fmt(values.neracaDisesuaikan)}</td>
          <td style={{ textAlign: 'right', color: isClosed ? '#15803d' : '#94a3b8', fontWeight: isClosed ? 700 : 400 }}>
            {isClosed ? fmt(values.neracaDisesuaikan) : fmt(0)}
          </td>
        </tr>
        {isOpen && children
          .slice()
          .sort((a, b) => a.coa.localeCompare(b.coa))
          .map(child => renderNode(child.coa, depth + 1))}
      </React.Fragment>
    );
  };

  const visibleRoots = groupFilter === 'all' ? roots : roots.filter(r => r.group === groupFilter);

  // --- Balance checks ---
  const totalAsetAwal = rollup('100.00.000.000', mutasiByCoa).saldoAwal;
  const totalKewajibanAwal = rollup('200.00.000.000', mutasiByCoa).saldoAwal;
  const totalSaldoDanaAwal = rollup('300.00.000.000', mutasiByCoa).saldoAwal;
  const saldoAwalBalanced = Math.abs(totalAsetAwal - (totalKewajibanAwal + totalSaldoDanaAwal)) < EPS;

  const totalDebetMutasi = INITIAL_TRIAL_BALANCE.reduce((s, m) => s + m.debetMutasi, 0);
  const totalKreditMutasi = INITIAL_TRIAL_BALANCE.reduce((s, m) => s + m.kreditMutasi, 0);
  const mutasiBalanced = Math.abs(totalDebetMutasi - totalKreditMutasi) < EPS;

  const totalDebetDisesuaikan = INITIAL_TRIAL_BALANCE.reduce((s, m) => s + m.debetDisesuaikan, 0);
  const totalKreditDisesuaikan = INITIAL_TRIAL_BALANCE.reduce((s, m) => s + m.kreditDisesuaikan, 0);
  const penyesuaianBalanced = Math.abs(totalDebetDisesuaikan - totalKreditDisesuaikan) < EPS;

  const monthLabel = MONTHS.find(m => m.value === appliedPeriod.bulan)?.label;
  const officeLabel = OFFICES.find(o => o.id === appliedPeriod.kantor)?.nama;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Trial Balance
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Neraca saldo hierarki COA — saldo awal, mutasi, penyesuaian, dan penutupan per periode & kantor</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '200px' }}>
            <SearchableSelect options={officeOptions} value={kantor} onChange={setKantor} placeholder="Kantor" />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tahun:</span>
          <select className="form-select" style={{ width: 'auto' }} value={tahun} onChange={e => setTahun(Number(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Bulan</span>
          <select className="form-select" style={{ width: 'auto' }} value={bulan} onChange={e => setBulan(e.target.value)}>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            <Search size={16} /> Search
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
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <button className="btn" style={{ background: isClosed ? '#d1fae5' : 'white', border: '1px solid #e2e8f0', color: isClosed ? '#15803d' : undefined }} onClick={handleClosing}>
            {isClosed ? <Unlock size={16} /> : <Lock size={16} />} Clossing
          </button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={collapseAll}>CollapseAll</button>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={expandAll}>ExpandAll</button>
          <select className="form-select" style={{ width: 'auto' }} value={expandTo} onChange={e => handleExpandTo(e.target.value)}>
            <option value="">ExpandTo</option>
            {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>
            <option value="all">Group</option>
            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <div style={{ width: '190px' }}>
            <SearchableSelect options={coaOptions} value={coaFocus} onChange={setCoaFocus} placeholder="All COA" />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={levelFilter} onChange={e => setLevelFilter(e.target.value)}>
            <option value="all">All Level</option>
            {LEVELS.map(l => <option key={l} value={l}>Level {l}</option>)}
          </select>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '16px', background: 'var(--bg-card)' }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.02em' }}>LAZ DARUL HIKAM</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>Trial BALANCE</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Periode: {monthLabel} {appliedPeriod.tahun} — {officeLabel}</div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Trial Balance</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}>#</th>
                <th>Kode Akun</th>
                <th>Nama Akun</th>
                <th style={{ textAlign: 'right' }}>Saldo Awal</th>
                <th style={{ textAlign: 'right' }}>Debet Mutasi</th>
                <th style={{ textAlign: 'right' }}>Kredit Mutasi</th>
                <th style={{ textAlign: 'right' }}>Neraca Saldo</th>
                <th style={{ textAlign: 'right' }}>Debet Disesuaikan</th>
                <th style={{ textAlign: 'right' }}>Kredit Disesuaikan</th>
                <th style={{ textAlign: 'right' }}>Neraca Disesuaikan</th>
                <th style={{ textAlign: 'right' }}>Clossed</th>
              </tr>
            </thead>
            <tbody>
              {visibleRoots.map(r => renderNode(r.coa, 0))}

              <tr>
                <td colSpan={2}></td>
                <td style={{ fontWeight: 700, color: saldoAwalBalanced ? '#16a34a' : '#dc2626' }}>
                  Saldo Awal [Aset Vs (Kewajiban+SD)]
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: saldoAwalBalanced ? '#16a34a' : '#dc2626' }}>{fmt(totalAsetAwal)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: saldoAwalBalanced ? '#16a34a' : '#dc2626' }}>{fmt(totalKewajibanAwal + totalSaldoDanaAwal)}</td>
                <td colSpan={6} style={{ fontWeight: 700, color: saldoAwalBalanced ? '#16a34a' : '#dc2626' }}>{saldoAwalBalanced ? 'BALANCE' : 'UNBALANCE'}</td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td style={{ fontWeight: 700, color: mutasiBalanced ? '#16a34a' : '#dc2626' }}>Mutasi [Debet Vs Kredit]</td>
                <td></td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: mutasiBalanced ? '#16a34a' : '#dc2626' }}>{fmt(totalDebetMutasi)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: mutasiBalanced ? '#16a34a' : '#dc2626' }}>{fmt(totalKreditMutasi)}</td>
                <td colSpan={5} style={{ fontWeight: 700, color: mutasiBalanced ? '#16a34a' : '#dc2626' }}>{mutasiBalanced ? 'BALANCE' : 'UNBALANCE'}</td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td style={{ fontWeight: 700, color: penyesuaianBalanced ? '#16a34a' : '#dc2626' }}>Penyesuaian [Debet Vs Kredit]</td>
                <td colSpan={4}></td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: penyesuaianBalanced ? '#16a34a' : '#dc2626' }}>{fmt(totalDebetDisesuaikan)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: penyesuaianBalanced ? '#16a34a' : '#dc2626' }}>{fmt(totalKreditDisesuaikan)}</td>
                <td style={{ fontWeight: 700, color: penyesuaianBalanced ? '#16a34a' : '#dc2626' }}>{penyesuaianBalanced ? 'BALANCE' : 'UNBALANCE'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '14px', lineHeight: 1.9 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Note :</div>
        <div>- Saldo awal diambil dari penutupan</div>
        <div>- Warna <span style={{ background: '#bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>hijau</span> di neraca saldo menunjukkan data sudah ditutup</div>
        <div>- Warna <span style={{ background: '#fbcfe8', padding: '1px 6px', borderRadius: '4px' }}>pink</span> di neraca saldo menunjukkan data belum ditutup</div>
        <div>- Tombol "Clossing" digunakan untuk menutup "Neraca Disesuaikan" menjadi saldo akhir per bulan/tahun/kantor</div>
      </div>
    </div>
  );
};

export default TrialBalance;
