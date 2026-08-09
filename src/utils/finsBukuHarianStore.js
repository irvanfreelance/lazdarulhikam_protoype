// --- SEED DATA FOR BUKU HARIAN (Buku Bank / Buku Kas) — MODUL FINS > HOME ---
// Setiap "Buku" adalah satu akun kas/bank spesifik. Baris transaksi mencatat
// mutasi buku tsb dari sudut pandang buku itu sendiri (Debet = uang masuk ke
// buku, Kredit = uang keluar), dengan COA/Jenis Transaksi menunjukkan akun
// lawan (counterpart) dari jurnal double-entry-nya.

export const BUKU_ACCOUNTS = [
  { coa: '101.01.001.000', nama: 'Kas Pusat', jenis: 'kas', officeId: '1', saldoAwal: 5000000 },
  { coa: '101.01.002.000', nama: 'Kas Kecil Cabang Bandung', jenis: 'kas', officeId: '2', saldoAwal: 1500000 },
  { coa: '101.02.001.001', nama: 'BRI Penerimaan', jenis: 'bank', officeId: '1', saldoAwal: 82500000 },
  { coa: '101.02.002.002', nama: 'BSI Payroll 8889292928', jenis: 'bank', officeId: '1', saldoAwal: 3790000 },
  { coa: '101.02.002.005', nama: 'BSI Penyaluran 8889292939', jenis: 'bank', officeId: '1', saldoAwal: 47800000 },
  { coa: '101.02.003.003', nama: 'BSI Dana Pengelola', jenis: 'bank', officeId: '1', saldoAwal: 27500000 }
];

export const STATUS_OPTIONS = ['Approved', 'Pending', 'Rejected'];
export const INPUT_VIA_OPTIONS = ['Manual', 'Sistem', 'Import'];
export const VIEW_OPTIONS = ['Normal', 'Ringkas'];

