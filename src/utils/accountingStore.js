// --- UNIFIED ACCOUNTING STORE FOR PROTOTYPE ---

// --- CONSTANTS ---
export const COAS_ALL = {
  // Assets (1xx)
  '101.01.001.000': '101.01.001.000 (Kas Pusat)',
  '101.01.002.000': '101.01.002.000 (Kas Kecil)',
  '101.02.001.000': '101.02.001.000 (BCA — Transfer Manual)',
  '101.02.002.000': '101.02.002.000 (Mandiri — Transfer Manual)',
  '101.02.004.000': '101.02.004.000 (E-Wallet Xendit)',
  '101.02.006.000': '101.02.006.000 (QRIS Xendit Settlement)',
  '101.02.007.000': '101.02.007.000 (BCA Virtual Account)',
  '101.04.001.000': '101.04.001.000 (Uang Muka / Piutang Staf)',
  '101.04.002.000': '101.04.002.000 (Uang Muka Vendor)',
  '101.04.003.000': '101.04.003.000 (Piutang Grant / Hibah)',
  '101.05.001.000': '101.05.001.000 (Kas dalam Perjalanan - Transit)',
  '102.01.000.000': '102.01.000.000 (Aset Inventaris - Laptop)',
  '102.01.001.000': '102.01.001.000 (Akumulasi Penyusutan Inventaris)',

  // Liabilities (2xx)
  '201.01.000.000': '201.01.000.000 (Titipan Dana Zakat)',
  '201.03.000.000': '201.03.000.000 (Hutang Usaha)',

  // Equity / Net Assets (3xx)
  '300.06.000.000': '300.06.000.000 (Aset Bersih Tidak Terikat)',
  '300.07.000.000': '300.07.000.000 (Aset Bersih Terikat Sementara)',
  '300.08.000.000': '300.08.000.000 (Aset Bersih Terikat Permanen)',
  '300.01.001.000': '300.01.001.000 (Dana Kesehatan)',
  '300.01.002.000': '300.01.002.000 (Dana Kemanusiaan)',
  '300.02.001.000': '300.02.001.000 (Zakat Profesi & Maal)',
  '300.09.000.000': '300.09.000.000 (Ikhtisar Surplus/Defisit Tahun Berjalan)',
  
  // Revenues (4xx)
  '401.01.001.000': '401.01.001.000 (Donasi Kesehatan Individu)',
  '401.02.001.000': '401.02.001.000 (Donasi Bencana Alam)',
  '401.04.001.000': '401.04.001.000 (Sedekah Berbuka Puasa)',
  '401.05.001.000': '401.05.001.000 (Zakat Profesi & Maal)',
  '401.07.001.000': '401.07.001.000 (Infaq Operasional)',
  '401.08.001.000': '401.08.001.000 (Donasi Pembangunan Masjid)',
  '401.09.001.000': '401.09.001.000 (Pendapatan Hibah Grant)',
  
  // Expenses (5xx)
  '501.01.000.000': '501.01.000.000 (Penyaluran Kesehatan)',
  '501.02.000.000': '501.02.000.000 (Penyaluran Kemanusiaan)',
  '501.03.000.000': '501.03.000.000 (Penyaluran Pangan)',
  '501.05.000.000': '501.05.000.000 (Penyaluran Zakat)',
  '502.01.000.000': '502.01.000.000 (Biaya PG Platform)',
  '502.03.000.000': '502.03.000.000 (Biaya Operasional Kantor)',
  '502.04.000.000': '502.04.000.000 (Biaya Gaji Karyawan)',
  '502.05.000.000': '502.05.000.000 (Beban Penyusutan Aset)'
};

export const CHANNELS = ['Xendit QRIS', 'BCA VA', 'Mandiri VA', 'ShopeePay', 'Alfamart', 'Transfer Bank', 'Kas Pusat'];
export const CATEGORIES = ['barang', 'jasa', 'media', 'konsultan', 'peternak', 'catering', 'logistik', 'lainnya'];
export const PERIODS = ['Mei 2026', 'Juni 2026', 'Juli 2026', 'Oktober 2026', 'Januari 2027'];
export const AJE_TYPES = ['akrual', 'depresiasi', 'koreksi', 'penutup', 'balik'];

// HCM constants
export const DEPARTEMEN_OPTIONS = ['Keuangan', 'Program & Penyaluran', 'Marketing & Fundraising', 'Umum & IT', 'Manajemen'];
export const STATUS_KEPEGAWAIAN_OPTIONS = ['Tetap', 'Kontrak', 'Magang', 'Harian Lepas'];
export const ATTENDANCE_STATUS_OPTIONS = ['Hadir', 'Terlambat', 'Sakit', 'Izin', 'Cuti', 'Alpha'];
export const ATTENDANCE_METHOD_OPTIONS = ['Fingerprint', 'Mobile App', 'Manual'];
export const ACTIVITY_CATEGORIES = ['Pekerjaan', 'Pribadi', 'Kesehatan'];

export const formatRupiah = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num || 0);
};

export const generateIdTrans = (prefix = '2607') => {
  const datePrefix = prefix + String(new Date().getDate()).padStart(2, '0');
  const randSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
  return datePrefix + randSuffix;
};

// --- INITIAL SEED DATA ---
const defaultPenerimaan = [
  { id: '1', id_trans: '2607120935123456', tgl: '2026-07-12T09:35', donatur: 'Hamba Allah', channel: 'Xendit QRIS', coa: '401.01.001.000', nominal: 5000000, status: 'PAID', note: 'Donasi kesehatan hamba allah' },
  { id: '2', id_trans: '2607121015987654', tgl: '2026-07-12T10:15', donatur: 'Budi Santoso', channel: 'BCA VA', coa: '401.02.001.000', nominal: 2500000, status: 'PAID', note: 'Donasi gempa cianjur' },
  { id: '3', id_trans: '2607111420112233', tgl: '2026-07-11T14:20', donatur: 'PT ABC Sejahtera', channel: 'Transfer Bank', coa: '401.05.001.000', nominal: 50000000, status: 'PENDING', note: 'Pembayaran zakat profesi & maal perusahaan' },
  { id: '4', id_trans: '2607111645445566', tgl: '2026-07-11T16:45', donatur: 'Siti Aminah', channel: 'ShopeePay', coa: '401.04.001.000', nominal: 100000, status: 'PAID', note: 'Sedekah berbuka puasa' },
  { id: '5', id_trans: '2607100810998877', tgl: '2026-07-10T08:10', donatur: 'Anonim', channel: 'Alfamart', coa: '401.01.001.000', nominal: 50000, status: 'PAID', note: 'Titipan donasi kesehatan' }
];

