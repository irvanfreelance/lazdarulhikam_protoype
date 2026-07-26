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

  const handleSyncCampaign = (campaignId) => {
    // Recompute real realisasi for every campaign budget by summing matching PAID pengeluaran, then persist it.
    const store = getAccountingData();
    const updatedBudgets = store.campaignBudgets.map(b => {
      const actual = store.pengeluaran
        .filter(p => p.coa === b.coa && p.status === 'PAID')
        .reduce((sum, p) => sum + p.nominal, 0);
      return { ...b, realisasi: actual };
    });

    updateAccountingData('laz_campaign_budgets', updatedBudgets);

    const synced = updatedBudgets.find(b => b.campaign_id === campaignId);
    alert(synced
      ? `Sinkronisasi berhasil! Realisasi "${synced.name}" ter-update menjadi ${formatRupiah(synced.realisasi)}.`
      : 'Sinkronisasi data realisasi campaign berhasil! Data budget & realisasi di-update.');
    reloadData();
  };

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
                <th>COA Penyaluran</th>
                <th style={{ textAlign: 'right' }}>Pagu Anggaran</th>
                <th style={{ textAlign: 'right' }}>Realisasi (Actual)</th>
                <th>Serapan</th>
                <th style={{ textAlign: 'right' }}>Sisa Anggaran</th>
                <th>Sync</th>
              </tr>
            </thead>
            <tbody>
              {data.campaignBudgets
                .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((b, idx) => {
                  const actual = data.pengeluaran
                    .filter(p => p.coa === b.coa && p.status === 'PAID')
                    .reduce((sum, p) => sum + p.nominal, 0);
                  const pct = b.budget > 0 ? (actual / b.budget) * 100 : 0;
                  const sisa = b.budget - actual;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{b.name}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                          {b.coa}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(b.budget)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>{formatRupiah(actual)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', minWidth: '80px' }}>
                            <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', backgroundColor: pct > 90 ? '#ef4444' : '#0ea5e9' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: sisa >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(sisa)}</td>
                      <td>
                        <button className="btn" style={{ padding: '6px', display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #e2e8f0' }} onClick={() => handleSyncCampaign(b.campaign_id)}>
                          <RefreshCw size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {activeTab === 'Admin Fee Invoice' && (() => {
          const feeTrans = data.pengeluaran.filter(p => p.coa === '502.01.000.000');
          return (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Transaksi</th>
                  <th>Tanggal</th>
                  <th>Keterangan / Vendor</th>
                  <th style={{ textAlign: 'right' }}>Nominal Biaya PG Platform</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeTrans.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                      Belum ada transaksi Biaya PG Platform / Admin Fee yang tercatat
                    </td>
                  </tr>
                )}
                {feeTrans.map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace' }}>{t.id_trans}</td>
                    <td>{t.tgl ? new Date(t.tgl).toLocaleString('id-ID') : '-'}</td>
                    <td style={{ fontWeight: 500 }}>{t.vendor || t.note}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>{formatRupiah(t.nominal)}</td>
                    <td>
                      <span className={`status-badge ${t.status === 'PAID' ? 'status-success' : 'status-warning'}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
        })()}
      </div>
    </div>
  );
};

export default AnggaranRealisasi;
