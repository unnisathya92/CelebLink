import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { system, user } from '@/lib/openaiPrompt';
import { extractJson } from '@/lib/json';
import type { Suggestion } from '@/lib/wikidata';

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

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user(from, to) },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const content = completion.choices[0]?.message?.content || '';

      // Try to extract JSON from response
      const result = extractJson(content);

      if (!result || !result.nodes || !result.edges) {
        console.error('Failed to parse OpenAI response, using mock data');
        return NextResponse.json(MOCK_DATA);
      }

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
