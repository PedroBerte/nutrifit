import request from "supertest";
import { describe, expect, it } from "vitest";

import { createApp } from "../../src/app";

describe("GET /health", () => {
  it("returns 200 with health payload", async () => {
    const app = createApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.body.service).toBe("nutrifit-backend-node");
    expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
  });
});
