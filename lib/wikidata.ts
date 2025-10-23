export type Suggestion = {
  qid: string;
  name: string;
  description?: string;
  img?: string;
  gender?: 'male' | 'female';
};

// In-memory cache with TTL
const cache = new Map<string, { data: Suggestion[]; expires: number }>();
const CACHE_TTL = 60000; // 60 seconds

export async function searchWikidata(query: string): Promise<Suggestion[]> {
  // Check cache
  const cached = cache.get(query);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  try {
    // Search for entities with retry logic
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      query
    )}&language=en&format=json&type=item&limit=10`;

    let searchRes;
    let retries = 3;

    while (retries > 0) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // Increased to 10s

        searchRes = await fetch(searchUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'CelebLink/1.0 (https://celebslinks.com; contact@celebslinks.com)',
          },
        });
        clearTimeout(timeout);

        if (searchRes.ok) {
          break; // Success, exit retry loop
        }

        // Log the error status
        console.error(`Wikidata search failed with status ${searchRes.status}: ${searchRes.statusText}`);

        // If rate limited (429) or server error (5xx), retry
        if (searchRes.status === 429 || searchRes.status >= 500) {
          retries--;
          if (retries > 0) {
            const delay = (4 - retries) * 1000; // 1s, 2s, 3s backoff
            console.log(`  Retrying in ${delay}ms... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        throw new Error(`Wikidata API error: ${searchRes.status} ${searchRes.statusText}`);
      } catch (fetchError: any) {
        if (fetchError.name === 'AbortError') {
          console.error('Wikidata search timed out');
          retries--;
          if (retries > 0) {
            console.log(`  Retrying... (${retries} retries left)`);
            continue;
          }
        }
        throw fetchError;
      }
    }

    if (!searchRes || !searchRes.ok) {
      console.error('Wikidata search failed after retries, returning empty results');
      return [];
    }

    const searchData = await searchRes.json();
    const entities = searchData.search || [];

    if (entities.length === 0) {
      return [];
    }

    // Extract QIDs
    const qids = entities.map((e: any) => e.id);

    // Fetch images via SPARQL and check if entity is human
    const sparqlQuery = `
SELECT ?qid ?img ?genderLabel ?instanceLabel WHERE {
  VALUES ?qid { ${qids.map((id: string) => `wd:${id}`).join(' ')} }
  OPTIONAL { ?qid wdt:P18 ?img }
  OPTIONAL { ?qid wdt:P21 ?gender }
  OPTIONAL { ?qid wdt:P31 ?instance }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}`;

    const sparqlUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
      sparqlQuery
    )}&format=json`;

    const controller2 = new AbortController();
    const timeout2 = setTimeout(() => controller2.abort(), 8000);

    const sparqlRes = await fetch(sparqlUrl, {
      signal: controller2.signal,
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'CelebLink/1.0',
      },
    });
    clearTimeout(timeout2);

    let imageMap: Map<string, { img?: string; gender?: string; isHuman: boolean }> = new Map();

    if (sparqlRes.ok) {
      const sparqlData = await sparqlRes.json();
      const bindings = sparqlData.results?.bindings || [];

      console.log(`Autocomplete: Got ${bindings.length} SPARQL results for ${qids.length} QIDs`);

      bindings.forEach((b: any) => {
        const qid = b.qid?.value?.split('/').pop();
        if (qid) {
          const imgUrl = b.img?.value;
          const gender = b.genderLabel?.value;
          const instance = b.instanceLabel?.value?.toLowerCase() || '';
          const isHuman = instance.includes('human') || !!gender;

          // Store or update the entry
          const existing = imageMap.get(qid);
          const convertedImg = imgUrl ? convertToThumbUrl(imgUrl) : existing?.img;

          if (imgUrl) {
            console.log(`  ${qid}: Found image (${convertedImg?.substring(0, 60)}...)`);
          }

          imageMap.set(qid, {
            img: convertedImg,
            gender: mapGender(gender) || existing?.gender,
            isHuman: isHuman || existing?.isHuman || false,
          });
        }
      });
    } else {
      console.error(`Autocomplete SPARQL failed: ${sparqlRes.status}`);
    }

    // Combine results - only include entities that are humans
    const suggestions: Suggestion[] = entities
      .map((e: any) => {
        const extra = imageMap.get(e.id);
        // If we have data and it's marked as human, include it
        // If we don't have data but description suggests it's a person, include it
        const descLower = (e.description || '').toLowerCase();
        const labelLower = (e.label || '').toLowerCase();

        // Broad list of person-related keywords
        const personKeywords = [
          'actor', 'actress', 'singer', 'musician', 'politician', 'writer', 'director',
          'producer', 'artist', 'athlete', 'player', 'leader', 'activist', 'author',
          'poet', 'philosopher', 'scientist', 'physicist', 'chemist', 'biologist',
          'mathematician', 'engineer', 'inventor', 'explorer', 'astronaut', 'pilot',
          'journalist', 'reporter', 'presenter', 'host', 'comedian', 'dancer',
          'choreographer', 'composer', 'conductor', 'performer', 'model', 'designer',
          'architect', 'painter', 'sculptor', 'photographer', 'filmmaker',
          'entrepreneur', 'businessman', 'businesswoman', 'executive', 'founder',
          'president', 'minister', 'senator', 'governor', 'mayor', 'diplomat',
          'revolutionary', 'reformer', 'lawyer', 'judge', 'doctor', 'surgeon',
          'professor', 'teacher', 'educator', 'researcher', 'scholar', 'historian',
          'theologian', 'priest', 'monk', 'nun', 'missionary', 'humanitarian',
          'philanthropist', 'nobel laureate', 'freedom fighter', 'social worker',
          'psychologist', 'psychiatrist', 'coach', 'manager', 'captain', 'referee'
        ];

        const isProbablyPerson = personKeywords.some(keyword =>
          descLower.includes(keyword) || labelLower.includes(keyword)
        );

        const isHuman = extra?.isHuman || isProbablyPerson;

        if (!isHuman) return null;

        return {
          qid: e.id,
          name: e.label || e.id,
          description: e.description,
          img: extra?.img || '',
          gender: extra?.gender,
        };
      })
      .filter((s: Suggestion | null): s is Suggestion => s !== null);

    // Cache results
    cache.set(query, { data: suggestions, expires: Date.now() + CACHE_TTL });

    return suggestions;
  } catch (error) {
    console.error('Wikidata search error:', error);
    return [];
  }
}

async function md5(text: string): Promise<string> {
  // Simple MD5 implementation for browser/Node.js
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for environments without crypto.subtle
  return text; // Will use Special:FilePath as fallback
}

function convertToThumbUrl(url: string): string {
  if (!url) return '';

  try {
    // Extract the filename from various URL formats
    let filename = '';

    if (url.includes('Special:FilePath/')) {
      const parts = url.split('Special:FilePath/');
      if (parts[1]) {
        filename = parts[1].split('?')[0];
      }
    } else if (url.includes('/commons/')) {
      const match = url.match(/\/commons\/(?:thumb\/)?(?:\w+\/\w+\/)?([^?]+)/);
      if (match) {
        filename = match[1];
      }
    } else {
      const match = url.match(/\/([^\/]+\.(jpg|jpeg|png|gif|svg|webp))(?:\?|$)/i);
      if (match) {
        filename = match[1];
      }
    }

    if (!filename) {
      return url;
    }

    // Decode the filename
    filename = decodeURIComponent(filename);

    // Use Special:FilePath which is more reliable and handles redirects automatically
    // This will work better than thumb.php for many images
    const encodedFilename = encodeURIComponent(filename);
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedFilename}?width=200`;
  } catch (error) {
    console.error('Error converting thumbnail URL:', error, url);
    return url;
  }
}

