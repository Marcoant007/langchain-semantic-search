import path from 'node:path';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { RedisVectorStore } from 'langchain/vectorstores/redis';
import { createClient } from 'redis';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import dotenv from 'dotenv';
dotenv.config();

const loader = new DirectoryLoader(
    path.resolve(__dirname, '../tmp'),
    {
        '.json': patch => new JSONLoader(patch, '/Bosses')
    }
)

async function load() {
    const docs = await loader.load();
    const splitter = new TokenTextSplitter({
        encodingName: 'cl100k_base',
        chunkSize: 600,
        chunkOverlap: 0 // Não quero que o conteudo de um chunk apareça no  outro
    })

    const splitterDocuments = await splitter.splitDocuments(docs);
    const redis = createClient({
        url: 'redis://127.0.0.1:6379'
    });

    const redisconn = await redis.connect();

    console.log(redisconn)

    await RedisVectorStore.fromDocuments(splitterDocuments,
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
        {   indexName: 'story-darksouls',
            redisClient: redis,
            keyPrefix: 'story:'
        });

    await redis.disconnect();
}

load();