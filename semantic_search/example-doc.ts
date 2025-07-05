import { Document } from "@langchain/core/documents";

const documents = [
  new Document({
    pageContent: "The sky is blue",
    metadata: {
      source: "sky",
    },
  }),
  new Document({
    pageContent: "The sky is red",
    metadata: {
      source: "sky",
    },
  }),
];
console.log("🚀 ~ documents:", documents)
