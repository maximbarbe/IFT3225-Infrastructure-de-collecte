// Tests de l'adaptateur Redis avec un faux client.
//
// Aucun serveur Redis n'est demarre: le client est injecte, donc tout le
// contrat (serialisation, TTL, suppression par prefixe) se verifie en memoire.

import test from "node:test";
import assert from "node:assert/strict";

import { createRedisStore } from "../../src/cache/redisStore.js";


// Faux client node-redis. `scanMode` reproduit la difference entre les versions:
// v5 rend des lots de cles, v4 rendait les cles une par une.
function fakeRedis({ scanMode = "batch" } = {}) {
    const data = new Map();
    const calls = { set: [], del: [], quit: 0 };

    return {
        data,
        calls,

        async get(key) {
            return data.has(key) ? data.get(key) : null;
        },

        async set(key, value, options) {
            calls.set.push({ key, value, options });
            data.set(key, value);
        },

        async del(keys) {
            const list = Array.isArray(keys) ? keys : [keys];
            calls.del.push(list);
            for (const key of list) data.delete(key);
        },

        async *scanIterator({ MATCH }) {
            const pattern = MATCH.endsWith("*") ? MATCH.slice(0, -1) : MATCH;
            const matches = [...data.keys()].filter((k) => k.startsWith(pattern));

            if (scanMode === "batch") {
                // v5: des lots. On en rend deux pour verifier l'iteration.
                yield matches.slice(0, 1);
                yield matches.slice(1);
            } else {
                // v4: une cle a la fois.
                for (const key of matches) yield key;
            }
        },

        async quit() {
            calls.quit += 1;
        }
    };
}


test("redisStore: set serialise la valeur et pose une expiration", async () => {
    const client = fakeRedis();
    const store = createRedisStore(client);

    await store.set("k", { a: 1 }, 60);

    assert.equal(client.calls.set[0].value, '{"a":1}');
    assert.deepEqual(client.calls.set[0].options, { EX: 60 });
});

test("redisStore: le TTL envoye a Redis vaut au moins 1 seconde", async () => {
    const client = fakeRedis();
    const store = createRedisStore(client);

    // Redis refuse EX 0: on ne doit jamais le lui envoyer.
    await store.set("k", "v", 0);
    assert.equal(client.calls.set[0].options.EX, 1);
});

test("redisStore: get deserialise la valeur", async () => {
    const client = fakeRedis();
    const store = createRedisStore(client);

    await store.set("k", { a: 1, b: [2, 3] }, 60);
    assert.deepEqual(await store.get("k"), { a: 1, b: [2, 3] });
});

test("redisStore: une cle absente retourne null", async () => {
    const store = createRedisStore(fakeRedis());
    assert.equal(await store.get("inconnue"), null);
});

test("redisStore: delByPrefix gere les lots de node-redis v5", async () => {
    // Regression: en v5, scanIterator rend des tableaux de cles. Traiter chaque
    // element comme une cle unique laissait des entrees perimees en cache.
    const client = fakeRedis({ scanMode: "batch" });
    const store = createRedisStore(client);

    await store.set("app:ambiance:parc:summary:3h", 1, 60);
    await store.set("app:ambiance:parc:history:1d", 2, 60);
    await store.set("app:ambiance:cafe:summary:3h", 3, 60);

    await store.delByPrefix("app:ambiance:parc:");

    assert.equal(await store.get("app:ambiance:parc:summary:3h"), null);
    assert.equal(await store.get("app:ambiance:parc:history:1d"), null);
    // Le lieu voisin survit.
    assert.deepEqual(await store.get("app:ambiance:cafe:summary:3h"), 3);
});

test("redisStore: delByPrefix gere aussi les cles une par une (node-redis v4)", async () => {
    const client = fakeRedis({ scanMode: "single" });
    const store = createRedisStore(client);

    await store.set("app:ambiance:parc:summary:3h", 1, 60);
    await store.set("app:ambiance:parc:history:1d", 2, 60);

    await store.delByPrefix("app:ambiance:parc:");

    assert.equal(await store.get("app:ambiance:parc:summary:3h"), null);
    assert.equal(await store.get("app:ambiance:parc:history:1d"), null);
});

test("redisStore: delByPrefix n'appelle pas del sur un lot vide", async () => {
    const client = fakeRedis({ scanMode: "batch" });
    const store = createRedisStore(client);

    await store.delByPrefix("rien:");

    assert.deepEqual(client.calls.del, []);
});

test("redisStore: clear ne touche qu'aux cles de l'application", async () => {
    const client = fakeRedis();
    const store = createRedisStore(client);

    await store.set("ambiance-api:locations:all", 1, 60);
    // Cle appartenant a un autre service partageant la meme instance Redis.
    await store.set("autre-service:session:42", 2, 60);

    await store.clear();

    assert.equal(await store.get("ambiance-api:locations:all"), null);
    assert.deepEqual(await store.get("autre-service:session:42"), 2);
});

test("redisStore: del supprime une cle precise", async () => {
    const client = fakeRedis();
    const store = createRedisStore(client);

    await store.set("a", 1, 60);
    await store.set("b", 2, 60);
    await store.del("a");

    assert.equal(await store.get("a"), null);
    assert.deepEqual(await store.get("b"), 2);
});

test("redisStore: close ferme la connexion", async () => {
    const client = fakeRedis();
    const store = createRedisStore(client);

    await store.close();

    assert.equal(client.calls.quit, 1);
});
