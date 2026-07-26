import React, { useState, useEffect } from 'react';
import {
  BarChart3, FileText, Calendar, Search, Download, Eye, ChevronRight
} from 'lucide-react';
import { getAccountingData, formatRupiah, COAS_ALL } from '../utils/accountingStore';

// Opening (carried-forward) fund balances — the only assumed figures in this report.
// Every other number below is recomputed live from the journal recap
// (penerimaan + pengeluaran + jurnalPenyesuaian), per PSAK 109 fund accounting.
const OPENING_DANA_ZAKAT = 80000000;
const OPENING_DANA_INFAK_SEDEKAH = 220000000;
const OPENING_DANA_AMIL = 30000000;
const OPENING_DANA_NON_HALAL = 0;

const DANA_ZAKAT_REVENUE_COA = ['401.05.001.000'];
const DANA_ZAKAT_EXPENSE_COA = ['501.05.000.000'];

const DANA_INFAK_SEDEKAH_REVENUE_COA = ['401.01.001.000', '401.02.001.000', '401.04.001.000', '401.08.001.000', '401.09.001.000'];
const DANA_INFAK_SEDEKAH_EXPENSE_COA = ['501.01.000.000', '501.02.000.000', '501.03.000.000'];

const DANA_AMIL_REVENUE_COA = ['401.07.001.000'];
const DANA_AMIL_EXPENSE_COA = ['502.01.000.000', '502.03.000.000', '502.04.000.000', '502.05.000.000'];

