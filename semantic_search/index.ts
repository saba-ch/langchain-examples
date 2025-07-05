import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

dotenv.config();

const loader = new PDFLoader("./nke-10k-2023.pdf");

const docs = await loader.load();

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const splitDocs = await textSplitter.splitDocuments(docs);

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const vectorStore = new MemoryVectorStore(embeddings);

await vectorStore.addDocuments(splitDocs);

const embedding = await embeddings.embedQuery("When was Nike incorporated?");

const res_embeddings = await vectorStore.similaritySearchVectorWithScore(embedding, 1);

console.log("🚀 ~ res_embeddings:", res_embeddings)

const retreiver = vectorStore.asRetriever({
  searchType: "similarity",
  k: 1
});

const results = await retreiver.batch([
  "When was Nike incorporated?",
  "What was Nike's revenue in 2023?",
]);

console.log("🚀 ~ results:", results)