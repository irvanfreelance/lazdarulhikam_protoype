// --- CRM > Transaksi > List Transaksi Rutin ---
// Pivot donatur x bulan, diturunkan dari data transaksi (crmTransaksiStore)
// yang sudah ada, dipersempit ke donatur dengan `kesediaanDonasi` rutin
// (Rutin Bulanan / Rutin Mingguan) — supaya konsisten dengan menu List
// Transaksi & List Donatur (satu sumber data yang sama).

import { INITIAL_DONATUR } from './donaturStore';
import { INITIAL_TRANSAKSI } from './crmTransaksiStore';

const ROUTINE_KESEDIAAN = ['Rutin Bulanan', 'Rutin Mingguan'];

export const TAHUN_OPTIONS = [2025, 2026, 2027];
export const MONTHS = [
  { key: 1, label: 'Jan' }, { key: 2, label: 'Feb' }, { key: 3, label: 'Mar' },
  { key: 4, label: 'Apr' }, { key: 5, label: 'Mei' }, { key: 6, label: 'Jun' },
  { key: 7, label: 'Jul' }, { key: 8, label: 'Agu' }, { key: 9, label: 'Sep' },
  { key: 10, label: 'Okt' }, { key: 11, label: 'Nov' }, { key: 12, label: 'Des' }
];

const routineDonorIds = new Set(
  INITIAL_DONATUR.filter(d => ROUTINE_KESEDIAAN.includes(d.kesediaanDonasi)).map(d => d.id)
);

export const ROUTINE_DONATUR = INITIAL_DONATUR
  .filter(d => routineDonorIds.has(d.id))
  .map(d => ({
    id: d.id,
    nama: d.nama,
    timCrm: d.timCrm || '-',
    kantor: d.kantor,
    transaksi: INITIAL_TRANSAKSI
      .filter(t => t.idDonatur === d.id)
      .map(t => ({
        tanggalTransaksi: t.tglTransaksi.slice(0, 10),
        tanggalPeruntukan: t.peruntukan,
        program: t.program,
        nominal: t.nominal * t.qty
      }))
  }));
