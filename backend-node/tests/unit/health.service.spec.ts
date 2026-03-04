import { describe, expect, it } from "vitest";

import { getHealthStatus } from "../../src/modules/health/health.service";

describe("getHealthStatus", () => {
  it("returns status ok with service name and timestamp", () => {
    const result = getHealthStatus("nutrifit-test");

    expect(result.status).toBe("ok");
    expect(result.service).toBe("nutrifit-test");
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
