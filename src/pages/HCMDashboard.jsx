import React, { useState, useEffect } from 'react';
import {
  Users, UserCheck, CalendarCheck, Clock3, UserX, ArrowUpRight
} from 'lucide-react';
import { getAccountingData } from '../utils/accountingStore';

const todayStr = () => new Date().toISOString().substring(0, 10);

const STATUS_COLORS = {
  Hadir: { bg: '#d1fae5', color: '#10b981' },
  Terlambat: { bg: '#fef3c7', color: '#f59e0b' },
  Sakit: { bg: '#dbeafe', color: '#2563eb' },
  Izin: { bg: '#dbeafe', color: '#2563eb' },
  Cuti: { bg: '#ede9fe', color: '#7c3aed' },
  Alpha: { bg: '#fee2e2', color: '#ef4444' }
};

const HCMDashboard = () => {
  const [data, setData] = useState(() => getAccountingData());

  useEffect(() => {
    setData(getAccountingData());
  }, []);

  const activeEmployees = data.employees.filter(e => e.active);
  const today = todayStr();
  const todayAttendance = data.attendance.filter(a => a.tanggal === today);

  const countByStatus = (status) => todayAttendance.filter(a => a.status === status).length;
  const hadirCount = countByStatus('Hadir') + countByStatus('Terlambat');
  const terlambatCount = countByStatus('Terlambat');
  const izinSakitCount = countByStatus('Izin') + countByStatus('Sakit') + countByStatus('Cuti');
  const belumTercatat = Math.max(0, activeEmployees.length - todayAttendance.length);

  // Breakdown per departemen
  const deptBreakdown = {};
  activeEmployees.forEach(e => {
    const dept = e.departemen || 'Lainnya';
    deptBreakdown[dept] = (deptBreakdown[dept] || 0) + 1;
  });
  const deptEntries = Object.entries(deptBreakdown).sort((a, b) => b[1] - a[1]);
  const maxDept = Math.max(1, ...deptEntries.map(([, v]) => v));

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Dashboard HCM</h1>
          <p>Ringkasan kepegawaian dan kehadiran karyawan LAZ Darul Hikam — {new Date(today).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <Users size={20} />
            </div>
            <div className="stat-title">Total Karyawan Aktif</div>
          </div>
          <div className="stat-value">{activeEmployees.length} Orang</div>
          <div className="stat-change positive">
            <ArrowUpRight size={14} /> {data.employees.length} total terdaftar
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <UserCheck size={20} />
            </div>
            <div className="stat-title">Hadir Hari Ini</div>
          </div>
          <div className="stat-value">{hadirCount} Orang</div>
          <div className="stat-change">dari {activeEmployees.length} karyawan aktif</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <Clock3 size={20} />
            </div>
            <div className="stat-title">Terlambat Hari Ini</div>
          </div>
          <div className="stat-value">{terlambatCount} Orang</div>
          <div className="stat-change">tercatat masuk lewat jam 08:30</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
              <CalendarCheck size={20} />
            </div>
            <div className="stat-title">Izin / Sakit / Cuti</div>
          </div>
          <div className="stat-value">{izinSakitCount} Orang</div>
          <div className="stat-change">hari ini</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginTop: '16px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <UserX size={20} />
            </div>
            <div className="stat-title">Belum Tercatat Presensi</div>
          </div>
          <div className="stat-value">{belumTercatat} Orang</div>
          <div className="stat-change negative">perlu ditindaklanjuti admin HCM</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '20px', marginTop: '24px' }}>
        {/* Karyawan per Departemen */}
        <div className="data-table-container">
          <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>👥 Karyawan per Departemen</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {deptEntries.map(([dept, count], idx) => {
              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
              return (
                <div key={dept}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{dept}</span>
                    <span style={{ fontWeight: 600 }}>{count} orang</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${(count / maxDept) * 100}%`, height: '100%', background: colors[idx % colors.length], borderRadius: '6px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Presensi Hari Ini */}
        <div className="data-table-container">
          <h3 style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '16px' }}>🕒 Presensi Hari Ini</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Karyawan</th>
                <th>Jam Masuk</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayAttendance.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada presensi tercatat hari ini</td></tr>
              ) : todayAttendance.map((a) => {
                const c = STATUS_COLORS[a.status] || { bg: '#f1f5f9', color: '#64748b' };
                return (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500 }}>{a.nama}</td>
                    <td>{a.jam_masuk || '-'}</td>
                    <td><span className="status-badge" style={{ background: c.bg, color: c.color }}>{a.status.toUpperCase()}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HCMDashboard;
