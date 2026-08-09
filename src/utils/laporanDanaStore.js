// --- FINS > Laporan Keuangan > Laporan Perubahan Dana & Laporan Arus Kas ---
// Struktur PSAK 109 (dana zakat, infak/sedekah terikat & tidak terikat, amil,
// hibah, APBN/APBD, dana yang dilarang syariah, wakaf, DSKL). Setiap kategori
// dana hanya menyimpan baris Penerimaan/Penyaluran leaf-nya; subtotal, surplus
// (defisit), dan saldo awal/akhir dihitung supaya selalu konsisten:
//   Saldo Awal (tahun berjalan) = Saldo Akhir (tahun sebelumnya)
//   Saldo Akhir = Saldo Awal + Surplus (Defisit)

const sum = (items, key) => items.reduce((s, i) => s + (i[key] || 0), 0);

export const DANA_CATEGORIES_RAW = [
  {
    key: 'zakat', nama: 'DANA ZAKAT', saldoAwalBaseline: 40000000,
    penerimaan: [
      { nama: 'Penerimaan Zakat Entitas', current: 15000000, prior: 12000000 },
      { nama: 'Penerimaan Zakat Individu', current: 45000000, prior: 38000000 }
    ],
    penyaluran: [
      { nama: 'Penyaluran Zakat untuk Amil', current: 7500000, prior: 6250000 },
      { nama: 'Penyaluran Zakat untuk Fakir Miskin', current: 22000000, prior: 18000000 },
      { nama: 'Penyaluran Zakat untuk Riqab', current: 0, prior: 0 },
      { nama: 'Penyaluran Zakat untuk Gharim', current: 2000000, prior: 1500000 },
      { nama: 'Penyaluran Zakat untuk Muallaf', current: 1000000, prior: 800000 },
      { nama: 'Penyaluran Zakat untuk Fisabilillah', current: 8000000, prior: 6000000 },
      { nama: 'Penyaluran Zakat untuk Ibnu Sabil', current: 500000, prior: 300000 },
      { nama: 'Alokasi Pemanfaatan Aset Kelolaan', current: 0, prior: 0 },
      { nama: 'Selisih Kurang Nilai Tukar/Penilaian', current: 0, prior: 0 },
      { nama: 'Penyaluran Lain-lain', current: 300000, prior: 200000 }
    ]
  },
  { groupHeader: 'DANA INFAQ/SEDEKAH' },
  {
    key: 'infaqTidakTerikat', nama: 'DANA INFAQ/SEDEKAH TIDAK TERIKAT', saldoAwalBaseline: 25000000,
    penerimaan: [
      { nama: 'Penerimaan Infak/Sedekah Tidak Terikat', current: 30000000, prior: 24000000 },
      { nama: 'Selisih Lebih Nilai Tukar/Penilaian – Dana Infak/Sedekah', current: 0, prior: 0 },
      { nama: 'Penerimaan Bagi Hasil atas Pengelolaan Dana Infaq/Sedekah', current: 500000, prior: 400000 },
      { nama: 'Penerimaan Lain-lain Dana Infaq/Sedekah', current: 800000, prior: 600000 }
    ],
    penyaluran: [
      { nama: 'Penyaluran Dana Infaq/Sedekah untuk Amil', current: 6000000, prior: 4800000 },
      { nama: 'Penyaluran Infaq/Sedekah Tidak Terikat', current: 18000000, prior: 14000000 },
      { nama: 'Alokasi Pemanfaatan Aset Kelolaan – Dana Infak/Sedekah', current: 0, prior: 0 },
      { nama: 'Selisih Kurang Nilai Tukar/Penilaian – Dana Infaq/Sedekah', current: 0, prior: 0 },
      { nama: 'Penyaluran Lain-lain – Dana Infak/Sedekah', current: 200000, prior: 150000 }
    ]
  },
  {
    key: 'infaqTerikat', nama: 'DANA INFAQ/SEDEKAH TERIKAT', saldoAwalBaseline: 30000000,
    penerimaan: [
      { nama: 'Penerimaan Infak/Sedekah Terikat', current: 35000000, prior: 28000000 }
    ],
    penyaluran: [
      { nama: 'Penyaluran Dana Infaq/Sedekah untuk Amil', current: 7000000, prior: 5600000 },
      { nama: 'Penyaluran Infaq/Sedekah Terikat', current: 20000000, prior: 16000000 }
    ]
  },
  {
    key: 'amil', nama: 'DANA AMIL', saldoAwalBaseline: -5000000,
    penerimaan: [
      { nama: 'Bagian Amil dari Dana Zakat', current: 7500000, prior: 6250000 },
      { nama: 'Bagian Amil dari Dana Infaq/Sedekah', current: 13000000, prior: 10400000 },
      { nama: 'Penerimaan Lain-lain – Dana Amil', current: 500000, prior: 300000 }
    ],
    penyaluran: [
      { nama: 'Beban Pegawai', current: 15000000, prior: 12000000 },
      { nama: 'Beban Sosialisasi, Kajian dan Layanan Muzaki', current: 2000000, prior: 1500000 },
      { nama: 'Beban Administrasi dan Umum', current: 2500000, prior: 2000000 },
      { nama: 'Beban Non Operasional', current: 500000, prior: 300000 }
    ]
  },
  {
    key: 'hibah', nama: 'DANA HIBAH', saldoAwalBaseline: 10000000,
    penerimaan: [
      { nama: 'Penerimaan Hibah Individu', current: 2000000, prior: 1500000 },
      { nama: 'Penerimaan Hibah Entitas', current: 5000000, prior: 4000000 },
      { nama: 'Selisih Lebih Nilai Tukar/Penilaian – Dana Hibah', current: 0, prior: 0 },
      { nama: 'Penerimaan Bagi Hasil atas Pengelolaan Dana Hibah', current: 100000, prior: 80000 }
    ],
    penyaluran: [
      { nama: 'Penyaluran Hibah untuk Amil', current: 700000, prior: 550000 },
      { nama: 'Penyaluran Hibah untuk Pihak Ketiga', current: 4000000, prior: 3000000 },
      { nama: 'Alokasi Pemanfaatan Aset Kelolaan – Dana Hibah', current: 0, prior: 0 },
      { nama: 'Selisih Kurang Nilai Tukar/Penilaian – Dana Hibah', current: 0, prior: 0 },
      { nama: 'Penyaluran Lain-lain – Dana Hibah', current: 100000, prior: 80000 }
    ]
  },
  {
    key: 'apbn', nama: 'DANA APBN/APBD', saldoAwalBaseline: 0,
    penerimaan: [{ nama: 'Penerimaan Dana APBN/APBD', current: 0, prior: 0 }],
    penyaluran: [
      { nama: 'Penggunaan APBN', current: 0, prior: 0 },
      { nama: 'Penggunaan APBD', current: 0, prior: 0 }
    ]
  },
  {
    key: 'dilarangSyariah', nama: 'DANA YANG DILARANG SYARIAH', saldoAwalBaseline: 6000000,
    penerimaan: [{ nama: 'Penerimaan Dana Yang Dilarang Syariah', current: 800000, prior: 600000 }],
    penyaluran: [{ nama: 'Penyaluran Dana Yang Dilarang Syariah', current: 500000, prior: 400000 }]
  },
  {
    key: 'wakaf', nama: 'DANA WAKAF', saldoAwalBaseline: 15000000,
    penerimaan: [
      { nama: 'Penerimaan Dana Umum', current: 3000000, prior: 2500000 },
      { nama: 'Penerimaan Dana Khusus', current: 8000000, prior: 6000000 }
    ],
    penyaluran: [
      { nama: 'Penyaluran Dana Wakaf Umum', current: 2000000, prior: 1500000 },
      { nama: 'Penyaluran Dana Wakaf Khusus', current: 5000000, prior: 4000000 }
    ]
  },
  {
    key: 'dskl', nama: 'DANA DSKL', saldoAwalBaseline: 2000000,
    penerimaan: [{ nama: 'Penerimaan Dana DSKL', current: 1500000, prior: 1200000 }],
    penyaluran: [{ nama: 'Penyaluran Dana DSKL', current: 800000, prior: 600000 }]
  }
];

