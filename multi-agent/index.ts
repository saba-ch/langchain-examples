import dotenv from "dotenv";

dotenv.config();

import { supervisor } from "./agents/supervisor";

const stream = supervisor.stream(
  {
    messages: [{ role: "user", content: "I want to book a flight to Tokyo from Madrid on 10th of July" }],
  },
  {
    streamMode: ["updates"],
    configurable: { thread_id: "1", task_id: "1", user_id: "user_12345" },
  }
);

for await (const [streamMode, chunk] of await stream) {
  console.log(streamMode, chunk);
}