const defaultPengeluaran = [
  { id: '1', id_trans: '2607121122334455', tgl: '2026-07-12T11:22', vendor: 'CV Sembako Mandiri', kategori: 'logistik', coa: '501.03.000.000', nominal: 15000000, status: 'PAID', note: 'Penyaluran beras dhuafa', coa_bayar: '101.02.001.000' },
  { id: '2', id_trans: '2607111530998877', tgl: '2026-07-11T15:30', vendor: 'Apotek Sehat Sentosa', kategori: 'barang', coa: '501.01.000.000', nominal: 3200000, status: 'PAID', note: 'Penyembuhan pasien dhuafa', coa_bayar: '101.01.001.000' },
  { id: '3', id_trans: '2607101015665544', tgl: '2026-07-10T10:15', vendor: 'PT Telkom Indonesia', kategori: 'jasa', coa: '502.03.000.000', nominal: 1250000, status: 'PENDING', note: 'Beban langganan internet kantor', coa_bayar: '101.02.002.000' }
];

const defaultSaldo = [
  { coa: '101.01.001.000', nama: 'Kas Pusat', saldo: 15450000 },
  { coa: '101.01.002.000', nama: 'Kas Kecil', saldo: 2500000 },
  { coa: '101.02.001.000', nama: 'BCA — Transfer Manual', saldo: 245300000 },
  { coa: '101.02.002.000', nama: 'Mandiri — Transfer Manual', saldo: 120000000 },
  { coa: '101.02.004.000', nama: 'E-Wallet Xendit', saldo: 50000000 },
  { coa: '101.02.006.000', nama: 'QRIS Xendit Settlement', saldo: 20000000 },
  { coa: '101.02.007.000', nama: 'BCA Virtual Account', saldo: 15000000 }
];

const defaultOpname = [
  { id: '1', tanggal: '2026-07-12', coa: '101.01.001.000', saldo_awal: 15400000, debet: 50000, kredit: 0, adjustment: 0, saldo_akhir: 15450000, detail_kertas: '100k x 150, 50k x 9', detail_logam: '500 x 0', per: 'd', keterangan: 'Cocok harian', via: 'coa' }
];

const defaultJurnalPenyesuaian = [
  { id: '1', period: 'Oktober 2026', jenis_aje: 'depresiasi', keterangan: 'Penyusutan Laptop Inventaris Kantor', coa_debet: '502.05.000.000', coa_kredit: '102.01.001.000', nominal: 250000, nik_input: 'ADMIN001', approved_by: 'Asep Superadmin', approved_at: '2026-10-31T17:00' }
];

// Beneficiaries
const defaultBeneficiaries = [
  { id: '1', kode_beneficiary: 'BNF-2026-000001', nama_lengkap: 'Syarifudin', nik: '3201020304050001', kategori: 'individu', status_ekonomi: 'miskin', kelurahan: 'Sindangrasa', kecamatan: 'Bogor Timur', kabupaten: 'Bogor', provinsi: 'Jawa Barat', status_verifikasi: 'verified', campaign_id: 1, lat: -6.5971, lng: 106.8060 },
  { id: '2', kode_beneficiary: 'BNF-2026-000002', nama_lengkap: 'Panti Asuhan Al-Barokah', nik: '', kategori: 'lembaga', status_ekonomi: 'lainnya', kelurahan: 'Margajaya', kecamatan: 'Bogor Barat', kabupaten: 'Bogor', provinsi: 'Jawa Barat', status_verifikasi: 'verified', campaign_id: 5, lat: -6.5964, lng: 106.7757 },
  { id: '3', kode_beneficiary: 'BNF-2026-000003', nama_lengkap: 'Neneng Sumarni', nik: '3201020304050002', kategori: 'individu', status_ekonomi: 'sangat_miskin', kelurahan: 'Tajur', kecamatan: 'Bogor Timur', kabupaten: 'Bogor', provinsi: 'Jawa Barat', status_verifikasi: 'unverified', campaign_id: 1, lat: -6.6208, lng: 106.8228 }
];

// Disbursement Requests
const defaultDisbursementRequests = [
  { id: '1', nomor_pengajuan: 'DSB-2026-000001', campaign_id: 1, beneficiary_id: '1', judul: 'Bantuan Biaya Pengobatan Kanker Kelenjar Syarifudin', deskripsi: 'Pencairan dana untuk pengobatan kemoterapi tahap ke-3 di RSUD', jenis_penyaluran: 'transfer', jumlah_diajukan: 8000000, jumlah_disetujui: 8000000, coa_debet: '501.01.000.000', coa_kredit: '101.02.001.000', status: 'approved', nik_pengaju: 'STF001', tgl_pengajuan: '2026-07-10', approved_by: 'MGR001' },
  { id: '2', nomor_pengajuan: 'DSB-2026-000002', campaign_id: 5, beneficiary_id: '2', judul: 'Sembako Bulanan Panti Asuhan Al-Barokah', deskripsi: 'Penyaluran beras, minyak goreng, dan telur untuk operasional panti asuhan', jenis_penyaluran: 'barang', jumlah_diajukan: 3000000, jumlah_disetujui: 3000000, coa_debet: '501.03.000.000', coa_kredit: '101.01.001.000', status: 'disbursed', nik_pengaju: 'STF002', tgl_pengajuan: '2026-07-05', approved_by: 'MGR001', tgl_realisasi: '2026-07-06T11:00', fins_trans_id: '1' }
];

// Vendors
const defaultVendors = [
  { id: '1', kode_vendor: 'VND-000001', nama_vendor: 'Catering Berkah Jaya', npwp: '01.234.567.8-901.000', kategori: 'catering', kota: 'Bogor', kontak_pic: 'Ibu Rahayu', telepon: '08123456789', term_bayar: 14, active: 'y' },
  { id: '2', kode_vendor: 'VND-000002', nama_vendor: 'Toko Bangunan Al-Amin', npwp: '02.456.789.0-901.000', kategori: 'barang', kota: 'Bogor', kontak_pic: 'Bapak H. Mansur', telepon: '08567890123', term_bayar: 7, active: 'y' }
];

