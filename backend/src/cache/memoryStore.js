// Cache en memoire avec expiration, utilise quand REDIS_URL n'est pas defini.
//
// L'horloge est injectable (`now`) pour que l'expiration soit testable sans
// attendre reellement. C'est le meme contrat que le store Redis, donc le reste
// du code ne sait pas lequel des deux il utilise.

function createMemoryStore({ now = () => Date.now(), maxEntries = 500 } = {}) {
    // cle -> { value, expiresAt }
    const entries = new Map();

    function isExpired(entry) {
        return entry.expiresAt !== null && entry.expiresAt <= now();
    }

    // Borne la taille pour qu'une instance Render a memoire limitee ne gonfle
    // pas indefiniment: on jette d'abord le perime, puis la plus ancienne cle.
    function evictIfNeeded() {
        if (entries.size <= maxEntries) return;
        for (const [key, entry] of entries) {
            if (isExpired(entry)) entries.delete(key);
        }
        while (entries.size > maxEntries) {
            const oldest = entries.keys().next();
            if (oldest.done) break;
            entries.delete(oldest.value);
        }
    }

    return {
        name: "memory",

        async get(key) {
            const entry = entries.get(key);
            if (!entry) return null;
            if (isExpired(entry)) {
                entries.delete(key);
                return null;
            }
            return entry.value;
        },

        async set(key, value, ttlSeconds) {
            const expiresAt = ttlSeconds > 0 ? now() + ttlSeconds * 1000 : null;
            // Reinsere en fin de Map pour que l'eviction reste FIFO.
            entries.delete(key);
            entries.set(key, { value, expiresAt });
            evictIfNeeded();
        },

        async del(key) {
            entries.delete(key);
        },

        async delByPrefix(prefix) {
            for (const key of [...entries.keys()]) {
                if (key.startsWith(prefix)) entries.delete(key);
            }
        },

        async clear() {
            entries.clear();
        },

        // Expose la taille pour les tests et le diagnostic.
        size() {
            return entries.size;
        },

        async close() {}
    };
}

export { createMemoryStore };
