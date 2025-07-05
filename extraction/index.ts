import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { z } from 'zod'
import dotenv from "dotenv";

dotenv.config();

const personSchema = z.object({
  name: z
    .optional(z.string().nullable())
    .describe("The name of the person"),
  hair_color: z
    .optional(z.string().nullable())
    .describe("The color of the person's hair"),
  height_in_meters: z
    .optional(z.string().nullable())
    .describe("Height measured in meters"),
});

const dataSchema = z.object({
  people: z.array(personSchema).describe("Extracted data about people"),
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an expert extraction algorithm.
Only extract relevant information from the text.
If you do not know the value of an attribute asked to extract
return null for the attribute's value.`
  ],
  ["human", "{text}"]
])

const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

const structured_llm = llm.withStructuredOutput(dataSchema, {
  name: "extractor"
});

const prompt = await promptTemplate.invoke({
  text: "John Doe is 6 feet tall and has blonde hair. Ana is 5 feet 8 inches tall and has brown hair."
});

const result = await structured_llm.invoke(prompt);

console.log("🚀 ~ result:", result)