import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import dotenv from "dotenv";

dotenv.config();

const mcpClient = new MultiServerMCPClient({
  mcpServers: {
    "supabase": {
      command: "npx",
      args: [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=iygwwzwclxdaegosuhec"
      ],
      env: {
        SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN!
      }
    },
  }
})

export { mcpClient };