function mapGender(label?: string): 'male' | 'female' | undefined {
  if (!label) return undefined;
  const lower = label.toLowerCase();
  if (lower.includes('male') && !lower.includes('female')) return 'male';
  if (lower.includes('female')) return 'female';
  return undefined;
}

/**
 * Get person's main image from Wikidata P18 property
 */
export async function getPersonImageFromWikidata(qid: string, name: string): Promise<string> {
  try {
    // Use Wikidata's P18 (image) property directly
    const sparqlQuery = `
SELECT ?image WHERE {
  wd:${qid} wdt:P18 ?image .
}
LIMIT 1`;

    const sparqlUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
      sparqlQuery
    )}&format=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(sparqlUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'CelebLink/1.0',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`  SPARQL failed with status: ${response.status}`);
      return '';
    }

    const data = await response.json();
    const imageUrl = data.results?.bindings?.[0]?.image?.value;

    if (!imageUrl) {
      console.log(`  No P18 image property found for ${name}`);
      return '';
    }

    // Convert to thumbnail URL
    const thumbnailUrl = convertToThumbUrl(imageUrl);
    return thumbnailUrl;
  } catch (error) {
    console.error(`  Error fetching image for ${name} (${qid}):`, error);
    return '';
  }
}

/**
 * Validate that an image URL is likely a person photo (not a random image)
 * @param url - Image URL to validate
 * @param name - Person's name
 * @param isMeetingPhoto - If true, validation is more lenient (for photos of multiple people together)
 */
