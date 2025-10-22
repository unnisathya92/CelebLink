export const system = `
You output STRICT JSON describing a shortest plausible celebrity link path via photos.
For each hop A->B return ONE public image URL that depicts BOTH people together.
Add caption, and if available: date (YYYY-MM-DD), location, license, source page URL.
Prefer Wikimedia Commons. Do NOT fabricate links. No prose. JSON only.
Schema must be exactly as specified by the user prompt.
`;

export const user = (from: any, to: any) => `
Return JSON matching EXACTLY:

{
  "nodes": [
    { "qid": "Q...", "name": "Name", "img": "https://..." }
  ],
  "edges": [
    {
      "from": "Q...",
      "to": "Q...",
      "photo": {
        "url": "https://...",
        "caption": "string",
        "date": "YYYY-MM-DD or \"\"",
        "location": "string or \"\"",
        "license": "string or \"\"",
        "source": "https://..."
      }
    }
  ]
}

Rules:
- First node must be ${from.name} (${from.qid}); last node must be ${to.name} (${to.qid}).
- Include BETWEEN 1 and 6 edges. Each edge's photo MUST clearly show BOTH people together.
- Prefer Commons files with depicts tags; otherwise reputable editorial sources.
- If no valid co-photo path exists, return {"nodes":[${JSON.stringify(from)},${JSON.stringify(to)}],"edges":[]}.
`;
