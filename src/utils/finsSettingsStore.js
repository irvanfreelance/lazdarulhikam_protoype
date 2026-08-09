// --- SEED DATA FOR FINS SETTINGS MODULE (Kode Bank, Rekening Bank, Program) ---

export const INITIAL_KODE_BANK = [
  { id: '1', kode: '014', bank: 'BCA', description: 'Bank Central Asia' },
  { id: '2', kode: '008', bank: 'Mandiri', description: 'Bank Mandiri (Persero)' },
  { id: '3', kode: '002', bank: 'BRI', description: 'Bank Rakyat Indonesia' },
  { id: '4', kode: '451', bank: 'BSI', description: 'Bank Syariah Indonesia' },
  { id: '5', kode: '022', bank: 'CIMB', description: 'CIMB Niaga' },
  { id: '6', kode: '013', bank: 'Permata', description: 'Bank Permata' },
];

export const INITIAL_REKENING_BANK = [
  { id: '1', bank: 'BCA', accountNumber: '2450123456', description: 'Rekening Operasional Utama', coa: '101.02.001.000', scrap: true, active: true, note: 'Rekening penerimaan donasi harian' },
  { id: '2', bank: 'Mandiri', accountNumber: '1370009988776', description: 'Rekening Penyaluran Program', coa: '101.02.002.000', scrap: true, active: true, note: 'Khusus pencairan dana program' },
  { id: '3', bank: 'BRI', accountNumber: '009301123456789', description: 'Rekening Zakat', coa: '101.01.001.000', scrap: false, active: true, note: '' },
  { id: '4', bank: 'BSI', accountNumber: '7123456780', description: 'Rekening Non Aktif Lama', coa: '101.04.001.000', scrap: false, active: false, note: 'Ditutup Januari 2026' },
];

export const INITIAL_SUMBER_DANA = [
  { id: '1', nama: 'Zakat', active: true },
  { id: '2', nama: 'Infak / Sedekah', active: true },
  { id: '3', nama: 'Wakaf', active: true },
  { id: '4', nama: 'Dana Amil', active: true },
  { id: '5', nama: 'CSR Perusahaan', active: false },
];

export const INITIAL_PROGRAM_PENERIMAAN = [
  { id: '1', nama: 'Zakat Profesi & Maal', sumberDana: 'Zakat', active: true, description: 'Penerimaan zakat rutin individu & perusahaan' },
  { id: '2', nama: 'Donasi Kemanusiaan', sumberDana: 'Infak / Sedekah', active: true, description: 'Donasi bencana alam & kondisi darurat' },
  { id: '3', nama: 'Wakaf Produktif', sumberDana: 'Wakaf', active: true, description: 'Penerimaan wakaf untuk aset produktif' },
];

export const INITIAL_PROGRAM_PENYALURAN = [
  { id: '1', nama: 'Penyaluran Zakat Fakir Miskin', sumberDana: 'Zakat', active: true, description: 'Distribusi zakat kepada mustahik' },
  { id: '2', nama: 'Bantuan Kesehatan', sumberDana: 'Infak / Sedekah', active: true, description: 'Bantuan biaya berobat penerima manfaat' },
  { id: '3', nama: 'Beasiswa Pendidikan', sumberDana: 'Dana Amil', active: false, description: 'Program beasiswa yatim & dhuafa' },
];