const LaporanPSAK409 = () => {
  const [activeTab, setActiveTab] = useState('Neraca (Posisi Keuangan)');
  const [selectedCoa, setSelectedCoa] = useState('101.02.001.000'); // BCA default for ledger
  const [data, setData] = useState(() => getAccountingData());

  const reloadData = () => {
    setData(getAccountingData());
  };

  useEffect(() => {
    reloadData();
  }, [activeTab]);

  // --- REKAP JURNAL: unified account movement helper ---
  // Rolls up every source that can move a COA balance — penerimaan, pengeluaran,
  // AND jurnal penyesuaian (AJE) — so reclassifications like the Hak Amil claim
  // or auto-depreciation are reflected here too, not just raw transactions.
  const getAccountMovement = (coa) => {
    const debit =
      data.pengeluaran.filter(p => p.coa === coa && p.status === 'PAID').reduce((s, p) => s + p.nominal, 0) +
      data.jurnalPenyesuaian.filter(a => a.coa_debet === coa).reduce((s, a) => s + a.nominal, 0);
    const credit =
      data.penerimaan.filter(p => p.coa === coa && p.status === 'PAID').reduce((s, p) => s + p.nominal, 0) +
      data.jurnalPenyesuaian.filter(a => a.coa_kredit === coa).reduce((s, a) => s + a.nominal, 0);
    return { debit, credit };
  };

  // Revenue-normal COA set: balance increases on credit
  const sumRevenueCoas = (coaList) => coaList.reduce((sum, coa) => {
    const { debit, credit } = getAccountMovement(coa);
    return sum + (credit - debit);
  }, 0);

  // Expense-normal COA set: balance increases on debit
  const sumExpenseCoas = (coaList) => coaList.reduce((sum, coa) => {
    const { debit, credit } = getAccountMovement(coa);
    return sum + (debit - credit);
  }, 0);

  // --- DANA (FUND) MOVEMENTS — the PSAK 109 fund breakdown ---
  const zakatPenerimaan = sumRevenueCoas(DANA_ZAKAT_REVENUE_COA);
  const zakatPenyaluran = sumExpenseCoas(DANA_ZAKAT_EXPENSE_COA);
  const zakatNet = zakatPenerimaan - zakatPenyaluran;
  const zakatAkhir = OPENING_DANA_ZAKAT + zakatNet;

  const infakPenerimaan = sumRevenueCoas(DANA_INFAK_SEDEKAH_REVENUE_COA);
  const infakPenyaluran = sumExpenseCoas(DANA_INFAK_SEDEKAH_EXPENSE_COA);
  const infakNet = infakPenerimaan - infakPenyaluran;
  const infakAkhir = OPENING_DANA_INFAK_SEDEKAH + infakNet;

  const amilPenerimaan = sumRevenueCoas(DANA_AMIL_REVENUE_COA);
  const amilPenyaluran = sumExpenseCoas(DANA_AMIL_EXPENSE_COA);
  const amilNet = amilPenerimaan - amilPenyaluran;
  const amilAkhir = OPENING_DANA_AMIL + amilNet;

  const nonHalalPenerimaan = 0; // no non-halal income COA recorded yet in this book
  const nonHalalPenyaluran = 0;
  const nonHalalAkhir = OPENING_DANA_NON_HALAL + nonHalalPenerimaan - nonHalalPenyaluran;

  const totalPenerimaan = zakatPenerimaan + infakPenerimaan + amilPenerimaan + nonHalalPenerimaan;
  const totalPenyaluran = zakatPenyaluran + infakPenyaluran + amilPenyaluran + nonHalalPenyaluran;
  const totalDanaAwal = OPENING_DANA_ZAKAT + OPENING_DANA_INFAK_SEDEKAH + OPENING_DANA_AMIL + OPENING_DANA_NON_HALAL;
  const totalDanaAkhir = zakatAkhir + infakAkhir + amilAkhir + nonHalalAkhir;

  // --- NERACA (Balance Sheet) ---
  const cashBalances = data.saldo.reduce((sum, item) => sum + item.saldo, 0);
  const totalReceivables = data.cashAdvances.filter(c => c.status === 'active').reduce((sum, c) => sum + c.sisa_kasbon, 0);
  const totalFixedAssets = data.assets.reduce((sum, a) => sum + a.harga_perolehan, 0);
  const totalAccumDep = data.jurnalPenyesuaian
    .filter(aje => aje.coa_kredit === '102.01.001.000')
    .reduce((sum, aje) => sum + aje.nominal, 0);
  const netFixedAssets = totalFixedAssets - totalAccumDep;
  const totalAssets = cashBalances + totalReceivables + netFixedAssets;

  // Hutang Usaha — real outstanding Purchase Orders, same computation as Hutang & Piutang menu
  const openPOs = data.purchaseOrders.filter(po => po.status !== 'paid' && po.status !== 'cancelled');
  const totalPayables = openPOs.reduce((sum, po) => sum + (po.total_amount - (po.dp_amount || 0)), 0);

  // Running Ledger Transactions (Buku Besar per COA)
  const getLedgerTransactions = () => {
    const txs = [];
    data.penerimaan.forEach(p => {
      if (p.coa === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Donasi: ${p.donatur} (${p.note})`, debet: 0, kredit: p.nominal, ref: p.id_trans });
      }
      const bankCoa = p.channel === 'Xendit QRIS' ? '101.02.006.000' : '101.02.001.000';
      if (bankCoa === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Penerimaan Donasi ${p.donatur}`, debet: p.nominal, kredit: 0, ref: p.id_trans });
      }
    });

    data.pengeluaran.forEach(p => {
      if (p.coa === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Beban: ${p.vendor} (${p.note})`, debet: p.nominal, kredit: 0, ref: p.id_trans });
      }
      if (p.coa_bayar === selectedCoa && p.status === 'PAID') {
        txs.push({ tgl: p.tgl, desc: `Pembayaran ${p.vendor}`, debet: 0, kredit: p.nominal, ref: p.id_trans });
      }
    });

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
          <h1>Laporan Keuangan PSAK 409</h1>
          <p>Neraca, Laporan Perubahan Dana (Zakat/Infak-Sedekah/Amil/Non Halal), Perubahan Aset Kelolaan, Arus Kas, dan Buku Besar — dihitung langsung dari rekap jurnal (penerimaan, pengeluaran, dan jurnal penyesuaian)</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Neraca (Posisi Keuangan)', 'Laporan Perubahan Dana', 'Perubahan Aset Kelolaan', 'Laporan Arus Kas', 'Buku Besar per COA'].map(tab => (
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
        {activeTab === 'Neraca (Posisi Keuangan)' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Neraca (Laporan Posisi Keuangan) — PSAK 409</h3>

            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <tbody>
                {/* ASET */}
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ASET</td>
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
                  <td style={{ paddingLeft: '24px' }}>Aset Kelolaan (Perolehan)</td>
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
                  <td colSpan="2">KEWAJIBAN</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Hutang Usaha (Vendor)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalPayables)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>TOTAL KEWAJIBAN</td>
                  <td style={{ textAlign: 'right', color: '#f59e0b' }}>{formatRupiah(totalPayables)}</td>
                </tr>

                {/* SALDO DANA */}
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">SALDO DANA (PSAK 109)</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Dana Zakat</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(zakatAkhir)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Dana Infak/Sedekah</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(infakAkhir)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Dana Amil</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(amilAkhir)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Dana Non Halal</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(nonHalalAkhir)}</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>TOTAL SALDO DANA</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalDanaAkhir)}</td>
                </tr>

                <tr style={{ background: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #94a3b8' }}>
                  <td>TOTAL KEWAJIBAN & SALDO DANA</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalPayables + totalDanaAkhir)}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px' }}>
              Catatan: Saldo Awal Dana adalah saldo bawaan periode sebelumnya (asumsi pembukuan tahun berjalan). Seluruh pergerakan periode berjalan di atas dihitung langsung dari rekap jurnal (penerimaan, pengeluaran, dan jurnal penyesuaian).
            </p>
          </div>
        )}

        {activeTab === 'Laporan Perubahan Dana' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Laporan Perubahan Dana — PSAK 409</h3>

            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <thead>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <th>Uraian</th>
                  <th style={{ textAlign: 'right' }}>Dana Zakat</th>
                  <th style={{ textAlign: 'right' }}>Dana Infak/Sedekah</th>
                  <th style={{ textAlign: 'right' }}>Dana Amil</th>
                  <th style={{ textAlign: 'right' }}>Dana Non Halal</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Saldo Awal Periode</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(OPENING_DANA_ZAKAT)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(OPENING_DANA_INFAK_SEDEKAH)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(OPENING_DANA_AMIL)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(OPENING_DANA_NON_HALAL)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalDanaAwal)}</td>
                </tr>
                <tr>
                  <td>Penerimaan</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(zakatPenerimaan)}</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(infakPenerimaan)}</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(amilPenerimaan)}</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(nonHalalPenerimaan)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(totalPenerimaan)}</td>
                </tr>
                <tr>
                  <td>Penyaluran / Beban</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(zakatPenyaluran)})</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(infakPenyaluran)})</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(amilPenyaluran)})</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(nonHalalPenyaluran)})</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>({formatRupiah(totalPenyaluran)})</td>
                </tr>
                <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                  <td>Kenaikan (Penurunan) Dana</td>
                  <td style={{ textAlign: 'right', color: zakatNet >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(zakatNet)}</td>
                  <td style={{ textAlign: 'right', color: infakNet >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(infakNet)}</td>
                  <td style={{ textAlign: 'right', color: amilNet >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(amilNet)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(0)}</td>
                  <td style={{ textAlign: 'right', color: (totalPenerimaan - totalPenyaluran) >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(totalPenerimaan - totalPenyaluran)}</td>
                </tr>
                <tr style={{ background: '#e2e8f0', fontWeight: 'bold', borderTop: '2px solid #94a3b8' }}>
                  <td>Saldo Akhir Periode</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(zakatAkhir)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(infakAkhir)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(amilAkhir)}</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(nonHalalAkhir)}</td>
                  <td style={{ textAlign: 'right', color: '#10b981' }}>{formatRupiah(totalDanaAkhir)}</td>
                </tr>
              </tbody>
            </table>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px' }}>
              Dana Zakat: COA 401.05 dikurangi 501.05. Dana Infak/Sedekah: COA 401.01/401.02/401.04/401.08/401.09 dikurangi 501.01/501.02/501.03.
              Dana Amil: COA 401.07 (termasuk reklasifikasi Hak Amil 12.5%) dikurangi seluruh beban operasional 502.xx. Dana Non Halal: belum ada transaksi tercatat.
            </p>
          </div>
        )}

        {activeTab === 'Perubahan Aset Kelolaan' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Laporan Perubahan Aset Kelolaan — PSAK 409</h3>

            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <thead>
                <tr>
                  <th>Aset Kelolaan</th>
                  <th>Tgl Perolehan</th>
                  <th style={{ textAlign: 'right' }}>Nilai Perolehan</th>
                  <th style={{ textAlign: 'right' }}>Akumulasi Penyusutan</th>
                  <th style={{ textAlign: 'right' }}>Nilai Buku (Akhir Periode)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.assets.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada aset kelolaan tercatat</td></tr>
                )}
                {data.assets.map((a, idx) => {
                  const accumDepAsset = data.jurnalPenyesuaian
                    .filter(aje => aje.keterangan.includes(`AJE #${a.id}`) || aje.keterangan.includes(a.nama_aset))
                    .filter(aje => aje.coa_kredit === '102.01.001.000')
                    .reduce((sum, aje) => sum + aje.nominal, 0);
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 500 }}>{a.nama_aset} <span style={{ fontFamily: 'monospace', color: '#94a3b8', fontSize: '0.75rem' }}>({a.kode_aset})</span></td>
                      <td>{a.tgl_beli}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(a.harga_perolehan)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(accumDepAsset)})</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(a.nilai_buku)}</td>
                      <td>
                        <span className={`status-badge ${a.status === 'aktif' ? 'status-success' : 'status-warning'}`}>{a.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td colSpan={2}>TOTAL ASET KELOLAAN</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(totalFixedAssets)}</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalAccumDep)})</td>
                  <td style={{ textAlign: 'right', color: '#0ea5e9' }}>{formatRupiah(netFixedAssets)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Laporan Arus Kas' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '4px' }}>LAZ DARUL HIKAM</h2>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>Laporan Arus Kas</h3>
            <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
              <tbody>
                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ARUS KAS DARI AKTIVITAS OPERASI</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penerimaan Zakat, Infak/Sedekah & Amil</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalPenerimaan)}</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Penyaluran & Beban Operasional</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalPenyaluran)})</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>KAS BERSIH DARI AKTIVITAS OPERASI</td>
                  <td style={{ textAlign: 'right', color: (totalPenerimaan - totalPenyaluran) >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(totalPenerimaan - totalPenyaluran)}</td>
                </tr>

                <tr style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                  <td colSpan="2">ARUS KAS DARI AKTIVITAS INVESTASI</td>
                </tr>
                <tr>
                  <td style={{ paddingLeft: '24px' }}>Perolehan Aset Kelolaan</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalFixedAssets)})</td>
                </tr>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                  <td>KAS BERSIH DARI AKTIVITAS INVESTASI</td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>({formatRupiah(totalFixedAssets)})</td>
                </tr>

                <tr style={{ background: '#e2e8f0', fontWeight: 'bold' }}>
                  <td>KENAIKAN (PENURUNAN) KAS BERSIH</td>
                  <td style={{ textAlign: 'right' }}>{formatRupiah(totalPenerimaan - totalPenyaluran - totalFixedAssets)}</td>
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

export default LaporanPSAK409;
