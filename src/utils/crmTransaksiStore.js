// --- CRM > Transaksi > Entry Transaksi ---

import { INITIAL_DONATUR } from './donaturStore';

export const VIA_HIMPUN_OPTIONS = ['Teller', 'Digital', 'Kotak Amal', 'Kunjungan Donatur', 'Payroll'];
export const JENIS_TRANSAKSI_OPTIONS = ['Bank', 'Cash'];

export const PROGRAM_TRANSAKSI = [
  { coa: '401.01.000.000', nama: 'Zakat Penghasilan' },
  { coa: '401.02.000.000', nama: 'Zakat Maal' },
  { coa: '401.03.000.000', nama: 'Zakat uang dan surat berharga' },
  { coa: '402.01.000.000', nama: 'Infak / Sedekah Umum' },
  { coa: '402.02.000.000', nama: 'Infak / Sedekah Terikat' },
  { coa: '407.01.000.000', nama: 'Wakaf Uang' },
  { coa: '409.01.000.000', nama: 'Qurban' }
];

export const CURRENT_USER = { id: '1032021001001', nama: 'Asep Saepul', username: 'asep.pi' };

// --- CRM > Transaksi > List Transaksi ---
// Data fiktif untuk keperluan tampilan/demo — bukan data transaksi sungguhan.

export const STATUS_TRANSAKSI_OPTIONS = ['Approved', 'Pending', 'Rejected'];
const KANTOR_TRANSAKSI_LIST = ['PI - Pusat', 'PI - Pusat', 'PI - Pusat', 'PI - Cabang Bandung', 'PI - Cabang Surabaya'];
const STAFF_NAMES = ['Aulia Anugraha', 'Irfan Abdurrahman', 'Desy Bunga Sari', 'Auliya Putri', 'Ahmad Faisal'];
const BANK_LIST = ['BSI Penyaluran 8889292939', 'BRI Penerimaan', 'BSI Payroll 8889292928'];

let idTransCounter = 1;
const generateIdTransaksi = (dateStr) => {
  const [, mm, dd] = dateStr.split('-');
  const seq = String(idTransCounter++).padStart(6, '0');
  return `9001${mm}${dd}${seq}${String(1000 + (idTransCounter % 9000)).padStart(4, '0')}`;
};

// Builds a fictional donation-transaction ledger tied to `donaturList` (from
// donaturStore.js) so ID Donatur / Nama Donatur / Tim CRM stay consistent
// with the CRM > Donatur data. Every ~6th row simulates an anonymous/quick
// transaction ("Donatur Sementara") the way walk-in/kotak-amal donations do.
export const generateFakeTransaksiList = (count, donaturList) => {
  const list = [];
  const startDate = new Date('2026-01-05T00:00:00');
  for (let i = 0; i < count; i++) {
    const isAnon = i % 6 === 0;
    const donatur = !isAnon ? donaturList[i % donaturList.length] : null;
    const program = PROGRAM_TRANSAKSI[(i * 3 + 1) % PROGRAM_TRANSAKSI.length];
    const staff = STAFF_NAMES[i % STAFF_NAMES.length];

    const d = new Date(startDate);
    d.setDate(d.getDate() + (i % 220));
    const hh = String(8 + (i % 10)).padStart(2, '0');
    const mi = String((i * 7) % 60).padStart(2, '0');
    const ss = String((i * 13) % 60).padStart(2, '0');
    const dateStr = d.toISOString().slice(0, 10);
    const peruntukanD = new Date(d);
    peruntukanD.setDate(peruntukanD.getDate() + (i % 3));

    const jenisTransaksi = i % 3 === 0 ? 'Cash' : 'Bank';
    const nominal = [25000, 50000, 100000, 200000, 500000, 1000000, 1500000, 2000000][i % 8] + (i % 5) * 10000;
    const namaDonatur = donatur ? donatur.nama : 'Donatur Sementara';

    list.push({
      id: generateIdTransaksi(dateStr),
      idDonatur: donatur ? donatur.id : '9999999999999',
      namaDonatur,
      program: program.nama,
      qty: 1,
      nominal,
      kantorTransaksi: KANTOR_TRANSAKSI_LIST[i % KANTOR_TRANSAKSI_LIST.length],
      userInsert: staff,
      tglTransaksi: `${dateStr} ${hh}:${mi}:${ss}`,
      peruntukan: peruntukanD.toISOString().slice(0, 10),
      idTimCrm: donatur?.idTimCrm || '',
      timCrm: donatur?.timCrm || '',
      viaHimpun: VIA_HIMPUN_OPTIONS[i % VIA_HIMPUN_OPTIONS.length],
      jenisTransaksi,
      bank: jenisTransaksi === 'Bank' ? BANK_LIST[i % BANK_LIST.length] : '',
      status: i % 17 === 0 ? 'Rejected' : (i % 11 === 0 ? 'Pending' : 'Approved'),
      keterangan: `an: ${namaDonatur} | ${program.nama}`
    });
  }
  return list;
};

export const INITIAL_TRANSAKSI = generateFakeTransaksiList(500, INITIAL_DONATUR);
