/**
 * Search for images using Google Custom Search API
 * Free tier: 100 searches/day
 * After that: $5 per 1000 queries
 */
export async function searchGoogleImages(query: string, limit: number = 1): Promise<string[]> {
  const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

  if (!apiKey || !searchEngineId) {
    console.log('  Google Custom Search not configured');
    return [];
  }

  try {
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(
      query
    )}&searchType=image&num=${limit}&safe=active&imgSize=large`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(searchUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`  Google search failed: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const items = data.items || [];

    if (items.length === 0) {
      console.log(`  No Google images found for: ${query}`);
      return [];
    }

    // Return image URLs
    const imageUrls = items.map((item: any) => item.link);
    console.log(`  Found ${imageUrls.length} Google image(s)`);

    return imageUrls;
  } catch (error) {
    console.error(`  Error searching Google images:`, error);
    return [];
  }
}

/**
 * Search for photos of two people together using Google Images
 */
export async function searchMeetingPhotoGoogle(name1: string, name2: string): Promise<string> {
  const queries = [
    `"${name1}" "${name2}" together photo`,
    `${name1} ${name2} meeting`,
    `${name1} with ${name2}`,
  ];

  for (const query of queries) {
    console.log(`  Trying Google search: ${query}`);
    const results = await searchGoogleImages(query, 3);

    if (results.length > 0) {
      // Return the first result
      return results[0];
    }
  }

  return '';
}
