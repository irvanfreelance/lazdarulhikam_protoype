import React, { useState } from 'react';
import { RefreshCw, Check, User, UserPlus, Plus, RotateCcw, Trash2, X } from 'lucide-react';
import { getAccountingData, updateAccountingData, disburseRequestAction, formatRupiah } from '../utils/accountingStore';
import { OFFICES } from '../utils/finsCoaStore';
import { INITIAL_REKENING_BANK } from '../utils/finsSettingsStore';
import SearchableSelect from '../components/SearchableSelect';

const CAMPAIGN_OPTIONS = [
  { value: '', label: '— Tanpa Campaign —' },
  { value: '1', label: 'Bantuan Darurat Bencana Banjir' },
  { value: '2', label: 'Pembangunan Masjid Pelosok' },
  { value: '3', label: 'Beasiswa Santri Tahfidz' },
  { value: '4', label: 'Wakaf Sumur Air Bersih' },
  { value: '5', label: 'Operasional Panti Asuhan' }
];

const PERMOHONAN_VIA_OPTIONS = ['Datang langsung', 'Rujukan', 'Online', 'Survey Lapangan'];
const PENCAIRAN_VIA_OPTIONS = ['Bank', 'Cash', 'Barang'];
const ASNAF_OPTIONS = ['Fakir', 'Miskin', 'Amil', 'Muallaf', 'Riqab', 'Gharim', 'Fisabilillah', 'Ibnu Sabil'];

const PROGRAM_PENYALURAN_OPTIONS = [
  { nama: 'Penyaluran Zakat Fakir Miskin', coaDebet: '501.05.000.000' },
  { nama: 'Bantuan Kesehatan', coaDebet: '501.01.000.000' },
  { nama: 'Beasiswa Mahasantri', coaDebet: '501.02.000.000' },
  { nama: 'Infaq Sarana & Prasarana', coaDebet: '501.02.000.000' },
  { nama: 'Bantuan Bencana', coaDebet: '501.02.000.000' },
  { nama: 'Penyaluran Pangan', coaDebet: '501.03.000.000' }
];

const CURRENT_USER = { id: '1032021001001', nama: 'Asep Saepul', username: 'asep.pi' };

const bankOptions = INITIAL_REKENING_BANK.filter(r => r.active).map(r => ({
  value: r.id,
  label: `${r.bank.toUpperCase()} ${r.accountNumber}`,
  coa: r.coa
}));
const programOptions = PROGRAM_PENYALURAN_OPTIONS.map(p => ({ value: p.nama, label: p.nama }));
const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const todayStr = () => new Date().toISOString().slice(0, 10);
const fmt = (n) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0);

