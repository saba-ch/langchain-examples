import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

import { bookHotel } from "../tools/hotel";

const llm = await initChatModel("openai:gpt-4.1-mini", {
  temperature: 0,
});

const hotelAgent = createReactAgent({
  name: "hotelAgent",
  llm,
  tools: [bookHotel],
  prompt: "You are a hotel agent. You are responsible for booking hotels for the user.",
});

export { hotelAgent };