// Mesure l'effet du cache serveur sur les routes publiques.
//
// Usage:
//   node scripts/bench_cache.mjs                       (par defaut http://localhost:8383)
//   node scripts/bench_cache.mjs https://mon-api.onrender.com
//
// Pour chaque route, le script fait une requete a froid (cache vide) puis N
// requetes a chaud, et affiche la mediane des deux. L'en-tete X-Cache renvoye
// par le serveur confirme s'il s'agit d'un HIT ou d'un MISS.
//
// Note: le premier appel a une instance Render gratuite endormie inclut le
// reveil du conteneur (plusieurs secondes). Lancer le script deux fois pour
// obtenir une mesure representative.

const BASE = process.argv[2] || "http://localhost:8383";
const WARM_RUNS = 10;

// Les lieux du jeu de donnees de demonstration (voir scripts/db_fill.py).
const LOCATION = encodeURIComponent("iga marché tellier sainte dorothee");

const ROUTES = [
    `/locations/active`,
    `/ambiance/${LOCATION}?last=2160h`,
    `/ambiance/${LOCATION}/quiet-hours?last=2160h`,
    `/ambiance/${LOCATION}/history?last=2160h`
];

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function timeRequest(url) {
    const started = performance.now();
    const response = await fetch(url);
    const body = await response.text();
    const elapsed = performance.now() - started;

    return {
        ms: elapsed,
        status: response.status,
        cache: response.headers.get("x-cache") || "-",
        cacheControl: response.headers.get("cache-control") || "-",
        bytes: Buffer.byteLength(body)
    };
}

console.log(`Cible: ${BASE}\n`);
console.log(
    "route".padEnd(48),
    "froid".padStart(10),
    "chaud".padStart(10),
    "gain".padStart(8),
    "taille".padStart(10),
    " cache-control"
);
console.log("-".repeat(120));

for (const route of ROUTES) {
    const url = `${BASE}${route}`;

    try {
        // Requete a froid. Le cache peut deja etre chaud d'un run precedent:
        // l'en-tete X-Cache le dit.
        const cold = await timeRequest(url);

        const warm = [];
        let lastWarm = cold;
        for (let i = 0; i < WARM_RUNS; i++) {
            lastWarm = await timeRequest(url);
            warm.push(lastWarm.ms);
        }

        const warmMedian = median(warm);
        const gain = cold.ms > 0 ? `${(cold.ms / warmMedian).toFixed(1)}x` : "-";

        console.log(
            decodeURIComponent(route).slice(0, 48).padEnd(48),
            `${cold.ms.toFixed(0)} ms`.padStart(10),
            `${warmMedian.toFixed(0)} ms`.padStart(10),
            gain.padStart(8),
            `${(cold.bytes / 1024).toFixed(1)} ko`.padStart(10),
            ` ${lastWarm.cacheControl}  [${cold.cache} -> ${lastWarm.cache}]`
        );
    } catch (e) {
        console.log(decodeURIComponent(route).slice(0, 48).padEnd(48), ` ECHEC: ${e.message}`);
    }
}

console.log("\nX-Cache: MISS = calcule par MongoDB, HIT = servi depuis Redis/memoire.");
