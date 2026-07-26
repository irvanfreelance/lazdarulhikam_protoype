import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, Search, Plus, Filter, PlayCircle, Eye
} from 'lucide-react';
import { getAccountingData, formatRupiah, postDepreciationAction, updateAccountingData } from '../utils/accountingStore';

const AsetTetap = () => {
  const [activeTab, setActiveTab] = useState('Register Aset');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});
  
  // Store data
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  const handlePostDepreciation = (assetId, monthlyDep) => {
    postDepreciationAction(assetId, monthlyDep);
    alert('Depresiasi bulanan berhasil diposting ke Jurnal Penyesuaian!');
    reloadData();
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();

    const newAsset = {
      id: String(store.assets.length + 1),
      kode_aset: `AST-INV-00${store.assets.length + 1}`,
      nama_aset: formFields.nama_aset,
      tgl_beli: formFields.tgl_beli,
      harga_perolehan: parseFloat(formFields.harga_perolehan) || 0,
      masa_manfaat: parseInt(formFields.masa_manfaat) || 36,
      nilai_buku: parseFloat(formFields.harga_perolehan) || 0,
      status: 'aktif'
    };

    updateAccountingData('laz_assets', [...store.assets, newAsset]);
    setIsModalOpen(false);
    reloadData();
  };

  const totalAset = data.assets.reduce((sum, a) => sum + a.harga_perolehan, 0);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Aset Tetap (Fixed Assets)</h1>
          <p>Mencatat inventaris kantor, menghitung penyusutan periodik secara otomatis menggunakan metode garis lurus</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => {
            setFormFields({
              nama_aset: '',
              tgl_beli: new Date().toISOString().substring(0, 10),
              harga_perolehan: '',
              masa_manfaat: 36
            });
            setIsModalOpen(true);
          }}>
            <Plus size={16} /> Registrasi Aset
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Building2 size={20} />
            </div>
            <div className="stat-title">Total Nilai Perolehan Aset</div>
          </div>
          <div className="stat-value">{formatRupiah(totalAset)}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Register Aset', 'Jadwal Penyusutan'].map(tab => (
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
              placeholder="Cari aset..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Register Aset' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode Aset</th>
                <th>Nama Aset Tetap</th>
                <th>Tanggal Perolehan</th>
                <th style={{ textAlign: 'right' }}>Harga Perolehan</th>
                <th>Masa Manfaat</th>
                <th style={{ textAlign: 'right' }}>Nilai Buku Saat Ini</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.assets
                .filter(a => a.nama_aset.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((a, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{a.kode_aset}</td>
                    <td style={{ fontWeight: 500 }}>{a.nama_aset}</td>
                    <td>{a.tgl_beli}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(a.harga_perolehan)}</td>
                    <td>{a.masa_manfaat} Bulan</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(a.nilai_buku)}</td>
                    <td>
                      <span className="status-badge status-success">{a.status.toUpperCase()}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Jadwal Penyusutan' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Aset</th>
                <th>Metode</th>
                <th>Periode Susut</th>
                <th style={{ textAlign: 'right' }}>Penyusutan Bulanan</th>
                <th>Jurnal Ref</th>
                <th>Aksi Posting</th>
              </tr>
            </thead>
            <tbody>
              {data.assets.map((a, idx) => {
                const monthlyDep = Math.round(a.harga_perolehan / a.masa_manfaat);
                // Check if already posted for this period
                const isPosted = data.jurnalPenyesuaian.some(aje => aje.keterangan.includes(`AJE #${a.id}`));

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{a.nama_aset} ({a.kode_aset})</td>
                    <td>Garis Lurus (Straight Line)</td>
                    <td>Juli 2026</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(monthlyDep)}</td>
                    <td>
                      {isPosted ? (
                        <span style={{ fontSize: '0.75rem', background: '#d1fae5', color: '#10b981', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          POSTED (AJE)
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Scheduled</span>
                      )}
                    </td>
                    <td>
                      {!isPosted ? (
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handlePostDepreciation(a.id, monthlyDep)}>
                          <PlayCircle size={14} /> Post Depresiasi
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL REGISTRATION */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Registrasi Aset Baru</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Aset Tetap</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.nama_aset || ''} onChange={e => setFormFields({...formFields, nama_aset: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Harga Perolehan (Rp)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.harga_perolehan || ''} onChange={e => setFormFields({...formFields, harga_perolehan: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Masa Manfaat (Bulan)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.masa_manfaat || ''} onChange={e => setFormFields({...formFields, masa_manfaat: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Tanggal Perolehan (Beli)</label>
                <input type="date" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.tgl_beli || ''} onChange={e => setFormFields({...formFields, tgl_beli: e.target.value})} />
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

export default AsetTetap;
