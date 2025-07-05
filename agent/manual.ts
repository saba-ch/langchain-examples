import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import dotenv from "dotenv";

dotenv.config();

const tools = [new TavilySearch({ maxResults: 3 })]
const toolNode = new ToolNode(tools)

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
})
const llmWithTools = llm.bindTools(tools)

const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
  const lastMessage = messages[messages.length - 1] as AIMessage

  if (lastMessage.tool_calls?.length) {
    return "tools"
  }

  return "__end__"
}

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llmWithTools.invoke(state.messages)

  return {
    messages: response,
  }
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addEdge('__start__', 'agent')
  .addNode('tools', toolNode)
  .addEdge('tools', 'agent')
  .addConditionalEdges('agent', shouldContinue)

const app = workflow.compile()

const finalState = await app.invoke({
  messages: [
    new HumanMessage("What is current weather in Madrid?"),
  ],
})

console.log(finalState.messages[finalState.messages.length - 1].content)

const finalState2 = await app.invoke({
  messages: [
    ...finalState.messages,
    new HumanMessage("What about Barcelona?"),
  ],
})

console.log(finalState2.messages[finalState2.messages.length - 1].content)