#!/usr/bin/env node

/**
 * Marketing Content Generator for CelebLink
 *
 * Generates:
 * - Tweet variations for Twitter/X
 * - Reddit post variations
 * - Interesting random celebrity connections
 *
 * USAGE: node scripts/generateMarketingContent.js
 */

const RANDOM_CELEBRITIES = [
  // Hollywood
  'Tom Cruise', 'Leonardo DiCaprio', 'Margot Robbie', 'Robert Downey Jr.',
  'Tom Hanks', 'Brad Pitt', 'Angelina Jolie', 'Denzel Washington', 'Meryl Streep',

  // Bollywood
  'Amitabh Bachchan', 'Shah Rukh Khan', 'Aishwarya Rai', 'Vijay', 'Salman Khan',

  // Musicians
  'Beyoncé', 'Taylor Swift', 'Michael Jackson', 'The Beatles',

  // Politicians
  'Barack Obama', 'Donald Trump', 'Nelson Mandela', 'Narendra Modi',

  // Historical
  'Albert Einstein', 'Mahatma Gandhi', 'Jawaharlal Nehru', 'Charlie Chaplin',

  // Sports
  'Cristiano Ronaldo', 'Lionel Messi', 'Michael Jordan', 'Sachin Tendulkar',

  // Directors
  'Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese',

  // Tech
  'Elon Musk', 'Bill Gates', 'Mark Zuckerberg',
];

function getRandomCelebrity() {
  return RANDOM_CELEBRITIES[Math.floor(Math.random() * RANDOM_CELEBRITIES.length)];
}

function getRandomPair() {
  const celeb1 = getRandomCelebrity();
  let celeb2 = getRandomCelebrity();
  while (celeb2 === celeb1) {
    celeb2 = getRandomCelebrity();
  }
  return [celeb1, celeb2];
}

function generateTweets(count = 10) {
  console.log('\n🐦 TWITTER CONTENT\n');
  console.log('Copy-paste these tweets and post manually:\n');
  console.log('='.repeat(80));

  const tweetTemplates = [
    (c1, c2) => `Can you connect ${c1} to ${c2}? 🎬🧠\n\nI built CelebLink - finds the shortest path between ANY two celebrities through verified photos.\n\nTry it: celebslinks.com\n\n#CelebrityTrivia #SixDegrees`,

    (c1, c2) => `Mind blown 🤯\n\n${c1} connects to ${c2} in just a few hops!\n\nDiscover surprising celebrity connections: celebslinks.com\n\n#Entertainment #DidYouKnow`,

    (c1, c2) => `Challenge: Find a connection between ${c1} and ${c2}\n\n✨ Use CelebLink: celebslinks.com\n\nPost your answer below! 👇`,

    (c1, c2) => `From ${c1} to ${c2}... how?\n\nCelebLink traces the path through movies, events, and relationships.\n\nTry it yourself: celebslinks.com`,

    (c1, c2) => `${c1} 🤝 ${c2}\n\nThey're connected! But how many degrees of separation?\n\nFind out: celebslinks.com\n\n#CelebrityConnections`,
  ];

  for (let i = 0; i < count; i++) {
    const [c1, c2] = getRandomPair();
    const template = tweetTemplates[i % tweetTemplates.length];
    console.log(`\nTweet ${i + 1}:`);
    console.log('-'.repeat(80));
    console.log(template(c1, c2));
    console.log('-'.repeat(80));
  }
}

