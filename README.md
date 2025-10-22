# CelebLink

A modern web application that discovers connections between any two celebrities through verified photos and public appearances.

## Features

- **Photo Autocomplete**: Search for celebrities with real-time photo suggestions from Wikidata
- **AI-Powered Connections**: Uses OpenAI to find the shortest path between celebrities via shared photos
- **Visual Timeline**: Animated stick-figure handshake timeline showing the connection path
- **Evidence Cards**: Display photos, captions, dates, locations, and licensing information
- **Accessibility**: Full keyboard navigation and reduced-motion support
- **Mock Mode**: Works out-of-the-box without API keys using sample data

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **OpenAI API** for intelligent path finding
- **Wikidata & Wikimedia Commons** for celebrity data and photos
- **Web Animations API** for smooth, performant animations

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- Optional: OpenAI API key (app works without it using mock data)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CelebLink
```

2. Install dependencies:
```bash
pnpm install
```

3. (Optional) Create a `.env.local` file and add your OpenAI API key:
```bash
OPENAI_API_KEY=sk-...
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## How It Works

### Autocomplete Flow

1. User types a celebrity name (e.g., "Tom Cruise")
2. `/api/autocomplete` endpoint queries Wikidata's search API
3. Results are enriched with profile photos via SPARQL queries
4. Photos are converted to 96px thumbnails using Wikimedia's thumbnail service
5. Results are cached for 60 seconds to reduce API calls
6. Dropdown shows photos, names, and descriptions with keyboard navigation

### Link Generation Flow

1. User selects two celebrities and clicks "Find Link"
2. `/api/link` endpoint receives both celebrity objects
3. If `OPENAI_API_KEY` exists:
   - Sends structured prompt to OpenAI (gpt-4o-mini)
   - Requests strict JSON response with nodes and edges
   - Each edge must include a photo URL showing BOTH celebrities
   - Extracts JSON safely, handling potential prose in response
4. If no API key or on error:
   - Returns mock data (Tom Cruise → Anil Kapoor → Shah Rukh Khan → Vijay)
5. Frontend displays:
   - Path viewer with celebrity portraits and evidence cards
   - Animated timeline with stick figures and handshake sequences

### Animation System

The `HandshakeTimeline` component uses the Web Animations API for smooth, performant animations:

1. **Initial State**: Only the first person is visible
2. **For Each Connection**:
   - New person walks in from the right
   - Both people extend arms for handshake
   - Evidence card fades in between them
   - Arms return to neutral position
3. **Finale**: First and last person zoom in; first person places hand on last's shoulder
4. **Reduced Motion**: When `prefers-reduced-motion` is detected, animations become simple fades

Stick figure colors:
- Male: `#3b82f6` (blue)
- Female: `#ec4899` (pink)
- Unknown: `#9aa4bd` (muted gray)

## Project Structure

```
celeblink/
├── app/
│   ├── api/
│   │   ├── autocomplete/route.ts  # Wikidata search endpoint
│   │   └── link/route.ts           # OpenAI connection finder
│   ├── globals.css                 # Dark theme styles
│   ├── layout.tsx                  # Root layout with metadata
│   └── page.tsx                    # Main page with search & results
├── components/
│   ├── SearchCombo.tsx             # Photo autocomplete input
│   ├── EvidenceCard.tsx            # Photo evidence display
│   ├── PathViewer.tsx              # Connection path renderer
│   └── HandshakeTimeline.tsx       # SVG animation timeline
├── lib/
│   ├── wikidata.ts                 # Wikidata API helpers
│   ├── openaiPrompt.ts             # OpenAI system/user prompts
│   └── json.ts                     # Safe JSON extraction utility
└── public/
    └── favicon.ico
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | OpenAI API key for real celebrity connections. Without it, app uses mock data. |

## Design System

The app uses a Claude-inspired dark theme:

| Variable | Color | Usage |
|----------|-------|-------|
| `--bg` | `#0b0f19` | Page background |
| `--surface` | `#0f1424` | Cards, inputs |
| `--border` | `#1f2a44` | Borders, dividers |
| `--text` | `#e6e6f0` | Primary text |
| `--muted` | `#9aa4bd` | Secondary text |
| `--accent` | `#8b5cf6` | Buttons, focus rings |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add `OPENAI_API_KEY` environment variable (optional)
4. Deploy

The app is optimized for Vercel's Edge Runtime and automatically uses Next.js 15's App Router features.

### Other Platforms

The app can be deployed to any platform that supports Next.js:

```bash
pnpm build
pnpm start
```

## Extending the App

### Adding More Data Sources

You can extend `/api/autocomplete` to include additional celebrity databases:

```typescript
// In lib/wikidata.ts
export async function searchMultipleSources(query: string) {
  const [wikidataResults, imdbResults] = await Promise.all([
    searchWikidata(query),
    searchIMDB(query), // Your custom function
  ]);
  return [...wikidataResults, ...imdbResults];
}
```

### Custom Animation Sequences

Modify `HandshakeTimeline.tsx` to add new animation behaviors:

```typescript
// Add a custom celebration at the end
const playCelebration = async () => {
  // Confetti, sparkles, etc.
};
```

### Enhanced Evidence

Extend `EvidenceCard.tsx` to show more metadata:

```typescript
interface EnhancedPhoto extends EdgePhoto {
  photographer?: string;
  event?: string;
  tags?: string[];
}
```

## Performance

- **Caching**: Wikidata results cached for 60s
- **Debouncing**: Autocomplete debounced to 180ms
- **Lazy Loading**: Images loaded on-demand
- **Timeouts**: All external API calls have 8s timeouts
- **Optimized Rendering**: React components optimized for minimal re-renders

## Accessibility

- Full keyboard navigation (↑/↓/Enter/Escape)
- ARIA labels and roles on all interactive elements
- `prefers-reduced-motion` support
- Focus visible indicators
- Semantic HTML throughout

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Modern mobile browsers

## Contributing

Contributions are welcome! Please ensure:

1. TypeScript types are properly defined
2. Components follow the existing dark theme
3. Accessibility features are maintained
4. Code is formatted with Prettier

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Credits

- Celebrity data from [Wikidata](https://www.wikidata.org/)
- Photos from [Wikimedia Commons](https://commons.wikimedia.org/)
- AI connections powered by [OpenAI](https://openai.com/)
- Built with [Next.js](https://nextjs.org/)

## Support

For issues or questions, please open a GitHub issue or refer to the Next.js and OpenAI documentation.
