import React, { useState, useEffect } from 'react';
import { 
  Receipt, Wallet, FileText, ShoppingCart, Search, Plus, Filter, CheckCircle, Play, CheckSquare, X
} from 'lucide-react';
import {
  getAccountingData, payExpenseAction, disburseCashAdvanceAction, settleCashAdvanceAction, payPurchaseOrderAction, updateAccountingData, formatRupiah
} from '../utils/accountingStore';

const KAS_KECIL_COA = '101.01.002.000';

const PengeluaranOps = () => {
  const [activeTab, setActiveTab] = useState('Reimbursement / Expense');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formFields, setFormFields] = useState({});

  // Store data
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);

    if (type.includes('add')) {
      if (type === 'expense_add') {
        setFormFields({
          judul: '',
          jenis: 'reimbursement',
          total_amount: '',
          coa_debet: '502.03.000.000',
          coa_kredit: '101.01.001.000',
          status: 'draft'
        });
      } else if (type === 'kasbon_add') {
        setFormFields({
          nik_staf: 'STF002',
          nama_staf: 'Ahmad Faisal',
          jumlah_advance: '',
          tujuan: '',
          tgl_jatuh_tempo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
        });
      } else if (type === 'po_add') {
        setFormFields({
          vendor_id: '1',
          campaign_id: '1',
          judul: '',
          total_amount: '',
          dp_amount: '0'
        });
      }
    } else if (type === 'kasbon_settle' && item) {
      setFormFields({
        id: item.id,
        nomor_kasbon: item.nomor_kasbon,
        nama_staf: item.nama_staf,
        jumlah_advance: item.jumlah_advance,
        jumlah_direalisasi: '',
        jumlah_dikembalikan: ''
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();

    if (modalType === 'expense_add') {
      const newExp = {
        id: String(store.expenseRequests.length + 1),
        nomor_expense: `EXP-2026-000${store.expenseRequests.length + 1}`,
        judul: formFields.judul,
        jenis: formFields.jenis,
        total_amount: parseFloat(formFields.total_amount) || 0,
        coa_debet: formFields.coa_debet,
        coa_kredit: formFields.coa_kredit,
        status: 'draft',
        nik_pengaju: 'STF001',
        tgl_pengajuan: new Date().toISOString().substring(0, 10)
      };
      updateAccountingData('laz_expense_requests', [newExp, ...store.expenseRequests]);
    } else if (modalType === 'kasbon_add') {
      const newKb = {
        id: String(store.cashAdvances.length + 1),
        nomor_kasbon: `CSB-2026-000${store.cashAdvances.length + 1}`,
        nik_staf: formFields.nik_staf,
        nama_staf: formFields.nama_staf,
        jumlah_advance: parseFloat(formFields.jumlah_advance) || 0,
        tujuan: formFields.tujuan,
        tgl_kasbon: new Date().toISOString().substring(0, 10),
        tgl_jatuh_tempo: formFields.tgl_jatuh_tempo,
        status: 'active',
        sisa_kasbon: parseFloat(formFields.jumlah_advance) || 0,
        jumlah_direalisasi: 0,
        jumlah_dikembalikan: 0
      };
      // Trigger cash advance disburse automatically
      updateAccountingData('laz_cash_advances', [newKb, ...store.cashAdvances]);
      disburseCashAdvanceAction(newKb.id, '101.02.001.000'); // BCA payment out
    } else if (modalType === 'po_add') {
      const newPo = {
        id: String(store.purchaseOrders.length + 1),
        nomor_po: `PO-2026-000${store.purchaseOrders.length + 1}`,
        vendor_id: formFields.vendor_id,
        campaign_id: formFields.campaign_id ? parseInt(formFields.campaign_id) : null,
        judul: formFields.judul,
        total_amount: parseFloat(formFields.total_amount) || 0,
        dp_amount: parseFloat(formFields.dp_amount) || 0,
        status: 'approved',
        tgl_po: new Date().toISOString().substring(0, 10),
        nik_pembuat: 'STF001'
      };
      updateAccountingData('laz_purchase_orders', [newPo, ...store.purchaseOrders]);
    } else if (modalType === 'kasbon_settle') {
      const realisasi = parseFloat(formFields.jumlah_direalisasi) || 0;
      const kembalian = parseFloat(formFields.jumlah_dikembalikan) || 0;
      settleCashAdvanceAction(formFields.id, realisasi, kembalian);
      alert('Kas bon berhasil di-settle! Biaya realisasi dan sisa pengembalian kas dicatat di jurnal.');
    }

    setIsModalOpen(false);
    reloadData();
  };

  const handleApproveExpense = (id) => {
    const store = getAccountingData();
    const updated = store.expenseRequests.map(x => x.id === id ? { ...x, status: 'approved' } : x);
    updateAccountingData('laz_expense_requests', updated);
    reloadData();
  };

  const handlePayExpense = (id, coaKredit) => {
    payExpenseAction(id, coaKredit);
    reloadData();
    alert('Reimbursement / Expense berhasil dibayar dan diposting ke Keuangan!');
  };

  const handleBayarPO = (poId, outstanding) => {
    if (!window.confirm(`Bayar pelunasan PO sebesar ${formatRupiah(outstanding)} dari BCA — Transfer Manual?`)) return;
    payPurchaseOrderAction(poId, '101.02.001.000');
    alert('Pelunasan PO berhasil diposting! Saldo bank ter-update dan status PO menjadi PAID.');
    reloadData();
  };

  // Stats calculation
  const totalExpense = data.expenseRequests.reduce((sum, e) => sum + e.total_amount, 0);
  const totalKasbon = data.cashAdvances.filter(c => c.status === 'active').reduce((sum, c) => sum + c.sisa_kasbon, 0);

  // Kas Kecil ledger — derived from real pengeluaran/penerimaan mutations touching the Kas Kecil COA
  const kasKecilSaldo = data.saldo.find(s => s.coa === KAS_KECIL_COA)?.saldo || 0;
  const kasKecilMutasi = [
    ...data.pengeluaran
      .filter(p => p.coa === KAS_KECIL_COA || p.coa_bayar === KAS_KECIL_COA)
      .map(p => ({
        key: `exp-${p.id}`,
        tgl: p.tgl,
        keterangan: p.note || p.vendor,
        jenis: p.coa_bayar === KAS_KECIL_COA ? 'Keluar' : 'Masuk',
        jumlah: p.nominal,
        coaLawan: p.coa_bayar === KAS_KECIL_COA ? p.coa : p.coa_bayar
      })),
    ...data.penerimaan
      .filter(p => p.coa === KAS_KECIL_COA)
      .map(p => ({
        key: `rcv-${p.id}`,
        tgl: p.tgl,
        keterangan: p.note || p.donatur,
        jenis: 'Masuk',
        jumlah: p.nominal,
        coaLawan: p.coa
      }))
  ].sort((a, b) => new Date(b.tgl) - new Date(a.tgl));

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Pengeluaran Operasional</h1>
          <p>Kelola reimbursement staf, uang muka kas bon, purchase order ke vendor, dan buku kas kecil</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={() => {
            if (activeTab === 'Reimbursement / Expense') openModal('expense_add');
            else if (activeTab === 'Kas Bon') openModal('kasbon_add');
            else if (activeTab === 'Purchase Order') openModal('po_add');
          }}>
            <Plus size={16} /> 
            {activeTab === 'Reimbursement / Expense' && ' Ajukan Expense'}
            {activeTab === 'Kas Bon' && ' Buat Kas Bon'}
            {activeTab === 'Purchase Order' && ' Buat PO Baru'}
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Receipt size={20} />
            </div>
            <div className="stat-title">Total Reimbursement / Expense</div>
          </div>
          <div className="stat-value">{formatRupiah(totalExpense)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <Wallet size={20} />
            </div>
            <div className="stat-title">Kas Bon Aktif Belum Settle</div>
          </div>
          <div className="stat-value">{formatRupiah(totalKasbon)}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Reimbursement / Expense', 'Kas Bon', 'Purchase Order', 'Kas Kecil'].map(tab => (
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

      {/* DATA TABLES */}
      <div className="data-table-container">
        {activeTab === 'Reimbursement / Expense' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>No Expense</th>
                <th>Judul Pengeluaran</th>
                <th>Jenis</th>
                <th>COA Biaya</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.expenseRequests
                .filter(e => e.judul.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((e, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{e.nomor_expense}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{e.judul}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Oleh: {e.nik_pengaju} | Tgl: {e.tgl_pengajuan}</div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{e.jenis}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
                        {e.coa_debet}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(e.total_amount)}</td>
                    <td>
                      <span className={`status-badge ${
                        e.status === 'paid' ? 'status-success' : 
                        e.status === 'approved' ? 'status-info' : 'status-warning'
                      }`}>
                        {e.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {e.status === 'draft' && (
                          <CheckCircle size={18} color="#10b981" title="Approve" onClick={() => handleApproveExpense(e.id)} />
                        )}
                        {e.status === 'approved' && (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handlePayExpense(e.id, e.coa_kredit)}>
                            Bayar (Posting)
                          </button>
                        )}
                        {e.status === 'paid' && (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Terbayar</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Kas Bon' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>No Kasbon</th>
                <th>Nama Staf</th>
                <th>Tujuan</th>
                <th>Tgl Kasbon</th>
                <th>Jatuh Tempo</th>
                <th style={{ textAlign: 'right' }}>Kasbon</th>
                <th style={{ textAlign: 'right' }}>Realisasi</th>
                <th style={{ textAlign: 'right' }}>Sisa</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.cashAdvances
                .filter(c => c.nama_staf.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((c, idx) => (
                  <tr key={idx}>
                    <td style={{ fontFamily: 'monospace' }}>{c.nomor_kasbon}</td>
                    <td style={{ fontWeight: 500 }}>{c.nama_staf}</td>
                    <td>{c.tujuan}</td>
                    <td>{c.tgl_kasbon}</td>
                    <td>{c.tgl_jatuh_tempo}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(c.jumlah_advance)}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(c.jumlah_direalisasi)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(c.sisa_kasbon)}</td>
                    <td>
                      <span className={`status-badge ${c.status === 'settled' ? 'status-success' : 'status-warning'}`}>
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {c.status === 'active' && (
                        <button className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid #e2e8f0' }} onClick={() => openModal('kasbon_settle', c)}>
                          Settle Kas Bon
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Purchase Order' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>No PO</th>
                <th>Judul PO</th>
                <th>Vendor</th>
                <th style={{ textAlign: 'right' }}>Total PO</th>
                <th style={{ textAlign: 'right' }}>Uang Muka (DP)</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.purchaseOrders
                .filter(po => po.judul.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((po, idx) => {
                  const vendorName = data.vendors.find(v => v.id === po.vendor_id)?.nama_vendor || 'Vendor';
                  const outstanding = po.total_amount - (po.dp_amount || 0);
                  const isPaid = po.status === 'paid' || (po.dp_amount || 0) >= po.total_amount;
                  return (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{po.nomor_po}</td>
                      <td>{po.judul}</td>
                      <td>{vendorName}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(po.total_amount)}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(po.dp_amount)}</td>
                      <td>
                        <span className={`status-badge ${isPaid ? 'status-success' : 'status-warning'}`}>{po.status.toUpperCase()}</span>
                      </td>
                      <td>
                        {isPaid ? (
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Lunas</span>
                        ) : (
                          <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleBayarPO(po.id, outstanding)}>
                            Bayar Pelunasan
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {activeTab === 'Kas Kecil' && (
          <div>
            <div className="stat-card" style={{ maxWidth: '320px', marginBottom: '16px' }}>
              <div className="stat-header">
                <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
                  <Wallet size={20} />
                </div>
                <div className="stat-title">Saldo Kas Kecil Saat Ini</div>
              </div>
              <div className="stat-value">{formatRupiah(kasKecilSaldo)}</div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan</th>
                  <th>Jenis</th>
                  <th style={{ textAlign: 'right' }}>Jumlah</th>
                  <th>COA Lawan</th>
                </tr>
              </thead>
              <tbody>
                {kasKecilMutasi.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada mutasi Kas Kecil</td></tr>
                )}
                {kasKecilMutasi
                  .filter(m => (m.keterangan || '').toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(m => (
                    <tr key={m.key}>
                      <td>{new Date(m.tgl).toLocaleString('id-ID')}</td>
                      <td>{m.keterangan}</td>
                      <td>{m.jenis}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: m.jenis === 'Keluar' ? '#ef4444' : '#10b981' }}>
                        {m.jenis === 'Keluar' ? '- ' : '+ '}{formatRupiah(m.jumlah)}
                      </td>
                      <td>{m.coaLawan || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {modalType === 'expense_add' && 'Ajukan Pengeluaran / Reimbursement'}
                {modalType === 'kasbon_add' && 'Buat Uang Muka Kas Bon'}
                {modalType === 'po_add' && 'Buat Purchase Order Baru'}
                {modalType === 'kasbon_settle' && 'Settle Kas Bon Staf'}
              </h2>
              <X size={20} style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(false)} />
            </div>
            <form onSubmit={handleSave}>
              {modalType === 'expense_add' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Judul Pengeluaran</label>
                    <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.judul || ''} onChange={e => setFormFields({...formFields, judul: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jenis</label>
                      <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.jenis} onChange={e => setFormFields({...formFields, jenis: e.target.value})}>
                        <option value="reimbursement">Reimbursement</option>
                        <option value="pembayaran_langsung">Pembayaran Langsung</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Total Nominal (Rp)</label>
                      <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.total_amount || ''} onChange={e => setFormFields({...formFields, total_amount: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>COA Debet</label>
                      <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.coa_debet} onChange={e => setFormFields({...formFields, coa_debet: e.target.value})}>
                        <option value="502.03.000.000">502.03 (Beban Ops Kantor)</option>
                        <option value="502.01.000.000">502.01 (Biaya PG Platform)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>COA Kredit (Rek Pembayar)</label>
                      <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.coa_kredit} onChange={e => setFormFields({...formFields, coa_kredit: e.target.value})}>
                        <option value="101.02.001.000">101.02.001 (BCA)</option>
                        <option value="101.01.001.000">101.01.001 (Kas Pusat)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {modalType === 'kasbon_add' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Staf Penerima Uang Muka</label>
                    <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.nik_staf} onChange={e => {
                        const emp = data.employees.find(emp => emp.nik === e.target.value);
                        setFormFields({...formFields, nik_staf: e.target.value, nama_staf: emp ? emp.nama : ''});
                      }}>
                      {data.employees.map(emp => (
                        <option key={emp.nik} value={emp.nik}>{emp.nama} ({emp.nik})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jumlah Kasbon (Rp)</label>
                      <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.jumlah_advance || ''} onChange={e => setFormFields({...formFields, jumlah_advance: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Tanggal Jatuh Tempo</label>
                      <input type="date" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.tgl_jatuh_tempo || ''} onChange={e => setFormFields({...formFields, tgl_jatuh_tempo: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Tujuan Kas Bon</label>
                    <textarea required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', height: '80px' }}
                      value={formFields.tujuan || ''} onChange={e => setFormFields({...formFields, tujuan: e.target.value})} />
                  </div>
                </>
              )}

              {modalType === 'po_add' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Vendor / Supplier</label>
                    <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.vendor_id} onChange={e => setFormFields({...formFields, vendor_id: e.target.value})}>
                      {data.vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.nama_vendor}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Judul PO / Pembelian</label>
                    <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.judul || ''} onChange={e => setFormFields({...formFields, judul: e.target.value})} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Total Pembelian (Rp)</label>
                      <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.total_amount || ''} onChange={e => setFormFields({...formFields, total_amount: e.target.value})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Uang Muka / DP (Rp)</label>
                      <input type="number" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.dp_amount || ''} onChange={e => setFormFields({...formFields, dp_amount: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {modalType === 'kasbon_settle' && (
                <>
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.875rem' }}>
                    <strong>Kas Bon:</strong> {formFields.nomor_kasbon} <br />
                    <strong>Staf:</strong> {formFields.nama_staf} <br />
                    <strong>Nominal Awal:</strong> {formatRupiah(formFields.jumlah_advance)}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jumlah Direalisasi (Rp)</label>
                      <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.jumlah_direalisasi || ''} onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          const sisa = Math.max(0, formFields.jumlah_advance - val);
                          setFormFields({...formFields, jumlah_direalisasi: e.target.value, jumlah_dikembalikan: sisa});
                        }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kembalian Kas (Rp)</label>
                      <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                        value={formFields.jumlah_dikembalikan || ''} onChange={e => setFormFields({...formFields, jumlah_dikembalikan: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan & Proses</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengeluaranOps;
