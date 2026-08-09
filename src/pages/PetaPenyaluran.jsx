import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';
import MapView from '../components/MapView';

const STATUS_COLOR = {
  draft: '#d97706',
  approved: '#0ea5e9',
  disbursed: '#10b981'
};

const STATUS_LABEL = {
  draft: 'DRAFT',
  approved: 'DISETUJUI',
  disbursed: 'DICAIRKAN'
};

const PetaPenyaluran = () => {
  const [data, setData] = useState(() => getAccountingData());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [selectedPointId, setSelectedPointId] = useState(null);

  useEffect(() => { setData(getAccountingData()); }, []);

  const kabupatenOptions = useMemo(() => {
    const distinct = [...new Set(data.beneficiaries.map(b => b.kabupaten).filter(Boolean))];
    return [{ value: 'Semua Wilayah', label: 'Semua Wilayah' }, ...distinct.map(k => ({ value: k, label: k }))];
  }, [data.beneficiaries]);
  const [filterWilayah, setFilterWilayah] = useState('Semua Wilayah');

  const titikPenyaluran = useMemo(() => {
    return data.disbursementRequests
      .map(r => {
        const b = data.beneficiaries.find(x => x.id === r.beneficiary_id);
        if (!b || typeof b.lat !== 'number' || typeof b.lng !== 'number') return null;
        return {
          id: r.id,
          nomor_pengajuan: r.nomor_pengajuan,
          judul: r.judul,
          status: r.status,
          jumlah: r.jumlah_disetujui || r.jumlah_diajukan,
          jenis_penyaluran: r.jenis_penyaluran,
          nama_penerima: b.nama_lengkap,
          kode_beneficiary: b.kode_beneficiary,
          kabupaten: b.kabupaten,
          lat: b.lat,
          lng: b.lng
        };
      })
      .filter(Boolean)
      .filter(p => {
        const matchSearch = p.nama_penerima.toLowerCase().includes(searchTerm.toLowerCase()) || p.judul.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'Semua Status' || p.status === filterStatus;
        const matchWilayah = filterWilayah === 'Semua Wilayah' || p.kabupaten === filterWilayah;
        return matchSearch && matchStatus && matchWilayah;
      });
  }, [data, searchTerm, filterStatus, filterWilayah]);

  const mapPoints = titikPenyaluran.map(p => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    color: STATUS_COLOR[p.status] || '#64748b',
    label: `<strong>${p.nama_penerima}</strong><br/>${p.judul}<br/>${formatRupiah(p.jumlah)} &middot; ${STATUS_LABEL[p.status] || p.status}`,
    onClick: (pt) => setSelectedPointId(pt.id)
  }));

  const tanpaLokasiCount = data.disbursementRequests.length - titikPenyaluran.length;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Peta Penyaluran</h1>
          <p>Sebaran titik lokasi penyaluran dana program berdasarkan koordinat penerima manfaat</p>
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Filter size={16} />
            <SearchableSelect
              options={[
                { value: 'Semua Status', label: 'Semua Status' },
                { value: 'draft', label: 'Draft' },
                { value: 'approved', label: 'Disetujui' },
                { value: 'disbursed', label: 'Dicairkan' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </div>
          <div className="filter-input">
            <MapPin size={16} />
            <SearchableSelect options={kabupatenOptions} value={filterWilayah} onChange={setFilterWilayah} />
          </div>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input type="text" placeholder="Cari nama/program..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLOR.draft, display: 'inline-block' }} /> Draft</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLOR.approved, display: 'inline-block' }} /> Disetujui</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLOR.disbursed, display: 'inline-block' }} /> Dicairkan</span>
        <span>&middot; {titikPenyaluran.length} titik ditampilkan{tanpaLokasiCount > 0 ? `, ${tanpaLokasiCount} pengajuan belum punya titik lokasi` : ''}</span>
      </div>

      <MapView points={mapPoints} height="480px" />

      <div className="data-table-container" style={{ marginTop: '20px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>No Pengajuan</th>
              <th>Penerima</th>
              <th>Wilayah</th>
              <th style={{ textAlign: 'right' }}>Jumlah</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {titikPenyaluran.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada titik penyaluran yang cocok dengan filter</td></tr>
            )}
            {titikPenyaluran.map((p, idx) => (
              <tr key={idx} style={selectedPointId === p.id ? { background: '#f0fdfa' } : undefined}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{p.nomor_pengajuan}</td>
                <td style={{ fontWeight: 500 }}>{p.nama_penerima} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({p.kode_beneficiary})</span></td>
                <td>{p.kabupaten}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(p.jumlah)}</td>
                <td>
                  <span className="status-badge" style={{ background: `${STATUS_COLOR[p.status]}20`, color: STATUS_COLOR[p.status] }}>
                    {STATUS_LABEL[p.status] || p.status}
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

export default PetaPenyaluran;
