// --- SEED DATA FOR FINS > HOME > RESUME DANA PENGELOLA ---
// "Dana Pengelola" (DP) adalah potongan hak amil operasional dari setiap
// transaksi penerimaan, dihitung sebagai persentase (%DP) yang bisa berbeda
// per program — dikonfigurasi lewat tombol "Set DP".

export const KATEGORI_OPTIONS = ['Zakat', 'Infaq/Shodaqoh'];

export const INITIAL_PROGRAM_DP = [
  { program: 'Beasiswa Yatim, Dhuafa Tangguh', kategori: 'Infaq/Shodaqoh', dpPercent: 12.5 },
  { program: 'Gerakan Jumat Maslahat', kategori: 'Infaq/Shodaqoh', dpPercent: 20 },
  { program: 'Infak Palestina', kategori: 'Infaq/Shodaqoh', dpPercent: 20 },
  { program: 'Infaq Dakwah', kategori: 'Infaq/Shodaqoh', dpPercent: 20 },
  { program: 'Sedekah AlQuran', kategori: 'Infaq/Shodaqoh', dpPercent: 20 },
  { program: 'Sedekah Peradaban', kategori: 'Infaq/Shodaqoh', dpPercent: 20 },
  { program: 'Zakat Penghasilan', kategori: 'Zakat', dpPercent: 12.5 },
  { program: 'Zakat Simpanan', kategori: 'Zakat', dpPercent: 12.5 }
];

// Baris transaksi penerimaan per program (batch harian), dipakai untuk
// menghitung Σ Transaksi / Σ Quantity secara live sesuai filter Periode/Kantor.
export const INITIAL_TRANSAKSI_DP = [
  { id: '1', tanggal: '2026-08-03', program: 'Beasiswa Yatim, Dhuafa Tangguh', quantity: 1, nominal: 10000, officeId: '1' },
  { id: '2', tanggal: '2026-08-06', program: 'Beasiswa Yatim, Dhuafa Tangguh', quantity: 1, nominal: 10000, officeId: '1' },

  { id: '3', tanggal: '2026-08-02', program: 'Gerakan Jumat Maslahat', quantity: 1, nominal: 30000, officeId: '1' },

  { id: '4', tanggal: '2026-08-04', program: 'Infak Palestina', quantity: 1, nominal: 200000, officeId: '1' },

  { id: '5', tanggal: '2026-08-01', program: 'Infaq Dakwah', quantity: 3, nominal: 60000, officeId: '1' },
  { id: '6', tanggal: '2026-08-05', program: 'Infaq Dakwah', quantity: 3, nominal: 75000, officeId: '1' },
  { id: '7', tanggal: '2026-08-08', program: 'Infaq Dakwah', quantity: 2, nominal: 45000, officeId: '1' },

  { id: '8', tanggal: '2026-08-02', program: 'Sedekah AlQuran', quantity: 2, nominal: 300000, officeId: '1' },
  { id: '9', tanggal: '2026-08-07', program: 'Sedekah AlQuran', quantity: 3, nominal: 475000, officeId: '1' },

  { id: '10', tanggal: '2026-08-01', program: 'Sedekah Peradaban', quantity: 15, nominal: 2400000, officeId: '1' },
  { id: '11', tanggal: '2026-08-05', program: 'Sedekah Peradaban', quantity: 20, nominal: 3200000, officeId: '1' },
  { id: '12', tanggal: '2026-08-09', program: 'Sedekah Peradaban', quantity: 7, nominal: 1154000, officeId: '1' },

  { id: '13', tanggal: '2026-08-03', program: 'Zakat Penghasilan', quantity: 5, nominal: 1250000, officeId: '1' },
  { id: '14', tanggal: '2026-08-07', program: 'Zakat Penghasilan', quantity: 3, nominal: 768750, officeId: '1' },

  { id: '15', tanggal: '2026-08-02', program: 'Zakat Simpanan', quantity: 2, nominal: 10000000, officeId: '1' },
  { id: '16', tanggal: '2026-08-06', program: 'Zakat Simpanan', quantity: 2, nominal: 7053177, officeId: '1' }
];
