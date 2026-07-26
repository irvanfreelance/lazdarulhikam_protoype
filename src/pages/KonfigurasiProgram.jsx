import React, { useState, useEffect } from 'react';
import {
  Settings, Users, Landmark, Search, Plus, CheckCircle, HelpCircle
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData, COAS_ALL } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const KonfigurasiProgram = () => {
  const [activeTab, setActiveTab] = useState('COA per Campaign');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  const openAddModal = () => {
    if (activeTab === 'COA per Campaign') {
      setFormFields({ name: '', coa: '', budget: '' });
    } else if (activeTab === 'Penerima Manfaat') {
      setFormFields({ nama_lengkap: '', nik: '', kategori: 'individu', status_ekonomi: 'miskin', kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '' });
    } else if (activeTab === 'Vendor / Supplier') {
      setFormFields({ nama_vendor: '', npwp: '', kategori: 'barang', kota: '', kontak_pic: '', telepon: '', term_bayar: 14 });
    }
    setIsModalOpen(true);
  };

  const handleSaveCoaCampaign = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const newRow = {
      id: String(store.campaignBudgets.length + 1),
      campaign_id: store.campaignBudgets.length + 1,
      name: formFields.name,
      coa: formFields.coa,
      budget: parseFloat(formFields.budget) || 0
    };
    updateAccountingData('laz_campaign_budgets', [...store.campaignBudgets, newRow]);
    setIsModalOpen(false);
    reloadData();
  };

  const handleSaveBeneficiary = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const seq = store.beneficiaries.length + 1;
    const newB = {
      id: String(seq),
      kode_beneficiary: `BNF-2026-${String(seq).padStart(6, '0')}`,
      nama_lengkap: formFields.nama_lengkap,
      nik: formFields.nik,
      kategori: formFields.kategori,
      status_ekonomi: formFields.status_ekonomi,
      kelurahan: formFields.kelurahan,
      kecamatan: formFields.kecamatan,
      kabupaten: formFields.kabupaten,
      provinsi: formFields.provinsi,
      status_verifikasi: 'unverified',
      campaign_id: null
    };
    updateAccountingData('laz_beneficiaries', [...store.beneficiaries, newB]);
    setIsModalOpen(false);
    reloadData();
  };

  const handleSaveVendor = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const seq = store.vendors.length + 1;
    const newV = {
      id: String(seq),
      kode_vendor: `VND-${String(seq).padStart(6, '0')}`,
      nama_vendor: formFields.nama_vendor,
      npwp: formFields.npwp,
      kategori: formFields.kategori,
      kota: formFields.kota,
      kontak_pic: formFields.kontak_pic,
      telepon: formFields.telepon,
      term_bayar: parseInt(formFields.term_bayar) || 14,
      active: 'y'
    };
    updateAccountingData('laz_vendors', [...store.vendors, newV]);
    setIsModalOpen(false);
    reloadData();
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Konfigurasi Program Kerja</h1>
          <p>Kelola pemetaan COA kampanye, master penerima manfaat, dan supplier/vendor operasional</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            {activeTab === 'COA per Campaign' && ' Tambah Mapping COA'}
            {activeTab === 'Penerima Manfaat' && ' Tambah Penerima Manfaat'}
            {activeTab === 'Vendor / Supplier' && ' Tambah Vendor'}
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['COA per Campaign', 'Penerima Manfaat', 'Vendor / Supplier'].map(tab => (
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
        <div className="filters-left"></div>
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

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'COA per Campaign' && (
          <div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Campaign</th>
                  <th>COA Anggaran</th>
                  <th style={{ textAlign: 'right' }}>Budget</th>
                </tr>
              </thead>
              <tbody>
                {data.campaignBudgets
                  .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((c, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{c.name}</td>
                      <td style={{ fontFamily: 'monospace' }}>{c.coa} {COAS_ALL[c.coa] ? `— ${COAS_ALL[c.coa].split('(')[1]?.replace(')', '')}` : ''}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(c.budget)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
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

        {activeTab === 'Vendor / Supplier' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode Vendor</th>
                <th>Nama Supplier / Vendor</th>
                <th>NPWP</th>
                <th>Kategori</th>
                <th>Kota</th>
                <th>PIC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.vendors
                .filter(v => v.nama_vendor.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((v, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace' }}>{v.kode_vendor}</td>
                    <td style={{ fontWeight: 500 }}>{v.nama_vendor}</td>
                    <td>{v.npwp || '-'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{v.kategori}</td>
                    <td>{v.kota}</td>
                    <td>{v.kontak_pic}</td>
                    <td>
                      <span className={`status-badge ${v.active === 'y' ? 'status-success' : 'status-warning'}`}>
                        {v.active === 'y' ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL: COA PER CAMPAIGN */}
      {isModalOpen && activeTab === 'COA per Campaign' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Mapping COA Campaign</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveCoaCampaign}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Campaign</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.name || ''} onChange={e => setFormFields({ ...formFields, name: e.target.value })} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>COA Anggaran</label>
                <SearchableSelect
                  className="form-select"
                  options={[
                    { value: '', label: '-- Pilih COA --' },
                    ...Object.entries(COAS_ALL).map(([coa, label]) => ({ value: coa, label }))
                  ]}
                  value={formFields.coa || ''}
                  onChange={val => setFormFields({ ...formFields, coa: val })}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Budget (Rp)</label>
                <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.budget || ''} onChange={e => setFormFields({ ...formFields, budget: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENERIMA MANFAAT */}
      {isModalOpen && activeTab === 'Penerima Manfaat' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '520px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Penerima Manfaat</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveBeneficiary}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Lengkap</label>
                  <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.nama_lengkap || ''} onChange={e => setFormFields({ ...formFields, nama_lengkap: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kategori</label>
                  <SearchableSelect
                    className="form-select"
                    options={[
                      { value: 'individu', label: 'Individu' },
                      { value: 'lembaga', label: 'Lembaga' }
                    ]}
                    value={formFields.kategori || 'individu'}
                    onChange={val => setFormFields({ ...formFields, kategori: val })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>NIK</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.nik || ''} onChange={e => setFormFields({ ...formFields, nik: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Status Ekonomi</label>
                  <SearchableSelect
                    className="form-select"
                    options={[
                      { value: 'sangat_miskin', label: 'Sangat Miskin' },
                      { value: 'miskin', label: 'Miskin' },
                      { value: 'lainnya', label: 'Lainnya' }
                    ]}
                    value={formFields.status_ekonomi || 'miskin'}
                    onChange={val => setFormFields({ ...formFields, status_ekonomi: val })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kelurahan</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.kelurahan || ''} onChange={e => setFormFields({ ...formFields, kelurahan: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kecamatan</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.kecamatan || ''} onChange={e => setFormFields({ ...formFields, kecamatan: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kabupaten/Kota</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.kabupaten || ''} onChange={e => setFormFields({ ...formFields, kabupaten: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Provinsi</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.provinsi || ''} onChange={e => setFormFields({ ...formFields, provinsi: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VENDOR */}
      {isModalOpen && activeTab === 'Vendor / Supplier' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Vendor / Supplier</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveVendor}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Vendor</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.nama_vendor || ''} onChange={e => setFormFields({ ...formFields, nama_vendor: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>NPWP</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.npwp || ''} onChange={e => setFormFields({ ...formFields, npwp: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kategori</label>
                  <SearchableSelect
                    className="form-select"
                    options={[
                      { value: 'barang', label: 'Barang' },
                      { value: 'jasa', label: 'Jasa' },
                      { value: 'media', label: 'Media' },
                      { value: 'konsultan', label: 'Konsultan' },
                      { value: 'peternak', label: 'Peternak' },
                      { value: 'catering', label: 'Catering' },
                      { value: 'logistik', label: 'Logistik' },
                      { value: 'lainnya', label: 'Lainnya' }
                    ]}
                    value={formFields.kategori || 'barang'}
                    onChange={val => setFormFields({ ...formFields, kategori: val })}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kota</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.kota || ''} onChange={e => setFormFields({ ...formFields, kota: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>PIC</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.kontak_pic || ''} onChange={e => setFormFields({ ...formFields, kontak_pic: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Telepon</label>
                  <input type="text" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.telepon || ''} onChange={e => setFormFields({ ...formFields, telepon: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Termin Bayar (hari)</label>
                  <input type="number" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.term_bayar || ''} onChange={e => setFormFields({ ...formFields, term_bayar: e.target.value })} />
                </div>
              </div>
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

export default KonfigurasiProgram;
