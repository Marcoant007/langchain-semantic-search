import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { RetrievalQAChain } from "langchain/chains";
import { redis, redisVectorStore } from "./redis-store";
import dotenv from 'dotenv';
dotenv.config();

const openAIChat = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-3.5-turbo',
    temperature: 0.9, // temperatura é a criatividade
});

const prompt = new PromptTemplate({
    template: `
    Você responde perguntas sobre dark souls 2.
    O usuário está curioso sobre a história do jogo dark souls.
    Use o conteúdo das transcrições do dark souls para responder a pergunta do usuário.
    Se a resposta não for encontrada nas transcrições, responda que você não sabe, não tente inventar uma resposta.

    Se possível, inclua exemplos.

    Transcrições:
    {context}

    Pergunta:
    {question}
    `.trim(),
    inputVariables: ['context','question']
});

//llm larg language model
const chain = RetrievalQAChain.fromLLM(openAIChat, redisVectorStore.asRetriever(), {
    prompt,
    returnSourceDocuments: true,
    verbose: true,
});

async function main(){
    await redis.connect()

    const response = await chain.call({
        query: 'Me explique quem foi o O Ultimo gigante'
    })

    console.log(response);

    await redis.disconnect();
}

main();


