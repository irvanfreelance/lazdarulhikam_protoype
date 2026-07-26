import React, { useState, useEffect } from 'react';
import { 
  Database, Plus, Search, FolderTree, Landmark, Settings
} from 'lucide-react';
import { getAccountingData, formatRupiah, COAS_ALL } from '../utils/accountingStore';

const MasterDataKeuangan = () => {
  const [activeTab, setActiveTab] = useState('Chart of Accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Master Data Keuangan</h1>
          <p>Konfigurasi Chart of Accounts (COA), data bank organisasi, rekening kas, dan mapping dana PSAK 45</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Chart of Accounts', 'Bank & Rekening', 'Mapping Saldo Dana', 'Master Kurs Valas'].map(tab => (
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
        {activeTab === 'Chart of Accounts' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <FolderTree size={20} color="#64748b" />
              <strong style={{ fontSize: '0.95rem' }}>Tree View Level 4 — Hierarki Chart of Accounts</strong>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Kode Akun (COA)</th>
                  <th>Nama Akun Keuangan</th>
                  <th>Level</th>
                  <th>Tipe</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(COAS_ALL)
                  .filter(([coa, label]) => label.toLowerCase().includes(searchTerm.toLowerCase()) || coa.includes(searchTerm))
                  .map(([coa, label], idx) => {
                    const isParent = coa.endsWith('.000');
                    const depth = coa.split('.').filter((x, i) => x !== '000' || i === 0).length;
                    const paddingLeft = (depth - 1) * 20;

                    return (
                      <tr key={idx} style={{ background: isParent ? '#f8fafc' : 'white' }}>
                        <td style={{ fontFamily: 'monospace', fontWeight: isParent ? 'bold' : 'normal' }}>{coa}</td>
                        <td style={{ paddingLeft: `${paddingLeft + 12}px`, fontWeight: isParent ? 600 : 'normal' }}>
                          {label.substring(coa.length + 2).replace(/[()]/g, '')}
                        </td>
                        <td>Level {depth}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', background: isParent ? '#e2e8f0' : '#f1f5f9', padding: '3px 6px', borderRadius: '4px' }}>
                            {coa.startsWith('1') ? 'Aktiva' : coa.startsWith('2') ? 'Kewajiban' : coa.startsWith('3') ? 'Ekuitas/Dana' : coa.startsWith('4') ? 'Penerimaan' : 'Beban'}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge status-success">AKTIF</span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Bank & Rekening' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Landmark size={20} color="#64748b" />
              <strong style={{ fontSize: '0.95rem' }}>Daftar Rekening Bank & Settlement Gateway</strong>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Rekening / Channel</th>
                  <th>Bank Ref</th>
                  <th>COA Kas/Bank</th>
                  <th style={{ textAlign: 'right' }}>Saldo Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {data.saldo.map((acc, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600 }}>{acc.nama}</td>
                    <td>{acc.nama.split(' ')[0]}</td>
                    <td style={{ fontFamily: 'monospace' }}>{acc.coa}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>{formatRupiah(acc.saldo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Mapping Saldo Dana' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>COA Sumber Dana (Ekuitas)</th>
                <th>Kategori Dana</th>
                <th>Mapping Akun Penerimaan (4xx)</th>
                <th>Mapping Akun Pengeluaran (5xx)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>300.01.001.000</td>
                <td>Dana Kesehatan</td>
                <td>401.01.001.000 (Donasi Kes. Individu)</td>
                <td>501.01.000.000 (Beban Kes.)</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>300.01.002.000</td>
                <td>Dana Kemanusiaan</td>
                <td>401.02.001.000 (Donasi Bencana)</td>
                <td>501.02.000.000 (Beban Kemanusiaan)</td>
              </tr>
              <tr>
                <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>300.02.001.000</td>
                <td>Zakat Profesi & Maal</td>
                <td>401.05.001.000 (Penerimaan Zakat)</td>
                <td>501.05.000.000 (Penyaluran Zakat)</td>
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'Master Kurs Valas' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Database size={20} color="#64748b" />
              <strong style={{ fontSize: '0.95rem' }}>Data Kurs Harian Valuta Asing (IDR)</strong>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal Berubah</th>
                  <th>Mata Uang</th>
                  <th style={{ textAlign: 'right' }}>Kurs Beli</th>
                  <th style={{ textAlign: 'right' }}>Kurs Tengah (BI)</th>
                  <th style={{ textAlign: 'right' }}>Kurs Jual</th>
                  <th>Status Aktif</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>2026-07-26</td>
                  <td style={{ fontWeight: 600 }}>USD (Dolar AS)</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(16200)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(16250)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(16300)}</td>
                  <td><span className="status-badge status-success">AKTIF</span></td>
                </tr>
                <tr>
                  <td>2026-07-26</td>
                  <td style={{ fontWeight: 600 }}>EUR (Euro)</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(17600)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(17650)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(17700)}</td>
                  <td><span className="status-badge status-success">AKTIF</span></td>
                </tr>
                <tr>
                  <td>2026-07-25</td>
                  <td style={{ fontWeight: 600 }}>USD (Dolar AS)</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(16150)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(16200)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(16250)}</td>
                  <td><span className="status-badge status-warning">ARCHIVED</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterDataKeuangan;
