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

// --- DASHBOARD CASH BANK ---
// Saldo per akun kas/bank, dipecah per kantor. `lastOpname: null` berarti akun ini
// belum pernah di-opname sama sekali (selalu tampil sebagai peringatan penuh).
export const INITIAL_CASH_BANK_ACCOUNTS = [
  { id: '1', coa: '101.01.001.000', namaAkun: 'Kas Pusat', officeId: '1', saldoAwal: 5000000, debet: 1200000, kredit: 800000, lastOpname: null, closing: false, active: true },
  { id: '2', coa: '101.02.001.001', namaAkun: 'BRI Penerimaan', officeId: '1', saldoAwal: 82500000, debet: 15000000, kredit: 4200000, lastOpname: null, closing: false, active: true },
  { id: '3', coa: '101.02.001.002', namaAkun: 'BSI Penerimaan', officeId: '1', saldoAwal: 64000000, debet: 9800000, kredit: 2100000, lastOpname: null, closing: false, active: true },
  { id: '4', coa: '101.02.001.003', namaAkun: 'Bank Mandiri Penerimaan', officeId: '1', saldoAwal: 41250000, debet: 6300000, kredit: 1500000, lastOpname: null, closing: false, active: true },
  { id: '5', coa: '101.02.003.001', namaAkun: 'Bank Mandiri Amil', officeId: '1', saldoAwal: 18750000, debet: 2500000, kredit: 1800000, lastOpname: '2026-07-02', closing: false, active: true },
  { id: '6', coa: '101.02.002.001', namaAkun: 'Bank Mandiri Penyaluran', officeId: '1', saldoAwal: 55000000, debet: 3000000, kredit: 12500000, lastOpname: null, closing: false, active: true },
  { id: '7', coa: '101.02.003.002', namaAkun: 'BSI Payroll', officeId: '1', saldoAwal: 32000000, debet: 0, kredit: 12000000, lastOpname: null, closing: true, active: true },
  { id: '8', coa: '101.02.003.003', namaAkun: 'BSI Dana Pengelola', officeId: '1', saldoAwal: 27500000, debet: 4500000, kredit: 900000, lastOpname: null, closing: false, active: true },
  { id: '9', coa: '101.02.002.002', namaAkun: 'BSI Sisa Salur', officeId: '1', saldoAwal: 6200000, debet: 0, kredit: 0, lastOpname: null, closing: false, active: true },
  { id: '10', coa: '101.02.002.003', namaAkun: 'BSI Penyaluran', officeId: '1', saldoAwal: 47800000, debet: 2200000, kredit: 9600000, lastOpname: '2025-12-31', closing: false, active: true },
  { id: '11', coa: '101.01.001.000', namaAkun: 'Kas Kecil Cabang Bandung', officeId: '2', saldoAwal: 3500000, debet: 900000, kredit: 650000, lastOpname: '2026-08-06', closing: false, active: true },
  { id: '12', coa: '101.02.001.004', namaAkun: 'BCA Penerimaan Cabang Bandung', officeId: '2', saldoAwal: 21000000, debet: 3100000, kredit: 800000, lastOpname: null, closing: false, active: false },
  { id: '13', coa: '101.02.099.001', namaAkun: 'Midtrans', officeId: '1', saldoAwal: 9800000, debet: 2400000, kredit: 2400000, lastOpname: null, closing: false, active: true },
  { id: '14', coa: '101.02.099.002', namaAkun: 'Link Aja', officeId: '1', saldoAwal: 3200000, debet: 750000, kredit: 750000, lastOpname: null, closing: false, active: true },
  { id: '15', coa: '101.02.099.003', namaAkun: 'Shopeepay', officeId: '1', saldoAwal: 4100000, debet: 980000, kredit: 980000, lastOpname: null, closing: false, active: true },
  { id: '16', coa: '101.02.099.004', namaAkun: 'Xendit', officeId: '1', saldoAwal: 12600000, debet: 3300000, kredit: 3300000, lastOpname: null, closing: false, active: true },
  { id: '17', coa: '101.02.099.005', namaAkun: 'GoPay', officeId: '1', saldoAwal: 2750000, debet: 600000, kredit: 600000, lastOpname: null, closing: false, active: true },
  { id: '18', coa: '101.01.001.000', namaAkun: 'Kas Kecil Cabang Surabaya', officeId: '3', saldoAwal: 2900000, debet: 500000, kredit: 300000, lastOpname: null, closing: false, active: true },
  { id: '19', coa: '101.02.001.005', namaAkun: 'BNI Penerimaan Cabang Surabaya', officeId: '3', saldoAwal: 17500000, debet: 2100000, kredit: 950000, lastOpname: null, closing: false, active: true },
  { id: '20', coa: '101.01.001.000', namaAkun: 'Kas Kecil Cabang Medan', officeId: '4', saldoAwal: 1800000, debet: 400000, kredit: 250000, lastOpname: null, closing: false, active: true },
  { id: '21', coa: '101.02.001.006', namaAkun: 'Mandiri Penerimaan Cabang Medan', officeId: '4', saldoAwal: 13200000, debet: 1600000, kredit: 700000, lastOpname: null, closing: false, active: true }
];

// Ringkasan pengajuan/transaksi FINS yang masih menunggu approval hari ini.
export const INITIAL_UNAPPROVED_TODAY = {
  pengajuan: 4,
  pencairan: 0,
  pertanggungjawaban: 3,
  pengeluaran: 2,
  penerimaan: 2,
  penutupanClosed: 0,
  penutupanTotal: 21
};
