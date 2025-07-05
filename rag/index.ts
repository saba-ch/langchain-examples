import 'cheerio'
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { Annotation, StateGraph } from "@langchain/langgraph";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
})

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
})

const vectorStore = new MemoryVectorStore(embeddings)

const pTagSelector = 'p'
const cheerioLoader = new CheerioWebBaseLoader(
  'https://lilianweng.github.io/posts/2023-06-23-agent/',
  {
    selector: pTagSelector,
  }
);

const docs = await cheerioLoader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
})

const allSplits = await splitter.splitDocuments(docs)

await vectorStore.addDocuments(allSplits)

const promptTemplate = await pull<ChatPromptTemplate>("rlm/rag-prompt");

const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>(),
})

const StateAnnotation = Annotation.Root({
  question: Annotation<string>(),
  context: Annotation<Document[]>(),
  answer: Annotation<string>(),
})

const retreive = async (state: typeof InputStateAnnotation.State) => {
  const results = await vectorStore.similaritySearch(state.question)

  return {
    context: results,
  }
}

const generate = async (state: typeof StateAnnotation.State) => {
  const docsContent = state.context.map((doc) => doc.pageContent).join("\n")
  const messages = await promptTemplate.invoke({
    question: state.question,
    context: docsContent,
  })

  const response = await llm.invoke(messages)

  return {
    answer: response.content,
  }
}

const graph = new StateGraph(StateAnnotation)
  .addNode('retreive', retreive)
  .addNode('generate', generate)
  .addEdge('__start__', 'retreive')
  .addEdge('retreive', 'generate')
  .addEdge('generate', '__end__')

const app = graph.compile()

const input = {
  question: "What is Task Decomposition?",
}

const result = await app.invoke(input)

console.log(result.context.slice(0, 3))