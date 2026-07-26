import React, { useState, useEffect, useRef } from 'react';
import {
  FileSpreadsheet, ArrowLeftRight, Check, X, ShieldAlert, Sparkles
} from 'lucide-react';
import { getAccountingData, formatRupiah, updateAccountingData } from '../utils/accountingStore';

const sameDay = (a, b) => {
  if (!a || !b) return false;
  return String(a).substring(0, 10) === String(b).substring(0, 10);
};

const RekonsiliasiBank = () => {
  const [activeTab, setActiveTab] = useState('Pencocokan Transaksi');
  const [data, setData] = useState(() => getAccountingData());
  const fileInputRef = useRef(null);

  const reloadData = () => {
    setData(getAccountingData());
  };

  const handleAutoMatch = () => {
    const store = getAccountingData();

    // Track transaction ids already claimed by an existing matched statement
    const usedTransIds = new Set(
      store.bankStatements.filter(s => s.matched && s.matched_trans_id).map(s => s.matched_trans_id)
    );

    let matchedCount = 0;
    const updated = store.bankStatements.map(st => {
      if (st.matched) return st;

      // Debet mutasi = money coming in (penerimaan), Kredit mutasi = money going out (pengeluaran)
      const pool = st.mutasi === 'debet' ? store.penerimaan : store.pengeluaran;
      const candidate = pool.find(rec =>
        rec.nominal === st.nominal &&
        sameDay(rec.tgl, st.tgl) &&
        !usedTransIds.has(rec.id_trans)
      );

      if (candidate) {
        usedTransIds.add(candidate.id_trans);
        matchedCount++;
        return { ...st, matched: true, matched_trans_id: candidate.id_trans };
      }
      return st;
    });

    updateAccountingData('laz_bank_statements', updated);
    alert(matchedCount > 0
      ? `Auto-Match berhasil mencocokkan ${matchedCount} mutasi baru dengan jurnal kas secara otomatis.`
      : 'Tidak ada mutasi baru yang cocok secara otomatis. Sisanya perlu dicocokkan manual.');
    reloadData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length === 0) throw new Error('File kosong');

      // Detect header row and try to map columns leniently
      const headerCols = lines[0].split(',').map(c => c.trim().toLowerCase().replace(/^"|"$/g, ''));
      const headerKeywords = ['tanggal', 'tgl', 'date', 'keterangan', 'deskripsi', 'description', 'mutasi', 'type', 'jenis', 'nominal', 'amount', 'jumlah'];
      const looksLikeHeader = headerCols.some(c => headerKeywords.includes(c));

      let colIdx = { tgl: 0, keterangan: 1, mutasi: 2, nominal: 3 };
      if (looksLikeHeader) {
        headerCols.forEach((c, i) => {
          if (['tanggal', 'tgl', 'date'].includes(c)) colIdx.tgl = i;
          else if (['keterangan', 'deskripsi', 'description'].includes(c)) colIdx.keterangan = i;
          else if (['mutasi', 'type', 'jenis'].includes(c)) colIdx.mutasi = i;
          else if (['nominal', 'amount', 'jumlah'].includes(c)) colIdx.nominal = i;
        });
      }

      const store = getAccountingData();
      let nextId = store.bankStatements.length > 0
        ? Math.max(...store.bankStatements.map(s => parseInt(s.id, 10) || 0)) + 1
        : 1;

      const imported = [];
      for (let i = looksLikeHeader ? 1 : 0; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        if (cols.length < 2) continue;

        const tgl = cols[colIdx.tgl] || '';
        const keterangan = cols[colIdx.keterangan] || '(tanpa keterangan)';
        const mutasiRaw = (cols[colIdx.mutasi] || '').toLowerCase();
        const mutasi = (mutasiRaw.includes('kredit') || mutasiRaw.includes('credit') || mutasiRaw === 'cr' || mutasiRaw === 'k') ? 'kredit' : 'debet';
        const nominalRaw = (cols[colIdx.nominal] || '0').replace(/[^0-9.-]/g, '');
        const nominal = parseFloat(nominalRaw) || 0;

        if (!tgl || nominal <= 0) continue;

        imported.push({
          id: String(nextId++),
          tgl,
          keterangan,
          mutasi,
          nominal,
          matched: false
        });
      }

      if (imported.length === 0) {
        alert('Tidak ada baris data valid yang bisa diimpor. Pastikan format kolom kira-kira: tanggal,keterangan,mutasi,nominal');
        return;
      }

      updateAccountingData('laz_bank_statements', [...store.bankStatements, ...imported]);
      alert(`Berhasil mengimpor ${imported.length} mutasi rekening koran dari file CSV.`);
      reloadData();
    } catch (err) {
      alert('Gagal membaca file CSV. Pastikan file yang dipilih valid dan berformat CSV.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Rekonsiliasi Bank</h1>
          <p>Mencocokkan mutasi rekening koran bank dengan catatan buku kas internal yayasan</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <Check size={20} />
            </div>
            <div className="stat-title">Mutasi Sudah Cocok (Matched)</div>
          </div>
          <div className="stat-value">{data.bankStatements.filter(s => s.matched).length} Transaksi</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <ShieldAlert size={20} />
            </div>
            <div className="stat-title">Selisih Belum Cocok</div>
          </div>
          <div className="stat-value">{data.bankStatements.filter(s => !s.matched).length} Transaksi</div>
          <div style={{ marginTop: '8px' }}>
            <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={handleAutoMatch}>
              <Sparkles size={14} /> Jalankan Auto-Match
            </button>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Pencocokan Transaksi', 'Laporan Rekonsiliasi', 'Import Statement'].map(tab => (
            <div 
              key={tab} 
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); }}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* DATA CONTENT */}
      <div className="data-table-container">
        {activeTab === 'Pencocokan Transaksi' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '12px' }}>Rekening Koran vs Buku Besar (Jurnal)</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Deskripsi Rekening Koran</th>
                  <th>Mutasi</th>
                  <th style={{ textAlign: 'right' }}>Nominal Koran</th>
                  <th>Status Reconciled</th>
                  <th>Ref Transaksi Jurnal</th>
                </tr>
              </thead>
              <tbody>
                {data.bankStatements.map((st, idx) => (
                  <tr key={idx}>
                    <td>{st.tgl}</td>
                    <td style={{ fontWeight: 500 }}>{st.keterangan}</td>
                    <td style={{ textTransform: 'capitalize' }}>{st.mutasi}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(st.nominal)}</td>
                    <td>
                      <span className={`status-badge ${st.matched ? 'status-success' : 'status-warning'}`}>
                        {st.matched ? 'MATCHED' : 'UNMATCHED'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>
                      {st.matched_trans_id || (
                        <button className="btn" style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'white', border: '1px solid #e2e8f0' }} onClick={() => {
                          const updated = data.bankStatements.map((s, i) => i === idx ? { ...s, matched: true, matched_trans_id: 'MANUAL-MATCH' } : s);
                          updateAccountingData('laz_bank_statements', updated);
                          alert('Manual matching selesai.');
                          reloadData();
                        }}>
                          Match Manual
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Laporan Rekonsiliasi' && (() => {
          const stmts = data.bankStatements;
          const matchedList = stmts.filter(s => s.matched);
          const unmatchedList = stmts.filter(s => !s.matched);
          const totalMatched = matchedList.reduce((s, x) => s + x.nominal, 0);
          const totalUnmatched = unmatchedList.reduce((s, x) => s + x.nominal, 0);
          const unmatchedDebet = unmatchedList.filter(s => s.mutasi === 'debet').reduce((s, x) => s + x.nominal, 0);
          const unmatchedKredit = unmatchedList.filter(s => s.mutasi === 'kredit').reduce((s, x) => s + x.nominal, 0);

          return (
            <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
              <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', marginBottom: '16px' }}>Rekapitulasi Rekonsiliasi Bank</h3>

              <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-title">Total Baris Mutasi</div></div>
                  <div className="stat-value">{stmts.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-title">Matched</div></div>
                  <div className="stat-value">{matchedList.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-header"><div className="stat-title">Unmatched</div></div>
                  <div className="stat-value">{unmatchedList.length}</div>
                </div>
              </div>

              <table className="data-table" style={{ border: '1px solid #e2e8f0' }}>
                <tbody>
                  <tr>
                    <td>Total Nominal Matched</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(totalMatched)}</td>
                  </tr>
                  <tr>
                    <td>Total Nominal Unmatched (Selisih Belum Cocok)</td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{formatRupiah(totalUnmatched)}</td>
                  </tr>
                  <tr>
                    <td>Outstanding Unmatched — Mutasi Debet (Penerimaan)</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(unmatchedDebet)}</td>
                  </tr>
                  <tr>
                    <td>Outstanding Unmatched — Mutasi Kredit (Pengeluaran)</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(unmatchedKredit)}</td>
                  </tr>
                  <tr style={{ background: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
                    <td>Total Seluruh Mutasi Rekening Koran</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(totalMatched + totalUnmatched)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })()}

        {activeTab === 'Import Statement' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', textAlign: 'center', marginBottom: '16px' }}>Import Rekening Koran</h3>
            <div style={{ padding: '32px', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#f8fafc' }}>
              <FileSpreadsheet size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, marginBottom: '8px' }}>Upload File Rekening Koran (CSV / MT940)</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '24px' }}>Tarik data mutasi otomatis dari file yang diunduh dari klikBCA atau Mandiri Cash Management.</p>
              <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
              <button className="btn btn-primary" onClick={handleImportClick}>
                Pilih File .CSV
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RekonsiliasiBank;
