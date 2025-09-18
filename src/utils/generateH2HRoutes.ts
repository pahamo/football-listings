/**
 * Utility to generate all Premier League H2H route combinations
 * Used for sitemap generation and route validation
 */

import { generateCanonicalH2HSlug } from './headToHead';

// All 20 Premier League teams for 2024-25 season
export const PREMIER_LEAGUE_TEAMS = [
  'arsenal',
  'aston-villa',
  'bournemouth',
  'brentford',
  'brighton-hove-albion',
  'chelsea',
  'crystal-palace',
  'everton',
  'fulham',
  'ipswich-town',
  'leicester-city',
  'liverpool',
  'manchester-city',
  'manchester-united',
  'newcastle-united',
  'nottingham-forest',
  'southampton',
  'tottenham-hotspur',
  'west-ham-united',
  'wolverhampton-wanderers'
];

/**
 * Generate all possible H2H routes for Premier League teams
 * Creates 190 unique combinations (20 teams choose 2)
 */
export function generateAllPremierLeagueH2HRoutes(): string[] {
  const routes: string[] = [];

  for (let i = 0; i < PREMIER_LEAGUE_TEAMS.length; i++) {
    for (let j = i + 1; j < PREMIER_LEAGUE_TEAMS.length; j++) {
      const team1 = PREMIER_LEAGUE_TEAMS[i];
      const team2 = PREMIER_LEAGUE_TEAMS[j];

      // Use canonical slug generation (alphabetical order)
      const canonicalSlug = generateCanonicalH2HSlug(team1, team2);
      routes.push(`/h2h/${canonicalSlug}`);
    }
  }

  return routes;
}

/**
 * Generate all H2H slugs (without /h2h/ prefix)
 */
export function generateAllPremierLeagueH2HSlugs(): string[] {
  const slugs: string[] = [];

  for (let i = 0; i < PREMIER_LEAGUE_TEAMS.length; i++) {
    for (let j = i + 1; j < PREMIER_LEAGUE_TEAMS.length; j++) {
      const team1 = PREMIER_LEAGUE_TEAMS[i];
      const team2 = PREMIER_LEAGUE_TEAMS[j];

      const canonicalSlug = generateCanonicalH2HSlug(team1, team2);
      slugs.push(canonicalSlug);
    }
  }

  return slugs;
}

/**
 * Check if a team slug is a valid Premier League team
 */
export function isValidPremierLeagueTeam(teamSlug: string): boolean {
  return PREMIER_LEAGUE_TEAMS.includes(teamSlug);
}

/**
 * Validate that an H2H slug contains valid Premier League teams
 */
export function isValidPremierLeagueH2H(h2hSlug: string): boolean {
  const parts = h2hSlug.split('-vs-');
  if (parts.length !== 2) return false;

  const [team1, team2] = parts;
  return isValidPremierLeagueTeam(team1) && isValidPremierLeagueTeam(team2);
}

/**
 * Get total number of possible H2H combinations
 */
export function getTotalH2HCombinations(): number {
  // Formula: n choose 2 = n! / (2! * (n-2)!) = n * (n-1) / 2
  const n = PREMIER_LEAGUE_TEAMS.length;
  return (n * (n - 1)) / 2;
}

/**
 * Generate popular H2H matchups (Big 6 + popular clubs)
 */
export function getPopularH2HMatchups(): string[] {
  const bigSix = ['arsenal', 'chelsea', 'liverpool', 'manchester-city', 'manchester-united', 'tottenham-hotspur'];
  const popularClubs = ['aston-villa', 'newcastle-united', 'west-ham-united'];
  const allPopular = [...bigSix, ...popularClubs];

  const popularMatchups: string[] = [];

  for (let i = 0; i < allPopular.length; i++) {
    for (let j = i + 1; j < allPopular.length; j++) {
      const canonicalSlug = generateCanonicalH2HSlug(allPopular[i], allPopular[j]);
      popularMatchups.push(`/h2h/${canonicalSlug}`);
    }
  }

  return popularMatchups;
}

/**
 * Debug: Log statistics about H2H generation
 */
export function logH2HStats(): void {
  const totalRoutes = generateAllPremierLeagueH2HRoutes();
  const popularRoutes = getPopularH2HMatchups();

  console.log('H2H Route Generation Stats:');
  console.log(`- Premier League teams: ${PREMIER_LEAGUE_TEAMS.length}`);
  console.log(`- Total H2H combinations: ${getTotalH2HCombinations()}`);
  console.log(`- Generated routes: ${totalRoutes.length}`);
  console.log(`- Popular matchups: ${popularRoutes.length}`);

  console.log('\nFirst 10 H2H routes:');
  totalRoutes.slice(0, 10).forEach((route, i) => {
    console.log(`${i + 1}. ${route}`);
  });
}