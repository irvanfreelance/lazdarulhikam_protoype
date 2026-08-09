import React, { useState, useMemo } from 'react';
import {
  Search, Plus, Eye, X, Inbox, Send, Paperclip, ArrowRight, Archive, ListChecks
} from 'lucide-react';
import SearchableSelect from '../components/SearchableSelect';

const SIFAT_OPTIONS = ['Biasa', 'Penting', 'Segera', 'Rahasia'];

const INITIAL_MASUK = [
  { id: 'M1', noAgenda: 'AM-2026-041', noSuratAsal: 'Kw.10.1/HM.01/1123/2026', tglSurat: '2026-08-05', tglTerima: '2026-08-06', asal: 'Kantor Kementerian Agama Kota Bandung', perihal: 'Undangan Rapat Koordinasi LAZ Se-Kota Bandung', sifat: 'Penting', tujuanDisposisi: 'Ketua Yayasan', status: 'didisposisikan', lampiran: 1, catatan: 'Rapat dijadwalkan 20 Agustus 2026 di Aula Kemenag.' },
  { id: 'M2', noAgenda: 'AM-2026-039', noSuratAsal: '024/BP2/JB/VII/2026', tglSurat: '2026-07-28', tglTerima: '2026-07-29', asal: 'BAZNAS Provinsi Jawa Barat', perihal: 'Permintaan Laporan Triwulan II 2026', sifat: 'Penting', tujuanDisposisi: 'Bag. Keuangan', status: 'diproses', lampiran: 2, catatan: 'Menunggu rekap laporan dari tim akuntansi.' },
  { id: 'M3', noAgenda: 'AM-2026-036', noSuratAsal: '017/YPAB-EXT/VII/2026', tglSurat: '2026-07-15', tglTerima: '2026-07-16', asal: 'Yayasan Peduli Anak Bangsa', perihal: 'Permohonan Kerjasama Program Beasiswa Yatim', sifat: 'Biasa', tujuanDisposisi: 'Bag. Program', status: 'baru', lampiran: 1, catatan: '' },
  { id: 'M4', noAgenda: 'AM-2026-038', noSuratAsal: 'BSI/CBD/OPS/2026/0912', tglSurat: '2026-08-01', tglTerima: '2026-08-02', asal: 'Bank Syariah Indonesia Cabang Bandung', perihal: 'Konfirmasi Perubahan Rekening Giro', sifat: 'Segera', tujuanDisposisi: 'Bag. Keuangan', status: 'selesai', lampiran: 1, catatan: 'Konfirmasi telah dibalas via surat keluar No. 047.' },
  { id: 'M5', noAgenda: 'AM-2026-035', noSuratAsal: 'S-1187/WPJ.09/KP.0503/2026', tglSurat: '2026-07-20', tglTerima: '2026-07-21', asal: 'KPP Pratama Bandung Cibeunying', perihal: 'Permintaan Klarifikasi SPT Tahunan 2025', sifat: 'Penting', tujuanDisposisi: 'Bag. Keuangan', status: 'diproses', lampiran: 3, catatan: 'Dokumen pendukung sedang disiapkan.' },
  { id: 'M6', noAgenda: 'AM-2026-030', noSuratAsal: '-', tglSurat: '2026-06-30', tglTerima: '2026-07-01', asal: 'Bpk. Hendra Wijaya (Donatur)', perihal: 'Surat Wasiat Wakaf Tunai', sifat: 'Rahasia', tujuanDisposisi: 'Ketua Yayasan', status: 'selesai', lampiran: 1, catatan: 'Ditindaklanjuti langsung oleh Ketua Yayasan.' },
  { id: 'M7', noAgenda: 'AM-2026-042', noSuratAsal: '460/1502-Dinsos/2026', tglSurat: '2026-08-07', tglTerima: '2026-08-08', asal: 'Dinas Sosial Kota Bandung', perihal: 'Undangan Sosialisasi Regulasi Bantuan Sosial', sifat: 'Biasa', tujuanDisposisi: 'Bag. Program', status: 'baru', lampiran: 1, catatan: '' },
  { id: 'M8', noAgenda: 'AM-2026-025', noSuratAsal: '033/KAP-SR/VI/2026', tglSurat: '2026-06-15', tglTerima: '2026-06-16', asal: 'KAP Sadikin & Rekan (Auditor Independen)', perihal: 'Permintaan Data Audit Laporan Keuangan 2025', sifat: 'Penting', tujuanDisposisi: 'Bag. Keuangan', status: 'selesai', lampiran: 4, catatan: 'Seluruh data audit telah diserahkan.' },
];

