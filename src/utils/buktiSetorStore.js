// --- CRM > Transaksi > Bukti Setor ---
// Rekap setoran per donatur (Bukti Setor Zakat/Infaq/Wakaf/Qurban), diturunkan
// dari data transaksi donatur (donaturStore) — bukan data sungguhan.

import { INITIAL_DONATUR } from './donaturStore';

export const JENIS_SETOR_OPTIONS = [
  { value: 'Zakat', label: 'Zakat', prefix: 'BSZ', title: 'Bukti Setor Zakat (BSZ)' },
  { value: 'Infak/Sedekah', label: 'Infak/Sedekah', prefix: 'BSI', title: 'Bukti Setor Infaq (BSI)' },
  { value: 'Wakaf', label: 'Wakaf', prefix: 'BSW', title: 'Bukti Setor Wakaf (BSW)' },
  { value: 'Qurban', label: 'Qurban', prefix: 'BSQ', title: 'Bukti Setor Qurban (BSQ)' }
];

const jenisForDonatur = (d) => {
  if (JENIS_SETOR_OPTIONS.some(j => j.value === d.minatProgram)) return d.minatProgram;
  return 'Zakat';
};

const generateId = (tahun, seq) => {
  const dd = String(1 + (seq % 27)).padStart(2, '0');
  const mm = String(1 + (seq % 12)).padStart(2, '0');
  const yy = String(tahun).slice(2);
  const tail = String(100000 + ((seq * 3677) % 900000));
  return `9001${dd}${mm}${yy}${tail}`;
};

const generateBuktiSetor = () => {
  const rows = [];
  let seq = 0;
  INITIAL_DONATUR.forEach(d => {
    if (!d.jumlahTransaksi || d.jumlahTransaksi <= 0) return;
    const jenis = jenisForDonatur(d);
    const baseYear = Number(d.tglReg.slice(0, 4));
    const perTx = Math.max(50000, Math.round((d.totalTransaksi / d.jumlahTransaksi) / 50000) * 50000);
    for (let t = 0; t < d.jumlahTransaksi; t++) {
      seq++;
      const tahun = baseYear + Math.floor(t / 4);
      const mm = String(1 + ((seq * 5 + t) % 12)).padStart(2, '0');
      const dd = String(1 + ((seq * 7 + t) % 27)).padStart(2, '0');
      const hh = String((seq * 3) % 24).padStart(2, '0');
      const mi = String((seq * 11) % 60).padStart(2, '0');
      const ss = String((seq * 17) % 60).padStart(2, '0');
      rows.push({
        id: generateId(tahun, seq),
        tahun,
        idDonatur: d.id,
        namaDonatur: d.nama,
        kantor: d.kantor,
        jenis,
        pendapatan: 0,
        zakat: perTx + (t % 3) * 25000,
        transaksiTerakhir: `${tahun}-${mm}-${dd} ${hh}:${mi}:${ss}`
      });
    }
  });
  return rows;
};

export const INITIAL_BUKTI_SETOR = generateBuktiSetor();
