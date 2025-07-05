import dotenv from "dotenv";

dotenv.config();

import { swarm } from "./agents/swarm";

const stream = swarm.stream(
  {
    messages: [{ role: "user", content: "I want to book a hotel in Tokyo 4 seasons hotel for 2 nights on 10th of July" }],
  },
  {
    streamMode: ["updates"],
    configurable: { thread_id: "1", task_id: "1", user_id: "user_12345" },
  }
);

for await (const [streamMode, chunk] of await stream) {
  console.log(streamMode, chunk);
}