// --- SEED DATA FOR CHART OF ACCOUNTS, COA KANTOR, SALDO DANA, LEVEL APPROVE, RUMUS REPORT ---

export const INITIAL_COA = [
  { id: '1', coa: '100.00.000.000', nama: 'AKTIVA', parentCoa: null, group: 'Aset', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '2', coa: '200.00.000.000', nama: 'KEWAJIBAN', parentCoa: null, group: 'Kewajiban', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '3', coa: '300.00.000.000', nama: 'EKUITAS / DANA', parentCoa: null, group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '4', coa: '400.00.000.000', nama: 'PENERIMAAN', parentCoa: null, group: 'Penerimaan', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '5', coa: '500.00.000.000', nama: 'BEBAN', parentCoa: null, group: 'Beban', officeId: '', positionId: '', aktif: true, includeBuku: false },

  { id: '6', coa: '101.00.000.000', nama: 'Aset Lancar', parentCoa: '100.00.000.000', group: 'Aset', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '7', coa: '102.00.000.000', nama: 'Aset Tidak Lancar', parentCoa: '100.00.000.000', group: 'Aset', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '8', coa: '201.00.000.000', nama: 'Kewajiban Jangka Pendek', parentCoa: '200.00.000.000', group: 'Kewajiban', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '9', coa: '301.00.000.000', nama: 'Dana Tidak Terikat', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
  { id: '10', coa: '302.00.000.000', nama: 'Dana Terikat', parentCoa: '300.00.000.000', group: 'Ekuitas', officeId: '', positionId: '', aktif: true, includeBuku: false },
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
];

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

export const INITIAL_SALDO_DANA = [
  { id: '1', coa: '101.01.000.000', coaExpense: '502.02.000.000', coaRevenue: '401.01.000.000', operasional: false, aktif: true },
  { id: '2', coa: '101.02.000.000', coaExpense: '502.01.000.000', coaRevenue: '402.01.000.000', operasional: true, aktif: true },
  { id: '3', coa: '101.03.000.000', coaExpense: '', coaRevenue: '401.01.000.000', operasional: false, aktif: true },
  { id: '4', coa: '102.01.000.000', coaExpense: '502.02.000.000', coaRevenue: '', operasional: true, aktif: true },
  { id: '5', coa: '201.01.000.000', coaExpense: '501.01.000.000', coaRevenue: '401.01.000.000', operasional: false, aktif: false },
];

export const INITIAL_LEVEL_APPROVE = [
  { id: '1', jabatan: 'Staff Keuangan', expendMin: 0, expendMax: 1000000, receiptMin: 0, receiptMax: 5000000, aktif: true },
  { id: '2', jabatan: 'Kepala Divisi', expendMin: 1000001, expendMax: 10000000, receiptMin: 5000001, receiptMax: 50000000, aktif: true },
  { id: '3', jabatan: 'Manager Keuangan', expendMin: 10000001, expendMax: 50000000, receiptMin: 50000001, receiptMax: 200000000, aktif: true },
  { id: '4', jabatan: 'Direktur', expendMin: 50000001, expendMax: null, receiptMin: 200000001, receiptMax: null, aktif: true },
];

export const INITIAL_RUMUS_TEMPLATES = {
  'Laporan Posisi Keuangan': [
    { id: 1, nama: 'Kas', rumus: '101.01.000.000', level: 1, keterangan: 'Kas di tangan dan kas kecil', kode: '1.1', sort: 1, locked: false },
    { id: 2, nama: 'Bank', rumus: '101.02.000.000', level: 1, keterangan: 'Saldo rekening bank operasional', kode: '1.2', sort: 2, locked: true },
    { id: 3, nama: 'Piutang Donatur', rumus: '101.03.000.000', level: 1, keterangan: '', kode: '1.3', sort: 3, locked: false },
    { id: 4, nama: 'Total Aset Lancar', rumus: '101.01.000.000+101.02.000.000+101.03.000.000', level: 2, keterangan: 'Subtotal aset lancar', kode: '1.9', sort: 4, locked: false },
    { id: 5, nama: 'Aset Inventaris', rumus: '102.01.000.000', level: 1, keterangan: '', kode: '2.1', sort: 5, locked: false },
    { id: 6, nama: 'Total Aset Tidak Lancar', rumus: '102.01.000.000', level: 2, keterangan: '', kode: '2.9', sort: 6, locked: false },
    { id: 7, nama: 'Total Aset', rumus: '101.01.000.000+101.02.000.000+101.03.000.000+102.01.000.000', level: 3, keterangan: 'Total keseluruhan aset', kode: '9.1', sort: 7, locked: false },
    { id: 8, nama: 'Titipan Dana Zakat', rumus: '201.01.000.000', level: 1, keterangan: '', kode: '3.1', sort: 8, locked: false },
    { id: 9, nama: 'Total Kewajiban', rumus: '201.01.000.000', level: 2, keterangan: '', kode: '3.9', sort: 9, locked: false },
  ],
  'Laporan Aktivitas': [
    { id: 1, nama: 'Penerimaan Zakat', rumus: '401.01.000.000', level: 1, keterangan: '', kode: '4.1', sort: 1, locked: false },
    { id: 2, nama: 'Penerimaan Infak/Sedekah', rumus: '402.01.000.000', level: 1, keterangan: '', kode: '4.2', sort: 2, locked: false },
    { id: 3, nama: 'Total Penerimaan', rumus: '401.01.000.000+402.01.000.000', level: 2, keterangan: '', kode: '4.9', sort: 3, locked: false },
    { id: 4, nama: 'Penyaluran Zakat', rumus: '501.01.000.000', level: 1, keterangan: '', kode: '5.1', sort: 4, locked: false },
  ],
  'Laporan Arus Kas': [
    { id: 1, nama: 'Saldo Kas Awal', rumus: '101.01.000.000', level: 1, keterangan: 'Saldo kas & bank awal periode', kode: '6.1', sort: 1, locked: false },
    { id: 2, nama: 'Penerimaan Kas', rumus: '401.01.000.000+402.01.000.000', level: 1, keterangan: '', kode: '6.2', sort: 2, locked: false },
    { id: 3, nama: 'Pengeluaran Kas', rumus: '501.01.000.000+502.01.000.000+502.02.000.000', level: 1, keterangan: '', kode: '6.3', sort: 3, locked: false },
  ],
};
