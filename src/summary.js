const KNOWN_STATUSES = new Set(["success", "uncertain", "refusal", "error"]);

export function normalizeStatus(status) {
  if (typeof status !== "string") {
    return "unknown";
  }

  const value = status.trim().toLowerCase();
  return KNOWN_STATUSES.has(value) ? value : "unknown";
}

export function buildSummary(entries = []) {
  const summary = {
    total: 0,
    success: 0,
    uncertain: 0,
    refusal: 0,
    error: 0,
    unknown: 0,
    successRate: 0,
    averageDurationMs: null
  };

  let durationTotal = 0;
  let durationCount = 0;

  for (const entry of entries) {
    summary.total += 1;

    const status = normalizeStatus(entry?.response?.status);
    summary[status] += 1;

    const duration = entry?.durationMs;
    if (Number.isFinite(duration)) {
      durationTotal += duration;
      durationCount += 1;
    }
  }

  if (summary.total > 0) {
    summary.successRate = Number((summary.success / summary.total).toFixed(4));
  }

  if (durationCount > 0) {
    summary.averageDurationMs = Number((durationTotal / durationCount).toFixed(2));
  }

  return summary;
}
