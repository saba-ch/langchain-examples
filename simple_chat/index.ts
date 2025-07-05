import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  ["system", "Translate the following from English into {language}"],
  ["user", "{text}"],
]);

const promptValue = await promptTemplate.invoke({
  language: "Spanish",
  text: "Hi!",
});

const stream = model.stream(promptValue);

const chunks = [];

for await (const chunk of await stream) {
  chunks.push(chunk);
  console.log(chunk.content);
}

console.log(chunks.map((chunk) => chunk.content).join(""));
