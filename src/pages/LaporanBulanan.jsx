import React, { useState, useMemo } from 'react';
import {
  RefreshCw, Search, Download, FileSpreadsheet, FileText, File, ExternalLink, Lock, Unlock
} from 'lucide-react';
import { OFFICES, INITIAL_RUMUS_TEMPLATES } from '../utils/finsCoaStore';
import { MONTHS, LATEST_DATA_MONTH, evaluateRumus } from '../utils/laporanBulananStore';
import SearchableSelect from '../components/SearchableSelect';

const YEARS = [2025, 2026, 2027];
const REPORT_TYPES = Object.keys(INITIAL_RUMUS_TEMPLATES);

const fmt = (n) => {
  const abs = Math.abs(n || 0);
  const formatted = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(abs);
  return n < 0 ? `(${formatted})` : formatted;
};

const LaporanBulanan = () => {
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [tahun, setTahun] = useState(2026);
  const [kantor, setKantor] = useState('1');
  const [applied, setApplied] = useState({ tahun: 2026, kantor: '1' });
  const [via, setVia] = useState('closing');
  const [exportOpen, setExportOpen] = useState(false);
  const [closedAnnual, setClosedAnnual] = useState(() => new Set());

  const officeOptions = useMemo(() => OFFICES.map(o => ({ value: o.id, label: o.nama })), []);
  const rows = useMemo(() => [...(INITIAL_RUMUS_TEMPLATES[reportType] || [])].sort((a, b) => a.sort - b.sort), [reportType]);

  const periodKey = `${reportType}-${applied.tahun}-${applied.kantor}`;
  const isAnnualClosed = closedAnnual.has(periodKey);

  const commitSearch = () => setApplied({ tahun, kantor });

  const resetAll = () => {
    setReportType(REPORT_TYPES[0]);
    setTahun(2026); setKantor('1'); setApplied({ tahun: 2026, kantor: '1' });
    setVia('closing'); setExportOpen(false);
  };

  const handleClosing = () => {
    if (isAnnualClosed) {
      if (window.confirm(`Buka kembali total tahunan ${applied.tahun} untuk ${OFFICES.find(o => o.id === applied.kantor)?.nama}?`)) {
        setClosedAnnual(prev => { const next = new Set(prev); next.delete(periodKey); return next; });
      }
    } else {
      if (window.confirm(`Tutup total tahun ${applied.tahun} untuk ${OFFICES.find(o => o.id === applied.kantor)?.nama}? Total kolom "${applied.tahun}" akan diambil dari saldo bulan terakhir yang berjalan (${MONTHS.find(m => m.key === LATEST_DATA_MONTH)?.label}).`)) {
        setClosedAnnual(prev => new Set(prev).add(periodKey));
      }
    }
  };

  const officeLabel = OFFICES.find(o => o.id === applied.kantor)?.nama;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Laporan Bulanan
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Tren saldo bulanan (Jan–Des) untuk setiap baris pada template Rumus Report</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak / Buka Tampilan Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <div style={{ width: '230px' }}>
            <SearchableSelect options={REPORT_TYPES.map(r => ({ value: r, label: r }))} value={reportType} onChange={setReportType} />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tahun:</span>
          <select className="form-select" style={{ width: 'auto' }} value={tahun} onChange={e => setTahun(Number(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
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
        <div className="filters-right" style={{ flexWrap: 'wrap', rowGap: '10px', alignItems: 'center' }}>
          <div style={{ width: '170px' }}>
            <SearchableSelect options={officeOptions} value={kantor} onChange={setKantor} placeholder="Kantor" />
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Via</span>
          <select className="form-select" style={{ width: 'auto' }} value={via} onChange={e => setVia(e.target.value)}>
            <option value="otomatis">Otomatis</option>
            <option value="closing">Closing</option>
          </select>
          <button className="btn" style={{ background: isAnnualClosed ? '#d1fae5' : 'white', border: '1px solid #e2e8f0', color: isAnnualClosed ? '#15803d' : undefined }} onClick={handleClosing}>
            {isAnnualClosed ? <Unlock size={16} /> : <Lock size={16} />} Closing
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '16px', background: 'var(--bg-card)' }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.02em' }}>LAZ DARUL HIKAM</div>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{reportType}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Tahun {applied.tahun} — {officeLabel}</div>
      </div>

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Laporan Per Bulan</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '220px' }}></th>
                <th style={{ textAlign: 'right' }}>{applied.tahun - 1}</th>
                <th style={{ textAlign: 'right', background: via === 'closing' ? (isAnnualClosed ? '#bbf7d0' : '#fbcfe8') : undefined }}>{applied.tahun}</th>
                {MONTHS.map(m => <th key={m.key} style={{ textAlign: 'right' }}>{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const y2025 = evaluateRumus(row.rumus, 'y2025');
                const annual = via === 'closing' ? (isAnnualClosed ? evaluateRumus(row.rumus, LATEST_DATA_MONTH) : 0) : evaluateRumus(row.rumus, LATEST_DATA_MONTH);
                return (
                  <tr key={row.id}>
                    <td style={{ paddingLeft: `${(row.level - 1) * 16 + 12}px`, fontWeight: row.level === 1 ? 700 : 400, whiteSpace: 'nowrap' }}>{row.nama}</td>
                    <td style={{ textAlign: 'right' }}>{fmt(y2025)}</td>
                    <td style={{ textAlign: 'right', background: via === 'closing' ? (isAnnualClosed ? '#f0fdf4' : '#fdf2f8') : undefined }}>{fmt(annual)}</td>
                    {MONTHS.map(m => (
                      <td key={m.key} style={{ textAlign: 'right' }}>{fmt(evaluateRumus(row.rumus, m.key))}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '14px', lineHeight: 1.9 }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Note :</div>
        <div>- Saldo {applied.tahun - 1} diambil dari penutupan tahun sebelumnya; bulan {MONTHS.slice(6).map(m => m.label).join(', ')} belum berjalan (periode belum ditutup)</div>
        <div>- Kolom "Via" menentukan sumber kolom total tahun {applied.tahun}: <strong>Otomatis</strong> = nilai berjalan (live), <strong>Closing</strong> = nilai resmi setelah ditutup</div>
        <div>- Warna <span style={{ background: '#bbf7d0', padding: '1px 6px', borderRadius: '4px' }}>hijau</span> pada kolom {applied.tahun} menunjukkan total tahunan sudah ditutup; warna <span style={{ background: '#fbcfe8', padding: '1px 6px', borderRadius: '4px' }}>pink</span> menunjukkan belum ditutup</div>
        <div>- Tombol "Closing" menutup total tahun {applied.tahun} menjadi saldo resmi berdasarkan bulan terakhir yang berjalan</div>
      </div>
    </div>
  );
};

export default LaporanBulanan;
