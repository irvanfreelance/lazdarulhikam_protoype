import React, { useState, useEffect } from 'react';
import { 
  BarChart3, FileText, Calendar, Search, Download, Eye, ChevronRight
} from 'lucide-react';
import { getAccountingData, formatRupiah, COAS_ALL } from '../utils/accountingStore';

const LaporanPSAK45 = () => {
  const [activeTab, setActiveTab] = useState('Posisi Keuangan (LPK)');
  const [selectedCoa, setSelectedCoa] = useState('101.02.001.000'); // BCA default for ledger
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  // Calculations for LPK (Balance Sheet)
  // Assets
  const cashBalances = data.saldo.reduce((sum, item) => sum + item.saldo, 0);
  const totalReceivables = data.cashAdvances.filter(c => c.status === 'active').reduce((sum, c) => sum + c.sisa_kasbon, 0);
  const totalFixedAssets = 15000000; // Laptop cost
  const totalAccumDep = data.jurnalPenyesuaian
    .filter(aje => aje.coa_kredit === '102.01.001.000')
    .reduce((sum, aje) => sum + aje.nominal, 0);
  const netFixedAssets = totalFixedAssets - totalAccumDep;
  const totalAssets = cashBalances + totalReceivables + netFixedAssets;

  // Liabilities
  const totalPayables = 20000000; // outstanding vendor payables
  const totalZakatDeposits = data.penerimaan
    .filter(p => p.coa === '201.01.000.000')
    .reduce((sum, p) => sum + p.nominal, 0);
  const totalLiabilities = totalPayables + totalZakatDeposits;

  // Net Assets (Equities)
  // Net assets without donor restriction (Tidak Terikat)
  const totalRevenueUnrestricted = data.penerimaan
    .filter(p => p.status === 'PAID' && (p.coa.startsWith('401.07') || p.coa.startsWith('401.01') || p.coa.startsWith('401.04')))
    .reduce((sum, p) => sum + p.nominal, 0);
  const totalExpenseUnrestricted = data.pengeluaran
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.nominal, 0);
  
  // Zakat is temporary restricted usually or specific campaigns
  const totalRevenueRestricted = data.penerimaan
    .filter(p => p.status === 'PAID' && (p.coa.startsWith('401.02') || p.coa.startsWith('401.05') || p.coa.startsWith('401.08')))
    .reduce((sum, p) => sum + p.nominal, 0);

  const netAssetsUnrestricted = 100000000 + totalRevenueUnrestricted - totalExpenseUnrestricted;
  const netAssetsRestricted = 200000000 + totalRevenueRestricted;
  const netAssetsPermanent = 50000000; // Endowment
  const totalNetAssets = netAssetsUnrestricted + netAssetsRestricted + netAssetsPermanent;

  // Calculations for LA (Laporan Aktivitas)
  // Revenues
  const revKesehatan = data.penerimaan.filter(p => p.coa === '401.01.001.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const revBencana = data.penerimaan.filter(p => p.coa === '401.02.001.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const revPangan = data.penerimaan.filter(p => p.coa === '401.04.001.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const revZakat = data.penerimaan.filter(p => p.coa === '401.05.001.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const revOps = data.penerimaan.filter(p => p.coa === '401.07.001.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const revMasjid = data.penerimaan.filter(p => p.coa === '401.08.001.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const revGrant = data.penerimaan.filter(p => p.coa === '401.09.001.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const totalRevenue = revKesehatan + revBencana + revPangan + revZakat + revOps + revMasjid + revGrant;

  // Expenses
  const expKesehatan = data.pengeluaran.filter(p => p.coa === '501.01.000.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const expBencana = data.pengeluaran.filter(p => p.coa === '501.02.000.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const expPangan = data.pengeluaran.filter(p => p.coa === '501.03.000.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const expZakat = data.pengeluaran.filter(p => p.coa === '501.05.000.000' && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const expOps = data.pengeluaran.filter(p => p.coa.startsWith('502.') && p.status === 'PAID').reduce((sum, p) => sum + p.nominal, 0);
  const totalExpense = expKesehatan + expBencana + expPangan + expZakat + expOps;

  // Running Ledger Transactions
  const getLedgerTransactions = () => {
    const txs = [];
    // From Penerimaan
    data.penerimaan.forEach(p => {
      if (p.coa === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Donasi: ${p.donatur} (${p.note})`, debet: 0, kredit: p.nominal, ref: p.id_trans });
      }
      // If payment went to bank VA/settlement, we debit cash bank and credit revenue
      const bankCoa = p.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000';
      if (bankCoa === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Penerimaan Donasi ${p.donatur}`, debet: p.nominal, kredit: 0, ref: p.id_trans });
      }
    });

    // From Pengeluaran
    data.pengeluaran.forEach(p => {
      if (p.coa === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Beban: ${p.vendor} (${p.note})`, debet: p.nominal, kredit: 0, ref: p.id_trans });
      }
      if (p.coa_bayar === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Pembayaran ${p.vendor}`, debet: 0, kredit: p.nominal, ref: p.id_trans });
      }
    });

    // From AJE (Adjustments)
    data.jurnalPenyesuaian.forEach(aje => {
      if (aje.coa_debet === selectedCoa) {
        txs.push({ tgl: aje.approved_at, desc: `Penyesuaian (AJE): ${aje.keterangan}`, debet: aje.nominal, kredit: 0, ref: `AJE-${aje.id}` });
      }
      if (aje.coa_kredit === selectedCoa) {
        txs.push({ tgl: aje.approved_at, desc: `Penyesuaian (AJE): ${aje.keterangan}`, debet: 0, kredit: aje.nominal, ref: `AJE-${aje.id}` });
      }
    });

    return txs.sort((a, b) => new Date(a.tgl) - new Date(b.tgl));
  };

  const ledgerTxs = getLedgerTransactions();
  const initialBalance = data.saldo.find(acc => acc.coa === selectedCoa)?.saldo || 0;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan Keuangan PSAK 45</h1>
          <p>Laporan Posisi Keuangan, Laporan Aktivitas (L/R), dan Buku Besar yang mematuhi pedoman pelaporan nirlaba PSAK 45</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Posisi Keuangan (LPK)', 'Laporan Aktivitas (LA)', 'Laporan Arus Kas (LAK)', 'Perubahan Aset Bersih', 'Buku Besar per COA'].map(tab => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => reloadData() || setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Posisi Keuangan (LPK)' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Laporan Posisi Keuangan per 31 Desember 2026</h3>
            
            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <tbody>
                {/* ASET */}
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ASET (ASSETS)</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Kas dan Setara Kas</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(cashBalances)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Piutang (Staf / Uang Muka)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalReceivables)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Aset Tetap (Perolehan)</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(totalFixedAssets)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Akumulasi Penyusutan</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalAccumDep)})</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>TOTAL ASET</td>
                  <td style={{ textAlign: 'right', color: '#0ea5e9' }}>{formatRupiah(totalAssets)}</td>
                </tr>

                {/* KEWAJIBAN */}
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">KEWAJIBAN (LIABILITIES)</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Hutang Usaha (Vendor)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalPayables)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Titipan Dana Zakat</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalZakatDeposits)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>TOTAL KEWAJIBAN</td>
                  <td style={{ textAlign: 'right', color: '#f59e0b' }}>{formatRupiah(totalLiabilities)}</td>
                </tr>

                {/* ASET BERSIH */}
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ASET BERSIH (NET ASSETS / EQUITIES)</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Tidak Terikat (Unrestricted)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(netAssetsUnrestricted)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Terikat Sementara (Temporarily Restricted)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(netAssetsRestricted)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Terikat Permanen (Wakaf/Endowment)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(netAssetsPermanent)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>TOTAL ASET BERSIH</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalNetAssets)}</td>
                </tr>

                <tr style={{ background: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #94a3b8' }}>
                  <td>TOTAL KEWAJIBAN & ASET BERSIH</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalLiabilities + totalNetAssets)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Laporan Aktivitas (LA)' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Laporan Aktivitas & Perubahan Aset Bersih</h3>
            
            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <tbody>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">PENERIMAAN & DUKUNGAN (REVENUES)</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Donasi Kesehatan Individu</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(revKesehatan)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Donasi Bencana Alam</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(revBencana)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Sedekah Berbuka Puasa</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(revPangan)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Zakat Profesi & Maal</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(revZakat)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Pendapatan Hibah Grant</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(revGrant)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Infaq Operasional</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(revOps)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Donasi Pembangunan Masjid</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(revMasjid)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', background: '#f1f5f9' }}>
                  <td>TOTAL PENERIMAAN</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalRevenue)}</td>
                </tr>

                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">PENGELUARAN & BEBAN (EXPENSES)</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penyaluran Program Kesehatan</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(expKesehatan)})</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penyaluran Kemanusiaan / Bencana</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(expBencana)})</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penyaluran Program Pangan</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(expPangan)})</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penyaluran Program Zakat</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(expZakat)})</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Biaya Operasional & SDM Penunjang</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(expOps)})</td>
                </tr>
                <tr style={{ fontWeight: 'bold', background: '#f1f5f9' }}>
                  <td>TOTAL PENGELUARAN</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalExpense)})</td>
                </tr>

                <tr style={{ background: '#e2e8f0', fontWeight: 'bold' }}>
                  <td>KENAIKAN (PENURUNAN) ASET BERSIH BERJALAN</td>
                  <td style={{ textAlign: 'right', color: totalRevenue - totalExpense >= 0 ? '#10b981' : '#ef4444' }}>
                    {formatRupiah(totalRevenue - totalExpense)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Laporan Arus Kas (LAK)' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Laporan Arus Kas</h3>
            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <tbody>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ARUS KAS DARI AKTIVITAS OPERASI</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penerimaan Donasi & Zakat</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalRevenue)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Pembayaran Beban Program</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalExpense)})</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>KAS BERSIH DARI AKTIVITAS OPERASI</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalRevenue - totalExpense)}</td>
                </tr>

                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ARUS KAS DARI AKTIVITAS INVESTASI</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Pembelian Aset Tetap</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalFixedAssets)})</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>KAS BERSIH DARI AKTIVITAS INVESTASI</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalFixedAssets)})</td>
                </tr>

                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ARUS KAS DARI AKTIVITAS PENDANAAN</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penerimaan Wakaf / Dana Abadi</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(netAssetsPermanent)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>KAS BERSIH DARI AKTIVITAS PENDANAAN</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(netAssetsPermanent)}</td>
                </tr>

                <tr style={{ background: '#e2e8f0', fontWeight: 'bold' }}>
                  <td>KENAIKAN KAS BERSIH</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(totalRevenue - totalExpense - totalFixedAssets + netAssetsPermanent)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Perubahan Aset Bersih' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Laporan Perubahan Aset Bersih</h3>
            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <th>Uraian</th>
                  <th style={{ textAlign: 'right' }}>Tidak Terikat</th>
                  <th style={{ textAlign: 'right' }}>Terikat Sementara</th>
                  <th style={{ textAlign: 'right' }}>Terikat Permanen</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Saldo Awal Tahun</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(100000000)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(200000000)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(50000000)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(350000000)}</td>
                </tr>
                <tr>
                  <td>Penerimaan Dana</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(totalRevenueUnrestricted)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(totalRevenueRestricted)}</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalRevenue)}</td>
                </tr>
                <tr>
                  <td>Penyaluran / Beban</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalExpenseUnrestricted)})</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>({formatRupiah(totalExpenseUnrestricted)})</td>
                </tr>
                <tr style={{ background: '#fffbeb' }}>
                  <td>Pelepasan Dana Terikat (Release of Restriction)</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalExpenseUnrestricted * 0.4)} <span style={{ fontSize: '0.7rem' }}>(+)</span></td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalExpenseUnrestricted * 0.4)}) <span style={{ fontSize: '0.7rem' }}>(-)</span></td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>-</td>
                </tr>
                <tr style={{ background: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>Saldo Akhir (Sesuai LPK)</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(netAssetsUnrestricted)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(netAssetsRestricted)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(netAssetsPermanent)}</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalNetAssets)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Buku Besar per COA' && (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Pilih Akun Buku Besar:</span>
              <select style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.875rem', minWidth: '320px' }}
                value={selectedCoa} onChange={e => setSelectedCoa(e.target.value)}>
                {Object.entries(COAS_ALL).map(([coa, label]) => (
                  <option key={coa} value={coa}>{label}</option>
                ))}
              </select>
            </div>
            
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan Transaksi</th>
                  <th>Nomor Ref / Bukti</th>
                  <th style={{ textAlign: 'right' }}>Debet</th>
                  <th style={{ textAlign: 'right' }}>Kredit</th>
                  <th style={{ textAlign: 'right' }}>Running Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#f8fafc', fontStyle: 'italic' }}>
                  <td colSpan="3">Saldo Awal Akun Keuangan</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right' }}>-</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(initialBalance)}</td>
                </tr>
                {(() => {
                  let balance = initialBalance;
                  return ledgerTxs.map((t, idx) => {
                    const isAsset = selectedCoa.startsWith('1') || selectedCoa.startsWith('5'); // Debet increases, Kredit decreases
                    if (isAsset) {
                      balance = balance + t.debet - t.kredit;
                    } else {
                      balance = balance + t.kredit - t.debet;
                    }
                    return (
                      <tr key={idx}>
                        <td>{new Date(t.tgl).toLocaleString('id-ID')}</td>
                        <td>{t.desc}</td>
                        <td style={{ fontFamily: 'monospace' }}>{t.ref}</td>
                        <td style={{ textAlign: 'right', color: t.debet > 0 ? '#0ea5e9' : '#94a3b8' }}>{t.debet > 0 ? formatRupiah(t.debet) : '-'}</td>
                        <td style={{ textAlign: 'right', color: t.kredit > 0 ? '#10b981' : '#94a3b8' }}>{t.kredit > 0 ? formatRupiah(t.kredit) : '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(balance)}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanPSAK45;
