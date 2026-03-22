import { createObserver, createJsonLogger } from "../src/index.js";

const logs = [];
const observer = createObserver({
  logger: createJsonLogger({
    writer: (line) => logs.push(line),
    pretty: true
  })
});

const request = {
  version: "1.0",
  task: "summarization",
  prompt: "Summarize this text in three sentences."
};

const response = {
  version: "1.0",
  status: "success",
  output: {
    text: "This is the generated summary."
  },
  meta: {
    model: "example-model-v1"
  }
};

observer.observe({
  request,
  response,
  durationMs: 842
});

console.log("Logged entries:");
console.log(logs.join("\n"));
console.log("\nSummary:");
console.log(observer.getSummary());
