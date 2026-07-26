import React, { useState, useEffect } from 'react';
import { 
  Settings, Users, Landmark, Search, Plus, CheckCircle, HelpCircle
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';

const KonfigurasiProgram = () => {
  const [activeTab, setActiveTab] = useState('COA per Campaign');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Konfigurasi Program Kerja</h1>
          <p>Kelola pemetaan COA kampanye, master penerima manfaat, dan supplier/vendor operasional</p>
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
                  <th>COA Penerimaan (4xx)</th>
                  <th>COA Dana (3xx)</th>
                  <th>COA Pengeluaran (5xx)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Bantuan Darurat Bencana Banjir', r: '401.02.001.000', f: '300.01.002.000', e: '501.02.000.000' },
                  { name: 'Pembangunan Masjid Pelosok', r: '401.08.001.000', f: '300.01.001.000', e: '501.02.000.000' },
                  { name: 'Beasiswa Santri Tahfidz', r: '401.05.001.000', f: '300.02.001.000', e: '501.05.000.000' }
                ].map((c, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{c.r}</td>
                    <td style={{ fontFamily: 'monospace' }}>{c.f}</td>
                    <td style={{ fontFamily: 'monospace' }}>{c.e}</td>
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
                      <span className="status-badge status-success">AKTIF</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default KonfigurasiProgram;
