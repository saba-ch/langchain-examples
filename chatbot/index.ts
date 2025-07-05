import { ChatOpenAI } from "@langchain/openai";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation
} from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { trimmer } from "./trimmer";

dotenv.config();

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "You are helpful assistant. Answer all questions to the best of your ability in language: {language}."],
  ["placeholder", "{messages}"],
]);

const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation<string>()
})

const callModel = async (state: typeof GraphAnnotation.State) => {
  const trimmedMessages = await trimmer.invoke(state.messages);
  const prompt = await promptTemplate.invoke({
    ...state,
    messages: trimmedMessages,
  });
  const response = await llm.invoke(prompt);
  return {
    messages: response,
  };
};

const workflow = new StateGraph(GraphAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

const memory = new MemorySaver();

const app = workflow.compile({ checkpointer: memory });

const config = { configurable: { thread_id: uuidv4() } }

const input = [
  { role: "user", content: "Hi i am bob" },
]

const result = await app.invoke({ messages: input, language: "english" }, config);

const input2 = [
  { role: "user", content: "What is my name?" },
]

const result2 = await app.invoke({ messages: input2 }, config);

const config2 = { configurable: { thread_id: uuidv4() } }

const result3 = await app.invoke({ messages: input2, language: "spanish" }, config2);

console.log("🚀 ~ result2:", result2.messages[result2.messages.length - 1].content)
console.log("🚀 ~ result3:", result3.messages[result3.messages.length - 1].content)
