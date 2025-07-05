import { createSupervisor } from "@langchain/langgraph-supervisor";
import { initChatModel } from "langchain/chat_models/universal";
import { MemorySaver } from "@langchain/langgraph-checkpoint";

import { flightAgent } from "./flight";
import { hotelAgent } from "./hotel";

const memory = new MemorySaver();

const llm = await initChatModel("openai:gpt-4.1-mini", {
  temperature: 0,
});

const supervisor = createSupervisor({
    agents: [flightAgent, hotelAgent],
    llm,
    prompt: "You manage a hotel booking assistant and a flight booking assistant. Assign work to them, one at a time.",
  })
  .compile({
    checkpointer: memory,
  });

export { supervisor };