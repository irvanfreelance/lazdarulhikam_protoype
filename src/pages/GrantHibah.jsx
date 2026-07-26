import React, { useState, useEffect } from 'react';
import { 
  Gift, Calendar, CheckSquare, Search, Plus, Filter, ArrowDownCircle
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData, generateIdTrans } from '../utils/accountingStore';

const GrantHibah = () => {
  const [activeTab, setActiveTab] = useState('Master Grant');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

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
                  const isForeign = g.donor.includes('UNICEF') || g.donor.includes('Islamic Development Bank');
                  const currency = isForeign ? 'USD' : 'IDR';
                  const valas = isForeign ? g.total_grant / 16250 : 0;
                  
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
                <th>Status Laporan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 500 }}>Astra Foundation</td>
                <td>Laporan Keuangan Tahap 1 Beasiswa Dhuafa</td>
                <td>2026-08-30</td>
                <td>
                  <span className="status-badge status-warning">SEDANG DIREVIEW</span>
                </td>
              </tr>
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
    </div>
  );
};

export default GrantHibah;
