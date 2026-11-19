/**
 * geo.js — Ubica una dirección en el mapa (latitud y longitud) con OpenStreetMap (gratis).
 * Se usa cuando cambia la dirección del consultorio, para el pin del mapa y los datos para Google.
 */
async function geocodificar(direccion) {
  const d = direccion || {};
  const params = new URLSearchParams({
    format: 'jsonv2',
    limit: '1',
    countrycodes: 'ar',
    'accept-language': 'es',
    street: d.calle || '',
    city: d.localidad || '',
    county: d.partido || '',
    state: d.provincia || '',
    country: 'Argentina',
  });
  const intentos = [
    `https://nominatim.openstreetmap.org/search?${params}`,
    // Segundo intento, más flexible: todo en una sola línea
    `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'ar',
      q: [d.calle, d.localidad, d.partido, d.provincia, 'Argentina'].filter(Boolean).join(', '),
    })}`,
  ];
  for (const url of intentos) {
    try {
      const control = new AbortController();
      const corte = setTimeout(() => control.abort(), 6000);
      const r = await fetch(url, {
        headers: { 'User-Agent': 'PanelJimenaTeruel/1.0 (https://www.odontologajimenateruel.com.ar)' },
        signal: control.signal,
      });
      clearTimeout(corte);
      if (!r.ok) continue;
      const lista = await r.json();
      const x = lista && lista[0];
      if (x && x.lat && x.lon) {
        const lat = Math.round(Number(x.lat) * 1e7) / 1e7;
        const lng = Math.round(Number(x.lon) * 1e7) / 1e7;
        if (lat < -21 && lat > -56 && lng < -53 && lng > -74) return { lat, lng, exacto: /house|building|residential|office|amenity|shop/.test(`${x.addresstype} ${x.category} ${x.type}`) };
      }
    } catch (e) {
      console.error('[geo]', e.message);
    }
  }
  return null;
}

module.exports = { geocodificar };
