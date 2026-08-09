import React, { useState, useEffect } from 'react';
import {
  Send, FileCheck, Users, Search, Plus, Filter, CheckCircle, X
} from 'lucide-react';
import { getAccountingData, disburseRequestAction, updateAccountingData, formatRupiah } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const CAMPAIGN_OPTIONS = [
  { value: '1', label: 'Bantuan Darurat Bencana Banjir' },
  { value: '2', label: 'Pembangunan Masjid Pelosok' },
  { value: '3', label: 'Beasiswa Santri Tahfidz' },
  { value: '4', label: 'Wakaf Sumur Air Bersih' },
  { value: '5', label: 'Operasional Panti Asuhan' }
];

const PenyaluranPengajuan = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => setData(getAccountingData());

  useEffect(() => { reloadData(); }, []);

  const openModal = () => {
    setFormFields({
      campaign_id: '1',
      beneficiary_id: data.beneficiaries[0]?.id || '',
      judul: '',
      deskripsi: '',
      jenis_penyaluran: 'transfer',
      jumlah_diajukan: '',
      coa_debet: '501.01.000.000',
      coa_kredit: '101.02.001.000'
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const newReq = {
      id: String(store.disbursementRequests.length + 1),
      nomor_pengajuan: `DSB-2026-000${store.disbursementRequests.length + 1}`,
      judul: formFields.judul,
      deskripsi: formFields.deskripsi,
      campaign_id: parseInt(formFields.campaign_id),
      beneficiary_id: formFields.beneficiary_id,
      jenis_penyaluran: formFields.jenis_penyaluran,
      jumlah_diajukan: parseFloat(formFields.jumlah_diajukan) || 0,
      jumlah_disetujui: parseFloat(formFields.jumlah_diajukan) || 0,
      coa_debet: formFields.coa_debet,
      coa_kredit: formFields.coa_kredit,
      status: 'draft',
      nik_pengaju: 'STF001',
      tgl_pengajuan: new Date().toISOString().substring(0, 10)
    };
    updateAccountingData('laz_disbursement_requests', [newReq, ...store.disbursementRequests]);
    setIsModalOpen(false);
    reloadData();
  };

  const handleStatusChange = (id, status) => {
    const store = getAccountingData();
    const updated = store.disbursementRequests.map(r => r.id === id ? {
      ...r,
      status,
      approved_by: status === 'approved' ? 'MGR001' : r.approved_by,
      tgl_approval: status === 'approved' ? new Date().toISOString() : r.tgl_approval
    } : r);
    updateAccountingData('laz_disbursement_requests', updated);
    reloadData();
  };

  const handleDisburse = (id, coaKredit) => {
    disburseRequestAction(id, coaKredit);
    reloadData();
    alert('Penyaluran berhasil dicairkan! Jurnal transaksi pengeluaran otomatis ditambahkan di modul Keuangan.');
  };

  const totalDiajukan = data.disbursementRequests.reduce((sum, r) => sum + r.jumlah_diajukan, 0);
  const totalRealisasi = data.disbursementRequests.filter(r => r.status === 'disbursed').reduce((sum, r) => sum + (r.jumlah_disetujui || r.jumlah_diajukan), 0);
  const pendingApproval = data.disbursementRequests.filter(r => r.status === 'draft').length;

  const filtered = data.disbursementRequests.filter(r => {
    const matchSearch = r.judul.toLowerCase().includes(searchTerm.toLowerCase()) || r.nomor_pengajuan.includes(searchTerm);
    const matchStatus = filterStatus === 'Semua Status' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Pengajuan Penyaluran</h1>
          <p>Alur pengajuan dana program: draft &rarr; disetujui &rarr; dicairkan, otomatis tertaut ke jurnal Keuangan</p>
        </div>
        <button className="btn btn-primary" onClick={openModal}>
          <Plus size={16} /> Buat Pengajuan
        </button>
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
          <div className="stat-value">{pendingApproval} Pengajuan</div>
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Filter size={16} />
            <SearchableSelect
              options={[
                { value: 'Semua Status', label: 'Semua Status' },
                { value: 'draft', label: 'Draft / Dikirim' },
                { value: 'approved', label: 'Disetujui' },
                { value: 'disbursed', label: 'Dicairkan (Disbursed)' }
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
            />
          </div>
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input type="text" placeholder="Cari..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No Pengajuan</th>
              <th>Judul Program</th>
              <th>Jenis</th>
              <th>Akun Pengeluaran (COA)</th>
              <th style={{ textAlign: 'right' }}>Jumlah</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{r.nomor_pengajuan}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{r.judul}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Diajukan: {r.tgl_pengajuan}</div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{r.jenis_penyaluran}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{r.coa_debet}</span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(r.jumlah_diajukan)}</td>
                <td>
                  <span className={`status-badge ${r.status === 'disbursed' ? 'status-success' : r.status === 'approved' ? 'status-info' : 'status-warning'}`}>
                    {r.status === 'disbursed' ? 'DICAIRKAN' : r.status === 'approved' ? 'DISETUJUI' : 'DRAFT'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {r.status === 'draft' && (
                      <CheckCircle size={18} color="#10b981" title="Setujui" onClick={() => handleStatusChange(r.id, 'approved')} style={{ cursor: 'pointer' }} />
                    )}
                    {r.status === 'approved' && (
                      <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDisburse(r.id, r.coa_kredit)}>
                        Cairkan Dana
                      </button>
                    )}
                    {r.status === 'disbursed' && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Terhubung ke Transaksi Keuangan</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ width: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Buat Pengajuan Penyaluran</h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Judul Program Penyaluran</label>
                    <input type="text" required className="form-input" value={formFields.judul || ''} onChange={e => setFormFields({ ...formFields, judul: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label>Kampanye / Campaign</label>
                    <SearchableSelect options={CAMPAIGN_OPTIONS} value={formFields.campaign_id} onChange={val => setFormFields({ ...formFields, campaign_id: val })} />
                  </div>
                  <div className="form-group full-width">
                    <label>Penerima Manfaat</label>
                    <SearchableSelect
                      options={data.beneficiaries.map(b => ({ value: b.id, label: `${b.nama_lengkap} (${b.kode_beneficiary})` }))}
                      value={formFields.beneficiary_id}
                      onChange={val => setFormFields({ ...formFields, beneficiary_id: val })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Jenis Penyaluran</label>
                    <SearchableSelect
                      options={[
                        { value: 'transfer', label: 'Transfer Bank' },
                        { value: 'tunai', label: 'Kas Tunai' },
                        { value: 'barang', label: 'Sembako / Barang' }
                      ]}
                      value={formFields.jenis_penyaluran}
                      onChange={val => setFormFields({ ...formFields, jenis_penyaluran: val })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Jumlah Diajukan (Rp)</label>
                    <input type="number" required className="form-input" value={formFields.jumlah_diajukan || ''} onChange={e => setFormFields({ ...formFields, jumlah_diajukan: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>COA Debet (Beban)</label>
                    <SearchableSelect
                      options={[
                        { value: '501.01.000.000', label: '501.01 (Penyaluran Kesehatan)' },
                        { value: '501.02.000.000', label: '501.02 (Penyaluran Kemanusiaan)' },
                        { value: '501.03.000.000', label: '501.03 (Penyaluran Pangan)' },
                        { value: '501.05.000.000', label: '501.05 (Penyaluran Zakat)' }
                      ]}
                      value={formFields.coa_debet}
                      onChange={val => setFormFields({ ...formFields, coa_debet: val })}
                    />
                  </div>
                  <div className="form-group">
                    <label>COA Kredit (Bank)</label>
                    <SearchableSelect
                      options={[
                        { value: '101.02.001.000', label: '101.02.001 (BCA)' },
                        { value: '101.02.002.000', label: '101.02.002 (Mandiri)' },
                        { value: '101.01.001.000', label: '101.01.001 (Kas Pusat)' }
                      ]}
                      value={formFields.coa_kredit}
                      onChange={val => setFormFields({ ...formFields, coa_kredit: val })}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Deskripsi</label>
                    <textarea className="form-textarea" value={formFields.deskripsi || ''} onChange={e => setFormFields({ ...formFields, deskripsi: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenyaluranPengajuan;