const emptyHeader = () => ({
  pmId: '', hp: '', email: '', alamat: '', koordinat: '', asnaf: 'Fakir', pj: '', kantorLabel: '',
  permohonanVia: PERMOHONAN_VIA_OPTIONS[0], pencairanVia: 'Bank', bankId: bankOptions[0]?.value || '',
  campaignId: '', kantorSalurId: '1', tglMohon: todayStr(), tglSalur: nowLocal(), backDate: false,
});
const emptyDraftLine = (namaPM) => ({
  program: programOptions[0]?.value || '', qty: 1, nominal: '',
  keterangan: namaPM ? `an: ${namaPM} | ` : '',
});
const emptyQuickAdd = () => ({ nama: '', nik: '', kategori: 'individu' });

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
    <label style={{ width: '130px', flexShrink: 0, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{label} :</label>
    <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
  </div>
);

const EntryPenyaluran = () => {
  const [data, setData] = useState(() => getAccountingData());
  const [header, setHeader] = useState(emptyHeader());
  const [draftLine, setDraftLine] = useState(emptyDraftLine(''));
  const [lines, setLines] = useState([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(emptyQuickAdd());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pmOptions = data.beneficiaries.map(b => ({ value: b.id, label: b.nama_lengkap }));
  const selectedPM = data.beneficiaries.find(b => b.id === header.pmId);

  const applyPM = (pm) => {
    setHeader(prev => ({
      ...prev,
      pmId: pm.id,
      hp: pm.hp || '',
      email: pm.email || '',
      alamat: pm.alamat || [pm.kelurahan, pm.kecamatan, pm.kabupaten, pm.provinsi].filter(Boolean).join(', '),
      koordinat: pm.koordinat || (pm.lat && pm.lng ? `${pm.lat}, ${pm.lng}` : ''),
      asnaf: pm.asnaf || 'Fakir',
      pj: pm.pj || '',
      kantorLabel: pm.kantorLabel || OFFICES.find(o => o.id === '1')?.nama || '',
    }));
    setDraftLine(prev => ({ ...prev, keterangan: `an: ${pm.nama_lengkap} | ` }));
  };

  const handleSelectPM = (id) => {
    const pm = data.beneficiaries.find(b => b.id === id);
    if (pm) applyPM(pm);
  };

  const handleReset = () => {
    const fresh = getAccountingData();
    setData(fresh);
    setHeader(emptyHeader());
    setDraftLine(emptyDraftLine(''));
    setLines([]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    handleReset();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleQuickAddSave = () => {
    if (!quickAdd.nama.trim()) { alert('Nama Penerima Manfaat wajib diisi.'); return; }
    const store = getAccountingData();
    const newPM = {
      id: String(store.beneficiaries.length + 1),
      kode_beneficiary: `BNF-2026-${String(store.beneficiaries.length + 1).padStart(6, '0')}`,
      nama_lengkap: quickAdd.nama.trim(),
      nik: quickAdd.nik,
      kategori: quickAdd.kategori,
      status_ekonomi: 'miskin',
      kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '',
      status_verifikasi: 'unverified',
      campaign_id: null,
    };
    const updated = [...store.beneficiaries, newPM];
    updateAccountingData('laz_beneficiaries', updated);
    setData(prev => ({ ...prev, beneficiaries: updated }));
    applyPM(newPM);
    setQuickAddOpen(false);
    setQuickAdd(emptyQuickAdd());
  };

  const totalDraft = (Number(draftLine.qty) || 0) * (Number(draftLine.nominal) || 0);

  const addLine = () => {
    if (!header.pmId) { alert('Pilih Penerima Manfaat terlebih dahulu.'); return; }
    if (!draftLine.nominal || Number(draftLine.nominal) <= 0) { alert('Isi Nominal terlebih dahulu.'); return; }
    setLines(prev => [...prev, {
      key: `${Date.now()}-${Math.random()}`,
      program: draftLine.program,
      qty: Number(draftLine.qty) || 1,
      nominal: Number(draftLine.nominal),
      keterangan: draftLine.keterangan,
    }]);
    setDraftLine(emptyDraftLine(selectedPM?.nama_lengkap));
  };
  const resetDraftLine = () => setDraftLine(emptyDraftLine(selectedPM?.nama_lengkap));
  const removeLine = (key) => setLines(prev => prev.filter(l => l.key !== key));

  const linesTotal = lines.reduce((s, l) => s + l.qty * l.nominal, 0);
  const selectedBank = bankOptions.find(b => b.value === header.bankId);

  const handleSave = () => {
    if (!header.pmId) { alert('Pilih Penerima Manfaat terlebih dahulu.'); return; }
    if (lines.length === 0) { alert('Tambahkan minimal satu baris Detail Penyaluran.'); return; }
    if (header.pencairanVia === 'Bank' && !header.bankId) { alert('Pilih Bank terlebih dahulu.'); return; }

    const store = getAccountingData();
    let requests = [...store.disbursementRequests];
    const coaKredit = header.pencairanVia === 'Bank' ? (selectedBank?.coa || '101.02.001.000') : '101.01.001.000';

    lines.forEach(line => {
      const programCfg = PROGRAM_PENYALURAN_OPTIONS.find(p => p.nama === line.program);
      const newReq = {
        id: String(requests.length + 1),
        nomor_pengajuan: `DSB-2026-${String(requests.length + 1).padStart(6, '0')}`,
        judul: line.program,
        deskripsi: line.keterangan,
        campaign_id: header.campaignId ? parseInt(header.campaignId) : null,
        beneficiary_id: header.pmId,
        jenis_penyaluran: header.pencairanVia === 'Bank' ? 'transfer' : (header.pencairanVia === 'Cash' ? 'tunai' : 'barang'),
        jumlah_diajukan: line.qty * line.nominal,
        jumlah_disetujui: line.qty * line.nominal,
        coa_debet: programCfg?.coaDebet || '501.02.000.000',
        coa_kredit: coaKredit,
        status: 'approved',
        nik_pengaju: CURRENT_USER.id,
        tgl_pengajuan: header.tglMohon,
        approved_by: 'SYSTEM (Entry Langsung)',
        tgl_approval: new Date().toISOString(),
      };
      requests = [newReq, ...requests];
    });

    updateAccountingData('laz_disbursement_requests', requests);
    lines.forEach((line, idx) => disburseRequestAction(requests[lines.length - 1 - idx].id, coaKredit));

    alert(`Penyaluran untuk "${selectedPM?.nama_lengkap}" senilai ${formatRupiah(linesTotal)} berhasil dicatat & langsung dicairkan. Jurnal pengeluaran otomatis tercatat di Keuangan.`);
    handleReset();
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ marginBottom: 0 }}>Entry Penyaluran</h1>
          <button onClick={handleRefresh} title="Reset form" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}>
            <RefreshCw size={20} className={isRefreshing ? 'icon-spin' : ''} />
          </button>
        </div>
      </div>

      <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-card)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', padding: '24px' }}>
          {/* --- Informasi PM --- */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi PM</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>Nama :</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <SearchableSelect options={pmOptions} value={header.pmId} onChange={handleSelectPM} placeholder="Cari penerima manfaat..." />
                </div>
                <UserPlus size={18} color="#16a34a" style={{ cursor: 'pointer', flexShrink: 0 }} title="Tambah PM baru" onClick={() => { setQuickAdd(emptyQuickAdd()); setQuickAddOpen(true); }} />
                <RefreshCw size={16} color="#16a34a" style={{ cursor: 'pointer', flexShrink: 0 }} title="Reset PM" onClick={() => { setHeader(prev => ({ ...emptyHeader(), permohonanVia: prev.permohonanVia, pencairanVia: prev.pencairanVia, bankId: prev.bankId, kantorSalurId: prev.kantorSalurId })); setDraftLine(emptyDraftLine('')); }} />
              </div>
            </div>

            <Field label="ID PM">
              <input type="text" className="form-input" disabled value={selectedPM ? (selectedPM.nik || selectedPM.kode_beneficiary) : ''} />
            </Field>
            <Field label="HP">
              <input type="text" className="form-input" placeholder="Handphone" value={header.hp} onChange={e => setHeader(prev => ({ ...prev, hp: e.target.value }))} />
            </Field>
            <Field label="Email">
              <input type="email" className="form-input" value={header.email} onChange={e => setHeader(prev => ({ ...prev, email: e.target.value }))} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
              <label style={{ width: '130px', flexShrink: 0, fontSize: '0.82rem', paddingTop: '7px' }}>Alamat :</label>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label className="toggle-switch" style={{ display: 'inline-block', marginBottom: '8px' }} title="Verifikasi alamat">
                  <input type="checkbox" />
                  <span className="toggle-slider" />
                </label>
                <textarea className="form-textarea" rows={3} value={header.alamat} onChange={e => setHeader(prev => ({ ...prev, alamat: e.target.value }))} />
              </div>
            </div>
            <Field label="Koordinat">
              <input type="text" className="form-input" value={header.koordinat} onChange={e => setHeader(prev => ({ ...prev, koordinat: e.target.value }))} />
            </Field>
            <Field label="Asnaf">
              <select className="form-select" value={header.asnaf} onChange={e => setHeader(prev => ({ ...prev, asnaf: e.target.value }))}>
                {ASNAF_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="PJ">
              <input type="text" className="form-input" value={header.pj} onChange={e => setHeader(prev => ({ ...prev, pj: e.target.value }))} />
            </Field>
            <Field label="Kantor">
              <input type="text" className="form-input" value={header.kantorLabel} onChange={e => setHeader(prev => ({ ...prev, kantorLabel: e.target.value }))} />
            </Field>
          </div>

          {/* --- Informasi Penyaluran --- */}
          <div>
            <h3 style={{ fontSize: '0.95rem', marginBottom: '16px', fontFamily: 'var(--font-heading)' }}>Informasi Penyaluran</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 32px' }}>
              <Field label="Permohonan Via">
                <select className="form-select" value={header.permohonanVia} onChange={e => setHeader(prev => ({ ...prev, permohonanVia: e.target.value }))}>
                  {PERMOHONAN_VIA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Kantor Salur">
                <SearchableSelect options={officeOptions} value={header.kantorSalurId} onChange={val => setHeader(prev => ({ ...prev, kantorSalurId: val }))} />
              </Field>

              <Field label="Pencairan Via">
                <select className="form-select" value={header.pencairanVia} onChange={e => setHeader(prev => ({ ...prev, pencairanVia: e.target.value }))}>
                  {PENCAIRAN_VIA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Tgl Mohon">
                <input type="date" className="form-input" value={header.tglMohon} onChange={e => setHeader(prev => ({ ...prev, tglMohon: e.target.value }))} />
              </Field>

              {header.pencairanVia === 'Bank' && (
                <Field label="Bank">
                  <SearchableSelect options={bankOptions} value={header.bankId} onChange={val => setHeader(prev => ({ ...prev, bankId: val }))} placeholder="Pilih rekening bank" />
                </Field>
              )}
              <Field label="Tgl Salur">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="datetime-local" className="form-input" disabled={!header.backDate} value={header.tglSalur} onChange={e => setHeader(prev => ({ ...prev, tglSalur: e.target.value }))} />
                  {!header.backDate && (
                    <a href="#" style={{ color: 'var(--danger-color)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      onClick={e => { e.preventDefault(); setHeader(prev => ({ ...prev, backDate: true })); }}>
                      Back Date
                    </a>
                  )}
                </div>
              </Field>

              <Field label="Campaign">
                <SearchableSelect options={CAMPAIGN_OPTIONS} value={header.campaignId} onChange={val => setHeader(prev => ({ ...prev, campaignId: val }))} />
              </Field>
              <Field label="User Insert">
                <input type="text" className="form-input" disabled value={CURRENT_USER.username} />
              </Field>
            </div>

            <h3 style={{ fontSize: '0.95rem', margin: '20px 0 14px', fontFamily: 'var(--font-heading)' }}>
              Detail Penyaluran {header.pencairanVia}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr 1fr 1fr 1.6fr auto', gap: '10px', alignItems: 'end' }}>
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
                <input type="number" min="0" className="form-input" placeholder="0" value={draftLine.nominal} onChange={e => setDraftLine(prev => ({ ...prev, nominal: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Total :</label>
                <input type="text" className="form-input" disabled value={fmt(totalDraft)} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>Keterangan :</label>
                <input type="text" className="form-input" value={draftLine.keterangan} onChange={e => setDraftLine(prev => ({ ...prev, keterangan: e.target.value }))} />
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
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Belum ada baris penyaluran</td></tr>
                  )}
                  {lines.map(l => (
                    <tr key={l.key}>
                      <td>{l.program}</td>
                      <td style={{ textAlign: 'center' }}>{l.qty}</td>
                      <td style={{ textAlign: 'right' }}>{fmt(l.nominal)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{fmt(l.qty * l.nominal)}</td>
                      <td>{l.keterangan || '-'}</td>
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
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid var(--border-color)', background: '#f8fafc' }}>
          <button type="button" className="btn btn-success" onClick={handleSave}><Check size={16} /> Save</button>
          <button type="button" className="btn btn-danger" onClick={handleReset}><RefreshCw size={16} /> Clear</button>
        </div>
      </div>

      {quickAddOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2>Tambah PM Cepat</h2>
              <button className="modal-close" onClick={() => setQuickAddOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group full-width">
                <label>Nama Lengkap</label>
                <input type="text" className="form-input" required value={quickAdd.nama} onChange={e => setQuickAdd(prev => ({ ...prev, nama: e.target.value }))} />
              </div>
              <div className="form-group full-width">
                <label>NIK</label>
                <input type="text" className="form-input" value={quickAdd.nik} onChange={e => setQuickAdd(prev => ({ ...prev, nik: e.target.value }))} />
              </div>
              <div className="form-group full-width">
                <label>Kategori</label>
                <select className="form-select" value={quickAdd.kategori} onChange={e => setQuickAdd(prev => ({ ...prev, kategori: e.target.value }))}>
                  <option value="individu">Individu</option>
                  <option value="lembaga">Lembaga</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setQuickAddOpen(false)}>Batal</button>
              <button type="button" className="btn btn-primary" onClick={handleQuickAddSave}>Simpan & Pilih</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntryPenyaluran;
