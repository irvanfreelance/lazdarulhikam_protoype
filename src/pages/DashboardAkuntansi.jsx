import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowUpRight, ArrowDownRight,
  DollarSign, PieChart, BarChart3, Users, Calendar, CreditCard
} from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';

const DashboardAkuntansi = () => {
  const [data, setData] = useState(() => getAccountingData());

  useEffect(() => {
    setData(getAccountingData());
  }, []);

  // Calculations
  const totalSaldo = data.saldo.reduce((sum, s) => sum + s.saldo, 0);
  const totalPenerimaan = data.penerimaan
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.nominal, 0);
  const totalPengeluaran = data.pengeluaran
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.nominal, 0);
  const surplus = totalPenerimaan - totalPengeluaran;
  const outstandingKasBon = data.cashAdvances
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + c.sisa_kasbon, 0);
  const pendingDisbursements = data.disbursementRequests
    .filter(d => d.status === 'approved')
    .length;
  const totalAset = data.asetTetap.reduce((sum, a) => sum + a.harga_perolehan, 0);

  // Monthly trend data (simulated 6 months)
  const months = ['Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'];
  const incomeData = [42, 55, 38, 62, 71, totalPenerimaan / 1000000];
  const expenseData = [28, 35, 22, 40, 48, totalPengeluaran / 1000000];
  const maxVal = Math.max(...incomeData, ...expenseData);

  // Penerimaan by COA for pie display
  const revenueBreakdown = {};
  data.penerimaan.filter(p => p.status === 'PAID').forEach(p => {
    const label = p.note || p.coa;
    revenueBreakdown[label] = (revenueBreakdown[label] || 0) + p.nominal;
  });
  const topRevenues = Object.entries(revenueBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Active period
  const activePeriod = data.periods.find(p => p.status === 'open');

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard Akuntansi</h1>
          <p>Ringkasan keuangan LAZ Darul Hikam — Periode {activePeriod ? `${activePeriod.bulan}/${activePeriod.tahun}` : 'Aktif'}</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
              <Wallet size={20} />
            </div>
            <div className="stat-title">Total Saldo Kas & Bank</div>
          </div>
          <div className="stat-value">{formatRupiah(totalSaldo)}</div>
          <div className="stat-change positive">
            <ArrowUpRight size={14} /> {data.saldo.length} rekening aktif
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <TrendingUp size={20} />
            </div>
            <div className="stat-title">Total Penerimaan</div>
          </div>
          <div className="stat-value">{formatRupiah(totalPenerimaan)}</div>
          <div className="stat-change positive">
            <ArrowUpRight size={14} /> {data.penerimaan.filter(p => p.status === 'PAID').length} transaksi
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <TrendingDown size={20} />
            </div>
            <div className="stat-title">Total Pengeluaran</div>
          </div>
          <div className="stat-value">{formatRupiah(totalPengeluaran)}</div>
          <div className="stat-change negative">
            <ArrowDownRight size={14} /> {data.pengeluaran.filter(p => p.status === 'PAID').length} transaksi
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: surplus >= 0 ? '#d1fae5' : '#fee2e2', color: surplus >= 0 ? '#10b981' : '#ef4444' }}>
              <DollarSign size={20} />
            </div>
            <div className="stat-title">Surplus / Defisit</div>
          </div>
          <div className="stat-value" style={{ color: surplus >= 0 ? '#10b981' : '#ef4444' }}>{formatRupiah(surplus)}</div>
          <div className="stat-change" style={{ color: surplus >= 0 ? '#10b981' : '#ef4444' }}>
            {surplus >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {surplus >= 0 ? 'Surplus' : 'Defisit'} berjalan
          </div>
        </div>
      </div>

      {/* SECOND ROW */}
      <div className="stats-grid" style={{ marginTop: '16px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fce7f3', color: '#ec4899' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="stat-title">Kas Bon Outstanding</div>
          </div>
          <div className="stat-value">{formatRupiah(outstandingKasBon)}</div>
          <div className="stat-change negative">
            {data.cashAdvances.filter(c => c.status === 'active').length} kas bon aktif
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
              <CreditCard size={20} />
            </div>
            <div className="stat-title">Penyaluran Menunggu Cairkan</div>
          </div>
          <div className="stat-value">{pendingDisbursements}</div>
          <div className="stat-change">pengajuan disetujui</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef9c3', color: '#ca8a04' }}>
              <BarChart3 size={20} />
            </div>
            <div className="stat-title">Total Nilai Aset Tetap</div>
          </div>
          <div className="stat-value">{formatRupiah(totalAset)}</div>
          <div className="stat-change">{data.asetTetap.length} unit tercatat</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#ccfbf1', color: '#14b8a6' }}>
              <Calendar size={20} />
            </div>
            <div className="stat-title">Periode Akuntansi Aktif</div>
          </div>
          <div className="stat-value" style={{ fontSize: '1.1rem' }}>
            {activePeriod ? `${activePeriod.nama}` : 'Tidak ada'}
          </div>
          <div className="stat-change">
            <span className="status-badge status-success">OPEN</span>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
        {/* Bar Chart - Trend 6 Bulan */}
        <div className="data-table-container">
          <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>📊 Trend Penerimaan vs Pengeluaran (6 Bulan)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 8px' }}>
            {months.map((m, i) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '180px' }}>
                  <div style={{
                    width: '18px',
                    height: `${(incomeData[i] / maxVal) * 160}px`,
                    background: 'linear-gradient(180deg, #10b981, #34d399)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease'
                  }} title={`Penerimaan: ${incomeData[i]}jt`}></div>
                  <div style={{
                    width: '18px',
                    height: `${(expenseData[i] / maxVal) * 160}px`,
                    background: 'linear-gradient(180deg, #f59e0b, #fbbf24)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s ease'
                  }} title={`Pengeluaran: ${expenseData[i]}jt`}></div>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>{m}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
              Penerimaan (Juta Rp)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '2px' }}></div>
              Pengeluaran (Juta Rp)
            </div>
          </div>
        </div>

        {/* Top Revenue Sources */}
        <div className="data-table-container">
          <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>🏆 Top 5 Sumber Penerimaan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topRevenues.map(([label, amount], idx) => {
              const pct = totalPenerimaan > 0 ? (amount / totalPenerimaan * 100) : 0;
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{label.length > 28 ? label.substring(0, 28) + '...' : label}</span>
                    <span style={{ fontWeight: 600 }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: colors[idx], borderRadius: '6px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SALDO PER REKENING */}
      <div className="data-table-container" style={{ marginTop: '20px' }}>
        <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>💳 Saldo per Rekening Bank</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>COA</th>
              <th>Nama Rekening</th>
              <th style={{ textAlign: 'right' }}>Saldo</th>
              <th>% dari Total</th>
            </tr>
          </thead>
          <tbody>
            {data.saldo.map((s, idx) => {
              const pct = totalSaldo > 0 ? (s.saldo / totalSaldo * 100) : 0;
              return (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace' }}>{s.coa}</td>
                  <td style={{ fontWeight: 500 }}>{s.nama_rek}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(s.saldo)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '6px', height: '6px', overflow: 'hidden', maxWidth: '120px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: '6px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardAkuntansi;
