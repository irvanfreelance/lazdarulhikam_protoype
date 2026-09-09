import React, { useState } from 'react';
import {
  RefreshCw, Plus, RotateCcw, Trash2, Check, X, MessageSquare, User, UserPlus, Eye, EyeOff
} from 'lucide-react';
import { OFFICES } from '../utils/finsCoaStore';
import { INITIAL_REKENING_BANK } from '../utils/finsSettingsStore';
import { INITIAL_DONATUR, generateDonaturId } from '../utils/donaturStore';
import {
  VIA_HIMPUN_OPTIONS, JENIS_TRANSAKSI_OPTIONS, PROGRAM_TRANSAKSI, CURRENT_USER
} from '../utils/crmTransaksiStore';
import SearchableSelect from '../components/SearchableSelect';
import LocationPicker from '../components/LocationPicker';
import { reverseGeocode } from '../utils/geocode';

const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const todayStr = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

let idTransCounter = 1;
const generateIdTransaksi = (dateStr) => {
  const [, mm, dd] = (dateStr || todayStr()).split('-');
  const seq = String(idTransCounter++).padStart(6, '0');
  return `9001${mm}${dd}${seq}${String(1000 + (idTransCounter % 9000)).padStart(4, '0')}`;
};

const bankOptions = INITIAL_REKENING_BANK.filter(r => r.active).map(r => ({
  value: `${r.bank} ${r.accountNumber} ${r.description}`,
  label: `${r.bank.toUpperCase()} ${r.accountNumber} ${r.description}`,
}));
const programOptions = PROGRAM_TRANSAKSI.map(p => ({ value: p.nama, label: p.nama }));
const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));

