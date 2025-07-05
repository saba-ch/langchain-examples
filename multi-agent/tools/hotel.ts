import { tool } from "@langchain/core/tools";
import { z } from "zod";

const bookHotel = tool(
  async (input: { hotel_name: string, date: string }, config) => {
    const userId = config?.metadata?.user_id;
    return `Hotel ${input.hotel_name} booked for ${input.date} for user ${userId}`;
  },
  {
    name: "bookHotel",
    description: "Book a hotel",
    schema: z.object({
      hotel_name: z.string().describe("The name of the hotel"),
      date: z.string().describe("The date of the flight"),
    }),
  }
)

export { bookHotel };