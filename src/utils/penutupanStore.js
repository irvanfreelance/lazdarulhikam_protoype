// --- FINS > Home > Penutupan (Cash Opname / Bank Opname) ---

export const PECAHAN_KERTAS = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 100];
export const PECAHAN_LOGAM = [1000, 500, 200, 100, 50, 25];

export const emptyDenom = (list) => list.reduce((acc, n) => { acc[n] = 0; return acc; }, {});

// Satu rekaman penutupan sebelumnya (Kas Pusat, 2026-08-08) supaya alur
// "Saldo Awal diambil dari penutupan hari sebelumnya" bisa didemonstrasikan
// persis seperti pada contoh (Saldo Awal 25.303.600, referensi tgl 2026-08-08).
export const INITIAL_PENUTUPAN = [
  {
    id: 'seed-1',
    accountId: '1',
    tanggal: '2026-08-08',
    saldoAwal: 24803600,
    penerimaan: 500000,
    pengeluaran: 0,
    penyesuaian: 0,
    saldoAkhir: 25303600,
    kertas: { 100000: 253, 50000: 0, 20000: 0, 10000: 0, 5000: 0, 2000: 1, 1000: 1, 500: 1, 100: 1 },
    logam: emptyDenom(PECAHAN_LOGAM),
    userInput: 'Aulia Anugraha',
    updatedAt: '2026-08-08 17:30',
  },
];
