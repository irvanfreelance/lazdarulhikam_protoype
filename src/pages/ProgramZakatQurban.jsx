import React, { useState, useEffect } from 'react';
import {
  Heart, Gift, Users, Search, Plus, Filter, Calculator, Sparkles, ArrowRightCircle
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const ASNAF_LIST = ['fakir', 'miskin', 'amil', 'muallaf', 'riqab', 'gharim', 'fisabilillah', 'ibnu sabil'];
const HEWAN_STATUS_FLOW = ['dipelihara', 'siap_potong', 'disembelih', 'didistribusikan'];
const CURRENT_PERIOD = { bulan: 7, tahun: 2026, label: 'Juli 2026' };

const ProgramZakatQurban = () => {
  const [activeTab, setActiveTab] = useState('Penyaluran Asnaf');
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

  // Hak amil calculation
  const totalZakatMasuk = data.penerimaan
    .filter(p => p.coa === '401.05.001.000' && p.status === 'PAID')
    .reduce((sum, p) => sum + p.nominal, 0);

  const hakAmil = totalZakatMasuk * 0.125; // 12.5%

  const currentClaim = data.zakatAmilFee.find(f => f.periode_bulan === CURRENT_PERIOD.bulan && f.periode_tahun === CURRENT_PERIOD.tahun);

  const handleCalculateAmil = () => {
    if (currentClaim) {
      alert(`Hak Amil periode ${CURRENT_PERIOD.label} sudah pernah diklaim sebesar ${formatRupiah(currentClaim.jumlah_amil)}.`);
      return;
    }
    if (totalZakatMasuk <= 0) {
      alert('Belum ada penerimaan zakat pada periode ini.');
      return;
    }
    if (!window.confirm(`Klaim Hak Amil 12.5% dari ${formatRupiah(totalZakatMasuk)} = ${formatRupiah(hakAmil)}?\nSistem akan membuat jurnal reklasifikasi dari Penerimaan Zakat ke Pendapatan Amil.`)) return;

    const store = getAccountingData();

    const newClaim = {
      periode_bulan: CURRENT_PERIOD.bulan,
      periode_tahun: CURRENT_PERIOD.tahun,
      total_zakat_diterima: totalZakatMasuk,
      persentase_amil: 12.5,
      jumlah_amil: hakAmil,
      jumlah_disalurkan: 0,
      status: 'approved'
    };

    const newAje = {
      id: String(store.jurnalPenyesuaian.length + 1),
      period: CURRENT_PERIOD.label,
      tgl: new Date().toISOString().substring(0, 10),
      jenis_aje: 'koreksi',
      keterangan: `Reklasifikasi Hak Amil ${CURRENT_PERIOD.label} (12.5% dari Penerimaan Zakat)`,
      coa_debet: '401.05.001.000', // Reduce Zakat revenue
      coa_kredit: '401.07.001.000', // Recognize as Amil Operational revenue
      nominal: hakAmil,
      nik_input: 'SYSTEM',
      approved_by: 'SYSTEM',
      approved_at: new Date().toISOString()
    };

    updateAccountingData('laz_zakat_amil_fee', [newClaim, ...store.zakatAmilFee]);
    updateAccountingData('laz_jurnal_penyesuaian', [newAje, ...store.jurnalPenyesuaian]);
    alert(`Hak Amil berhasil dikalkulasi dan diklaim: ${formatRupiah(hakAmil)}. Jurnal reklasifikasi telah diposting ke Jurnal Penyesuaian.`);
    reloadData();
  };

  const openAddModal = () => {
    if (activeTab === 'Penyaluran Asnaf') {
      setFormFields({ asnaf: 'fakir', jumlah_penerima: '', jumlah_disalurkan: '', lokasi_distribusi: '' });
    } else if (activeTab === 'Register Hewan Qurban') {
      setFormFields({ jenis_hewan: 'sapi', berat_kg: '', peserta_count: 1, kapasitas_peserta: 7, lokasi_sembelih: '', total_biaya: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveDistribution = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const newRow = {
      asnaf: formFields.asnaf,
      jumlah_penerima: parseInt(formFields.jumlah_penerima) || 0,
      jumlah_disalurkan: parseFloat(formFields.jumlah_disalurkan) || 0,
      lokasi_distribusi: formFields.lokasi_distribusi
    };
    updateAccountingData('laz_zakat_distributions', [newRow, ...store.zakatDistributions]);
    setIsModalOpen(false);
    reloadData();
  };

  const handleSaveAnimal = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const seq = store.qurbanAnimals.length + 1;
    const prefix = formFields.jenis_hewan === 'sapi' ? 'S' : formFields.jenis_hewan === 'kambing' ? 'K' : 'D';
    const newAnimal = {
      kode_hewan: `QRB-2026-${prefix}${String(seq).padStart(3, '0')}`,
      jenis_hewan: formFields.jenis_hewan,
      berat_kg: parseFloat(formFields.berat_kg) || 0,
      peserta_count: parseInt(formFields.peserta_count) || 1,
      kapasitas_peserta: parseInt(formFields.kapasitas_peserta) || 1,
      lokasi_sembelih: formFields.lokasi_sembelih,
      total_biaya: parseFloat(formFields.total_biaya) || 0,
      status: 'dipelihara'
    };
    updateAccountingData('laz_qurban_animals', [newAnimal, ...store.qurbanAnimals]);
    setIsModalOpen(false);
    reloadData();
  };

  const handleAdvanceStatus = (kodeHewan) => {
    const store = getAccountingData();
    const updated = store.qurbanAnimals.map(a => {
      if (a.kode_hewan !== kodeHewan) return a;
      const idx = HEWAN_STATUS_FLOW.indexOf(a.status);
      const nextStatus = HEWAN_STATUS_FLOW[Math.min(idx + 1, HEWAN_STATUS_FLOW.length - 1)];
      return { ...a, status: nextStatus };
    });
    updateAccountingData('laz_qurban_animals', updated);
    reloadData();
  };

  const asnafRows = [
    ...data.zakatDistributions,
    { asnaf: 'amil', jumlah_penerima: '-', jumlah_disalurkan: hakAmil, lokasi_distribusi: 'Operasional Yayasan (Otomatis)' }
  ];

  const distributedAnimals = data.qurbanAnimals.filter(a => a.status === 'disembelih' || a.status === 'didistribusikan');

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Program Khusus Zakat & Qurban</h1>
          <p>Kelola klasifikasi penyaluran asnaf, pencatatan shahibul qurban, amil fee 12.5%, dan pelaporan distribusi daging</p>
        </div>
        {(activeTab === 'Penyaluran Asnaf' || activeTab === 'Register Hewan Qurban') && (
          <div>
            <button className="btn btn-primary" onClick={openAddModal}>
              <Plus size={16} /> {activeTab === 'Penyaluran Asnaf' ? 'Catat Penyaluran' : 'Registrasi Hewan'}
            </button>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Heart size={20} />
            </div>
            <div className="stat-title">Zakat Masuk Periode Ini</div>
          </div>
          <div className="stat-value">{formatRupiah(totalZakatMasuk)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}>
              <Calculator size={20} />
            </div>
            <div className="stat-title">Estimasi Hak Amil (12.5%)</div>
          </div>
          <div className="stat-value">{formatRupiah(hakAmil)}</div>
          <div style={{ marginTop: '8px' }}>
            <button
              className="btn"
              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: currentClaim ? '#f1f5f9' : '#f3e8ff', color: currentClaim ? '#64748b' : '#a855f7', border: 'none' }}
              onClick={handleCalculateAmil}
              disabled={!!currentClaim}
            >
              <Sparkles size={14} /> {currentClaim ? 'Sudah Diklaim' : 'Klaim Hak Amil'}
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Penyaluran Asnaf', 'Register Hewan Qurban', 'Distribusi Daging'].map(tab => (
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
        {activeTab === 'Penyaluran Asnaf' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asnaf</th>
                <th>Lokasi Distribusi</th>
                <th style={{ textAlign: 'right' }}>Total Penyaluran</th>
                <th>Jumlah Penerima</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {asnafRows
                .filter(a => a.asnaf.toLowerCase().includes(searchTerm.toLowerCase()) || (a.lokasi_distribusi || '').toLowerCase().includes(searchTerm.toLowerCase()))
                .map((a, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{a.asnaf}</td>
                    <td>{a.lokasi_distribusi}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(a.jumlah_disalurkan)}</td>
                    <td>{a.jumlah_penerima === '-' ? '-' : `${a.jumlah_penerima} Penerima`}</td>
                    <td>
                      <span className="status-badge status-success">TERALOKASI</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Register Hewan Qurban' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Hewan</th>
                <th>Jenis Hewan</th>
                <th>Peserta / Kapasitas</th>
                <th>Bobot</th>
                <th style={{ textAlign: 'right' }}>Total Biaya</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.qurbanAnimals
                .filter(q => q.kode_hewan.toLowerCase().includes(searchTerm.toLowerCase()) || q.jenis_hewan.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((q, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{q.kode_hewan}</td>
                    <td style={{ textTransform: 'capitalize' }}>{q.jenis_hewan}</td>
                    <td>{q.peserta_count} / {q.kapasitas_peserta}</td>
                    <td>{q.berat_kg} Kg</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(q.total_biaya)}</td>
                    <td>
                      <span className={`status-badge ${
                        q.status === 'siap_potong' ? 'status-info' :
                        q.status === 'dipelihara' ? 'status-warning' : 'status-success'
                      }`}>
                        {q.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {q.status !== 'didistribusikan' ? (
                        <button className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: '#eef2ff', color: '#4f46e5', border: 'none' }} onClick={() => handleAdvanceStatus(q.kode_hewan)}>
                          <ArrowRightCircle size={14} /> {HEWAN_STATUS_FLOW[HEWAN_STATUS_FLOW.indexOf(q.status) + 1]?.replace('_', ' ')}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Distribusi Daging' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Lokasi Sembelih</th>
                <th>ID Hewan Asal</th>
                <th>Estimasi Paket (2.5 Kg/paket)</th>
                <th>Status Realisasi</th>
              </tr>
            </thead>
            <tbody>
              {distributedAnimals.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada hewan yang disembelih/didistribusikan</td></tr>
              )}
              {distributedAnimals.map((q, idx) => (
                <tr key={idx}>
                  <td>{q.lokasi_sembelih}</td>
                  <td style={{ fontFamily: 'monospace' }}>{q.kode_hewan}</td>
                  <td>{Math.round(q.berat_kg / 2.5)} Paket</td>
                  <td>
                    <span className={`status-badge ${q.status === 'didistribusikan' ? 'status-success' : 'status-warning'}`}>
                      {q.status === 'didistribusikan' ? 'TERKIRIM (BA)' : 'MENUNGGU DISTRIBUSI'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL ADD */}
      {isModalOpen && activeTab === 'Penyaluran Asnaf' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Catat Penyaluran Asnaf</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveDistribution}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Asnaf</label>
                <SearchableSelect
                  className="form-select"
                  options={ASNAF_LIST.map(a => ({ value: a, label: a.charAt(0).toUpperCase() + a.slice(1) }))}
                  value={formFields.asnaf || ''}
                  onChange={val => setFormFields({ ...formFields, asnaf: val })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jumlah Penerima</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jumlah_penerima || ''} onChange={e => setFormFields({ ...formFields, jumlah_penerima: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nominal Disalurkan (Rp)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jumlah_disalurkan || ''} onChange={e => setFormFields({ ...formFields, jumlah_disalurkan: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Lokasi Distribusi</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.lokasi_distribusi || ''} onChange={e => setFormFields({ ...formFields, lokasi_distribusi: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && activeTab === 'Register Hewan Qurban' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '480px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Registrasi Hewan Qurban</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveAnimal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jenis Hewan</label>
                  <SearchableSelect
                    className="form-select"
                    options={[
                      { value: 'sapi', label: 'Sapi' },
                      { value: 'kambing', label: 'Kambing' },
                      { value: 'domba', label: 'Domba' }
                    ]}
                    value={formFields.jenis_hewan || ''}
                    onChange={val => setFormFields({ ...formFields, jenis_hewan: val })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Bobot (Kg)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.berat_kg || ''} onChange={e => setFormFields({ ...formFields, berat_kg: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Peserta Saat Ini</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.peserta_count || ''} onChange={e => setFormFields({ ...formFields, peserta_count: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kapasitas Peserta</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.kapasitas_peserta || ''} onChange={e => setFormFields({ ...formFields, kapasitas_peserta: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Lokasi Sembelih</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.lokasi_sembelih || ''} onChange={e => setFormFields({ ...formFields, lokasi_sembelih: e.target.value })} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Total Biaya (Rp)</label>
                <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.total_biaya || ''} onChange={e => setFormFields({ ...formFields, total_biaya: e.target.value })} />
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

export default ProgramZakatQurban;
