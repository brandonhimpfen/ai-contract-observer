import { createConsoleLogger } from "./logger.js";
import { buildSummary, normalizeStatus } from "./summary.js";

function formatSequence(sequence) {
  return String(sequence).padStart(6, "0");
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function normalizeTimestamp(timestamp) {
  const date = timestamp ? new Date(timestamp) : new Date();

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("timestamp must be a valid date or ISO string");
  }

  return date.toISOString();
}

function normalizeDuration(durationMs) {
  if (durationMs == null) {
    return null;
  }

  if (!Number.isFinite(durationMs) || durationMs < 0) {
    throw new TypeError("durationMs must be a non-negative finite number");
  }

  return durationMs;
}

function createEntry({ id, timestamp, durationMs, request, response }) {
  return {
    id,
    timestamp,
    durationMs,
    request: clone(request) ?? null,
    response: clone(response) ?? null
  };
}

export function createObserver(options = {}) {
  const {
    logger = createConsoleLogger({ enabled: false }),
    idPrefix = "obs",
    startSequence = 1
  } = options;

  if (!logger || typeof logger.log !== "function") {
    throw new TypeError("logger must be an object with a log(entry) function");
  }

  if (!Number.isInteger(startSequence) || startSequence < 1) {
    throw new TypeError("startSequence must be a positive integer");
  }

  let sequence = startSequence;
  const entries = [];

  function observe({ request = null, response = null, durationMs = null, timestamp } = {}) {
    const id = `${idPrefix}_${formatSequence(sequence++)}`;
    const normalizedTimestamp = normalizeTimestamp(timestamp);
    const normalizedDuration = normalizeDuration(durationMs);

    const entry = createEntry({
      id,
      timestamp: normalizedTimestamp,
      durationMs: normalizedDuration,
      request,
      response
    });

    logger.log(entry);
    entries.push(entry);

    return clone(entry);
  }

  function getEntries() {
    return clone(entries);
  }

  function getSummary() {
    return buildSummary(entries);
  }

  function clear() {
    entries.length = 0;
  }

  return {
    observe,
    getEntries,
    getSummary,
    clear,
    normalizeStatus
  };
}