const INITIAL_KELUAR = [
  { id: 'K1', noSurat: '045/SK-DH/VIII/2026', tglSurat: '2026-08-03', perihal: 'Laporan Pertanggungjawaban Dana Zakat Q2 2026', tujuan: 'BAZNAS Provinsi Jawa Barat', sifat: 'Penting', dibuatOleh: 'Bag. Keuangan', status: 'terkirim', lampiran: 3, catatan: 'Dikirim via email resmi & hardcopy pos.' },
  { id: 'K2', noSurat: '046/SK-DH/VIII/2026', tglSurat: '2026-08-06', perihal: 'Undangan Buka Bersama Yatim & Dhuafa', tujuan: 'Donatur & Mitra Program', sifat: 'Biasa', dibuatOleh: 'Bag. Fundraising', status: 'menunggu_ttd', lampiran: 0, catatan: 'Menunggu tanda tangan Ketua Yayasan.' },
  { id: 'K3', noSurat: '044/SK-DH/VII/2026', tglSurat: '2026-07-30', perihal: 'Surat Ucapan Terima Kasih kepada Donatur Korporat', tujuan: 'PT Astra Internasional Tbk', sifat: 'Biasa', dibuatOleh: 'Bag. Fundraising', status: 'terkirim', lampiran: 0, catatan: '' },
  { id: 'K4', noSurat: '043/SK-DH/VII/2026', tglSurat: '2026-07-22', perihal: 'Permohonan Perpanjangan Izin Operasional LAZ', tujuan: 'Kementerian Agama RI', sifat: 'Penting', dibuatOleh: 'Sekretariat', status: 'diarsipkan', lampiran: 5, catatan: 'Perpanjangan disetujui, arsip fisik di lemari legalitas.' },
  { id: 'K5', noSurat: '047/SK-DH/VIII/2026', tglSurat: '2026-08-08', perihal: 'Jawaban Klarifikasi SPT Tahunan 2025', tujuan: 'KPP Pratama Bandung Cibeunying', sifat: 'Penting', dibuatOleh: 'Bag. Keuangan', status: 'draft', lampiran: 2, catatan: 'Menunggu lampiran final dari akuntan.' },
  { id: 'K6', noSurat: '042/SK-DH/VI/2026', tglSurat: '2026-06-25', perihal: 'Laporan Penggunaan Dana Wakaf Produktif', tujuan: 'Wakif & Nazhir Terkait', sifat: 'Biasa', dibuatOleh: 'Bag. Program', status: 'diarsipkan', lampiran: 1, catatan: '' },
  { id: 'K7', noSurat: '048/SK-DH/VIII/2026', tglSurat: '2026-08-09', perihal: 'Surat Tugas Tim Survei Penerima Manfaat', tujuan: 'Internal - Tim Program', sifat: 'Biasa', dibuatOleh: 'Bag. Program', status: 'draft', lampiran: 0, catatan: '' },
  { id: 'K8', noSurat: '041/SK-DH/VI/2026', tglSurat: '2026-06-10', perihal: 'MOU Kerjasama Program Beasiswa', tujuan: 'Yayasan Peduli Anak Bangsa', sifat: 'Penting', dibuatOleh: 'Manajemen', status: 'terkirim', lampiran: 2, catatan: '' },
];

const MASUK_FLOW = {
  baru: { label: 'BARU', cls: 'status-info', next: { label: 'Disposisikan', status: 'didisposisikan' } },
  didisposisikan: { label: 'DIDISPOSISIKAN', cls: 'status-warning', next: { label: 'Proses', status: 'diproses' } },
  diproses: { label: 'DIPROSES', cls: 'status-warning', next: { label: 'Selesaikan', status: 'selesai' } },
  selesai: { label: 'SELESAI', cls: 'status-success', next: null },
};

