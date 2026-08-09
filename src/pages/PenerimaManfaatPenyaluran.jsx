import React, { useState, useEffect } from 'react';
import { Search, Plus, X, MapPin } from 'lucide-react';
import { getAccountingData, updateAccountingData } from '../utils/accountingStore';
import SearchableSelect from '../components/SearchableSelect';

const KONDISI_RUMAH_OPTIONS = [
  { value: 'layak_huni', label: 'Layak Huni' },
  { value: 'semi_permanen', label: 'Semi Permanen' },
  { value: 'tidak_layak', label: 'Tidak Layak Huni' }
];
const SUMBER_PENGHASILAN_OPTIONS = [
  { value: 'tetap', label: 'Tetap & Mencukupi' },
  { value: 'tidak_tetap', label: 'Tidak Tetap' },
  { value: 'tidak_ada', label: 'Tidak Ada Penghasilan' }
];
const KEPEMILIKAN_ASET_OPTIONS = [
  { value: 'ada', label: 'Ada Aset Signifikan (rumah/kendaraan milik sendiri)' },
  { value: 'tidak_ada', label: 'Tidak Ada Aset Signifikan' }
];
const DOKUMEN_CHECKLIST = [
  { key: 'ktp', label: 'KTP' },
  { key: 'kk', label: 'Kartu Keluarga' },
  { key: 'sktm', label: 'Surat Ket. Tidak Mampu (SKTM)' },
  { key: 'foto_rumah', label: 'Foto Kondisi Rumah' }
];
const KEPUTUSAN_OPTIONS = [
  { value: 'verified', label: 'Layak Dibantu', color: '#10b981', bg: '#d1fae5' },
  { value: 'rejected', label: 'Tidak Layak', color: '#ef4444', bg: '#fee2e2' },
  { value: 'survey_ulang', label: 'Perlu Survey Lanjutan', color: '#0ea5e9', bg: '#e0f2fe' }
];

const emptyForm = { nama_lengkap: '', nik: '', kategori: 'individu', status_ekonomi: 'miskin', kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '', lat: '', lng: '' };

