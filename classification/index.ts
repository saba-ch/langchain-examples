import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const taggingPrompt = ChatPromptTemplate.fromTemplate(
  `Extract the desired information from the following passage.
  
Only extract the properties mentioned in the 'Classification' function.
Passage:
{input}
`
)

const classificationSchema = z.object({
  sentiment: z
    .enum(["positive", "negative", "neutral"])
    .describe("The sentiment of the text"),
  aggressiveness: z
    .number()
    .int()
    .describe("How aggressive the text is on scale from 1 to 10"),
  language: z
    .enum(["spanish", "english", "french", "german", "italian"])
    .describe("The language the text is written in"),
});

const llmWithStructuredOutput = llm.withStructuredOutput(classificationSchema, {
  name: "extractor"
});

const prompt1 = await taggingPrompt.invoke({
  input: "Estoy increiblemente contento de haberte conocido! Creo que seremos muy buenos amigos!"
});

const result1 = await llmWithStructuredOutput.invoke(prompt1);

console.log("🚀 ~ result1:", result1)