export function validateDomain(domain: string): boolean {
  const domainRegex = /^https:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
  return domainRegex.test(domain);
}

export function validateRssUrl(domain: string, rssUrl: string): boolean {
  try {
    const domainObj = new URL(domain);
    const rssObj = new URL(rssUrl);

    // must start with the domain
    if (
      rssObj.hostname === domainObj.hostname &&
      rssObj.protocol === "https:"
    ) {
      return true;
    }
    return false;
  } catch (e) {
    return false; // invalid URL
  }
}

export async function isValidRssFeed(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) return false;

    const text = await res.text();

    return text.includes("<rss") || text.includes("<feed");
  } catch (err) {
    return false;
  }
}