export const INITIAL_BUKU_HARIAN = [
  // --- Kas Pusat ---
  { id: '1', bukuCoa: '101.01.001.000', tanggal: '2026-08-01', coa: '401.01.000.000', jenisTransaksi: 'Zakat Profesi & Maal', keterangan: 'Setoran tunai zakat profesi', debet: 500000, kredit: 0, noResi: '226080100113560', userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', program: '', idBuku: 'K0082608010001', idTransaksi: 'T0082608010001', tglInput: '2026-08-01', officeId: '1', coaDebet: '101.01.001.000', coaKredit: '401.01.000.000', idReferensi: '', referensi: '', idDonatur: 'DNT-000045', donatur: 'Hamba Allah', status: 'Approved', inputVia: 'Manual' },
  { id: '2', bukuCoa: '101.01.001.000', tanggal: '2026-08-03', coa: '501.01.000.000', jenisTransaksi: 'Penyaluran Zakat Fakir Miskin', keterangan: 'Penyaluran zakat kepada mustahik - Desa Suka Maju', debet: 0, kredit: 2000000, noResi: '', userInput: 'Irfan Abdurrahman', userApprove: 'Desy Bunga Sari', program: 'Penyaluran Zakat', idBuku: 'K0082608030002', idTransaksi: 'T0082608030002', tglInput: '2026-08-03', officeId: '1', coaDebet: '501.01.000.000', coaKredit: '101.01.001.000', idReferensi: 'DSB-2026-000001', referensi: 'Pengajuan Penyaluran', idDonatur: '', donatur: '', status: 'Approved', inputVia: 'Sistem' },
  { id: '3', bukuCoa: '101.01.001.000', tanggal: '2026-08-09', coa: '101.03.000.000', jenisTransaksi: 'Piutang Donatur', keterangan: 'Pelunasan janji zakat PT ABC Sejahtera', debet: 3000000, kredit: 0, noResi: '226080900117788', userInput: 'Aulia Anugraha', userApprove: '', program: '', idBuku: 'K0082609090003', idTransaksi: 'T0082609090003', tglInput: '2026-08-09', officeId: '1', coaDebet: '101.01.001.000', coaKredit: '101.03.000.000', idReferensi: '', referensi: '', idDonatur: 'DNT-000012', donatur: 'PT ABC Sejahtera', status: 'Pending', inputVia: 'Manual' },

  // --- BSI Payroll 8889292928 ---
  { id: '4', bukuCoa: '101.02.002.002', tanggal: '2026-07-27', coa: '101.02.002.005', jenisTransaksi: 'BSI Penyaluran 8889292939', keterangan: 'Mutasi dari BSI Penyaluran 8889292939', debet: 79985000, kredit: 0, noResi: '726072700100001', userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', program: 'BSI Penyaluran', idBuku: 'K0012607290010001', idTransaksi: 'K00126072900100', tglInput: '2026-07-29', officeId: '1', coaDebet: '101.02.002.002', coaKredit: '101.02.002.005', idReferensi: '', referensi: '', idDonatur: '', donatur: '', status: 'Approved', inputVia: 'Sistem' },
  { id: '5', bukuCoa: '101.02.002.002', tanggal: '2026-07-28', coa: '503.01.001.000', jenisTransaksi: 'Hak Amil Pokok', keterangan: 'Payroll 0726', debet: 0, kredit: 79985000, noResi: '326072800100006', userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', program: '', idBuku: 'E0012607280020004', idTransaksi: 'E00126072800200', tglInput: '2026-08-05', officeId: '1', coaDebet: '503.01.001.000', coaKredit: '101.02.002.002', idReferensi: '', referensi: '', idDonatur: '', donatur: '', status: 'Approved', inputVia: 'Manual' },
  { id: '6', bukuCoa: '101.02.002.002', tanggal: '2026-07-28', coa: '503.03.002.000', jenisTransaksi: 'Beban Administrasi Bank', keterangan: 'Beban Administrasi Bank', debet: 0, kredit: 17000, noResi: '326072800100006', userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', program: '', idBuku: 'E0012607280030004', idTransaksi: 'E00126072800300', tglInput: '2026-08-05', officeId: '1', coaDebet: '503.03.002.000', coaKredit: '101.02.002.002', idReferensi: '', referensi: '', idDonatur: '', donatur: '', status: 'Approved', inputVia: 'Sistem' },
  { id: '7', bukuCoa: '101.02.002.002', tanggal: '2026-07-31', coa: '503.03.002.000', jenisTransaksi: 'Beban Administrasi Bank', keterangan: 'Beban Administrasi Bank', debet: 0, kredit: 15000, noResi: '326073100100001', userInput: 'Aulia Anugraha', userApprove: 'Desy Bunga Sari', program: '', idBuku: 'E0012607310030001', idTransaksi: 'E00126073100300', tglInput: '2026-08-05', officeId: '1', coaDebet: '503.03.002.000', coaKredit: '101.02.002.002', idReferensi: '', referensi: '', idDonatur: '', donatur: '', status: 'Approved', inputVia: 'Sistem' },

  // --- BRI Penerimaan ---
  { id: '8', bukuCoa: '101.02.001.001', tanggal: '2026-08-02', coa: '401.01.000.000', jenisTransaksi: 'Zakat Profesi & Maal', keterangan: 'Transfer zakat profesi Agustus', debet: 15000000, kredit: 0, noResi: '226080200110994', userInput: 'Aulia Anugraha', userApprove: 'Irfan Abdurrahman', program: '', idBuku: 'R0082608020001', idTransaksi: 'T0082608020001', tglInput: '2026-08-02', officeId: '1', coaDebet: '101.02.001.001', coaKredit: '401.01.000.000', idReferensi: '', referensi: '', idDonatur: 'DNT-000078', donatur: 'Budi Santoso', status: 'Approved', inputVia: 'Import' },
  { id: '9', bukuCoa: '101.02.001.001', tanggal: '2026-08-06', coa: '101.02.003.003', jenisTransaksi: 'BSI Dana Pengelola', keterangan: 'Transfer bagian amil ke rekening operasional', debet: 0, kredit: 4200000, noResi: '', userInput: 'Irfan Abdurrahman', userApprove: '', program: '', idBuku: 'B0082608060002', idTransaksi: 'T0082608060002', tglInput: '2026-08-06', officeId: '1', coaDebet: '101.02.003.003', coaKredit: '101.02.001.001', idReferensi: '', referensi: '', idDonatur: '', donatur: '', status: 'Pending', inputVia: 'Manual' }
];
