// --- SEED DATA FOR FINS > HOME > PENGAJUAN CA (Cash Advance) ---

export const JENIS_TRANSAKSI_CA = [
  { coa: '101.10.000.000', nama: 'Uang Muka Kegiatan Program' },
  { coa: '101.10.001.000', nama: 'Uang Muka Perjalanan Dinas' },
  { coa: '101.10.002.000', nama: 'Uang Muka Operasional Kantor' },
  { coa: '101.10.003.000', nama: 'Uang Muka Pembelian Logistik' }
];

export const CURRENT_USER = { id: '1032021001001', nama: 'Asep Saepul', jabatan: 'Direktur Utama' };

// Jabatan approver yang sedang login untuk Pengajuan CA, dipakai untuk
// menampilkan & memvalidasi batas "Level Approve" (ambil rentang expendMin/Max
// dari FINS > Level Approve supaya konsisten dengan menu tsb).
export const CURRENT_APPROVER_JABATAN = 'Direktur';

export const INITIAL_PENGAJUAN_CA = [
  // --- Sudah approved & sudah dipertanggungjawabkan penuh ---
  { id: '1', idBuku: 'CA002608010010001', tanggal: '2026-08-01', coaDebet: '101.10.001.000', coaKredit: '101.01.001.000', namaAkun: 'Uang Muka Perjalanan Dinas', keterangan: 'Survey lokasi bencana banjir Cianjur', quantity: 1, nominal: 3000000, realisasi: 3000000, userInput: 'Ahmad Faisal', userApprove: 'Irfan Abdurrahman', status: 'approved', officeId: '1', sumberDana: 'Infak / Sedekah', departmentId: '2' },

  // --- Sudah approved, belum dipertanggungjawabkan (masih outstanding) ---
  { id: '2', idBuku: 'CA002608050020001', tanggal: '2026-08-05', coaDebet: '101.10.003.000', coaKredit: '101.02.002.005', namaAkun: 'Uang Muka Pembelian Logistik', keterangan: 'Pembelian sembako paket Ramadhan tahap 2', quantity: 1, nominal: 12000000, realisasi: 0, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', officeId: '1', sumberDana: 'Zakat', departmentId: '1' },
  { id: '3', idBuku: 'CA002608070030001', tanggal: '2026-08-07', coaDebet: '101.10.000.000', coaKredit: '101.01.001.000', namaAkun: 'Uang Muka Kegiatan Program', keterangan: 'Operasional Majelis Talim Jatinangor Agustus', quantity: 1, nominal: 1500000, realisasi: 750000, userInput: 'Auliya Putri', userApprove: 'Irfan Abdurrahman', status: 'approved', officeId: '1', sumberDana: 'Infak / Sedekah', departmentId: '1' },

  // --- Ditolak ---
  { id: '4', idBuku: 'CA002608080040001', tanggal: '2026-08-08', coaDebet: '101.10.002.000', coaKredit: '101.01.001.000', namaAkun: 'Uang Muka Operasional Kantor', keterangan: 'Pembelian ATK tambahan kantor cabang', quantity: 1, nominal: 800000, realisasi: 0, userInput: 'Aulia Anugraha', userApprove: 'Desy Bunga Sari', status: 'rejected', officeId: '2', sumberDana: 'Infak / Sedekah', departmentId: '1' },

  // --- Belum diapprove, untuk mendemokan workflow approval ---
  { id: '5', idBuku: 'CA002608090050001', tanggal: '2026-08-09', coaDebet: '101.10.001.000', coaKredit: '101.01.001.000', namaAkun: 'Uang Muka Perjalanan Dinas', keterangan: 'Kunjungan mustahik penerima beasiswa Bandung', quantity: 1, nominal: 950000, realisasi: 0, userInput: 'Asep Saepul', userApprove: '', status: 'unapprove', officeId: '1', sumberDana: 'Zakat', departmentId: '2' },
  { id: '6', idBuku: 'CA002608090060001', tanggal: '2026-08-09', coaDebet: '101.10.000.000', coaKredit: '101.01.001.000', namaAkun: 'Uang Muka Kegiatan Program', keterangan: 'Penyuluhan kesehatan warga Desa Suka Maju', quantity: 1, nominal: 2200000, realisasi: 0, userInput: 'Asep Saepul', userApprove: '', status: 'unapprove', officeId: '1', sumberDana: 'Zakat', departmentId: '2' }
];

let idBukuCaCounter = 7;
export const generateIdBukuCa = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(idBukuCaCounter++).padStart(3, '0');
  return `CA00${yy}${mm}${dd}${seq}0001`;
};