const PenerimaManfaatPenyaluran = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState(() => getAccountingData());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);
  const [isVerifModalOpen, setIsVerifModalOpen] = useState(false);
  const [verifTarget, setVerifTarget] = useState(null);
  const [verifForm, setVerifForm] = useState({});

  const reloadData = () => setData(getAccountingData());
  useEffect(() => { reloadData(); }, []);

  const openAddModal = () => {
    setEditing(null);
    setFormFields(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditing(b);
    setFormFields({ ...emptyForm, ...b, lat: b.lat ?? '', lng: b.lng ?? '' });
    setIsModalOpen(true);
  };

  const handleSaveBeneficiary = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const payload = {
      nama_lengkap: formFields.nama_lengkap,
      nik: formFields.nik,
      kategori: formFields.kategori,
      status_ekonomi: formFields.status_ekonomi,
      kelurahan: formFields.kelurahan,
      kecamatan: formFields.kecamatan,
      kabupaten: formFields.kabupaten,
      provinsi: formFields.provinsi,
      lat: formFields.lat !== '' ? parseFloat(formFields.lat) : null,
      lng: formFields.lng !== '' ? parseFloat(formFields.lng) : null
    };

    if (editing) {
      const updated = store.beneficiaries.map(b => b.id === editing.id ? { ...b, ...payload } : b);
      updateAccountingData('laz_beneficiaries', updated);
    } else {
      const seq = store.beneficiaries.length + 1;
      const newB = {
        id: String(seq),
        kode_beneficiary: `BNF-2026-${String(seq).padStart(6, '0')}`,
        ...payload,
        status_verifikasi: 'unverified',
        campaign_id: null
      };
      updateAccountingData('laz_beneficiaries', [...store.beneficiaries, newB]);
    }
    setIsModalOpen(false);
    reloadData();
  };

  const openVerifModal = (b) => {
    const existing = b.penilaian_kelayakan || {};
    setVerifTarget(b);
    setVerifForm({
      kondisi_rumah: existing.kondisi_rumah || 'semi_permanen',
      sumber_penghasilan: existing.sumber_penghasilan || 'tidak_tetap',
      jumlah_tanggungan: existing.jumlah_tanggungan ?? '',
      kepemilikan_aset: existing.kepemilikan_aset || 'tidak_ada',
      dok_ktp: existing.dokumen_pendukung?.ktp || false,
      dok_kk: existing.dokumen_pendukung?.kk || false,
      dok_sktm: existing.dokumen_pendukung?.sktm || false,
      dok_foto_rumah: existing.dokumen_pendukung?.foto_rumah || false,
      catatan: b.catatan_verifikasi || '',
      verifikator: b.verifikator || '',
      keputusan: b.status_verifikasi && b.status_verifikasi !== 'unverified' ? b.status_verifikasi : 'verified'
    });
    setIsVerifModalOpen(true);
  };

  const handleSaveVerifikasi = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const updated = store.beneficiaries.map(b => b.id !== verifTarget.id ? b : {
      ...b,
      status_verifikasi: verifForm.keputusan,
      penilaian_kelayakan: {
        kondisi_rumah: verifForm.kondisi_rumah,
        sumber_penghasilan: verifForm.sumber_penghasilan,
        jumlah_tanggungan: parseInt(verifForm.jumlah_tanggungan) || 0,
        kepemilikan_aset: verifForm.kepemilikan_aset,
        dokumen_pendukung: {
          ktp: !!verifForm.dok_ktp,
          kk: !!verifForm.dok_kk,
          sktm: !!verifForm.dok_sktm,
          foto_rumah: !!verifForm.dok_foto_rumah
        }
      },
      catatan_verifikasi: verifForm.catatan || '',
      verifikator: verifForm.verifikator,
      tgl_verifikasi: new Date().toISOString().substring(0, 10)
    });
    updateAccountingData('laz_beneficiaries', updated);
    setIsVerifModalOpen(false);
    reloadData();
  };

  const weakIndicatorCount = [
    verifForm.kondisi_rumah === 'tidak_layak',
    verifForm.sumber_penghasilan === 'tidak_ada',
    verifForm.sumber_penghasilan === 'tidak_tetap',
    (parseInt(verifForm.jumlah_tanggungan) || 0) >= 4,
    verifForm.kepemilikan_aset === 'tidak_ada'
  ].filter(Boolean).length;

  const kelayakanHint = weakIndicatorCount >= 3
    ? { text: 'Indikasi: kondisi ekonomi lemah pada beberapa aspek — cenderung mendukung kelayakan menerima bantuan.', color: '#10b981', bg: '#d1fae5' }
    : weakIndicatorCount <= 1
    ? { text: 'Indikasi: kondisi ekonomi relatif mampu di sebagian besar aspek — pertimbangkan survey lanjutan sebelum menyetujui.', color: '#d97706', bg: '#fef3c7' }
    : { text: 'Indikasi: kondisi ekonomi beragam — perlu pertimbangan verifikator berdasarkan catatan lapangan.', color: '#0ea5e9', bg: '#e0f2fe' };

  const filtered = data.beneficiaries.filter(b => b.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Penerima Manfaat</h1>
          <p>Master data penerima manfaat, verifikasi kelayakan, dan titik lokasi untuk Peta Penyaluran</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={16} /> Tambah Penerima
        </button>
      </div>

      <div className="filters-row">
        <div className="filters-left"></div>
        <div className="filters-right">
          <div className="filter-input">
            <Search size={16} />
            <input type="text" placeholder="Cari nama..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Lengkap</th>
              <th>NIK</th>
              <th>Kategori</th>
              <th>Ekonomi</th>
              <th>Wilayah</th>
              <th>Titik Lokasi</th>
              <th>Status Verifikasi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b, idx) => (
              <tr key={idx}>
                <td style={{ fontFamily: 'monospace' }}>{b.kode_beneficiary}</td>
                <td style={{ fontWeight: 500, cursor: 'pointer' }} onClick={() => openEditModal(b)}>{b.nama_lengkap}</td>
                <td>{b.nik || '-'}</td>
                <td style={{ textTransform: 'capitalize' }}>{b.kategori}</td>
                <td style={{ textTransform: 'capitalize' }}>{b.status_ekonomi.replace('_', ' ')}</td>
                <td>{b.kelurahan}, {b.kecamatan}, {b.kabupaten}</td>
                <td>
                  {typeof b.lat === 'number' && typeof b.lng === 'number' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#0d9488' }}>
                      <MapPin size={12} /> {b.lat.toFixed(4)}, {b.lng.toFixed(4)}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Belum diisi</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${
                    b.status_verifikasi === 'verified' ? 'status-success' :
                    b.status_verifikasi === 'rejected' ? 'status-danger' :
                    b.status_verifikasi === 'survey_ulang' ? 'status-info' : 'status-warning'
                  }`}>
                    {b.status_verifikasi === 'verified' ? 'LAYAK DIBANTU' :
                     b.status_verifikasi === 'rejected' ? 'TIDAK LAYAK' :
                     b.status_verifikasi === 'survey_ulang' ? 'PERLU SURVEY' : 'BELUM DIVERIFIKASI'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', background: b.status_verifikasi === 'unverified' ? '#f3e8ff' : 'white', color: b.status_verifikasi === 'unverified' ? '#a855f7' : '#475569', border: b.status_verifikasi === 'unverified' ? 'none' : '1px solid #e2e8f0' }}
                    onClick={() => openVerifModal(b)}
                  >
                    {b.status_verifikasi === 'unverified' ? 'Verifikasi' : 'Detail / Ulangi'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: TAMBAH/UBAH PENERIMA MANFAAT */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Ubah Penerima Manfaat' : 'Tambah Penerima Manfaat'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveBeneficiary}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nama Lengkap</label>
                    <input type="text" required className="form-input" value={formFields.nama_lengkap} onChange={e => setFormFields({ ...formFields, nama_lengkap: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>NIK</label>
                    <input type="text" className="form-input" value={formFields.nik} onChange={e => setFormFields({ ...formFields, nik: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Kategori</label>
                    <SearchableSelect
                      options={[{ value: 'individu', label: 'Individu' }, { value: 'keluarga', label: 'Keluarga' }, { value: 'lembaga', label: 'Lembaga' }]}
                      value={formFields.kategori}
                      onChange={val => setFormFields({ ...formFields, kategori: val })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status Ekonomi</label>
                    <SearchableSelect
                      options={[{ value: 'sangat_miskin', label: 'Sangat Miskin' }, { value: 'miskin', label: 'Miskin' }, { value: 'lainnya', label: 'Lainnya' }]}
                      value={formFields.status_ekonomi}
                      onChange={val => setFormFields({ ...formFields, status_ekonomi: val })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Kecamatan</label>
                    <input type="text" className="form-input" value={formFields.kecamatan} onChange={e => setFormFields({ ...formFields, kecamatan: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Kelurahan</label>
                    <input type="text" className="form-input" value={formFields.kelurahan} onChange={e => setFormFields({ ...formFields, kelurahan: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Kabupaten/Kota</label>
                    <input type="text" className="form-input" value={formFields.kabupaten} onChange={e => setFormFields({ ...formFields, kabupaten: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Provinsi</label>
                    <input type="text" className="form-input" value={formFields.provinsi} onChange={e => setFormFields({ ...formFields, provinsi: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Latitude (titik lokasi)</label>
                    <input type="number" step="any" placeholder="cth. -6.5971" className="form-input" value={formFields.lat} onChange={e => setFormFields({ ...formFields, lat: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Longitude (titik lokasi)</label>
                    <input type="number" step="any" placeholder="cth. 106.8060" className="form-input" value={formFields.lng} onChange={e => setFormFields({ ...formFields, lng: e.target.value })} />
                  </div>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                  Titik lokasi opsional, dipakai untuk menampilkan penerima di Peta Penyaluran. Bisa didapat dari klik-kanan lokasi di Google Maps &rarr; salin koordinat.
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VERIFIKASI KELAYAKAN */}
      {isVerifModalOpen && verifTarget && (
        <div className="modal-backdrop" onClick={() => setIsVerifModalOpen(false)}>
          <div className="modal-content" style={{ width: '620px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Verifikasi Kelayakan Penerima Manfaat</h2>
              <button className="modal-close" onClick={() => setIsVerifModalOpen(false)}><X size={20} /></button>
            </div>
            <div style={{ padding: '0 24px' }}>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '14px' }}>Penilaian kelayakan menerima bantuan berdasarkan kondisi ekonomi dan dokumen pendukung.</p>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.85rem' }}>
                <div><strong>{verifTarget.nama_lengkap}</strong> <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>({verifTarget.kode_beneficiary})</span></div>
                <div style={{ textAlign: 'right', color: '#64748b' }}>NIK: {verifTarget.nik || '-'}</div>
                <div style={{ color: '#64748b', gridColumn: 'span 2' }}>{[verifTarget.kelurahan, verifTarget.kecamatan, verifTarget.kabupaten, verifTarget.provinsi].filter(Boolean).join(', ') || 'Alamat belum diisi'}</div>
              </div>
            </div>

            <form onSubmit={handleSaveVerifikasi}>
              <div className="modal-body" style={{ paddingTop: 0 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#334155' }}>Kriteria Penilaian Ekonomi</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Kondisi Tempat Tinggal</label>
                    <SearchableSelect options={KONDISI_RUMAH_OPTIONS} value={verifForm.kondisi_rumah || ''} onChange={val => setVerifForm({ ...verifForm, kondisi_rumah: val })} />
                  </div>
                  <div className="form-group">
                    <label>Sumber Penghasilan</label>
                    <SearchableSelect options={SUMBER_PENGHASILAN_OPTIONS} value={verifForm.sumber_penghasilan || ''} onChange={val => setVerifForm({ ...verifForm, sumber_penghasilan: val })} />
                  </div>
                  <div className="form-group">
                    <label>Jumlah Tanggungan Keluarga</label>
                    <input type="number" min="0" className="form-input" value={verifForm.jumlah_tanggungan} onChange={e => setVerifForm({ ...verifForm, jumlah_tanggungan: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Kepemilikan Aset</label>
                    <SearchableSelect options={KEPEMILIKAN_ASET_OPTIONS} value={verifForm.kepemilikan_aset || ''} onChange={val => setVerifForm({ ...verifForm, kepemilikan_aset: val })} />
                  </div>
                </div>

                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '16px 0 10px', color: '#334155' }}>Dokumen Pendukung</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {DOKUMEN_CHECKLIST.map(d => (
                    <label key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                      <input type="checkbox" checked={!!verifForm[`dok_${d.key}`]} onChange={e => setVerifForm({ ...verifForm, [`dok_${d.key}`]: e.target.checked })} />
                      {d.label}
                    </label>
                  ))}
                </div>

                <div style={{ background: kelayakanHint.bg, borderRadius: '8px', padding: '10px 14px', margin: '14px 0', fontSize: '0.8rem', color: kelayakanHint.color, fontWeight: 500 }}>
                  {kelayakanHint.text}
                </div>

                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#334155' }}>Keputusan Verifikator</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {KEPUTUSAN_OPTIONS.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setVerifForm({ ...verifForm, keputusan: opt.value })}
                      style={{
                        padding: '12px 8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.8rem',
                        border: verifForm.keputusan === opt.value ? `2px solid ${opt.color}` : '1px solid #e2e8f0',
                        background: verifForm.keputusan === opt.value ? opt.bg : 'white',
                        fontWeight: verifForm.keputusan === opt.value ? 700 : 500,
                        color: verifForm.keputusan === opt.value ? opt.color : '#475569'
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Catatan Verifikasi</label>
                    <textarea required rows={3} className="form-textarea" placeholder="Ringkasan hasil survey/wawancara yang mendasari keputusan..."
                      value={verifForm.catatan || ''} onChange={e => setVerifForm({ ...verifForm, catatan: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label>Nama Verifikator</label>
                    <input type="text" required className="form-input" placeholder="Nama petugas yang melakukan verifikasi"
                      value={verifForm.verifikator || ''} onChange={e => setVerifForm({ ...verifForm, verifikator: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsVerifModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan Hasil Verifikasi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PenerimaManfaatPenyaluran;
