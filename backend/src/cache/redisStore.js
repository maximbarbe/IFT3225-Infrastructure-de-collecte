// Adaptateur Redis, expose le meme contrat que createMemoryStore.
//
// Le client est injecte plutot que cree ici: le store est ainsi testable avec
// un faux client, sans serveur Redis (voir tests/unit/redisStore.test.js).

import { NAMESPACE } from "../services/cacheService.js";

function createRedisStore(client) {
    return {
        name: "redis",

        async get(key) {
            const raw = await client.get(key);
            if (raw === null || raw === undefined) return null;
            return JSON.parse(raw);
        },

        async set(key, value, ttlSeconds) {
            // EX pose l'expiration cote Redis: aucune tache de nettoyage a ecrire.
            await client.set(key, JSON.stringify(value), { EX: Math.max(1, ttlSeconds) });
        },

        async del(key) {
            await client.del(key);
        },

        // SCAN plutot que KEYS: KEYS bloque le serveur Redis sur une grosse base.
        // node-redis v5 fait rendre des lots de cles a scanIterator (v4 rendait
        // les cles une par une): on accepte les deux formes.
        async delByPrefix(prefix) {
            for await (const batch of client.scanIterator({ MATCH: `${prefix}*`, COUNT: 100 })) {
                const keys = Array.isArray(batch) ? batch : [batch];
                if (keys.length > 0) {
                    await client.del(keys);
                }
            }
        },

        // Ne vide que nos propres cles: l'instance Redis peut etre partagee
        // avec d'autres services, donc pas de FLUSHDB.
        async clear() {
            await this.delByPrefix(NAMESPACE);
        },

        async close() {
            await client.quit();
        }
    };
}

export { createRedisStore };
