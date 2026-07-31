import type { Match, PlayerScore, Player } from '@/types';
import { getScriptById } from '@/data/scripts';
import { loadPrediction } from '@/utils/storage';
import { getTeamBadgeUrl } from '@/data/teams';
import { getPlayerTitle } from '@/utils/titles';

// ─── Generate share card via Canvas API ──────────────────────
// Returns a data URL (PNG) of an equitably spaced, viral VIP Oracle Match Pass
// Dynamically styled for the specific match, teams, sublabel, narrative, and user title.

const loadFlagImage = (url: string) => new Promise<HTMLImageElement | null>((resolve) => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => resolve(img);
  img.onerror = () => resolve(null);
  img.src = url;
});

export async function generateShareCard(
  match: Match,
  score: PlayerScore,
  player: Player
): Promise<string> {
  const canvas = document.createElement('canvas');
  // High Resolution 9:16 aspect ratio (720 x 1280)
  const W = 720;
  const H = 1280;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const prediction = loadPrediction(match.id, player.id);
  const script = prediction ? getScriptById(prediction.scriptId) : null;
  const isResolved = match.status === 'resolved';
  const familyColor = script?.familyColor ?? '#F5D061';

  const badgeUrlA = getTeamBadgeUrl(match.teamA) || (match.teamA.flagCode ? `https://flagcdn.com/w160/${match.teamA.flagCode}.png` : null);
  const badgeUrlB = getTeamBadgeUrl(match.teamB) || (match.teamB.flagCode ? `https://flagcdn.com/w160/${match.teamB.flagCode}.png` : null);

  let flagAImg: HTMLImageElement | null = null;
  let flagBImg: HTMLImageElement | null = null;
  if (badgeUrlA) flagAImg = await loadFlagImage(badgeUrlA);
  if (badgeUrlB) flagBImg = await loadFlagImage(badgeUrlB);

  // ─── 1. Deep Atmospheric Background ─────────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#020306');
  bgGrad.addColorStop(0.3, '#090B16');
  bgGrad.addColorStop(0.7, '#060710');
  bgGrad.addColorStop(1, '#020305');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ─── 2. Ambient Script Family Spotlight Glow ─────────────
  const radialGlow = ctx.createRadialGradient(W / 2, H * 0.5, 60, W / 2, H * 0.5, 480);
  radialGlow.addColorStop(0, `${familyColor}28`);
  radialGlow.addColorStop(0.4, `${familyColor}08`);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, W, H);

  // ─── 3. Tactical Pitch Grid & Field Lines ───────────────
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1.5;
  for (let i = -5; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + i * 45, 0);
    ctx.lineTo(W / 2 + i * 150, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 80) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.015 + (y / H) * 0.02})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Tactical Center Circle Marking
  ctx.strokeStyle = 'rgba(245, 208, 97, 0.035)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.5, 180, 0, 2 * Math.PI);
  ctx.stroke();

  // ─── 4. Metallic Foil Outer Collector Frame ──────────────
  const p = 24; // Margin padding
  const frameW = W - p * 2;
  const frameH = H - p * 2;

  const goldFoil = ctx.createLinearGradient(p, p, W - p, H - p);
  goldFoil.addColorStop(0, '#FFF6D6');
  goldFoil.addColorStop(0.25, '#F5D061');
  goldFoil.addColorStop(0.5, '#C99E2E');
  goldFoil.addColorStop(0.75, '#F5D061');
  goldFoil.addColorStop(1, '#8C6B23');

  ctx.strokeStyle = goldFoil;
  ctx.lineWidth = 4;
  ctx.strokeRect(p, p, frameW, frameH);

  // Inner subtle corner frame stroke
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(p + 10, p + 10, frameW - 20, frameH - 20);

  // ─── SECTION 1: TOP BRAND HEADER (Y: 40 - 110) ───────────
  const matchLeagueHeader = match.sublabel ? match.sublabel.toUpperCase() : 'PREMIER LEAGUE 2026/27';

  ctx.fillStyle = '#F5D061';
  ctx.font = '800 12px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.fillText(`OFFICIAL MATCH PASS · ${matchLeagueHeader}`, W / 2, p + 36);

  const titleGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  titleGrad.addColorStop(0, '#FFFFFF');
  titleGrad.addColorStop(0.5, '#F5D061');
  titleGrad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = titleGrad;
  ctx.font = '900 32px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '-0.5px';
  ctx.fillText('GUESS THE SCRIPT', W / 2, p + 74);

  // ─── SECTION 2: MATCH TICKET STUB CARD (Y: 125 - 315) ──────
  const ticketY = p + 100;
  const ticketW = frameW - 40;
  const ticketH = 190;

  // Ticket Container Box
  ctx.fillStyle = 'rgba(18, 20, 34, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(W / 2 - ticketW / 2, ticketY, ticketW, ticketH, 18);
  ctx.fill();
  ctx.stroke();

  // Match Stage & Venue Meta
  ctx.fillStyle = '#F5D061';
  ctx.font = '800 13px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText(match.label.toUpperCase(), W / 2, ticketY + 30);

  ctx.fillStyle = '#9DA3BC';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(`${match.venue.toUpperCase()} (${match.city.toUpperCase()})`, W / 2, ticketY + 48);

  // Perforated Ticket Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(W / 2 - ticketW / 2 + 20, ticketY + 64);
  ctx.lineTo(W / 2 + ticketW / 2 - 20, ticketY + 64);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Draw Teams & Flags Row
  const teamRowY = ticketY + 128;

  // Team A (Left)
  if (flagAImg) {
    drawCircularFlag(ctx, flagAImg, W / 2 - 195, teamRowY - 12, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(match.teamA.shortCode, W / 2 - 130, teamRowY + 10);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${match.teamA.flagEmoji} ${match.teamA.shortCode}`, W / 2 - 195, teamRowY + 10);
  }

  // Score or VS Display
  if (isResolved && match.resolution) {
    ctx.fillStyle = '#F5D061';
    ctx.font = '800 34px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${match.resolution.details.teamAGoals} - ${match.resolution.details.teamBGoals}`, W / 2, teamRowY + 10);
  } else {
    ctx.fillStyle = '#5C627A';
    ctx.font = '800 18px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText('VS', W / 2, teamRowY + 8);
  }

  // Team B (Right)
  if (flagBImg) {
    drawCircularFlag(ctx, flagBImg, W / 2 + 195, teamRowY - 12, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(match.teamB.shortCode, W / 2 + 130, teamRowY + 10);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${match.teamB.shortCode} ${match.teamB.flagEmoji}`, W / 2 + 195, teamRowY + 10);
  }

  // ─── SECTION 3: SCRIPT NARRATIVE CARD (Y: 410 - 610) ──────
  const scriptY = 410; // Generous 86px gap below ticket stub box!

  ctx.fillStyle = familyColor;
  ctx.font = '800 12px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.fillText('NARRATIVE DRAFTED BY ME', W / 2, scriptY);

  if (script) {
    // Glowing Script Title
    ctx.shadowColor = familyColor;
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '-0.5px';
    ctx.fillText(`"${script.label.toUpperCase()}"`, W / 2, scriptY + 42);
    ctx.shadowBlur = 0;

    // Family classification pill badge
    const familyBadgeW = 160;
    const familyBadgeH = 26;
    ctx.fillStyle = `${familyColor}22`;
    ctx.strokeStyle = familyColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(W / 2 - familyBadgeW / 2, scriptY + 58, familyBadgeW, familyBadgeH, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = familyColor;
    ctx.font = '800 11px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(script.familyLabel.toUpperCase(), W / 2, scriptY + 75);

    // Script description box
    const descY = scriptY + 105;
    const maxTextWidth = 500;
    const words = script.description.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxTextWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    const lineHeight = 24;
    const descBoxH = Math.max(80, lines.length * lineHeight + 30);

    ctx.fillStyle = 'rgba(22, 25, 41, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 270, descY, 540, descBoxH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9DA3BC';
    ctx.textAlign = 'center';
    const startY = descY + (descBoxH / 2) - ((lines.length - 1) * lineHeight) / 2 + 5;
    lines.forEach((line, index) => {
      ctx.fillText(line, W / 2, startY + index * lineHeight);
    });
  }

  // ─── SECTION 4: SCORE / VAULT STATUS EMBLEM (Y: 735 - 915) ─
  const emblemY = 735; // 130px gap below description box!

  if (isResolved) {
    // Score Emblem Ring
    ctx.fillStyle = 'rgba(14, 16, 26, 0.95)';
    ctx.strokeStyle = goldFoil;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W / 2, emblemY + 55, 76, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Score text
    ctx.fillStyle = '#F5D061';
    ctx.font = '900 70px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '-2px';
    ctx.textAlign = 'center';
    ctx.fillText(String(score.totalMatchScore), W / 2, emblemY + 80);

    ctx.fillStyle = '#9DA3BC';
    ctx.font = '800 12px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('MATCH POINTS EARNED', W / 2, emblemY + 160);
  } else {
    // Locked Vault Emblem
    ctx.fillStyle = 'rgba(14, 16, 26, 0.95)';
    ctx.strokeStyle = 'rgba(245, 208, 97, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, emblemY + 55, 68, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F5D061';
    ctx.font = '800 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📜', W / 2, emblemY + 74);

    ctx.fillStyle = '#F5D061';
    ctx.font = '800 13px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('SCRIPT VAULT LOCKED', W / 2, emblemY + 155);
  }

  // ─── SECTION 5: PLAYER HANDLE & DYNAMIC TITLE (Y: 965 - 1055) ───
  const playerY = 965;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 26px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.textAlign = 'center';
  ctx.fillText(player.name.toUpperCase(), W / 2, playerY);

  // Dynamic User Title Pill Tag
  const userTitle = getPlayerTitle(player.tournamentScore);
  ctx.font = '800 11px "Space Grotesk", sans-serif';
  const titleWidth = ctx.measureText(userTitle).width + 24;
  ctx.fillStyle = 'rgba(245, 208, 97, 0.15)';
  ctx.strokeStyle = '#F5D061';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(W / 2 - titleWidth / 2, playerY + 10, titleWidth, 22, 11);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#F5D061';
  ctx.letterSpacing = '1px';
  ctx.fillText(userTitle, W / 2, playerY + 25);

  const challengerCall = isResolved
    ? (score.totalMatchScore >= 160
      ? 'I MASTERED THE SCRIPT. CAN YOU DO BETTER?'
      : 'FOOTBALL WRITES DRAMA. PLAY THE ORACLE.')
    : `I CALLED THE ${match.teamA.shortCode} vs ${match.teamB.shortCode} NARRATIVE. CAN YOU READ FOOTBALL?`;

  ctx.fillStyle = '#9DA3BC';
  ctx.font = '800 12px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillText(challengerCall, W / 2, playerY + 54);

  // ─── SECTION 6: VIRAL CTA FOOTER BANNER (Y: 1125 - 1205) ──
  const footerY = 1125;
  const footerW = frameW - 40;
  const footerH = 80;

  // CTA Container Box
  ctx.fillStyle = 'rgba(22, 25, 41, 0.95)';
  ctx.strokeStyle = 'rgba(245, 208, 97, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(W / 2 - footerW / 2, footerY, footerW, footerH, 16);
  ctx.fill();
  ctx.stroke();

  const ctaHeader = `PREDICT THE ${match.teamA.name.toUpperCase()} VS ${match.teamB.name.toUpperCase()} NARRATIVE`;

  // CTA Text & URL
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 14px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.textAlign = 'center';
  ctx.fillText(ctaHeader, W / 2, footerY + 32);

  ctx.fillStyle = '#F5D061';
  ctx.font = '800 14px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('PLAY NOW AT GUESS THE SCRIPT', W / 2, footerY + 56);

  return canvas.toDataURL('image/png', 0.95);
}

// Helper to render high quality circular flags in Canvas
function drawCircularFlag(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  size: number
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);

  ctx.restore();

  // Outer border ring for flag
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2, true);
  ctx.stroke();
}

// ─── Trigger native share or download ────────────────────────
export async function shareCard(
  dataUrl: string,
  fileName: string = 'guess-the-script-pass.png',
  matchInfo?: { teamA: string; teamB: string; label?: string }
): Promise<'shared' | 'downloaded'> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], fileName, { type: 'image/png' });

  const shareTitle = matchInfo ? `Guess the Script — ${matchInfo.teamA} vs ${matchInfo.teamB}` : 'Guess the Script — Premier League 2026/27';
  const shareText = matchInfo
    ? `I called the ${matchInfo.teamA} vs ${matchInfo.teamB} match narrative! Think you can read football better?`
    : 'I called the match narrative before kickoff. Think you can read football better?';

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: shareTitle,
      text: shareText,
    });
    return 'shared';
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return 'downloaded';
}
