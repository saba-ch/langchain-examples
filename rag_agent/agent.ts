import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { llm, prettyPrint } from '.';
import { retreive } from '.';

const agent = createReactAgent({
  llm: llm,
  tools: [retreive],
})

let inputMessage = {
    messages: [{ role: "user", content: "What is Task Decomposition? Once you get the answer, look up common ways of doing it." }],
}

for await (const step of await agent.stream(inputMessage, {
    streamMode: "values",
})) {
    const lastMessage = step.messages[step.messages.length - 1];
    prettyPrint(lastMessage);
    console.log("-----\n");
}