import React, { useState, useEffect, useMemo } from 'react';
import { Send, FileCheck, Users, MapPin, ClipboardCheck } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';
import MapView from '../components/MapView';

const STATUS_COLOR = { draft: '#d97706', approved: '#0ea5e9', disbursed: '#10b981' };

const PenyaluranDashboard = () => {
  const [data, setData] = useState(() => getAccountingData());
  useEffect(() => { setData(getAccountingData()); }, []);

  const totalDiajukan = data.disbursementRequests.reduce((sum, r) => sum + r.jumlah_diajukan, 0);
  const totalRealisasi = data.disbursementRequests.filter(r => r.status === 'disbursed').reduce((sum, r) => sum + (r.jumlah_disetujui || r.jumlah_diajukan), 0);
  const draftCount = data.disbursementRequests.filter(r => r.status === 'draft').length;
  const lpjBelumSelesai = data.disbursementRequests.filter(r => r.status === 'disbursed').length -
    data.laporanPertanggungjawaban.filter(l => l.status === 'disetujui').length;

  const mapPoints = useMemo(() => data.disbursementRequests
    .map(r => {
      const b = data.beneficiaries.find(x => x.id === r.beneficiary_id);
      if (!b || typeof b.lat !== 'number' || typeof b.lng !== 'number') return null;
      return {
        id: r.id,
        lat: b.lat,
        lng: b.lng,
        color: STATUS_COLOR[r.status] || '#64748b',
        label: `<strong>${b.nama_lengkap}</strong><br/>${r.judul}<br/>${formatRupiah(r.jumlah_disetujui || r.jumlah_diajukan)}`
      };
    })
    .filter(Boolean), [data]);

  const recentRequests = [...data.disbursementRequests]
    .sort((a, b) => (b.tgl_pengajuan || '').localeCompare(a.tgl_pengajuan || ''))
    .slice(0, 6);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard Penyaluran</h1>
          <p>Ringkasan pengajuan, realisasi dana, dan sebaran titik penyaluran program</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><Send size={20} /></div>
            <div className="stat-title">Total Diajukan</div>
          </div>
          <div className="stat-value">{formatRupiah(totalDiajukan)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}><FileCheck size={20} /></div>
            <div className="stat-title">Total Realisasi (Cair)</div>
          </div>
          <div className="stat-value">{formatRupiah(totalRealisasi)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}><Users size={20} /></div>
            <div className="stat-title">Draft Pengajuan</div>
          </div>
          <div className="stat-value">{draftCount} Pengajuan</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#e11d48' }}><ClipboardCheck size={20} /></div>
            <div className="stat-title">LPJ Belum Selesai</div>
          </div>
          <div className="stat-value">{Math.max(0, lpjBelumSelesai)} Penyaluran</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0d9488' }}><MapPin size={20} /></div>
            <div className="stat-title">Titik Lokasi Aktif</div>
          </div>
          <div className="stat-value">{mapPoints.length} Titik</div>
        </div>
      </div>

      <MapView points={mapPoints} height="360px" />

      <div className="data-table-container" style={{ marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>No Pengajuan</th>
              <th>Judul Program</th>
              <th>Tanggal</th>
              <th style={{ textAlign: 'right' }}>Jumlah</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentRequests.map((r, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{r.nomor_pengajuan}</td>
                <td>{r.judul}</td>
                <td>{r.tgl_pengajuan}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(r.jumlah_diajukan)}</td>
                <td>
                  <span className={`status-badge ${r.status === 'disbursed' ? 'status-success' : r.status === 'approved' ? 'status-info' : 'status-warning'}`}>
                    {r.status === 'disbursed' ? 'DICAIRKAN' : r.status === 'approved' ? 'DISETUJUI' : 'DRAFT'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PenyaluranDashboard;
