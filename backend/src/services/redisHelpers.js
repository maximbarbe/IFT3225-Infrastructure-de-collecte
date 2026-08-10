import redisClient from "./redisConnect.js";



async function redisSet(url, payload, TTL=900) {
    try {
        redisClient.set(url, JSON.stringify(payload), {EX: TTL})
    } catch (e) {}
    
}

async function redisGet(url) {
    try {
        const data = redisClient.get(url)
        if (data) {
            return JSON.parse(data)
        }
        return null;
    } catch (e) {}
    return null;
}
// https://stackoverflow.com/a/73468860
async function redisDelete(pattern) {
    try {
        for await (const key of redisClient.scanIterator({
            TYPE: "string",
            MATCH: pattern

        })) {
            await redisClient.del(key);
        }
    } catch (e) {
        console.log(e)
    }
}


export {
    redisSet,
    redisGet,
    redisDelete
}