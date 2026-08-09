import React, { useState, useEffect } from 'react';
import { X, Image, Plus, ClipboardCheck } from 'lucide-react';
import { getAccountingData, updateAccountingData, formatRupiah } from '../utils/accountingStore';

const LPJ_STATUS_LABEL = {
  belum_dibuat: 'BELUM DIBUAT',
  draft: 'DRAFT',
  diajukan: 'MENUNGGU REVIEW',
  disetujui: 'DISETUJUI',
  ditolak: 'PERLU REVISI'
};

const LPJ_STATUS_CLASS = {
  belum_dibuat: 'status-warning',
  draft: 'status-warning',
  diajukan: 'status-info',
  disetujui: 'status-success',
  ditolak: 'status-danger'
};

const KEPUTUSAN_OPTIONS = [
  { value: 'disetujui', label: 'Disetujui', color: '#10b981', bg: '#d1fae5' },
  { value: 'ditolak', label: 'Perlu Revisi', color: '#ef4444', bg: '#fee2e2' }
];

const emptyLpjForm = { judul: '', narasi_kegiatan: '', tanggal_kegiatan: '', jumlah_realisasi: '', disusun_oleh: '' };

const PertanggungjawabanPenyaluran = () => {
  const [data, setData] = useState(() => getAccountingData());
  const [activeRequest, setActiveRequest] = useState(null);
  const [lpjForm, setLpjForm] = useState(emptyLpjForm);
  const [reviewForm, setReviewForm] = useState({ keputusan: 'disetujui', catatan_reviewer: '', direview_oleh: '' });
  const [buktiForm, setBuktiForm] = useState({ keterangan: '', filename: '' });

  const reloadData = () => setData(getAccountingData());
  useEffect(() => { reloadData(); }, []);

  const disbursedRequests = data.disbursementRequests.filter(r => r.status === 'disbursed');

  const findLpj = (requestId) => data.laporanPertanggungjawaban.find(l => l.disbursement_id === requestId);
  const findTransaksi = (req) => data.pengeluaran.find(p => p.id === req.fins_trans_id);
  const findBukti = (requestId) => data.buktiRealisasi.filter(b => b.disbursement_id === requestId);

  const openLpjModal = (req) => {
    const existing = findLpj(req.id);
    setActiveRequest(req);
    setLpjForm(existing ? {
      judul: existing.judul,
      narasi_kegiatan: existing.narasi_kegiatan,
      tanggal_kegiatan: existing.tanggal_kegiatan || '',
      jumlah_realisasi: existing.jumlah_realisasi,
      disusun_oleh: existing.disusun_oleh
    } : {
      ...emptyLpjForm,
      judul: `LPJ - ${req.judul}`,
      jumlah_realisasi: req.jumlah_disetujui || req.jumlah_diajukan
    });
    setReviewForm({ keputusan: 'disetujui', catatan_reviewer: '', direview_oleh: '' });
    setBuktiForm({ keterangan: '', filename: '' });
  };

  const closeModal = () => setActiveRequest(null);

  const saveLpj = (status) => {
    const store = getAccountingData();
    const existing = store.laporanPertanggungjawaban.find(l => l.disbursement_id === activeRequest.id);
    const payload = {
      judul: lpjForm.judul,
      narasi_kegiatan: lpjForm.narasi_kegiatan,
      tanggal_kegiatan: lpjForm.tanggal_kegiatan,
      jumlah_realisasi: parseFloat(lpjForm.jumlah_realisasi) || 0,
      disusun_oleh: lpjForm.disusun_oleh,
      status
    };

    let updated;
    if (existing) {
      updated = store.laporanPertanggungjawaban.map(l => l.id === existing.id ? { ...l, ...payload } : l);
    } else {
      const newLpj = {
        id: String(store.laporanPertanggungjawaban.length + 1),
        nomor_lpj: `LPJ-2026-${String(store.laporanPertanggungjawaban.length + 1).padStart(6, '0')}`,
        disbursement_id: activeRequest.id,
        ...payload
      };
      updated = [newLpj, ...store.laporanPertanggungjawaban];
    }
    updateAccountingData('laz_lpj_penyaluran', updated);
    reloadData();
    closeModal();
  };

  const saveReview = () => {
    const store = getAccountingData();
    const existing = store.laporanPertanggungjawaban.find(l => l.disbursement_id === activeRequest.id);
    if (!existing) return;
    const updated = store.laporanPertanggungjawaban.map(l => l.id === existing.id ? {
      ...l,
      status: reviewForm.keputusan,
      catatan_reviewer: reviewForm.catatan_reviewer,
      direview_oleh: reviewForm.direview_oleh,
      tgl_review: new Date().toISOString().substring(0, 10)
    } : l);
    updateAccountingData('laz_lpj_penyaluran', updated);
    reloadData();
    closeModal();
  };

  const addBukti = (e) => {
    e.preventDefault();
    const store = getAccountingData();
    const newBukti = {
      id: String(store.buktiRealisasi.length + 1),
      disbursement_id: activeRequest.id,
      keterangan: buktiForm.keterangan,
      filename: buktiForm.filename,
      uploaded_at: new Date().toISOString()
    };
    updateAccountingData('laz_bukti_realisasi', [newBukti, ...store.buktiRealisasi]);
    setBuktiForm({ keterangan: '', filename: '' });
    reloadData();
  };

  const activeLpj = activeRequest ? findLpj(activeRequest.id) : null;
  const activeTransaksi = activeRequest ? findTransaksi(activeRequest) : null;
  const activeBukti = activeRequest ? findBukti(activeRequest.id) : [];
  const lpjStatus = activeLpj?.status || 'draft';
  const canEditNarasi = !activeLpj || lpjStatus === 'draft' || lpjStatus === 'ditolak';
  const canReview = activeLpj && lpjStatus === 'diajukan';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Pertanggungjawaban Penyaluran</h1>
          <p>LPJ per penyaluran yang sudah dicairkan: narasi realisasi, bukti dokumen, dan status review terhubung ke transaksi Keuangan</p>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No Pengajuan</th>
              <th>Judul Program</th>
              <th>Tanggal Cair</th>
              <th style={{ textAlign: 'right' }}>Jumlah Dicairkan</th>
              <th>Transaksi Keuangan</th>
              <th>Status LPJ</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {disbursedRequests.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Belum ada penyaluran yang dicairkan</td></tr>
            )}
            {disbursedRequests.map((r, idx) => {
              const lpj = findLpj(r.id);
              const status = lpj?.status || 'belum_dibuat';
              const trans = findTransaksi(r);
              return (
                <tr key={idx}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{r.nomor_pengajuan}</td>
                  <td style={{ fontWeight: 500 }}>{r.judul}</td>
                  <td>{r.tgl_realisasi ? new Date(r.tgl_realisasi).toLocaleDateString('id-ID') : '-'}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(r.jumlah_disetujui || r.jumlah_diajukan)}</td>
                  <td style={{ fontSize: '0.75rem' }}>
                    {trans ? <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>{trans.id_trans}</span> : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${LPJ_STATUS_CLASS[status]}`}>{LPJ_STATUS_LABEL[status]}</span>
                  </td>
                  <td>
                    <button className="btn" style={{ padding: '6px 10px', fontSize: '0.75rem' }} onClick={() => openLpjModal(r)}>
                      <ClipboardCheck size={14} /> {status === 'belum_dibuat' ? 'Buat LPJ' : 'Kelola LPJ'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {activeRequest && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" style={{ width: '640px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pertanggungjawaban — {activeRequest.judul}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>

            <div style={{ padding: '0 24px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px 16px', marginBottom: '18px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span><strong>{activeRequest.nomor_pengajuan}</strong></span>
                  <span style={{ fontWeight: 600 }}>{formatRupiah(activeRequest.jumlah_disetujui || activeRequest.jumlah_diajukan)}</span>
                </div>
                {activeTransaksi ? (
                  <div style={{ color: '#64748b' }}>
                    Transaksi Keuangan: <span style={{ fontFamily: 'monospace' }}>{activeTransaksi.id_trans}</span> &middot; COA {activeTransaksi.coa} &middot; {new Date(activeTransaksi.tgl).toLocaleDateString('id-ID')}
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8' }}>Transaksi Keuangan tertaut tidak ditemukan</div>
                )}
              </div>

              {canEditNarasi ? (
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Judul Laporan</label>
                    <input type="text" className="form-input" value={lpjForm.judul} onChange={e => setLpjForm({ ...lpjForm, judul: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Kegiatan</label>
                    <input type="date" className="form-input" value={lpjForm.tanggal_kegiatan} onChange={e => setLpjForm({ ...lpjForm, tanggal_kegiatan: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Jumlah Realisasi (Rp)</label>
                    <input type="number" className="form-input" value={lpjForm.jumlah_realisasi} onChange={e => setLpjForm({ ...lpjForm, jumlah_realisasi: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label>Narasi Realisasi Kegiatan</label>
                    <textarea rows={4} className="form-textarea" placeholder="Ceritakan pelaksanaan penyaluran: siapa yang menerima, kapan, di mana, dan hasilnya..."
                      value={lpjForm.narasi_kegiatan} onChange={e => setLpjForm({ ...lpjForm, narasi_kegiatan: e.target.value })} />
                  </div>
                  <div className="form-group full-width">
                    <label>Disusun Oleh</label>
                    <input type="text" className="form-input" placeholder="Nama staf penyusun LPJ" value={lpjForm.disusun_oleh} onChange={e => setLpjForm({ ...lpjForm, disusun_oleh: e.target.value })} />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>{activeLpj.judul}</h3>
                  <p style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap' }}>{activeLpj.narasi_kegiatan}</p>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                    Realisasi {formatRupiah(activeLpj.jumlah_realisasi)} &middot; Disusun oleh {activeLpj.disusun_oleh} &middot; {activeLpj.tanggal_kegiatan}
                  </div>
                  {activeLpj.catatan_reviewer && (
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', padding: '10px 12px', borderRadius: '8px', background: lpjStatus === 'disetujui' ? '#d1fae5' : '#fee2e2', color: lpjStatus === 'disetujui' ? '#10b981' : '#ef4444' }}>
                      Catatan reviewer ({activeLpj.direview_oleh}): {activeLpj.catatan_reviewer}
                    </div>
                  )}
                </div>
              )}

              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: '16px 0 10px', color: '#334155' }}>Bukti Dokumen / Foto Realisasi</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                {activeBukti.map((b, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '80px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image size={24} color="#94a3b8" />
                    </div>
                    <div style={{ padding: '8px', fontSize: '0.7rem', color: '#64748b' }}>{b.keterangan}</div>
                  </div>
                ))}
              </div>
              {canEditNarasi && (
                <form onSubmit={addBukti} style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
                  <input type="text" required placeholder="Keterangan bukti" className="form-input" value={buktiForm.keterangan} onChange={e => setBuktiForm({ ...buktiForm, keterangan: e.target.value })} />
                  <input type="text" required placeholder="nama-file.jpg (simulasi upload)" className="form-input" value={buktiForm.filename} onChange={e => setBuktiForm({ ...buktiForm, filename: e.target.value })} />
                  <button type="submit" className="btn" style={{ whiteSpace: 'nowrap' }}><Plus size={14} /> Tambah</button>
                </form>
              )}

              {canReview && (
                <>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: '#334155' }}>Review LPJ</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    {KEPUTUSAN_OPTIONS.map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => setReviewForm({ ...reviewForm, keputusan: opt.value })}
                        style={{
                          padding: '12px 8px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', fontSize: '0.8rem',
                          border: reviewForm.keputusan === opt.value ? `2px solid ${opt.color}` : '1px solid #e2e8f0',
                          background: reviewForm.keputusan === opt.value ? opt.bg : 'white',
                          fontWeight: reviewForm.keputusan === opt.value ? 700 : 500,
                          color: reviewForm.keputusan === opt.value ? opt.color : '#475569'
                        }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                  <div className="form-grid" style={{ marginBottom: '10px' }}>
                    <div className="form-group full-width">
                      <label>Catatan Reviewer</label>
                      <textarea rows={2} className="form-textarea" value={reviewForm.catatan_reviewer} onChange={e => setReviewForm({ ...reviewForm, catatan_reviewer: e.target.value })} />
                    </div>
                    <div className="form-group full-width">
                      <label>Nama Reviewer</label>
                      <input type="text" required className="form-input" value={reviewForm.direview_oleh} onChange={e => setReviewForm({ ...reviewForm, direview_oleh: e.target.value })} />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn" onClick={closeModal}>Tutup</button>
              {canEditNarasi && (
                <>
                  <button type="button" className="btn" onClick={() => saveLpj('draft')}>Simpan Draft</button>
                  <button type="button" className="btn btn-primary" disabled={!lpjForm.narasi_kegiatan} onClick={() => saveLpj('diajukan')}>Ajukan LPJ</button>
                </>
              )}
              {canReview && (
                <button type="button" className="btn btn-primary" disabled={!reviewForm.direview_oleh} onClick={saveReview}>Simpan Hasil Review</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PertanggungjawabanPenyaluran;
