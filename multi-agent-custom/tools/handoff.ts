import { createHandoffTool } from "../utils/createHandoffTool";

const transferToHotelAgent = createHandoffTool({
  agentName: "hotelAgent",
  description: "Transfer to hotel agent",
});

const transferToFlightAgent = createHandoffTool({
  agentName: "flightAgent",
  description: "Transfer to flight agent",
});

export { transferToHotelAgent, transferToFlightAgent };