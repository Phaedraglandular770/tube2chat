import { describe, it, expect, beforeEach } from "vitest";
import { buildGeminiUrl } from "../utils/prompt";

describe("buildGeminiUrl", () => {
  const testVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  let result: string;
  let decodedPrompt: string;

  beforeEach(() => {
    result = buildGeminiUrl(testVideoUrl);
    decodedPrompt = decodeURIComponent(
      new URL(result).searchParams.get("prompt")!,
    );
  });

  it("should return a URL starting with Gemini app with prompt param", () => {
    expect(result).toMatch(/^https:\/\/gemini\.google\.com\/app\?prompt=/);
  });

  it("should include the video URL in the decoded prompt", () => {
    expect(decodedPrompt).toContain(testVideoUrl);
  });

  it("should include 'introduction' in the decoded prompt", () => {
    expect(decodedPrompt).toContain("introduction");
  });

  it("should include 'timestamps' or 'horodatages' in the decoded prompt", () => {
    const hasTimestamps =
      decodedPrompt.includes("timestamps") ||
      decodedPrompt.includes("horodatages");
    expect(
      hasTimestamps,
      "prompt must contain 'timestamps' or 'horodatages'",
    ).toBe(true);
  });

  it("should include 'conclusion' in the decoded prompt", () => {
    expect(decodedPrompt).toContain("conclusion");
  });

  it("should include 'français' in the decoded prompt", () => {
    expect(decodedPrompt).toContain("français");
  });

  it("should have no raw spaces in the URL string", () => {
    const result = buildGeminiUrl(testVideoUrl);
    expect(result.includes(" ")).toBe(false);
  });

  it("should have no literal newlines in the URL string", () => {
    const result = buildGeminiUrl(testVideoUrl);
    expect(result.includes("\n")).toBe(false);
  });
});