// Purchase Orders
const defaultPurchaseOrders = [
  { id: '1', nomor_po: 'PO-2026-000001', vendor_id: '2', campaign_id: 2, judul: 'Pembelian Semen & Pasir Masjid Pelosok', total_amount: 25000000, dp_amount: 5000000, status: 'approved', tgl_po: '2026-07-10', nik_pembuat: 'STF001' }
];

// Expense Requests
const defaultExpenseRequests = [
  { id: '1', nomor_expense: 'EXP-2026-000001', judul: 'Reimbursement Pembelian ATK Kantor', jenis: 'reimbursement', total_amount: 450000, campaign_id: null, vendor_id: null, coa_debet: '502.03.000.000', coa_kredit: '101.01.001.000', status: 'approved', nik_pengaju: 'STF002', tgl_pengajuan: '2026-07-14' }
];

// Cash Advances
const defaultCashAdvances = [
  { id: '1', nomor_kasbon: 'CSB-2026-000001', nik_staf: 'STF002', nama_staf: 'Ahmad Faisal', jumlah_advance: 1500000, tujuan: 'Uang muka operasional lapangan survei bencana banjir', tgl_kasbon: '2026-07-10', tgl_jatuh_tempo: '2026-07-24', status: 'active', sisa_kasbon: 1500000, jumlah_direalisasi: 0, jumlah_dikembalikan: 0 }
];

// Grants
const defaultGrants = [
  { id: '1', donor: 'Astra Foundation', program: 'Program Beasiswa Pemberdayaan Dhuafa', total_grant: 120000000, terpakai: 20000000, jenis_dana: 'terikat_sementara', status: 'aktif' }
];

const defaultGrantDisbursements = [
  { id: '1', grant_id: '1', termin: 1, nominal: 60000000, tgl_rencana: '2026-05-15', status: 'cair', tgl_cair: '2026-05-15', coa_bank: '101.02.001.000' },
  { id: '2', grant_id: '1', termin: 2, nominal: 60000000, tgl_rencana: '2026-10-15', status: 'rencana' }
];

// Employees
const defaultEmployees = [
  { id: '1', nik: 'EMP001', nama: 'Asep Setiawan', jabatan: 'Finance Manager', departemen: 'Keuangan', status_kepegawaian: 'Tetap', tanggal_masuk: '2021-03-01', email: 'asep.setiawan@darulhikam.org', no_hp: '081234500001', ptkp: 'K/0', gaji_pokok: 7500000, bank: 'BCA', norek: '1234567890', active: true },
  { id: '2', nik: 'EMP002', nama: 'Ahmad Faisal', jabatan: 'Staff Lapangan', status: 'Staff Lapangan', departemen: 'Program & Penyaluran', status_kepegawaian: 'Tetap', tanggal_masuk: '2022-06-15', email: 'ahmad.faisal@darulhikam.org', no_hp: '081234500002', ptkp: 'TK/0', gaji_pokok: 4500000, bank: 'Mandiri', norek: '0987654321', active: true },
  { id: '3', nik: 'EMP003', nama: 'Siti Nurhaliza', jabatan: 'Staff Fundraising', departemen: 'Marketing & Fundraising', status_kepegawaian: 'Kontrak', tanggal_masuk: '2023-09-01', email: 'siti.nurhaliza@darulhikam.org', no_hp: '081234500003', ptkp: 'TK/0', gaji_pokok: 4200000, bank: 'BCA', norek: '2345678901', active: true },
  { id: '4', nik: 'EMP004', nama: 'Muhammad Rizki', jabatan: 'IT Support', departemen: 'Umum & IT', status_kepegawaian: 'Tetap', tanggal_masuk: '2020-11-10', email: 'muhammad.rizki@darulhikam.org', no_hp: '081234500004', ptkp: 'K/1', gaji_pokok: 5200000, bank: 'BNI', norek: '3456789012', active: true },
  { id: '5', nik: 'EMP005', nama: 'Dewi Kartika', jabatan: 'Staff Administrasi', departemen: 'Umum & IT', status_kepegawaian: 'Magang', tanggal_masuk: '2026-01-06', email: 'dewi.kartika@darulhikam.org', no_hp: '081234500005', ptkp: 'TK/0', gaji_pokok: 2500000, bank: 'Mandiri', norek: '4567890123', active: true }
];

const defaultPayrollPeriods = [
  { id: '1', periode: 'Juni 2026', total_gaji: 12000000, status: 'disbursed', tgl_bayar: '2026-06-25T08:00', approved_by: 'MGR001' }
];

// HCM — Attendance (Kehadiran Karyawan)
const defaultAttendance = [
  { id: '1', tanggal: '2026-08-09', nik: 'EMP001', nama: 'Asep Setiawan', departemen: 'Keuangan', jam_masuk: '08:02', jam_pulang: '17:05', status: 'Hadir', metode: 'Fingerprint', keterangan: '' },
  { id: '2', tanggal: '2026-08-09', nik: 'EMP002', nama: 'Ahmad Faisal', departemen: 'Program & Penyaluran', jam_masuk: '08:41', jam_pulang: '17:10', status: 'Terlambat', metode: 'Mobile App', keterangan: 'Terjebak macet di lokasi survei' },
  { id: '3', tanggal: '2026-08-09', nik: 'EMP003', nama: 'Siti Nurhaliza', departemen: 'Marketing & Fundraising', jam_masuk: '', jam_pulang: '', status: 'Sakit', metode: 'Manual', keterangan: 'Surat keterangan dokter menyusul' },
  { id: '4', tanggal: '2026-08-09', nik: 'EMP004', nama: 'Muhammad Rizki', departemen: 'Umum & IT', jam_masuk: '07:55', jam_pulang: '17:00', status: 'Hadir', metode: 'Fingerprint', keterangan: '' },
  { id: '5', tanggal: '2026-08-09', nik: 'EMP005', nama: 'Dewi Kartika', departemen: 'Umum & IT', jam_masuk: '', jam_pulang: '', status: 'Izin', metode: 'Manual', keterangan: 'Mengurus dokumen kependudukan' },
  { id: '6', tanggal: '2026-08-08', nik: 'EMP001', nama: 'Asep Setiawan', departemen: 'Keuangan', jam_masuk: '07:58', jam_pulang: '17:02', status: 'Hadir', metode: 'Fingerprint', keterangan: '' },
  { id: '7', tanggal: '2026-08-08', nik: 'EMP002', nama: 'Ahmad Faisal', departemen: 'Program & Penyaluran', jam_masuk: '08:00', jam_pulang: '17:00', status: 'Hadir', metode: 'Mobile App', keterangan: '' },
  { id: '8', tanggal: '2026-08-08', nik: 'EMP003', nama: 'Siti Nurhaliza', departemen: 'Marketing & Fundraising', jam_masuk: '08:10', jam_pulang: '17:15', status: 'Hadir', metode: 'Fingerprint', keterangan: '' },
  { id: '9', tanggal: '2026-08-08', nik: 'EMP004', nama: 'Muhammad Rizki', departemen: 'Umum & IT', jam_masuk: '', jam_pulang: '', status: 'Cuti', metode: 'Manual', keterangan: 'Cuti tahunan' },
  { id: '10', tanggal: '2026-08-08', nik: 'EMP005', nama: 'Dewi Kartika', departemen: 'Umum & IT', jam_masuk: '08:05', jam_pulang: '17:00', status: 'Hadir', metode: 'Fingerprint', keterangan: '' }
];

