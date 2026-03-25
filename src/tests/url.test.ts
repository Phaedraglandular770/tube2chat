import { describe, it, expect } from "vitest";
import { isYouTubeWatchPage } from "../utils/url";

describe("isYouTubeWatchPage", () => {
  it("should return true for a valid YouTube watch URL with video ID", () => {
    expect(isYouTubeWatchPage("https://www.youtube.com/watch?v=abc123")).toBe(
      true,
    );
  });

  it("should return false for YouTube feed/subscriptions URL", () => {
    expect(
      isYouTubeWatchPage("https://www.youtube.com/feed/subscriptions"),
    ).toBe(false);
  });

  it("should return false for YouTube channel URL", () => {
    expect(isYouTubeWatchPage("https://www.youtube.com/channel/UCxyz")).toBe(
      false,
    );
  });

  it("should return false for YouTube watch URL without video ID param", () => {
    expect(isYouTubeWatchPage("https://www.youtube.com/watch")).toBe(false);
  });

  it("should return false for empty string", () => {
    expect(isYouTubeWatchPage("")).toBe(false);
  });

  it("should return false for music.youtube.com", () => {
    expect(isYouTubeWatchPage("https://music.youtube.com/watch?v=abc123")).toBe(
      false,
    );
  });
});