const KELUAR_FLOW = {
  draft: { label: 'DRAFT', cls: 'status-info', next: { label: 'Ajukan TTD', status: 'menunggu_ttd' } },
  menunggu_ttd: { label: 'MENUNGGU TTD', cls: 'status-warning', next: { label: 'Kirim', status: 'terkirim' } },
  terkirim: { label: 'TERKIRIM', cls: 'status-success', next: { label: 'Arsipkan', status: 'diarsipkan' } },
  diarsipkan: { label: 'DIARSIPKAN', cls: '', next: null },
};

const SIFAT_CLS = { Rahasia: 'status-danger', Penting: 'status-warning', Segera: 'status-info', Biasa: '' };

const PAGE_SIZES = [10, 25, 50];

const formatTanggal = (iso) => {
  if (!iso) return '-';
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const isThisMonth = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

const emptyMasukForm = { noSuratAsal: '', tglSurat: '', tglTerima: '', asal: '', perihal: '', sifat: 'Biasa', tujuanDisposisi: 'Ketua Yayasan', catatan: '' };
const emptyKeluarForm = { tglSurat: '', perihal: '', tujuan: '', sifat: 'Biasa', dibuatOleh: 'Sekretariat', catatan: '' };

const SifatBadge = ({ sifat }) => (
  SIFAT_CLS[sifat]
    ? <span className={`status-badge ${SIFAT_CLS[sifat]}`}>{sifat.toUpperCase()}</span>
    : <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600 }}>{sifat.toUpperCase()}</span>
);

