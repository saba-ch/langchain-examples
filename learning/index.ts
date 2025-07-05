import dotenv from "dotenv";

dotenv.config();

import { agent } from "./agent";
import { Command } from "@langchain/langgraph";


const stream = agent.stream(
  {
    messages: [{ role: "user", content: "My name is Saba please update my name and see if it updates" }],
  },
  {
    streamMode: ["updates"],
    configurable: { thread_id: "1", task_id: "1", user_id: "user_12345" },
  }
);

for await (const [streamMode, chunk] of await stream) {
  console.log(streamMode, chunk);
  if (streamMode === "updates" && chunk.__interrupt__) {
    console.log("Agent is asking for confirmation. Resuming with 'yes'...");
    
    // Resume the agent with confirmation
    const resumeStream = agent.stream(new Command({ resume: { type: "accept" } }),
      {
        streamMode: ["updates"],
        configurable: { thread_id: "1", task_id: "1", user_id: "user_12345" },
      }
    );
    
    // Continue streaming the resumed execution
    for await (const [resumeMode, resumeChunk] of await resumeStream) {
      console.log("RESUMED:", resumeMode, resumeChunk);
    }
  }
}