const emptyHeader = () => ({
  donaturId: '', jenisDonatur: 'Perorangan', idDonaturDisplay: '', hp: '', email: '', alamat: '', timCrm: '', kantorDonaturLabel: '',
  provinsi: '', kotaKab: '', kecamatan: '', kelurahan: '', lat: null, lng: null,
  viaHimpun: VIA_HIMPUN_OPTIONS[0], jenisTransaksi: 'Bank', bank: bankOptions[0]?.value || '',
  kantorTransaksiId: '1', tanggal: nowLocal(), backDate: false,
});
const emptyDraftLine = (namaDonatur) => ({
  program: programOptions[0]?.value || '', qty: 1, nominal: '',
  keterangan: namaDonatur ? `an: ${namaDonatur} | ` : '', peruntukan: todayStr(),
});
const emptyQuickAdd = () => ({ nama: '', hp: '', email: '' });

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
    <label style={{ width: '130px', flexShrink: 0, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{label} :</label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

// Self-contained donor+transaction entry form. Renders its own colored
// header bar + footer, so it can be dropped straight into a wide modal (see
// ListTransaksi.jsx "Tambah Transaksi") without any extra chrome. Builds a
// full transaction record per line item matching crmTransaksiStore's
// INITIAL_TRANSAKSI shape on Save, so new rows display correctly in every
// list column (not just id/nama).
const EntryTransaksiForm = ({ onSave, onCancel }) => {
  const [donaturList, setDonaturList] = useState(INITIAL_DONATUR);
  const [header, setHeader] = useState(emptyHeader());
  const [draftLine, setDraftLine] = useState(emptyDraftLine(''));
  const [lines, setLines] = useState([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(emptyQuickAdd());
  const [sendWhatsapp, setSendWhatsapp] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [sendSms, setSendSms] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const donaturOptions = donaturList.map(d => ({ value: d.id, label: d.nama }));
  const selectedDonatur = donaturList.find(d => d.id === header.donaturId);

  const applyDonatur = (donatur) => {
    setHeader(prev => ({
      ...prev,
      donaturId: donatur.id,
      jenisDonatur: donatur.jenisDonatur || 'Perorangan',
      idDonaturDisplay: donatur.id,
      hp: donatur.hp || '',
      email: donatur.email || '',
      alamat: donatur.alamat || '',
      timCrm: donatur.timCrm || '',
      kantorDonaturLabel: donatur.kantor || '',
      provinsi: donatur.provinsi || '',
      kotaKab: donatur.kotaKab || '',
      kecamatan: donatur.kecamatan || '',
      kelurahan: donatur.kelurahan || '',
      lat: typeof donatur.lat === 'number' ? donatur.lat : null,
      lng: typeof donatur.lng === 'number' ? donatur.lng : null,
    }));
    setDraftLine(prev => ({ ...prev, keterangan: `an: ${donatur.nama} | ` }));
  };

  const handleSelectDonatur = (id) => {
    const donatur = donaturList.find(d => d.id === id);
    if (donatur) applyDonatur(donatur);
  };

  // Fires when the user clicks/drags a point on the map (not when a donor's
  // saved location is applied via applyDonatur) — looks up Provinsi/
  // Kecamatan/Kelurahan for that point so they don't have to type it in.
  const handleLocationPicked = (lat, lng) => {
    setHeader(prev => ({ ...prev, lat, lng }));
    setGeocoding(true);
    reverseGeocode(lat, lng)
      .then(({ provinsi, kotaKab, kecamatan, kelurahan }) => {
        setHeader(prev => (prev.lat === lat && prev.lng === lng)
          ? { ...prev, provinsi: provinsi || prev.provinsi, kotaKab: kotaKab || prev.kotaKab, kecamatan: kecamatan || prev.kecamatan, kelurahan: kelurahan || prev.kelurahan }
          : prev);
      })
      .catch(() => { /* biarkan Provinsi/Kecamatan/Kelurahan diisi manual jika lookup gagal */ })
      .finally(() => setGeocoding(false));
  };

  const handleResetForm = () => {
    setHeader(emptyHeader());
    setDraftLine(emptyDraftLine(''));
    setLines([]);
  };

  const handleQuickAddSave = () => {
    if (!quickAdd.nama.trim()) { alert('Nama donatur wajib diisi.'); return; }
    const newDonatur = {
      id: generateDonaturId(), nama: quickAdd.nama.trim(), hp: quickAdd.hp, email: quickAdd.email,
      alamat: '', kantor: OFFICES.find(o => o.id === header.kantorTransaksiId)?.nama || '', timCrm: '',
      jenisDonatur: 'Perorangan',
    };
    setDonaturList(prev => [...prev, newDonatur]);
    applyDonatur(newDonatur);
    setQuickAddOpen(false);
    setQuickAdd(emptyQuickAdd());
  };

  const totalDraft = (Number(draftLine.qty) || 0) * (Number(draftLine.nominal) || 0);

  const addLine = () => {
    if (!header.donaturId) { alert('Pilih donatur terlebih dahulu.'); return; }
    if (!draftLine.nominal || Number(draftLine.nominal) <= 0) { alert('Isi Nominal terlebih dahulu.'); return; }
    setLines(prev => [...prev, {
      key: `${Date.now()}-${Math.random()}`,
      program: draftLine.program,
      qty: Number(draftLine.qty) || 1,
      nominal: Number(draftLine.nominal),
      keterangan: draftLine.keterangan,
      peruntukan: draftLine.peruntukan,
    }]);
    setDraftLine(emptyDraftLine(selectedDonatur?.nama));
  };
  const resetDraftLine = () => setDraftLine(emptyDraftLine(selectedDonatur?.nama));
  const removeLine = (key) => setLines(prev => prev.filter(l => l.key !== key));

  const linesTotal = lines.reduce((s, l) => s + l.qty * l.nominal, 0);

  const handlePreviewSms = () => {
    const nama = selectedDonatur?.nama || '[Nama Donatur]';
    alert(`Preview SMS:\n\nAssalamu'alaikum ${nama}, terima kasih atas donasi Anda sebesar ${fmt(linesTotal)} melalui ${header.viaHimpun}. Semoga menjadi amal jariyah. — LAZ Darul Hikam`);
  };

  const handleSave = () => {
    if (!header.donaturId) { alert('Pilih donatur terlebih dahulu.'); return; }
    if (lines.length === 0) { alert('Tambahkan minimal satu baris Detail Transaksi.'); return; }
    const tglTransaksi = header.tanggal.replace('T', ' ') + ':00';
    const kantorTransaksi = OFFICES.find(o => o.id === header.kantorTransaksiId)?.nama || '';
    const newTransaksi = lines.map(l => ({
      id: generateIdTransaksi(tglTransaksi.slice(0, 10)),
      idDonatur: selectedDonatur.id,
      namaDonatur: selectedDonatur.nama,
      program: l.program,
      qty: l.qty,
      nominal: l.nominal,
      kantorTransaksi,
      userInsert: CURRENT_USER.nama,
      tglTransaksi,
      peruntukan: l.peruntukan,
      idTimCrm: selectedDonatur.idTimCrm || '',
      timCrm: header.timCrm || selectedDonatur.timCrm || '',
      viaHimpun: header.viaHimpun,
      jenisTransaksi: header.jenisTransaksi,
      bank: header.jenisTransaksi === 'Bank' ? header.bank : '',
      status: 'Pending',
      keterangan: l.keterangan
    }));
    const channels = [sendWhatsapp && 'WhatsApp', sendEmail && 'Email', sendSms && 'SMS'].filter(Boolean).join(', ');
    onSave?.(newTransaksi, channels);
  };

  return (
    <>
      <div style={{ background: 'var(--primary-color)', color: 'white', padding: '12px 20px', fontWeight: 700, flexShrink: 0 }}>
        Entry Transaksi Donasi
      </div>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', padding: '24px' }}>
          {/* --- Informasi Donatur --- */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Donatur</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Nama :</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SearchableSelect options={donaturOptions} value={header.donaturId} onChange={handleSelectDonatur} placeholder="Cari nama donatur..." />
                </div>
                <UserPlus size={18} color="#16a34a" style={{ cursor: 'pointer', flexShrink: 0 }} title="Tambah donatur baru" onClick={() => { setQuickAdd(emptyQuickAdd()); setQuickAddOpen(true); }} />
                <RefreshCw size={16} color="#16a34a" style={{ cursor: 'pointer', flexShrink: 0 }} title="Reset donatur" onClick={() => { setHeader(prev => ({ ...emptyHeader(), viaHimpun: prev.viaHimpun, jenisTransaksi: prev.jenisTransaksi, bank: prev.bank, kantorTransaksiId: prev.kantorTransaksiId })); setDraftLine(emptyDraftLine('')); }} />
              </div>
            </div>

            <Field label="Jenis Donatur">
              <select className="form-select" value={header.jenisDonatur} onChange={e => setHeader(prev => ({ ...prev, jenisDonatur: e.target.value }))}>
                {['Perorangan', 'Lembaga', 'Perusahaan'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="ID Donatur">
              <input type="text" className="form-input" disabled value={header.idDonaturDisplay} />
            </Field>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.82rem', display: 'block', marginBottom: '4px' }}>
                HP : <span style={{ color: 'var(--danger-color)', fontSize: '0.72rem' }}>Kode Indonesia -&gt; 62</span>
              </label>
              <input type="text" className="form-input" value={header.hp} onChange={e => setHeader(prev => ({ ...prev, hp: e.target.value }))} />
            </div>
            <Field label="Email">
              <input type="email" className="form-input" value={header.email} onChange={e => setHeader(prev => ({ ...prev, email: e.target.value }))} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
              <label style={{ width: '130px', flexShrink: 0, fontSize: '0.82rem', paddingTop: '7px' }}>Alamat :</label>
              <div style={{ flex: 1, minWidth: 0 }}>
                <textarea className="form-textarea" rows={3} value={header.alamat} onChange={e => setHeader(prev => ({ ...prev, alamat: e.target.value }))} />
              </div>
            </div>
            <Field label="Provinsi">
              <input type="text" className="form-input" value={header.provinsi} onChange={e => setHeader(prev => ({ ...prev, provinsi: e.target.value }))} />
            </Field>
            <Field label="Kota/Kab">
              <input type="text" className="form-input" placeholder="mis. Bandung" value={header.kotaKab} onChange={e => setHeader(prev => ({ ...prev, kotaKab: e.target.value }))} />
            </Field>
            <Field label="Kecamatan">
              <input type="text" className="form-input" value={header.kecamatan} onChange={e => setHeader(prev => ({ ...prev, kecamatan: e.target.value }))} />
            </Field>
            <Field label="Kelurahan/Desa">
              <input type="text" className="form-input" value={header.kelurahan} onChange={e => setHeader(prev => ({ ...prev, kelurahan: e.target.value }))} />
            </Field>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem' }}>
                  Titik Koordinat :{geocoding && <span style={{ color: '#db2777', fontWeight: 400 }}> mencari wilayah...</span>}
                  {!showMap && typeof header.lat === 'number' && (
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}> {header.lat.toFixed(6)}, {header.lng.toFixed(6)}</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setShowMap(o => !o)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#db2777', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}
                >
                  {showMap ? <><EyeOff size={14} /> Sembunyikan</> : <><Eye size={14} /> Tampilkan</>}
                </button>
              </div>
              {showMap && (
                <LocationPicker
                  lat={header.lat}
                  lng={header.lng}
                  onChange={handleLocationPicked}
                  height="180px"
                />
              )}
            </div>
            <Field label="Tim CRM">
              <input type="text" className="form-input" value={header.timCrm} onChange={e => setHeader(prev => ({ ...prev, timCrm: e.target.value }))} />
            </Field>
            <Field label="Kantor Donatur">
              <input type="text" className="form-input" disabled value={header.kantorDonaturLabel} />
            </Field>
          </div>

          {/* --- Informasi Transaksi --- */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Transaksi</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
              <Field label="Via Himpun">
                <select className="form-select" value={header.viaHimpun} onChange={e => setHeader(prev => ({ ...prev, viaHimpun: e.target.value }))}>
                  {VIA_HIMPUN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Kantor Transaksi">
                <SearchableSelect options={officeOptions} value={header.kantorTransaksiId} onChange={val => setHeader(prev => ({ ...prev, kantorTransaksiId: val }))} />
              </Field>

              <Field label="Jenis Transaksi">
                <select className="form-select" value={header.jenisTransaksi} onChange={e => setHeader(prev => ({ ...prev, jenisTransaksi: e.target.value }))}>
                  {JENIS_TRANSAKSI_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Tgl Transaksi">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="datetime-local" className="form-input" disabled={!header.backDate} value={header.tanggal} onChange={e => setHeader(prev => ({ ...prev, tanggal: e.target.value }))} />
                  {!header.backDate && (
                    <a href="#" style={{ color: 'var(--danger-color)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      onClick={e => { e.preventDefault(); setHeader(prev => ({ ...prev, backDate: true })); }}>
                      Back Date
                    </a>
                  )}
                </div>
              </Field>

              {header.jenisTransaksi === 'Bank' && (
                <Field label="Bank">
                  <SearchableSelect options={bankOptions} value={header.bank} onChange={val => setHeader(prev => ({ ...prev, bank: val }))} placeholder="Pilih rekening bank" />
                </Field>
              )}
              <Field label="User Insert">
                <input type="text" className="form-input" disabled value={CURRENT_USER.username} />
              </Field>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '20px 0 14px', fontFamily: 'var(--font-heading)' }}>
              Detail Transaksi {header.jenisTransaksi}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr 1fr 1fr 1.6fr 1fr auto', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Program :</label>
                <SearchableSelect options={programOptions} value={draftLine.program} onChange={val => setDraftLine(prev => ({ ...prev, program: val }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Qty :</label>
                <input type="number" min="1" className="form-input" value={draftLine.qty} onChange={e => setDraftLine(prev => ({ ...prev, qty: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>@Nominal :</label>
                <input type="number" min="0" className="form-input" placeholder="0,00" value={draftLine.nominal} onChange={e => setDraftLine(prev => ({ ...prev, nominal: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Total [IDR] :</label>
                <input type="text" className="form-input" disabled value={fmt(totalDraft)} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Keterangan :</label>
                <input type="text" className="form-input" value={draftLine.keterangan} onChange={e => setDraftLine(prev => ({ ...prev, keterangan: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Peruntukan :</label>
                <input type="date" className="form-input" value={draftLine.peruntukan} onChange={e => setDraftLine(prev => ({ ...prev, peruntukan: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '6px', paddingBottom: '2px' }}>
                <Plus size={22} color="#16a34a" style={{ cursor: 'pointer' }} title="Tambah baris" onClick={addLine} />
                <RotateCcw size={20} color="#16a34a" style={{ cursor: 'pointer' }} title="Reset baris" onClick={resetDraftLine} />
              </div>
            </div>

            <div className="data-table-container" style={{ marginTop: '16px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>@Nominal</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Keterangan</th>
                    <th>Peruntukan</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada baris transaksi</td></tr>
                  )}
                  {lines.map(l => (
                    <tr key={l.key}>
                      <td>{l.program}</td>
                      <td style={{ textAlign: 'center' }}>{l.qty}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(l.nominal)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(l.qty * l.nominal)}</td>
                      <td>{l.keterangan || '-'}</td>
                      <td>{l.peruntukan}</td>
                      <td style={{ textAlign: 'center' }}>
                        <Trash2 size={16} color="#ef4444" style={{ cursor: 'pointer' }} title="Hapus baris" onClick={() => removeLine(l.key)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                {lines.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total :</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmt(linesTotal)}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px',
        padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc', flexWrap: 'wrap', flexShrink: 0,
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={sendWhatsapp} onChange={e => setSendWhatsapp(e.target.checked)} /> Send Whatsapp
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} /> Send Email
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} /> Send SMS
        </label>
        <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={handlePreviewSms}>
          <MessageSquare size={16} /> Preview SMS
        </button>
        <button type="button" className="btn btn-success" onClick={handleSave}><Check size={16} /> Save</button>
        <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={onCancel}><X size={16} /> Cancel</button>
      </div>

      {quickAddOpen && (
        <div className="modal-backdrop" onClick={() => setQuickAddOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tambah Donatur Cepat</h2>
              <button className="modal-close" onClick={() => setQuickAddOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group full-width">
                <label>Nama Donatur</label>
                <input type="text" className="form-input" required value={quickAdd.nama} onChange={e => setQuickAdd(prev => ({ ...prev, nama: e.target.value }))} />
              </div>
              <div className="form-group full-width">
                <label>HP</label>
                <input type="text" className="form-input" value={quickAdd.hp} onChange={e => setQuickAdd(prev => ({ ...prev, hp: e.target.value }))} />
              </div>
              <div className="form-group full-width">
                <label>Email</label>
                <input type="email" className="form-input" value={quickAdd.email} onChange={e => setQuickAdd(prev => ({ ...prev, email: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setQuickAddOpen(false)}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleQuickAddSave}>Simpan & Pilih</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EntryTransaksiForm;
