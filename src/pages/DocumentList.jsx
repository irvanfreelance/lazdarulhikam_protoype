import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Edit2, Trash2, Eye, Download, X, FolderOpen,
  AlertTriangle, Clock, CheckCircle2, FileText, Upload, File
} from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const KATEGORI = ['Legalitas Lembaga', 'Perizinan', 'Keuangan & Pajak', 'Aset & Properti', 'SDM & Kepegawaian', 'Program & Kerjasama'];

const INITIAL_DOCS = [
  { id: '1', nama: 'Akta Pendirian Yayasan Darul Hikam', kategori: 'Legalitas Lembaga', nomor: 'No. 12/2015', instansi: 'Notaris Hj. Siti Amanah Fauziah, S.H., M.Kn.', tglTerbit: '2015-03-10', berlakuSelamanya: true, tglBerlaku: null, fileName: 'akta-pendirian-yayasan.pdf', fileSize: '1.8 MB', diunggahOleh: 'Sekretariat Yayasan', catatan: 'Dokumen legalitas dasar pendirian yayasan.' },
  { id: '2', nama: 'SK Menkumham Pengesahan Badan Hukum', kategori: 'Legalitas Lembaga', nomor: 'AHU-0004521.AH.01.04.Tahun 2015', instansi: 'Kemenkumham RI', tglTerbit: '2015-03-25', berlakuSelamanya: true, tglBerlaku: null, fileName: 'sk-menkumham-2015.pdf', fileSize: '640 KB', diunggahOleh: 'Sekretariat Yayasan', catatan: '' },
  { id: '3', nama: 'SK Izin Operasional LAZ', kategori: 'Perizinan', nomor: 'Kep. 568 Tahun 2022', instansi: 'Kementerian Agama RI', tglTerbit: '2022-06-01', berlakuSelamanya: false, tglBerlaku: '2027-06-01', fileName: 'sk-izin-operasional-laz.pdf', fileSize: '2.1 MB', diunggahOleh: 'Sekretariat Yayasan', catatan: 'Wajib diperpanjang H-3 bulan sebelum berakhir.' },
  { id: '4', nama: 'NPWP Yayasan', kategori: 'Keuangan & Pajak', nomor: '02.345.678.9-012.000', instansi: 'Direktorat Jenderal Pajak', tglTerbit: '2015-04-01', berlakuSelamanya: true, tglBerlaku: null, fileName: 'npwp-yayasan.pdf', fileSize: '320 KB', diunggahOleh: 'Bag. Keuangan', catatan: '' },
  { id: '5', nama: 'Surat Keterangan Terdaftar (SKT) Pajak', kategori: 'Keuangan & Pajak', nomor: 'PEM-00123/WPJ.09/KP.0503/2015', instansi: 'KPP Pratama Bandung Cibeunying', tglTerbit: '2015-04-05', berlakuSelamanya: true, tglBerlaku: null, fileName: 'skt-pajak.pdf', fileSize: '410 KB', diunggahOleh: 'Bag. Keuangan', catatan: '' },
  { id: '6', nama: 'Surat Keterangan Domisili Lembaga (SKDL)', kategori: 'Perizinan', nomor: '470/112-Kel.Cihaurgeulis/2024', instansi: 'Kelurahan Cihaurgeulis', tglTerbit: '2024-09-01', berlakuSelamanya: false, tglBerlaku: '2026-09-01', fileName: 'skdl-2024.pdf', fileSize: '512 KB', diunggahOleh: 'Sekretariat Yayasan', catatan: 'Perpanjangan diajukan ke kelurahan.' },
  { id: '7', nama: 'Sertifikat Akreditasi LAZ Nasional', kategori: 'Perizinan', nomor: '045/BA-BAZNAS/XI/2023', instansi: 'BAZNAS RI', tglTerbit: '2023-11-20', berlakuSelamanya: false, tglBerlaku: '2026-11-20', fileName: 'sertifikat-akreditasi-baznas.pdf', fileSize: '980 KB', diunggahOleh: 'Sekretariat Yayasan', catatan: '' },
  { id: '8', nama: 'Sertifikat Hak Milik Tanah Kantor & Aula (SHM No. 0089)', kategori: 'Aset & Properti', nomor: 'SHM No. 0089', instansi: 'BPN Kota Bandung', tglTerbit: '2018-02-14', berlakuSelamanya: true, tglBerlaku: null, fileName: 'shm-0089-kantor.pdf', fileSize: '2.6 MB', diunggahOleh: 'Bag. Umum', catatan: '' },
  { id: '9', nama: 'Izin Mendirikan Bangunan (IMB) Kantor', kategori: 'Aset & Properti', nomor: '503/456-IMB/2019', instansi: 'DPMPTSP Kota Bandung', tglTerbit: '2019-05-20', berlakuSelamanya: true, tglBerlaku: null, fileName: 'imb-kantor.pdf', fileSize: '1.1 MB', diunggahOleh: 'Bag. Umum', catatan: '' },
  { id: '10', nama: 'Perjanjian Kerjasama Program Beasiswa - Astra Foundation', kategori: 'Program & Kerjasama', nomor: 'MOU/017/AST-DH/2024', instansi: 'Yayasan Astra Foundation', tglTerbit: '2024-01-10', berlakuSelamanya: false, tglBerlaku: '2026-08-31', fileName: 'mou-astra-foundation.pdf', fileSize: '760 KB', diunggahOleh: 'Bag. Program', catatan: 'Koordinasi perpanjangan dengan tim kemitraan.' },
  { id: '11', nama: 'Sertifikat Kepesertaan BPJS Ketenagakerjaan', kategori: 'SDM & Kepegawaian', nomor: '12JT0045678', instansi: 'BPJS Ketenagakerjaan', tglTerbit: '2020-01-01', berlakuSelamanya: true, tglBerlaku: null, fileName: 'sertifikat-bpjs-tk.pdf', fileSize: '290 KB', diunggahOleh: 'Bag. SDM', catatan: '' },
  { id: '12', nama: 'Surat Izin Penyelenggaraan Undian Gratis Berhadiah (Qurban)', kategori: 'Perizinan', nomor: '476/PUB/Kemensos/2025', instansi: 'Kementerian Sosial RI', tglTerbit: '2025-06-01', berlakuSelamanya: false, tglBerlaku: '2026-06-01', fileName: 'izin-pub-qurban-2025.pdf', fileSize: '540 KB', diunggahOleh: 'Bag. Program', catatan: 'Perlu pengajuan ulang untuk periode Qurban berikutnya.' },
];

