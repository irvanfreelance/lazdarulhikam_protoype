import React, { useState } from 'react';
import {
  Plus, Minus, RotateCcw, MessageSquare, Check, X, ShieldCheck,
  UserRound, MapPin, Sparkles, KeyRound, ChevronLeft, ChevronRight
} from 'lucide-react';
import { OFFICES } from '../utils/finsCoaStore';
import {
  JENIS_KELAMIN_OPTIONS, JENIS_DONATUR_OPTIONS, AGAMA_OPTIONS, STATUS_NIKAH_OPTIONS,
  PENGHASILAN_OPTIONS, PENDIDIKAN_OPTIONS, SUMBER_INFORMASI_OPTIONS, KESEDIAAN_DONASI_OPTIONS,
  CARA_BAYAR_OPTIONS, PEKERJAAN_OPTIONS, MINAT_PROGRAM_OPTIONS, DIHUBUNGI_VIA_OPTIONS,
  TIPE_PELAYANAN_OPTIONS, TIM_CRM_OPTIONS, INFORMASI_LAIN_TYPES, generateDonaturId,
} from '../utils/donaturStore';

const CURRENT_STAFF_NAME = 'Asep Saepul';
const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  namaDonatur: '', idDonatur: generateDonaturId(), namaPanggilan: '',
  jenisKelamin: 'Belum Diketahui', tempatLahir: '', tglLahir: '',
  useLokasiOtomatis: false, alamat: '', koordinat: '', telpon: '', hp: '', email: '',
  jenisDonatur: 'Perorangan', officeId: '1', timCrm: '',
  agama: 'Islam', statusNikah: 'Belum Diketahui', penghasilanBulanan: '', pendidikanTerakhir: '',
  sumberInformasi: '', kesediaanDonasi: '', kesediaanTanggal: '',
  caraBayar: '', pekerjaan: '', minatProgram: '', dihubungiVia: '', tipePelayanan: '',
  registrasi: todayStr(), npwp: '', parentDonatur: '',
  sendSms: false,
});

const STEPS = [
  { key: 'identitas', label: 'Identitas', icon: UserRound },
  { key: 'kontak', label: 'Kontak & Alamat', icon: MapPin },
  { key: 'profil', label: 'Profil Donatur', icon: Sparkles },
  { key: 'akun', label: 'Akun & Lainnya', icon: KeyRound },
];

