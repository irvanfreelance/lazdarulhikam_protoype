import React, { useState, useEffect } from 'react';
import { 
  CreditCard, RefreshCw, Plus, Search, CheckCircle, ArrowRight
} from 'lucide-react';
import { getAccountingData, formatRupiah, executeInternalTransferAction, updateAccountingData, payPurchaseOrderAction } from '../utils/accountingStore';

const HutangPiutang = () => {
  const [activeTab, setActiveTab] = useState('Hutang Usaha');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});
  
  // Store data
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  const handleCompleteTransfer = (transferId) => {
    executeInternalTransferAction(transferId);
    alert('Transfer internal diproses! Saldo kas asal & tujuan telah di-update otomatis.');
    reloadData();
  };

  const handleBayarHutang = (poId, outstanding) => {
    if (!window.confirm(`Bayar pelunasan hutang sebesar ${formatRupiah(outstanding)} dari BCA — Transfer Manual?`)) return;
    payPurchaseOrderAction(poId, '101.02.001.000');
    alert('Hutang usaha berhasil dilunasi! Saldo bank ter-update dan status PO menjadi PAID.');
    reloadData();
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();

    if (activeTab === 'Transfer Antar Rekening') {
      const newTf = {
        id: String(store.internalTransfers.length + 1),
        nomor_transfer: `TRF-2026-000${store.internalTransfers.length + 1}`,
        dari_rekening_id: formFields.dari_rekening_id,
        ke_rekening_id: formFields.ke_rekening_id,
        jumlah: parseFloat(formFields.jumlah) || 0,
        biaya_transfer: parseFloat(formFields.biaya_transfer) || 0,
        keterangan: formFields.keterangan || '',
        tgl_kirim: new Date().toISOString().substring(0, 10),
        status: 'pending'
      };
      updateAccountingData('laz_internal_transfers', [newTf, ...store.internalTransfers]);
    }
    
    setIsModalOpen(false);
    reloadData();
  };

  // Calculations — Hutang Usaha = open Purchase Orders not yet fully paid
  const openPOs = data.purchaseOrders.filter(po => po.status !== 'paid' && po.status !== 'cancelled');
  const totalHutang = openPOs.reduce((sum, po) => sum + (po.total_amount - (po.dp_amount || 0)), 0);
  const totalReceivables = data.cashAdvances.filter(c => c.status === 'active').reduce((sum, c) => sum + c.sisa_kasbon, 0);

  const dueDate = (tglPo, termDays) => {
    const d = new Date(tglPo);
    d.setDate(d.getDate() + (termDays || 14));
    return d.toISOString().substring(0, 10);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Hutang, Piutang & Transfer Internal</h1>
          <p>Memonitor kewajiban pembayaran, piutang non-donasi, dan memindahkan saldo kas antar rekening sendiri</p>
        </div>
        <div>
          {activeTab === 'Transfer Antar Rekening' && (
            <button className="btn btn-primary" onClick={() => {
              setFormFields({
                dari_rekening_id: '101.02.004.000', // Xendit
                ke_rekening_id: '101.02.001.000', // BCA
                jumlah: '',
                biaya_transfer: '6500',
                keterangan: ''
              });
              setIsModalOpen(true);
            }}>
              <Plus size={16} /> Buat Transfer
            </button>
          )}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <CreditCard size={20} />
            </div>
            <div className="stat-title">Total Hutang Usaha (Vendor)</div>
          </div>
          <div className="stat-value">{formatRupiah(totalHutang)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <RefreshCw size={20} />
            </div>
            <div className="stat-title">Total Piutang (Staf/Hibah)</div>
          </div>
          <div className="stat-value">{formatRupiah(totalReceivables)}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Hutang Usaha', 'Piutang', 'Transfer Antar Rekening'].map(tab => (
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
        {activeTab === 'Hutang Usaha' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>No Hutang</th>
                <th>Vendor</th>
                <th>Tgl Invoice</th>
                <th>Jatuh Tempo</th>
                <th style={{ textAlign: 'right' }}>Total Tagihan</th>
                <th style={{ textAlign: 'right' }}>Outstanding</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {openPOs.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Tidak ada hutang usaha outstanding</td></tr>
              )}
              {openPOs
                .map(po => ({ po, vendor: data.vendors.find(v => v.id === po.vendor_id) }))
                .filter(({ vendor }) => (vendor?.nama_vendor || '').toLowerCase().includes(searchTerm.toLowerCase()))
                .map(({ po, vendor }, idx) => {
                  const outstanding = po.total_amount - (po.dp_amount || 0);
                  const isPartial = (po.dp_amount || 0) > 0;
                  return (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace' }}>{po.nomor_po}</td>
                      <td style={{ fontWeight: 500 }}>{vendor?.nama_vendor || 'Vendor tidak diketahui'}</td>
                      <td>{po.tgl_po}</td>
                      <td>{dueDate(po.tgl_po, vendor?.term_bayar)}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(po.total_amount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{formatRupiah(outstanding)}</td>
                      <td>
                        <span className={`status-badge ${isPartial ? 'status-warning' : 'status-danger'}`}>
                          {isPartial ? 'PARTIAL (DP)' : 'BELUM DIBAYAR'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleBayarHutang(po.id, outstanding)}>
                          Bayar Hutang
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {activeTab === 'Piutang' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Pihak / Staf</th>
                <th>Keterangan</th>
                <th>Tgl Pengakuan</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Outstanding</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.cashAdvances
                .filter(c => c.nama_staf.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{c.nama_staf}</td>
                    <td>Uang Muka Staf - {c.tujuan}</td>
                    <td>{c.tgl_kasbon}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(c.jumlah_advance)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(c.sisa_kasbon)}</td>
                    <td>
                      <span className={`status-badge ${c.status === 'settled' ? 'status-success' : 'status-warning'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Transfer Antar Rekening' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>No Transfer</th>
                <th>Dari Rekening (Kredit)</th>
                <th>Ke Rekening (Debet)</th>
                <th style={{ textAlign: 'right' }}>Jumlah Transfer</th>
                <th style={{ textAlign: 'right' }}>Biaya Admin</th>
                <th>Keterangan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.internalTransfers
                .filter(t => t.nomor_transfer.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((t, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{t.nomor_transfer}</td>
                    <td>{t.dari_rekening_id}</td>
                    <td>{t.ke_rekening_id}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(t.jumlah)}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(t.biaya_transfer)}</td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{t.keterangan || '-'}</td>
                    <td>
                      <span className={`status-badge ${t.status === 'completed' ? 'status-success' : 'status-warning'}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {t.status === 'pending' && (
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleCompleteTransfer(t.id)}>
                          Selesaikan
                        </button>
                      )}
                      {t.status === 'completed' && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Selesai</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* TRANSFER MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Transfer Dana Antar Bank</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Dari Rekening</label>
                  <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.dari_rekening_id} onChange={e => setFormFields({...formFields, dari_rekening_id: e.target.value})}>
                    <option value="101.02.004.000">E-Wallet Xendit</option>
                    <option value="101.02.006.000">QRIS Settlement</option>
                    <option value="101.02.001.000">BCA — Transfer Manual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Ke Rekening</label>
                  <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.ke_rekening_id} onChange={e => setFormFields({...formFields, ke_rekening_id: e.target.value})}>
                    <option value="101.02.001.000">BCA — Transfer Manual</option>
                    <option value="101.02.002.000">Mandiri — Transfer Manual</option>
                    <option value="101.01.001.000">Kas Pusat</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nominal Transfer (Rp)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jumlah || ''} onChange={e => setFormFields({...formFields, jumlah: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Biaya Transfer (Rp)</label>
                  <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.biaya_transfer || ''} onChange={e => setFormFields({...formFields, biaya_transfer: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Keterangan</label>
                <textarea rows={3} placeholder="cth. Top-up saldo BCA untuk pencairan program"
                  style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={formFields.keterangan || ''} onChange={e => setFormFields({...formFields, keterangan: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Kirim Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HutangPiutang;
