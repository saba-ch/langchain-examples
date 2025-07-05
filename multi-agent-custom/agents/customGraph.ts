import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";

import { flightAgent } from "./flight";
import { hotelAgent } from "./hotel";

const memory = new MemorySaver();

const customGraph = new StateGraph(MessagesAnnotation)
  .addNode("flightAgent", flightAgent, {
    ends: ["hotelAgent", END],
  })
  .addNode("hotelAgent", hotelAgent, {
    ends: ["flightAgent", END],
  })
  .addEdge(START, "flightAgent")
  .compile({
    checkpointer: memory,
  });

export { customGraph };