const Field = ({ label, children, align = 'center' }) => (
  <div style={{ display: 'flex', alignItems: align === 'top' ? 'flex-start' : 'center', gap: '10px', marginBottom: '14px' }}>
    <label style={{ width: '150px', flexShrink: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', paddingTop: align === 'top' ? '7px' : 0 }}>{label}</label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const Stepper = ({ current, onJump }) => (
  <div style={{ display: 'flex', alignItems: 'center', padding: '18px 20px', flexShrink: 0, background: '#ffffff', borderBottom: '1px solid #fce7f3' }}>
    {STEPS.map((s, i) => {
      const Icon = s.icon;
      const isActive = i === current;
      const isDone = i < current;
      return (
        <React.Fragment key={s.key}>
          <button
            type="button"
            onClick={() => onJump(i)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 0,
            }}
          >
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isActive ? 'var(--primary-color)' : isDone ? '#fbcfe8' : '#f1f5f9',
              color: isActive ? '#ffffff' : isDone ? '#be185d' : '#94a3b8',
              boxShadow: isActive ? '0 4px 10px -3px rgba(219, 39, 119, 0.6)' : 'none',
              fontWeight: 700, transition: 'all 0.2s',
            }}>
              {isDone ? <Check size={17} /> : <Icon size={17} />}
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isActive ? 'var(--primary-color)' : '#94a3b8', whiteSpace: 'nowrap' }}>
              {s.label}
            </span>
          </button>
          {i < STEPS.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < current ? '#fbcfe8' : '#f1f5f9', margin: '0 10px 20px' }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// Self-contained donor entry form, redone as a step wizard (Identitas ->
// Kontak & Alamat -> Profil Donatur -> Akun & Lainnya) rather than one long
// multi-column page, so it can be dropped straight into a wide modal (see
// ListDonatur.jsx "Tambah Donatur") without any extra chrome. Builds a full
// donor record matching donaturStore's INITIAL_DONATUR shape on Save, so the
// new row displays correctly in every list column (not just id/nama).
const EntryDonaturForm = ({ donaturList = [], onSave, onCancel }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [informasiLain, setInformasiLain] = useState([{ id: 1, tipe: '', keterangan: '' }]);

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e && e.target ? e.target.value : e }));

  const handleToggleLokasi = (checked) => {
    setForm(prev => ({ ...prev, useLokasiOtomatis: checked }));
    if (!checked || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm(prev => ({ ...prev, koordinat: `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}` })),
      () => alert('Tidak dapat mengambil lokasi otomatis. Silakan isi Koordinat secara manual.')
    );
  };

  const addInformasiLainRow = () => setInformasiLain(prev => [...prev, { id: Date.now(), tipe: '', keterangan: '' }]);
  const removeInformasiLainRow = () => setInformasiLain(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const resetInformasiLain = () => setInformasiLain([{ id: 1, tipe: '', keterangan: '' }]);
  const updateInformasiLainRow = (id, field, value) => setInformasiLain(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const handlePreviewSms = () => {
    const nama = form.namaDonatur.trim() || '[Nama Donatur]';
    alert(`Preview SMS:\n\nAssalamu'alaikum ${nama}, terima kasih telah terdaftar sebagai donatur LAZ Darul Hikam. Semoga menjadi amal jariyah. Info lebih lanjut hubungi CRM kami.`);
  };

  const handleSave = () => {
    if (!form.namaDonatur.trim()) {
      alert('Nama Donatur wajib diisi.');
      setStep(0);
      return;
    }
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newDonatur = {
      id: form.idDonatur,
      nama: form.namaDonatur,
      panggilan: form.namaPanggilan,
      hp: form.hp,
      telpon: form.telpon,
      email: form.email,
      alamat: form.alamat,
      kantor: OFFICES.find(o => o.id === form.officeId)?.nama || '',
      tglReg: form.registrasi,
      idTimCrm: '',
      timCrm: form.timCrm,
      hpTimCrm: '',
      jenisKelamin: form.jenisKelamin,
      tglLahir: form.tglLahir,
      jenisDonatur: form.jenisDonatur,
      aktif: 'y',
      koordinat: form.koordinat,
      pekerjaan: form.pekerjaan,
      kesediaanDonasi: form.kesediaanDonasi,
      totalTransaksi: 0,
      jumlahTransaksi: 0,
      userInsert: CURRENT_STAFF_NAME,
      idUserInsert: '',
      note: '',
      updated: now,
      verifiedFields: [],
      verifiedBy: '',
      verifiedAt: '',
      dihubungiVia: form.dihubungiVia,
      minatProgram: form.minatProgram,
      tipePelayanan: form.tipePelayanan,
      parentDonatur: donaturList.find(d => d.id === form.parentDonatur)?.nama || ''
    };
    onSave?.(newDonatur);
  };

  const isLastStep = step === STEPS.length - 1;
  const goNext = () => setStep(s => Math.min(STEPS.length - 1, s + 1));
  const goBack = () => setStep(s => Math.max(0, s - 1));

  return (
    <>
      <div style={{
        background: 'linear-gradient(120deg, #831843 0%, #db2777 60%, #f472b6 100%)',
        color: 'white', flexShrink: 0, padding: '16px 20px', fontWeight: 700, fontSize: '1.05rem',
      }}>
        Data Donatur Baru
      </div>
      <Stepper current={step} onJump={setStep} />

      <div style={{ overflowY: 'auto', flex: 1, padding: '20px' }}>
        {step === 0 && (
          <div>
            <Field label="Nama Donatur"><input type="text" className="form-input" placeholder="Nama Donatur" value={form.namaDonatur} onChange={set('namaDonatur')} /></Field>
            <Field label="ID Donatur"><input type="text" className="form-input" value={form.idDonatur} onChange={set('idDonatur')} /></Field>
            <Field label="Nama Panggilan"><input type="text" className="form-input" placeholder="Nama Panggilan" value={form.namaPanggilan} onChange={set('namaPanggilan')} /></Field>
            <Field label="Jenis Kelamin">
              <select className="form-select" value={form.jenisKelamin} onChange={set('jenisKelamin')}>
                {JENIS_KELAMIN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Tempat, Tgl Lahir">
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" className="form-input" placeholder="Tempat Lahir" value={form.tempatLahir} onChange={set('tempatLahir')} style={{ flex: 1.4 }} />
                <input type="date" className="form-input" value={form.tglLahir} onChange={set('tglLahir')} style={{ flex: 1 }} />
              </div>
            </Field>
            <Field label="Jenis Donatur">
              <select className="form-select" value={form.jenisDonatur} onChange={set('jenisDonatur')}>
                {JENIS_DONATUR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Kantor">
              <select className="form-select" value={form.officeId} onChange={set('officeId')}>
                {OFFICES.map(o => <option key={o.id} value={o.id}>{o.nama}</option>)}
              </select>
            </Field>
            <Field label="Tim CRM">
              <select className="form-select" value={form.timCrm} onChange={set('timCrm')}>
                <option value="">Tim CRM</option>
                {TIM_CRM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
            <div>
              <Field label="Telpon"><input type="text" className="form-input" placeholder="Telpon" value={form.telpon} onChange={set('telpon')} /></Field>
              <Field label="HP"><input type="text" className="form-input" placeholder="Handphone" value={form.hp} onChange={set('hp')} /></Field>
              <Field label="Email"><input type="email" className="form-input" value={form.email} onChange={set('email')} /></Field>
              <Field label="Koordinat"><input type="text" className="form-input" value={form.koordinat} onChange={set('koordinat')} /></Field>
            </div>
            <div>
              <Field label="Alamat" align="top">
                <label className="toggle-switch" style={{ display: 'inline-block', marginBottom: '8px' }} title="Aktifkan lokasi otomatis">
                  <input type="checkbox" checked={form.useLokasiOtomatis} onChange={e => handleToggleLokasi(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
                <textarea className="form-textarea" placeholder="Masukkan lokasi" rows={3} value={form.alamat} onChange={set('alamat')} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
            <div>
              <Field label="Agama">
                <select className="form-select" value={form.agama} onChange={set('agama')}>
                  {AGAMA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Status Nikah">
                <select className="form-select" value={form.statusNikah} onChange={set('statusNikah')}>
                  {STATUS_NIKAH_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Penghasilan Bulanan">
                <select className="form-select" value={form.penghasilanBulanan} onChange={set('penghasilanBulanan')}>
                  <option value="">Penghasilan Bulanan</option>
                  {PENGHASILAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Pendidikan Terakhir">
                <select className="form-select" value={form.pendidikanTerakhir} onChange={set('pendidikanTerakhir')}>
                  <option value="">Pendidikan Terakhir</option>
                  {PENDIDIKAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Sumber Informasi">
                <select className="form-select" value={form.sumberInformasi} onChange={set('sumberInformasi')}>
                  <option value="">Sumber Informasi</option>
                  {SUMBER_INFORMASI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Kesediaan Donasi">
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="form-select" value={form.kesediaanDonasi} onChange={set('kesediaanDonasi')} style={{ flex: 1.4 }}>
                    <option value="">Kesediaan</option>
                    {KESEDIAAN_DONASI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <input type="date" className="form-input" value={form.kesediaanTanggal} onChange={set('kesediaanTanggal')} style={{ flex: 1 }} />
                </div>
              </Field>
            </div>
            <div>
              <Field label="Cara Bayar">
                <select className="form-select" value={form.caraBayar} onChange={set('caraBayar')}>
                  <option value="">Cara Bayar</option>
                  {CARA_BAYAR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Pekerjaan">
                <select className="form-select" value={form.pekerjaan} onChange={set('pekerjaan')}>
                  <option value="">Pekerjaan</option>
                  {PEKERJAAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Minat Program">
                <select className="form-select" value={form.minatProgram} onChange={set('minatProgram')}>
                  <option value="">Minat Program</option>
                  {MINAT_PROGRAM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Dihubungi Via">
                <select className="form-select" value={form.dihubungiVia} onChange={set('dihubungiVia')}>
                  <option value="">Dihubungi Via</option>
                  {DIHUBUNGI_VIA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Tipe Pelayanan">
                <select className="form-select" value={form.tipePelayanan} onChange={set('tipePelayanan')}>
                  <option value="">Tipe Pelayanan</option>
                  {TIPE_PELAYANAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div className="data-table-container" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#fdf2f8', fontWeight: 700, fontSize: '0.8rem' }}>
                <span>Informasi Lain</span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Plus size={16} color="#16a34a" style={{ cursor: 'pointer' }} title="Tambah baris" onClick={addInformasiLainRow} />
                  <Minus size={16} color="#ef4444" style={{ cursor: 'pointer' }} title="Hapus baris terakhir" onClick={removeInformasiLainRow} />
                  <RotateCcw size={16} color="#dc2626" style={{ cursor: 'pointer' }} title="Reset baris" onClick={resetInformasiLain} />
                </div>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Informasi</th><th>Keterangan/Account</th></tr>
                </thead>
                <tbody>
                  {informasiLain.map(row => (
                    <tr key={row.id}>
                      <td>
                        <select className="form-select" value={row.tipe} onChange={e => updateInformasiLainRow(row.id, 'tipe', e.target.value)}>
                          <option value=""></option>
                          {INFORMASI_LAIN_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>
                      <td>
                        <input type="text" className="form-input" value={row.keterangan} onChange={e => updateInformasiLainRow(row.id, 'keterangan', e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ maxWidth: '480px' }}>
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
              padding: '12px 14px', marginBottom: '20px',
            }}>
              <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '0.78rem', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                Donatur login menggunakan akun Google (SSO) — tanpa username, password, atau upload foto.
              </p>
            </div>
            <Field label="Registrasi"><input type="date" className="form-input" value={form.registrasi} onChange={set('registrasi')} /></Field>
            <Field label="NPWP"><input type="text" className="form-input" placeholder="Nomor Pokok Wajib Zakat" value={form.npwp} onChange={set('npwp')} /></Field>
            <Field label="Parent Donatur">
              <select className="form-select" value={form.parentDonatur} onChange={set('parentDonatur')}>
                <option value="">Donatur</option>
                {donaturList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </Field>
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px',
        padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', flexShrink: 0, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={onCancel}><X size={16} /> Cancel</button>
          {step > 0 && (
            <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={goBack}><ChevronLeft size={16} /> Kembali</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {isLastStep && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.sendSms} onChange={e => setForm(prev => ({ ...prev, sendSms: e.target.checked }))} />
              Send SMS
            </label>
          )}
          {isLastStep && (
            <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handlePreviewSms}>
              <MessageSquare size={16} /> Preview SMS
            </button>
          )}
          {isLastStep ? (
            <button type="button" className="btn btn-success" onClick={handleSave}><Check size={16} /> Save</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={goNext}>Lanjut <ChevronRight size={16} /></button>
          )}
        </div>
      </div>
    </>
  );
};

export default EntryDonaturForm;
