import React, { useState, useEffect } from 'react';
import { 
  Send, Users, FileCheck, Image, Search, Plus, Filter, Eye, CheckCircle, XCircle, Trash2, X, Download
} from 'lucide-react';
import { getAccountingData, disburseRequestAction, updateAccountingData, formatRupiah } from '../utils/accountingStore';

const PenyaluranDana = () => {
  const [activeTab, setActiveTab] = useState('Pengajuan');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formFields, setFormFields] = useState({});

  // Penerima Massal state
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState([]);
  const [massalNominal, setMassalNominal] = useState('');

  // Store data
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  // Form helpers
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);
    
    if (type.includes('add')) {
      if (type === 'request_add') {
        setFormFields({
          campaign_id: '1',
          beneficiary_id: '1',
          judul: '',
          deskripsi: '',
          jenis_penyaluran: 'transfer',
          jumlah_diajukan: '',
          coa_debet: '501.01.000.000',
          coa_kredit: '101.02.001.000'
        });
      } else if (type === 'beneficiary_add') {
        setFormFields({
          nama_lengkap: '',
          nik: '',
          kategori: 'individu',
          status_ekonomi: 'miskin',
          kelurahan: '',
          kecamatan: '',
          kabupaten: 'Bogor',
          provinsi: 'Jawa Barat'
        });
      } else if (type === 'bukti_add') {
        const disbursed = data.disbursementRequests.filter(r => r.status === 'disbursed');
        setFormFields({
          disbursement_id: disbursed[0]?.id || '',
          keterangan: '',
          filename: ''
        });
      }
    } else if (type.includes('edit') && item) {
      setFormFields({ ...item });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();

    if (modalType === 'request_add') {
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
      const updated = [newReq, ...store.disbursementRequests];
      updateAccountingData('laz_disbursement_requests', updated);
    } else if (modalType === 'beneficiary_add') {
      const newBen = {
        id: String(store.beneficiaries.length + 1),
        kode_beneficiary: `BNF-2026-000${store.beneficiaries.length + 1}`,
        nama_lengkap: formFields.nama_lengkap,
        nik: formFields.nik,
        kategori: formFields.kategori,
        status_ekonomi: formFields.status_ekonomi,
        kelurahan: formFields.kelurahan,
        kecamatan: formFields.kecamatan,
        kabupaten: formFields.kabupaten,
        provinsi: formFields.provinsi,
        status_verifikasi: 'unverified',
        created_at: new Date().toISOString()
      };
      const updated = [...store.beneficiaries, newBen];
      updateAccountingData('laz_beneficiaries', updated);
    } else if (modalType === 'bukti_add') {
      const newBukti = {
        id: String(store.buktiRealisasi.length + 1),
        disbursement_id: formFields.disbursement_id,
        keterangan: formFields.keterangan,
        filename: formFields.filename,
        uploaded_at: new Date().toISOString()
      };
      updateAccountingData('laz_bukti_realisasi', [newBukti, ...store.buktiRealisasi]);
    }

    setIsModalOpen(false);
    reloadData();
  };

  const handleStatusChange = (id, status) => {
    const store = getAccountingData();
    const updated = store.disbursementRequests.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: status,
          approved_by: status === 'approved' ? 'MGR001' : r.approved_by,
          tgl_approval: status === 'approved' ? new Date().toISOString() : r.tgl_approval
        };
      }
      return r;
    });
    updateAccountingData('laz_disbursement_requests', updated);
    reloadData();
  };

  const handleDisburse = (id, coaKredit) => {
    disburseRequestAction(id, coaKredit);
    reloadData();
    alert('Penyaluran berhasil dicairkan! Jurnal transaksi pengeluaran otomatis ditambahkan.');
  };

  const toggleBeneficiarySelection = (id) => {
    setSelectedBeneficiaryIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAllBeneficiaries = () => {
    if (selectedBeneficiaryIds.length === data.beneficiaries.length) {
      setSelectedBeneficiaryIds([]);
    } else {
      setSelectedBeneficiaryIds(data.beneficiaries.map(b => b.id));
    }
  };

  const handleSalurkanMassal = () => {
    const nominal = parseFloat(massalNominal) || 0;
    if (selectedBeneficiaryIds.length === 0 || nominal <= 0) return;
    if (!window.confirm(`Buat ${selectedBeneficiaryIds.length} pengajuan penyaluran massal @ ${formatRupiah(nominal)}/penerima?`)) return;

    const store = getAccountingData();
    const selectedBeneficiaries = store.beneficiaries.filter(b => selectedBeneficiaryIds.includes(b.id));
    const newRequests = selectedBeneficiaries.map((b, i) => ({
      id: String(store.disbursementRequests.length + i + 1),
      nomor_pengajuan: `DSB-2026-000${store.disbursementRequests.length + i + 1}`,
      judul: `Penyaluran Massal - ${b.nama_lengkap}`,
      deskripsi: `Penyaluran dana program massal untuk ${b.nama_lengkap}`,
      campaign_id: b.campaign_id || 1,
      beneficiary_id: b.id,
      jenis_penyaluran: 'transfer',
      jumlah_diajukan: nominal,
      jumlah_disetujui: nominal,
      coa_debet: '501.01.000.000',
      coa_kredit: '101.02.001.000',
      status: 'draft',
      nik_pengaju: 'STF001',
      tgl_pengajuan: new Date().toISOString().substring(0, 10)
    }));

    updateAccountingData('laz_disbursement_requests', [...newRequests, ...store.disbursementRequests]);
    setSelectedBeneficiaryIds([]);
    setMassalNominal('');
    reloadData();
    alert(`${newRequests.length} pengajuan penyaluran massal berhasil dibuat sebagai draft.`);
  };

  // Stats calculation
  const totalDiajukan = data.disbursementRequests.reduce((sum, r) => sum + r.jumlah_diajukan, 0);
  const totalRealisasi = data.disbursementRequests.filter(r => r.status === 'disbursed').reduce((sum, r) => sum + (r.jumlah_disetujui || r.jumlah_diajukan), 0);
  const pendingApproval = data.disbursementRequests.filter(r => r.status === 'draft').length;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Penyaluran Dana Program</h1>
          <p>Workflow pengajuan penyaluran donasi dan manajemen penerima manfaat (beneficiaries)</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => {
            if (activeTab === 'Pengajuan') openModal('request_add');
            else if (activeTab === 'Penerima Manfaat') openModal('beneficiary_add');
          }}>
            <Plus size={16} /> {activeTab === 'Pengajuan' ? 'Buat Pengajuan' : 'Tambah Penerima'}
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Send size={20} />
            </div>
            <div className="stat-title">Total Diajukan</div>
          </div>
          <div className="stat-value">{formatRupiah(totalDiajukan)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <FileCheck size={20} />
            </div>
            <div className="stat-title">Total Realisasi (Cair)</div>
          </div>
          <div className="stat-value">{formatRupiah(totalRealisasi)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Users size={20} />
            </div>
            <div className="stat-title">Draft Pengajuan</div>
          </div>
          <div className="stat-value">{pendingApproval} Pengajuan</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Pengajuan', 'Penerima Manfaat', 'Penerima Massal', 'Bukti Realisasi'].map(tab => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setSearchTerm(''); }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* FILTERS */}
      <div className="filters-row">
        <div className="filters-left">
          {activeTab === 'Pengajuan' && (
            <div className="filter-input">
              <Filter size={16} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option>Semua Status</option>
                <option value="draft">Draft / Dikirim</option>
                <option value="approved">Disetujui</option>
                <option value="disbursed">Dicairkan (Disbursed)</option>
              </select>
            </div>
          )}
        </div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Cari..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="data-table-container">
        {activeTab === 'Pengajuan' && (
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
              {data.disbursementRequests
                .filter(r => {
                  const matchSearch = r.judul.toLowerCase().includes(searchTerm.toLowerCase()) || r.nomor_pengajuan.includes(searchTerm);
                  const matchStatus = filterStatus === 'Semua Status' || r.status === filterStatus;
                  return matchSearch && matchStatus;
                })
                .map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{r.nomor_pengajuan}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.judul}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Diajukan: {r.tgl_pengajuan}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{r.jenis_penyaluran}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                        {r.coa_debet}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(r.jumlah_diajukan)}</td>
                    <td>
                      <span className={`status-badge ${
                        r.status === 'disbursed' ? 'status-success' : 
                        r.status === 'approved' ? 'status-info' : 'status-warning'
                      }`}>
                        {r.status === 'disbursed' ? 'DICAIRKAN' : r.status === 'approved' ? 'DISETUJUI' : 'DRAFT'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {r.status === 'draft' && (
                          <CheckCircle size={18} color="#10b981" title="Setujui" onClick={() => handleStatusChange(r.id, 'approved')} />
                        )}
                        {r.status === 'approved' && (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDisburse(r.id, r.coa_kredit)}>
                            Cairkan Dana
                          </button>
                        )}
                        {r.status === 'disbursed' && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Linked to Financial Trans</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Penerima Manfaat' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Lengkap</th>
                <th>NIK</th>
                <th>Kategori</th>
                <th>Ekonomi</th>
                <th>Wilayah</th>
                <th>Status Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {data.beneficiaries
                .filter(b => b.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((b, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace' }}>{b.kode_beneficiary}</td>
                    <td style={{ fontWeight: 500 }}>{b.nama_lengkap}</td>
                    <td>{b.nik || '-'}</td>
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
        )}

        {activeTab === 'Penerima Massal' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Nominal per Penerima (Rp)</label>
              <input
                type="number"
                placeholder="mis. 500000"
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', width: '180px' }}
                value={massalNominal}
                onChange={e => setMassalNominal(e.target.value)}
              />
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedBeneficiaryIds.length} penerima dipilih</span>
              <div style={{ marginLeft: 'auto' }}>
                <button
                  className="btn btn-primary"
                  disabled={selectedBeneficiaryIds.length === 0 || !(parseFloat(massalNominal) > 0)}
                  style={{ opacity: (selectedBeneficiaryIds.length === 0 || !(parseFloat(massalNominal) > 0)) ? 0.5 : 1 }}
                  onClick={handleSalurkanMassal}
                >
                  <Send size={16} /> Salurkan Massal
                </button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={data.beneficiaries.length > 0 && selectedBeneficiaryIds.length === data.beneficiaries.length}
                      onChange={toggleSelectAllBeneficiaries}
                    />
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
                {data.beneficiaries
                  .filter(b => b.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((b, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedBeneficiaryIds.includes(b.id)}
                          onChange={() => toggleBeneficiarySelection(b.id)}
                        />
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
        )}

        {activeTab === 'Bukti Realisasi' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '10px' }}>
            {data.buktiRealisasi.map((b, idx) => {
              const req = data.disbursementRequests.find(r => r.id === b.disbursement_id);
              return (
                <div key={idx} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <div style={{ height: '160px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image size={40} color="#94a3b8" />
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>{req?.judul || 'Penyaluran'}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>{b.keterangan}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <span>{b.filename}</span>
                      <span>{new Date(b.uploaded_at).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div
              onClick={() => openModal('bukti_add')}
              style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '260px', borderStyle: 'dashed', cursor: 'pointer' }}
            >
              <Plus size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Upload Bukti Foto/Dokumen Baru</span>
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {modalType === 'request_add' && 'Buat Pengajuan Penyaluran'}
                {modalType === 'beneficiary_add' && 'Tambah Penerima Manfaat'}
                {modalType === 'bukti_add' && 'Rekam Bukti Realisasi'}
              </h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSave}>
              {modalType === 'bukti_add' ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Pengajuan Penyaluran (yang sudah dicairkan)</label>
                    <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.disbursement_id || ''} onChange={e => setFormFields({...formFields, disbursement_id: e.target.value})}>
                      {data.disbursementRequests.filter(r => r.status === 'disbursed').length === 0 && (
                        <option value="">Belum ada penyaluran yang dicairkan</option>
                      )}
                      {data.disbursementRequests.filter(r => r.status === 'disbursed').map(r => (
                        <option key={r.id} value={r.id}>{r.judul}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Keterangan</label>
                    <textarea required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', height: '80px' }}
                      value={formFields.keterangan || ''} onChange={e => setFormFields({...formFields, keterangan: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama File (simulasi upload)</label>
                    <input type="text" required placeholder="mis. serah-terima-sembako.jpg" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.filename || ''} onChange={e => setFormFields({...formFields, filename: e.target.value})} />
                  </div>
                </>
              ) : modalType === 'request_add' ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Judul Program Penyaluran</label>
                    <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.judul || ''} onChange={e => setFormFields({...formFields, judul: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kampanye / Campaign</label>
                    <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.campaign_id} onChange={e => setFormFields({...formFields, campaign_id: e.target.value})}>
                      <option value="1">Bantuan Darurat Bencana Banjir</option>
                      <option value="2">Pembangunan Masjid Pelosok</option>
                      <option value="3">Beasiswa Santri Tahfidz</option>
                      <option value="4">Wakaf Sumur Air Bersih</option>
                      <option value="5">Operasional Panti Asuhan</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Penerima Manfaat</label>
                    <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.beneficiary_id} onChange={e => setFormFields({...formFields, beneficiary_id: e.target.value})}>
                      {data.beneficiaries.map(b => (
                        <option key={b.id} value={b.id}>{b.nama_lengkap} ({b.kode_beneficiary})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jenis Penyaluran</label>
                      <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.jenis_penyaluran} onChange={e => setFormFields({...formFields, jenis_penyaluran: e.target.value})}>
                        <option value="transfer">Transfer Bank</option>
                        <option value="tunai">Kas Tunai</option>
                        <option value="barang">Sembako / Barang</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jumlah Diajukan (Rp)</label>
                      <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.jumlah_diajukan || ''} onChange={e => setFormFields({...formFields, jumlah_diajukan: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>COA Debet (Beban)</label>
                      <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.coa_debet} onChange={e => setFormFields({...formFields, coa_debet: e.target.value})}>
                        <option value="501.01.000.000">501.01 (Penyaluran Kesehatan)</option>
                        <option value="501.02.000.000">501.02 (Penyaluran Kemanusiaan)</option>
                        <option value="501.03.000.000">501.03 (Penyaluran Pangan)</option>
                        <option value="501.05.000.000">501.05 (Penyaluran Zakat)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>COA Kredit (Bank)</label>
                      <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.coa_kredit} onChange={e => setFormFields({...formFields, coa_kredit: e.target.value})}>
                        <option value="101.02.001.000">101.02.001 (BCA)</option>
                        <option value="101.02.002.000">101.02.002 (Mandiri)</option>
                        <option value="101.01.001.000">101.01.001 (Kas Pusat)</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Lengkap</label>
                    <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.nama_lengkap || ''} onChange={e => setFormFields({...formFields, nama_lengkap: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>NIK</label>
                      <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.nik || ''} onChange={e => setFormFields({...formFields, nik: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kategori</label>
                      <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.kategori} onChange={e => setFormFields({...formFields, kategori: e.target.value})}>
                        <option value="individu">Individu</option>
                        <option value="keluarga">Keluarga</option>
                        <option value="lembaga">Lembaga</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kecamatan</label>
                      <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.kecamatan || ''} onChange={e => setFormFields({...formFields, kecamatan: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kelurahan</label>
                      <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.kelurahan || ''} onChange={e => setFormFields({...formFields, kelurahan: e.target.value})} />
                    </div>
                  </div>
                </>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenyaluranDana;
