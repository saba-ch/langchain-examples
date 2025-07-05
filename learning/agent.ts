import { createReactAgent, ToolNode } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { getWeather, getCityFromCountry, getUserInfo, storeUserInfo } from "./tools";
import { mcpClient } from "./mcp";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

const WeatherResponse = z.object({
  condition: z.string().describe("The weather condition in the city"),
  tableList: z.array(z.string()).describe("The list of tables in supabase"),
  userName: z.string().describe("The name of the user"),
});

const llm = await initChatModel("openai:gpt-4.1-mini", {
  temperature: 0,
});

const memory = new MemorySaver();

const tools = [getWeather, getCityFromCountry, getUserInfo, storeUserInfo, ...(await mcpClient.getTools())];

const toolNode = new ToolNode(tools, {
  handleToolErrors: true,
})

const CustomState = Annotation.Root({
  ...MessagesAnnotation.spec,
  userName: Annotation<string>()
})

const agent = createReactAgent({
  llm,
  tools: toolNode, 
  prompt: "You are a helpful assistant that can answer questions about the weather", 
  checkpointer: memory,
  responseFormat: WeatherResponse,
  stateSchema: CustomState,
});

export { agent };