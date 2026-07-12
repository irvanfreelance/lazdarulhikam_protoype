import React from 'react';
import { Construction } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <div className="content-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ background: '#f1f5f9', padding: '24px', borderRadius: '50%', marginBottom: '24px' }}>
        <Construction size={48} color="#94a3b8" />
      </div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '12px', color: '#0f172a' }}>
        {title || 'Halaman Ini Sedang Dibangun'}
      </h1>
      <p style={{ color: '#64748b', maxWidth: '400px', lineHeight: '1.6' }}>
        Mockup untuk halaman ini belum tersedia. Silakan cek modul Transaksi Keuangan atau kembali lagi nanti.
      </p>
    </div>
  );
};

export default ComingSoon;
