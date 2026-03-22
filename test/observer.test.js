import test from "node:test";
import assert from "node:assert/strict";

import {
  createObserver,
  createConsoleLogger,
  createJsonLogger,
  buildSummary,
  normalizeStatus
} from "../src/index.js";

test("createObserver records entries and returns a summary", () => {
  const lines = [];
  const observer = createObserver({
    logger: createConsoleLogger({
      enabled: true,
      writer: (line) => lines.push(line)
    })
  });

  observer.observe({
    request: { task: "summarization" },
    response: { status: "success" },
    durationMs: 100
  });

  observer.observe({
    request: { task: "classification" },
    response: { status: "uncertain" },
    durationMs: 200
  });

  const entries = observer.getEntries();
  const summary = observer.getSummary();

  assert.equal(entries.length, 2);
  assert.equal(summary.total, 2);
  assert.equal(summary.success, 1);
  assert.equal(summary.uncertain, 1);
  assert.equal(summary.averageDurationMs, 150);
  assert.equal(lines.length, 2);
});

test("normalizeStatus returns unknown for unsupported values", () => {
  assert.equal(normalizeStatus("success"), "success");
  assert.equal(normalizeStatus("SUCCESS"), "success");
  assert.equal(normalizeStatus("weird"), "unknown");
  assert.equal(normalizeStatus(null), "unknown");
});

test("buildSummary handles empty entries", () => {
  const summary = buildSummary([]);
  assert.deepEqual(summary, {
    total: 0,
    success: 0,
    uncertain: 0,
    refusal: 0,
    error: 0,
    unknown: 0,
    successRate: 0,
    averageDurationMs: null
  });
});

test("createJsonLogger emits JSON", () => {
  const lines = [];
  const logger = createJsonLogger({
    writer: (line) => lines.push(line)
  });

  const observer = createObserver({ logger });
  observer.observe({
    request: { task: "extraction" },
    response: { status: "error" },
    durationMs: 50
  });

  assert.equal(lines.length, 1);
  const parsed = JSON.parse(lines[0]);
  assert.equal(parsed.response.status, "error");
  assert.equal(parsed.durationMs, 50);
});

test("clear removes stored entries", () => {
  const observer = createObserver();
  observer.observe({
    request: { task: "summarization" },
    response: { status: "success" }
  });

  observer.clear();

  assert.equal(observer.getEntries().length, 0);
});
