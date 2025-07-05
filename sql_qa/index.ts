import { SqlDatabase } from "langchain/sql_db";
import { DataSource } from "typeorm";
import { Annotation, StateGraph, MemorySaver } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { pull } from 'langchain/hub'
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from 'dotenv'
import { z } from "zod";
import { QuerySqlTool } from 'langchain/tools/sql'

dotenv.config()

const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0,
})

const datasource = new DataSource({
  type: "sqlite",
  database: "Chinook.db",
})

const db = await SqlDatabase.fromDataSourceParams({
  appDataSource: datasource,
})

const InputStateAnnotation = Annotation.Root({
  question: Annotation<string>
})

const StateAnnotation = Annotation.Root({
  question: Annotation<string>,
  query: Annotation<string>,
  result: Annotation<string>,
  answer: Annotation<string>,
})

const queryPromptTemplate = await pull<ChatPromptTemplate>("langchain-ai/sql-query-system-prompt")

const queryOutput = z.object({
  query: z.string().describe("Syntactically valid SQL query."),
})

const structuredLlm = llm.withStructuredOutput(queryOutput)

const writeQuery = async (state: typeof InputStateAnnotation.State) => {
  const promptValue = await queryPromptTemplate.invoke({
    dialect: db.appDataSourceOptions.type,
    top_k: 10,
    table_info: await db.getTableInfo(),
    input: state.question,
  })
  const result = await structuredLlm.invoke(promptValue)
  return {
    query: result.query,
  }
}

const executeQuery = async (state: typeof StateAnnotation.State) => {
  const executeQueryTool = new QuerySqlTool(db)
  return {
    result: await executeQueryTool.invoke(state.query),
  }
}

const generateAnswer = async (state: typeof StateAnnotation.State) => {
  const promptValue =
    "Given the following user question, corresponding SQL query, " +
    "and SQL result, answer the user question.\n\n" +
    `Question: ${state.question}\n` +
    `SQL Query: ${state.query}\n` +
    `SQL Result: ${state.result}\n`;

  const result = await llm.invoke(promptValue)
  return {
    answer: result.content,
  }
}

const graphBuilder = new StateGraph(StateAnnotation)
  .addNode('writeQuery', writeQuery)
  .addNode('executeQuery', executeQuery)
  .addNode('generateAnswer', generateAnswer)
  .addEdge('__start__', 'writeQuery')
  .addEdge('writeQuery', 'executeQuery')
  .addEdge('executeQuery', 'generateAnswer')
  .addEdge('generateAnswer', '__end__')

const checkpointer = new MemorySaver()

const graph = await graphBuilder.compile({
  checkpointer,
  interruptBefore: ['executeQuery']
})

const inputs = {
  question: "How many employees are there?"
}

for await (const step of await graph.stream(inputs, {
  streamMode: "updates",
  configurable: {
    thread_id: '1',
  }
})) {
  console.log(step)
  console.log("-----\n")
}

console.log('Interrupted')

for await (const step of await graph.stream(null, {
  streamMode: "updates",
  configurable: {
    thread_id: '1',
  }
})) {
  console.log(step)
  console.log("-----\n")
}