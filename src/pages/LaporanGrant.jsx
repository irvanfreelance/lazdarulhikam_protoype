import React, { useState, useEffect } from 'react';
import { Gift, AlertTriangle } from 'lucide-react';
import { getAccountingData, formatRupiah } from '../utils/accountingStore';

const LaporanGrant = () => {
  const [activeTab, setActiveTab] = useState('Realisasi per Grant');
  const [data, setData] = useState(() => getAccountingData());

  useEffect(() => { setData(getAccountingData()); }, [activeTab]);

  const grants = data.grants || [];

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Laporan Grant</h1>
          <p>Realisasi pencairan grant, posisi dana terikat vs tidak terikat, dan status pelaporan LPJ</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          {['Realisasi per Grant', 'Dana Terikat vs Tidak Terikat', 'Status Pelaporan'].map(tab => (
            <div key={tab} className={`tab-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      <div className="data-table-container">
        {activeTab === 'Realisasi per Grant' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Realisasi Pencairan vs Total Grant</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nama Grant</th>
                  <th>Pemberi</th>
                  <th style={{ textAlign: 'right' }}>Total Grant</th>
                  <th style={{ textAlign: 'right' }}>Sudah Cair</th>
                  <th style={{ textAlign: 'right' }}>Terpakai</th>
                  <th style={{ textAlign: 'right' }}>Sisa Dana</th>
                  <th>% Realisasi</th>
                </tr>
              </thead>
              <tbody>
                {grants.map((g, idx) => {
                  const pct = g.total_grant > 0 ? (g.total_cair / g.total_grant * 100) : 0;
                  const sisa = g.total_cair - g.terpakai;
                  return (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{g.nama_grant}</td>
                      <td>{g.pemberi}</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(g.total_grant)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{formatRupiah(g.total_cair)}</td>
                      <td style={{ textAlign: 'right', color: '#f59e0b' }}>{formatRupiah(g.terpakai)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(sisa)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1, background: '#f1f5f9', borderRadius: '6px', height: '8px', overflow: 'hidden', maxWidth: '80px' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: pct > 80 ? '#10b981' : '#3b82f6', borderRadius: '6px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Dana Terikat vs Tidak Terikat' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Posisi Dana Berdasarkan Klasifikasi PSAK 45</h3>
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">Tidak Terikat (Unrestricted)</div></div>
                <div className="stat-value" style={{ color: '#10b981' }}>Rp 100.000.000</div>
                <div className="stat-change">Infaq operasional, donasi umum</div>
              </div>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">Terikat Sementara (Temp. Restricted)</div></div>
                <div className="stat-value" style={{ color: '#3b82f6' }}>Rp 400.000.000</div>
                <div className="stat-change">Grant, campaign spesifik</div>
              </div>
              <div className="stat-card">
                <div className="stat-header"><div className="stat-title">Terikat Permanen (Permanently Restricted)</div></div>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>Rp 50.000.000</div>
                <div className="stat-change">Wakaf, endowment</div>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Sumber Dana</th>
                  <th>Klasifikasi</th>
                  <th style={{ textAlign: 'right' }}>Saldo</th>
                  <th>Batasan Penggunaan</th>
                  <th>Jatuh Tempo Batasan</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td><td>Infaq Operasional Umum</td><td>Tidak Terikat</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp 100.000.000</td>
                  <td>Bebas</td><td>-</td>
                </tr>
                <tr>
                  <td>2</td><td>Beasiswa Astra Foundation</td><td>Terikat Sementara</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp 100.000.000</td>
                  <td>Hanya untuk beasiswa</td><td>2026-12-31</td>
                </tr>
                <tr>
                  <td>3</td><td>Donasi Pembangunan Masjid</td><td>Terikat Sementara</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp 300.000.000</td>
                  <td>Hanya untuk pembangunan masjid</td><td>Tujuan tercapai</td>
                </tr>
                <tr>
                  <td>4</td><td>Wakaf Tanah & Gedung</td><td>Terikat Permanen</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>Rp 50.000.000</td>
                  <td>Tidak boleh digunakan (hanya hasil/manfaat)</td><td>Permanen</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'Status Pelaporan' && (
          <div>
            <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>Status Laporan Pertanggungjawaban (LPJ) Grant</h3>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Grant</th>
                  <th>Pemberi</th>
                  <th>Jenis Laporan</th>
                  <th>Deadline</th>
                  <th>Tanggal Submit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(data.grantReports || []).map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 500 }}>{r.grant_nama}</td>
                    <td>{r.pemberi}</td>
                    <td>{r.jenis_laporan}</td>
                    <td>{r.deadline}</td>
                    <td>{r.submitted_at || '-'}</td>
                    <td>
                      <span className={`status-badge ${r.status === 'accepted' ? 'status-success' : r.status === 'submitted' ? 'status-info' : r.status === 'revision' ? 'status-warning' : 'status-danger'}`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanGrant;
