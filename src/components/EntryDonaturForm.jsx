import React, { useState, useRef } from 'react';
import {
  Plus, Minus, Save, RotateCcw, UserCircle, MessageSquare, Check, X
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
  registrasi: todayStr(), userName: '', password: '', npwp: '', parentDonatur: '',
  sendSms: false,
});

const Field = ({ label, children, align = 'center' }) => (
  <div style={{ display: 'flex', alignItems: align === 'top' ? 'flex-start' : 'center', gap: '10px', marginBottom: '12px' }}>
    <label style={{ width: '135px', flexShrink: 0, fontSize: '0.82rem', color: 'var(--text-primary)', paddingTop: align === 'top' ? '7px' : 0 }}>{label} :</label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

// Self-contained 3-column donor entry form. Renders its own colored header
// bar + footer, so it can be dropped straight into a wide modal (see
// ListDonatur.jsx "Tambah Donatur") without any extra chrome. Builds a full
// donor record matching donaturStore's INITIAL_DONATUR shape on Save, so the
// new row displays correctly in every list column (not just id/nama).
const EntryDonaturForm = ({ donaturList = [], onSave, onCancel }) => {
  const [form, setForm] = useState(emptyForm());
  const [informasiLain, setInformasiLain] = useState([{ id: 1, tipe: '', keterangan: '' }]);
  const [photo, setPhoto] = useState(null);
  const fileInputRef = useRef(null);

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

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePreviewSms = () => {
    const nama = form.namaDonatur.trim() || '[Nama Donatur]';
    alert(`Preview SMS:\n\nAssalamu'alaikum ${nama}, terima kasih telah terdaftar sebagai donatur LAZ Darul Hikam. Semoga menjadi amal jariyah. Info lebih lanjut hubungi CRM kami.`);
  };

  const handleSave = () => {
    if (!form.namaDonatur.trim()) {
      alert('Nama Donatur wajib diisi.');
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

  return (
    <>
      <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700, flexShrink: 0 }}>
        Data Donatur Baru
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px', padding: '24px' }}>
          {/* --- Informasi Utama --- */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Utama</h3>
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
            <Field label="Alamat" align="top">
              <label className="toggle-switch" style={{ display: 'inline-block', marginBottom: '8px' }} title="Aktifkan lokasi otomatis">
                <input type="checkbox" checked={form.useLokasiOtomatis} onChange={e => handleToggleLokasi(e.target.checked)} />
                <span className="toggle-slider" />
              </label>
              <textarea className="form-textarea" placeholder="Masukkan lokasi" rows={3} value={form.alamat} onChange={set('alamat')} />
            </Field>
            <Field label="Koordinat"><input type="text" className="form-input" value={form.koordinat} onChange={set('koordinat')} /></Field>
            <Field label="Telpon"><input type="text" className="form-input" placeholder="Telpon" value={form.telpon} onChange={set('telpon')} /></Field>
            <Field label="HP"><input type="text" className="form-input" placeholder="Handphone" value={form.hp} onChange={set('hp')} /></Field>
            <Field label="Email"><input type="email" className="form-input" value={form.email} onChange={set('email')} /></Field>
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

          {/* --- Informasi Tambahan --- */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Tambahan</h3>
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

            <div className="data-table-container" style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', background: '#f8fafc', fontWeight: 700, fontSize: '0.8rem' }}>
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

          {/* --- Login Donatur --- */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Login Donatur</h3>
            <Field label="Registrasi"><input type="date" className="form-input" value={form.registrasi} onChange={set('registrasi')} /></Field>
            <Field label="User Name"><input type="text" className="form-input" placeholder="User Name" value={form.userName} onChange={set('userName')} /></Field>
            <Field label="Password"><input type="password" className="form-input" placeholder="Password" value={form.password} onChange={set('password')} /></Field>

            <div style={{
              width: '100%', aspectRatio: '4 / 3', background: '#f1f5f9', border: '1px solid var(--border-color)',
              borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '10px', position: 'relative', overflow: 'hidden', marginBottom: '16px',
            }}>
              {photo ? (
                <img src={photo} alt="Foto donatur" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <UserCircle size={72} color="#cbd5e1" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: photo ? 'absolute' : 'static', bottom: photo ? '12px' : undefined,
                  background: '#facc15', border: 'none', color: '#78350f', fontWeight: 700,
                  padding: '6px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem',
                }}
              >
                Choose
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>

            <Field label="NPWP"><input type="text" className="form-input" placeholder="Nomor Pokok Wajib Zakat" value={form.npwp} onChange={set('npwp')} /></Field>
            <Field label="Parent Donatur">
              <select className="form-select" value={form.parentDonatur} onChange={set('parentDonatur')}>
                <option value="">Donatur</option>
                {donaturList.map(d => <option key={d.id} value={d.id}>{d.nama}</option>)}
              </select>
            </Field>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px',
        padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', flexShrink: 0,
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.sendSms} onChange={e => setForm(prev => ({ ...prev, sendSms: e.target.checked }))} />
          Send SMS
        </label>
        <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handlePreviewSms}>
          <MessageSquare size={16} /> Preview SMS
        </button>
        <button type="button" className="btn btn-success" onClick={handleSave}><Check size={16} /> Save</button>
        <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={onCancel}><X size={16} /> Cancel</button>
      </div>
    </>
  );
};

export default EntryDonaturForm;
