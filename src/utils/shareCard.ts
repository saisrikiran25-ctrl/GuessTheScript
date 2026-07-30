import type { Match, PlayerScore, Player } from '@/types';
import { getScriptById } from '@/data/scripts';
import { loadPrediction } from '@/utils/storage';

// ─── Generate share card via Canvas API ──────────────────────
// Returns a data URL (PNG) of a high-converting, viral VIP Oracle Match Pass

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
  // High Resolution 9:16 aspect ratio (720 x 1280 for sharp social sharing)
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

  let flagAImg: HTMLImageElement | null = null;
  let flagBImg: HTMLImageElement | null = null;
  if (match.teamA.flagCode) flagAImg = await loadFlagImage(`https://flagcdn.com/w160/${match.teamA.flagCode}.png`);
  if (match.teamB.flagCode) flagBImg = await loadFlagImage(`https://flagcdn.com/w160/${match.teamB.flagCode}.png`);

  // ─── 1. Deep Obsidian Atmosphere Background ─────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#020306');
  bgGrad.addColorStop(0.3, '#0B0D18');
  bgGrad.addColorStop(0.7, '#070810');
  bgGrad.addColorStop(1, '#020305');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ─── 2. Radiant Script Family Spotlight Glow ────────────
  const radialGlow = ctx.createRadialGradient(W / 2, H * 0.4, 40, W / 2, H * 0.4, 420);
  radialGlow.addColorStop(0, `${familyColor}25`);
  radialGlow.addColorStop(0.4, `${familyColor}08`);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, W, H);

  // ─── 3. Tactical Pitch Grid & Stadium Light Beams ────────
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 1.5;
  for (let i = -5; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + i * 40, 0);
    ctx.lineTo(W / 2 + i * 140, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 80) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.015 + (y / H) * 0.025})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Tactical Center Circle
  ctx.strokeStyle = 'rgba(245, 208, 97, 0.04)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.45, 160, 0, 2 * Math.PI);
  ctx.stroke();

  // ─── 4. Metallic Foil Outer Collector Frame ──────────────
  const p = 24; // Padding
  const frameW = W - p * 2;
  const frameH = H - p * 2;

  // Gold foil gradient border stroke
  const goldFoil = ctx.createLinearGradient(p, p, W - p, H - p);
  goldFoil.addColorStop(0, '#FFF6D6');
  goldFoil.addColorStop(0.25, '#F5D061');
  goldFoil.addColorStop(0.5, '#C99E2E');
  goldFoil.addColorStop(0.75, '#F5D061');
  goldFoil.addColorStop(1, '#8C6B23');

  ctx.strokeStyle = goldFoil;
  ctx.lineWidth = 4;
  ctx.strokeRect(p, p, frameW, frameH);

  // Inner subtle corner notches & inner stroke
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(p + 10, p + 10, frameW - 20, frameH - 20);

  // ─── 5. Top Viral Header & Official Pass Watermark ──────
  ctx.fillStyle = '#F5D061';
  ctx.font = '800 12px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.fillText('OFFICIAL MATCH PASS · FIFA WORLD CUP 2026', W / 2, p + 42);

  // Main App Wordmark Title
  const titleGrad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
  titleGrad.addColorStop(0, '#FFFFFF');
  titleGrad.addColorStop(0.5, '#F5D061');
  titleGrad.addColorStop(1, '#FFFFFF');
  ctx.fillStyle = titleGrad;
  ctx.font = '900 32px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '-0.5px';
  ctx.fillText('GUESS THE SCRIPT', W / 2, p + 82);

  // ─── 6. VIP Match Ticket Stub Centerpiece ───────────────
  const ticketY = p + 110;
  const ticketW = frameW - 40;
  const ticketH = 175;

  // Ticket Stub Background
  ctx.fillStyle = 'rgba(18, 20, 34, 0.85)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(W / 2 - ticketW / 2, ticketY, ticketW, ticketH, 16);
  ctx.fill();
  ctx.stroke();

  // Match Stage & Venue Tag
  ctx.fillStyle = '#F5D061';
  ctx.font = '800 13px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText(match.label.toUpperCase(), W / 2, ticketY + 32);

  ctx.fillStyle = '#9DA3BC';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '1px';
  ctx.fillText(`${match.venue.toUpperCase()} (${match.city.toUpperCase()})`, W / 2, ticketY + 50);

  // Perforated Ticket Divider
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(W / 2 - ticketW / 2 + 20, ticketY + 65);
  ctx.lineTo(W / 2 + ticketW / 2 - 20, ticketY + 65);
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash

  // Draw Teams & Flags
  const teamRowY = ticketY + 120;

  // Team A (Left)
  if (flagAImg) {
    drawCircularFlag(ctx, flagAImg, W / 2 - 200, teamRowY - 14, 46);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(match.teamA.shortCode, W / 2 - 140, teamRowY + 8);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${match.teamA.flagEmoji} ${match.teamA.shortCode}`, W / 2 - 200, teamRowY + 8);
  }

  // VS Badge / Score
  if (isResolved && match.resolution) {
    ctx.fillStyle = '#F5D061';
    ctx.font = '800 30px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${match.resolution.details.teamAGoals} - ${match.resolution.details.teamBGoals}`, W / 2, teamRowY + 8);
  } else {
    ctx.fillStyle = '#5C627A';
    ctx.font = '800 16px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'center';
    ctx.fillText('VS', W / 2, teamRowY + 6);
  }

  // Team B (Right)
  if (flagBImg) {
    drawCircularFlag(ctx, flagBImg, W / 2 + 200, teamRowY - 14, 46);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(match.teamB.shortCode, W / 2 + 140, teamRowY + 8);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 28px "Space Grotesk", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${match.teamB.shortCode} ${match.teamB.flagEmoji}`, W / 2 + 200, teamRowY + 8);
  }

  // ─── 7. Dramatic Script Narrative Section ────────────────
  const scriptY = ticketY + ticketH + 40;

  ctx.fillStyle = familyColor;
  ctx.font = '800 12px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.textAlign = 'center';
  ctx.fillText('NARRATIVE DRAFTED BY ORACLE', W / 2, scriptY);

  if (script) {
    // Large Glowing Script Title
    ctx.shadowColor = familyColor;
    ctx.shadowBlur = 16;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '-0.5px';
    ctx.fillText(`"${script.label.toUpperCase()}"`, W / 2, scriptY + 45);
    ctx.shadowBlur = 0; // Reset shadow

    // Family classification badge
    const familyBadgeW = 160;
    const familyBadgeH = 26;
    ctx.fillStyle = `${familyColor}22`;
    ctx.strokeStyle = familyColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(W / 2 - familyBadgeW / 2, scriptY + 62, familyBadgeW, familyBadgeH, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = familyColor;
    ctx.font = '800 11px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '2px';
    ctx.fillText(script.familyLabel.toUpperCase(), W / 2, scriptY + 79);

    // Script description box
    const descY = scriptY + 105;
    const maxTextWidth = 520;
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
    const descBoxH = lines.length * lineHeight + 30;

    ctx.fillStyle = 'rgba(22, 25, 41, 0.7)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(W / 2 - 280, descY, 560, descBoxH, 14);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#9DA3BC';
    ctx.textAlign = 'center';
    const startY = descY + 24;
    lines.forEach((line, index) => {
      ctx.fillText(line, W / 2, startY + index * lineHeight);
    });
  }

  // ─── 8. Scoring or Locked Status Emblem ──────────────────
  const emblemY = scriptY + 230;

  if (isResolved) {
    // Score Emblem Ring
    ctx.fillStyle = 'rgba(14, 16, 26, 0.95)';
    ctx.strokeStyle = goldFoil;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W / 2, emblemY + 40, 75, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Score text
    ctx.fillStyle = '#F5D061';
    ctx.font = '900 68px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '-2px';
    ctx.textAlign = 'center';
    ctx.fillText(String(score.totalMatchScore), W / 2, emblemY + 62);

    ctx.fillStyle = '#9DA3BC';
    ctx.font = '800 12px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('MATCH POINTS EARNED', W / 2, emblemY + 135);
  } else {
    // Locked Vault Emblem
    ctx.fillStyle = 'rgba(14, 16, 26, 0.95)';
    ctx.strokeStyle = 'rgba(245, 208, 97, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, emblemY + 35, 65, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#F5D061';
    ctx.font = '800 52px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📜', W / 2, emblemY + 52);

    ctx.fillStyle = '#F5D061';
    ctx.font = '800 13px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('SCRIPT VAULT LOCKED', W / 2, emblemY + 125);
  }

  // ─── 9. Oracle Handle & Challenger Tagline ───────────────
  const playerY = emblemY + 175;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 24px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.textAlign = 'center';
  ctx.fillText(player.name.toUpperCase(), W / 2, playerY);

  const challengerCall = isResolved
    ? (score.totalMatchScore >= 160
      ? 'I MASTERED THE SCRIPT. CAN YOU DO BETTER?'
      : 'FOOTBALL WRITES DRAMA. PLAY THE ORACLE.')
    : 'I CALLED THE MATCH NARRATIVE. CAN YOU READ THE GAME?';

  ctx.fillStyle = '#F5D061';
  ctx.font = '800 13px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText(challengerCall, W / 2, playerY + 28);

  // ─── 10. High Converting Viral CTA Footer Banner ──────────
  const footerY = H - p - 100;
  const footerW = frameW - 40;
  const footerH = 75;

  // Metallic CTA Container
  ctx.fillStyle = 'linear-gradient(135deg, rgba(245, 208, 97, 0.15) 0%, rgba(201, 158, 46, 0.05) 100%)';
  ctx.fillStyle = 'rgba(22, 25, 41, 0.95)';
  ctx.strokeStyle = 'rgba(245, 208, 97, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(W / 2 - footerW / 2, footerY, footerW, footerH, 14);
  ctx.fill();
  ctx.stroke();

  // CTA Text & URL
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 15px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.textAlign = 'center';
  ctx.fillText('PREDICT THE WORLD CUP KNOCKOUT NARRATIVE', W / 2, footerY + 30);

  ctx.fillStyle = '#F5D061';
  ctx.font = '800 14px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '3px';
  ctx.fillText('PLAY NOW AT GUESS THE SCRIPT', W / 2, footerY + 54);

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
export async function shareCard(dataUrl: string, fileName: string = 'guess-the-script-pass.png'): Promise<'shared' | 'downloaded'> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], fileName, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Guess the Script — World Cup Oracle Pass',
      text: 'I called the match narrative before kickoff. Think you can read football better?',
    });
    return 'shared';
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
  return 'downloaded';
}
