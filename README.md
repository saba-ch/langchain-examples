# LangChain Examples

This repository contains a collection of practical examples and implementations based on the official [LangChain.js tutorials](https://js.langchain.com/docs/tutorials/). Each example demonstrates different aspects of building LLM applications with LangChain.

## 📚 Examples Overview

### 🚀 Getting Started
- **Simple Chat** (`simple_chat/`) - Basic LLM application with chat models and prompt templates
- **Semantic Search** (`semantic_search/`) - Build a semantic search engine over documents
- **Classification** (`classification/`) - Classify text into categories using structured outputs
- **Extraction** (`extraction/`) - Extract structured data from unstructured text

### 🔧 Orchestration & Advanced Applications
- **Chatbot** (`chatbot/`) - Interactive chatbot with memory capabilities
- **Agent** (`agent/`) - LangGraph.js agent with external tool interactions
- **RAG** (`rag/`) - Retrieval Augmented Generation applications
- **RAG Agent** (`rag_agent/`) - Advanced RAG with agent capabilities
- **SQL QA** (`sql_qa/`) - Question-answering system with SQL database integration
- **Graph Database QA** (`graph/`) - Question-answering over graph databases
- **Summarization** (`summarization/`) - Text summarization with map-reduce approach

### 🤖 Multi-Agent Systems
- **Multi-Agent** (`multi-agent/`) - Basic multi-agent system with flight and hotel agents
- **Multi-Agent Custom** (`multi-agent-custom/`) - Custom multi-agent implementation with handoff tools
- **Multi-Agent Swarm** (`multi-agent-swarm/`) - Swarm-based multi-agent coordination

### 🧠 Learning & Development
- **Learning** (`learning/`) - Educational examples with MCP (Model Context Protocol) integration

## 🛠️ Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key (for most examples)
- Neo4j database (for graph examples)
- Other dependencies as specified in each example's `package.json`

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd langchain
   ```

2. **Set up environment variables:**
   Create a `.env` file in each example directory with the required API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   NEO4J_URI=your_neo4j_uri
   NEO4J_USERNAME=your_neo4j_username
   NEO4J_PASSWORD=your_neo4j_password
   ```

3. **Install dependencies for each example:**
   ```bash
   # Navigate to any example directory
   cd simple_chat
   npm install
   ```

4. **Run an example:**
   ```bash
   npm start
   # or
   node --import=tsx index.ts
   ```

## 📁 Example Structure

Each example follows a consistent structure:
```
example-name/
├── index.ts          # Main implementation
├── package.json      # Dependencies and scripts
├── package-lock.json # Lock file
└── README.md         # Example-specific documentation (if available)
```

## 🎯 Key Features Demonstrated

- **Chat Models & Prompts** - Building conversational AI applications
- **Vector Stores & Embeddings** - Semantic search and retrieval
- **Agents & Tools** - Autonomous AI agents with external capabilities
- **RAG Systems** - Retrieval-augmented generation for knowledge-based responses
- **Multi-Agent Coordination** - Complex systems with multiple AI agents
- **Graph Database Integration** - Knowledge graph querying and reasoning
- **SQL Integration** - Database-driven question answering
- **Streaming** - Real-time response generation
- **Memory Management** - Conversation history and context preservation

## 🔗 Resources

- [LangChain.js Documentation](https://js.langchain.com/)
- [LangChain.js Tutorials](https://js.langchain.com/docs/tutorials/)
- [LangGraph.js Documentation](https://langchain-ai.github.io/langgraph/)
- [LangSmith](https://smith.langchain.com/) - Monitoring and evaluation platform

**Note:** These examples are based on the official LangChain.js tutorials and are designed for educational purposes. Make sure to review and adapt the code according to your specific use cases and requirements.
