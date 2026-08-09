import React, { useState, useEffect } from 'react';
import { Send, Search } from 'lucide-react';
import { getAccountingData, updateAccountingData, formatRupiah } from '../utils/accountingStore';

const DistribusiMassal = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());
  const [selectedIds, setSelectedIds] = useState([]);
  const [nominal, setNominal] = useState('');

  const reloadData = () => setData(getAccountingData());
  useEffect(() => { reloadData(); }, []);

  const toggleSelection = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = data.beneficiaries.filter(b => b.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()));

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(b => b.id));
    }
  };

  const handleSalurkanMassal = () => {
    const nom = parseFloat(nominal) || 0;
    if (selectedIds.length === 0 || nom <= 0) return;
    if (!window.confirm(`Buat ${selectedIds.length} pengajuan penyaluran massal @ ${formatRupiah(nom)}/penerima?`)) return;

    const store = getAccountingData();
    const selected = store.beneficiaries.filter(b => selectedIds.includes(b.id));
    const newRequests = selected.map((b, i) => ({
      id: String(store.disbursementRequests.length + i + 1),
      nomor_pengajuan: `DSB-2026-000${store.disbursementRequests.length + i + 1}`,
      judul: `Penyaluran Massal - ${b.nama_lengkap}`,
      deskripsi: `Penyaluran dana program massal untuk ${b.nama_lengkap}`,
      campaign_id: b.campaign_id || 1,
      beneficiary_id: b.id,
      jenis_penyaluran: 'transfer',
      jumlah_diajukan: nom,
      jumlah_disetujui: nom,
      coa_debet: '501.01.000.000',
      coa_kredit: '101.02.001.000',
      status: 'draft',
      nik_pengaju: 'STF001',
      tgl_pengajuan: new Date().toISOString().substring(0, 10)
    }));

    updateAccountingData('laz_disbursement_requests', [...newRequests, ...store.disbursementRequests]);
    setSelectedIds([]);
    setNominal('');
    reloadData();
    alert(`${newRequests.length} pengajuan penyaluran massal berhasil dibuat sebagai draft. Setujui & cairkan di menu Pengajuan Penyaluran.`);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Distribusi Massal</h1>
          <p>Buat pengajuan penyaluran ke banyak penerima manfaat sekaligus dengan nominal yang sama</p>
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <label style={{ fontSize: '0.875rem', fontWeight: 500, marginRight: '8px' }}>Nominal per Penerima (Rp)</label>
          <input
            type="number"
            placeholder="mis. 500000"
            className="form-input"
            style={{ width: '180px' }}
            value={nominal}
            onChange={e => setNominal(e.target.value)}
          />
          <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '12px' }}>{selectedIds.length} penerima dipilih</span>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input type="text" placeholder="Cari..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button
            className="btn btn-primary"
            disabled={selectedIds.length === 0 || !(parseFloat(nominal) > 0)}
            style={{ opacity: (selectedIds.length === 0 || !(parseFloat(nominal) > 0)) ? 0.5 : 1 }}
            onClick={handleSalurkanMassal}
          >
            <Send size={16} /> Salurkan Massal
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleSelectAll} />
              </th>
              <th>Kode</th>
              <th>Nama Penerima</th>
              <th>Kategori</th>
              <th>Ekonomi</th>
              <th>Wilayah</th>
              <th>Status Verifikasi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, idx) => (
              <tr key={idx}>
                <td>
                  <input type="checkbox" checked={selectedIds.includes(b.id)} onChange={() => toggleSelection(b.id)} />
                </td>
                <td style={{ fontFamily: 'monospace' }}>{b.kode_beneficiary}</td>
                <td style={{ fontWeight: 500 }}>{b.nama_lengkap}</td>
                <td style={{ textTransform: 'capitalize' }}>{b.kategori}</td>
                <td style={{ textTransform: 'capitalize' }}>{b.status_ekonomi.replace('_', ' ')}</td>
                <td>{b.kelurahan}, {b.kecamatan}, {b.kabupaten}</td>
                <td>
                  <span className={`status-badge ${b.status_verifikasi === 'verified' ? 'status-success' : 'status-warning'}`}>
                    {b.status_verifikasi === 'verified' ? 'TERVERIFIKASI' : 'UNVERIFIED'}
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

export default DistribusiMassal;