// HCM — Aktivitas Harian & Progress (per-employee daily task tracker)
const defaultDailyActivities = [
  { id: '1', nik: 'EMP001', tanggal: '2026-08-09', kategori: 'Pekerjaan', judul: 'Rekonsiliasi Bank Harian', deskripsi: 'Cocokkan mutasi rekening BCA & Mandiri dengan jurnal kas', jam_mulai: '08:00', jam_selesai: '09:00', selesai: true },
  { id: '2', nik: 'EMP001', tanggal: '2026-08-09', kategori: 'Pekerjaan', judul: 'Review Pengajuan Kasbon', deskripsi: 'Periksa & setujui 3 pengajuan kasbon staf lapangan', jam_mulai: '09:00', jam_selesai: '10:00', selesai: true },
  { id: '3', nik: 'EMP001', tanggal: '2026-08-09', kategori: 'Pekerjaan', judul: 'Susun Laporan Arus Kas Mingguan', deskripsi: 'Kompilasi laporan arus kas untuk rapat manajemen', jam_mulai: '10:30', jam_selesai: '12:00', selesai: false, progress_current: 6, progress_total: 10, progress_unit: 'bagian' },
  { id: '4', nik: 'EMP001', tanggal: '2026-08-09', kategori: 'Kesehatan', judul: 'Olahraga Pagi', deskripsi: 'Jalan kaki keliling komplek sebelum berangkat kerja', jam_mulai: '05:30', jam_selesai: '06:00', selesai: true },
  { id: '5', nik: 'EMP001', tanggal: '2026-08-09', kategori: 'Pribadi', judul: 'Membaca Buku Manajemen Keuangan Syariah', deskripsi: 'Target baca 30 halaman per hari', jam_mulai: '20:00', jam_selesai: '21:00', selesai: false, progress_current: 15, progress_total: 30, progress_unit: 'halaman' },
  { id: '6', nik: 'EMP002', tanggal: '2026-08-09', kategori: 'Pekerjaan', judul: 'Survei Lokasi Penerima Manfaat', deskripsi: 'Kunjungan lapangan verifikasi calon penerima bantuan kesehatan', jam_mulai: '08:30', jam_selesai: '11:30', selesai: true },
  { id: '7', nik: 'EMP002', tanggal: '2026-08-09', kategori: 'Pekerjaan', judul: 'Input Data Penyaluran ke Sistem', deskripsi: 'Entry hasil survei ke modul Penyaluran Dana', jam_mulai: '13:00', jam_selesai: '14:30', selesai: false }
];

// Assets
const defaultAssets = [
  { id: '1', kode_aset: 'AST-INV-001', nama_aset: 'Laptop ASUS ROG Staf IT', tgl_beli: '2026-01-10', harga_perolehan: 15000000, masa_manfaat: 36, nilai_buku: 12500000, status: 'aktif' }
];

// Internal Transfers
const defaultInternalTransfers = [
  { id: '1', nomor_transfer: 'TRF-2026-000001', dari_rekening_id: '101.02.004.000', ke_rekening_id: '101.02.001.000', jumlah: 10000000, biaya_transfer: 6500, tgl_kirim: '2026-07-11', status: 'completed' }
];

// Bank Statements
const defaultBankStatements = [
  { id: '1', tgl: '2026-07-12', keterangan: 'QRIS SETTLEMENT XENDIT', mutasi: 'debet', nominal: 5000000, matched: true, matched_trans_id: '2607120935123456' },
  { id: '2', tgl: '2026-07-12', keterangan: 'TRANSFER VA BCA DONASI', mutasi: 'debet', nominal: 2500000, matched: true, matched_trans_id: '2607121015987654' },
  { id: '3', tgl: '2026-07-12', keterangan: 'BI-FAST MANDIRI REK CV SEMBAKO', mutasi: 'kredit', nominal: 15000000, matched: false }
];

// Accounting Periods
const defaultAccountingPeriods = [
  { id: '1', nama_periode: 'Mei 2026', status: 'closed', closed_at: '2026-05-31', closing_summary: 'Surplus: Rp 45.000.000' },
  { id: '2', nama_periode: 'Juni 2026', status: 'closed', closed_at: '2026-06-30', closing_summary: 'Surplus: Rp 22.100.000' },
  { id: '3', nama_periode: 'Juli 2026', status: 'open' }
];

// Campaign Budgets
const defaultCampaignBudgets = [
  { id: '1', campaign_id: 1, coa: '501.01.000.000', budget: 80000000, name: 'Bantuan Darurat Bencana Banjir' },
  { id: '2', campaign_id: 2, coa: '501.02.000.000', budget: 400000000, name: 'Pembangunan Masjid Pelosok' },
  { id: '3', campaign_id: 3, coa: '501.05.000.000', budget: 40000000, name: 'Beasiswa Santri Tahfidz' }
];

// Zakat Distributions
const defaultZakatDistributions = [
  { asnaf: 'fakir', jumlah_penerima: 50, jumlah_disalurkan: 15000000, lokasi_distribusi: 'Desa Suka Maju' },
  { asnaf: 'miskin', jumlah_penerima: 120, jumlah_disalurkan: 25000000, lokasi_distribusi: 'Kec. Bojong' }
];

