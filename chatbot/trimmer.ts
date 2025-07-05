import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  trimMessages,
} from "@langchain/core/messages";

export const trimmer = trimMessages({
  maxTokens: 10,
  strategy: 'last',
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: 'human'
})

// const messages = [
//   new SystemMessage("You are a helpful assistant."),
//   new HumanMessage("Hi i am bob"),
//   new AIMessage("Hi!"),
//   new HumanMessage("I like vanilla ice cream"),
//   new AIMessage("Nice"),
//   new HumanMessage("What's 2 + 2"),
//   new AIMessage("4"),
//   new HumanMessage("Thanks"),
//   new AIMessage("No problem"),
//   new HumanMessage("Having fun?"),
//   new AIMessage("Yes"),
// ]

// const trimmedMessages = await trimmer.invoke(messages);

// console.log(trimmedMessages);