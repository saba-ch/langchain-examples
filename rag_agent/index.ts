import 'cheerio'
import { z } from "zod";
import dotenv from 'dotenv'
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { MessagesAnnotation, StateGraph, MemorySaver } from '@langchain/langgraph';
import { tool } from '@langchain/core/tools';
import { ToolNode, toolsCondition } from '@langchain/langgraph/prebuilt';
import { AIMessage, BaseMessage, HumanMessage, isAIMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';

dotenv.config()

export const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
});

const vectorStore = new MemoryVectorStore(embeddings);

const checkpointer = new MemorySaver()

const pTagSelector = "p";
const cheerioLoader = new CheerioWebBaseLoader(
  "https://lilianweng.github.io/posts/2023-06-23-agent/",
  {
    selector: pTagSelector,
  }
);

const docs = await cheerioLoader.load();

const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });

const allSplits = await textSplitter.splitDocuments(docs);

await vectorStore.addDocuments(allSplits);

const retreiveSchema = z.object({ query: z.string() })

export const retreive = tool(
  async ({ query }) => {
    const retreivedDocs = await vectorStore.similaritySearch(query, 2);
    const serialized = retreivedDocs.map((doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`).join("\n");
    return [serialized, retreivedDocs];
  },
  {
    name: "retreive",
    description: "Retreive information related to a query",
    schema: retreiveSchema,
    responseFormat: 'content_and_artifact'
  }
)

const queryOrRespond = async (state: typeof MessagesAnnotation.State) => {
  const llmWithTools = llm.bindTools([retreive]);
  const response = await llmWithTools.invoke(state.messages);

  return {
    messages: [response],
  }
}

const toolNode = new ToolNode([retreive])

const generate = async (state: typeof MessagesAnnotation.State) => {
  const recentToolMessages: ToolMessage[] = []
  for (let i = state.messages.length - 1; i >= 0; i--) {
    const message = state.messages[i]
    if (message instanceof ToolMessage) {
      recentToolMessages.push(message)
    } else {
      break
    }
  }

  let toolMessages = recentToolMessages.reverse()

  const docsContent = toolMessages.map((message) => message.content).join("\n")

  const systemMessageContent = `You are an assistant for question answering tasks.
Use the following pieces of retreived context to answer
the quesion. if you don't know the answer, just say that you don't know.
Use three sentences maximum and keep the answer concise.

<context>
${docsContent}
</context>
`

  const conversationMessages = state.messages.filter(
    (message) => 
      message instanceof HumanMessage ||
      message instanceof SystemMessage ||
      (message instanceof AIMessage && message.tool_calls?.length === 0)
  )

  const prompt = [
    new SystemMessage(systemMessageContent),
    ...conversationMessages,
  ]

  const response = await llm.invoke(prompt)

  return {
    messages: [response],
  }
}

const graph = new StateGraph(MessagesAnnotation)
  .addNode('queryOrRespond', queryOrRespond)
  .addNode('tools', toolNode)
  .addNode('generate', generate)
  .addEdge('__start__', 'queryOrRespond')
  .addConditionalEdges(
    'queryOrRespond',
    toolsCondition,
    {
      tools: 'tools',
      '__end__': '__end__',
    }
  )
  .addEdge('tools', 'generate')
  .addEdge('generate', '__end__')

const runner = await graph.compile({
  checkpointer,
})


export const prettyPrint = (message: BaseMessage) => {
  let txt = `[${message._getType()}]: ${message.content}`;
  if ((isAIMessage(message) && message.tool_calls?.length) || 0 > 0) {
    const tool_calls = (message as AIMessage)?.tool_calls
      ?.map((tc) => `- ${tc.name}(${JSON.stringify(tc.args)})`)
      .join("\n");
    txt += ` \nTools: \n${tool_calls}`;
  }
  console.log(txt);
};

let inputs2 = {
  messages: [{ role: "user", content: "What is Task Decomposition?" }],
};

for await (const step of await runner.stream(inputs2, {
  streamMode: "values",
  configurable: {
    thread_id: '1',
  }
})) {
  const lastMessage = step.messages[step.messages.length - 1];
  prettyPrint(lastMessage);
  console.log("-----\n");
}

let inputs3 = {
  messages: [{ role: "user", content: "Can you look up common ways of doing it?" }],
};

for await (const step of await runner.stream(inputs3, {
  streamMode: "values",
  configurable: {
    thread_id: '1',
  }
})) {
  const lastMessage = step.messages[step.messages.length - 1];
  prettyPrint(lastMessage);
  console.log("-----\n");
}