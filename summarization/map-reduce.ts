import 'cheerio'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { collapseDocs, splitListOfDocs } from 'langchain/chains/combine_documents/reduce'
import { Document } from '@langchain/core/documents'
import { HumanMessage } from '@langchain/core/messages'
import { TokenTextSplitter } from '@langchain/textsplitters'
import { ChatOpenAI } from '@langchain/openai'
import { StateGraph, Annotation, Send, UpdateType } from '@langchain/langgraph'

import dotenv from 'dotenv'

dotenv.config()

const pTagSelector = 'p'
const cheerioLoader = new CheerioWebBaseLoader(
  'https://lilianweng.github.io/posts/2023-06-23-agent/',
  {
    selector: pTagSelector,
  }
)

const docs = await cheerioLoader.load()

const mapPrompt = ChatPromptTemplate.fromMessages([
  ['user', 'Write concise summary of the following: {context}']
])

const reducePrompt = ChatPromptTemplate.fromMessages([
  ['user', `The following is set of summaries: {docs}. Take these and distill it into final consolidated summary of the main themes`]
])

const llm = new ChatOpenAI({
  modelName: 'gpt-4o-mini',
  temperature: 0,
})

const textSplitter = new TokenTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 0,
})

const splitDocs = await textSplitter.splitDocuments(docs)

const maxTokens = 1000;

const lengthFunc = async (docs: Document[]) => {
  return llm.getNumTokens(docs.map((doc) => doc.pageContent).join('\n'))
}

const OverallState = Annotation.Root({
  contents: Annotation<string[]>,
  summaries: Annotation<string[]>({
    reducer: (state, update) => state.concat(update),
  }),
  collapsedSummaries: Annotation<Document[]>,
  finalSummary: Annotation<string>,
})

interface SummaryState {
  content: string
}

const generateSummary = async (
  state: SummaryState,
): Promise<{ summaries: string[] }> => {
  const prompt = await mapPrompt.invoke({ context: state.content })
  const res = await llm.invoke(prompt)

  return { summaries: [String(res.content)] }
}

const mapSummaries = (state: typeof OverallState.State) => {
  return state.contents.map(
    (content) => new Send('generateSummary', { content })
  )
}

const collectSummaries = (state: typeof OverallState.State) => {
  return {
    collapsedSummaries: state.summaries
      .map(summary => new Document({ pageContent: summary  })),
  }
}

const _reduce = async (input: Document[]): Promise<string> => {
  const prompt = await reducePrompt.invoke({ docs: input })
  const res = await llm.invoke(prompt)
  return String(res.content)
}

const collapseSummaries = async (state: typeof OverallState.State) => {
  const docLists = splitListOfDocs(state.collapsedSummaries, lengthFunc, maxTokens)

  const results = await Promise.all(docLists.map(docList => collapseDocs(docList, _reduce)))

  return { collapsedSummaries: results }
}

const shouldCollapse = async (state: typeof OverallState.State) => {
  const numTokens = await lengthFunc(state.collapsedSummaries)

  return numTokens > maxTokens ? 'collapseSummaries' : 'generateFinalSummary'
}

const generateFinalSummary = async (state: typeof OverallState.State) => {
  const res = await _reduce(state.collapsedSummaries)
  return { finalSummary: res }
}

const graph = new StateGraph(OverallState)
  .addNode('generateSummary', generateSummary)
  .addNode('collectSummaries', collectSummaries)
  .addNode('collapseSummaries', collapseSummaries)
  .addNode('generateFinalSummary', generateFinalSummary)
  .addConditionalEdges('__start__', mapSummaries, ['generateSummary'])
  .addEdge('generateSummary', 'collectSummaries')
  .addConditionalEdges('collectSummaries', shouldCollapse, ['collapseSummaries', 'generateFinalSummary'])
  .addConditionalEdges('collapseSummaries', shouldCollapse, ['collapseSummaries', 'generateFinalSummary'])
  .addEdge('generateFinalSummary', '__end__')

const app = graph.compile()

let finalSummary: typeof OverallState.Update | null = null;
console.log("🚀 ~ splitDocs.map((doc) => doc.pageContent):", splitDocs.map((doc) => doc.pageContent))

for await (const step of await app.stream(
  { contents: splitDocs.map((doc) => doc.pageContent) },
  { recursionLimit: 10 }
)) {
  console.log(Object.keys(step));
  if (step.hasOwnProperty("generateFinalSummary")) {
    finalSummary = step.generateFinalSummary;
  }
}

console.log(finalSummary)