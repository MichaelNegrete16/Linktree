// Trae la demografía de seguidores de Instagram (Graph API) y la guarda en lib/audience.json.
// Variables (en .env.local):  META_ACCESS_TOKEN, IG_USER_ID  (+ META_APP_ID y META_APP_SECRET para --exchange)
// Uso:
//   node --env-file=.env.local scripts/refresh-audience.mjs              # actualiza lib/audience.json
//   node --env-file=.env.local scripts/refresh-audience.mjs --exchange   # cambia el token corto por uno de 60 días
import fs from "node:fs";
import path from "node:path";

const API = "https://graph.facebook.com/v21.0";
const { META_ACCESS_TOKEN: TOKEN, IG_USER_ID, META_APP_ID, META_APP_SECRET } = process.env;

async function get(url) {
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) {
    console.error(`Error de la API (${res.status}): ${json.error?.message ?? JSON.stringify(json)}`);
    process.exit(1);
  }
  return json;
}

if (process.argv.includes("--exchange")) {
  if (!TOKEN || !META_APP_ID || !META_APP_SECRET) {
    console.error("Faltan META_ACCESS_TOKEN, META_APP_ID o META_APP_SECRET en .env.local");
    process.exit(1);
  }
  const q = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: META_APP_ID,
    client_secret: META_APP_SECRET,
    fb_exchange_token: TOKEN,
  });
  const r = await get(`${API}/oauth/access_token?${q}`);
  const days = r.expires_in ? Math.round(r.expires_in / 86400) : "?";
  console.error(`Token de larga duración (~${days} días).`);
  console.log(r.access_token);
  process.exit(0);
}

if (!TOKEN || !IG_USER_ID) {
  console.error("Faltan META_ACCESS_TOKEN o IG_USER_ID en .env.local");
  process.exit(1);
}

// Una consulta por desglose: [{ key, value }] ordenado de mayor a menor
async function breakdown(by) {
  const q = new URLSearchParams({
    metric: "follower_demographics",
    period: "lifetime",
    metric_type: "total_value",
    breakdown: by,
    access_token: TOKEN,
  });
  const r = await get(`${API}/${IG_USER_ID}/insights?${q}`);
  const results = r.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? [];
  return results
    .map((x) => ({ key: x.dimension_values.join(" "), value: x.value }))
    .sort((a, b) => b.value - a.value);
}

const pct = (list) => {
  const total = list.reduce((s, x) => s + x.value, 0) || 1;
  return list.map((x) => ({ key: x.key, value: x.value, pct: Math.round((x.value / total) * 1000) / 10 }));
};

const [gender, age, city, country] = await Promise.all([
  breakdown("gender"),
  breakdown("age"),
  breakdown("city"),
  breakdown("country"),
]);

if (!gender.length && !age.length) {
  console.error("La API no devolvió demografía (¿cuenta profesional con 100+ seguidores y permiso instagram_manage_insights?)");
  process.exit(1);
}

const ageOrder = (k) => parseInt(k, 10) || 0;
const out = {
  updatedAt: new Date().toISOString(),
  // F = mujeres, M = hombres, U = no especificado
  gender: pct(gender),
  age: pct(age).sort((a, b) => ageOrder(a.key) - ageOrder(b.key)),
  cities: pct(city).slice(0, 5),
  countries: pct(country).slice(0, 5),
};

fs.writeFileSync(path.join(process.cwd(), "lib", "audience.json"), JSON.stringify(out, null, 2));
const g = Object.fromEntries(out.gender.map((x) => [x.key, x.pct]));
console.log(`✓ Audiencia IG: ${g.M ?? 0}% hombres · ${g.F ?? 0}% mujeres · ${out.age.length} rangos de edad -> lib/audience.json`);
