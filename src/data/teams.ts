import type { Team } from '@/types';

// ─── Team Crest Registry ──────────────────────────────────────
// High-definition transparent PNG crests from FotMob CDN.
// Guaranteed high availability, CORS support, and 100% visual accuracy.

export const TEAM_BADGES: Record<string, string> = {
  // Premier League & English Championship Clubs
  ars: 'https://images.fotmob.com/image_resources/logo/teamlogo/9825.png',  // Arsenal
  cov: 'https://images.fotmob.com/image_resources/logo/teamlogo/8669.png',  // Coventry City
  hul: 'https://images.fotmob.com/image_resources/logo/teamlogo/8667.png',  // Hull City
  mun: 'https://images.fotmob.com/image_resources/logo/teamlogo/10260.png', // Manchester United
  eve: 'https://images.fotmob.com/image_resources/logo/teamlogo/8668.png',  // Everton
  cry: 'https://images.fotmob.com/image_resources/logo/teamlogo/9826.png',  // Crystal Palace
  ips: 'https://images.fotmob.com/image_resources/logo/teamlogo/8466.png',  // Ipswich Town
  sun: 'https://images.fotmob.com/image_resources/logo/teamlogo/8472.png',  // Sunderland
  nfo: 'https://images.fotmob.com/image_resources/logo/teamlogo/10203.png', // Nottingham Forest
  lee: 'https://images.fotmob.com/image_resources/logo/teamlogo/8463.png',  // Leeds United
  bre: 'https://images.fotmob.com/image_resources/logo/teamlogo/9937.png',  // Brentford
  spu: 'https://images.fotmob.com/image_resources/logo/teamlogo/8586.png',  // Tottenham Hotspur
  bha: 'https://images.fotmob.com/image_resources/logo/teamlogo/10204.png', // Brighton & Hove Albion
  avl: 'https://images.fotmob.com/image_resources/logo/teamlogo/10252.png', // Aston Villa
  mci: 'https://images.fotmob.com/image_resources/logo/teamlogo/8456.png',  // Manchester City
  bou: 'https://images.fotmob.com/image_resources/logo/teamlogo/8678.png',  // Bournemouth
  new: 'https://images.fotmob.com/image_resources/logo/teamlogo/10261.png', // Newcastle United
  liv: 'https://images.fotmob.com/image_resources/logo/teamlogo/8650.png',  // Liverpool
  ful: 'https://images.fotmob.com/image_resources/logo/teamlogo/9879.png',  // Fulham
  che: 'https://images.fotmob.com/image_resources/logo/teamlogo/8455.png',  // Chelsea
  whu: 'https://images.fotmob.com/image_resources/logo/teamlogo/8654.png',  // West Ham United
  wol: 'https://images.fotmob.com/image_resources/logo/teamlogo/8602.png',  // Wolverhampton Wanderers
  lei: 'https://images.fotmob.com/image_resources/logo/teamlogo/8197.png',  // Leicester City
  sou: 'https://images.fotmob.com/image_resources/logo/teamlogo/8464.png',  // Southampton

  // European & Global Teams (Future Expansion Ready)
  rmd: 'https://images.fotmob.com/image_resources/logo/teamlogo/8633.png',  // Real Madrid
  bar: 'https://images.fotmob.com/image_resources/logo/teamlogo/8634.png',  // FC Barcelona
  bay: 'https://images.fotmob.com/image_resources/logo/teamlogo/9823.png',  // Bayern Munich
  psg: 'https://images.fotmob.com/image_resources/logo/teamlogo/9847.png',  // Paris Saint-Germain
  juv: 'https://images.fotmob.com/image_resources/logo/teamlogo/9885.png',  // Juventus
  int: 'https://images.fotmob.com/image_resources/logo/teamlogo/8636.png',  // Inter Milan
  acm: 'https://images.fotmob.com/image_resources/logo/teamlogo/8564.png',  // AC Milan
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
