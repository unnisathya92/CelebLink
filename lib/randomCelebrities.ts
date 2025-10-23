// Popular celebrities across different domains for random connections
export interface RandomCelebrity {
  qid: string;
  name: string;
  description: string;
}

export const RANDOM_CELEBRITIES: RandomCelebrity[] = [
  // Hollywood
  { qid: 'Q37079', name: 'Tom Cruise', description: 'American actor and producer' },
  { qid: 'Q38111', name: 'Leonardo DiCaprio', description: 'American actor and film producer' },
  { qid: 'Q1924847', name: 'Margot Robbie', description: 'Australian actress and producer' },
  { qid: 'Q34086', name: 'Robert Downey Jr.', description: 'American actor' },
  { qid: 'Q2263', name: 'Tom Hanks', description: 'American actor and filmmaker' },
  { qid: 'Q40531', name: 'Brad Pitt', description: 'American actor and film producer' },
  { qid: 'Q189490', name: 'Angelina Jolie', description: 'American actress and filmmaker' },
  { qid: 'Q19020', name: 'Denzel Washington', description: 'American actor and filmmaker' },
  { qid: 'Q37153', name: 'Meryl Streep', description: 'American actress' },
  { qid: 'Q134333', name: 'Chris Hemsworth', description: 'Australian actor' },

  // Bollywood
  { qid: 'Q9570', name: 'Amitabh Bachchan', description: 'Indian actor' },
  { qid: 'Q9465', name: 'Shah Rukh Khan', description: 'Indian actor and film producer' },
  { qid: 'Q9544', name: 'Aishwarya Rai', description: 'Indian actress' },
  { qid: 'Q528496', name: 'Vijay', description: 'Indian actor' },
  { qid: 'Q7544', name: 'Salman Khan', description: 'Indian actor and film producer' },
  { qid: 'Q9760', name: 'Priyanka Chopra', description: 'Indian actress and singer' },

  // Musicians
  { qid: 'Q15869', name: 'Beyoncé', description: 'American singer and actress' },
  { qid: 'Q5608', name: 'Taylor Swift', description: 'American singer-songwriter' },
  { qid: 'Q2831', name: 'Michael Jackson', description: 'American singer and entertainer' },
  { qid: 'Q1299', name: 'The Beatles', description: 'English rock band' },
  { qid: 'Q1347', name: 'Bob Dylan', description: 'American singer-songwriter' },

  // Politicians
  { qid: 'Q76', name: 'Barack Obama', description: '44th President of the United States' },
  { qid: 'Q6294', name: 'Donald Trump', description: '45th President of the United States' },
  { qid: 'Q1047', name: 'Nelson Mandela', description: 'South African anti-apartheid revolutionary' },
  { qid: 'Q1058', name: 'Narendra Modi', description: 'Prime Minister of India' },
  { qid: 'Q6279', name: 'Joe Biden', description: '46th President of the United States' },

  // Historical Figures
  { qid: 'Q937', name: 'Albert Einstein', description: 'German-born theoretical physicist' },
  { qid: 'Q7251', name: 'Mahatma Gandhi', description: 'Indian independence activist' },
  { qid: 'Q1001', name: 'Jawaharlal Nehru', description: 'First Prime Minister of India' },
  { qid: 'Q8007', name: 'Charlie Chaplin', description: 'British comic actor and filmmaker' },

  // Sports
  { qid: 'Q10520', name: 'Cristiano Ronaldo', description: 'Portuguese footballer' },
  { qid: 'Q615', name: 'Lionel Messi', description: 'Argentine footballer' },
  { qid: 'Q3041', name: 'Michael Jordan', description: 'American basketball player' },
  { qid: 'Q5879', name: 'Serena Williams', description: 'American tennis player' },
  { qid: 'Q9036', name: 'Sachin Tendulkar', description: 'Indian cricketer' },

  // Directors
  { qid: 'Q8877', name: 'Steven Spielberg', description: 'American filmmaker' },
  { qid: 'Q312623', name: 'Christopher Nolan', description: 'British-American filmmaker' },
  { qid: 'Q3772', name: 'Martin Scorsese', description: 'American filmmaker' },
  { qid: 'Q56094', name: 'Quentin Tarantino', description: 'American filmmaker' },

  // Tech/Business
  { qid: 'Q4416090', name: 'Elon Musk', description: 'Business magnate and investor' },
  { qid: 'Q5284', name: 'Bill Gates', description: 'American business magnate' },
  { qid: 'Q37191', name: 'Mark Zuckerberg', description: 'American technology entrepreneur' },
  { qid: 'Q312556', name: 'Raghuram Rajan', description: 'Indian economist' },
];

// Get random pair of celebrities
export function getRandomPair(): [RandomCelebrity, RandomCelebrity] {
  const shuffled = [...RANDOM_CELEBRITIES].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

// Get random celebrity
export function getRandomCelebrity(): RandomCelebrity {
  return RANDOM_CELEBRITIES[Math.floor(Math.random() * RANDOM_CELEBRITIES.length)];
}
