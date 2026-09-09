import React, { useEffect, useMemo, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const STATUS_LABEL = { draft: 'DRAFT', approved: 'DISETUJUI', disbursed: 'DICAIRKAN' };
const STATUS_CLASS = { draft: 'status-warning', approved: 'status-info', disbursed: 'status-success' };

const ListPenyaluran = () => {
  const [data, setData] = useState(() => getAccountingData());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [filterJenis, setFilterJenis] = useState('Semua Jenis');

  useEffect(() => { setData(getAccountingData()); }, []);

  const rows = useMemo(() => data.disbursementRequests
    .map(r => {
      const b = data.beneficiaries.find(x => x.id === r.beneficiary_id);
      const trans = data.pengeluaran.find(p => p.id === r.fins_trans_id);
      return { ...r, beneficiaryName: b?.nama_lengkap || '-', beneficiaryKode: b?.kode_beneficiary || '', trans };
    })
    .filter(r => {
      const matchSearch = r.judul.toLowerCase().includes(searchTerm.toLowerCase())
        || r.nomor_pengajuan.toLowerCase().includes(searchTerm.toLowerCase())
        || r.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'Semua Status' || r.status === filterStatus;
      const matchJenis = filterJenis === 'Semua Jenis' || r.jenis_penyaluran === filterJenis;
      return matchSearch && matchStatus && matchJenis;
    })
    .sort((a, b) => (b.tgl_pengajuan || '').localeCompare(a.tgl_pengajuan || '')), [data, searchTerm, filterStatus, filterJenis]);

  const totalNominal = rows.reduce((sum, r) => sum + (r.jumlah_disetujui || r.jumlah_diajukan), 0);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>List Penyaluran</h1>
          <p>Daftar seluruh riwayat penyaluran dana — baik hasil Entry Penyaluran langsung maupun alur Pengajuan Penyaluran</p>
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
            <Filter size={16} />
            <SearchableSelect
              options={[
                { value: 'Semua Jenis', label: 'Semua Jenis' },
                { value: 'transfer', label: 'Transfer Bank' },
                { value: 'tunai', label: 'Kas Tunai' },
                { value: 'barang', label: 'Sembako / Barang' }
              ]}
              value={filterJenis}
              onChange={setFilterJenis}
            />
          </div>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input type="text" placeholder="Cari no pengajuan, judul, atau penerima..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No Pengajuan</th>
              <th>Judul Program</th>
              <th>Penerima Manfaat</th>
              <th>Jenis</th>
              <th>Tanggal</th>
              <th style={{ textAlign: 'right' }}>Jumlah</th>
              <th>Status</th>
              <th>Transaksi Keuangan</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada data penyaluran yang cocok dengan filter</td></tr>
            )}
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{r.nomor_pengajuan}</td>
                <td style={{ fontWeight: 500 }}>{r.judul}</td>
                <td>{r.beneficiaryName} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{r.beneficiaryKode}</span></td>
                <td style={{ textTransform: 'capitalize' }}>{r.jenis_penyaluran}</td>
                <td>{r.tgl_realisasi ? new Date(r.tgl_realisasi).toLocaleDateString('id-ID') : r.tgl_pengajuan}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(r.jumlah_disetujui || r.jumlah_diajukan)}</td>
                <td>
                  <span className={`status-badge ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status] || r.status}</span>
                </td>
                <td style={{ fontSize: '0.75rem' }}>
                  {r.trans ? <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{r.trans.id_trans}</span> : '-'}
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={5} style={{ textAlign: 'right', fontWeight: 700 }}>Total:</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatRupiah(totalNominal)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
};

export default ListPenyaluran;
