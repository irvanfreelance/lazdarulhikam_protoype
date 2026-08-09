// --- SEED DATA FOR FINS > AKUNTANSI > REKAP JURNAL ---

// Akun yang tersedia untuk dipilih sebagai "Jenis Transaksi" saat menambah
// baris Jurnal Penyesuaian — akun leaf (siap posting) dari Chart of Accounts.
export const JURNAL_COA_OPTIONS = [
  { coa: '101.01.000.000', nama: 'Kas Pusat' },
  { coa: '101.02.000.000', nama: 'Bank' },
  { coa: '101.03.000.000', nama: 'Piutang Donatur' },
  { coa: '102.01.000.000', nama: 'Aset Inventaris' },
  { coa: '102.01.001.000', nama: 'Akumulasi Penyusutan Aset Tetap' },
  { coa: '201.01.000.000', nama: 'Titipan Dana Zakat' },
  { coa: '301.01.000.000', nama: 'Dana Zakat' },
  { coa: '302.01.000.000', nama: 'Dana Infaq / Sedekah Terikat' },
  { coa: '302.02.000.000', nama: 'Dana Infaq/Sedekah Tidak Terikat' },
  { coa: '303.01.000.000', nama: 'Dana Amil' },
  { coa: '401.01.000.000', nama: 'Zakat Profesi & Maal' },
  { coa: '402.01.000.000', nama: 'Infak Umum' },
  { coa: '501.01.000.000', nama: 'Penyaluran Zakat Fakir Miskin' },
  { coa: '502.01.000.000', nama: 'Gaji Karyawan' },
  { coa: '502.02.000.000', nama: 'Biaya Kantor' },
  { coa: '502.03.000.000', nama: 'Beban Penyusutan Aset Tetap' },
  { coa: '5.03.008', nama: 'Biaya Konsumsi Kegiatan' },
];

const coaNama = (coa) => JURNAL_COA_OPTIONS.find(c => c.coa === coa)?.nama || coa;

// Setiap transaksi = 2 baris (Debet & Kredit) berbagi idBuku + idJurnal yang
// sama, meniru pasangan double-entry seperti pada modul lain (Penerimaan dsb).
const pair = (idx, tanggal, idBuku, sourceType, jenisTransaksi, coaDebet, coaKredit, nominal, keterangan, program, viaImport = false) => {
  const idJurnalDebet = `2607${String(idx).padStart(2, '0')}0758${String(200000 + idx * 2).padStart(6, '0')}`;
  const idJurnalKredit = `2607${String(idx).padStart(2, '0')}0758${String(200001 + idx * 2).padStart(6, '0')}`;
  const jurnalGroupId = idBuku;
  const base = {
    idBuku, jurnalGroupId, tanggal, jenisTransaksi, keterangan, program,
    viaJurnal: 'Otomatis', viaImport, userInput: 'Aulia Anugraha', officeId: '1', sourceType,
    note: `${sourceType === 'penerimaan' ? 'R' : sourceType === 'pengeluaran' ? 'B' : 'CA'}${idx}`,
  };
  return [
    { ...base, id: `${idBuku}-D`, coa: coaDebet, namaAkun: coaNama(coaDebet), debet: nominal, kredit: 0, idJurnal: idJurnalDebet },
    { ...base, id: `${idBuku}-K`, coa: coaKredit, namaAkun: coaNama(coaKredit), debet: 0, kredit: nominal, idJurnal: idJurnalKredit },
  ];
};

export const INITIAL_JURNAL = [
  ...pair(1, '2026-07-27', 'R9001270727010001', 'penerimaan', 'Penerimaan Zakat Harta Individual', '101.02.000.000', '401.01.000.000', 5000000, 'an: Budi Santoso | Zakat Maal', 'Zakat Profesi & Maal'),
  ...pair(2, '2026-07-28', 'R9001270728020001', 'penerimaan', 'Penerimaan Infaq/Sedekah', '101.01.000.000', '402.01.000.000', 2000000, 'an: Hamba Allah | Infak', 'Donasi Kemanusiaan'),
  ...pair(3, '2026-07-29', 'B9001270729030001', 'pengeluaran', 'Penyaluran Zakat untuk Mustahik', '501.01.000.000', '101.02.000.000', 3000000, 'an: M Togar Mulya Raja | Zakat Fakir Miskin', 'Zakat Profesi & Maal'),
  ...pair(4, '2026-07-30', 'B9001270730040001', 'pengeluaran', 'Pembayaran Gaji Karyawan', '502.01.000.000', '101.02.000.000', 8000000, 'Gaji periode Juli 2026', ''),
  ...pair(5, '2026-07-31', 'B9001270731050001', 'pengeluaran', 'Biaya Operasional Kantor', '502.02.000.000', '101.01.000.000', 1200000, 'ATK & listrik kantor pusat', ''),
  ...pair(6, '2026-08-01', 'R9001270801060001', 'penerimaan', 'Penerimaan Infaq Kemanusiaan', '101.02.000.000', '402.01.000.000', 3500000, 'BSI Infak Kemanusiaan 8809998844', 'Donasi Kemanusiaan', true),
  ...pair(7, '2026-08-02', 'R9001270802070001', 'penerimaan', 'Piutang Zakat (Pledge)', '101.03.000.000', '401.01.000.000', 1000000, 'an: PT Sejahtera Abadi | janji zakat', 'Zakat Profesi & Maal'),
  ...pair(8, '2026-08-03', 'CA9001270803080001', 'pengajuan_ca', 'Pengembalian Titipan Dana Zakat', '201.01.000.000', '101.01.000.000', 500000, 'Pengembalian titipan an: Siti Aminah', '', true),
  ...pair(9, '2026-08-04', 'B9001270804090001', 'pengeluaran', 'Biaya Konsumsi Kegiatan', '5.03.008', '101.02.000.000', 750000, 'untuk masjid jatinangor - kegiatan sosial', 'Wakaf Produktif'),
  ...pair(10, '2026-08-05', 'B9001270805100001', 'pengeluaran', 'Pembelian Aset Inventaris', '102.01.000.000', '101.02.000.000', 2500000, 'Laptop operasional tim IT', ''),
];

let jurnalSeq = 11;
export const generateJurnalIds = (prefix = 'J') => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(jurnalSeq++).padStart(4, '0');
  const idBuku = `${prefix}${yy}${mm}${dd}${seq}0001`;
  const idJurnalOf = (n) => `${yy}${mm}${dd}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${seq}${n}`;
  return { idBuku, idJurnalOf };
};
