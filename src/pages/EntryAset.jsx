import React, { useMemo, useState } from 'react';
import { RefreshCw, Maximize2, Minimize2, Check, X } from 'lucide-react';
import {
  INITIAL_COA, OFFICES, ASSET_DEPRECIATION_METHODS,
  getFixedAssets, saveFixedAssets
} from '../utils/finsCoaStore';
import SearchableSelect from '../components/SearchableSelect';

const emptyForm = {
  namaAset: '',
  akunAsetTetap: '',
  deskripsi: '',
  tanggalPerolehan: new Date().toISOString().substring(0, 10),
  biayaPerolehan: '',
  officeId: '',
  nonDepresiasi: false,
  metode: '',
  masaManfaatBulan: '',
  tglAkhirSusut: '',
  nilaiPerBulanPersen: '',
  akunPenyusutan: '',
  akunAkumulasiPenyusutan: '',
  bulanAwalSusut: ''
};

const FieldRow = ({ label, children, align = 'center' }) => (
  <div style={{ display: 'flex', alignItems: align === 'top' ? 'flex-start' : 'center', gap: '12px' }}>
    <label style={{ width: '160px', flexShrink: 0, fontWeight: 600, fontSize: '0.9rem', color: '#334155', paddingTop: align === 'top' ? '8px' : 0 }}>
      {label} :
    </label>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

const EntryAset = () => {
  const [formFields, setFormFields] = useState(emptyForm);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const assetCoaOptions = useMemo(() => INITIAL_COA
    .filter(c => c.coa.startsWith('102.') && c.includeBuku && !c.nama.toLowerCase().includes('akumulasi'))
    .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);

  const bebanCoaOptions = useMemo(() => INITIAL_COA
    .filter(c => c.group === 'Beban' && c.includeBuku)
    .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);

  const akumulasiCoaOptions = useMemo(() => INITIAL_COA
    .filter(c => c.includeBuku && c.nama.toLowerCase().includes('akumulasi'))
    .map(c => ({ value: c.coa, label: `${c.coa} — ${c.nama}` })), []);

  const officeOptions = OFFICES.map(o => ({ value: o.id, label: o.nama }));

  const setField = (key, value) => setFormFields(prev => ({ ...prev, [key]: value }));

  const handleReset = () => setFormFields(emptyForm);

  const handleRefresh = () => {
    setIsRefreshing(true);
    handleReset();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const canSave = formFields.namaAset.trim() !== ''
    && formFields.akunAsetTetap !== ''
    && formFields.biayaPerolehan !== ''
    && formFields.officeId !== ''
    && (formFields.nonDepresiasi || (formFields.metode !== '' && formFields.masaManfaatBulan !== ''));

  const handleSave = (e) => {
    e.preventDefault();
    if (!canSave) return;

    const existing = getFixedAssets();
    const newAsset = {
      id: String(existing.length + 1),
      namaAset: formFields.namaAset,
      akunAsetTetap: formFields.akunAsetTetap,
      deskripsi: formFields.deskripsi,
      tanggalPerolehan: formFields.tanggalPerolehan,
      biayaPerolehan: parseFloat(formFields.biayaPerolehan) || 0,
      officeId: formFields.officeId,
      nonDepresiasi: formFields.nonDepresiasi,
      metode: formFields.nonDepresiasi ? '' : formFields.metode,
      masaManfaatBulan: formFields.nonDepresiasi ? null : (parseInt(formFields.masaManfaatBulan, 10) || null),
      tglAkhirSusut: formFields.nonDepresiasi ? null : (formFields.tglAkhirSusut || null),
      nilaiPerBulanPersen: formFields.nonDepresiasi ? null : (parseFloat(formFields.nilaiPerBulanPersen) || null),
      akunPenyusutan: formFields.nonDepresiasi ? null : (formFields.akunPenyusutan || null),
      akunAkumulasiPenyusutan: formFields.nonDepresiasi ? null : (formFields.akunAkumulasiPenyusutan || null),
      bulanAwalSusut: formFields.nonDepresiasi ? null : (formFields.bulanAwalSusut || null)
    };

    saveFixedAssets([...existing, newAsset]);
    alert(`Aset "${newAsset.namaAset}" berhasil disimpan${newAsset.nonDepresiasi ? ' (non-depresiasi).' : ' dan akan masuk jadwal penyusutan bulanan.'}`);
    handleReset();
  };

  return (
    <div className={isFullscreen ? 'content-area content-area-fullscreen' : 'content-area'}>
      <div className="page-header">
        <div className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ marginBottom: 0 }}>Entry Aset</h1>
          <button
            onClick={handleRefresh}
            title="Reset form"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}
          >
            <RefreshCw size={20} className={isRefreshing ? 'icon-spin' : ''} />
          </button>
        </div>
        <button
          onClick={() => setIsFullscreen(f => !f)}
          title={isFullscreen ? 'Keluar layar penuh' : 'Perbesar layar penuh'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div className="data-table-container" style={{ padding: '24px 28px' }}>
          <h3 style={{ fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>Detail Aset</h3>
          <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 48px' }}>
            <FieldRow label="Nama Aset">
              <input
                type="text" className="form-input" placeholder="Nama Aset"
                value={formFields.namaAset} onChange={e => setField('namaAset', e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Tanggal Perolehan">
              <input
                type="date" className="form-input"
                value={formFields.tanggalPerolehan} onChange={e => setField('tanggalPerolehan', e.target.value)}
              />
            </FieldRow>

            <FieldRow label="Akun Aset Tetap">
              <SearchableSelect
                className="form-select" placeholder="COA"
                options={assetCoaOptions} value={formFields.akunAsetTetap}
                onChange={val => setField('akunAsetTetap', val)}
              />
            </FieldRow>
            <FieldRow label="Biaya Perolehan">
              <input
                type="number" min="0" className="form-input" placeholder="Biaya Akuisisi"
                value={formFields.biayaPerolehan} onChange={e => setField('biayaPerolehan', e.target.value)}
              />
            </FieldRow>

            <FieldRow label="Deskripsi" align="top">
              <textarea
                className="form-textarea" placeholder="Masukkan Deskripsi" rows={3}
                value={formFields.deskripsi} onChange={e => setField('deskripsi', e.target.value)}
              />
            </FieldRow>
            <FieldRow label="Kantor">
              <SearchableSelect
                className="form-select" placeholder="Kantor"
                options={officeOptions} value={formFields.officeId}
                onChange={val => setField('officeId', val)}
              />
            </FieldRow>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '28px 0 8px' }}>
            <h3 style={{ fontWeight: 700, color: '#64748b' }}>Penyusutan</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formFields.nonDepresiasi}
                onChange={e => setField('nonDepresiasi', e.target.checked)}
              />
              Aset non-depresiasi
            </label>
          </div>
          <div style={{ borderBottom: '1px solid var(--border-color)', marginBottom: '20px' }} />

          {formFields.nonDepresiasi ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Aset ini ditandai non-depresiasi — tidak akan masuk jadwal penyusutan bulanan.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 48px' }}>
              <FieldRow label="Metode">
                <SearchableSelect
                  className="form-select" placeholder="metode"
                  options={ASSET_DEPRECIATION_METHODS.map(m => ({ value: m, label: m }))}
                  value={formFields.metode} onChange={val => setField('metode', val)}
                />
              </FieldRow>
              <FieldRow label="Akun Penyusutan">
                <SearchableSelect
                  className="form-select" placeholder="Adjusment Debit"
                  options={bebanCoaOptions} value={formFields.akunPenyusutan}
                  onChange={val => setField('akunPenyusutan', val)}
                />
              </FieldRow>

              <FieldRow label="Masa Manfaat">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number" min="0" className="form-input" placeholder="Masa"
                    value={formFields.masaManfaatBulan} onChange={e => setField('masaManfaatBulan', e.target.value)}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Bulan</span>
                </div>
              </FieldRow>
              <FieldRow label="Akun Akumulasi Penyusutan">
                <SearchableSelect
                  className="form-select" placeholder="Adjusment Kredit"
                  options={akumulasiCoaOptions} value={formFields.akunAkumulasiPenyusutan}
                  onChange={val => setField('akunAkumulasiPenyusutan', val)}
                />
              </FieldRow>

              <FieldRow label="Tgl Akhir Susut">
                <input
                  type="date" className="form-input"
                  value={formFields.tglAkhirSusut} onChange={e => setField('tglAkhirSusut', e.target.value)}
                />
              </FieldRow>
              <FieldRow label="Bulan Awal Susut">
                <input
                  type="date" className="form-input"
                  value={formFields.bulanAwalSusut} onChange={e => setField('bulanAwalSusut', e.target.value)}
                />
              </FieldRow>

              <FieldRow label="Nilai/Bulan">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number" min="0" step="0.01" className="form-input" placeholder="0,00"
                    value={formFields.nilaiPerBulanPersen} onChange={e => setField('nilaiPerBulanPersen', e.target.value)}
                  />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Persen</span>
                </div>
              </FieldRow>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button type="submit" className="btn" disabled={!canSave} style={{ background: '#16a34a', color: 'white', opacity: canSave ? 1 : 0.5 }}>
            <Check size={16} /> Save
          </button>
          <button type="button" className="btn" style={{ background: '#dc2626', color: 'white' }} onClick={handleReset}>
            <X size={16} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryAset;
