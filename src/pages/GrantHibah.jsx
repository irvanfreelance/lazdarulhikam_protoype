import React, { useState, useEffect } from 'react';
import {
  Gift, Calendar, CheckSquare, Search, Plus, Filter, ArrowDownCircle, Send
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData, generateIdTrans } from '../utils/accountingStore';

const KURS = { USD: 16250, EUR: 17600, IDR: 1 };

const GrantHibah = () => {
  const [activeTab, setActiveTab] = useState('Master Grant');
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

  const openAddGrantModal = () => {
    setFormFields({ donor: '', program: '', currency: 'IDR', nilai_valas: '', total_grant: '', jenis_dana: 'terikat_sementara' });
    setIsModalOpen(true);
  };

  const handleSaveGrant = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const currency = formFields.currency || 'IDR';
    const isForeign = currency !== 'IDR';
    const totalGrant = isForeign
      ? (parseFloat(formFields.nilai_valas) || 0) * KURS[currency]
      : parseFloat(formFields.total_grant) || 0;

    const newGrant = {
      id: String(store.grants.length + 1),
      donor: formFields.donor,
      program: formFields.program,
      currency,
      nilai_valas: isForeign ? parseFloat(formFields.nilai_valas) || 0 : 0,
      kurs: isForeign ? KURS[currency] : 1,
      total_grant: totalGrant,
      terpakai: 0,
      jenis_dana: formFields.jenis_dana,
      status: 'aktif'
    };

    updateAccountingData('laz_grants', [...store.grants, newGrant]);
    setIsModalOpen(false);
    reloadData();
  };

  const handleSubmitLpj = (report) => {
    const store = getAccountingData();
    const updated = store.grantReports.map(r =>
      (r.grant_nama === report.grant_nama && r.jenis_laporan === report.jenis_laporan)
        ? { ...r, status: 'submitted', submitted_at: new Date().toISOString().substring(0, 10) }
        : r
    );
    updateAccountingData('laz_grant_reports', updated);
    reloadData();
  };

  const handleCairkanTermin = (disbId) => {
    const store = getAccountingData();
    const disbIndex = store.grantDisbursements.findIndex(d => d.id === disbId);
    if (disbIndex === -1) return;

    const disb = store.grantDisbursements[disbIndex];
    if (disb.status === 'cair') return;

    // Create Penerimaan Transaction
    const transId = generateIdTrans('GRT');
    const newTransaction = {
      id: String(store.penerimaan.length + 1),
      id_trans: transId,
      tgl: new Date().toISOString(),
      donatur: 'Grant: ' + (store.grants.find(g => g.id === disb.grant_id)?.donor || 'Donor'),
      channel: 'Transfer Bank',
      coa: '401.09.001.000', // Pendapatan Hibah Grant
      nominal: disb.nominal,
      status: 'PAID',
      note: `Pencairan Grant Termin ${disb.termin}`
    };

    // Add to bank balance
    const updatedSaldo = store.saldo.map(acc => {
      if (acc.coa === disb.coa_bank || acc.coa === '101.02.001.000') {
        return { ...acc, saldo: acc.saldo + disb.nominal };
      }
      return acc;
    });

    // Update termin status
    const updatedDisb = store.grantDisbursements.map(d => d.id === disbId ? { ...d, status: 'cair', tgl_cair: new Date().toISOString().substring(0, 10) } : d);

    updateAccountingData('laz_grant_disbursements', updatedDisb);
    updateAccountingData('laz_penerimaan', [newTransaction, ...store.penerimaan]);
    updateAccountingData('laz_saldo', updatedSaldo);
    
    alert('Termin Grant berhasil dicairkan! Pendapatan hibah terposting dan saldo rekening ter-update.');
    reloadData();
  };

  const totalGrantAmount = data.grants.reduce((sum, g) => sum + g.total_grant, 0);

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Penerimaan Grant & Hibah</h1>
          <p>Mencatat beasiswa/dana terikat dari institusi donor, milestone pencairan termin, dan laporan pertanggungjawaban (LPJ)</p>
        </div>
        {activeTab === 'Master Grant' && (
          <div>
            <button className="btn btn-primary" onClick={openAddGrantModal}>
              <Plus size={16} /> Tambah Grant
            </button>
          </div>
        )}
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
              <Gift size={20} />
            </div>
            <div className="stat-title">Total Nilai Kontrak Grant</div>
          </div>
          <div className="stat-value">{formatRupiah(totalGrantAmount)}</div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Master Grant', 'Pencairan Termin', 'Piutang Grant', 'Laporan LPJ'].map(tab => (
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
        {activeTab === 'Master Grant' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Pemberi Grant (Donor)</th>
                <th>Program Kerja</th>
                <th>Mata Uang</th>
                <th style={{ textAlign: 'right' }}>Nilai Valas</th>
                <th style={{ textAlign: 'right' }}>Total Grant (IDR)</th>
                <th style={{ textAlign: 'right' }}>Dana Terpakai (IDR)</th>
                <th>Klasifikasi PSAK 45</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.grants
                .filter(g => g.donor.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((g, idx) => {
                  const currency = g.currency || (g.donor.includes('UNICEF') || g.donor.includes('Islamic Development Bank') ? 'USD' : 'IDR');
                  const isForeign = currency !== 'IDR';
                  const valas = g.nilai_valas || (isForeign ? g.total_grant / KURS[currency] : 0);

                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{g.donor}</td>
                      <td>{g.program}</td>
                      <td>{currency}</td>
                      <td style={{ textAlign: 'right' }}>{isForeign ? `$${valas.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(g.total_grant)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatRupiah(g.terpakai)}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 600 }}>
                          {g.jenis_dana.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge status-success">{g.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}

        {activeTab === 'Pencairan Termin' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Termin</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>Rencana Tanggal</th>
                <th>Tanggal Cair</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.grantDisbursements.map((d, idx) => {
                const donor = data.grants.find(g => g.id === d.grant_id)?.donor || 'Donor';
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{donor}</td>
                    <td>Termin ke-{d.termin}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(d.nominal)}</td>
                    <td>{d.tgl_rencana}</td>
                    <td>{d.tgl_cair || '-'}</td>
                    <td>
                      <span className={`status-badge ${d.status === 'cair' ? 'status-success' : 'status-warning'}`}>
                        {d.status === 'cair' ? 'CAIR' : 'RENCANA'}
                      </span>
                    </td>
                    <td>
                      {d.status === 'rencana' ? (
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleCairkanTermin(d.id)}>
                          <ArrowDownCircle size={14} /> Cairkan Termin
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Linked to Revenue</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'Laporan LPJ' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Laporan LPJ</th>
                <th>Batas Pengiriman</th>
                <th>Tgl Dikirim</th>
                <th>Status Laporan</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.grantReports
                .filter(r => r.pemberi.toLowerCase().includes(searchTerm.toLowerCase()) || r.grant_nama.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{r.pemberi}</td>
                    <td>{r.grant_nama} — {r.jenis_laporan}</td>
                    <td>{r.deadline}</td>
                    <td>{r.submitted_at || '-'}</td>
                    <td>
                      <span className={`status-badge ${r.status === 'accepted' ? 'status-success' : r.status === 'submitted' ? 'status-info' : 'status-warning'}`}>
                        {r.status === 'accepted' ? 'DITERIMA' : r.status === 'submitted' ? 'SEDANG DIREVIEW' : 'BELUM DIKIRIM'}
                      </span>
                    </td>
                    <td>
                      {r.status === 'pending' ? (
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleSubmitLpj(r)}>
                          <Send size={14} /> Kirim Laporan
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Piutang Grant' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Program</th>
                <th style={{ textAlign: 'right' }}>Total Komitmen Grant</th>
                <th style={{ textAlign: 'right' }}>Sudah Cair</th>
                <th style={{ textAlign: 'right' }}>Piutang Grant (Belum Cair)</th>
                <th>Status Piutang</th>
              </tr>
            </thead>
            <tbody>
              {data.grants.map((g, idx) => {
                const sudahCair = data.grantDisbursements.filter(d => d.grant_id === g.id && d.status === 'cair').reduce((sum, d) => sum + d.nominal, 0);
                const piutang = g.total_grant - sudahCair;
                if (piutang <= 0) return null;
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{g.donor}</td>
                    <td>{g.program}</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(g.total_grant)}</td>
                    <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(sudahCair)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#f59e0b' }}>{formatRupiah(piutang)}</td>
                    <td>
                      <span className="status-badge status-warning">WAITING</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL ADD GRANT */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Grant / Hibah</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveGrant}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Pemberi Grant (Donor)</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.donor || ''} onChange={e => setFormFields({ ...formFields, donor: e.target.value })} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Program Kerja</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.program || ''} onChange={e => setFormFields({ ...formFields, program: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Mata Uang</label>
                  <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.currency || 'IDR'} onChange={e => setFormFields({ ...formFields, currency: e.target.value })}>
                    <option value="IDR">IDR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>
                    {formFields.currency && formFields.currency !== 'IDR' ? `Nilai Valas (${formFields.currency})` : 'Total Grant (Rp)'}
                  </label>
                  {formFields.currency && formFields.currency !== 'IDR' ? (
                    <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.nilai_valas || ''} onChange={e => setFormFields({ ...formFields, nilai_valas: e.target.value })} />
                  ) : (
                    <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                      value={formFields.total_grant || ''} onChange={e => setFormFields({ ...formFields, total_grant: e.target.value })} />
                  )}
                </div>
              </div>
              {formFields.currency && formFields.currency !== 'IDR' && (
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '14px' }}>
                  Kurs {formFields.currency}: {formatRupiah(KURS[formFields.currency])} → Setara {formatRupiah((parseFloat(formFields.nilai_valas) || 0) * KURS[formFields.currency])}
                </p>
              )}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Klasifikasi PSAK 45</label>
                <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.jenis_dana || 'terikat_sementara'} onChange={e => setFormFields({ ...formFields, jenis_dana: e.target.value })}>
                  <option value="terikat_sementara">Terikat Sementara</option>
                  <option value="terikat_permanen">Terikat Permanen</option>
                  <option value="tidak_terikat">Tidak Terikat</option>
                </select>
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

export default GrantHibah;