// Melengkapi tiap kategori dengan subtotal/surplus/saldo yang dihitung, bukan
// diketik manual, supaya angkanya selalu taat asas (Saldo Awal = Saldo Akhir
// tahun sebelumnya, Saldo Akhir = Saldo Awal + Surplus).
export const getDanaCategories = () => DANA_CATEGORIES_RAW.map(cat => {
  if (cat.groupHeader) return cat;
  const totalPenerimaan = { current: sum(cat.penerimaan, 'current'), prior: sum(cat.penerimaan, 'prior') };
  const totalPenyaluran = { current: sum(cat.penyaluran, 'current'), prior: sum(cat.penyaluran, 'prior') };
  const surplus = { current: totalPenerimaan.current - totalPenyaluran.current, prior: totalPenerimaan.prior - totalPenyaluran.prior };
  const saldoAkhirPrior = cat.saldoAwalBaseline + surplus.prior;
  const saldoAwal = { current: saldoAkhirPrior, prior: cat.saldoAwalBaseline };
  const saldoAkhir = { current: saldoAwal.current + surplus.current, prior: saldoAkhirPrior };
  return { ...cat, totalPenerimaan, totalPenyaluran, surplus, saldoAwal, saldoAkhir };
});

const byKey = (categories, key) => categories.find(c => c.key === key);

