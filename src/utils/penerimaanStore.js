// --- SEED DATA FOR FINS > HOME > PENERIMAAN ---

export const JENIS_TRANSAKSI_PENERIMAAN = [
  { coa: '401.01.000.000', nama: 'Zakat Profesi & Maal' },
  { coa: '402.01.000.000', nama: 'Infak Umum' },
  { coa: '402.01.000.000', nama: 'BSI Infak Kemanusiaan 8809998844' },
  { coa: '402.01.000.000', nama: 'BSI DSKL 8809998844' },
];

export const KAS_ACCOUNTS = ['Kas Pusat', 'Kas Kecil Cabang Bandung'];

export const CURRENT_USER = { id: '1032021001001', nama: 'Asep Saepul' };

// Simulasi posisi/jabatan approver yang sedang login untuk fitur Penerimaan,
// dipakai untuk menampilkan & memvalidasi batas "Level Approve" (mengambil
// rentang dari FINS > Level Approve, biar konsisten dgn menu tsb).
export const CURRENT_APPROVER_JABATAN = 'Kepala Divisi';

export const INITIAL_PENERIMAAN = [
  {
    id: '1',
    idBuku: 'T0012608060010001',
    tanggal: '2026-08-05',
    coa: '402.01.000.000',
    namaAkun: 'BSI Infak Kemanusiaan 8809998844',
    keterangan: 'SALDO JULI 2026',
    quantity: 1,
    nominal: 2810161.46,
    userInput: 'Aulia Anugraha',
    userApprove: '',
    status: 'unapprove',
    referensi: '',
    program: '',
    officeId: '1',
    viaBayar: 'Bank',
    bankAccount: 'BSI Infak Kemanusiaan 8809998844',
  },
  {
    id: '2',
    idBuku: 'T0012608060020001',
    tanggal: '2026-08-05',
    coa: '402.01.000.000',
    namaAkun: 'BSI DSKL 8809998844',
    keterangan: 'SALDO JULI 2026',
    quantity: 1,
    nominal: 4520328.52,
    userInput: 'Aulia Anugraha',
    userApprove: '',
    status: 'unapprove',
    referensi: '',
    program: '',
    officeId: '1',
    viaBayar: 'Bank',
    bankAccount: 'BSI DSKL 8809998844',
  },
];

let idBukuCounter = 3;
export const generateIdBuku = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(idBukuCounter++).padStart(2, '0');
  return `T00${yy}${mm}${dd}${seq}0001`;
};
