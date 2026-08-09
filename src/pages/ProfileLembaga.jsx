import React, { useState, useRef, useEffect } from 'react';
import { Building2, Upload, Save, Image as ImageIcon } from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const STORAGE_KEY = 'omnifin_profile_lembaga';

const defaultForm = {
  entityType: 'Yayasan',
  name: 'LAZ Darul Hikam',
  alias: 'Darul Hikam',
  skNpwp: '',
  phone: '',
  email: '',
  website: '',
  foundedAt: '',
  displayStyle: 'Modern',
  accessLevel: 'Superadmin',
  type: 'Lembaga Amil Zakat',
  adoptionDate: '',
  defaultCurrency: 'IDR',
  finsShowFundingSource: true,
  finsApprovalLevels: true,
  finsRefDataHandling: false,
  finsReceiptInput: true,
  finsQuantityDisplay: false,
  crmEntryVisibility: true,
  crmDuplicateCheck: true,
  crmDpHandling: false,
  crmSmsWaDefault: true,
  labelCrmTeam: 'Tim CRM',
  labelDonor: 'Donatur',
  donationLink: '',
  tagline: '',
  thankYouMessage: 'Terima kasih atas donasi Anda, semoga menjadi amal jariyah.',
};

const ToggleRow = ({ label, desc, checked, onChange }) => (
  <div className="toggle-row">
    <div>
      <div className="toggle-row-label">{label}</div>
      {desc && <div className="toggle-row-desc">{desc}</div>}
    </div>
    <label className="toggle-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="toggle-slider" />
    </label>
  </div>
);

