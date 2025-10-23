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
 * Validate that a meeting photo URL likely contains both people
 */
function validateMeetingPhotoUrl(url: string, name1: string, name2: string): boolean {
  if (!url) return false;

  const urlLower = url.toLowerCase();
  const name1Lower = name1.toLowerCase();
  const name2Lower = name2.toLowerCase();

  // Extract key parts of each name (exclude common words)
  const getName1Parts = name1Lower
    .split(' ')
    .filter(part => part.length > 2 && !['the', 'and', 'von', 'van', 'de'].includes(part));
  const getName2Parts = name2Lower
    .split(' ')
    .filter(part => part.length > 2 && !['the', 'and', 'von', 'van', 'de'].includes(part));

  // Check if URL contains at least one significant part from each name
  const hasName1 = getName1Parts.some(part => urlLower.includes(part));
  const hasName2 = getName2Parts.some(part => urlLower.includes(part));

  return hasName1 && hasName2;
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

    // Validate each result
    for (const imageUrl of results) {
      if (validateMeetingPhotoUrl(imageUrl, name1, name2)) {
        console.log(`    ✓ Found valid meeting photo in Google results`);
        return imageUrl;
      }
    }
  }

  console.log(`  ✗ No valid meeting photo found in Google results`);
  return '';
}
