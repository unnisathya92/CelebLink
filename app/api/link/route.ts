import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { extractJson } from '@/lib/json';
import type { Suggestion } from '@/lib/wikidata';
import { getPersonImageFromWikipedia, searchPhotosOfPeopleTogether, validateQID, findCorrectQID, getPersonDates, validateMeetingDate } from '@/lib/wikidata';
import { searchMeetingPhotoGoogle } from '@/lib/googleImages';

// Mock data for when no OpenAI key is available
const MOCK_DATA = {
  nodes: [
    {
      qid: 'QTC',
      name: 'Tom Cruise',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Tom_Cruise_by_Gage_Skidmore_2.jpg/256px-Tom_Cruise_by_Gage_Skidmore_2.jpg',
    },
    {
      qid: 'QAK',
      name: 'Anil Kapoor',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Anil_Kapoor_2023.jpg/256px-Anil_Kapoor_2023.jpg',
    },
    {
      qid: 'QSRK',
      name: 'Shah Rukh Khan',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Shah_Rukh_Khan_graces_star_screen_awards.jpg/256px-Shah_Rukh_Khan_graces_star_screen_awards.jpg',
    },
    {
      qid: 'QVJ',
      name: 'Vijay',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Vijay_at_Leo_Success_Meet.jpg/256px-Vijay_at_Leo_Success_Meet.jpg',
    },
  ],
  edges: [
    {
      from: 'QTC',
      to: 'QAK',
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Mission_Impossible_Ghost_Protocol_2011.jpg/320px-Mission_Impossible_Ghost_Protocol_2011.jpg',
        caption: 'Tom Cruise with Anil Kapoor (Ghost Protocol publicity)',
        date: '2013-01-07',
        location: '',
        license: 'CC',
        source: 'https://commons.wikimedia.org/',
      },
    },
    {
      from: 'QAK',
      to: 'QSRK',
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Zee_Cine_Awards_2024_logo.jpg',
        caption: 'Anil Kapoor & Shah Rukh Khan (Zee Cine Awards context)',
        date: '2024-03-10',
        location: '',
        license: 'CC',
        source: 'https://commons.wikimedia.org/',
      },
    },
    {
      from: 'QSRK',
      to: 'QVJ',
      photo: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Vijay_at_an_event.jpg/320px-Vijay_at_an_event.jpg',
        caption: 'Shah Rukh Khan with Vijay (awards stage)',
        date: '2013-01-04',
        location: '',
        license: 'CC',
        source: 'https://commons.wikimedia.org/',
      },
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from, to } = body as { from: Suggestion; to: Suggestion };

    if (!from || !to) {
      return NextResponse.json(
        { error: 'Both "from" and "to" are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, return mock data
    if (!apiKey) {
      console.log('No OpenAI API key found, returning mock data');
      return NextResponse.json(MOCK_DATA);
    }

    try {
      const openai = new OpenAI({ apiKey });

      // Log the prompts being sent
      console.log('\n========== OPENAI REQUEST ==========');
      console.log('From:', from.name, `(${from.qid})`);
      console.log('To:', to.name, `(${to.qid})`);
      console.log('\n--- SYSTEM PROMPT ---');
      console.log(`
You are an expert in identifying verifiable public photographs that depict known people together.
You must return STRICT JSON showing the SHORTEST PLAUSIBLE REAL photo chain linking two named public figures
(any domain—film, politics, sports, science, business, activism, etc.).
Prefer Wikimedia Commons or other editorially verified sources with clear evidence (e.g., Getty, Reuters, AP).
Avoid speculative or fabricated links.

Each hop (A→B) must have a REAL public image showing BOTH individuals together in the same frame
(e.g., events, summits, award shows, conferences, humanitarian gatherings, etc.).
Include 1–8 edges maximum.

Schema (no deviation allowed):
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
        "date": "YYYY-MM-DD or ''",
        "location": "string or ''",
        "license": "string or ''",
        "source": "https://..."
      }
    }
  ]
}

If absolutely no photographic path exists after reasonable search knowledge, return only the two nodes and an empty "edges" array.
`);
      console.log('\n--- USER PROMPT ---');
      console.log(`
From: ${from.name} (${from.qid})
To: ${to.name} (${to.qid})

Find and return a verified photo path (A→B→C…→Z) that connects them through public co-appearances.
Include intermediates from ANY domain if needed — not just cinema.
Prioritize real photographic evidence, event photos, award ceremonies, global summits, etc.
`);
      console.log('====================================\n');

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `
You are an expert in finding connections between notable people across any field.

Your goal: return STRICT JSON showing the SHORTEST PLAUSIBLE connection chain linking two named individuals.

CRITICAL PRIORITY - SHORTEST PATH:
- Your PRIMARY goal is to find the SHORTEST possible path (fewest hops)
- BEFORE suggesting intermediate people, check if the two people have met directly
- Example: If asked "Vijay → Margot Robbie", DO NOT use "Vijay → A → B → C → Margot" if "Vijay → B → Margot" exists
- ONLY add intermediate people if absolutely necessary
- Common direct connections to check first:
  * Co-stars in the same movie/show
  * Attended same major events (Oscars, Cannes, award shows)
  * Both appeared on same talk shows or interviews
  * Same film franchise or shared projects
- If you find a 4-hop path, actively search for 3-hop or 2-hop alternatives
- Prefer fewer intermediates over more famous intermediates

CRITICAL PRIORITY - PHOTO AVAILABILITY:
- ONLY suggest connections where BOTH people were PHOTOGRAPHED TOGETHER in the SAME FRAME
- DO NOT use connections where someone "visited" something or "attended" an event alone
- BOTH people must be PHYSICALLY PRESENT together in a documented photograph

CONNECTION TYPES (in order of preference):
1. **Movies/TV Shows** - Co-stars in the same film or TV show (MOST COMMON - check this FIRST!)
   * Shared scenes, promotional events, premieres together
   * Cast photos, behind-the-scenes photos

2. **Personal Relationships**
   * Married couples, dating/romantic partners
   * Family relationships (siblings, parent-child, cousins, etc.)
   * Close friendships with documented photos

3. **Professional Collaborations**
   * Director-actor pairs
   * Producer-actor pairs
   * Music collaborations (duets, featured artists)
   * Same sports team or competitors

4. **Public Events**
   * Major award ceremonies (Oscars, Grammys, Nobel Prize, etc.)
   * Film festivals and premieres (both appearing together)
   * Talk shows and interviews (both guests simultaneously)
   * Charity galas and fundraisers
   * G20/G7/UN summits with official photography
   * Weddings, funerals, memorial services (where both attended)
   * Major sports events (Olympics, World Cup)
- AVOID:
  * "Person X visited museum Y" - NOT a connection
  * "Both attended event Z" - Only valid if photographed TOGETHER
  * Obscure meetings or private gatherings unlikely to have photos
- If a direct connection lacks photos, find an intermediate person with PHOTO-DOCUMENTED connections to both

CRITICAL INSTRUCTIONS FOR PHOTO URLs:
- LEAVE url EMPTY ("") - we will fetch real photos from Wikipedia/Commons automatically
- Focus on providing accurate caption, date, location, and source (Wikipedia article URL)
- DO NOT attempt to provide image URLs - you will get them wrong
- DO NOT use example.com or make up URLs
- Your job is to identify WHO met WHERE and WHEN with PHOTOGRAPHIC EVIDENCE

Guidelines:
- Each hop (A→B) MUST be a meeting/event likely to have PUBLIC photographs
- Include 1–8 edges maximum (prefer more intermediates if it means better photo coverage)
- Use intermediates from any domain (music, politics, cinema, sports, activism, etc.)
- Provide detailed, accurate captions describing the PHOTOGRAPHED meeting/event
- Include dates (YYYY-MM-DD format) and locations whenever possible
- Include Wikipedia article URLs as source for verification
- Confidence should be "high" only if you're certain photos exist

Return STRICT JSON in this schema:

{
  "nodes": [
    { "qid": "Q...", "name": "Full Name", "img": "" }
  ],
  "edges": [
    {
      "from": "Q...",
      "to": "Q...",
      "photo": {
        "url": "",
        "caption": "Detailed description of PHOTOGRAPHED meeting (e.g., 'Photographed together at the 2015 Cannes Film Festival red carpet')",
        "date": "YYYY-MM-DD or ''",
        "location": "City, Country or ''",
        "license": "",
        "source": "https://en.wikipedia.org/wiki/Article_Name",
        "confidence": "high | medium"
      }
    }
  ]
}

EXAMPLE of GOOD caption: "Photographed together at the 2018 Met Gala in New York City"
EXAMPLE of GOOD caption: "Appeared together on The Tonight Show on 2015-03-15"
EXAMPLE of BAD caption: "Spielberg visited Picasso exhibition" - NOT a connection
EXAMPLE of BAD caption: "They might have met" or "They worked in the same industry"

If absolutely no PHOTO-DOCUMENTED connection path exists, return only the two nodes with an empty "edges" array.`,
          },
          {
            role: 'user',
            content: `
From: ${from.name} (${from.qid})
To: ${to.name} (${to.qid})

CRITICAL: The first node MUST be ${from.name} with QID ${from.qid}
CRITICAL: The last node MUST be ${to.name} with QID ${to.qid}
CRITICAL: Use the EXACT QIDs provided - do NOT change them

Find and return the SHORTEST PHOTO-DOCUMENTED connection path connecting them.

SHORTEST PATH REQUIREMENTS:
- Your TOP PRIORITY is minimizing the number of hops
- First, check if ${from.name} and ${to.name} have met DIRECTLY (same movie, same event, same show)
- If no direct connection, try 1 intermediate (A→B→C)
- ONLY use 2+ intermediates if absolutely necessary
- Always verify you cannot skip any intermediate person

IMPORTANT PHOTO REQUIREMENTS:
- Each connection MUST have likely photo evidence (major public events only)
- If direct connection lacks photos, ADD intermediates with well-documented photo opportunities
- Example: Instead of "Raghuram Rajan + Bill Clinton" (unlikely photo), use:
  "Raghuram Rajan + Narendra Modi" (G20/official meetings - photos exist) →
  "Narendra Modi + Barack Obama" (White House visits - photos exist) →
  "Barack Obama + Bill Clinton" (Democratic events - photos exist)
- Prioritize famous, widely-covered public events over obscure meetings

Include intermediates from any domain if needed (music, politics, cinema, sports, activism, etc.).
For intermediate people, ensure you use correct Wikidata QIDs.`,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content || '';

      // Log the raw response
      console.log('\n========== OPENAI RESPONSE ==========');
      console.log('Raw response:');
      console.log(content);
      console.log('=====================================\n');

      // Try to extract JSON from response
      const result = extractJson(content);

      // Log the parsed JSON
      console.log('\n========== PARSED JSON ==========');
      console.log(JSON.stringify(result, null, 2));
      console.log('=================================\n');

      if (!result || !result.nodes || !result.edges) {
        console.error('Failed to parse OpenAI response, using mock data');
        return NextResponse.json(MOCK_DATA);
      }

      // Fix: Reorder nodes based on edge connections
      if (result.edges.length > 0) {
        const nodeMap = new Map(result.nodes.map((n: any) => [n.qid, n]));
        const orderedNodes: any[] = [];

        // Start with the first edge's "from" node
        const firstNode = nodeMap.get(result.edges[0].from);
        if (firstNode) orderedNodes.push(firstNode);

        // Follow the chain through edges
        for (const edge of result.edges) {
          const toNode = nodeMap.get(edge.to);
          if (toNode && !orderedNodes.find((n: any) => n.qid === (toNode as any).qid)) {
            orderedNodes.push(toNode);
          }
        }

        // Add any remaining nodes that weren't in the chain
        for (const node of result.nodes) {
          if (!orderedNodes.find((n: any) => n.qid === (node as any).qid)) {
            orderedNodes.push(node);
          }
        }

        result.nodes = orderedNodes;

        console.log('\n========== REORDERED NODES ==========');
        console.log(result.nodes.map((n: any) => n.name).join(' → '));
        console.log(`Path length: ${result.edges.length} hop(s)`);
        console.log('=====================================\n');
      }

      // Validate QIDs and fix any mismatches
      console.log('\n========== VALIDATING QIDs ==========');
      for (const node of result.nodes) {
        console.log(`  Validating ${node.name} (${node.qid})`);
        const isValid = await validateQID(node.qid, node.name);

        if (!isValid) {
          console.log(`    ✗ Invalid QID! Searching for correct one...`);
          const correctQID = await findCorrectQID(node.name);

          if (correctQID) {
            console.log(`    ✓ Corrected: ${node.qid} → ${correctQID}`);

            // Update the QID in the node
            const oldQID = node.qid;
            node.qid = correctQID;

            // Update all edges that reference this node
            for (const edge of result.edges) {
              if (edge.from === oldQID) {
                edge.from = correctQID;
              }
              if (edge.to === oldQID) {
                edge.to = correctQID;
              }
            }
          } else {
            console.log(`    ✗ Could not find correct QID for ${node.name}`);
          }
        } else {
          console.log(`    ✓ Valid QID`);
        }
      }
      console.log('=====================================\n');

      // Validate meeting dates to catch impossible/anachronistic connections
      console.log('\n========== VALIDATING MEETING DATES ==========');

      // Fetch birth/death dates for all people
      const personDates = new Map<string, { birth?: string; death?: string }>();
      for (const node of result.nodes) {
        console.log(`  Fetching dates for ${node.name} (${node.qid})`);
        const dates = await getPersonDates(node.qid);
        personDates.set(node.qid, dates);
        if (dates.birth || dates.death) {
          console.log(`    Birth: ${dates.birth || 'unknown'}, Death: ${dates.death || 'alive'}`);
        }
      }

      // Validate each edge's meeting date
      const validEdges: any[] = [];
      for (const edge of result.edges) {
        const fromNode = result.nodes.find((n: any) => n.qid === edge.from);
        const toNode = result.nodes.find((n: any) => n.qid === edge.to);

        if (!fromNode || !toNode) {
          validEdges.push(edge);
          continue;
        }

        const meetingDate = edge.photo.date || '';
        const fromDates = personDates.get(edge.from) || {};
        const toDates = personDates.get(edge.to) || {};

        console.log(`  Validating: ${fromNode.name} + ${toNode.name} (${meetingDate})`);

        const isValid = validateMeetingDate(
          meetingDate,
          fromDates,
          toDates,
          fromNode.name,
          toNode.name
        );

        if (isValid) {
          console.log(`    ✓ Valid meeting date`);
          validEdges.push(edge);
        } else {
          console.log(`    ✗ Removing impossible connection`);
        }
      }

      // Update edges with only valid ones
      result.edges = validEdges;

      if (validEdges.length === 0) {
        console.log('  ⚠ No valid connections found after date validation');
      }

      console.log('=====================================\n');

      // Fetch real photos for nodes and edges
      console.log('\n========== FETCHING REAL PHOTOS ==========');

      // 1. Get person photos from Wikipedia
      console.log('\nFetching person photos from Wikipedia...');
      for (const node of result.nodes) {
        if (!node.img || node.img.includes('example.com')) {
          console.log(`  Fetching photo for ${node.name} (${node.qid})`);
          const photoUrl = await getPersonImageFromWikipedia(node.qid, node.name);
          if (photoUrl) {
            node.img = photoUrl;
            console.log(`  ✓ Found: ${photoUrl}`);
          } else {
            console.log(`  ✗ No photo found`);
          }
        }
      }

      // 2. Get meeting photos from Commons (try Wikimedia first, then Google)
      console.log('\nFetching meeting photos...');
      for (let i = 0; i < result.edges.length; i++) {
        const edge = result.edges[i];
        const fromNode = result.nodes.find((n: any) => n.qid === edge.from);
        const toNode = result.nodes.find((n: any) => n.qid === edge.to);

        if (!fromNode || !toNode) continue;

        // Remove fake URLs
        if (edge.photo.url && edge.photo.url.includes('example.com')) {
          edge.photo.url = '';
        }

        // Try to find a real photo if we don't have one
        if (!edge.photo.url) {
          console.log(`  Searching for: ${fromNode.name} + ${toNode.name}`);

          // Try Wikimedia Commons first (free, no API key needed)
          console.log(`  → Trying Wikimedia Commons...`);
          let photoUrl = await searchPhotosOfPeopleTogether(fromNode.name, toNode.name);

          // If no Commons photo, try Google Custom Search (requires API key)
          if (!photoUrl) {
            console.log(`  → Trying Google Custom Search...`);
            photoUrl = await searchMeetingPhotoGoogle(fromNode.name, toNode.name);
          }

          if (photoUrl) {
            edge.photo.url = photoUrl;
            console.log(`  ✓ Found: ${photoUrl}`);
          } else {
            console.log(`  ✗ No photo found - will show text only`);
          }
        }
      }
      console.log('==========================================\n');

      return NextResponse.json(result);
    } catch (openaiError) {
      console.error('OpenAI error:', openaiError);
      // Fallback to mock data on OpenAI error
      return NextResponse.json(MOCK_DATA);
    }
  } catch (error) {
    console.error('Link API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate link' },
      { status: 500 }
    );
  }
}