const ProfileLembaga = () => {
  const [form, setForm] = useState(defaultForm);
  const [logo, setLogo] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef(null);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm(prev => ({ ...prev, ...parsed.form }));
        setLogo(parsed.logo || null);
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const set = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, logo }));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Profile Lembaga</h1>
          <p>Identitas organisasi, konfigurasi modul FINS & CRM, serta template struk donasi</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={16} /> Simpan Perubahan
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-layout">
          <div>
            <div className="settings-card">
              <h3>General</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tipe Entitas</label>
                  <SearchableSelect
                    options={[
                      { value: 'Yayasan', label: 'Yayasan' },
                      { value: 'Lembaga', label: 'Lembaga' },
                      { value: 'Perkumpulan', label: 'Perkumpulan' },
                    ]}
                    value={form.entityType}
                    onChange={set('entityType')}
                  />
                </div>
                <div className="form-group">
                  <label>Nama Lembaga</label>
                  <input type="text" className="form-input" required value={form.name} onChange={e => set('name')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Alias / Nama Panggilan</label>
                  <input type="text" className="form-input" value={form.alias} onChange={e => set('alias')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>No. SK / NPWP</label>
                  <input type="text" className="form-input" value={form.skNpwp} onChange={e => set('skNpwp')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>No. Telepon</label>
                  <input type="text" className="form-input" value={form.phone} onChange={e => set('phone')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-input" value={form.email} onChange={e => set('email')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input type="text" className="form-input" placeholder="https://" value={form.website} onChange={e => set('website')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Tanggal Berdiri</label>
                  <input type="date" className="form-input" value={form.foundedAt} onChange={e => set('foundedAt')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Gaya Tampilan</label>
                  <SearchableSelect
                    options={[{ value: 'Modern', label: 'Modern' }, { value: 'Klasik', label: 'Klasik' }]}
                    value={form.displayStyle}
                    onChange={set('displayStyle')}
                  />
                </div>
                <div className="form-group">
                  <label>Level Akses Default</label>
                  <SearchableSelect
                    options={[
                      { value: 'Superadmin', label: 'Superadmin' },
                      { value: 'Admin', label: 'Admin' },
                      { value: 'Staff', label: 'Staff' },
                    ]}
                    value={form.accessLevel}
                    onChange={set('accessLevel')}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Jenis Lembaga</label>
                  <input type="text" className="form-input" value={form.type} onChange={e => set('type')(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3>Pengaturan Lainnya</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tanggal Adopsi Sistem</label>
                  <input type="date" className="form-input" value={form.adoptionDate} onChange={e => set('adoptionDate')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Mata Uang Default</label>
                  <SearchableSelect
                    options={[{ value: 'IDR', label: 'IDR (Rupiah)' }, { value: 'USD', label: 'USD (Dolar AS)' }]}
                    value={form.defaultCurrency}
                    onChange={set('defaultCurrency')}
                  />
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3>FINS</h3>
              <ToggleRow label="Tampilkan Sumber Dana" desc="Munculkan kolom sumber dana pada form transaksi" checked={form.finsShowFundingSource} onChange={set('finsShowFundingSource')} />
              <ToggleRow label="Jenjang Approval" desc="Aktifkan level approval bertingkat untuk transaksi keuangan" checked={form.finsApprovalLevels} onChange={set('finsApprovalLevels')} />
              <ToggleRow label="Penanganan Data Referensi" desc="Validasi otomatis terhadap master data referensi" checked={form.finsRefDataHandling} onChange={set('finsRefDataHandling')} />
              <ToggleRow label="Input Struk/Bukti" desc="Wajibkan unggah bukti pada setiap transaksi" checked={form.finsReceiptInput} onChange={set('finsReceiptInput')} />
              <ToggleRow label="Tampilkan Kuantitas" desc="Munculkan kolom kuantitas pada transaksi barang" checked={form.finsQuantityDisplay} onChange={set('finsQuantityDisplay')} />
            </div>

            <div className="settings-card">
              <h3>CRM / Donatur</h3>
              <ToggleRow label="Visibilitas Entri" desc="Tampilkan entri donatur baru ke seluruh tim" checked={form.crmEntryVisibility} onChange={set('crmEntryVisibility')} />
              <ToggleRow label="Cek Duplikasi Donatur" desc="Deteksi otomatis data donatur ganda" checked={form.crmDuplicateCheck} onChange={set('crmDuplicateCheck')} />
              <ToggleRow label="Penanganan DP" desc="Izinkan pencatatan uang muka donasi" checked={form.crmDpHandling} onChange={set('crmDpHandling')} />
              <ToggleRow label="Default SMS/WA" desc="Kirim notifikasi SMS/WhatsApp otomatis" checked={form.crmSmsWaDefault} onChange={set('crmSmsWaDefault')} />
            </div>

            <div className="settings-card">
              <h3>Daftar Istilah</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Label untuk "Tim CRM"</label>
                  <input type="text" className="form-input" value={form.labelCrmTeam} onChange={e => set('labelCrmTeam')(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Label untuk "Donatur"</label>
                  <input type="text" className="form-input" value={form.labelDonor} onChange={e => set('labelDonor')(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="settings-card">
              <h3>Struk Donasi</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Link Donasi</label>
                  <input type="text" className="form-input" placeholder="https://donasi.lazdarulhikam.org/..." value={form.donationLink} onChange={e => set('donationLink')(e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Tagline</label>
                  <input type="text" className="form-input" value={form.tagline} onChange={e => set('tagline')(e.target.value)} />
                </div>
                <div className="form-group full-width">
                  <label>Pesan Terima Kasih</label>
                  <textarea className="form-textarea" value={form.thankYouMessage} onChange={e => set('thankYouMessage')(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="settings-card">
              <h3>Logo Lembaga</h3>
              <div className="logo-dropzone" onClick={() => fileInputRef.current?.click()}>
                {logo ? (
                  <img src={logo} alt="Logo lembaga" />
                ) : (
                  <div style={{ padding: '20px 0' }}>
                    <ImageIcon size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#2563eb', fontWeight: 500 }}>
                  <Upload size={14} /> Unggah Logo
                </div>
                <div style={{ marginTop: '6px' }}>Format PNG/JPG, minimal 430×200 px</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  style={{ display: 'none' }}
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            <div className="settings-card" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Building2 size={20} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Profil lembaga digunakan sebagai identitas resmi pada struk donasi, laporan keuangan, dan seluruh dokumen yang diterbitkan sistem.
              </p>
            </div>
          </div>
        </div>
      </form>

      {showToast && <div className="save-toast">Profil lembaga berhasil disimpan</div>}
    </div>
  );
};

export default ProfileLembaga;
