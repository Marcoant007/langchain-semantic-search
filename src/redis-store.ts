import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { createClient } from "redis";
import dotenv from 'dotenv';
dotenv.config();

export const redis = createClient({
    url: 'redis://127.0.0.1:6379'
});

export const redisVectorStore = new RedisVectorStore(
    new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY
    }),
    {
        indexName: 'story-darksouls',
        redisClient: redis,
        keyPrefix: 'story:'
    });


