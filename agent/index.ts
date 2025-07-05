import { TavilySearch } from "@langchain/tavily";
import { ChatOpenAI } from "@langchain/openai";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from '@langchain/core/messages';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";

dotenv.config();

const agentTools = [new TavilySearch({ maxResults: 3 })]
const agentModel = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
})

const checkpointer = new MemorySaver();

const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: checkpointer,
})

const agentFinalState = await agent.invoke(
  {
    messages: [
      new HumanMessage("What is current weather in Madrid?"),
    ],
  },
  {
    configurable: {
      thread_id: "42"
    },
  }
)

console.log(agentFinalState.messages[agentFinalState.messages.length - 1].content)

const agentNextState = await agent.invoke(
  {
    messages: [
      new HumanMessage("What about Barcelona?"),
    ],
  },
  {
    configurable: {
      thread_id: "42"
    },
  }
)

console.log(agentNextState.messages[agentNextState.messages.length - 1].content)