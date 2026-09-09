// --- CRM > Donatur > Entry Donatur ---

export const JENIS_KELAMIN_OPTIONS = ['Belum Diketahui', 'Laki-laki', 'Perempuan'];
export const JENIS_DONATUR_OPTIONS = ['Lembaga', 'Perorangan', 'Perusahaan', 'Kotak'];
export const AKTIF_DONATUR_OPTIONS = [
  { value: 'y', label: 'Ya' },
  { value: 'n', label: 'Tidak' },
  { value: 'prospek', label: 'Prospek' }
];
// Donor fields that can be individually marked as verified via "Set As" ->
// "Verified". "verifiedBy" is a special entry: checking it stamps who/when
// verified rather than marking a data field itself.
export const VERIFIED_FIELD_OPTIONS = [
  { key: 'verifiedBy', label: 'Verified By' },
  { key: 'nama', label: 'Nama Donatur' },
  { key: 'hp', label: 'HP' },
  { key: 'email', label: 'Email' },
  { key: 'alamat', label: 'Alamat' },
  { key: 'tglLahir', label: 'Tgl Lahir' },
  { key: 'jenisKelamin', label: 'Jenis Kelamin' },
  { key: 'panggilan', label: 'Panggilan' },
  { key: 'pekerjaan', label: 'Pekerjaan' },
  { key: 'kesediaanDonasi', label: 'Kesediaan Donasi' },
  { key: 'dihubungiVia', label: 'Dihubungi Via' },
  { key: 'minatProgram', label: 'Minat Program' },
  { key: 'tipePelayanan', label: 'Tipe Pelayanan' }
];
export const AGAMA_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya'];
export const STATUS_NIKAH_OPTIONS = ['Belum Diketahui', 'Belum Menikah', 'Menikah', 'Cerai'];
export const PENGHASILAN_OPTIONS = ['< Rp 2.000.000', 'Rp 2.000.000 - Rp 5.000.000', 'Rp 5.000.000 - Rp 10.000.000', 'Rp 10.000.000 - Rp 25.000.000', '> Rp 25.000.000'];
export const PENDIDIKAN_OPTIONS = ['SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
export const SUMBER_INFORMASI_OPTIONS = ['Media Sosial', 'Website', 'Teman/Keluarga', 'Event', 'Brosur', 'Lainnya'];
export const KESEDIAAN_DONASI_OPTIONS = ['Rutin Bulanan', 'Rutin Mingguan', 'Insidentil', 'Belum Bersedia'];
export const CARA_BAYAR_OPTIONS = ['Transfer Bank', 'Tunai', 'QRIS', 'E-Wallet', 'Potong Gaji', 'Debit Otomatis'];
export const PEKERJAAN_OPTIONS = ['PNS', 'Pegawai Swasta', 'Wiraswasta', 'Ibu Rumah Tangga', 'Pelajar/Mahasiswa', 'Profesional', 'Lainnya'];
export const MINAT_PROGRAM_OPTIONS = ['Zakat', 'Infak/Sedekah', 'Wakaf', 'Qurban', 'Kemanusiaan', 'Pendidikan', 'Kesehatan'];
export const DIHUBUNGI_VIA_OPTIONS = ['Telepon', 'WhatsApp', 'Email', 'SMS', 'Tidak Ingin Dihubungi'];
export const TIPE_PELAYANAN_OPTIONS = [
  'Donatur Channeling', 'Domestik Online Maintenance', 'Foreign Online Maintenance',
  'Gojek', 'Offline Maintenance', 'Telesales Maintenance'
];
export const TIM_CRM_OPTIONS = ['Aulia Anugraha', 'Denny A', 'Syahrul Azwin', 'Desy Bunga Sari'];
export const INFORMASI_LAIN_TYPES = ['No. KTP', 'No. Kartu Keluarga', 'Instagram', 'Facebook', 'Twitter / X', 'LinkedIn', 'Lainnya'];

// --- CRM > Donatur > List Donatur ---
// Data fiktif untuk keperluan tampilan/demo — bukan data donatur sungguhan.

const FIRST_NAMES = [
  'Agus', 'Bambang', 'Cahya', 'Dedi', 'Eka', 'Fitri', 'Gunawan', 'Hendra', 'Indra', 'Joko',
  'Kartika', 'Lestari', 'Maman', 'Nurul', 'Oscar', 'Putri', 'Rudi', 'Sari', 'Taufik', 'Umar',
  'Vina', 'Wahyu', 'Yanti', 'Zainal', 'Ade', 'Bayu', 'Citra', 'Dian', 'Endang', 'Farhan'
];
const LAST_NAMES = [
  'Setiawan', 'Wijaya', 'Kurniawan', 'Hidayat', 'Santoso', 'Permana', 'Saputra', 'Rahayu',
  'Gunadi', 'Pratama', 'Nugroho', 'Wibowo', 'Firmansyah', 'Suryadi', 'Halim', 'Kusuma'
];
const ALAMAT_TEMPLATES = [
  'Jl. Merdeka No. {n} RT 0{r}/0{r2} Bandung',
  'Komp. Griya Asri Blok {b} No. {n}',
  'Jl. Kenanga Raya No. {n} Antapani',
  'Perum Bukit Indah No. {n} RT 03/12',
  '', '', // sebagian donatur tidak mengisi alamat (meniru pola data nyata)
  'Jl. Cempaka No. {n} Cibiru Bandung',
  'Komp. Taman Sari No. {n}'
];
const KANTOR_OPTIONS = ['Kantor Pusat', 'Kantor Pusat', 'Kantor Pusat', 'Kantor Cabang Bandung', 'Kantor Cabang Surabaya'];
const STAFF_NAMES = ['Aulia Anugraha', 'Irfan Abdurrahman', 'Desy Bunga Sari', 'Auliya Putri', 'Ahmad Faisal'];

// Wilayah donatur (provinsi/kecamatan/kelurahan + titik koordinat) — dipakai
// untuk menampilkan peta sebaran donatur. "Kantor Pusat"/"Kantor Cabang
// Bandung" dipetakan ke kecamatan-kecamatan di Bandung (sesuai alamat contoh
// di ALAMAT_TEMPLATES), "Kantor Cabang Surabaya" ke kecamatan di Surabaya.
const BANDUNG_REGIONS = [
  { provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Antapani', kelurahan: 'Antapani Tengah', lat: -6.9107, lng: 107.6567 },
  { provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Cibiru', kelurahan: 'Cibiru Wetan', lat: -6.9247, lng: 107.7211 },
  { provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Coblong', kelurahan: 'Dago', lat: -6.8886, lng: 107.6136 },
  { provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Sukajadi', kelurahan: 'Sukagalih', lat: -6.8925, lng: 107.5877 },
  { provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Batununggal', kelurahan: 'Kacapiring', lat: -6.9280, lng: 107.6386 },
  { provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Bandung Wetan', kelurahan: 'Tamansari', lat: -6.9012, lng: 107.6134 }
];
const SURABAYA_REGIONS = [
  { provinsi: 'Jawa Timur', kotaKab: 'Kota Surabaya', kecamatan: 'Gubeng', kelurahan: 'Airlangga', lat: -7.2775, lng: 112.7521 },
  { provinsi: 'Jawa Timur', kotaKab: 'Kota Surabaya', kecamatan: 'Wonokromo', kelurahan: 'Darmo', lat: -7.2946, lng: 112.7332 },
  { provinsi: 'Jawa Timur', kotaKab: 'Kota Surabaya', kecamatan: 'Rungkut', kelurahan: 'Kalirungkut', lat: -7.3298, lng: 112.7639 },
  { provinsi: 'Jawa Timur', kotaKab: 'Kota Surabaya', kecamatan: 'Tegalsari', kelurahan: 'Kedungdoro', lat: -7.2649, lng: 112.7378 }
];
// Small deterministic offset so donors in the same kecamatan don't stack on
// the exact same point on the map.
const jitter = (base, i) => base + (((i * 37) % 21) - 10) * 0.0015;
const pickRegion = (i, kantor) => {
  const pool = kantor === 'Kantor Cabang Surabaya' ? SURABAYA_REGIONS : BANDUNG_REGIONS;
  const r = pool[i % pool.length];
  return { ...r, lat: jitter(r.lat, i), lng: jitter(r.lng, i + 1) };
};

const buildAlamat = (i) => {
  const tpl = ALAMAT_TEMPLATES[i % ALAMAT_TEMPLATES.length];
  if (!tpl) return '';
  return tpl
    .replace('{n}', String((i % 40) + 1))
    .replace('{b}', String.fromCharCode(65 + (i % 6)))
    .replace('{r}', String((i % 9) + 1))
    .replace('{r2}', String((i % 9) + 1));
};

// Picks option `i`-th from a pool, or '' every `skipEvery`-th record — mirrors
// how real CRM records have plenty of unfilled optional fields.
const pick = (pool, i, skipEvery = 3) => (i % skipEvery === 0 ? '' : pool[i % pool.length]);

const generateFakeDonaturList = (count) => {
  const list = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3 + 1) % LAST_NAMES.length];
    const nama = i % 11 === 0 ? `Hamba Allah` : (i % 17 === 0 ? `PT ${last} Sejahtera` : `${first} ${last}`);
    const yy = 24 + (i % 3);
    const mm = String((i % 12) + 1).padStart(2, '0');
    const dd = String((i % 27) + 1).padStart(2, '0');
    const staff = STAFF_NAMES[i % STAFF_NAMES.length];
    const idUserInsert = `10320210${String(1000 + (i % STAFF_NAMES.length)).padStart(5, '0')}`;
    const timCrm = TIM_CRM_OPTIONS[i % TIM_CRM_OPTIONS.length];
    const jumlahTransaksi = i % 4 === 0 ? 0 : (i % 6) + 1;
    const updatedDd = String(((i + 5) % 27) + 1).padStart(2, '0');
    const updatedHh = String((i % 24)).padStart(2, '0');
    const updatedMm = String((i * 7) % 60).padStart(2, '0');
    const updatedSs = String((i * 13) % 60).padStart(2, '0');
    const kantor = KANTOR_OPTIONS[i % KANTOR_OPTIONS.length];
    const region = pickRegion(i, kantor);

    list.push({
      id: `DN${yy}${mm}${String(1000 + i).padStart(4, '0')}`,
      nama,
      panggilan: i % 4 === 0 ? '' : first,
      hp: `62812${String(1000000 + i * 137).slice(0, 7)}`,
      telpon: i % 6 === 0 ? `022${String(7000000 + i * 91).slice(0, 7)}` : '',
      email: i % 5 === 0 ? `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com` : '',
      alamat: buildAlamat(i),
      kantor,
      provinsi: region.provinsi,
      kotaKab: region.kotaKab,
      kecamatan: region.kecamatan,
      kelurahan: region.kelurahan,
      lat: region.lat,
      lng: region.lng,
      tglReg: `20${yy}-${mm}-${dd}`,
      idTimCrm: `002${yy}${mm}${String(1000 + (i % TIM_CRM_OPTIONS.length)).padStart(4, '0')}`,
      timCrm,
      hpTimCrm: `62851${String(7000000 + (i % TIM_CRM_OPTIONS.length) * 191).slice(0, 7)}`,
      jenisKelamin: JENIS_KELAMIN_OPTIONS[i % JENIS_KELAMIN_OPTIONS.length],
      tglLahir: i % 4 === 0 ? '' : `19${70 + (i % 30)}-${mm}-${dd}`,
      jenisDonatur: i % 29 === 0 ? 'Kotak' : (i % 17 === 0 ? 'Perusahaan' : (i % 13 === 0 ? 'Lembaga' : 'Perorangan')),
      aktif: i % 31 === 0 ? 'prospek' : (i % 23 === 0 ? 'n' : 'y'),
      koordinat: i % 8 === 0 ? `-6.9${String(100 + i).slice(0, 3)}, 107.6${String(100 + i).slice(0, 3)}` : '',
      pekerjaan: pick(PEKERJAAN_OPTIONS, i, 3),
      kesediaanDonasi: pick(KESEDIAAN_DONASI_OPTIONS, i, 4),
      totalTransaksi: jumlahTransaksi === 0 ? 0 : (jumlahTransaksi * 50000) + (i % 10) * 25000,
      jumlahTransaksi,
      userInsert: staff,
      idUserInsert,
      note: i % 9 === 0 ? `#Import202${yy}${mm}${dd}${String(i).padStart(2, '0')}` : (i % 15 === 1 ? '#update_data' : ''),
      updated: `20${yy}-${mm}-${updatedDd} ${updatedHh}:${updatedMm}:${updatedSs}`,
      verifiedFields: i % 19 === 0 ? ['nama', 'hp'] : [],
      verifiedBy: i % 19 === 0 ? staff : '',
      verifiedAt: i % 19 === 0 ? `20${yy}-${mm}-${updatedDd} ${updatedHh}:${updatedMm}:${updatedSs}` : '',
      dihubungiVia: pick(DIHUBUNGI_VIA_OPTIONS, i, 3),
      minatProgram: pick(MINAT_PROGRAM_OPTIONS, i, 3),
      tipePelayanan: i % 30 === 0 ? 'Gojek'
        : i % 20 === 0 ? 'Donatur Channeling'
        : i % 15 === 0 ? 'Foreign Online Maintenance'
        : i % 8 === 0 ? 'Telesales Maintenance'
        : i % 4 === 0 ? 'Offline Maintenance'
        : 'Domestik Online Maintenance',
      parentDonatur: (i % 23 === 5 && list.length > 0) ? list[list.length - 1].nama : ''
    });
  }
  return list;
};

export const INITIAL_DONATUR = [
  {
    id: 'DN26080001', nama: 'Budi Santoso', panggilan: 'Budi', hp: '6281234567890', telpon: '',
    email: 'budi.santoso@example.com', alamat: 'Jl. Melati No. 12 Bandung', kantor: 'Kantor Pusat', tglReg: '2026-08-01',
    provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Coblong', kelurahan: 'Dago', lat: -6.8886, lng: 107.6136,
    idTimCrm: '0022026080001', timCrm: 'Aulia Anugraha', hpTimCrm: '628517670993',
    jenisKelamin: 'Laki-laki', tglLahir: '1985-04-12', jenisDonatur: 'Perorangan', aktif: 'y',
    koordinat: '', pekerjaan: 'Pegawai Swasta', kesediaanDonasi: 'Rutin Bulanan',
    totalTransaksi: 1500000, jumlahTransaksi: 3, userInsert: 'Aulia Anugraha', idUserInsert: '1032021001001',
    note: '', updated: '2026-08-01 09:12:00', verifiedFields: ['nama', 'hp', 'email'], verifiedBy: 'Aulia Anugraha', verifiedAt: '2026-08-01 09:15:00',
    dihubungiVia: 'WhatsApp', minatProgram: 'Zakat', tipePelayanan: 'Domestik Online Maintenance', parentDonatur: ''
  },
  {
    id: 'DN26080002', nama: 'Hamba Allah', panggilan: '', hp: '', telpon: '',
    email: '', alamat: '', kantor: 'Kantor Pusat', tglReg: '2026-08-02',
    provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Bandung Wetan', kelurahan: 'Tamansari', lat: -6.9012, lng: 107.6134,
    idTimCrm: '', timCrm: '', hpTimCrm: '', jenisKelamin: 'Belum Diketahui', tglLahir: '',
    jenisDonatur: 'Perorangan', aktif: 'prospek', koordinat: '', pekerjaan: '', kesediaanDonasi: '',
    totalTransaksi: 50000, jumlahTransaksi: 1, userInsert: 'Irfan Abdurrahman', idUserInsert: '1032021001002',
    note: '', updated: '2026-08-02 14:30:00', verifiedFields: [], verifiedBy: '', verifiedAt: '',
    dihubungiVia: '', minatProgram: '', tipePelayanan: 'Offline Maintenance', parentDonatur: 'Budi Santoso'
  },
  {
    id: 'DN26080003', nama: 'PT Sejahtera Abadi', panggilan: '', hp: '622112345678', telpon: '0221234567',
    email: 'finance@sejahteraabadi.co.id', alamat: 'Jl. Asia Afrika No. 8 Bandung', kantor: 'Kantor Pusat', tglReg: '2026-08-03',
    provinsi: 'Jawa Barat', kotaKab: 'Kota Bandung', kecamatan: 'Bandung Wetan', kelurahan: 'Tamansari', lat: -6.9028, lng: 107.6098,
    idTimCrm: '0022026080002', timCrm: 'Desy Bunga Sari', hpTimCrm: '628517670994',
    jenisKelamin: 'Belum Diketahui', tglLahir: '', jenisDonatur: 'Perusahaan', aktif: 'y',
    koordinat: '', pekerjaan: '', kesediaanDonasi: 'Insidentil',
    totalTransaksi: 50000000, jumlahTransaksi: 2, userInsert: 'Desy Bunga Sari', idUserInsert: '1032021001003',
    note: '#update_data', updated: '2026-08-03 11:05:40', verifiedFields: ['nama', 'alamat'], verifiedBy: 'Desy Bunga Sari', verifiedAt: '2026-08-03 11:10:00',
    dihubungiVia: 'Email', minatProgram: 'Kemanusiaan', tipePelayanan: 'Donatur Channeling', parentDonatur: ''
  },
  ...generateFakeDonaturList(54)
];

let idSeq = INITIAL_DONATUR.length + 1;
export const generateDonaturId = () => {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const id = `DN${yy}${mm}${String(idSeq++).padStart(4, '0')}`;
  return id;
};
