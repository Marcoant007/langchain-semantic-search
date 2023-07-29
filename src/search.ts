import { redis, redisVectorStore } from "./redis-store";

async function search() {

    await redis.connect();
    const response = await redisVectorStore.similaritySearchWithScore(
        'Quem foi Vendrick?',
        5
    )

    console.log(response);
    await redis.disconnect();
}

search();