// --- SEED DATA FOR FINS > HOME > PENGELUARAN ---

export const JENIS_TRANSAKSI_PENGELUARAN = [
  { coa: '501.01.002.003', nama: 'Fakir Miskin Kesehatan' },
  { coa: '501.01.006.005', nama: 'Penyaluran Zakat untuk Fisabilillah' },
  { coa: '502.03.001.000', nama: 'Penyaluran Infaq/Shadaqah Tidak Terikat' },
  { coa: '502.03.002.000', nama: 'Penyaluran ITT Dakwah Sosial' },
  { coa: '503.01.001.000', nama: 'Hak Amil Pokok' },
  { coa: '503.03.002.000', nama: 'Beban Administrasi Bank' }
];

export const CURRENT_USER = { id: '1032021001001', nama: 'Asep Saepul' };

// Simulasi jabatan approver yang sedang login untuk Pengeluaran, dipakai untuk
// menampilkan & memvalidasi batas "Level Approve" (ambil rentang expendMin/Max
// dari FINS > Level Approve supaya konsisten dengan menu tsb).
export const CURRENT_APPROVER_JABATAN = 'Direktur';

export const INITIAL_PENGELUARAN = [
  // --- Mutasi masuk ke BSI Penyaluran 8889292939 (dari akun lain) ---
  { id: '1', idBuku: 'K0012608050090003', tanggal: '2026-08-05', coaDebet: '101.02.002.005', coaKredit: '101.01.001.000', namaAkun: 'BSI Penyaluran 8889292939', keterangan: 'SETOR PENERIMAAN', quantity: 1, nominal: 51190800, userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', status: 'approved', referensi: '', program: '', officeId: '1', noResi: '726080500100001', isMutasi: true },
  { id: '2', idBuku: 'K0012608050010004', tanggal: '2026-08-05', coaDebet: '101.02.002.005', coaKredit: '101.02.002.007', namaAkun: 'BSI Penyaluran 8889292939', keterangan: 'SALDO JUNI 2026', quantity: 1, nominal: 2810161.46, userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', status: 'approved', referensi: '', program: '', officeId: '1', noResi: '726080500100002', isMutasi: true },
  { id: '3', idBuku: 'K0012608050020004', tanggal: '2026-08-05', coaDebet: '101.02.002.005', coaKredit: '101.02.002.009', namaAkun: 'BSI Penyaluran 8889292939', keterangan: 'SALDO JUNI 2026', quantity: 1, nominal: 4520328.52, userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', status: 'approved', referensi: '', program: '', officeId: '1', noResi: '726080500100002', isMutasi: true },

  // --- Penyaluran program (dibayar dari BSI Penyaluran 8889292939) ---
  { id: '4', idBuku: 'E001260806001013', tanggal: '2026-08-05', coaDebet: '501.01.002.003', coaKredit: '101.02.002.005', namaAkun: 'Fakir Miskin Kesehatan', keterangan: 'Penyuluhan Scabies | Kesehatan', quantity: 1, nominal: 1070000, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', referensi: 'Penyuluhan Scabies', program: 'Fakir Miskin Kesehatan', officeId: '1', noResi: '42608060000001', isMutasi: false },
  { id: '5', idBuku: 'E001260806001012', tanggal: '2026-08-05', coaDebet: '501.01.006.005', coaKredit: '101.02.002.005', namaAkun: 'Penyaluran Zakat untuk Fisabilillah', keterangan: 'Khutbah Jumat Jatinangor Kang Diar', quantity: 1, nominal: 250000, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', referensi: 'Khutbah Jumat Jatinangor', program: 'Penyaluran Fisabilillah Dakwah', officeId: '1', noResi: '42608060000002', isMutasi: false },
  { id: '6', idBuku: 'E001260806001011', tanggal: '2026-08-05', coaDebet: '501.01.006.005', coaKredit: '101.02.002.005', namaAkun: 'Penyaluran Zakat untuk Fisabilillah', keterangan: 'Khutbah Jumat Arjasari Ust Priyatna', quantity: 1, nominal: 750000, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', referensi: 'Khutbah Jumat Arjasari', program: 'Penyaluran Fisabilillah Dakwah', officeId: '1', noResi: '42608060000003', isMutasi: false },
  { id: '7', idBuku: 'E001260806001010', tanggal: '2026-08-05', coaDebet: '502.03.001.000', coaKredit: '101.02.002.005', namaAkun: 'Penyaluran Infaq/Shadaqah Tidak Terikat', keterangan: 'MT Jatinangor Ust Ibnu | Dakwah', quantity: 1, nominal: 250000, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', referensi: 'MT Jatinangor', program: 'Majelis Talim', officeId: '1', noResi: '42608060000004', isMutasi: false },
  { id: '8', idBuku: 'E001260806001009', tanggal: '2026-08-05', coaDebet: '502.03.001.000', coaKredit: '101.02.002.005', namaAkun: 'Penyaluran Infaq/Shadaqah Tidak Terikat', keterangan: 'MPI KBP | Dakwah', quantity: 1, nominal: 8550000, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', referensi: 'MPI Special Weekday', program: 'Majelis Percikan Iman', officeId: '1', noResi: '42608060000005', isMutasi: false },
  { id: '9', idBuku: 'E001260806001008', tanggal: '2026-08-05', coaDebet: '502.03.001.000', coaKredit: '101.02.002.005', namaAkun: 'Penyaluran Infaq/Shadaqah Tidak Terikat', keterangan: 'MPI Arjasari | Dakwah', quantity: 1, nominal: 14700000, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', referensi: 'Majelis Percikan Iman', program: 'Majelis Percikan Iman', officeId: '1', noResi: '42608060000006', isMutasi: false },
  { id: '10', idBuku: 'E001260806001007', tanggal: '2026-08-05', coaDebet: '502.03.002.000', coaKredit: '101.02.002.005', namaAkun: 'Penyaluran ITT Dakwah Sosial', keterangan: 'Masjid Nugraha Cihaurgeulis | Dakwah', quantity: 1, nominal: 2500000, userInput: 'Auliya Putri', userApprove: 'Desy Bunga Sari', status: 'approved', referensi: 'Masjid Bersinar', program: 'Masjid Bersinar (ISTT)', officeId: '1', noResi: '42608060000007', isMutasi: false },

  // --- Belum diapprove, untuk mendemokan workflow approval ---
  { id: '11', idBuku: 'E001260809001001', tanggal: '2026-08-09', coaDebet: '503.03.002.000', coaKredit: '101.01.001.000', namaAkun: 'Beban Administrasi Bank', keterangan: 'Biaya materai kwitansi Agustus', quantity: 1, nominal: 30000, userInput: 'Asep Saepul', userApprove: '', status: 'unapprove', referensi: '', program: '', officeId: '1', noResi: '', isMutasi: false },
  { id: '12', idBuku: 'E001260809001002', tanggal: '2026-08-09', coaDebet: '501.01.006.005', coaKredit: '101.01.001.000', namaAkun: 'Penyaluran Zakat untuk Fisabilillah', keterangan: 'Bantuan renovasi musholla Al-Ikhlas', quantity: 1, nominal: 6000000, userInput: 'Asep Saepul', userApprove: '', status: 'unapprove', referensi: '', program: 'Penyaluran Fisabilillah Dakwah', officeId: '1', noResi: '', isMutasi: false }
];

let idBukuExpenseCounter = 13;
export const generateIdBukuExpense = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(idBukuExpenseCounter++).padStart(3, '0');
  return `E00${yy}${mm}${dd}${seq}0001`;
};

let idBukuMutasiCounter = 1;
export const generateIdBukuMutasi = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(idBukuMutasiCounter++).padStart(3, '0');
  return `K00${yy}${mm}${dd}${seq}0001`;
};
