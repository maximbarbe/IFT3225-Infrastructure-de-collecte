import redisClient from "./redisConnect.js";



async function redisSet(url, payload, TTL=900) {
    try {
        await redisClient.set(url, JSON.stringify(payload), {EX: TTL})
    } catch (e) {}
    
}

async function redisGet(url) {
    try {
        const data = await redisClient.get(url)
        if (data) {
            return JSON.parse(data)
        }
        return null;
    } catch (e) {}
    return null;
}
// (Karunakaran, 2022)
async function redisDelete(pattern) {
    try {
        for await (const key of redisClient.scanIterator({
            TYPE: "string",
            MATCH: pattern

        })) {
            
            await redisClient.del(key);
        }
    } catch (e) {
    }
}


export {
    redisSet,
    redisGet,
    redisDelete
}