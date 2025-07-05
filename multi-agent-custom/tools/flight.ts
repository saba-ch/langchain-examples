import { tool } from "@langchain/core/tools";
import { z } from "zod";

const bookFlight = tool(
  async (input: { from_airport: string, to_airport: string, date: string }, config) => {
    const userId = config?.metadata?.user_id;
    return `Flight ${input.from_airport} to ${input.to_airport} booked for ${input.date} for user ${userId}`;
  },
  {
    name: "bookFlight",
    description: "Book a flight",
    schema: z.object({
      from_airport: z.string().describe("The airport to fly from"),
      to_airport: z.string().describe("The airport to fly to"),
      date: z.string().describe("The date of the flight"),
    }),
  }
)

export { bookFlight };