// Zakat Amil Fee
const defaultZakatAmilFee = [
  { periode_bulan: 5, periode_tahun: 2026, total_zakat_diterima: 100000000, persentase_amil: 12.5, jumlah_amil: 12500000, jumlah_disalurkan: 12500000, status: 'disbursed' },
  { periode_bulan: 6, periode_tahun: 2026, total_zakat_diterima: 150000000, persentase_amil: 12.5, jumlah_amil: 18750000, jumlah_disalurkan: 0, status: 'approved' }
];

// Qurban Animals
const defaultQurbanAnimals = [
  { kode_hewan: 'QRB-2026-S001', jenis_hewan: 'sapi', berat_kg: 350, peserta_count: 7, kapasitas_peserta: 7, lokasi_sembelih: 'RPH Cibinong', total_biaya: 21000000, status: 'disembelih' },
  { kode_hewan: 'QRB-2026-K001', jenis_hewan: 'kambing', berat_kg: 25, peserta_count: 1, kapasitas_peserta: 1, lokasi_sembelih: 'Masjid Al-Barkah', total_biaya: 3500000, status: 'didistribusikan' }
];

// Grant Reports
const defaultGrantReports = [
  { grant_nama: 'Astra Foundation Scholarship', pemberi: 'Astra Foundation', jenis_laporan: 'Interim', deadline: '2026-06-30', submitted_at: '2026-06-25', status: 'accepted' },
  { grant_nama: 'Astra Foundation Scholarship', pemberi: 'Astra Foundation', jenis_laporan: 'Final', deadline: '2026-12-31', submitted_at: null, status: 'pending' }
];

// Anggaran Items (for Realisasi vs Anggaran)
const defaultAnggaranItems = [
  { campaign: 'Bantuan Darurat Bencana Banjir', anggaran: 80000000, realisasi: 45000000 },
  { campaign: 'Pembangunan Masjid Pelosok', anggaran: 400000000, realisasi: 350000000 },
  { campaign: 'Beasiswa Santri Tahfidz', anggaran: 40000000, realisasi: 25000000 }
];

// Bukti Realisasi (proof-of-disbursement records)
const defaultBuktiRealisasi = [];

// Laporan Pertanggungjawaban Penyaluran (LPJ)
const defaultLpjPenyaluran = [];

// Master Kurs Valas (daily FX rates)
const defaultKursValas = [
  { id: '1', mata_uang: 'USD', kurs: 16250, tgl_update: '2026-07-26' },
  { id: '2', mata_uang: 'EUR', kurs: 17600, tgl_update: '2026-07-26' }
];

// Report Settings (Pengaturan Laporan — CALK notes & report row mapping)
const defaultReportRows = [
  { id: 1, report: 'LPK', kode: 'LPK-01', nama: 'Kas dan Setara Kas', coa: '101.xx', sort: 1, active: true },
  { id: 2, report: 'LPK', kode: 'LPK-02', nama: 'Piutang Usaha', coa: '103.xx', sort: 2, active: true },
  { id: 3, report: 'LPK', kode: 'LPK-03', nama: 'Aset Tetap (Bersih)', coa: '102.xx', sort: 3, active: true },
  { id: 4, report: 'LPK', kode: 'LPK-04', nama: 'Hutang Usaha', coa: '201.xx', sort: 4, active: true },
  { id: 5, report: 'LPK', kode: 'LPK-05', nama: 'Dana Tidak Terikat', coa: '300.01', sort: 5, active: true },
  { id: 6, report: 'LPK', kode: 'LPK-06', nama: 'Dana Terikat Sementara', coa: '300.02', sort: 6, active: true },
  { id: 7, report: 'LPK', kode: 'LPK-07', nama: 'Dana Terikat Permanen', coa: '300.03', sort: 7, active: true },
  { id: 8, report: 'LPO', kode: 'LPO-01', nama: 'Donasi Kesehatan', coa: '401.01', sort: 1, active: true },
  { id: 9, report: 'LPO', kode: 'LPO-02', nama: 'Donasi Bencana', coa: '401.02', sort: 2, active: true },
  { id: 10, report: 'LPO', kode: 'LPO-03', nama: 'Sedekah Pangan', coa: '401.04', sort: 3, active: true },
  { id: 11, report: 'LPO', kode: 'LPO-04', nama: 'Zakat Profesi & Maal', coa: '401.05', sort: 4, active: true },
  { id: 12, report: 'LPO', kode: 'LPO-05', nama: 'Biaya Penyaluran Program', coa: '501.xx', sort: 5, active: true },
  { id: 13, report: 'LPO', kode: 'LPO-06', nama: 'Biaya Operasional', coa: '502.xx', sort: 6, active: true },
  { id: 14, report: 'LAK', kode: 'LAK-01', nama: 'Arus Kas Operasi', coa: '401-502', sort: 1, active: true },
  { id: 15, report: 'LAK', kode: 'LAK-02', nama: 'Arus Kas Investasi', coa: '102.xx', sort: 2, active: true },
  { id: 16, report: 'LAK', kode: 'LAK-03', nama: 'Arus Kas Pendanaan', coa: '300.xx', sort: 3, active: true }
];

const defaultCalkNotes = [
  { id: 1, nomor: 1, judul: 'Gambaran Umum Organisasi', periode: 'TA 2026', isi: 'LAZ Darul Hikam adalah Lembaga Amil Zakat yang bergerak di bidang penghimpunan dan penyaluran dana zakat, infaq, sedekah, dan dana sosial kemanusiaan lainnya. Didirikan berdasarkan akta notaris ...', status: 'draft' },
  { id: 2, nomor: 2, judul: 'Ikhtisar Kebijakan Akuntansi', periode: 'TA 2026', isi: 'Laporan keuangan disusun berdasarkan PSAK 45 tentang Pelaporan Keuangan Organisasi Nirlaba. Dasar penyusunan menggunakan basis akrual ...', status: 'final' },
  { id: 3, nomor: 3, judul: 'Kas dan Setara Kas', periode: 'TA 2026', isi: 'Kas dan setara kas terdiri dari kas di tangan, rekening giro, dan simpanan jangka pendek yang jatuh tempo dalam 3 bulan. Rincian per rekening bank ...', status: 'draft' },
  { id: 4, nomor: 4, judul: 'Aset Tetap', periode: 'TA 2026', isi: 'Aset tetap dicatat pada harga perolehan dikurangi akumulasi penyusutan. Penyusutan dihitung menggunakan metode garis lurus ...', status: 'final' },
  { id: 5, nomor: 5, judul: 'Dana Terikat', periode: 'TA 2026', isi: 'Dana terikat sementara terdiri dari sumbangan donor yang penggunaannya dibatasi oleh pemberi untuk tujuan tertentu. Dana terikat permanen berupa wakaf tanah dan gedung ...', status: 'draft' }
];

