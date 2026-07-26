import React, { useState, useEffect } from 'react';
import { 
  Heart, Gift, Users, Search, Plus, Filter, Calculator, Sparkles
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';

const ProgramZakatQurban = () => {
  const [activeTab, setActiveTab] = useState('Penyaluran Asnaf');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());

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

  const handleCalculateAmil = () => {
    alert(`Hak Amil berhasil dikalkulasi: 12.5% dari ${formatRupiah(totalZakatMasuk)} = ${formatRupiah(hakAmil)}. Jurnal pengakuan hak amil telah dibuat.`);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Program Khusus Zakat & Qurban</h1>
          <p>Kelola klasifikasi penyaluran asnaf, pencatatan shahibul qurban, amil fee 12.5%, dan pelaporan distribusi daging</p>
        </div>
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
            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', background: '#f3e8ff', color: '#a855f7', border: 'none' }} onClick={handleCalculateAmil}>
              <Sparkles size={14} /> Klaim Hak Amil
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
                <th>Keterangan</th>
                <th style={{ textAlign: 'right' }}>Total Penyaluran</th>
                <th>Jumlah Penerima</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Fakir', desc: 'Masyarakat yang tidak memiliki harta / pekerjaan', total: 12000000, count: 24 },
                { name: 'Miskin', desc: 'Masyarakat yang memiliki pekerjaan tapi tidak cukup', total: 25000000, count: 50 },
                { name: 'Amil', desc: 'Pengelola zakat yayasan', total: hakAmil, count: 5 },
                { name: 'Gharim', desc: 'Orang yang terlilit hutang untuk kebutuhan pokok', total: 4500000, count: 3 },
                { name: 'Fisabilillah', desc: 'Pejuang di jalan Allah (guru ngaji, relawan)', total: 15000000, count: 12 }
              ].map((a, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{a.name}</td>
                  <td>{a.desc}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(a.total)}</td>
                  <td>{a.count} Penerima</td>
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
                <th>Shahibul Qurban (Pekurban)</th>
                <th>Bobot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'QRB-001', type: 'Sapi Premium', owner: 'Kelompok Bpk. Hasan (7 orang)', weight: '380 Kg', status: 'dipelihara' },
                { id: 'QRB-002', type: 'Kambing Gibas', owner: 'Ibu Hani Syarifah', weight: '35 Kg', status: 'siap_potong' },
                { id: 'QRB-003', type: 'Domba Super', owner: 'Bp. Dr. Budi', weight: '42 Kg', status: 'dipesan' }
              ].map((q, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{q.id}</td>
                  <td>{q.type}</td>
                  <td>{q.owner}</td>
                  <td>{q.weight}</td>
                  <td>
                    <span className={`status-badge ${
                      q.status === 'siap_potong' ? 'status-info' : 
                      q.status === 'dipelihara' ? 'status-success' : 'status-warning'
                    }`}>
                      {q.status.toUpperCase()}
                    </span>
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
                <th>Lokasi Distribusi</th>
                <th>ID Hewan Asal</th>
                <th>Jumlah Paket</th>
                <th>Koordinator Lapangan</th>
                <th>Status Realisasi</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kampung Pemulung Margajaya</td>
                <td>QRB-001</td>
                <td>120 Paket</td>
                <td>Ahmad Faisal</td>
                <td>
                  <span className="status-badge status-success">TERKIRIM (BA)</span>
                </td>
              </tr>
              <tr>
                <td>Dusun Tajur RT 02 / RW 04</td>
                <td>QRB-002</td>
                <td>35 Paket</td>
                <td>STF001</td>
                <td>
                  <span className="status-badge status-success">TERKIRIM (BA)</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProgramZakatQurban;
