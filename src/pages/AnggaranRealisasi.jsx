import React, { useState, useEffect } from 'react';
import { 
  PieChart, TrendingUp, DollarSign, Search, Plus, Filter, RefreshCw
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';

const AnggaranRealisasi = () => {
  const [activeTab, setActiveTab] = useState('Anggaran');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  const handleSyncCampaign = (campId) => {
    // In a real database, this would re-sum all ledger items. Here we simulate a sync.
    alert('Sinkronisasi data realisasi campaign berhasil! Data budget & realisasi di-update.');
  };

  // Campaigns list from KampanyeList
  const campaigns = [
    { id: 1, name: 'Bantuan Darurat Bencana Banjir', category: 'Kemanusiaan', target: 100000000, collected: 85000000 },
    { id: 2, name: 'Pembangunan Masjid Pelosok', category: 'Infrastruktur', target: 500000000, collected: 300000000 },
    { id: 3, name: 'Beasiswa Santri Tahfidz', category: 'Pendidikan', target: 50000000, collected: 21000000 },
    { id: 4, name: 'Wakaf Sumur Air Bersih', category: 'Kemanusiaan', target: 25000000, collected: 25000000 },
    { id: 5, name: 'Operasional Panti Asuhan', category: 'Sosial', target: 20000000, collected: 5000000 }
  ];

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Anggaran & Realisasi</h1>
          <p>Memonitor pagu anggaran program vs realisasi penyaluran dana donasi</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Anggaran', 'Realisasi Campaign', 'Admin Fee Invoice'].map(tab => (
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
              placeholder="Cari campaign..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Anggaran' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Campaign</th>
                <th>COA Penyaluran</th>
                <th style={{ textAlign: 'right' }}>Pagu Anggaran</th>
                <th style={{ textAlign: 'right' }}>Realisasi Pengeluaran</th>
                <th>Serapan (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.campaignBudgets
                .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((b, idx) => {
                  // Calculate actual pengeluaran for this campaign's COA
                  const actualExpense = data.pengeluaran
                    .filter(p => p.coa === b.coa && p.status === 'PAID')
                    .reduce((sum, p) => sum + p.nominal, 0);
                  const pct = b.budget > 0 ? Math.round((actualExpense / b.budget) * 100) : 0;

                  return (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 500 }}>{b.name}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                          {b.coa}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(b.budget)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatRupiah(actualExpense)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                            <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: pct > 80 ? '#ef4444' : '#10b981' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {activeTab === 'Realisasi Campaign' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Kategori</th>
                <th style={{ textAlign: 'right' }}>Target Dana</th>
                <th style={{ textAlign: 'right' }}>Terkumpul</th>
                <th>Pencapaian</th>
                <th>Sync</th>
              </tr>
            </thead>
            <tbody>
              {campaigns
                .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((c, idx) => {
                  const pct = Math.round((c.collected / c.target) * 100);
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td>{c.category}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(c.target)}</td>
                      <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 600 }}>{formatRupiah(c.collected)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                            <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: '#0ea5e9' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <button className="btn" style={{ padding: '6px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0' }} onClick={() => handleSyncCampaign(c.id)}>
                          <RefreshCw size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {activeTab === 'Admin Fee Invoice' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Campaign</th>
                <th style={{ textAlign: 'right' }}>Gross Amount</th>
                <th style={{ textAlign: 'right' }}>Admin Fee (12.5%)</th>
                <th style={{ textAlign: 'right' }}>Net Dana Program</th>
                <th>Status Jurnal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>INV-2607120935</td>
                <td>Bantuan Darurat Bencana Banjir</td>
                <td style={{ textAlign: 'right' }}>Rp 5.000.000</td>
                <td style={{ textAlign: 'right', color: '#f59e0b' }}>Rp 625.000</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp 4.375.000</td>
                <td>
                  <span className="status-badge status-success">REKLASIFIKASI OK</span>
                </td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace' }}>INV-2607121015</td>
                <td>Pembangunan Masjid Pelosok</td>
                <td style={{ textAlign: 'right' }}>Rp 2.500.000</td>
                <td style={{ textAlign: 'right', color: '#f59e0b' }}>Rp 312.500</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp 2.187.500</td>
                <td>
                  <span className="status-badge status-success">REKLASIFIKASI OK</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AnggaranRealisasi;
