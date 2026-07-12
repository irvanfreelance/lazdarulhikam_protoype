import React from 'react';
import { Megaphone, Users, Target, TrendingUp, HandCoins, Activity } from 'lucide-react';
import '../index.css';

const DashboardCrowdfunding = () => {
  return (
    <div className="page-content" style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
        Dashboard Crowdfunding
      </h1>
      <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.875rem' }}>
        Ringkasan performa kampanye dan donasi platform
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}>
              <Megaphone size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Kampanye Aktif</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>45</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +3 kampanye baru minggu ini
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}>
              <HandCoins size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Donasi Terkumpul (Bulan ini)</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Rp 324M</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +12.5% dari bulan lalu
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Donatur Aktif</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>1,240</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +150 donatur baru
          </div>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
              <Target size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Target Tercapai</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>12</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Activity size={14} /> Dalam bulan ini
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>Kampanye Mendesak (Top 3)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textAlign: 'left' }}>
                <th style={{ paddingBottom: '12px' }}>NAMA KAMPANYE</th>
                <th style={{ paddingBottom: '12px' }}>SISA WAKTU</th>
                <th style={{ paddingBottom: '12px' }}>PROGRESS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', fontWeight: '500' }}>Bantuan Darurat Bencana Banjir</td>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: '#ef4444' }}>3 Hari</td>
                <td style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '85%', height: '100%', backgroundColor: '#4f46e5' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>85%</span>
                  </div>
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', fontWeight: '500' }}>Pembangunan Masjid Pelosok</td>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: '#f59e0b' }}>7 Hari</td>
                <td style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '60%', height: '100%', backgroundColor: '#4f46e5' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>60%</span>
                  </div>
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', fontWeight: '500' }}>Beasiswa Santri Tahfidz</td>
                <td style={{ padding: '12px 0', fontSize: '0.875rem', color: '#10b981' }}>15 Hari</td>
                <td style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: '42%', height: '100%', backgroundColor: '#4f46e5' }}></div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>42%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '16px' }}>Donasi Terbaru</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <Users size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>Hamba Allah</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Bantuan Darurat Bencana Banjir</div>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#10b981' }}>
                  +Rp 500.000
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCrowdfunding;
