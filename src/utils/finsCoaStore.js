// --- SEED DATA FOR CHART OF ACCOUNTS, COA KANTOR, SALDO DANA, LEVEL APPROVE, RUMUS REPORT ---

export const INITIAL_COA = [
  { id: '1', coa: '100.00.000.000', nama: 'AKTIVA', parentCoa: null, group: 'Aset', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '2', coa: '200.00.000.000', nama: 'KEWAJIBAN', parentCoa: null, group: 'Kewajiban', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '3', coa: '300.00.000.000', nama: 'SALDO DANA', parentCoa: null, group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '4', coa: '400.00.000.000', nama: 'PENERIMAAN', parentCoa: null, group: 'Penerimaan', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '5', coa: '500.00.000.000', nama: 'BEBAN', parentCoa: null, group: 'Beban', officeId: '', positionId: '', aktif: true, includeBuku: false },

  { id: '6', coa: '101.00.000.000', nama: 'Aset Lancar', parentCoa: '100.00.000.000', group: 'Aset', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '7', coa: '102.00.000.000', nama: 'Aset Tidak Lancar', parentCoa: '100.00.000.000', group: 'Aset', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '8', coa: '201.00.000.000', nama: 'Kewajiban Jangka Pendek', parentCoa: '200.00.000.000', group: 'Kewajiban', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '9', coa: '301.00.000.000', nama: 'Dana Zakat', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '10', coa: '302.00.000.000', nama: 'Dana Infaq/Sedekah', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '29', coa: '303.00.000.000', nama: 'Dana Amil', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '30', coa: '304.00.000.000', nama: 'Dana Hibah', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '31', coa: '305.00.000.000', nama: 'Dana APBN/APBD', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '32', coa: '306.00.000.000', nama: 'Dana Yang Dilarang Syariah', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '33', coa: '307.00.000.000', nama: 'Dana Wakaf', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '34', coa: '308.00.000.000', nama: 'Dana DSKL', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '11', coa: '401.00.000.000', nama: 'Penerimaan Zakat', parentCoa: '400.00.000.000', group: 'Penerimaan', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '12', coa: '402.00.000.000', nama: 'Penerimaan Infak/Sedekah', parentCoa: '400.00.000.000', group: 'Penerimaan', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '13', coa: '501.00.000.000', nama: 'Beban Penyaluran', parentCoa: '500.00.000.000', group: 'Beban', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '14', coa: '502.00.000.000', nama: 'Beban Operasional', parentCoa: '500.00.000.000', group: 'Beban', officeId: '', positionId: '', aktif: true, includeBuku: false },

  { id: '15', coa: '101.01.000.000', nama: 'Kas Pusat', parentCoa: '101.00.000.000', group: 'Aset', officeId: '1', positionId: '1', aktif: true, includeBuku: true },
  { id: '16', coa: '101.02.000.000', nama: 'Bank', parentCoa: '101.00.000.000', group: 'Aset', officeId: '1', positionId: '1', aktif: true, includeBuku: true },
  { id: '17', coa: '101.03.000.000', nama: 'Piutang Donatur', parentCoa: '101.00.000.000', group: 'Aset', officeId: '1', positionId: '2', aktif: true, includeBuku: true },
  { id: '18', coa: '102.01.000.000', nama: 'Aset Inventaris', parentCoa: '102.00.000.000', group: 'Aset', officeId: '1', positionId: '2', aktif: true, includeBuku: true },
  { id: '19', coa: '201.01.000.000', nama: 'Titipan Dana Zakat', parentCoa: '201.00.000.000', group: 'Kewajiban', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '20', coa: '401.01.000.000', nama: 'Zakat Profesi & Maal', parentCoa: '401.00.000.000', group: 'Penerimaan', officeId: '1', positionId: '1', aktif: true, includeBuku: true },
  { id: '21', coa: '402.01.000.000', nama: 'Infak Umum', parentCoa: '402.00.000.000', group: 'Penerimaan', officeId: '1', positionId: '1', aktif: true, includeBuku: true },
  { id: '22', coa: '501.01.000.000', nama: 'Penyaluran Zakat Fakir Miskin', parentCoa: '501.00.000.000', group: 'Beban', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '23', coa: '502.01.000.000', nama: 'Gaji Karyawan', parentCoa: '502.00.000.000', group: 'Beban', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '24', coa: '502.02.000.000', nama: 'Biaya Kantor', parentCoa: '502.00.000.000', group: 'Beban', officeId: '1', positionId: '3', aktif: true, includeBuku: true },

  // Diimpor dari template_import_coa.csv
  { id: '25', coa: '5.03', nama: 'Beban Kegiatan', parentCoa: '500.00.000.000', group: 'Beban', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '26', coa: '5.03.008', nama: 'Biaya Konsumsi Kegiatan', parentCoa: '5.03', group: 'Beban', officeId: '1', positionId: '1', aktif: true, includeBuku: true },

  // Akun untuk penyusutan Aset Tetap (modul FINS > Aset)
  { id: '27', coa: '502.03.000.000', nama: 'Beban Penyusutan Aset Tetap', parentCoa: '502.00.000.000', group: 'Beban', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '28', coa: '102.01.001.000', nama: 'Akumulasi Penyusutan Aset Tetap', parentCoa: '102.01.000.000', group: 'Aset', officeId: '1', positionId: '2', aktif: true, includeBuku: true },

  // Leaf akun Saldo Dana (301-308), selaras dengan halaman Saldo Dana FINS
  { id: '35', coa: '301.01.000.000', nama: 'Dana Zakat', parentCoa: '301.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '36', coa: '302.01.000.000', nama: 'Dana Infaq / Sedekah Terikat', parentCoa: '302.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '37', coa: '302.02.000.000', nama: 'Dana Infaq/Sedekah Tidak Terikat', parentCoa: '302.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '38', coa: '303.01.000.000', nama: 'Dana Amil', parentCoa: '303.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '39', coa: '304.01.000.000', nama: 'Dana Hibah', parentCoa: '304.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '40', coa: '305.01.000.000', nama: 'Dana APBN/APBD', parentCoa: '305.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '41', coa: '306.01.000.000', nama: 'Dana Bunga Bank', parentCoa: '306.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '42', coa: '306.02.000.000', nama: 'Dana Denda/Sanksi', parentCoa: '306.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '43', coa: '307.01.000.000', nama: 'Dana Wakaf', parentCoa: '307.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '44', coa: '308.01.000.000', nama: 'Dana DSKL Zakat', parentCoa: '308.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
  { id: '45', coa: '308.02.000.000', nama: 'Dana DSKL Infak', parentCoa: '308.00.000.000', group: 'Ekuitas', officeId: '1', positionId: '3', aktif: true, includeBuku: true },
];

// --- TRIAL BALANCE: saldo awal & mutasi periode berjalan per akun leaf ---
// Debet/Kredit Mutasi sudah disusun berpasangan (double-entry) sehingga total
// debet = total kredit, dan total Saldo Awal Aset = Kewajiban + Saldo Dana —
// supaya baris pengecekan BALANCE di Trial Balance benar-benar balance.
export const INITIAL_TRIAL_BALANCE = [
  // Aset
  { coa: '101.01.000.000', saldoAwal: 15000000, debetMutasi: 9000000, kreditMutasi: 27000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '101.02.000.000', saldoAwal: 180000000, debetMutasi: 45000000, kreditMutasi: 15000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '101.03.000.000', saldoAwal: 12000000, debetMutasi: 6000000, kreditMutasi: 4000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '102.01.000.000', saldoAwal: 45000000, debetMutasi: 3000000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '102.01.001.000', saldoAwal: -2000000, debetMutasi: 0, kreditMutasi: 416667, debetDisesuaikan: 0, kreditDisesuaikan: 0 },

  // Kewajiban
  { coa: '201.01.000.000', saldoAwal: 20000000, debetMutasi: 2000000, kreditMutasi: 5000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },

  // Saldo Dana
  { coa: '301.01.000.000', saldoAwal: 90000000, debetMutasi: 0, kreditMutasi: 5000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '302.01.000.000', saldoAwal: 40000000, debetMutasi: 0, kreditMutasi: 1500000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '302.02.000.000', saldoAwal: 35000000, debetMutasi: 0, kreditMutasi: 3000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '303.01.000.000', saldoAwal: 25000000, debetMutasi: 8000000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '304.01.000.000', saldoAwal: 15000000, debetMutasi: 2000000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '305.01.000.000', saldoAwal: 10000000, debetMutasi: 1500000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '306.01.000.000', saldoAwal: 3000000, debetMutasi: 500000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '306.02.000.000', saldoAwal: 2000000, debetMutasi: 200000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '307.01.000.000', saldoAwal: 8000000, debetMutasi: 0, kreditMutasi: 2000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '308.01.000.000', saldoAwal: 1500000, debetMutasi: 0, kreditMutasi: 500000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '308.02.000.000', saldoAwal: 500000, debetMutasi: 0, kreditMutasi: 200000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },

  // Penerimaan
  { coa: '401.01.000.000', saldoAwal: 0, debetMutasi: 0, kreditMutasi: 36000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '402.01.000.000', saldoAwal: 0, debetMutasi: 0, kreditMutasi: 15000000, debetDisesuaikan: 0, kreditDisesuaikan: 0 },

  // Beban
  { coa: '501.01.000.000', saldoAwal: 0, debetMutasi: 18000000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '502.01.000.000', saldoAwal: 0, debetMutasi: 12000000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '502.02.000.000', saldoAwal: 0, debetMutasi: 4500000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '502.03.000.000', saldoAwal: 0, debetMutasi: 416667, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
  { coa: '5.03.008', saldoAwal: 0, debetMutasi: 2500000, kreditMutasi: 0, debetDisesuaikan: 0, kreditDisesuaikan: 0 },
];

// --- SALDO AWAL (FINS > Akuntansi > Saldo Awal) ---
// Editable opening-balance snapshots per akun leaf (includeBuku: true), keyed
// by tanggal penutupan. Seeded 1:1 from INITIAL_TRIAL_BALANCE's saldoAwal so
// Trial Balance's "Saldo Awal" column keeps showing the same numbers by
// default — but now sourced from here, so editing this page changes TB too.
export const INITIAL_SALDO_AWAL = INITIAL_TRIAL_BALANCE.map((m, idx) => ({
  id: String(idx + 1),
  coa: m.coa,
  tanggal: '2024-12-31',
  saldoAkhir: m.saldoAwal,
  officeId: ''
}));

const SALDO_AWAL_KEY = 'fins_saldo_awal_v1';

export const getSaldoAwal = () => {
  const saved = localStorage.getItem(SALDO_AWAL_KEY);
  return saved ? JSON.parse(saved) : INITIAL_SALDO_AWAL;
};

export const saveSaldoAwal = (rows) => {
  localStorage.setItem(SALDO_AWAL_KEY, JSON.stringify(rows));
};

// Returns { [coa]: saldoAkhir } using the latest saldo-awal snapshot dated on
// or before `throughDateISO`, summed across kantor when several rows share
// that date. Used by Trial Balance so its Saldo Awal column always reflects
// whatever was entered/saved on this page, cascading to later periods.
export const getSaldoAwalMap = (throughDateISO, rows = null) => {
  const all = rows || getSaldoAwal();
  const eligibleDates = Array.from(new Set(all.map(r => r.tanggal))).filter(d => d <= throughDateISO);
  if (eligibleDates.length === 0) return {};
  const snapshotDate = eligibleDates.sort().pop();
  const map = {};
  all.filter(r => r.tanggal === snapshotDate).forEach(r => {
    map[r.coa] = (map[r.coa] || 0) + (r.saldoAkhir || 0);
  });
  return map;
};

export const ASSET_DEPRECIATION_METHODS = ['Garis Lurus', 'Saldo Menurun'];

// Default COA wiring for asset depreciation journals (FINS > Aset).
export const ASET_TETAP_COA = '102.01.000.000';
export const BEBAN_PENYUSUTAN_COA = '502.03.000.000';
export const AKUMULASI_PENYUSUTAN_COA = '102.01.001.000';

// Generates asset codes in the "A001<YYMMDD><seq>" scheme (categoryDigit
// lets non-equipment assets like tanah/kendaraan use a different prefix
// digit), scanning existingAssets for same-day collisions so codes stay
// unique even when several assets are entered with the same tanggal perolehan.
export const generateKodeAset = (tanggalISO, existingAssets = [], categoryDigit = '1') => {
  const d = new Date(`${tanggalISO}T00:00:00`);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const prefix = `A00${categoryDigit}${yy}${mm}${dd}`;
  const usedSeqs = existingAssets
    .filter(a => a.kodeAset && a.kodeAset.startsWith(prefix))
    .map(a => parseInt(a.kodeAset.slice(prefix.length), 10) || 0);
  const nextSeq = usedSeqs.length ? Math.max(...usedSeqs) + 1 : 0;
  return `${prefix}${String(nextSeq).padStart(2, '0')}`;
};

// --- FIXED ASSETS (FINS > Aset > Entry Aset / List Aset) ---
// `seed` builds the list incrementally so generateKodeAset can see prior
// entries and keep codes unique, exactly like the real add/edit flow would.
const seed = [];
const addSeed = (asset) => {
  seed.push({
    deskripsi: '', officeId: '1', nonDepresiasi: false, metode: '', masaManfaatBulan: null,
    tglAkhirSusut: null, nilaiPerBulanPersen: null, akunPenyusutan: null, akunAkumulasiPenyusutan: null,
    bulanAwalSusut: null, ...asset,
    id: String(seed.length + 1),
    kodeAset: asset.kodeAset || generateKodeAset(asset.tanggalPerolehan, seed, asset.categoryDigit || '1')
  });
};

addSeed({
  namaAset: 'Laptop ASUS ROG Staf IT', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Laptop operasional untuk tim IT & multimedia', tanggalPerolehan: '2026-01-10',
  biayaPerolehan: 15000000, metode: 'Garis Lurus', masaManfaatBulan: 36, nilaiPerBulanPersen: 2.78,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2026-01-10'
});
addSeed({
  namaAset: 'Tanah Wakaf Masjid Pelosok', akunAsetTetap: ASET_TETAP_COA, categoryDigit: '2',
  deskripsi: 'Tanah wakaf, tidak disusutkan sesuai kebijakan akuntansi organisasi nirlaba',
  tanggalPerolehan: '2025-03-01', biayaPerolehan: 450000000, nonDepresiasi: true
});
addSeed({
  namaAset: 'Kursi Kantor Sandaran Ergonomis (Set 4)', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Kursi kerja staf amil ruang operasional', tanggalPerolehan: '2026-01-21',
  biayaPerolehan: 2600000, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2026-01-21'
});
addSeed({
  namaAset: 'Meja Kantor Staff (Set 4)', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Meja kerja staf amil ruang operasional', tanggalPerolehan: '2026-01-21',
  biayaPerolehan: 5000000, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2026-01-21'
});
addSeed({
  namaAset: 'PC Desktop HP ZISCO Core i5', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Komputer desktop untuk entry data & pelaporan', tanggalPerolehan: '2025-07-29',
  biayaPerolehan: 3381100, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-07-29'
});
addSeed({
  namaAset: 'Roll Blind Kantor Ruang Rapat', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Tirai roll blind ruang rapat kantor pusat', tanggalPerolehan: '2025-06-18',
  biayaPerolehan: 9167710, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-06-18'
});
addSeed({
  namaAset: 'Adapter USB-C Ugreen Type C', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Adapter multiport, belum dikonfigurasi jadwal penyusutannya', tanggalPerolehan: '2026-06-17',
  biayaPerolehan: 147000, masaManfaatBulan: 48
});
addSeed({
  namaAset: 'Mouse Wireless CRM', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Mouse wireless staf CRM, belum dikonfigurasi jadwal penyusutannya', tanggalPerolehan: '2026-05-22',
  biayaPerolehan: 35800, masaManfaatBulan: 48
});
addSeed({
  namaAset: 'Hardisk Eksternal 5TB Seagate', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Backup data donatur & laporan keuangan', tanggalPerolehan: '2025-04-15',
  biayaPerolehan: 2580000, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-04-15'
});
addSeed({
  namaAset: 'Tripod Kamera Takara OHA', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Tripod dokumentasi kegiatan, belum dikonfigurasi jadwal penyusutannya', tanggalPerolehan: '2025-04-15',
  biayaPerolehan: 590000, masaManfaatBulan: 48
});
addSeed({
  namaAset: 'Mouse Rexus Xierra S5 Aviator', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Mouse cadangan tim dokumentasi, belum dikonfigurasi jadwal penyusutannya', tanggalPerolehan: '2025-04-15',
  biayaPerolehan: 493000, masaManfaatBulan: 48
});
addSeed({
  namaAset: 'Kabel HDMI Optical 50 Meter', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Kabel HDMI ruang aula, belum dikonfigurasi jadwal penyusutannya', tanggalPerolehan: '2025-04-15',
  biayaPerolehan: 743000, masaManfaatBulan: 48
});
addSeed({
  namaAset: 'Printer Epson L3210', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Printer cetak kuitansi & laporan donatur', tanggalPerolehan: '2025-09-01',
  biayaPerolehan: 2750000, metode: 'Garis Lurus', masaManfaatBulan: 36, nilaiPerBulanPersen: 2.78,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-09-01'
});
addSeed({
  namaAset: 'AC Split Daikin 1PK (Ruang Amil)', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Pendingin ruangan kantor pusat', tanggalPerolehan: '2024-11-10',
  biayaPerolehan: 4200000, metode: 'Garis Lurus', masaManfaatBulan: 60, nilaiPerBulanPersen: 1.67,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2024-11-10'
});
addSeed({
  namaAset: 'Proyektor Epson EB-X06', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Proyektor ruang rapat & presentasi donatur', tanggalPerolehan: '2025-02-14',
  biayaPerolehan: 6100000, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-02-14'
});
addSeed({
  namaAset: 'Genset Portable Honda 2000W', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Cadangan listrik kantor saat pemadaman', tanggalPerolehan: '2024-05-20',
  biayaPerolehan: 8900000, metode: 'Garis Lurus', masaManfaatBulan: 60, nilaiPerBulanPersen: 1.67,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2024-05-20'
});
addSeed({
  namaAset: 'Dispenser Air Miyako', akunAsetTetap: ASET_TETAP_COA, officeId: '2',
  deskripsi: 'Dispenser ruang tunggu Kantor Cabang Bandung', tanggalPerolehan: '2025-08-05',
  biayaPerolehan: 850000, metode: 'Garis Lurus', masaManfaatBulan: 36, nilaiPerBulanPersen: 2.78,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-08-05'
});
addSeed({
  namaAset: 'CCTV Set 4 Kamera Hikvision', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Keamanan kantor pusat & gudang logistik', tanggalPerolehan: '2025-10-12',
  biayaPerolehan: 5400000, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-10-12'
});
addSeed({
  namaAset: 'Lemari Arsip Besi 4 Pintu', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Penyimpanan dokumen & arsip keuangan', tanggalPerolehan: '2024-08-01',
  biayaPerolehan: 3200000, metode: 'Garis Lurus', masaManfaatBulan: 60, nilaiPerBulanPersen: 1.67,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2024-08-01'
});
addSeed({
  namaAset: 'Whiteboard Magnetic 120x240', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Papan tulis ruang rapat, belum dikonfigurasi jadwal penyusutannya', tanggalPerolehan: '2026-02-03',
  biayaPerolehan: 620000, masaManfaatBulan: 48
});
addSeed({
  namaAset: 'Sound System Portable + Mic Wireless', akunAsetTetap: ASET_TETAP_COA, officeId: '2',
  deskripsi: 'Perlengkapan acara & sosialisasi program di Bandung', tanggalPerolehan: '2025-12-01',
  biayaPerolehan: 4500000, metode: 'Garis Lurus', masaManfaatBulan: 36, nilaiPerBulanPersen: 2.78,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-12-01'
});
addSeed({
  namaAset: 'Kursi Tunggu Tamu (Set 3)', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Kursi ruang tunggu donatur & tamu', tanggalPerolehan: '2025-01-15',
  biayaPerolehan: 1950000, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-01-15'
});
addSeed({
  namaAset: 'UPS APC 1200VA', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Pengaman daya server & komputer akuntansi', tanggalPerolehan: '2026-03-10',
  biayaPerolehan: 1650000, metode: 'Garis Lurus', masaManfaatBulan: 36, nilaiPerBulanPersen: 2.78,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2026-03-10'
});
addSeed({
  namaAset: 'Kamera DSLR Canon EOS 1500D', akunAsetTetap: ASET_TETAP_COA,
  deskripsi: 'Dokumentasi kegiatan penyaluran & kampanye', tanggalPerolehan: '2025-05-19',
  biayaPerolehan: 7200000, metode: 'Garis Lurus', masaManfaatBulan: 48, nilaiPerBulanPersen: 2.08,
  akunPenyusutan: BEBAN_PENYUSUTAN_COA, akunAkumulasiPenyusutan: AKUMULASI_PENYUSUTAN_COA, bulanAwalSusut: '2025-05-19'
});

export const INITIAL_FIXED_ASSETS = seed;

// Bumped to v2 (added kodeAset + richer seed data) so browsers holding the
// old-shaped localStorage payload pick up the new dataset instead of a stale
// one missing the fields this page's report now depends on.
const FIXED_ASSETS_KEY = 'fins_fixed_assets_v2';

export const getFixedAssets = () => {
  const saved = localStorage.getItem(FIXED_ASSETS_KEY);
  return saved ? JSON.parse(saved) : INITIAL_FIXED_ASSETS;
};

export const saveFixedAssets = (assets) => {
  localStorage.setItem(FIXED_ASSETS_KEY, JSON.stringify(assets));
};

export const levelOf = (coa, rows) => {
  let depth = 1;
  let current = rows.find(r => r.coa === coa);
  while (current && current.parentCoa) {
    depth += 1;
    current = rows.find(r => r.coa === current.parentCoa);
  }
  return depth;
};

export const OFFICES = [
  { id: '1', nama: 'Kantor Pusat' },
  { id: '2', nama: 'Kantor Cabang Bandung' },
  { id: '3', nama: 'Kantor Cabang Surabaya' },
  { id: '4', nama: 'Kantor Cabang Medan' },
];

export const POSITIONS = [
  { id: '1', nama: 'Staff Keuangan' },
  { id: '2', nama: 'Kepala Divisi' },
  { id: '3', nama: 'Manager Keuangan' },
  { id: '4', nama: 'Direktur' },
  { id: '5', nama: 'Superadmin' },
];

export const INITIAL_COA_KANTOR = [
  { id: '1', officeId: '1', coaCash: '101.01.000.000', coaNonCash: '101.02.000.000' },
  { id: '2', officeId: '2', coaCash: '101.01.000.000', coaNonCash: '101.02.000.000' },
  { id: '3', officeId: '3', coaCash: '101.03.000.000', coaNonCash: '101.02.000.000' },
  { id: '4', officeId: '4', coaCash: '101.03.000.000', coaNonCash: '102.01.000.000' },
];

// Mapping COA "Saldo Dana" (301-308, selaras dengan bagian SALDO DANA di
// Laporan Posisi Keuangan) ke akun Beban (COA Expense) & Penerimaan (COA
// Revenue) yang menambah/mengurangi saldo dana tsb. Baris level 1 adalah
// header kategori (tebal); level 2 adalah rincian/leaf di bawahnya.
export const INITIAL_SALDO_DANA = [
  { id: '1', coa: '300.00.000.000', namaCoa: 'Saldo Dana', coaExpense: ['500.00.000.000'], coaRevenue: ['400.00.000.000'], operasional: false, level: 1, aktif: true },

  { id: '2', coa: '301.00.000.000', namaCoa: 'Dana Zakat', coaExpense: ['501.00.000.000'], coaRevenue: ['401.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '3', coa: '301.01.000.000', namaCoa: 'Dana Zakat', coaExpense: ['501.00.000.000'], coaRevenue: ['401.00.000.000'], operasional: true, level: 2, aktif: true },

  { id: '4', coa: '302.00.000.000', namaCoa: 'Dana Infaq/Sedekah', coaExpense: ['502.00.000.000'], coaRevenue: ['402.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '5', coa: '302.01.000.000', namaCoa: 'Dana Infaq / Sedekah Terikat', coaExpense: ['502.01.001.000', '502.02.000.000'], coaRevenue: ['402.01.000.000'], operasional: true, level: 2, aktif: true },
  { id: '6', coa: '302.02.000.000', namaCoa: 'Dana Infaq/Sedekah Tidak Terikat', coaExpense: ['502.01.002.000', '502.03.000.000', '502.04.000.000', '502.05.000.000'], coaRevenue: ['402.02.000.000', '402.03.000.000', '402.04.000.000', '402.99.000.000'], operasional: true, level: 2, aktif: true },

  { id: '7', coa: '303.00.000.000', namaCoa: 'Dana Amil', coaExpense: ['503.00.000.000'], coaRevenue: ['403.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '8', coa: '303.01.000.000', namaCoa: 'Dana Amil', coaExpense: ['503.00.000.000'], coaRevenue: ['403.00.000.000'], operasional: true, level: 2, aktif: true },

  { id: '9', coa: '304.00.000.000', namaCoa: 'Dana Hibah', coaExpense: ['504.00.000.000'], coaRevenue: ['404.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '10', coa: '304.01.000.000', namaCoa: 'Dana Hibah', coaExpense: ['504.00.000.000'], coaRevenue: ['404.00.000.000'], operasional: false, level: 2, aktif: true },

  { id: '11', coa: '305.00.000.000', namaCoa: 'Dana APBN/APBD', coaExpense: ['505.00.000.000'], coaRevenue: ['405.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '12', coa: '305.01.000.000', namaCoa: 'Dana APBN/APBD', coaExpense: ['505.00.000.000'], coaRevenue: ['405.00.000.000'], operasional: true, level: 2, aktif: true },

  { id: '13', coa: '306.00.000.000', namaCoa: 'Dana Yang Dilarang Syariah', coaExpense: ['506.00.000.000'], coaRevenue: ['406.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '14', coa: '306.01.000.000', namaCoa: 'Dana Bunga Bank', coaExpense: ['506.01.000.000'], coaRevenue: ['406.01.000.000'], operasional: true, level: 2, aktif: true },
  { id: '15', coa: '306.02.000.000', namaCoa: 'Dana Denda/Sanksi', coaExpense: ['506.02.000.000'], coaRevenue: ['406.02.000.000'], operasional: true, level: 2, aktif: true },

  { id: '16', coa: '307.00.000.000', namaCoa: 'Dana Wakaf', coaExpense: ['507.00.000.000'], coaRevenue: ['407.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '17', coa: '307.01.000.000', namaCoa: 'Dana Wakaf', coaExpense: ['507.00.000.000'], coaRevenue: ['407.00.000.000'], operasional: true, level: 2, aktif: true },

  { id: '18', coa: '308.00.000.000', namaCoa: 'Dana DSKL', coaExpense: ['508.00.000.000'], coaRevenue: ['408.00.000.000'], operasional: false, level: 1, aktif: true },
  { id: '19', coa: '308.01.000.000', namaCoa: 'Dana DSKL Zakat', coaExpense: ['508.01.000.000'], coaRevenue: ['408.01.000.000'], operasional: true, level: 2, aktif: true },
  { id: '20', coa: '308.02.000.000', namaCoa: 'Dana DSKL Infak', coaExpense: ['508.02.000.000'], coaRevenue: ['408.02.000.000'], operasional: true, level: 2, aktif: true },
];

export const INITIAL_LEVEL_APPROVE = [
  { id: '1', jabatan: 'Staff Keuangan', expendMin: 0, expendMax: 1000000, receiptMin: 0, receiptMax: 5000000, aktif: true },
  { id: '2', jabatan: 'Kepala Divisi', expendMin: 1000001, expendMax: 10000000, receiptMin: 5000001, receiptMax: 50000000, aktif: true },
  { id: '3', jabatan: 'Manager Keuangan', expendMin: 10000001, expendMax: 50000000, receiptMin: 50000001, receiptMax: 200000000, aktif: true },
  { id: '4', jabatan: 'Direktur', expendMin: 50000001, expendMax: null, receiptMin: 200000001, receiptMax: null, aktif: true },
];

export const INITIAL_RUMUS_TEMPLATES = {
  'Laporan Posisi Keuangan': [
    { id: 1, nama: 'ASET', rumus: '100.00.000.000', level: 1, keterangan: '', kode: '', sort: 1, locked: false },
    { id: 2, nama: 'Aset Lancar', rumus: '101.00.000.000', level: 1, keterangan: '', kode: '', sort: 2, locked: false },
    { id: 5, nama: 'Piutang', rumus: '101.04.000.000', level: 2, keterangan: '', kode: '', sort: 3, locked: false },
    { id: 3, nama: 'Kas dan setara kas', rumus: '101.01.000.000+101.02.000.000', level: 2, keterangan: '', kode: '', sort: 4, locked: false },
    { id: 4, nama: 'Bank', rumus: '101.02.000.000', level: 2, keterangan: '', kode: '', sort: 5, locked: true },
    { id: 6, nama: 'Piutang Lain lain', rumus: '101.05.000.000', level: 2, keterangan: '', kode: '', sort: 6, locked: false },
    { id: 7, nama: 'Piutang Penyaluran', rumus: '101.06.000.000', level: 2, keterangan: '', kode: '', sort: 7, locked: false },
    { id: 8, nama: 'Persediaan', rumus: '101.07.000.000', level: 2, keterangan: '', kode: '', sort: 8, locked: false },
    { id: 9, nama: 'Pajak Dibayar Dimuka', rumus: '101.08.000.000', level: 2, keterangan: '', kode: '', sort: 9, locked: false },
    { id: 10, nama: 'Beban Dibayar Dimuka', rumus: '101.09.000.000', level: 2, keterangan: '', kode: '', sort: 10, locked: false },
    { id: 11, nama: 'Uang Muka Kegiatan', rumus: '101.10.000.000', level: 2, keterangan: '', kode: '', sort: 11, locked: false },
    { id: 12, nama: 'Pendapatan Yang Masih Harus Diterima', rumus: '101.11.000.000', level: 2, keterangan: '', kode: '', sort: 12, locked: false },
    { id: 13, nama: 'Aset Lancar Kelolaan', rumus: '101.12.000.000', level: 2, keterangan: '', kode: '', sort: 13, locked: false },
    { id: 14, nama: 'Aset Tidak Lancar', rumus: '102.00.000.000', level: 1, keterangan: '', kode: '', sort: 14, locked: false },
    { id: 15, nama: 'Piutang Hubungan Istimewa', rumus: '102.01.000.000', level: 2, keterangan: '', kode: '', sort: 15, locked: false },
    { id: 16, nama: 'Aset Pajak Tangguhan', rumus: '102.02.000.000', level: 2, keterangan: '', kode: '', sort: 16, locked: false },
    { id: 17, nama: 'Investasi pada perusahaan Asosiasi', rumus: '102.03.000.000', level: 2, keterangan: '', kode: '', sort: 17, locked: false },
    { id: 18, nama: 'Investasi Jangka Panjang Lainnya', rumus: '102.04.000.000', level: 2, keterangan: '', kode: '', sort: 18, locked: false },
    { id: 19, nama: 'Aset Tetap', rumus: '102.05.000.000', level: 2, keterangan: '', kode: '', sort: 19, locked: false },
    { id: 20, nama: 'Akumulasi Penyusutan Amil', rumus: '102.05.012.000', level: 3, keterangan: '', kode: '', sort: 20, locked: false },
    { id: 21, nama: 'Aset Tidak Berwujud', rumus: '102.06.000.000', level: 2, keterangan: '', kode: '', sort: 21, locked: false },
    { id: 22, nama: 'Beban Ditangguhkan', rumus: '102.07.000.000', level: 2, keterangan: '', kode: '', sort: 22, locked: false },
    { id: 23, nama: 'Aset kelolaan tidak lancar', rumus: '102.08.000.000', level: 2, keterangan: '', kode: '', sort: 23, locked: false },
    { id: 24, nama: 'Aset Zakat', rumus: '102.08.001.000', level: 3, keterangan: '', kode: '', sort: 24, locked: false },
    { id: 25, nama: 'Akumulasi Penyusutan Zakat', rumus: '102.08.002.000', level: 4, keterangan: '', kode: '', sort: 25, locked: false },
    { id: 26, nama: 'Aset non Zakat', rumus: '102.08.003.000', level: 3, keterangan: '', kode: '', sort: 26, locked: false },
    { id: 27, nama: 'Akumulasi Penyusutan Bangunan non Zakat', rumus: '102.08.004.000', level: 4, keterangan: '', kode: '', sort: 27, locked: false },
    { id: 28, nama: 'KEWAJIBAN DAN SALDO DANA', rumus: '200.00.000.000+301.00.000.000+302.00.000.000+303.00.000.000+304.00.000.000+305.00.000.000+306.00.000.000+307.00.000.000+308.00.000.000', level: 1, keterangan: '', kode: '', sort: 28, locked: false },
    { id: 29, nama: 'KEWAJIBAN', rumus: '200.00.000.000', level: 1, keterangan: '', kode: '', sort: 29, locked: false },
    { id: 30, nama: 'Kewajiban Jangka Pendek', rumus: '201.00.000.000', level: 1, keterangan: '', kode: '', sort: 30, locked: false },
    { id: 31, nama: 'Hutang pada pihak ketiga', rumus: '201.01.000.000', level: 2, keterangan: '', kode: '', sort: 31, locked: false },
    { id: 32, nama: 'Hutang Pajak', rumus: '201.02.000.000', level: 2, keterangan: '', kode: '', sort: 32, locked: false },
    { id: 33, nama: 'Beban YMH Dibayar', rumus: '201.03.000.000', level: 2, keterangan: '', kode: '', sort: 33, locked: false },
    { id: 34, nama: 'Pendapatan diterima dimuka', rumus: '201.04.000.000', level: 2, keterangan: '', kode: '', sort: 34, locked: false },
    { id: 35, nama: 'Hutang Penyaluran', rumus: '201.05.000.000', level: 2, keterangan: '', kode: '', sort: 35, locked: false },
    { id: 36, nama: 'Kewajiban Jangka Pendek', rumus: '201.09.000.000', level: 2, keterangan: '', kode: '', sort: 36, locked: false },
    { id: 37, nama: 'Hutang Hubungan Istimewa', rumus: '202.01.000.000', level: 2, keterangan: '', kode: '', sort: 37, locked: false },
    { id: 38, nama: 'Kewajiban Pajak Tangguhan', rumus: '202.02.000.000', level: 2, keterangan: '', kode: '', sort: 38, locked: false },
    { id: 39, nama: 'Pinjaman Jangka Panjang', rumus: '202.03.000.000', level: 2, keterangan: '', kode: '', sort: 39, locked: false },
    { id: 40, nama: 'Hutang Aset', rumus: '202.04.000.000', level: 2, keterangan: '', kode: '', sort: 40, locked: false },
    { id: 41, nama: 'Hutang Murabahah', rumus: '202.05.000.000', level: 2, keterangan: '', kode: '', sort: 41, locked: false },
    { id: 42, nama: 'Dana Titipan', rumus: '202.06.000.000', level: 2, keterangan: '', kode: '', sort: 42, locked: false },
    { id: 43, nama: 'SALDO DANA', rumus: '301.00.000.000+302.00.000.000+303.00.000.000+304.00.000.000+305.00.000.000+306.00.000.000+307.00.000.000+308.00.000.000', level: 1, keterangan: '', kode: '', sort: 43, locked: false },
    { id: 44, nama: 'Dana Zakat', rumus: '301.00.000.000', level: 2, keterangan: '', kode: '', sort: 44, locked: false },
    { id: 45, nama: 'Dana Infaq/Sedekah', rumus: '302.00.000.000', level: 2, keterangan: '', kode: '', sort: 45, locked: true },
    { id: 356, nama: 'Dana Infak Terikat', rumus: '302.01.000.000', level: 2, keterangan: '', kode: '', sort: 46, locked: false },
    { id: 357, nama: 'Dana Infak Tidak Terikat', rumus: '302.02.000.000', level: 2, keterangan: '', kode: '', sort: 47, locked: false },
    { id: 46, nama: 'Dana Amil', rumus: '303.00.000.000', level: 2, keterangan: '', kode: '', sort: 48, locked: false },
    { id: 47, nama: 'Dana Hibah', rumus: '304.00.000.000', level: 2, keterangan: '', kode: '', sort: 49, locked: false },
    { id: 48, nama: 'Dana APBN/APBD', rumus: '305.00.000.000', level: 2, keterangan: '', kode: '', sort: 50, locked: false },
    { id: 49, nama: 'Dana Yang Dilarang Syariah', rumus: '306.00.000.000', level: 2, keterangan: '', kode: '', sort: 51, locked: false },
    { id: 50, nama: 'Dana Wakaf', rumus: '307.00.000.000', level: 2, keterangan: '', kode: '', sort: 52, locked: false },
    { id: 341, nama: 'Dana DSKL', rumus: '308.00.000.000', level: 2, keterangan: '', kode: '', sort: 53, locked: false },
  ],
  'Laporan Aktivitas': [
    { id: 1, nama: 'PENERIMAAN', rumus: '400.00.000.000', level: 1, keterangan: '', kode: '4', sort: 1, locked: false },
    { id: 2, nama: 'Penerimaan Dana Zakat', rumus: '401.00.000.000', level: 1, keterangan: '', kode: '4.1', sort: 2, locked: false },
    { id: 3, nama: 'Zakat Profesi & Maal', rumus: '401.01.000.000', level: 2, keterangan: '', kode: '4.1.1', sort: 3, locked: false },
    { id: 4, nama: 'Penerimaan Dana Infak/Sedekah', rumus: '402.00.000.000', level: 1, keterangan: '', kode: '4.2', sort: 4, locked: false },
    { id: 5, nama: 'Infak Umum', rumus: '402.01.000.000', level: 2, keterangan: '', kode: '4.2.1', sort: 5, locked: false },
    { id: 6, nama: 'Total Penerimaan', rumus: '401.01.000.000+402.01.000.000', level: 1, keterangan: 'Subtotal seluruh penerimaan dana', kode: '4.9', sort: 6, locked: false },

    { id: 7, nama: 'PENGGUNAAN DANA (BEBAN)', rumus: '500.00.000.000', level: 1, keterangan: '', kode: '5', sort: 7, locked: false },
    { id: 8, nama: 'Beban Penyaluran', rumus: '501.00.000.000', level: 1, keterangan: '', kode: '5.1', sort: 8, locked: false },
    { id: 9, nama: 'Penyaluran Zakat Fakir Miskin', rumus: '501.01.000.000', level: 2, keterangan: '', kode: '5.1.1', sort: 9, locked: false },
    { id: 10, nama: 'Beban Operasional', rumus: '502.00.000.000', level: 1, keterangan: '', kode: '5.2', sort: 10, locked: false },
    { id: 11, nama: 'Gaji Karyawan', rumus: '502.01.000.000', level: 2, keterangan: '', kode: '5.2.1', sort: 11, locked: false },
    { id: 12, nama: 'Biaya Kantor', rumus: '502.02.000.000', level: 2, keterangan: '', kode: '5.2.2', sort: 12, locked: false },
    { id: 13, nama: 'Beban Kegiatan', rumus: '5.03', level: 1, keterangan: '', kode: '5.3', sort: 13, locked: false },
    { id: 14, nama: 'Biaya Konsumsi Kegiatan', rumus: '5.03.008', level: 2, keterangan: 'Contoh baris akun baru — diimpor dari template_import_coa.csv', kode: '5.03.008', sort: 14, locked: false },
    { id: 15, nama: 'Total Beban', rumus: '501.01.000.000+502.01.000.000+502.02.000.000+5.03.008', level: 1, keterangan: 'Subtotal seluruh beban & penyaluran', kode: '5.9', sort: 15, locked: false },

    { id: 16, nama: 'SURPLUS (DEFISIT)', rumus: '(401.01.000.000+402.01.000.000)-(501.01.000.000+502.01.000.000+502.02.000.000+5.03.008)', level: 1, keterangan: 'Total Penerimaan dikurangi Total Beban', kode: '9', sort: 16, locked: false },
  ],
  'Laporan Arus Kas': [
    { id: 1, nama: 'ARUS KAS DARI AKTIVITAS OPERASI', rumus: '401.01.000.000+402.01.000.000-501.01.000.000-502.01.000.000-502.02.000.000-5.03.008', level: 1, keterangan: '', kode: '6.1', sort: 1, locked: false },
    { id: 2, nama: 'Penerimaan dari Donatur Zakat', rumus: '401.01.000.000', level: 2, keterangan: '', kode: '6.1.1', sort: 2, locked: false },
    { id: 3, nama: 'Penerimaan dari Donatur Infak/Sedekah', rumus: '402.01.000.000', level: 2, keterangan: '', kode: '6.1.2', sort: 3, locked: false },
    { id: 4, nama: 'Pembayaran untuk Penyaluran Program', rumus: '-501.01.000.000', level: 2, keterangan: '', kode: '6.1.3', sort: 4, locked: false },
    { id: 5, nama: 'Pembayaran Gaji Karyawan', rumus: '-502.01.000.000', level: 2, keterangan: '', kode: '6.1.4', sort: 5, locked: false },
    { id: 6, nama: 'Pembayaran Biaya Kantor', rumus: '-502.02.000.000', level: 2, keterangan: '', kode: '6.1.5', sort: 6, locked: false },
    { id: 7, nama: 'Pembayaran Biaya Konsumsi Kegiatan', rumus: '-5.03.008', level: 2, keterangan: 'Diimpor dari template_import_coa.csv', kode: '6.1.6', sort: 7, locked: false },
    { id: 8, nama: 'Kas Bersih dari Aktivitas Operasi', rumus: '401.01.000.000+402.01.000.000-501.01.000.000-502.01.000.000-502.02.000.000-5.03.008', level: 1, keterangan: 'Subtotal aktivitas operasi', kode: '6.1.9', sort: 8, locked: false },

    { id: 9, nama: 'ARUS KAS DARI AKTIVITAS INVESTASI', rumus: '-102.01.000.000', level: 1, keterangan: '', kode: '6.2', sort: 9, locked: false },
    { id: 10, nama: 'Pembelian Aset Inventaris', rumus: '-102.01.000.000', level: 2, keterangan: '', kode: '6.2.1', sort: 10, locked: false },
    { id: 11, nama: 'Kas Bersih dari Aktivitas Investasi', rumus: '-102.01.000.000', level: 1, keterangan: 'Subtotal aktivitas investasi', kode: '6.2.9', sort: 11, locked: false },

    { id: 12, nama: 'ARUS KAS DARI AKTIVITAS PENDANAAN', rumus: '307.00.000.000', level: 1, keterangan: '', kode: '6.3', sort: 12, locked: false },
    { id: 13, nama: 'Penerimaan Dana Wakaf', rumus: '307.00.000.000', level: 2, keterangan: '', kode: '6.3.1', sort: 13, locked: false },
    { id: 14, nama: 'Kas Bersih dari Aktivitas Pendanaan', rumus: '307.00.000.000', level: 1, keterangan: 'Subtotal aktivitas pendanaan', kode: '6.3.9', sort: 14, locked: false },

    { id: 15, nama: 'KENAIKAN (PENURUNAN) BERSIH KAS', rumus: '(401.01.000.000+402.01.000.000-501.01.000.000-502.01.000.000-502.02.000.000-5.03.008)+(-102.01.000.000)+(307.00.000.000)', level: 1, keterangan: 'Jumlah kas bersih operasi, investasi, dan pendanaan', kode: '6.8', sort: 15, locked: false },
    { id: 16, nama: 'Saldo Kas Awal Periode', rumus: '101.01.000.000+101.02.000.000', level: 1, keterangan: 'Kas Pusat + Bank', kode: '6.9.1', sort: 16, locked: true },
    { id: 17, nama: 'Saldo Kas Akhir Periode', rumus: '101.01.000.000+101.02.000.000+(401.01.000.000+402.01.000.000-501.01.000.000-502.01.000.000-502.02.000.000-5.03.008)+(-102.01.000.000)+(307.00.000.000)', level: 1, keterangan: 'Saldo Kas Awal + Kenaikan (Penurunan) Bersih Kas', kode: '6.9.9', sort: 17, locked: false },
  ],
};