const PAGE_SIZES = [10, 25, 50];

const emptyForm = { nama: '', kategori: KATEGORI[0], nomor: '', instansi: '', tglTerbit: '', berlakuSelamanya: false, tglBerlaku: '', catatan: '', fileName: '', fileSize: '' };

const formatTanggal = (iso) => {
  if (!iso) return '-';
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getDocStatus = (doc) => {
  if (doc.berlakuSelamanya || !doc.tglBerlaku) return 'aktif';
  const diffDays = Math.ceil((new Date(doc.tglBerlaku + 'T00:00:00') - new Date()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'kadaluarsa';
  if (diffDays <= 60) return 'akan_kadaluarsa';
  return 'aktif';
};

const STATUS_META = {
  aktif: { label: 'AKTIF', cls: 'status-success' },
  akan_kadaluarsa: { label: 'AKAN KADALUARSA', cls: 'status-warning' },
  kadaluarsa: { label: 'KADALUARSA', cls: 'status-danger' },
};

const DocumentList = () => {
  const [rows, setRows] = useState(INITIAL_DOCS);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [filterKategori, setFilterKategori] = useState('Semua Kategori');
  const [filterStatus, setFilterStatus] = useState('Semua Status');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formFields, setFormFields] = useState(emptyForm);
  const [viewing, setViewing] = useState(null);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    return rows.filter(r => {
      const matchKeyword = !k || r.nama.toLowerCase().includes(k) || r.nomor.toLowerCase().includes(k) || r.instansi.toLowerCase().includes(k);
      const matchKategori = filterKategori === 'Semua Kategori' || r.kategori === filterKategori;
      const matchStatus = filterStatus === 'Semua Status' || getDocStatus(r) === filterStatus;
      return matchKeyword && matchKategori && matchStatus;
    });
  }, [rows, keyword, filterKategori, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const aktif = rows.filter(r => getDocStatus(r) === 'aktif').length;
    const akan = rows.filter(r => getDocStatus(r) === 'akan_kadaluarsa').length;
    const kadaluarsa = rows.filter(r => getDocStatus(r) === 'kadaluarsa').length;
    return { total: rows.length, aktif, akan, kadaluarsa };
  }, [rows]);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const openAdd = () => { setEditing(null); setFormFields(emptyForm); setModalOpen(true); };

  const openEdit = (doc) => {
    setEditing(doc);
    setFormFields({
      nama: doc.nama, kategori: doc.kategori, nomor: doc.nomor, instansi: doc.instansi,
      tglTerbit: doc.tglTerbit, berlakuSelamanya: doc.berlakuSelamanya, tglBerlaku: doc.tglBerlaku || '',
      catatan: doc.catatan || '', fileName: doc.fileName, fileSize: doc.fileSize,
    });
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Hapus dokumen ini dari arsip?')) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFormFields(prev => ({ ...prev, fileName: f.name, fileSize: formatFileSize(f.size) }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editing) {
      setRows(prev => prev.map(r => r.id === editing.id ? {
        ...r, ...formFields, tglBerlaku: formFields.berlakuSelamanya ? null : formFields.tglBerlaku,
      } : r));
    } else {
      setRows(prev => [...prev, {
        id: String(Date.now()), ...formFields,
        tglBerlaku: formFields.berlakuSelamanya ? null : formFields.tglBerlaku,
        fileName: formFields.fileName || 'dokumen-baru.pdf',
        fileSize: formFields.fileSize || '—',
        diunggahOleh: 'Sekretariat Yayasan',
      }]);
    }
    setModalOpen(false);
  };

  const canSave = formFields.nama.trim() !== '' && formFields.nomor.trim() !== '' && formFields.tglTerbit !== '' && (formFields.berlakuSelamanya || formFields.tglBerlaku !== '');

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Daftar Dokumen</h1>
          <p>Arsip digital legalitas, perizinan, dan dokumen penting lembaga beserta masa berlakunya</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Tambah Dokumen
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <FolderOpen size={20} />
            </div>
            <div className="stat-title">Total Dokumen Terarsip</div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-title">Dokumen Aktif</div>
          </div>
          <div className="stat-value">{stats.aktif}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <Clock size={20} />
            </div>
            <div className="stat-title">Akan Kadaluarsa (≤60 hari)</div>
          </div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.akan}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="stat-title">Sudah Kadaluarsa</div>
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.kadaluarsa}</div>
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder="Cari nama, nomor, atau instansi dokumen..."
              value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            Cari
          </button>
        </div>
        <div className="filters-right">
          <SearchableSelect
            className="form-select"
            options={['Semua Kategori', ...KATEGORI].map(k => ({ value: k, label: k }))}
            value={filterKategori}
            onChange={v => { setFilterKategori(v); setPage(1); }}
          />
          <SearchableSelect
            className="form-select"
            options={['Semua Status', 'aktif', 'akan_kadaluarsa', 'kadaluarsa'].map(s => ({ value: s, label: s === 'Semua Status' ? s : STATUS_META[s].label }))}
            value={filterStatus}
            onChange={v => { setFilterStatus(v); setPage(1); }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nama Dokumen</th>
              <th>Kategori</th>
              <th>Nomor Dokumen</th>
              <th>Terbit</th>
              <th>Berlaku Sampai</th>
              <th>Status</th>
              <th style={{ textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada dokumen yang cocok</td></tr>
            )}
            {paged.map(doc => {
              const status = getDocStatus(doc);
              return (
                <tr key={doc.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={16} color="#94a3b8" />
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.nama}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{doc.instansi}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      {doc.kategori}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{doc.nomor}</td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatTanggal(doc.tglTerbit)}</td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{doc.berlakuSelamanya ? 'Seumur Hidup' : formatTanggal(doc.tglBerlaku)}</td>
                  <td>
                    <span className={`status-badge ${STATUS_META[status].cls}`}>{STATUS_META[status].label}</span>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'center' }}>
                      <Eye size={18} title="Lihat Detail" onClick={() => setViewing(doc)} />
                      <Download size={18} title="Unduh" onClick={() => alert(`Dokumen "${doc.nama}" berhasil diunduh (simulasi).`)} />
                      <Edit2 size={18} title="Ubah" onClick={() => openEdit(doc)} />
                      <Trash2 size={18} title="Hapus" onClick={() => handleDelete(doc.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="pagination-bar">
          <div className="pagination-info">
            Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filtered.length)} dari {filtered.length} data
          </div>
          <div className="pagination-controls">
            <select className="pagination-size-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZES.map(s => <option key={s} value={s}>{s} / halaman</option>)}
            </select>
            <button disabled={currentPage === 1} onClick={() => setPage(1)}>«</button>
            <button disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
            <span className="pagination-info">Hal {currentPage} / {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>»</button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>{editing ? 'Ubah Dokumen' : 'Tambah Dokumen'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nama Dokumen</label>
                    <input type="text" className="form-input" required placeholder="cth. Akta Pendirian Yayasan"
                      value={formFields.nama} onChange={e => setFormFields(prev => ({ ...prev, nama: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Kategori</label>
                    <SearchableSelect
                      className="form-select"
                      options={KATEGORI.map(k => ({ value: k, label: k }))}
                      value={formFields.kategori}
                      onChange={v => setFormFields(prev => ({ ...prev, kategori: v }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Nomor Dokumen</label>
                    <input type="text" className="form-input" required placeholder="cth. No. 12/2015"
                      value={formFields.nomor} onChange={e => setFormFields(prev => ({ ...prev, nomor: e.target.value }))} />
                  </div>
                  <div className="form-group full-width">
                    <label>Instansi / Pihak Penerbit</label>
                    <input type="text" className="form-input" required placeholder="cth. Kementerian Agama RI"
                      value={formFields.instansi} onChange={e => setFormFields(prev => ({ ...prev, instansi: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Terbit</label>
                    <input type="date" className="form-input" required
                      value={formFields.tglTerbit} onChange={e => setFormFields(prev => ({ ...prev, tglTerbit: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Berlaku Sampai</label>
                    <input type="date" className="form-input" disabled={formFields.berlakuSelamanya}
                      value={formFields.tglBerlaku} onChange={e => setFormFields(prev => ({ ...prev, tglBerlaku: e.target.value }))} />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontWeight: 400, fontSize: '0.8rem' }}>
                      <input type="checkbox" checked={formFields.berlakuSelamanya}
                        onChange={e => setFormFields(prev => ({ ...prev, berlakuSelamanya: e.target.checked, tglBerlaku: e.target.checked ? '' : prev.tglBerlaku }))} />
                      Berlaku selamanya / tidak ada tanggal kadaluarsa
                    </label>
                  </div>
                  <div className="form-group full-width">
                    <label>Berkas Dokumen</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '12px', cursor: 'pointer' }}>
                      <Upload size={18} color="#64748b" />
                      <span style={{ fontSize: '0.85rem', color: formFields.fileName ? '#0f172a' : '#94a3b8' }}>
                        {formFields.fileName ? `${formFields.fileName} (${formFields.fileSize})` : 'Klik untuk unggah PDF/JPG (maks. 10MB)'}
                      </span>
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileChange} />
                    </label>
                  </div>
                  <div className="form-group full-width">
                    <label>Catatan</label>
                    <textarea className="form-textarea" placeholder="Catatan tambahan (opsional)"
                      value={formFields.catatan} onChange={e => setFormFields(prev => ({ ...prev, catatan: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={!canSave}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewing && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Dokumen</h2>
              <button className="modal-close" onClick={() => setViewing(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '32px', marginBottom: '20px' }}>
                <File size={40} color="#cbd5e1" />
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
                  Pratinjau tidak tersedia dalam mode demo.<br />{viewing.fileName} · {viewing.fileSize}
                </div>
              </div>
              <div className="form-grid" style={{ marginBottom: 0 }}>
                <div className="form-group full-width">
                  <label>Nama Dokumen</label>
                  <div style={{ fontWeight: 600 }}>{viewing.nama}</div>
                </div>
                <div className="form-group">
                  <label>Kategori</label>
                  <div>{viewing.kategori}</div>
                </div>
                <div className="form-group">
                  <label>Nomor Dokumen</label>
                  <div>{viewing.nomor}</div>
                </div>
                <div className="form-group full-width">
                  <label>Instansi / Pihak Penerbit</label>
                  <div>{viewing.instansi}</div>
                </div>
                <div className="form-group">
                  <label>Tanggal Terbit</label>
                  <div>{formatTanggal(viewing.tglTerbit)}</div>
                </div>
                <div className="form-group">
                  <label>Berlaku Sampai</label>
                  <div>{viewing.berlakuSelamanya ? 'Seumur Hidup' : formatTanggal(viewing.tglBerlaku)}</div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div><span className={`status-badge ${STATUS_META[getDocStatus(viewing)].cls}`}>{STATUS_META[getDocStatus(viewing)].label}</span></div>
                </div>
                <div className="form-group">
                  <label>Diunggah Oleh</label>
                  <div>{viewing.diunggahOleh}</div>
                </div>
                {viewing.catatan && (
                  <div className="form-group full-width">
                    <label>Catatan</label>
                    <div>{viewing.catatan}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setViewing(null)}>Tutup</button>
              <button className="btn btn-primary" onClick={() => alert(`Dokumen "${viewing.nama}" berhasil diunduh (simulasi).`)}>
                <Download size={16} /> Unduh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
