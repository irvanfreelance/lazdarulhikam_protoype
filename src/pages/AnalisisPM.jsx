import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserCheck, Building2, MapPin, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';
import { HBarList } from '../components/charts/SimpleCharts';

const STATUS_EKONOMI_LABELS = { fakir: 'Fakir', miskin: 'Miskin', sangat_miskin: 'Sangat Miskin', lainnya: 'Lainnya' };

const AnalisisPM = () => {
  const [data, setData] = useState(() => getAccountingData());
  useEffect(() => { setData(getAccountingData()); }, []);

  const [kategori, setKategori] = useState('');
  const [verifikasi, setVerifikasi] = useState('');
  const [kabupaten, setKabupaten] = useState('');

  const kabupatenOptions = useMemo(() => [...new Set(data.beneficiaries.map(b => b.kabupaten).filter(Boolean))].sort(), [data]);

  const resetAll = () => { setKategori(''); setVerifikasi(''); setKabupaten(''); };

  const scoped = useMemo(() => data.beneficiaries.filter(b =>
    (!kategori || b.kategori === kategori)
    && (!verifikasi || b.status_verifikasi === verifikasi)
    && (!kabupaten || b.kabupaten === kabupaten)
  ), [data, kategori, verifikasi, kabupaten]);

  const totalPM = scoped.length;
  const verifiedCount = scoped.filter(b => b.status_verifikasi === 'verified').length;
  const verifiedPct = totalPM > 0 ? (verifiedCount / totalPM) * 100 : 0;
  const individuCount = scoped.filter(b => b.kategori === 'individu').length;
  const lembagaCount = scoped.filter(b => b.kategori === 'lembaga').length;

  const wilayahTerbanyak = useMemo(() => {
    const groups = {};
    scoped.forEach(b => { if (b.kabupaten) groups[b.kabupaten] = (groups[b.kabupaten] || 0) + 1; });
    const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? `${sorted[0][0]} (${sorted[0][1]})` : '-';
  }, [scoped]);

  const byKategori = useMemo(() => [
    { label: 'Individu', value: individuCount },
    { label: 'Lembaga', value: lembagaCount }
  ], [individuCount, lembagaCount]);

  const byStatusEkonomi = useMemo(() => {
    const groups = {};
    scoped.forEach(b => { groups[b.status_ekonomi] = (groups[b.status_ekonomi] || 0) + 1; });
    return Object.entries(groups).map(([k, v]) => ({ label: STATUS_EKONOMI_LABELS[k] || k, value: v })).sort((a, b) => b.value - a.value);
  }, [scoped]);

  const byWilayah = useMemo(() => {
    const groups = {};
    scoped.forEach(b => { if (b.kabupaten) groups[b.kabupaten] = (groups[b.kabupaten] || 0) + 1; });
    return Object.entries(groups).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [scoped]);

  const pmTable = useMemo(() => {
    const scopedIds = new Set(scoped.map(b => b.id));
    return scoped.map(b => {
      const reqs = data.disbursementRequests.filter(r => r.beneficiary_id === b.id);
      const campaigns = new Set(reqs.map(r => r.campaign_id));
      const totalBantuan = reqs.filter(r => r.status === 'disbursed').reduce((s, r) => s + (r.jumlah_disetujui || r.jumlah_diajukan), 0);
      return {
        ...b,
        jumlahPengajuan: reqs.length,
        jumlahCampaign: campaigns.size,
        totalBantuan,
        multiProgram: campaigns.size > 1
      };
    }).filter(b => scopedIds.has(b.id));
  }, [scoped, data]);

  const multiProgramPM = pmTable.filter(p => p.multiProgram);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            Analisis PM
            <RefreshCw size={18} color="#64748b" style={{ cursor: 'pointer' }} title="Reset filter" onClick={resetAll} />
          </h1>
          <p>Profil dan distribusi wilayah Penerima Manfaat (PM)</p>
        </div>
        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} title="Cetak" onClick={() => window.print()}>
          <ExternalLink size={16} />
        </button>
      </div>

      <div className="filters-row" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
        <div className="filters-left" style={{ flexWrap: 'wrap', rowGap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Kategori:</span>
          <select className="form-select" style={{ width: 'auto' }} value={kategori} onChange={e => setKategori(e.target.value)}>
            <option value="">Semua</option>
            <option value="individu">Individu</option>
            <option value="lembaga">Lembaga</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Verifikasi:</span>
          <select className="form-select" style={{ width: 'auto' }} value={verifikasi} onChange={e => setVerifikasi(e.target.value)}>
            <option value="">Semua</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Kabupaten:</span>
          <select className="form-select" style={{ width: 'auto' }} value={kabupaten} onChange={e => setKabupaten(e.target.value)}>
            <option value="">Semua</option>
            {kabupatenOptions.map(k => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Users size={20} /></div>
            <div className="stat-title">Total Penerima Manfaat</div>
          </div>
          <div className="stat-value">{totalPM}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><UserCheck size={20} /></div>
            <div className="stat-title">Terverifikasi</div>
          </div>
          <div className="stat-value">{verifiedPct.toFixed(0)}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Building2 size={20} /></div>
            <div className="stat-title">Individu / Lembaga</div>
          </div>
          <div className="stat-value">{individuCount} / {lembagaCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#db2777' }}><MapPin size={20} /></div>
            <div className="stat-title">Wilayah Terbanyak</div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>{wilayahTerbanyak}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Individu vs Lembaga</div>
          <HBarList data={byKategori} />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Status Ekonomi</div>
          <HBarList data={byStatusEkonomi} color="#eb6834" />
        </div>
        <div className="data-table-container">
          <div style={{ fontWeight: 700, padding: '4px 4px 16px' }}>Per Wilayah (Kabupaten)</div>
          <HBarList data={byWilayah} color="#1baf7a" />
        </div>
      </div>

      {multiProgramPM.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#92400e' }}>
          <AlertTriangle size={18} />
          {multiProgramPM.length} PM menerima bantuan dari lebih dari 1 program — periksa potensi duplikasi/overlap bantuan.
        </div>
      )}

      <div className="data-table-container">
        <div style={{ fontWeight: 700, padding: '8px 4px 14px' }}>Daftar Penerima Manfaat</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode PM</th>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Wilayah</th>
                <th>Verifikasi</th>
                <th style={{ textAlign: 'right' }}>Jml Pengajuan</th>
                <th style={{ textAlign: 'right' }}>Jml Program</th>
                <th style={{ textAlign: 'right' }}>Total Bantuan</th>
              </tr>
            </thead>
            <tbody>
              {pmTable.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data</td></tr>
              )}
              {pmTable.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{p.kode_beneficiary}</td>
                  <td style={{ fontWeight: 500 }}>{p.nama_lengkap}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.kategori}</td>
                  <td>{p.kabupaten}, {p.provinsi}</td>
                  <td>
                    <span className={`status-badge ${p.status_verifikasi === 'verified' ? 'status-success' : 'status-warning'}`}>{p.status_verifikasi}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>{p.jumlahPengajuan}</td>
                  <td style={{ textAlign: 'right', fontWeight: p.multiProgram ? 700 : 400, color: p.multiProgram ? '#d97706' : 'inherit' }}>{p.jumlahCampaign}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(p.totalBantuan)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalisisPM;
