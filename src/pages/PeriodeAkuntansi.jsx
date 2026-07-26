import React, { useState, useEffect } from 'react';
import { 
  Calendar, Lock, Unlock, Search, Plus, Filter, AlertCircle
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';

const PeriodeAkuntansi = () => {
  const [activeTab, setActiveTab] = useState('Daftar Periode');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  const handleTutupBuku = (periodId) => {
    if (!window.confirm('Apakah Anda yakin ingin melakukan TUTUP BUKU pada periode ini? Transaksi pada periode tertutup tidak dapat diubah kembali.')) return;
    
    const store = getAccountingData();
    const updated = store.accountingPeriods.map(p => {
      if (p.id === periodId) {
        return {
          ...p,
          status: 'closed',
          closed_at: new Date().toISOString().substring(0, 10),
          closing_summary: 'Ditutup secara otomatis. Jurnal kliring ekuitas dibuat.'
        };
      }
      return p;
    });

    updateAccountingData('laz_accounting_periods', updated);
    alert('Periode akuntansi berhasil ditutup buku! Saldo akhir terposting ke awal periode berikutnya.');
    reloadData();
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Periode Akuntansi & Tutup Buku</h1>
          <p>Kelola daftar periode buku bulanan yayasan, lakukan penutupan buku jurnal, dan posting ayat jurnal penyesuaian (AJE)</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Daftar Periode', 'Jurnal Penyesuaian'].map(tab => (
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

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Daftar Periode' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Periode</th>
                <th>Status Periode</th>
                <th>Tanggal Ditutup</th>
                <th>Keterangan / Surplus-Defisit</th>
                <th>Aksi Tutup Buku</th>
              </tr>
            </thead>
            <tbody>
              {data.accountingPeriods.map((p, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{p.nama_periode}</td>
                  <td>
                    <span className={`status-badge ${p.status === 'closed' ? 'status-success' : 'status-warning'}`}>
                      {p.status === 'closed' ? 'CLOSED' : 'OPEN'}
                    </span>
                  </td>
                  <td>{p.closed_at || '-'}</td>
                  <td>{p.closing_summary || 'Transaksi berjalan belum dikunci'}</td>
                  <td>
                    {p.status === 'open' ? (
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleTutupBuku(p.id)}>
                        <Lock size={12} /> Jalankan Tutup Buku
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Buku Dikunci</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Jurnal Penyesuaian' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Periode</th>
                <th>Tipe AJE</th>
                <th>Keterangan Penyesuaian</th>
                <th>COA Debet</th>
                <th>COA Kredit</th>
                <th style={{ textAlign: 'right' }}>Nominal</th>
                <th>Petugas</th>
              </tr>
            </thead>
            <tbody>
              {data.jurnalPenyesuaian.map((aje, idx) => (
                <tr key={idx}>
                  <td>{aje.period}</td>
                  <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>{aje.jenis_aje}</td>
                  <td style={{ fontWeight: 500 }}>{aje.keterangan}</td>
                  <td>{aje.coa_debet}</td>
                  <td>{aje.coa_kredit}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(aje.nominal)}</td>
                  <td>{aje.nik_input}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PeriodeAkuntansi;