// --- LAPORAN ARUS KAS --- dibangun dari total Penerimaan/Penyaluran tiap
// kategori dana di atas, supaya kedua laporan selalu sinkron satu sama lain.
export const getArusKas = () => {
  const cats = getDanaCategories();
  const zakat = byKey(cats, 'zakat');
  const infaqTerikat = byKey(cats, 'infaqTerikat');
  const infaqTidakTerikat = byKey(cats, 'infaqTidakTerikat');
  const amil = byKey(cats, 'amil');
  const hibah = byKey(cats, 'hibah');
  const apbn = byKey(cats, 'apbn');
  const dilarangSyariah = byKey(cats, 'dilarangSyariah');
  const wakaf = byKey(cats, 'wakaf');
  const dskl = byKey(cats, 'dskl');

  const zakatIndividu = zakat.penerimaan.find(p => p.nama === 'Penerimaan Zakat Individu');
  const zakatEntitas = zakat.penerimaan.find(p => p.nama === 'Penerimaan Zakat Entitas');
  const penerimaanLain = { current: hibah.totalPenerimaan.current + apbn.totalPenerimaan.current, prior: hibah.totalPenerimaan.prior + apbn.totalPenerimaan.prior };

  const operasiPenerimaan = [
    { nama: 'Penerimaan Dana Zakat Individu', current: zakatIndividu.current, prior: zakatIndividu.prior },
    { nama: 'Penerimaan Dana Zakat Entitas', current: zakatEntitas.current, prior: zakatEntitas.prior },
    { nama: 'Penerimaan dari Infaq/Sedekah Terikat', current: infaqTerikat.totalPenerimaan.current, prior: infaqTerikat.totalPenerimaan.prior },
    { nama: 'Penerimaan dari Infaq/Sedekah Tidak Terikat', current: infaqTidakTerikat.totalPenerimaan.current, prior: infaqTidakTerikat.totalPenerimaan.prior },
    { nama: 'Penerimaan dari DSKL', current: dskl.totalPenerimaan.current, prior: dskl.totalPenerimaan.prior },
    { nama: 'Penerimaan Dana Amil', current: amil.totalPenerimaan.current, prior: amil.totalPenerimaan.prior },
    { nama: 'Penerimaan Dana Wakaf', current: wakaf.totalPenerimaan.current, prior: wakaf.totalPenerimaan.prior },
    { nama: 'Penerimaan Dana Dilarang Syariah', current: dilarangSyariah.totalPenerimaan.current, prior: dilarangSyariah.totalPenerimaan.prior },
    { nama: 'Penerimaan Lain', current: penerimaanLain.current, prior: penerimaanLain.prior }
  ];

  const penyaluranLain = { current: -(hibah.totalPenyaluran.current + apbn.totalPenyaluran.current + dilarangSyariah.totalPenyaluran.current), prior: -(hibah.totalPenyaluran.prior + apbn.totalPenyaluran.prior + dilarangSyariah.totalPenyaluran.prior) };

  const operasiPengeluaran = [
    { nama: 'Penyaluran Dana Zakat', current: -zakat.totalPenyaluran.current, prior: -zakat.totalPenyaluran.prior },
    { nama: 'Penyaluran Infaq/Sedekah Terikat', current: -infaqTerikat.totalPenyaluran.current, prior: -infaqTerikat.totalPenyaluran.prior },
    { nama: 'Penyaluran Infaq/Sedekah Tidak Terikat', current: -infaqTidakTerikat.totalPenyaluran.current, prior: -infaqTidakTerikat.totalPenyaluran.prior },
    { nama: 'Penggunaan Dana Amil', current: -amil.totalPenyaluran.current, prior: -amil.totalPenyaluran.prior },
    { nama: 'Penyaluran Dana Wakaf', current: -wakaf.totalPenyaluran.current, prior: -wakaf.totalPenyaluran.prior },
    { nama: 'Penyaluran DSKL', current: -dskl.totalPenyaluran.current, prior: -dskl.totalPenyaluran.prior },
    { nama: 'Penyaluran Dana Lainnya (Hibah, APBN/APBD, Dilarang Syariah)', current: penyaluranLain.current, prior: penyaluranLain.prior },
    { nama: 'Kenaikan (penurunan) Beban Dibayar Dimuka', current: 200000, prior: -300000 },
    { nama: 'Kenaikan (penurunan) Uang Muka Kegiatan', current: -1000000, prior: 500000 },
    { nama: 'Kenaikan (penurunan) Piutang', current: 2000000, prior: -1500000 }
  ];

  const investasi = [
    { nama: 'Penjualan/Pertukaran Aset Tetap', current: 0, prior: 0 },
    { nama: 'Penjualan/Pertukaran Aset Tetap Kelolaan', current: 0, prior: 0 },
    { nama: 'Penarikan Investasi Jangka Panjang Dana Amil', current: 0, prior: 0 },
    { nama: 'Pembelian/Pengadaan/Pertukaran Aset Tetap', current: -3000000, prior: -2000000 },
    { nama: 'Pembelian/Pengadaan/Pertukaran Aset Tetap Kelolaan', current: 0, prior: 0 },
    { nama: 'Penempatan Investasi Jangka Panjang Dana Amil', current: 0, prior: 0 }
  ];

  const pendanaan = [
    { nama: 'Penerimaan Pinjaman Jangka Panjang', current: 0, prior: 0 },
    { nama: 'Pengembalian Pinjaman Jangka Panjang', current: 0, prior: 0 }
  ];

  const kasOperasi = {
    current: sum(operasiPenerimaan, 'current') + sum(operasiPengeluaran, 'current'),
    prior: sum(operasiPenerimaan, 'prior') + sum(operasiPengeluaran, 'prior')
  };
  const kasInvestasi = { current: sum(investasi, 'current'), prior: sum(investasi, 'prior') };
  const kasPendanaan = { current: sum(pendanaan, 'current'), prior: sum(pendanaan, 'prior') };
  const kenaikanBersih = {
    current: kasOperasi.current + kasInvestasi.current + kasPendanaan.current,
    prior: kasOperasi.prior + kasInvestasi.prior + kasPendanaan.prior
  };

  const kasAwalBaseline = 20000000; // saldo kas awal 2 tahun lalu (baseline)
  const kasAkhirPrior = kasAwalBaseline + kenaikanBersih.prior;
  const kasAwal = { current: kasAkhirPrior, prior: kasAwalBaseline };
  const kasAkhir = { current: kasAwal.current + kenaikanBersih.current, prior: kasAkhirPrior };

  return {
    operasiPenerimaan, operasiPengeluaran, kasOperasi,
    investasi, kasInvestasi,
    pendanaan, kasPendanaan,
    kenaikanBersih, kasAwal, kasAkhir
  };
};
