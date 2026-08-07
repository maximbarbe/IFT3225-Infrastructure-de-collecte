// Point d'entree du cache serveur.
//
// Deux implementations derriere la meme interface:
//   - Redis, si la variable d'environnement REDIS_URL est definie (production);
//   - un cache en memoire sinon (developpement local, tests, et secours si
//     Redis devient injoignable).
//
// Le cache n'est jamais une source de verite: si Redis tombe, chaque appel
// retombe silencieusement sur la base de donnees. Une panne de cache doit
// ralentir l'API, pas la casser.

import dotenv from "dotenv";
import { createMemoryStore } from "./memoryStore.js";
import { createRedisStore } from "./redisStore.js";

dotenv.config();

let store = createMemoryStore();
let backend = "memory";
let redisClient = null;

// Connexion Redis optionnelle. Le paquet `redis` est importe dynamiquement:
// si REDIS_URL n'est pas defini, il n'est jamais charge et l'API demarre
// meme si la dependance est absente.
async function initCache() {
    const url = process.env.REDIS_URL;
    if (!url) {
        console.log("[cache] REDIS_URL absent — cache en memoire (par processus).");
        return backend;
    }

    try {
        const { createClient } = await import("redis");
        redisClient = createClient({ url });

        // Sans ce handler, une coupure reseau ferait tomber le processus.
        redisClient.on("error", (e) => {
            console.error(`[cache] Erreur Redis: ${e.message}`);
        });

        await redisClient.connect();
        store = createRedisStore(redisClient);
        backend = "redis";
        console.log("[cache] Connecte a Redis.");
    } catch (e) {
        console.error(`[cache] Connexion Redis impossible (${e.message}) — repli sur le cache memoire.`);
        redisClient = null;
        store = createMemoryStore();
        backend = "memory";
    }

    return backend;
}

// Les quatre fonctions ci-dessous absorbent toute erreur du store: un cache
// indisponible se comporte exactement comme un cache vide.
async function cacheGet(key) {
    try {
        return await store.get(key);
    } catch (e) {
        console.error(`[cache] get(${key}) a echoue: ${e.message}`);
        return null;
    }
}

async function cacheSet(key, value, ttlSeconds) {
    try {
        await store.set(key, value, ttlSeconds);
    } catch (e) {
        console.error(`[cache] set(${key}) a echoue: ${e.message}`);
    }
}

async function cacheDel(key) {
    try {
        await store.del(key);
    } catch (e) {
        console.error(`[cache] del(${key}) a echoue: ${e.message}`);
    }
}

async function cacheDelByPrefix(prefix) {
    try {
        await store.delByPrefix(prefix);
    } catch (e) {
        console.error(`[cache] delByPrefix(${prefix}) a echoue: ${e.message}`);
    }
}

function cacheBackend() {
    return backend;
}

// Utilise par les tests et l'arret propre du serveur.
async function closeCache() {
    try {
        await store.close();
    } catch {
        // Rien a faire: on est deja en train de fermer.
    }
}

export {
    initCache,
    cacheGet,
    cacheSet,
    cacheDel,
    cacheDelByPrefix,
    cacheBackend,
    closeCache
};
