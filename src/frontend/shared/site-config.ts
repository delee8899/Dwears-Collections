const profileHosts: Record<string, string[]> = {
  TikTok: ["tiktok.com", "www.tiktok.com"],
  Instagram: ["instagram.com", "www.instagram.com"],
};
function safeProfileUrl(label: string, rawUrl: string | undefined): string | undefined {
  if (!rawUrl?.trim()) return undefined;
  try {
    const url = new URL(rawUrl.trim());
    if (url.protocol !== "https:" || !profileHosts[label]?.includes(url.hostname.toLowerCase()) || url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}
export const socialLinks = [
  { label: "TikTok", href: safeProfileUrl("TikTok", process.env.NEXT_PUBLIC_TIKTOK_URL) },
  { label: "Instagram", href: safeProfileUrl("Instagram", process.env.NEXT_PUBLIC_INSTAGRAM_URL) },
].filter((link): link is { label: string; href: string } => Boolean(link.href));