// --- HELPER WRITERS ---
const getStorageItem = (key, defaultVal) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : defaultVal;
};

const setStorageItem = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

// --- DATA ACCESS EXPORTS ---
export const getAccountingData = () => {
  return {
    penerimaan: getStorageItem('laz_penerimaan', defaultPenerimaan),
    pengeluaran: getStorageItem('laz_pengeluaran', defaultPengeluaran),
    saldo: getStorageItem('laz_saldo', defaultSaldo),
    opname: getStorageItem('laz_opname', defaultOpname),
    jurnalPenyesuaian: getStorageItem('laz_jurnal_penyesuaian', defaultJurnalPenyesuaian),
    beneficiaries: getStorageItem('laz_beneficiaries', defaultBeneficiaries),
    disbursementRequests: getStorageItem('laz_disbursement_requests', defaultDisbursementRequests),
    vendors: getStorageItem('laz_vendors', defaultVendors),
    purchaseOrders: getStorageItem('laz_purchase_orders', defaultPurchaseOrders),
    expenseRequests: getStorageItem('laz_expense_requests', defaultExpenseRequests),
    cashAdvances: getStorageItem('laz_cash_advances', defaultCashAdvances),
    grants: getStorageItem('laz_grants', defaultGrants),
    grantDisbursements: getStorageItem('laz_grant_disbursements', defaultGrantDisbursements),
    employees: getStorageItem('laz_employees', defaultEmployees),
    payrollPeriods: getStorageItem('laz_payroll_periods', defaultPayrollPeriods),
    attendance: getStorageItem('laz_attendance', defaultAttendance),
    dailyActivities: getStorageItem('laz_daily_activities', defaultDailyActivities),
    assets: getStorageItem('laz_assets', defaultAssets),
    internalTransfers: getStorageItem('laz_internal_transfers', defaultInternalTransfers),
    bankStatements: getStorageItem('laz_bank_statements', defaultBankStatements),
    accountingPeriods: getStorageItem('laz_accounting_periods', defaultAccountingPeriods),
    campaignBudgets: getStorageItem('laz_campaign_budgets', defaultCampaignBudgets),
    zakatDistributions: getStorageItem('laz_zakat_distributions', defaultZakatDistributions),
    zakatAmilFee: getStorageItem('laz_zakat_amil_fee', defaultZakatAmilFee),
    qurbanAnimals: getStorageItem('laz_qurban_animals', defaultQurbanAnimals),
    grantReports: getStorageItem('laz_grant_reports', defaultGrantReports),
    anggaranItems: getStorageItem('laz_anggaran_items', defaultAnggaranItems),
    buktiRealisasi: getStorageItem('laz_bukti_realisasi', defaultBuktiRealisasi),
    laporanPertanggungjawaban: getStorageItem('laz_lpj_penyaluran', defaultLpjPenyaluran),
    kursValas: getStorageItem('laz_kurs_valas', defaultKursValas),
    reportRows: getStorageItem('laz_report_rows', defaultReportRows),
    calkNotes: getStorageItem('laz_calk_notes', defaultCalkNotes)
  };
};

export const updateAccountingData = (key, data) => {
  setStorageItem(key, data);
};

// --- INTEGRATION MUTATORS (TRIGGERS) ---

// 1. Disbursement triggered when status is updated to 'disbursed'
export const disburseRequestAction = (requestId, coaKreditCode) => {
  const data = getAccountingData();
  const reqIndex = data.disbursementRequests.findIndex(r => r.id === requestId);
  if (reqIndex === -1) return;

  const req = data.disbursementRequests[reqIndex];
  if (req.status === 'disbursed') return;

  // Generate Transaction
  const transId = generateIdTrans('DSB');
  const newTransaction = {
    id: String(data.pengeluaran.length + 1),
    id_trans: transId,
    tgl: new Date().toISOString(),
    vendor: req.judul,
    kategori: 'logistik',
    coa: req.coa_debet,
    nominal: req.jumlah_disetujui || req.jumlah_diajukan,
    status: 'PAID',
    coa_bayar: coaKreditCode || req.coa_kredit,
    note: `Pencairan ${req.nomor_pengajuan} - ${req.judul}`
  };

  // Adjust balance
  const amount = newTransaction.nominal;
  const updatedSaldo = data.saldo.map(acc => {
    if (acc.coa === newTransaction.coa_bayar) {
      return { ...acc, saldo: acc.saldo - amount };
    }
    return acc;
  });

  // Update disbursement status
  const updatedRequests = [...data.disbursementRequests];
  updatedRequests[reqIndex] = {
    ...req,
    status: 'disbursed',
    tgl_realisasi: new Date().toISOString(),
    fins_trans_id: newTransaction.id,
    coa_kredit: coaKreditCode || req.coa_kredit
  };

  setStorageItem('laz_disbursement_requests', updatedRequests);
  setStorageItem('laz_pengeluaran', [newTransaction, ...data.pengeluaran]);
  setStorageItem('laz_saldo', updatedSaldo);
};

