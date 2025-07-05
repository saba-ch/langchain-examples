import { createHandoffTool } from "@langchain/langgraph-swarm";

const transferToHotelAgent = createHandoffTool({
  agentName: "hotelAgent",
  description: "Transfer to hotel agent",
});

const transferToFlightAgent = createHandoffTool({
  agentName: "flightAgent",
  description: "Transfer to flight agent",
});

export { transferToHotelAgent, transferToFlightAgent };