// --- FINS > Laporan > Laporan Bulanan ---
// Menurunkan saldo bulanan (Jan-Des) per akun leaf dari data Trial Balance
// yang sudah ada (saldo awal -> saldo akhir periode berjalan), lalu
// menyediakan evaluator rumus supaya baris-baris Rumus Report (Laporan
// Posisi Keuangan/Aktivitas/Arus Kas) bisa dihitung nilainya per bulan.

import { INITIAL_COA, INITIAL_TRIAL_BALANCE } from './finsCoaStore';

export const MONTHS = [
  { key: 'jan', label: 'Jan-26' },
  { key: 'feb', label: 'Feb-26' },
  { key: 'mar', label: 'Mar-26' },
  { key: 'apr', label: 'Apr-26' },
  { key: 'mei', label: 'Mei-26' },
  { key: 'jun', label: 'Jun-26' },
  { key: 'jul', label: 'Jul-26' },
  { key: 'agu', label: 'Agu-26' },
  { key: 'sep', label: 'Sep-26' },
  { key: 'okt', label: 'Okt-26' },
  { key: 'nov', label: 'Nov-26' },
  { key: 'des', label: 'Des-26' },
];
const RUNNING_MONTHS = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun'];
export const LATEST_DATA_MONTH = 'jun';

// Progres linear dari saldo awal (2025, penutupan tahun lalu) menuju saldo
// akhir periode berjalan (dari Trial Balance) untuk 6 bulan pertama; Jul-Des
// belum berjalan (0,00) karena periode belum ditutup.
const buildMonthlySeries = () => {
  const map = {};
  INITIAL_TRIAL_BALANCE.forEach(m => {
    const start = m.saldoAwal;
    const end = m.saldoAwal + m.debetMutasi - m.kreditMutasi;
    const series = { y2025: start };
    RUNNING_MONTHS.forEach((k, i) => {
      series[k] = Math.round((start + (end - start) * ((i + 1) / RUNNING_MONTHS.length)) * 100) / 100;
    });
    MONTHS.filter(m2 => !RUNNING_MONTHS.includes(m2.key)).forEach(m2 => { series[m2.key] = 0; });
    map[m.coa] = series;
  });
  return map;
};

export const MONTHLY_LEAF_BALANCES = buildMonthlySeries();

const childrenMap = INITIAL_COA.reduce((acc, c) => {
  if (c.parentCoa) (acc[c.parentCoa] = acc[c.parentCoa] || []).push(c);
  return acc;
}, {});

// Node bisa punya saldo sendiri SEKALIGUS anak (mis. Aset Inventaris ->
// Akumulasi Penyusutan), jadi keduanya dijumlahkan (lihat juga TrialBalance).
export const getMonthlyBalance = (coa, monthKey) => {
  const own = MONTHLY_LEAF_BALANCES[coa]?.[monthKey] || 0;
  const children = childrenMap[coa] || [];
  if (children.length === 0) return own;
  return children.reduce((sum, child) => sum + getMonthlyBalance(child.coa, monthKey), own);
};

// Rumus disimpan sbg teks bebas (mis. "101.01.000.000+101.02.000.000" atau
// "(401.01.000.000)-(501.01.000.000)"); setiap kode akun diganti nilainya
// lalu ekspresi aritmetika hasil substitusi dievaluasi.
export const evaluateRumus = (rumus, monthKey) => {
  if (!rumus) return 0;
  const expr = rumus.replace(/\d+(?:\.\d+)*/g, (code) => `(${getMonthlyBalance(code, monthKey)})`);
  if (!/^[\d+\-*/(). \s]*$/.test(expr)) return 0;
  try {
    // eslint-disable-next-line no-new-func
    return Function(`"use strict"; return (${expr || 0})`)();
  } catch {
    return 0;
  }
};
