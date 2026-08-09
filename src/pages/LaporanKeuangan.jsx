import React, { useMemo, useState } from 'react';
import {
  RefreshCw, Maximize2, Minimize2, Search, Download, FileSpreadsheet, FileText, File, Lock, Unlock
} from 'lucide-react';
import { INITIAL_RUMUS_TEMPLATES, OFFICES } from '../utils/finsCoaStore';
import { MONTHS, LATEST_DATA_MONTH, evaluateRumus } from '../utils/laporanBulananStore';
import { getDanaCategories, getArusKas } from '../utils/laporanDanaStore';
import SearchableSelect from '../components/SearchableSelect';

const YEARS = [2025, 2026, 2027];
const REPORT_OPTIONS = ['Laporan Posisi Keuangan', 'Laporan Perubahan Dana', 'Laporan Arus Kas'];
const VIA_OPTIONS = [{ value: 'otomatis', label: 'Otomatis' }, { value: 'closing', label: 'Closing' }];

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n) || 0);
const fmtAcct = (n) => (n < -0.005 ? `(${fmt(n)})` : fmt(n));

const LaporanKeuangan = () => {
  const [reportType, setReportType] = useState(REPORT_OPTIONS[0]);
  const [tahun, setTahun] = useState(2026);
  const [bulan, setBulan] = useState(LATEST_DATA_MONTH);
  const [kantor, setKantor] = useState('all');
  const [via, setVia] = useState('otomatis');
  const [applied, setApplied] = useState({ reportType: REPORT_OPTIONS[0], tahun: 2026, bulan: LATEST_DATA_MONTH });
  const [exportOpen, setExportOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [closedPeriods, setClosedPeriods] = useState(() => new Set());

  const reportOptions = REPORT_OPTIONS.map(name => ({ value: name, label: name }));
  const officeOptions = [{ value: 'all', label: 'Semua Kantor' }, ...OFFICES.map(o => ({ value: o.id, label: o.nama }))];

  const commitSearch = () => setApplied({ reportType, tahun, bulan });

  const periodKey = `${applied.reportType}-${applied.tahun}-${applied.bulan}-${kantor}`;
  const isClosed = closedPeriods.has(periodKey);
  const gate = (val) => (via === 'closing' ? (isClosed ? val : 0) : val);

  const handleClosing = () => {
    setClosedPeriods(prev => {
      const next = new Set(prev);
      if (next.has(periodKey)) next.delete(periodKey); else next.add(periodKey);
      return next;
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setReportType(REPORT_OPTIONS[0]);
    setTahun(2026);
    setBulan(LATEST_DATA_MONTH);
    setKantor('all');
    setVia('otomatis');
    setApplied({ reportType: REPORT_OPTIONS[0], tahun: 2026, bulan: LATEST_DATA_MONTH });
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Mode 1: Laporan Posisi Keuangan — rumus dari menu Rumus Report, dievaluasi
  // terhadap Trial Balance (sinkron dengan Laporan Bulanan).
  const posisiRows = useMemo(() => {
    const rows = [...(INITIAL_RUMUS_TEMPLATES['Laporan Posisi Keuangan'] || [])].sort((a, b) => a.sort - b.sort);
    return rows.map(r => ({
      ...r,
      current: gate(evaluateRumus(r.rumus, applied.bulan)),
      prior: evaluateRumus(r.rumus, 'y2025')
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied.bulan, via, isClosed]);

  // Mode 2 & 3: Laporan Perubahan Dana & Laporan Arus Kas — dihitung dari
  // struktur dana PSAK 109 (laporanDanaStore), bukan dari Rumus Report.
  const danaCategories = useMemo(() => getDanaCategories(), []);
  const arusKas = useMemo(() => getArusKas(), []);

  const monthLabel = MONTHS.find(m => m.key === applied.bulan)?.label || applied.bulan;
  const officeLabel = OFFICES.find(o => o.id === kantor)?.nama || 'Semua Kantor';
  const isPosisi = applied.reportType === 'Laporan Posisi Keuangan';

  const Row = ({ label, current, prior, bold, italic, indent = 0 }) => (
    <tr>
      <td style={{ paddingLeft: `${indent * 16 + 12}px`, fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal', whiteSpace: 'nowrap' }}>{label}</td>
      <td style={{ textAlign: 'right', fontWeight: bold ? 700 : 400 }}>{current === undefined ? '' : fmtAcct(current)}</td>
      <td style={{ textAlign: 'right', fontWeight: bold ? 700 : 400 }}>{prior === undefined ? '' : fmtAcct(prior)}</td>
    </tr>
  );

  const SectionHeader = ({ label }) => (
    <tr><td colSpan={3} style={{ fontWeight: 700, paddingTop: '14px' }}>{label}</td></tr>
  );

  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <div style={{ width: '260px' }}>
            <SearchableSelect options={reportOptions} value={reportType} onChange={setReportType} />
          </div>
          <button onClick={handleRefresh} title="Reset filter" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}>
            <RefreshCw size={20} className={isRefreshing ? 'icon-spin' : ''} />
          </button>
        </div>
        <button onClick={() => setIsFullscreen(f => !f)} title={isFullscreen ? 'Keluar layar penuh' : 'Perbesar layar penuh'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}>
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* FILTERS */}
      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tahun :</span>
          <select className="form-select" style={{ width: 'auto' }} value={tahun} onChange={e => setTahun(Number(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {isPosisi && (
            <>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>| Bulan :</span>
              <select className="form-select" style={{ width: 'auto' }} value={bulan} onChange={e => setBulan(e.target.value)}>
                {MONTHS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </>
          )}
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
        <div className="filters-right">
          <div style={{ width: '180px' }}>
            <SearchableSelect options={officeOptions} value={kantor} onChange={setKantor} placeholder="Kantor" />
          </div>
          <div className="filter-input">
            <span style={{ fontSize: '0.8rem' }}>Via</span>
            <select value={via} onChange={e => setVia(e.target.value)}>
              {VIA_OPTIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
          {via === 'closing' && (
            <button
              className="btn"
              style={{ background: isClosed ? '#d1fae5' : 'white', border: '1px solid #e2e8f0', color: isClosed ? '#15803d' : undefined }}
              onClick={handleClosing}
            >
              {isClosed ? <Unlock size={16} /> : <Lock size={16} />} Closing
            </button>
          )}
        </div>
      </div>

      {/* REPORT HEADER */}
      <div className="data-table-container" style={{ padding: '24px', textAlign: 'center', marginBottom: '16px', maxWidth: '820px', margin: '0 auto 16px' }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.02em' }}>LAZ DARUL HIKAM</div>
        <div style={{ fontWeight: 800, fontSize: '1.4rem', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>{applied.reportType}</div>
        <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
          {isPosisi
            ? `Per ${monthLabel} ${applied.tahun} dan ${monthLabel} ${applied.tahun - 1}`
            : `Untuk Tahun yang Berakhir ${applied.tahun} dan ${applied.tahun - 1}`}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {officeLabel} — Via {VIA_OPTIONS.find(v => v.value === via)?.label}
          {via === 'closing' && (isClosed ? ' (Sudah Ditutup)' : ' (Belum Ditutup — 0,00)')}
        </div>
      </div>

      {/* TABLE */}
      <div className="data-table-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th style={{ textAlign: 'right', background: (via === 'closing' && isPosisi) ? (isClosed ? '#bbf7d0' : '#fbcfe8') : undefined }}>{applied.tahun}</th>
              <th style={{ textAlign: 'right' }}>{applied.tahun - 1}</th>
            </tr>
          </thead>
          <tbody>
            {/* --- MODE 1: POSISI KEUANGAN --- */}
            {isPosisi && posisiRows.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada baris pada template report ini</td></tr>
            )}
            {isPosisi && posisiRows.map(r => (
              <Row key={r.id} label={r.nama} current={r.current} prior={r.prior} bold={r.level === 1} indent={r.level - 1} />
            ))}

            {/* --- MODE 2: PERUBAHAN DANA --- */}
            {applied.reportType === 'Laporan Perubahan Dana' && (() => {
              const totalAkhir = { current: 0, prior: 0 };
              const body = danaCategories.map((cat, idx) => {
                if (cat.groupHeader) return <SectionHeader key={`h-${idx}`} label={cat.groupHeader} />;
                totalAkhir.current += cat.saldoAkhir.current;
                totalAkhir.prior += cat.saldoAkhir.prior;
                const c = gate(cat.saldoAkhir.current);
                return (
                  <React.Fragment key={cat.key}>
                    <SectionHeader label={cat.nama} />
                    <Row label="Penerimaan" bold indent={1} />
                    {cat.penerimaan.map((p, i) => <Row key={i} label={p.nama} current={p.current} prior={p.prior} indent={2} />)}
                    <Row current={cat.totalPenerimaan.current} prior={cat.totalPenerimaan.prior} />
                    <Row label="Penyaluran" bold indent={1} />
                    {cat.penyaluran.map((p, i) => <Row key={i} label={p.nama} current={p.current} prior={p.prior} indent={2} />)}
                    <Row current={cat.totalPenyaluran.current} prior={cat.totalPenyaluran.prior} />
                    <Row label="Surplus (defisit)" italic bold current={cat.surplus.current} prior={cat.surplus.prior} indent={1} />
                    <Row label="SALDO AWAL" bold current={cat.saldoAwal.current} prior={cat.saldoAwal.prior} indent={1} />
                    <Row label="SALDO AKHIR" bold current={c} prior={cat.saldoAkhir.prior} indent={1} />
                  </React.Fragment>
                );
              });
              return (
                <>
                  {body}
                  <SectionHeader label="" />
                  <Row label="JUMLAH SALDO" bold current={gate(totalAkhir.current)} prior={totalAkhir.prior} />
                </>
              );
            })()}

            {/* --- MODE 3: ARUS KAS --- */}
            {applied.reportType === 'Laporan Arus Kas' && (
              <>
                <Row label="Penerimaan dari :" indent={0} />
                <SectionHeader label="ARUS KAS DARI AKTIVITAS OPERASI" />
                {arusKas.operasiPenerimaan.map((p, i) => <Row key={i} label={p.nama} current={p.current} prior={p.prior} indent={1} />)}
                <Row current={arusKas.operasiPenerimaan.reduce((s, p) => s + p.current, 0)} prior={arusKas.operasiPenerimaan.reduce((s, p) => s + p.prior, 0)} />
                <Row label="Pengeluaran untuk :" indent={0} />
                {arusKas.operasiPengeluaran.map((p, i) => <Row key={i} label={p.nama} current={p.current} prior={p.prior} indent={1} />)}
                <Row current={arusKas.operasiPengeluaran.reduce((s, p) => s + p.current, 0)} prior={arusKas.operasiPengeluaran.reduce((s, p) => s + p.prior, 0)} />
                <Row label="Kas Bersih yang diperoleh dari Aktivitas Operasi" bold current={gate(arusKas.kasOperasi.current)} prior={arusKas.kasOperasi.prior} />

                <SectionHeader label="ARUS KAS DARI AKTIVITAS INVESTASI" />
                {arusKas.investasi.map((p, i) => <Row key={i} label={p.nama} current={p.current} prior={p.prior} indent={1} />)}
                <Row label="Kas Bersih yang diperoleh dari Aktivitas Investasi" bold current={gate(arusKas.kasInvestasi.current)} prior={arusKas.kasInvestasi.prior} />

                <SectionHeader label="ARUS KAS DARI AKTIVITAS PENDANAAN" />
                {arusKas.pendanaan.map((p, i) => <Row key={i} label={p.nama} current={p.current} prior={p.prior} indent={1} />)}
                <Row label="Kas Bersih yang diperoleh dari Aktivitas Pendanaan" bold current={gate(arusKas.kasPendanaan.current)} prior={arusKas.kasPendanaan.prior} />

                <SectionHeader label="" />
                <Row label="Kenaikan (Penurunan) Bersih Kas dan Setara Kas" bold current={gate(arusKas.kenaikanBersih.current)} prior={arusKas.kenaikanBersih.prior} />
                <Row label="Kas dan Setara Kas Pada Awal Tahun" bold current={arusKas.kasAwal.current} prior={arusKas.kasAwal.prior} />
                <Row label="Kas dan Setara Kas Pada Akhir Tahun" bold current={gate(arusKas.kasAkhir.current)} prior={arusKas.kasAkhir.prior} />
              </>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '14px', lineHeight: 1.9, maxWidth: '820px', margin: '14px auto 0' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Note :</div>
        {isPosisi ? (
          <div>- Setiap baris dihitung dari rumus di menu <strong>Rumus Report</strong> terhadap saldo akun <strong>Trial Balance</strong> — sinkron dengan <strong>Laporan Bulanan</strong> untuk bulan yang sama.</div>
        ) : (
          <div>- Setiap baris dihitung dari struktur dana PSAK 109 (Zakat, Infaq/Sedekah Terikat & Tidak Terikat, Amil, Hibah, APBN/APBD, Dana Dilarang Syariah, Wakaf, DSKL) — Laporan Perubahan Dana dan Laporan Arus Kas saling terhubung (mis. "Bagian Amil" = total "Penyaluran untuk Amil" di dana lain).</div>
        )}
        <div>- Kolom {applied.tahun - 1} adalah saldo penutupan tahun sebelumnya (baseline).</div>
        {via === 'closing' && <div>- Via <strong>Closing</strong>: kolom {applied.tahun} bernilai 0,00 sampai periode ditutup lewat tombol "Closing".</div>}
      </div>
    </div>
  );
};

export default LaporanKeuangan;
