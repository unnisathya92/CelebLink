/**
 * Safely extracts and parses JSON from text that may contain non-JSON content.
 * Strips everything before the first '{' and after the last '}'.
 */
export function extractJson<T = any>(text: string): T | null {
  try {
    // Find first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
      return null;
    }

    const jsonStr = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error('JSON extraction failed:', error);
    return null;
  }
}
