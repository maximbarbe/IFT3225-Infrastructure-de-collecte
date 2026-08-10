import { createClient } from "redis";
import dotenv from "dotenv";


dotenv.config()

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

async function connectRedis() {
    const client = createClient({
        url: REDIS_URL
    });
    await client.connect();
}

export default connectRedis;