function isLikelyPersonImage(url: string, name: string, isMeetingPhoto: boolean = false): boolean {
  if (!url) return false;

  const urlLower = url.toLowerCase();
  const nameLower = name.toLowerCase();

  // For meeting photos (multiple people), be very lenient
  if (isMeetingPhoto) {
    console.log(`    ✓ Accepted: Meeting photo (lenient validation)`);
    return true;
  }

  // For Wikimedia/Wikipedia URLs, be very lenient (trusted source)
  // Only reject if it's obviously not a person photo
  if (urlLower.includes('wikimedia.org') || urlLower.includes('wikipedia.org')) {
    // Only reject truly invalid types
    const obviouslyInvalidPatterns = [
      'logo.', 'icon.', '.svg',
      'flag_of_', 'coat_of_arms',
      'map_of_', 'diagram_',
    ];

    const hasObviouslyInvalid = obviouslyInvalidPatterns.some(pattern =>
      urlLower.includes(pattern)
    );

    if (hasObviouslyInvalid) {
      console.log(`    ✗ Rejected: Wikimedia URL contains obviously invalid pattern`);
      return false;
    }

    console.log(`    ✓ Accepted: Wikimedia/Wikipedia URL (trusted source)`);
    return true;
  }

  // For non-Wikimedia URLs, require name match
  const nameParts = nameLower
    .split(' ')
    .filter(part => part.length > 2)
    .map(part => part.replace(/[^a-z]/g, ''));

  const hasNameMatch = nameParts.some(part => urlLower.includes(part));

  if (!hasNameMatch) {
    console.log(`    ✗ Rejected: Non-Wikimedia URL doesn't contain person's name`);
    return false;
  }

  console.log(`    ✓ Accepted: URL contains person's name`);
  return true;
}

/**
 * Get person's main image from Wikipedia using their Wikidata QID
 */
export async function getPersonImageFromWikipedia(qid: string, name: string): Promise<string> {
  try {
    // CHANGE: Try Wikipedia page image FIRST (more reliable than Wikidata P18)
    console.log(`  Trying Wikipedia page image...`);

    // Get Wikipedia article URL
    const sparqlQuery = `
SELECT ?article WHERE {
  wd:${qid} schema:about ?article .
  ?article schema:isPartOf <https://en.wikipedia.org/> .
}
LIMIT 1`;

    const sparqlUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(
      sparqlQuery
    )}&format=json`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(sparqlUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/sparql-results+json',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      const articleUrl = data.results?.bindings?.[0]?.article?.value;

      if (articleUrl) {
        // Extract article title from URL
        const title = decodeURIComponent(articleUrl.split('/wiki/')[1]);
        console.log(`    Found article: ${title}`);

        // Get the page image from Wikipedia
        const pageImageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
          title
        )}&prop=pageimages&format=json&pithumbsize=400&origin=*`;

        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 5000);

        const imgResponse = await fetch(pageImageUrl, {
          signal: controller2.signal,
        });
        clearTimeout(timeout2);

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          const pages = imgData.query?.pages;

          if (pages) {
            const pageId = Object.keys(pages)[0];
            const imageUrl = pages[pageId]?.thumbnail?.source || '';

            if (imageUrl && isLikelyPersonImage(imageUrl, name)) {
              console.log(`    ✓ Found valid page image`);
              return imageUrl;
            } else if (imageUrl) {
              console.log(`    ✗ Page image failed validation`);
            }
          }
        }
      }
    }

    // Fallback: Try Wikidata P18 property
    console.log(`  Trying Wikidata P18 property...`);
    const wikidataImageUrl = await getPersonImageFromWikidata(qid, name);

    if (wikidataImageUrl && isLikelyPersonImage(wikidataImageUrl, name)) {
      console.log(`    ✓ Found valid P18 image`);
      return wikidataImageUrl;
    } else if (wikidataImageUrl) {
      console.log(`    ✗ P18 image failed validation`);
    }

    console.log(`  ✗ No valid photo found`);
    return '';
  } catch (error) {
    console.error(`  Error fetching image for ${name} (${qid}):`, error);
    return '';
  }
}

/**
 * Search for images of two people together on Wikimedia Commons
 */
export async function searchPhotosOfPeopleTogether(name1: string, name2: string): Promise<string> {
  try {
    // Search Commons for files with both names
    const searchQuery = `"${name1}" "${name2}"`;
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(
      searchQuery
    )}&srnamespace=6&srlimit=3&origin=*`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(searchUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return '';

    const data = await response.json();
    const results = data.query?.search || [];

    if (results.length === 0) return '';

    // Get the first result's title
    const title = results[0].title.replace('File:', '');
    const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
      title
    )}?width=400`;

    return imageUrl;
  } catch (error) {
    console.error(`Error searching for photos of ${name1} and ${name2}:`, error);
    return '';
  }
}
