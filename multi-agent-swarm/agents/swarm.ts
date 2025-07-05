import { createSwarm } from "@langchain/langgraph-swarm";
import { MemorySaver } from "@langchain/langgraph-checkpoint";

import { flightAgent } from "./flight";
import { hotelAgent } from "./hotel";

const memory = new MemorySaver();

const swarm = createSwarm({
  agents: [flightAgent, hotelAgent],
  defaultActiveAgent: "flightAgent",
})
.compile({
  checkpointer: memory,
});

export { swarm };