// 2. Expense request payment trigger
export const payExpenseAction = (expenseId, coaKreditCode) => {
  const data = getAccountingData();
  const expIndex = data.expenseRequests.findIndex(e => e.id === expenseId);
  if (expIndex === -1) return;

  const exp = data.expenseRequests[expIndex];
  if (exp.status === 'paid') return;

  // Create financial transaction
  const transId = generateIdTrans('EXP');
  const newTransaction = {
    id: String(data.pengeluaran.length + 1),
    id_trans: transId,
    tgl: new Date().toISOString(),
    vendor: exp.judul,
    kategori: 'jasa',
    coa: exp.coa_debet,
    nominal: exp.total_amount,
    status: 'PAID',
    coa_bayar: coaKreditCode || exp.coa_kredit,
    note: `Bayar ${exp.nomor_expense} - ${exp.judul}`
  };

  // Adjust balance
  const amount = newTransaction.nominal;
  const updatedSaldo = data.saldo.map(acc => {
    if (acc.coa === newTransaction.coa_bayar) {
      return { ...acc, saldo: acc.saldo - amount };
    }
    return acc;
  });

  // Update expense status
  const updatedExpenses = [...data.expenseRequests];
  updatedExpenses[expIndex] = {
    ...exp,
    status: 'paid',
    tgl_bayar: new Date().toISOString(),
    fins_trans_id: newTransaction.id,
    coa_kredit: coaKreditCode || exp.coa_kredit
  };

  setStorageItem('laz_expense_requests', updatedExpenses);
  setStorageItem('laz_pengeluaran', [newTransaction, ...data.pengeluaran]);
  setStorageItem('laz_saldo', updatedSaldo);
};

// 3. Cash advance payment trigger (Disburse advance)
export const disburseCashAdvanceAction = (advanceId, coaKreditCode) => {
  const data = getAccountingData();
  const advIndex = data.cashAdvances.findIndex(c => c.id === advanceId);
  if (advIndex === -1) return;

  const adv = data.cashAdvances[advIndex];
  if (adv.status !== 'active' && adv.status !== 'overdue') return;

  // We record this as a temporary receivable (staf cash advance)
  const transId = generateIdTrans('CSB');
  const newTransaction = {
    id: String(data.pengeluaran.length + 1),
    id_trans: transId,
    tgl: new Date().toISOString(),
    vendor: `Kasbon: ${adv.nama_staf}`,
    kategori: 'lainnya',
    coa: '101.04.001.000', // Piutang Staf
    nominal: adv.jumlah_advance,
    status: 'PAID',
    coa_bayar: coaKreditCode || '101.02.001.000', // default BCA
    note: `Pencairan Kasbon ${adv.nomor_kasbon} - ${adv.tujuan}`
  };

  // Adjust balance
  const amount = newTransaction.nominal;
  const updatedSaldo = data.saldo.map(acc => {
    if (acc.coa === newTransaction.coa_bayar) {
      return { ...acc, saldo: acc.saldo - amount };
    }
    return acc;
  });

  setStorageItem('laz_pengeluaran', [newTransaction, ...data.pengeluaran]);
  setStorageItem('laz_saldo', updatedSaldo);
};

// 4. Cash advance settlement trigger
export const settleCashAdvanceAction = (advanceId, realisasi, kembalian) => {
  const data = getAccountingData();
  const advIndex = data.cashAdvances.findIndex(c => c.id === advanceId);
  if (advIndex === -1) return;

  const adv = data.cashAdvances[advIndex];
  
  // Realisasi expense
  const transIdExp = generateIdTrans('EXP');
  const newTransactionExp = {
    id: String(data.pengeluaran.length + 1),
    id_trans: transIdExp,
    tgl: new Date().toISOString(),
    vendor: `Realisasi Kasbon: ${adv.nama_staf}`,
    kategori: 'jasa',
    coa: '502.03.000.000', // Biaya Ops
    nominal: realisasi,
    status: 'PAID',
    coa_bayar: '101.04.001.000', // Settled from staff receivable
    note: `Realisasi Kasbon ${adv.nomor_kasbon} - ${adv.tujuan}`
  };

  // If there is cash returned, record a debit to Cash Pusat and credit to Piutang Staf
  let updatedSaldo = [...data.saldo];
  if (kembalian > 0) {
    // Add to cash balance
    updatedSaldo = updatedSaldo.map(acc => {
      if (acc.coa === '101.01.001.000') { // Kas Pusat
        return { ...acc, saldo: acc.saldo + kembalian };
      }
      return acc;
    });

    const transIdReturn = generateIdTrans('RCV');
    const returnTrx = {
      id: String(data.penerimaan.length + 1),
      id_trans: transIdReturn,
      tgl: new Date().toISOString(),
      donatur: adv.nama_staf,
      channel: 'Kas Pusat',
      coa: '101.04.001.000', // credit to piutang
      nominal: kembalian,
      status: 'PAID',
      note: `Kembalian sisa kasbon ${adv.nomor_kasbon}`
    };
    setStorageItem('laz_penerimaan', [returnTrx, ...data.penerimaan]);
  }

  // Update status
  const updatedAdvances = [...data.cashAdvances];
  updatedAdvances[advIndex] = {
    ...adv,
    status: 'settled',
    tgl_settlement: new Date().toISOString().substring(0, 10),
    jumlah_direalisasi: realisasi,
    jumlah_dikembalikan: kembalian,
    sisa_kasbon: 0
  };

  setStorageItem('laz_cash_advances', updatedAdvances);
  setStorageItem('laz_pengeluaran', [newTransactionExp, ...data.pengeluaran]);
  setStorageItem('laz_saldo', updatedSaldo);
};

// 5. Depreciation schedule post trigger (AJE)
export const postDepreciationAction = (assetId, monthlyDep) => {
  const data = getAccountingData();

  const ajeId = String(data.jurnalPenyesuaian.length + 1);
  const newAje = {
    id: ajeId,
    period: 'Juli 2026',
    jenis_aje: 'depresiasi',
    keterangan: `Penyusutan Aset AJE #${assetId}`,
    coa_debet: '502.05.000.000', // Beban Penyusutan
    coa_kredit: '102.01.001.000', // Akumulasi penyusutan
    nominal: monthlyDep,
    nik_input: 'STF001',
    approved_by: 'MGR001',
    approved_at: new Date().toISOString()
  };

  // Reduce the asset's own book value (nilai_buku) by the posted depreciation
  const updatedAssets = data.assets.map(a => {
    if (a.id === assetId) {
      const newNilaiBuku = Math.max(0, (a.nilai_buku ?? a.harga_perolehan) - monthlyDep);
      return {
        ...a,
        nilai_buku: newNilaiBuku,
        status: newNilaiBuku <= 0 ? 'fully_depreciated' : a.status
      };
    }
    return a;
  });

  setStorageItem('laz_jurnal_penyesuaian', [newAje, ...data.jurnalPenyesuaian]);
  setStorageItem('laz_assets', updatedAssets);
};

