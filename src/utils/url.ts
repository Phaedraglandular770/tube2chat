export function isYouTubeWatchPage(url: string): boolean {
  try {
    const { hostname, pathname, searchParams } = new URL(url);
    const isYouTube =
      hostname === "www.youtube.com" || hostname === "youtube.com";
    return isYouTube && pathname === "/watch" && searchParams.has("v");
  } catch {
    return false;
  }
}
