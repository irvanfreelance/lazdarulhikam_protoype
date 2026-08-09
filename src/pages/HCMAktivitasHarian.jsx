import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus, Briefcase, User, HeartPulse, Clock, CheckCircle2, Circle, ListChecks
} from 'lucide-react';
import { getAccountingData, updateAccountingData, ACTIVITY_CATEGORIES } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const todayStr = () => new Date().toISOString().substring(0, 10);

const CATEGORY_META = {
  Pekerjaan: { icon: Briefcase, color: '#2563eb', bg: '#dbeafe' },
  Pribadi: { icon: User, color: '#7c3aed', bg: '#ede9fe' },
  Kesehatan: { icon: HeartPulse, color: '#ec4899', bg: '#fce7f3' }
};

const greetingForHour = (h) => {
  if (h < 11) return 'Selamat Pagi';
  if (h < 15) return 'Selamat Siang';
  if (h < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

const HCMAktivitasHarian = () => {
  const [data, setData] = useState(() => getAccountingData());
  const [selectedNik, setSelectedNik] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formFields, setFormFields] = useState({});

  const reloadData = () => setData(getAccountingData());

  useEffect(() => {
    const store = getAccountingData();
    setData(store);
    const firstActive = store.employees.find(e => e.active);
    if (firstActive) setSelectedNik(firstActive.nik);
  }, []);

  const today = todayStr();
  const selectedEmployee = data.employees.find(e => e.nik === selectedNik);

  const todayActivities = data.dailyActivities.filter(a => a.nik === selectedNik && a.tanggal === today);
  const filtered = categoryFilter === 'Semua' ? todayActivities : todayActivities.filter(a => a.kategori === categoryFilter);

  const totalTugas = todayActivities.length;
  const selesaiCount = todayActivities.filter(a => a.selesai).length;
  const tertundaCount = totalTugas - selesaiCount;
  const progressPct = totalTugas > 0 ? Math.round((selesaiCount / totalTugas) * 100) : 0;

  const motivationText = useMemo(() => {
    if (totalTugas === 0) return 'Belum ada aktivitas tercatat hari ini. Yuk mulai tambahkan!';
    if (progressPct === 100) return 'Semua tugas selesai! Kerja bagus hari ini 🎉';
    if (tertundaCount === 1) return 'Sedikit lagi selesai! Tersisa 1 tugas.';
    return `Sedikit lagi selesai! Tersisa ${tertundaCount} tugas.`;
  }, [totalTugas, progressPct, tertundaCount]);

  const toggleComplete = (activity) => {
    const store = getAccountingData();
    const updated = store.dailyActivities.map(a => a.id === activity.id ? { ...a, selesai: !a.selesai } : a);
    updateAccountingData('laz_daily_activities', updated);
    reloadData();
  };

  const openAddModal = () => {
    setFormFields({
      kategori: 'Pekerjaan',
      judul: '',
      deskripsi: '',
      jam_mulai: '',
      jam_selesai: '',
      progress_total: '',
      progress_unit: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const hasProgress = formFields.progress_total && parseInt(formFields.progress_total, 10) > 0;
    const newActivity = {
      id: String(store.dailyActivities.length + 1),
      nik: selectedNik,
      tanggal: today,
      kategori: formFields.kategori,
      judul: formFields.judul,
      deskripsi: formFields.deskripsi,
      jam_mulai: formFields.jam_mulai,
      jam_selesai: formFields.jam_selesai,
      selesai: false,
      ...(hasProgress ? {
        progress_current: 0,
        progress_total: parseInt(formFields.progress_total, 10),
        progress_unit: formFields.progress_unit || 'bagian'
      } : {})
    };

    updateAccountingData('laz_daily_activities', [...store.dailyActivities, newActivity]);
    setIsModalOpen(false);
    reloadData();
  };

  // Circular progress ring geometry
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Aktivitas Harian & Progress</h1>
          <p>{new Date(today).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '260px' }}>
            <SearchableSelect
              className="form-select"
              options={data.employees.filter(e => e.active).map(e => ({ value: e.nik, label: `${e.nama} (${e.jabatan || '-'})` }))}
              value={selectedNik}
              onChange={val => setSelectedNik(val)}
              placeholder="Pilih karyawan..."
            />
          </div>
          <button className="btn btn-primary" onClick={openAddModal} disabled={!selectedNik}>
            <Plus size={16} /> Tambah Aktivitas
          </button>
        </div>
      </div>

      {/* HERO PROGRESS SECTION */}
      <div className="data-table-container" style={{ marginBottom: '32px', padding: '28px 32px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '32px' }}>
          <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
            <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="80" cy="80" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="14" />
              <circle
                cx="80" cy="80" r={radius} fill="none"
                stroke="var(--primary-color)" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{progressPct}%</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SELESAI</span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>
              {greetingForHour(new Date().getHours())}, {selectedEmployee ? selectedEmployee.nama.split(' ')[0] : '...'}!
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{motivationText}</p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'center', minWidth: '84px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalTugas}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Tugas</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '84px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{selesaiCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Selesai</div>
            </div>
            <div style={{ textAlign: 'center', minWidth: '84px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{tertundaCount}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Tertunda</div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="tabs-container">
        <div className="tabs-list">
          {['Semua', ...ACTIVITY_CATEGORIES].map(tab => (
            <div key={tab} className={`tab-item ${categoryFilter === tab ? 'active' : ''}`} onClick={() => setCategoryFilter(tab)}>
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* ACTIVITY CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.length === 0 ? (
          <div className="data-table-container" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            <ListChecks size={28} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div>Tidak ada aktivitas untuk kategori ini.</div>
          </div>
        ) : filtered.map(activity => {
          const meta = CATEGORY_META[activity.kategori] || CATEGORY_META.Pekerjaan;
          const Icon = meta.icon;
          const hasProgress = activity.progress_total > 0;
          const progPct = hasProgress ? Math.round((activity.progress_current / activity.progress_total) * 100) : 0;

          return (
            <div
              key={activity.id}
              className="data-table-container"
              style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px', opacity: activity.selesai ? 0.65 : 1 }}
            >
              <button
                onClick={() => toggleComplete(activity)}
                title={activity.selesai ? 'Tandai belum selesai' : 'Tandai selesai'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '2px', flexShrink: 0 }}
              >
                {activity.selesai
                  ? <CheckCircle2 size={28} color="#10b981" />
                  : <Circle size={28} color="#cbd5e1" />}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', textDecoration: activity.selesai ? 'line-through' : 'none' }}>
                    {activity.judul}
                  </span>
                  <span className="status-badge" style={{ background: meta.bg, color: meta.color, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Icon size={12} /> {activity.kategori}
                  </span>
                </div>
                {activity.deskripsi && <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '8px' }}>{activity.deskripsi}</p>}

                {(activity.jam_mulai || activity.jam_selesai) && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: '#f8fafc', padding: '4px 10px', borderRadius: '9999px', marginBottom: hasProgress ? '10px' : 0 }}>
                    <Clock size={12} /> {activity.jam_mulai || '--:--'} - {activity.jam_selesai || '--:--'}
                  </div>
                )}

                {hasProgress && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      <span>{activity.judul.length > 30 ? activity.judul.substring(0, 30) + '...' : ''}</span>
                      <span style={{ fontWeight: 600 }}>{activity.progress_current}/{activity.progress_total} {activity.progress_unit}</span>
                    </div>
                    <div style={{ background: '#f1f5f9', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${progPct}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '6px', transition: 'width 0.4s ease' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL ADD ACTIVITY */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '28px', borderRadius: '16px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tambah Aktivitas</h2>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Judul Aktivitas</label>
                <input type="text" required style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                  value={formFields.judul || ''} onChange={e => setFormFields({ ...formFields, judul: e.target.value })} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Deskripsi (opsional)</label>
                <textarea rows={2} style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={formFields.deskripsi || ''} onChange={e => setFormFields({ ...formFields, deskripsi: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Kategori</label>
                  <SearchableSelect
                    className="form-select"
                    options={ACTIVITY_CATEGORIES.map(c => ({ value: c, label: c }))}
                    value={formFields.kategori || 'Pekerjaan'}
                    onChange={val => setFormFields({ ...formFields, kategori: val })}
                  />
                </div>
                <div />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jam Mulai</label>
                  <input type="time" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jam_mulai || ''} onChange={e => setFormFields({ ...formFields, jam_mulai: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Jam Selesai</label>
                  <input type="time" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.jam_selesai || ''} onChange={e => setFormFields({ ...formFields, jam_selesai: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Target Progres (opsional)</label>
                  <input type="number" min="0" placeholder="mis. 30" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.progress_total || ''} onChange={e => setFormFields({ ...formFields, progress_total: e.target.value })} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '6px' }}>Satuan</label>
                  <input type="text" placeholder="mis. halaman" style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}
                    value={formFields.progress_unit || ''} onChange={e => setFormFields({ ...formFields, progress_unit: e.target.value })} />
                </div>
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

export default HCMAktivitasHarian;
