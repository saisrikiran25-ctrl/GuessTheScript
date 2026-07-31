import type { Team } from '@/types';

// ─── Team Crest Registry ──────────────────────────────────────
// Maps team IDs to official crest URLs (high-res, transparent PNGs/SVGs).
// Expandable for all future Premier League and European teams.

export const TEAM_BADGES: Record<string, string> = {
  // Premier League & English Clubs
  ars: 'https://crests.football-data.org/57.png',     // Arsenal
  cov: 'https://upload.wikimedia.org/wikipedia/en/9/94/Coventry_City_FC.svg', // Coventry City
  hul: 'https://upload.wikimedia.org/wikipedia/en/5/54/Hull_City_A.F.C._logo.svg', // Hull City
  mun: 'https://crests.football-data.org/66.png',     // Manchester United
  eve: 'https://crests.football-data.org/62.png',     // Everton
  cry: 'https://crests.football-data.org/354.png',    // Crystal Palace
  ips: 'https://upload.wikimedia.org/wikipedia/en/4/43/Ipswich_Town.svg', // Ipswich Town
  sun: 'https://upload.wikimedia.org/wikipedia/en/7/77/Sunderland_AFClogo.svg', // Sunderland
  nfo: 'https://crests.football-data.org/351.png',    // Nottingham Forest
  lee: 'https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg', // Leeds United
  bre: 'https://crests.football-data.org/402.png',    // Brentford
  spu: 'https://crests.football-data.org/73.png',     // Tottenham Hotspur
  bha: 'https://crests.football-data.org/397.png',    // Brighton & Hove Albion
  avl: 'https://crests.football-data.org/58.png',     // Aston Villa
  mci: 'https://crests.football-data.org/65.png',     // Manchester City
  bou: 'https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg', // Bournemouth
  new: 'https://crests.football-data.org/67.png',     // Newcastle United
  liv: 'https://crests.football-data.org/64.png',     // Liverpool
  ful: 'https://crests.football-data.org/63.png',     // Fulham
  che: 'https://crests.football-data.org/61.png',     // Chelsea
  whu: 'https://crests.football-data.org/563.png',    // West Ham United
  wol: 'https://crests.football-data.org/76.png',     // Wolverhampton Wanderers
  lei: 'https://crests.football-data.org/338.png',    // Leicester City
  sou: 'https://crests.football-data.org/340.png',    // Southampton

  // European & Global Teams (Future Expansion Ready)
  rmd: 'https://crests.football-data.org/86.png',     // Real Madrid
  bar: 'https://crests.football-data.org/81.png',     // FC Barcelona
  bay: 'https://crests.football-data.org/5.png',      // Bayern Munich
  psg: 'https://crests.football-data.org/524.png',    // Paris Saint-Germain
  juv: 'https://crests.football-data.org/109.png',    // Juventus
  int: 'https://crests.football-data.org/108.png',    // Inter Milan
  acm: 'https://crests.football-data.org/98.png',     // AC Milan
};

/**
 * Gets the official crest URL for a given team object or ID.
 */
export function getTeamBadgeUrl(team: Team | string): string | undefined {
  if (typeof team === 'string') {
    return TEAM_BADGES[team.toLowerCase()];
  }
  if (team.badgeUrl) return team.badgeUrl;
  return TEAM_BADGES[team.id.toLowerCase()];
}
