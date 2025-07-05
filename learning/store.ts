import { InMemoryStore } from "@langchain/langgraph-checkpoint";

const store = new InMemoryStore();

store.put(
  ['users'],
  'user_123',
  {
    name: 'Bubbles',
    language: 'English',
  }
)

store.put(
  ['users'],
  'user_1234',
  {
    name: 'John',
    language: 'English',
  }
)

export { store };