// 6. Internal bank transfer completion trigger
export const executeInternalTransferAction = (transferId) => {
  const data = getAccountingData();
  const tfIndex = data.internalTransfers.findIndex(t => t.id === transferId);
  if (tfIndex === -1) return;

  const tf = data.internalTransfers[tfIndex];
  if (tf.status === 'completed') return;

  // Deduct from sender bank
  let updatedSaldo = data.saldo.map(acc => {
    if (acc.coa === tf.dari_rekening_id) {
      return { ...acc, saldo: acc.saldo - tf.jumlah - tf.biaya_transfer };
    }
    if (acc.coa === tf.ke_rekening_id) {
      return { ...acc, saldo: acc.saldo + tf.jumlah };
    }
    return acc;
  });

  // Record transfer out
  const newOut = {
    id: String(data.pengeluaran.length + 1),
    id_trans: generateIdTrans('TRF'),
    tgl: new Date().toISOString(),
    vendor: 'Transfer Internal Out',
    kategori: 'lainnya',
    coa: '101.05.001.000', // Kas Transit
    nominal: tf.jumlah,
    status: 'PAID',
    coa_bayar: tf.dari_rekening_id,
    note: `Transfer keluar no: ${tf.nomor_transfer}${tf.keterangan ? ' - ' + tf.keterangan : ''}`
  };

  // Record transfer in
  const newIn = {
    id: String(data.penerimaan.length + 1),
    id_trans: generateIdTrans('TRF'),
    tgl: new Date().toISOString(),
    donatur: 'Transfer Internal In',
    channel: 'Transfer Bank',
    coa: '101.05.001.000', // Kas Transit
    nominal: tf.jumlah,
    status: 'PAID',
    note: `Transfer masuk no: ${tf.nomor_transfer}${tf.keterangan ? ' - ' + tf.keterangan : ''}`
  };

  // Record transfer fee
  let updatedExpenses = [...data.pengeluaran];
  if (tf.biaya_transfer > 0) {
    const feeTrx = {
      id: String(data.pengeluaran.length + 2),
      id_trans: generateIdTrans('FEE'),
      tgl: new Date().toISOString(),
      vendor: 'Bank Transfer Fee',
      kategori: 'jasa',
      coa: '502.01.000.000', // Biaya PG / Admin bank
      nominal: tf.biaya_transfer,
      status: 'PAID',
      coa_bayar: tf.dari_rekening_id,
      note: `Biaya transfer no: ${tf.nomor_transfer}`
    };
    updatedExpenses.unshift(feeTrx);
  }

  // Update status
  const updatedTfs = [...data.internalTransfers];
  updatedTfs[tfIndex] = {
    ...tf,
    status: 'completed',
    tgl_diterima: new Date().toISOString().substring(0, 10)
  };

  setStorageItem('laz_internal_transfers', updatedTfs);
  setStorageItem('laz_pengeluaran', [newOut, ...updatedExpenses]);
  setStorageItem('laz_penerimaan', [newIn, ...data.penerimaan]);
  setStorageItem('laz_saldo', updatedSaldo);
};

// 7. Purchase Order settlement (pay off outstanding balance after DP)
export const payPurchaseOrderAction = (poId, coaBayar) => {
  const data = getAccountingData();
  const poIndex = data.purchaseOrders.findIndex(po => po.id === poId);
  if (poIndex === -1) return;

  const po = data.purchaseOrders[poIndex];
  if (po.status === 'paid') return;

  const outstanding = po.total_amount - (po.dp_amount || 0);
  const vendor = data.vendors.find(v => v.id === po.vendor_id);

  const transId = generateIdTrans('POB');
  const newTransaction = {
    id: String(data.pengeluaran.length + 1),
    id_trans: transId,
    tgl: new Date().toISOString(),
    vendor: vendor?.nama_vendor || po.judul,
    kategori: vendor?.kategori || 'barang',
    coa: '201.03.000.000', // Hutang Usaha settled
    nominal: outstanding,
    status: 'PAID',
    coa_bayar: coaBayar,
    note: `Pelunasan ${po.nomor_po} - ${po.judul}`
  };

  const updatedSaldo = data.saldo.map(acc =>
    acc.coa === coaBayar ? { ...acc, saldo: acc.saldo - outstanding } : acc
  );

  const updatedPOs = [...data.purchaseOrders];
  updatedPOs[poIndex] = { ...po, status: 'paid', dp_amount: po.total_amount, tgl_lunas: new Date().toISOString().substring(0, 10) };

  setStorageItem('laz_purchase_orders', updatedPOs);
  setStorageItem('laz_pengeluaran', [newTransaction, ...data.pengeluaran]);
  setStorageItem('laz_saldo', updatedSaldo);
};

// 8. Payroll disburse trigger
export const disbursePayrollAction = (periodId, totalPayroll) => {
  const data = getAccountingData();
  const pIndex = data.payrollPeriods.findIndex(p => p.id === periodId);
  if (pIndex === -1) return;

  const p = data.payrollPeriods[pIndex];
  if (p.status === 'disbursed') return;

  // Create financial transaction
  const transId = generateIdTrans('PAY');
  const newTransaction = {
    id: String(data.pengeluaran.length + 1),
    id_trans: transId,
    tgl: new Date().toISOString(),
    vendor: `Pembayaran Gaji Karyawan`,
    kategori: 'jasa',
    coa: '502.04.000.000', // Biaya Gaji
    nominal: totalPayroll,
    status: 'PAID',
    coa_bayar: '101.02.001.000', // BCA
    note: `Pembayaran Payroll Gaji Periode ${p.periode}`
  };

  // Adjust bank balance
  const updatedSaldo = data.saldo.map(acc => {
    if (acc.coa === '101.02.001.000') {
      return { ...acc, saldo: acc.saldo - totalPayroll };
    }
    return acc;
  });

  // Update payroll period status
  const updatedPeriods = [...data.payrollPeriods];
  updatedPeriods[pIndex] = {
    ...p,
    status: 'disbursed',
    tgl_bayar: new Date().toISOString()
  };

  setStorageItem('laz_payroll_periods', updatedPeriods);
  setStorageItem('laz_pengeluaran', [newTransaction, ...data.pengeluaran]);
  setStorageItem('laz_saldo', updatedSaldo);
};
