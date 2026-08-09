// --- SEED DATA FOR BUKU BESAR (GENERAL LEDGER) — MODUL FINS > AKUNTANSI ---
// Setiap transaksi dicatat sebagai 2+ baris ledger yang saling seimbang
// (total Debet = total Kredit per idTransaksi), sesuai prinsip double-entry.

export const INITIAL_BUKU_BESAR = [
  // TX1 — Penerimaan Zakat Profesi (Kantor Pusat)
  { id: '1', tanggal: '2026-08-01', coa: '101.01.001.000', jenisTransaksi: 'Kas Pusat', debet: 500000, kredit: 0, keterangan: 'an: Hamba Allah | Zakat Profesi Agustus', noResi: '226080100113560', idBuku: 'R0082601010001', idTransaksi: '0082601010001', officeId: '1' },
  { id: '2', tanggal: '2026-08-01', coa: '401.01.000.000', jenisTransaksi: 'Zakat Profesi & Maal', debet: 0, kredit: 500000, keterangan: 'an: Hamba Allah | Zakat Profesi Agustus', noResi: '226080100113560', idBuku: 'R0082601010001', idTransaksi: '0082601010001', officeId: '1' },

  // TX2 — Penerimaan Infak QRIS (Cabang Bandung)
  { id: '3', tanggal: '2026-08-02', coa: '101.02.000.000', jenisTransaksi: 'Bank', debet: 250000, kredit: 0, keterangan: 'QR 020826 INFAK SEDEKAH Peradaban', noResi: '226080200110994', idBuku: 'R0082602020002', idTransaksi: '0082602020002', officeId: '2' },
  { id: '4', tanggal: '2026-08-02', coa: '402.01.000.000', jenisTransaksi: 'Infak Umum', debet: 0, kredit: 250000, keterangan: 'QR 020826 INFAK SEDEKAH Peradaban', noResi: '226080200110994', idBuku: 'R0082602020002', idTransaksi: '0082602020002', officeId: '2' },

  // TX3 — Penyaluran Zakat Fakir Miskin (Kantor Pusat)
  { id: '5', tanggal: '2026-08-03', coa: '501.01.000.000', jenisTransaksi: 'Penyaluran Zakat Fakir Miskin', debet: 2000000, kredit: 0, keterangan: 'Penyaluran zakat kepada mustahik - Desa Suka Maju', noResi: '', idBuku: 'B0082603030003', idTransaksi: '0082603030003', officeId: '1' },
  { id: '6', tanggal: '2026-08-03', coa: '101.01.001.000', jenisTransaksi: 'Kas Pusat', debet: 0, kredit: 2000000, keterangan: 'Penyaluran zakat kepada mustahik - Desa Suka Maju', noResi: '', idBuku: 'B0082603030003', idTransaksi: '0082603030003', officeId: '1' },

  // TX4 — Beban Biaya Kantor (Kantor Pusat)
  { id: '7', tanggal: '2026-08-05', coa: '502.02.000.000', jenisTransaksi: 'Biaya Kantor', debet: 1250000, kredit: 0, keterangan: 'Pembayaran listrik & internet kantor Agustus', noResi: '', idBuku: 'B0082605050004', idTransaksi: '0082605050004', officeId: '1' },
  { id: '8', tanggal: '2026-08-05', coa: '101.02.000.000', jenisTransaksi: 'Bank', debet: 0, kredit: 1250000, keterangan: 'Pembayaran listrik & internet kantor Agustus', noResi: '', idBuku: 'B0082605050004', idTransaksi: '0082605050004', officeId: '1' },

  // TX5 — Pembayaran Gaji Karyawan (Kantor Pusat)
  { id: '9', tanggal: '2026-08-07', coa: '502.01.000.000', jenisTransaksi: 'Gaji Karyawan', debet: 12000000, kredit: 0, keterangan: 'Pembayaran gaji karyawan periode Juli 2026', noResi: '', idBuku: 'B0082607070005', idTransaksi: '0082607070005', officeId: '1' },
  { id: '10', tanggal: '2026-08-07', coa: '101.02.000.000', jenisTransaksi: 'Bank', debet: 0, kredit: 12000000, keterangan: 'Pembayaran gaji karyawan periode Juli 2026', noResi: '', idBuku: 'B0082607070005', idTransaksi: '0082607070005', officeId: '1' },

  // TX6 — Jurnal Penyesuaian: Penyusutan Aset Tetap (non-kas)
  { id: '11', tanggal: '2026-08-08', coa: '502.03.000.000', jenisTransaksi: 'Beban Penyusutan Aset Tetap', debet: 416667, kredit: 0, keterangan: 'Penyusutan bulanan Laptop ASUS ROG', noResi: '', idBuku: 'J0082608080006', idTransaksi: '0082608080006', officeId: '1' },
  { id: '12', tanggal: '2026-08-08', coa: '102.01.001.000', jenisTransaksi: 'Akumulasi Penyusutan Aset Tetap', debet: 0, kredit: 416667, keterangan: 'Penyusutan bulanan Laptop ASUS ROG', noResi: '', idBuku: 'J0082608080006', idTransaksi: '0082608080006', officeId: '1' },

  // TX7 — Pelunasan Piutang Donatur (Kantor Pusat)
  { id: '13', tanggal: '2026-08-09', coa: '101.01.001.000', jenisTransaksi: 'Kas Pusat', debet: 3000000, kredit: 0, keterangan: 'Pelunasan janji zakat PT ABC Sejahtera', noResi: '226080900117788', idBuku: 'R0082609090007', idTransaksi: '0082609090007', officeId: '1' },
  { id: '14', tanggal: '2026-08-09', coa: '101.03.000.000', jenisTransaksi: 'Piutang Donatur', debet: 0, kredit: 3000000, keterangan: 'Pelunasan janji zakat PT ABC Sejahtera', noResi: '226080900117788', idBuku: 'R0082609090007', idTransaksi: '0082609090007', officeId: '1' }
];

export const GROUP_BY_OPTIONS = ['ID Buku Perhari', 'COA', 'Kantor'];
export const SALDO_AWAL_VIA_OPTIONS = ['Closing', 'Manual'];

// Saldo yang dibawa dari penutupan periode sebelumnya, dipakai saat
// "Saldo Awal Via" = Closing (tidak bisa diedit manual).
export const CLOSING_SALDO_AWAL = 0;

// --- JURNAL (manual adjusting entries, ditampilkan di panel bawah Buku Besar) ---
export const INITIAL_JURNAL_MANUAL = [
  { id: '1', tanggal: '2026-08-08', noJurnal: 'JRN-2026-0801', keterangan: 'Penyusutan bulanan Laptop ASUS ROG (AJE)', coaDebet: '502.03.000.000', coaKredit: '102.01.001.000', nominal: 416667, dibuatOleh: 'Asep Setiawan' }
];