const SuratMenyurat = () => {
  const [activeTab, setActiveTab] = useState('masuk');
  const [masuk, setMasuk] = useState(INITIAL_MASUK);
  const [keluar, setKeluar] = useState(INITIAL_KELUAR);
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [masukForm, setMasukForm] = useState(emptyMasukForm);
  const [keluarForm, setKeluarForm] = useState(emptyKeluarForm);
  const [viewing, setViewing] = useState(null);

  const switchTab = (tab) => { setActiveTab(tab); setKeywordDraft(''); setKeyword(''); setPage(1); };

  const source = activeTab === 'masuk' ? masuk : keluar;
  const flow = activeTab === 'masuk' ? MASUK_FLOW : KELUAR_FLOW;

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return source;
    return source.filter(s =>
      s.perihal.toLowerCase().includes(k) ||
      (activeTab === 'masuk' ? s.asal : s.tujuan).toLowerCase().includes(k) ||
      (activeTab === 'masuk' ? s.noAgenda : s.noSurat).toLowerCase().includes(k)
    );
  }, [source, keyword, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => ({
    masukBulanIni: masuk.filter(s => isThisMonth(s.tglTerima)).length,
    keluarBulanIni: keluar.filter(s => isThisMonth(s.tglSurat)).length,
    perluTindakLanjut: masuk.filter(s => s.status === 'baru' || s.status === 'didisposisikan').length + keluar.filter(s => s.status === 'draft' || s.status === 'menunggu_ttd').length,
    totalArsip: masuk.length + keluar.length,
  }), [masuk, keluar]);

  const commitSearch = () => { setKeyword(keywordDraft); setPage(1); };

  const openAdd = () => {
    if (activeTab === 'masuk') setMasukForm(emptyMasukForm);
    else setKeluarForm(emptyKeluarForm);
    setModalOpen(true);
  };

  const handleSaveMasuk = (e) => {
    e.preventDefault();
    const nextNum = masuk.length + 1;
    const newItem = {
      id: 'M' + Date.now(),
      noAgenda: `AM-2026-${String(43 + nextNum).padStart(3, '0')}`,
      ...masukForm,
      status: 'baru',
      lampiran: 0,
    };
    setMasuk(prev => [newItem, ...prev]);
    setModalOpen(false);
  };

  const handleSaveKeluar = (e) => {
    e.preventDefault();
    const nextNum = keluar.length + 1;
    const newItem = {
      id: 'K' + Date.now(),
      noSurat: `0${49 + nextNum}/SK-DH/VIII/2026`,
      ...keluarForm,
      status: 'draft',
      lampiran: 0,
    };
    setKeluar(prev => [newItem, ...prev]);
    setModalOpen(false);
  };

  const advanceStatus = (item) => {
    const step = flow[item.status]?.next;
    if (!step) return;
    if (activeTab === 'masuk') {
      setMasuk(prev => prev.map(m => m.id === item.id ? { ...m, status: step.status } : m));
    } else {
      setKeluar(prev => prev.map(k => k.id === item.id ? { ...k, status: step.status } : k));
    }
    setViewing(prev => prev && prev.id === item.id ? { ...prev, status: step.status } : prev);
  };

  const canSaveMasuk = masukForm.asal.trim() !== '' && masukForm.perihal.trim() !== '' && masukForm.tglSurat !== '' && masukForm.tglTerima !== '';
  const canSaveKeluar = keluarForm.tujuan.trim() !== '' && keluarForm.perihal.trim() !== '' && keluarForm.tglSurat !== '';

  return (
    <div className="content-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Surat Menyurat</h1>
          <p>Buku agenda dan pengelolaan surat masuk, surat keluar, serta status tindak lanjutnya</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> {activeTab === 'masuk' ? 'Catat Surat Masuk' : 'Buat Surat Keluar'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
              <Inbox size={20} />
            </div>
            <div className="stat-title">Surat Masuk Bulan Ini</div>
          </div>
          <div className="stat-value">{stats.masukBulanIni}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Send size={20} />
            </div>
            <div className="stat-title">Surat Keluar Bulan Ini</div>
          </div>
          <div className="stat-value">{stats.keluarBulanIni}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
              <ListChecks size={20} />
            </div>
            <div className="stat-title">Perlu Tindak Lanjut</div>
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>{stats.perluTindakLanjut}</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
              <Archive size={20} />
            </div>
            <div className="stat-title">Total Arsip Surat</div>
          </div>
          <div className="stat-value">{stats.totalArsip}</div>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-list">
          <div className={`tab-item ${activeTab === 'masuk' ? 'active' : ''}`} onClick={() => switchTab('masuk')}>
            Surat Masuk
          </div>
          <div className={`tab-item ${activeTab === 'keluar' ? 'active' : ''}`} onClick={() => switchTab('keluar')}>
            Surat Keluar
          </div>
        </div>
      </div>

      <div className="filters-row">
        <div className="filters-left">
          <div className="filter-input">
            <Search size={16} />
            <input
              type="text"
              placeholder={activeTab === 'masuk' ? 'Cari perihal, asal, atau no. agenda...' : 'Cari perihal, tujuan, atau no. surat...'}
              value={keywordDraft}
              onChange={e => setKeywordDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && commitSearch()}
            />
          </div>
          <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={commitSearch}>
            Cari
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            {activeTab === 'masuk' ? (
              <tr>
                <th>No. Agenda</th>
                <th>Tgl Terima</th>
                <th>Asal Surat</th>
                <th>Perihal</th>
                <th>Sifat</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            ) : (
              <tr>
                <th>No. Surat</th>
                <th>Tgl Surat</th>
                <th>Tujuan</th>
                <th>Perihal</th>
                <th>Sifat</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            )}
          </thead>
          <tbody>
            {paged.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>Tidak ada data surat</td></tr>
            )}
            {activeTab === 'masuk' ? paged.map(item => (
              <tr key={item.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem' }}>{item.noAgenda}</td>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatTanggal(item.tglTerima)}</td>
                <td style={{ fontSize: '0.8rem' }}>{item.asal}</td>
                <td style={{ fontSize: '0.85rem', maxWidth: '260px' }}>
                  {item.perihal}
                  {item.lampiran > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '8px', color: '#94a3b8', fontSize: '0.75rem' }}><Paperclip size={12} />{item.lampiran}</span>}
                </td>
                <td><SifatBadge sifat={item.sifat} /></td>
                <td><span className={`status-badge ${MASUK_FLOW[item.status].cls}`}>{MASUK_FLOW[item.status].label}</span></td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Eye size={18} title="Lihat Detail" onClick={() => setViewing(item)} />
                    {MASUK_FLOW[item.status].next && (
                      <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => advanceStatus(item)}>
                        {MASUK_FLOW[item.status].next.label} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : paged.map(item => (
              <tr key={item.id}>
                <td style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '0.8rem' }}>{item.noSurat}</td>
                <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{formatTanggal(item.tglSurat)}</td>
                <td style={{ fontSize: '0.8rem' }}>{item.tujuan}</td>
                <td style={{ fontSize: '0.85rem', maxWidth: '260px' }}>
                  {item.perihal}
                  {item.lampiran > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '8px', color: '#94a3b8', fontSize: '0.75rem' }}><Paperclip size={12} />{item.lampiran}</span>}
                </td>
                <td><SifatBadge sifat={item.sifat} /></td>
                <td>
                  {KELUAR_FLOW[item.status].cls
                    ? <span className={`status-badge ${KELUAR_FLOW[item.status].cls}`}>{KELUAR_FLOW[item.status].label}</span>
                    : <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600 }}>{KELUAR_FLOW[item.status].label}</span>}
                </td>
                <td>
                  <div className="action-buttons" style={{ justifyContent: 'center' }}>
                    <Eye size={18} title="Lihat Detail" onClick={() => setViewing(item)} />
                    {KELUAR_FLOW[item.status].next && (
                      <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => advanceStatus(item)}>
                        {KELUAR_FLOW[item.status].next.label} <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
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

      {/* ADD MODAL */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{activeTab === 'masuk' ? 'Catat Surat Masuk' : 'Buat Surat Keluar'}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            {activeTab === 'masuk' ? (
              <form onSubmit={handleSaveMasuk}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Asal Surat</label>
                      <input type="text" className="form-input" required placeholder="cth. Kementerian Agama RI"
                        value={masukForm.asal} onChange={e => setMasukForm(prev => ({ ...prev, asal: e.target.value }))} />
                    </div>
                    <div className="form-group full-width">
                      <label>Perihal</label>
                      <input type="text" className="form-input" required placeholder="cth. Undangan Rapat Koordinasi"
                        value={masukForm.perihal} onChange={e => setMasukForm(prev => ({ ...prev, perihal: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>No. Surat Asal</label>
                      <input type="text" className="form-input" placeholder="Nomor surat dari pengirim"
                        value={masukForm.noSuratAsal} onChange={e => setMasukForm(prev => ({ ...prev, noSuratAsal: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Sifat Surat</label>
                      <SearchableSelect
                        className="form-select"
                        options={SIFAT_OPTIONS.map(s => ({ value: s, label: s }))}
                        value={masukForm.sifat}
                        onChange={v => setMasukForm(prev => ({ ...prev, sifat: v }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tanggal Surat</label>
                      <input type="date" className="form-input" required
                        value={masukForm.tglSurat} onChange={e => setMasukForm(prev => ({ ...prev, tglSurat: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Tanggal Diterima</label>
                      <input type="date" className="form-input" required
                        value={masukForm.tglTerima} onChange={e => setMasukForm(prev => ({ ...prev, tglTerima: e.target.value }))} />
                    </div>
                    <div className="form-group full-width">
                      <label>Disposisi Ditujukan Kepada</label>
                      <input type="text" className="form-input" placeholder="cth. Ketua Yayasan"
                        value={masukForm.tujuanDisposisi} onChange={e => setMasukForm(prev => ({ ...prev, tujuanDisposisi: e.target.value }))} />
                    </div>
                    <div className="form-group full-width">
                      <label>Catatan</label>
                      <textarea className="form-textarea" placeholder="Catatan tambahan (opsional)"
                        value={masukForm.catatan} onChange={e => setMasukForm(prev => ({ ...prev, catatan: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={!canSaveMasuk}>Simpan</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveKeluar}>
                <div className="modal-body">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Tujuan Surat</label>
                      <input type="text" className="form-input" required placeholder="cth. BAZNAS Provinsi Jawa Barat"
                        value={keluarForm.tujuan} onChange={e => setKeluarForm(prev => ({ ...prev, tujuan: e.target.value }))} />
                    </div>
                    <div className="form-group full-width">
                      <label>Perihal</label>
                      <input type="text" className="form-input" required placeholder="cth. Laporan Pertanggungjawaban Dana Zakat"
                        value={keluarForm.perihal} onChange={e => setKeluarForm(prev => ({ ...prev, perihal: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Sifat Surat</label>
                      <SearchableSelect
                        className="form-select"
                        options={SIFAT_OPTIONS.map(s => ({ value: s, label: s }))}
                        value={keluarForm.sifat}
                        onChange={v => setKeluarForm(prev => ({ ...prev, sifat: v }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Tanggal Surat</label>
                      <input type="date" className="form-input" required
                        value={keluarForm.tglSurat} onChange={e => setKeluarForm(prev => ({ ...prev, tglSurat: e.target.value }))} />
                    </div>
                    <div className="form-group full-width">
                      <label>Dibuat Oleh</label>
                      <input type="text" className="form-input" placeholder="cth. Bag. Keuangan"
                        value={keluarForm.dibuatOleh} onChange={e => setKeluarForm(prev => ({ ...prev, dibuatOleh: e.target.value }))} />
                    </div>
                    <div className="form-group full-width">
                      <label>Catatan</label>
                      <textarea className="form-textarea" placeholder="Catatan tambahan (opsional)"
                        value={keluarForm.catatan} onChange={e => setKeluarForm(prev => ({ ...prev, catatan: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn" style={{ background: 'white', border: '1px solid #e2e8f0' }} onClick={() => setModalOpen(false)}>Batal</button>
                  <button type="submit" className="btn btn-primary" disabled={!canSaveKeluar}>Simpan Draft</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewing && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Detail Surat {activeTab === 'masuk' ? 'Masuk' : 'Keluar'}</h2>
              <button className="modal-close" onClick={() => setViewing(null)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid" style={{ marginBottom: 0 }}>
                <div className="form-group">
                  <label>{activeTab === 'masuk' ? 'No. Agenda' : 'No. Surat'}</label>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{activeTab === 'masuk' ? viewing.noAgenda : viewing.noSurat}</div>
                </div>
                <div className="form-group">
                  <label>Sifat</label>
                  <div><SifatBadge sifat={viewing.sifat} /></div>
                </div>
                <div className="form-group full-width">
                  <label>Perihal</label>
                  <div style={{ fontWeight: 600 }}>{viewing.perihal}</div>
                </div>
                <div className="form-group full-width">
                  <label>{activeTab === 'masuk' ? 'Asal Surat' : 'Tujuan Surat'}</label>
                  <div>{activeTab === 'masuk' ? viewing.asal : viewing.tujuan}</div>
                </div>
                {activeTab === 'masuk' ? (
                  <>
                    <div className="form-group">
                      <label>Tanggal Surat</label>
                      <div>{formatTanggal(viewing.tglSurat)}</div>
                    </div>
                    <div className="form-group">
                      <label>Tanggal Diterima</label>
                      <div>{formatTanggal(viewing.tglTerima)}</div>
                    </div>
                    <div className="form-group full-width">
                      <label>Disposisi Kepada</label>
                      <div>{viewing.tujuanDisposisi}</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label>Tanggal Surat</label>
                      <div>{formatTanggal(viewing.tglSurat)}</div>
                    </div>
                    <div className="form-group">
                      <label>Dibuat Oleh</label>
                      <div>{viewing.dibuatOleh}</div>
                    </div>
                  </>
                )}
                <div className="form-group">
                  <label>Lampiran</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Paperclip size={14} />{viewing.lampiran} berkas</div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <div>
                    {flow[viewing.status].cls
                      ? <span className={`status-badge ${flow[viewing.status].cls}`}>{flow[viewing.status].label}</span>
                      : <span style={{ fontSize: '0.75rem', background: '#f1f5f9', color: '#64748b', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600 }}>{flow[viewing.status].label}</span>}
                  </div>
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
              {flow[viewing.status].next && (
                <button className="btn btn-primary" onClick={() => advanceStatus(viewing)}>
                  {flow[viewing.status].next.label} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuratMenyurat;
