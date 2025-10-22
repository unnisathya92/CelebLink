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
    // Search for entities
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      query
    )}&language=en&format=json&type=item&limit=10`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const searchRes = await fetch(searchUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!searchRes.ok) {
      throw new Error('Search failed');
    }

    const searchData = await searchRes.json();
    const entities = searchData.search || [];

    if (entities.length === 0) {
      return [];
    }

    // Extract QIDs
    const qids = entities.map((e: any) => e.id);

    // Fetch images via SPARQL
    const sparqlQuery = `
SELECT ?qid ?img ?genderLabel WHERE {
  VALUES ?qid { ${qids.map((id: string) => `wd:${id}`).join(' ')} }
  OPTIONAL { ?qid wdt:P18 ?img }
  OPTIONAL { ?qid wdt:P21 ?gender }
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
      },
    });
    clearTimeout(timeout2);

    let imageMap: Map<string, { img?: string; gender?: string }> = new Map();

    if (sparqlRes.ok) {
      const sparqlData = await sparqlRes.json();
      const bindings = sparqlData.results?.bindings || [];

      bindings.forEach((b: any) => {
        const qid = b.qid?.value?.split('/').pop();
        if (qid) {
          const img = b.img?.value;
          const gender = b.genderLabel?.value;
          imageMap.set(qid, {
            img: img ? convertToThumbUrl(img) : undefined,
            gender: mapGender(gender),
          });
        }
      });
    }

    // Combine results
    const suggestions: Suggestion[] = entities.map((e: any) => {
      const extra = imageMap.get(e.id) || {};
      return {
        qid: e.id,
        name: e.label || e.id,
        description: e.description,
        img: extra.img,
        gender: extra.gender,
      };
    });

    // Cache results
    cache.set(query, { data: suggestions, expires: Date.now() + CACHE_TTL });

    return suggestions;
  } catch (error) {
    console.error('Wikidata search error:', error);
    return [];
  }
}

function convertToThumbUrl(url: string): string {
  // Extract filename from Wikimedia Commons URL
  const match = url.match(/[^\/]+$/);
  if (!match) return url;

  const filename = match[0];
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    filename
  )}?width=96`;
}

function mapGender(label?: string): 'male' | 'female' | undefined {
  if (!label) return undefined;
  const lower = label.toLowerCase();
  if (lower.includes('male') && !lower.includes('female')) return 'male';
  if (lower.includes('female')) return 'female';
  return undefined;
}
