import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { initChatModel } from "langchain/chat_models/universal";

import { bookFlight } from "../tools/flight";
import { transferToHotelAgent } from "../tools/handoff";

const llm = await initChatModel("openai:gpt-4.1-mini", {
  temperature: 0,
});

const flightAgent = createReactAgent({
  name: "flightAgent",
  llm,
  tools: [bookFlight, transferToHotelAgent],
  prompt: "You are a flight agent. You are responsible for booking flights for the user.",
});

export { flightAgent };