function generateRedditPosts(count = 5) {
  console.log('\n\n📱 REDDIT CONTENT\n');
  console.log('Post these in r/InternetIsBeautiful, r/movies, etc:\n');
  console.log('='.repeat(80));

  const redditTemplates = [
    (c1, c2) => ({
      title: `I built a tool that finds the shortest connection between any two celebrities through verified photos`,
      body: `Ever played Six Degrees of Kevin Bacon? I built an AI-powered version that works with ANY celebrity!

**How it works:**
• Enter any two celebrities (e.g., ${c1} and ${c2})
• My tool searches Wikipedia, Wikidata, and public photo databases
• Get verified connections with actual photos from events, movies, collaborations
• Share your discoveries

**Try it:** celebslinks.com

Some fun discoveries:
• Most Hollywood actors connect in 2-3 hops through major movies
• Bollywood to Hollywood usually takes 3-4 hops
• Historical figures need generational bridges

Challenge: Find the weirdest connection!`
    }),

    (c1, c2) => ({
      title: `${c1} is connected to ${c2} - here's how [OC]`,
      body: `I built CelebLink to trace celebrity connections through documented photographs and events.

Just tested: ${c1} → ${c2}

The tool found a verifiable path through movies, award shows, and public events!

**Features:**
✓ Searches Wikimedia Commons for actual photos
✓ Validates that meetings were chronologically possible
✓ Prioritizes movies/relationships over random encounters
✓ Beautiful sharing on social media

Try your own: celebslinks.com

What celebrity pair should I try next?`
    }),

    (c1, c2) => ({
      title: `Six Degrees of Separation: ${c1} edition`,
      body: `Made a web app that plays Six Degrees but with PROOF - actual photographs!

Test case: ${c1} connects to ${c2}

Unlike Wikipedia rabbit holes, this uses AI to find the SHORTEST verified path through:
- Movie collaborations
- Award ceremonies
- Public events
- Personal relationships

Link: celebslinks.com

Try connecting your favorite celebrity to Albert Einstein! Results might surprise you.`
    }),
  ];

  for (let i = 0; i < count; i++) {
    const [c1, c2] = getRandomPair();
    const template = redditTemplates[i % redditTemplates.length];
    const post = template(c1, c2);

    console.log(`\nReddit Post ${i + 1}:`);
    console.log('-'.repeat(80));
    console.log(`TITLE: ${post.title}`);
    console.log(`\nBODY:\n${post.body}`);
    console.log('-'.repeat(80));
  }
}

function generateInterestingConnections(count = 20) {
  console.log('\n\n✨ INTERESTING CONNECTION IDEAS\n');
  console.log('Try these connections on your site and share the results:\n');
  console.log('='.repeat(80));

  const interestingPairs = [
    ['Einstein', 'Modern Celebrity'],
    ['Bollywood Star', 'Hollywood Star'],
    ['Politician', 'Actor'],
    ['Historical Figure', 'Modern Athlete'],
    ['Musician', 'Scientist'],
  ];

  for (let i = 0; i < count; i++) {
    const [c1, c2] = getRandomPair();
    const pairType = interestingPairs[i % interestingPairs.length];

    console.log(`${i + 1}. ${c1} → ${c2}`);
    console.log(`   Type: ${pairType[0]} to ${pairType[1]}`);
    console.log(`   URL: https://celebslinks.com/connection/${c1.toLowerCase().replace(/\s+/g, '-')}/${c2.toLowerCase().replace(/\s+/g, '-')}`);
    console.log('');
  }

  console.log('\n💡 Pro Tip: Share these on Twitter/Reddit with screenshots!\n');
}

function generateProductHuntComments() {
  console.log('\n\n🚀 PRODUCT HUNT ENGAGEMENT\n');
  console.log('Comments to post when people ask questions on Product Hunt:\n');
  console.log('='.repeat(80));

  const comments = [
    {
      question: "How does the verification work?",
      answer: `Great question! We use 3-layer validation:\n\n1. QID verification - ensures we have the right Wikidata entry\n2. Photo URL validation - both names must appear in the photo URL\n3. Timeline validation - checks birth/death dates to prevent anachronistic connections\n\nThis prevents the AI from hallucinating connections!`
    },
    {
      question: "Can it connect people from different time periods?",
      answer: `Yes! The AI finds intermediaries who overlapped with both people. For example, Einstein → someone who knew Einstein and is still alive → modern celebrity.\n\nIt's actually one of the coolest features - bridging historical figures to today!`
    },
    {
      question: "What data sources do you use?",
      answer: `We use:\n• Wikidata for structured data about people\n• Wikimedia Commons for verified photos\n• Wikipedia for biographical info\n• Google Custom Search as fallback for meeting photos\n\nAll editorially verified sources!`
    },
  ];

  comments.forEach((c, i) => {
    console.log(`\nQ: "${c.question}"\n`);
    console.log(`A: ${c.answer}\n`);
    console.log('-'.repeat(80));
  });
}

// Main execution
function main() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║         CelebLink Marketing Content Generator                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');

  generateTweets(10);
  generateRedditPosts(5);
  generateInterestingConnections(20);
  generateProductHuntComments();

  console.log('\n\n✅ Content generation complete!');
  console.log('\n📋 Next Steps:');
  console.log('  1. Copy tweets above and post on Twitter/X');
  console.log('  2. Post Reddit content in relevant subreddits');
  console.log('  3. Try the interesting connections and screenshot results');
  console.log('  4. Share screenshots on social media\n');
}

if (require.main === module) {
  main();
}

module.exports = { generateTweets, generateRedditPosts, generateInterestingConnections };
