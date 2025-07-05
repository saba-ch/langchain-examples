import { SqlToolkit } from "langchain/agents/toolkits/sql";
import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import dotenv from 'dotenv'
import { pull } from "langchain/hub";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrieverTool } from "langchain/tools/retriever";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { HumanMessage } from "@langchain/core/messages";

dotenv.config()

const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
})

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-large",
})

const vectorStore = new MemoryVectorStore(embeddings)

const datasource = new DataSource({
  type: "sqlite",
  database: "Chinook.db",
})

const db = await SqlDatabase.fromDataSourceParams({
  appDataSource: datasource,
})

const toolKit = new SqlToolkit(db, llm)

const systemPromptTemplate = await pull<ChatPromptTemplate>("langchain-ai/sql-agent-system-prompt")

const systemMesage = await systemPromptTemplate.format({
  dialect: db.appDataSourceOptions.type,
  top_k: 5
})

// Todo: Suggest edit to docs instead of any use SqlDatabase structure
const queryAsList = async (database: SqlDatabase, query: string): Promise<string[]> => {
  const res: Array<{ [key: string]: string }> = JSON.parse(
    await database.run(query)
  )
    .flat()
    .filter((el: { [key: string]: string } | null) => el !== null)
  
  const justValues: Array<string> = res
    .map((item) => Object.values(item)[0]
      .replace(/\b\d+\b/g, "")
      .trim()
    )

  return justValues
}


const artists: string[] = await queryAsList(db, "SELECT Name FROM Artist")
const albums: string[] = await queryAsList(db, "SELECT Title FROM Album")
const properNouns = artists.concat(albums)

const documents = properNouns.map((noun) => new Document({
  pageContent: noun,
}))

await vectorStore.addDocuments(documents)

const retriever = vectorStore.asRetriever(5)

const retrieverTool = createRetrieverTool(retriever, {
  name: 'searchProperNouns',
  description:
    "Use to look up values to filter on. Input is an approximate spelling " +
    "of the proper noun, output is valid proper nouns. Use the noun most " +
    "similar to the search.",
})

let suffix =
  "If you need to filter on a proper noun like a Name, you must ALWAYS first look up " +
  "the filter value using the 'search_proper_nouns' tool! Do not try to " +
  "guess at the proper name - use this function to find similar ones.";

const agent = await createReactAgent({
  llm,
  tools: toolKit.getTools().concat(retrieverTool),
  prompt: systemMesage + suffix,
})

const inputs = {
  messages: [
    new HumanMessage("How many albums does alis in chain have?"),
  ]
}

for await (const step of await agent.stream(inputs, {
  streamMode: "updates",
})) {
  console.log(step)
  console.log("-----\n")
}