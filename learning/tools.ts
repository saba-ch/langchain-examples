import { ToolMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { Command, interrupt } from "@langchain/langgraph";
import { z } from "zod";
import { store } from "./store";

const getWeather = tool( 
  async (
    input: { city: string },
    config
  ) => {
    console.log("taskInput bla bla", config?.metadata?.task_id);
    return `It's always sunny in ${input.city}!`;
  },
  {
    name: "getWeather",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
    description: "Get weather for a given city.",
    // returnDirect: true,
  }
);

const getCityFromCountry = tool(
  async (
    input: { country: string },
    config
  ) => {
    console.log("taskInput bla bla", config?.metadata?.task_id);
    return `The city of ${input.country} is San Francisco!`;
  },
  {
    name: "getCityFromCountry",
    schema: z.object({
      country: z.string().describe("The country to get the city for"),
    }),
    description: "Get the city from the country.",
  }
);

const getUserInfo = tool(
  async (
    _input,
    config
  ) => {
    const userId = config?.metadata?.user_id;
    const toolCallId = config.toolCall?.id;
    const userInfo = await store.get(['users'], userId);
    const name = userInfo?.value?.name;
    
    return new Command({
      update: {
        userName: name,
        messages: [
          new ToolMessage({
            content: `The user name is ${name}.`,
            tool_call_id: toolCallId,
          })
        ]
      }
    })
  },
  {
    name: "getUserInfo",
    description: "Get the user info.",
  }
)

const storeUserInfo = tool(
  async (
    input: { name: string },
    config
  ) => {
    const userId = config?.metadata?.user_id;
    const response = interrupt(`Trying to update user name please confirm`);
    if (response.type === "accept") {
      await store.put(['users'], userId, { name: input.name });
      return new Command({
        update: {
          userName: input.name,
          messages: [
            new ToolMessage({
              content: `The user name is updated to ${input.name}.`,
              tool_call_id: config.toolCall?.id,
            })
          ]
        }
      })
    } else {
      return new Command({
        update: {
          messages: [
            new ToolMessage({
              content: `The user name is not updated.`,
              tool_call_id: config.toolCall?.id,
            })
          ]
        }
      })
    }
  },
  {
    name: "storeUserInfo",
    description: "Store the user info.",
    schema: z.object({
      name: z.string().describe("The name of the user"),
    }),
  }
)

export { getWeather, getCityFromCountry, getUserInfo, storeUserInfo };