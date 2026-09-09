// Reverse geocoding via OpenStreetMap's free Nominatim API — same OSM
// infrastructure the map tiles already come from, no API key needed.
// Used to auto-fill Provinsi/Kecamatan/Kelurahan when a user picks a point
// on the map (LocationPicker), instead of making them type it manually.
export const reverseGeocode = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=id&zoom=18`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Gagal memuat data wilayah dari peta.');
  const data = await res.json();
  const a = data.address || {};
  return {
    provinsi: a.state || '',
    kotaKab: a.city || a.town || a.county || a.regency || '',
    kecamatan: a.city_district || a.district || a.subdistrict || a.suburb || '',
    kelurahan: a.village || a.hamlet || a.neighbourhood || a.suburb || ''
  };
};
