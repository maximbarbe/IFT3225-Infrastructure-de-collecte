// Tests du cache memoire (le repli quand REDIS_URL n'est pas defini).
//
// L'horloge est injectee, donc l'expiration est verifiee sans attendre.

import { test } from "vitest";
import assert from "node:assert/strict";

import { createMemoryStore } from "../../src/cache/memoryStore.js";


// Petite horloge controlable pour les tests.
function fakeClock(start = 0) {
    let t = start;
    return {
        now: () => t,
        advance: (ms) => { t += ms; }
    };
}


test("memoryStore: relit une valeur qui vient d'etre ecrite", async () => {
    const store = createMemoryStore();
    await store.set("k", { a: 1 }, 60);
    assert.deepEqual(await store.get("k"), { a: 1 });
});

test("memoryStore: une cle absente retourne null", async () => {
    const store = createMemoryStore();
    assert.equal(await store.get("inconnue"), null);
});

test("memoryStore: la valeur expire apres le TTL", async () => {
    const clock = fakeClock();
    const store = createMemoryStore({ now: clock.now });

    await store.set("k", "v", 60);
    clock.advance(59_000);
    assert.equal(await store.get("k"), "v");

    clock.advance(1_001);
    assert.equal(await store.get("k"), null);
});

test("memoryStore: del supprime une cle precise", async () => {
    const store = createMemoryStore();
    await store.set("a", 1, 60);
    await store.set("b", 2, 60);

    await store.del("a");

    assert.equal(await store.get("a"), null);
    assert.equal(await store.get("b"), 2);
});

test("memoryStore: delByPrefix supprime tout un groupe de cles", async () => {
    const store = createMemoryStore();
    await store.set("ambiance:parc:summary:3h", 1, 60);
    await store.set("ambiance:parc:history:1d", 2, 60);
    await store.set("ambiance:cafe:summary:3h", 3, 60);

    await store.delByPrefix("ambiance:parc:");

    assert.equal(await store.get("ambiance:parc:summary:3h"), null);
    assert.equal(await store.get("ambiance:parc:history:1d"), null);
    // Le lieu voisin n'est pas touche.
    assert.equal(await store.get("ambiance:cafe:summary:3h"), 3);
});

test("memoryStore: clear vide tout le cache", async () => {
    const store = createMemoryStore();
    await store.set("a", 1, 60);
    await store.set("b", 2, 60);

    await store.clear();

    assert.equal(store.size(), 0);
});

test("memoryStore: une reecriture remplace la valeur et repousse l'expiration", async () => {
    const clock = fakeClock();
    const store = createMemoryStore({ now: clock.now });

    await store.set("k", "ancien", 60);
    clock.advance(50_000);
    await store.set("k", "nouveau", 60);
    clock.advance(20_000);

    assert.equal(await store.get("k"), "nouveau");
});

test("memoryStore: la taille est bornee pour ne pas gonfler indefiniment", async () => {
    const store = createMemoryStore({ maxEntries: 3 });

    for (let i = 0; i < 10; i++) {
        await store.set(`k${i}`, i, 60);
    }

    assert.ok(store.size() <= 3, `taille attendue <= 3, obtenue ${store.size()}`);
    // Les dernieres cles ecrites survivent, les plus anciennes sont evincees.
    assert.equal(await store.get("k9"), 9);
    assert.equal(await store.get("k0"), null);
});

test("memoryStore: un TTL nul conserve la valeur sans expiration", async () => {
    const clock = fakeClock();
    const store = createMemoryStore({ now: clock.now });

    await store.set("k", "v", 0);
    clock.advance(10 * 365 * 24 * 3600 * 1000);

    assert.equal(await store.get("k"), "v");
});
