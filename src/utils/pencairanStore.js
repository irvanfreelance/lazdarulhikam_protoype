// --- FINS > Home > Pencairan (Pencairan Cash Advance) ---

export const INITIAL_PENCAIRAN = [
  {
    id: '1',
    idBuku: 'S0012607280010004',
    noResi: '626072800100004',
    tanggal: '2026-07-28',
    coa: '101.11.000.000',
    namaAkun: 'Beban Pokok Jasa Penyewaan Alat',
    keterangan: '#CA Beban Pokok Jasa Penyewaan Alat Kegiatan Baksos',
    quantity: 1,
    nominal: 5250000,
    realisasi: 0,
    pengaju: 'Dani Ramdhani',
    pengajuRole: 'Car Rental Management',
    pencairName: '',
    viaBayar: 'Bank',
    bankAccount: '',
    approverName: 'Hamzah Romzul Qur\'ani',
    approverRole: 'Direktur',
    tag: 'External',
    referensiMitra: '',
    officeId: '1',
    status: 'unapprove',
  },
  {
    id: '2',
    idBuku: 'S0012605260010001',
    noResi: '626052600100001',
    tanggal: '2026-05-26',
    coa: '101.11.000.000',
    namaAkun: 'Beban Suku Cadang dan Peralatan',
    keterangan: '#CA D 1841 aif Suzuki Ambulan RZ cab Samarinda',
    quantity: 1,
    nominal: 1600000,
    realisasi: 0,
    pengaju: 'Dani Ramdhani',
    pengajuRole: 'Car Rental Management',
    pencairName: 'Denny A',
    viaBayar: 'Bank',
    bankAccount: '',
    approverName: 'Hamzah Romzul Qur\'ani',
    approverRole: 'Direktur',
    tag: 'External',
    referensiMitra: '',
    officeId: '1',
    status: 'unapprove',
  },
];

let noResiSeq = 3;
export const generatePencairanIds = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const seq = String(noResiSeq++).padStart(4, '0');
  const noResi = `6${yy}${mm}${dd}00${seq}`;
  const idBuku = `S00${yy}${mm}${dd}00${seq}`;
  return { noResi, idBuku };
};
