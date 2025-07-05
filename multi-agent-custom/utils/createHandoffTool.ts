import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolMessage } from "@langchain/core/messages";
import { Command, getCurrentTaskInput, MessagesAnnotation } from "@langchain/langgraph";

interface CreateHandoffToolParams {
  agentName: string;
  description?: string;
}

const createHandoffTool = ({ agentName, description }: CreateHandoffToolParams) => {
  const tool_name = `transfer_to_${agentName}`;
  const tool_description = description || `Transfer to ${agentName} agent`;

  const handoffTool = tool(
    async (_, config) => {
      const toolMessage = new ToolMessage({
        content: `Successfully transferred to the ${agentName} agent`,
        name: tool_name,
        tool_call_id: config?.toolCall?.id,
      });
      const state =
        getCurrentTaskInput() as (typeof MessagesAnnotation)["State"];
      return new Command({
        goto: agentName,
        update: {
          messages: state.messages.concat(toolMessage),
        },
        graph: Command.PARENT
      });
    },
    {
      name: tool_name,
      description: tool_description,
      schema: z.object({}),
    }
  );

  return handoffTool;
};

export { createHandoffTool };