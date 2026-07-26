import React, { useState, useEffect } from 'react';
import {
  Database, Plus, Search, FolderTree, Landmark, Settings
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData, COAS_ALL } from '../utils/accountingStore';

const MasterDataKeuangan = () => {
  const [activeTab, setActiveTab] = useState('Chart of Accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});

  const reloadData = () => setData(getAccountingData());

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  const openAddRekening = () => {
    setFormFields({ coa: '', nama: '', saldo: '' });
    setIsModalOpen(true);
  };

  const handleSaveRekening = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const newAcc = {
      coa: formFields.coa,
      nama: formFields.nama,
      saldo: parseFloat(formFields.saldo) || 0
    };
    updateAccountingData('laz_saldo', [...store.saldo, newAcc]);
    setIsModalOpen(false);
    reloadData();
  };

  const openAddKurs = () => {
    setFormFields({ mata_uang: 'USD', kurs: '' });
    setIsModalOpen(true);
  };

  const handleSaveKurs = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const existingIdx = store.kursValas.findIndex(k => k.mata_uang === formFields.mata_uang);
    const today = new Date().toISOString().substring(0, 10);
    let updated;
    if (existingIdx >= 0) {
      updated = [...store.kursValas];
      updated[existingIdx] = { ...updated[existingIdx], kurs: parseFloat(formFields.kurs) || 0, tgl_update: today };
    } else {
      updated = [...store.kursValas, { id: String(store.kursValas.length + 1), mata_uang: formFields.mata_uang, kurs: parseFloat(formFields.kurs) || 0, tgl_update: today }];
    }
    updateAccountingData('laz_kurs_valas', updated);
    setIsModalOpen(false);
    reloadData();
  };

  // Mapping Saldo Dana — same PSAK 109/409 fund movement calculation used in LaporanPSAK409.jsx, kept in sync
  const movement = (coaList, isRevenue) => coaList.reduce((sum, coa) => {
    const debit = data.pengeluaran.filter(p => p.coa === coa && p.status === 'PAID').reduce((s, p) => s + p.nominal, 0)
      + data.jurnalPenyesuaian.filter(a => a.coa_debet === coa).reduce((s, a) => s + a.nominal, 0);
    const credit = data.penerimaan.filter(p => p.coa === coa && p.status === 'PAID').reduce((s, p) => s + p.nominal, 0)
      + data.jurnalPenyesuaian.filter(a => a.coa_kredit === coa).reduce((s, a) => s + a.nominal, 0);
    return sum + (isRevenue ? credit - debit : debit - credit);
  }, 0);

  const zakatNet = movement(['401.05.001.000'], true) - movement(['501.05.000.000'], false);
  const infakNet = movement(['401.01.001.000', '401.02.001.000', '401.04.001.000', '401.08.001.000', '401.09.001.000'], true)
    - movement(['501.01.000.000', '501.02.000.000', '501.03.000.000'], false);
  const amilNet = movement(['401.07.001.000'], true)
    - movement(['502.01.000.000', '502.03.000.000', '502.04.000.000', '502.05.000.000'], false);

  const danaMapping = [
    {
      coa: '300.06.000.000',
      kategori: 'Dana Zakat',
      mappingPenerimaan: '401.05',
      mappingPengeluaran: '501.05 (Penyaluran Zakat)',
      saldo: 80000000 + zakatNet
    },
    {
      coa: '300.07.000.000',
      kategori: 'Dana Infak/Sedekah',
      mappingPenerimaan: '401.01, 401.02, 401.04, 401.08, 401.09',
      mappingPengeluaran: '501.01, 501.02, 501.03',
      saldo: 220000000 + infakNet
    },
    {
      coa: '300.08.000.000',
      kategori: 'Dana Amil',
      mappingPenerimaan: '401.07 (termasuk reklasifikasi Hak Amil)',
      mappingPengeluaran: 'Seluruh 502.xx (beban operasional)',
      saldo: 30000000 + amilNet
    },
    {
      coa: '300.09.000.000',
      kategori: 'Dana Non Halal',
      mappingPenerimaan: 'Belum ada COA tercatat',
      mappingPengeluaran: '-',
      saldo: 0
    }
  ];

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Master Data Keuangan</h1>
          <p>Konfigurasi Chart of Accounts (COA), data bank organisasi, rekening kas, dan mapping dana PSAK 409</p>
        </div>
        {activeTab === 'Bank & Rekening' && (
          <div>
            <button className="btn btn-primary" onClick={openAddRekening}>
              <Plus size={16} /> Tambah Rekening
            </button>
          </div>
        )}
        {activeTab === 'Master Kurs Valas' && (
          <div>
            <button className="btn btn-primary" onClick={openAddKurs}>
              <Plus size={16} /> Tambah / Update Kurs
            </button>
          </div>
        )}
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
                {data.saldo
                  .filter(acc => acc.nama.toLowerCase().includes(searchTerm.toLowerCase()) || acc.coa.includes(searchTerm))
                  .map((acc, idx) => (
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
                <th style={{ textAlign: 'right' }}>Saldo Saat Ini</th>
              </tr>
            </thead>
            <tbody>
              {danaMapping.map((m, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.coa}</td>
                  <td>{m.kategori}</td>
                  <td>{m.mappingPenerimaan}</td>
                  <td>{m.mappingPengeluaran}</td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(m.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'Master Kurs Valas' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Database size={20} color="#64748b" />
              <strong style={{ fontSize: '0.95rem' }}>Data Kurs Valuta Asing (IDR)</strong>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal Update</th>
                  <th>Mata Uang</th>
                  <th style={{ textAlign: 'right' }}>Kurs (IDR)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.kursValas.map((k, idx) => (
                  <tr key={idx}>
                    <td>{k.tgl_update}</td>
                    <td style={{ fontWeight: 600 }}>{k.mata_uang}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{formatRupiah(k.kurs)}</td>
                    <td><span className="status-badge status-success">AKTIF</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: TAMBAH REKENING */}
      {isModalOpen && activeTab === 'Bank & Rekening' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '460px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Rekening Bank/Kas</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveRekening}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kode COA</label>
                <input type="text" required placeholder="cth. 101.02.008.000" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'monospace' }}
                  value={formFields.coa || ''} onChange={e => setFormFields({ ...formFields, coa: e.target.value })} />
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Nama Rekening</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.nama || ''} onChange={e => setFormFields({ ...formFields, nama: e.target.value })} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Saldo Awal (Rp)</label>
                <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.saldo || ''} onChange={e => setFormFields({ ...formFields, saldo: e.target.value })} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH/UPDATE KURS */}
      {isModalOpen && activeTab === 'Master Kurs Valas' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '420px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Update Kurs Valas</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSaveKurs}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Mata Uang</label>
                <select style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.mata_uang || 'USD'} onChange={e => setFormFields({ ...formFields, mata_uang: e.target.value })}>
                  <option value="USD">USD (Dolar AS)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kurs (IDR)</label>
                <input type="number" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.kurs || ''} onChange={e => setFormFields({ ...formFields, kurs: e.target.value })} />
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

export default MasterDataKeuangan;
