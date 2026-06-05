import { describe, it, expect, beforeAll, vi } from "vitest";
import { grokRouter } from "./grok";

describe("Grok Router", () => {
  beforeAll(() => {
    // ตั้งค่า mock environment
    process.env.XAI_API_KEY = "test-key";
  });

  it("should have chat procedure", () => {
    expect(grokRouter._def.procedures.chat).toBeDefined();
  });

  it("should have analyzeRisk procedure", () => {
    expect(grokRouter._def.procedures.analyzeRisk).toBeDefined();
  });

  it("should have getModels procedure", () => {
    expect(grokRouter._def.procedures.getModels).toBeDefined();
  });

  it("should have testConnection procedure", () => {
    expect(grokRouter._def.procedures.testConnection).toBeDefined();
  });

  it("should return models list", async () => {
    const result = await grokRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    }).getModels();

    expect(result).toHaveProperty("models");
    expect(Array.isArray(result.models)).toBe(true);
  });

  it("should handle missing API key gracefully", async () => {
    const originalKey = process.env.XAI_API_KEY;
    delete process.env.XAI_API_KEY;

    const result = await grokRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    }).getModels();

    expect(result.available).toBe(false);

    // Restore
    process.env.XAI_API_KEY = originalKey;
  });
});
