import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, ArrowLeftRight, Check, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';

const RekonsiliasiBank = () => {
  const [activeTab, setActiveTab] = useState('Pencocokan Transaksi');
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  const handleAutoMatch = () => {
    const store = getAccountingData();
    // Simulate auto-match
    const updated = store.bankStatements.map(st => {
      if (st.keterangan.includes('BI-FAST') && !st.matched) {
        return { ...st, matched: true, matched_trans_id: '2607121122334455' };
      }
      return st;
    });

    updateAccountingData('laz_bank_statements', updated);
    alert('Sistem Auto-Match berhasil mencocokkan mutasi rekening koran dengan jurnal kas secara cerdas!');
    reloadData();
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Rekonsiliasi Bank</h1>
          <p>Mencocokkan mutasi rekening koran bank dengan catatan buku kas internal yayasan</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <Check size={20} />
            </div>
            <div className="stat-title">Mutasi Sudah Cocok (Matched)</div>
          </div>
          <div className="stat-value">{data.bankStatements.filter(s => s.matched).length} Transaksi</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldAlert size={20} />
            </div>
            <div className="stat-title">Selisih Belum Cocok</div>
          </div>
          <div className="stat-value">{data.bankStatements.filter(s => !s.matched).length} Transaksi</div>
          <div style={{ marginTop: '8px' }}>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleAutoMatch}>
              <Sparkles size={14} /> Jalankan Auto-Match
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Pencocokan Transaksi', 'Laporan Rekonsiliasi', 'Import Statement'].map(tab => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Pencocokan Transaksi' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>Rekening Koran vs Buku Besar (Jurnal)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi Rekening Koran</th>
                  <th>Mutasi</th>
                  <th style={{ textAlign: 'right' }}>Nominal Koran</th>
                  <th>Status Reconciled</th>
                  <th>Ref Transaksi Jurnal</th>
                </tr>
              </thead>
              <tbody>
                {data.bankStatements.map((st, idx) => (
                  <tr key={idx}>
                    <td>{st.tgl}</td>
                    <td style={{ fontWeight: 500 }}>{st.keterangan}</td>
                    <td style={{ textTransform: 'capitalize' }}>{st.mutasi}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(st.nominal)}</td>
                    <td>
                      <span className={`status-badge ${st.matched ? 'status-success' : 'status-warning'}`}>
                        {st.matched ? 'MATCHED' : 'UNMATCHED'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {st.matched_trans_id || (
                        <button className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'white', border: '1px solid #e2e8f0' }} onClick={() => {
                          const updated = data.bankStatements.map((s, i) => i === idx ? { ...s, matched: true, matched_trans_id: 'MANUAL-MATCH' } : s);
                          updateAccountingData('laz_bank_statements', updated);
                          alert('Manual matching selesai.');
                          reloadData();
                        }}>
                          Match Manual
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Laporan Rekonsiliasi' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', marginBottom: '16px' }}>Rekapitulasi Selisih Bank per Juli 2026</h3>
            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <tbody>
                <tr>
                  <td>Saldo Kas Menurut Buku Besar (Internal)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp 245.300.000</td>
                </tr>
                <tr>
                  <td>Ditambah: Setoran QRIS dalam perjalanan (belum cair)</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>+ Rp 20.000.000</td>
                </tr>
                <tr>
                  <td>Dikurangi: Cek/Giro beredar belum dicairkan vendor</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>- Rp 15.000.000</td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>Saldo Menurut Rekening Koran (Bank)</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>Rp 250.300.000</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Import Statement' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', marginBottom: '16px' }}>Import Rekening Koran</h3>
            <div style={{ padding: '32px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
              <FileSpreadsheet size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>Upload File Rekening Koran (CSV / MT940)</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '24px' }}>Tarik data mutasi otomatis dari file yang diunduh dari klikBCA atau Mandiri Cash Management.</p>
              <button className="btn btn-primary" onClick={() => alert('Fitur upload file dummy ini berhasil dipanggil')}>
                Pilih File .CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RekonsiliasiBank;
