import React from 'react';
import { Search, Plus, Filter, MoreVertical, Edit, Eye, Trash2 } from 'lucide-react';
import '../index.css';

const KampanyeList = () => {
  const campaigns = [
    { id: 1, name: 'Bantuan Darurat Bencana Banjir', category: 'Kemanusiaan', target: 'Rp 100.000.000', collected: 'Rp 85.000.000', progress: 85, status: 'Aktif', end: '3 Hari Lagi' },
    { id: 2, name: 'Pembangunan Masjid Pelosok', category: 'Infrastruktur', target: 'Rp 500.000.000', collected: 'Rp 300.000.000', progress: 60, status: 'Aktif', end: '7 Hari Lagi' },
    { id: 3, name: 'Beasiswa Santri Tahfidz', category: 'Pendidikan', target: 'Rp 50.000.000', collected: 'Rp 21.000.000', progress: 42, status: 'Aktif', end: '15 Hari Lagi' },
    { id: 4, name: 'Wakaf Sumur Air Bersih', category: 'Kemanusiaan', target: 'Rp 25.000.000', collected: 'Rp 25.000.000', progress: 100, status: 'Selesai', end: 'Selesai' },
    { id: 5, name: 'Operasional Panti Asuhan', category: 'Sosial', target: 'Rp 20.000.000', collected: 'Rp 5.000.000', progress: 25, status: 'Draft', end: '-' },
  ];

  return (
    <div className="page-content" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>Daftar Kampanye</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Kelola semua kampanye penggalangan dana Anda</p>
        </div>
        <button style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', cursor: 'pointer' }}>
          <Plus size={18} />
          Buat Kampanye
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Cari kampanye..." 
                style={{ padding: '8px 12px 8px 36px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', fontSize: '0.875rem', width: '250px' }}
              />
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: 'white', color: '#64748b', cursor: 'pointer', fontSize: '0.875rem' }}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>Nama Kampanye</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>Kategori</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>Target / Terkumpul</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '12px 20px', fontWeight: '600' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr key={camp.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{camp.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Berakhir: {camp.end}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', fontWeight: '500' }}>
                    {camp.category}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#0f172a', marginBottom: '4px' }}>{camp.collected}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>dari {camp.target}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${camp.progress}%`, height: '100%', backgroundColor: camp.progress === 100 ? '#10b981' : '#4f46e5' }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '600', color: '#64748b' }}>{camp.progress}%</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    padding: '4px 10px', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: '600',
                    backgroundColor: camp.status === 'Aktif' ? '#dcfce7' : (camp.status === 'Selesai' ? '#e0e7ff' : '#f1f5f9'),
                    color: camp.status === 'Aktif' ? '#16a34a' : (camp.status === 'Selesai' ? '#4f46e5' : '#64748b')
                  }}>
                    {camp.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px', color: '#64748b' }}>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><Eye size={16} /></button>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}><Edit size={16} /></button>
                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KampanyeList;
