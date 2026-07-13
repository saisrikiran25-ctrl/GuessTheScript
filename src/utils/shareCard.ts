import type { Match, PlayerScore, Player } from '@/types';
import { getScriptById } from '@/data/scripts';
import { loadPrediction } from '@/utils/storage';

// ─── Generate share card via Canvas API ──────────────────────
// Returns a data URL (PNG) of a highly styled collector's card

export async function generateShareCard(
  match: Match,
  score: PlayerScore,
  player: Player
): Promise<string> {
  const canvas = document.createElement('canvas');
  // Portrait 9:16 at 2x for high-res quality
  const W = 600;
  const H = 1067;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  const prediction = loadPrediction(match.id, player.id);
  const script = prediction ? getScriptById(prediction.scriptId) : null;
  const isResolved = match.status === 'resolved';

  // ─── 1. Deep Space/Stadium Background ───────────────────
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#040408');
  bgGrad.addColorStop(0.5, '#090912');
  bgGrad.addColorStop(1, '#020205');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ─── 2. Script Family Ambient Glow Halo ─────────────────
  const accentColor = script?.familyColor ?? '#E8C366';
  const radialGlow = ctx.createRadialGradient(W / 2, H * 0.45, 50, W / 2, H * 0.45, 320);
  radialGlow.addColorStop(0, `${accentColor}18`);
  radialGlow.addColorStop(0.5, `${accentColor}06`);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 0, W, H);

  // ─── 3. Tactical Pitch Grid Overlay ─────────────────────
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
  ctx.lineWidth = 1;
  // Perspective lines
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(W / 2 + i * 50, 0);
    ctx.lineTo(W / 2 + i * 120, H);
    ctx.stroke();
  }
  // Horizontal grid steps
  for (let y = 0; y <= H; y += 60) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.01 + (y / H) * 0.015})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Pitch outline markings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
  ctx.lineWidth = 2;
  // Center circle
  ctx.beginPath();
  ctx.arc(W / 2, H * 0.48, 120, 0, 2 * Math.PI);
  ctx.stroke();
  // Center line
  ctx.beginPath();
  ctx.moveTo(30, H * 0.48);
  ctx.lineTo(W - 30, H * 0.48);
  ctx.stroke();
  // Penalty arcs
  ctx.beginPath();
  ctx.arc(W / 2, 40, 80, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H - 40, 80, Math.PI, 0);
  ctx.stroke();

  // ─── 4. Collector Card Outer Borders ────────────────────
  const framePadding = 20;
  // Outer glowing gold border
  const goldGrad = ctx.createLinearGradient(0, 0, W, H);
  goldGrad.addColorStop(0, '#E8C366');
  goldGrad.addColorStop(0.3, '#FDF0CD');
  goldGrad.addColorStop(0.7, '#B8933D');
  goldGrad.addColorStop(1, '#8C6B23');
  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 3;
  ctx.strokeRect(framePadding, framePadding, W - framePadding * 2, H - framePadding * 2);

  // Inset glass stroke
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.strokeRect(framePadding + 8, framePadding + 8, W - (framePadding + 8) * 2, H - (framePadding + 8) * 2);

  // ─── 5. Top Header & Wordmark ───────────────────────────
  ctx.fillStyle = '#F8F9FA';
  ctx.font = '800 18px Outfit, sans-serif';
  ctx.letterSpacing = '5px';
  ctx.textAlign = 'center';
  ctx.fillText('GUESS THE SCRIPT', W / 2, H * 0.07);

  // Tournament Badge Capsule
  const badgeY = H * 0.095;
  const badgeW = 160;
  const badgeH = 26;
  ctx.fillStyle = 'rgba(18, 18, 29, 0.85)';
  ctx.strokeStyle = 'rgba(232, 195, 102, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(W / 2 - badgeW / 2, badgeY, badgeW, badgeH, 13);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#E8C366';
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('WORLD CUP 2026', W / 2, badgeY + 17);

  // ─── 6. Match Fixture Display ───────────────────────────
  // Background card for teams
  const teamCardY = H * 0.15;
  const teamCardW = W - 100;
  const teamCardH = 90;
  ctx.fillStyle = 'rgba(18, 18, 29, 0.6)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(W / 2 - teamCardW / 2, teamCardY, teamCardW, teamCardH, 12);
  ctx.fill();
  ctx.stroke();

  // Draw Teams & Flags
  ctx.fillStyle = '#F8F9FA';
  ctx.font = '800 24px Outfit, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${match.teamA.flagEmoji}  ${match.teamA.shortCode}`, W / 2 - 190, teamCardY + 52);

  ctx.fillStyle = '#646480';
  ctx.font = '700 16px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', W / 2, teamCardY + 50);

  ctx.fillStyle = '#F8F9FA';
  ctx.font = '800 24px Outfit, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${match.teamB.shortCode}  ${match.teamB.flagEmoji}`, W / 2 + 190, teamCardY + 52);

  ctx.fillStyle = '#A6A6BF';
  ctx.font = '600 12px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '1px';
  ctx.fillText(match.label.toUpperCase(), W / 2, teamCardY + 76);

  // ─── 7. Script Section ──────────────────────────────────
  ctx.fillStyle = '#646480';
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText('YOUR CHOSEN SCRIPT', W / 2, H * 0.28);

  if (script) {
    // Elegant Script Display with Family Color Accent
    ctx.fillStyle = script.familyColor;
    ctx.font = '900 28px Outfit, sans-serif';
    ctx.letterSpacing = '0.5px';
    ctx.textAlign = 'center';
    
    // Draw script text with outer text shadow or glow
    ctx.shadowColor = script.familyColor;
    ctx.shadowBlur = 10;
    ctx.fillText(script.label.toUpperCase(), W / 2, H * 0.33);
    ctx.shadowBlur = 0; // reset shadow

    // Script description capsule
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(W / 2 - 230, H * 0.36, 460, 64, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#A6A6BF';
    ctx.font = '500 13px Outfit, sans-serif';
    ctx.textAlign = 'center';
    
    // Wrap description into two lines based on width, not characters
    const words = script.description.split(' ');
    let line1 = '';
    let line2 = '';
    for (let w = 0; w < words.length; w++) {
      // 60 chars fits comfortably in 460px width for 13px font
      if ((line1 + words[w]).length < 60) {
        line1 += words[w] + ' ';
      } else {
        line2 += words[w] + ' ';
      }
    }
    ctx.fillText(line1.trim(), W / 2, H * 0.395);
    if (line2) {
      ctx.fillText(line2.trim(), W / 2, H * 0.420);
    }
  }

  // ─── 8. Scoring / Locked Displays ───────────────────────
  if (isResolved) {
    // Score ring background glow
    const scoreCircleY = H * 0.58;
    ctx.fillStyle = 'rgba(18, 18, 29, 0.9)';
    ctx.strokeStyle = goldGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(W / 2, scoreCircleY, 95, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Score text
    const scoreGradText = ctx.createLinearGradient(0, scoreCircleY - 60, 0, scoreCircleY + 40);
    scoreGradText.addColorStop(0, '#FFFFFF');
    scoreGradText.addColorStop(0.5, '#E8C366');
    scoreGradText.addColorStop(1, '#B8933D');
    ctx.fillStyle = scoreGradText;
    ctx.font = '900 100px Outfit, sans-serif';
    ctx.letterSpacing = '-4px';
    ctx.textAlign = 'center';
    ctx.fillText(String(score.totalMatchScore), W / 2, scoreCircleY + 30);

    ctx.fillStyle = '#A6A6BF';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.letterSpacing = '5px';
    ctx.textAlign = 'center';
    ctx.fillText('POINTS', W / 2, scoreCircleY + 120);
  } else {
    // Locked Prediction Display
    const lockCircleY = H * 0.58;
    ctx.fillStyle = 'rgba(18, 18, 29, 0.9)';
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(W / 2, lockCircleY, 80, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Lock emoji icon
    ctx.fillStyle = '#00E5FF';
    ctx.font = '700 64px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒', W / 2, lockCircleY + 22);

    ctx.fillStyle = '#A6A6BF';
    ctx.font = '700 14px Outfit, sans-serif';
    ctx.letterSpacing = '4px';
    ctx.textAlign = 'center';
    ctx.fillText('PREDICTION LOCKED', W / 2, lockCircleY + 115);
  }

  // ─── 9. Divider ──────────────────────────────────────────
  ctx.fillStyle = 'rgba(232, 195, 102, 0.25)';
  ctx.fillRect(W / 2 - 50, H * 0.74, 100, 2);

  // ─── 10. Player Name Avatar & Tagline ────────────────────
  ctx.fillStyle = '#F8F9FA';
  ctx.font = '800 22px Outfit, sans-serif';
  ctx.letterSpacing = '0.5px';
  ctx.textAlign = 'center';
  ctx.fillText(player.name.toUpperCase(), W / 2, H * 0.79);

  const tagline = isResolved
    ? (score.totalMatchScore >= 150
      ? 'I read the match. Did you?'
      : score.totalMatchScore >= 80
      ? 'I called the script.'
      : 'Football writes its own rules.')
    : 'I called the script. Can you read the game?';

  ctx.fillStyle = '#A6A6BF';
  ctx.font = '600 15px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(tagline, W / 2, H * 0.83);

  // ─── 11. Footer Branding ─────────────────────────────────
  // Outer frame divider
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.fillRect(W / 2 - 120, H * 0.89, 240, 1);

  ctx.fillStyle = '#646480';
  ctx.font = '700 11px Outfit, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText('GUESS THE SCRIPT', W / 2, H * 0.93);

  return canvas.toDataURL('image/png', 0.95);
}

// ─── Trigger native share or download ────────────────────────
export async function shareCard(dataUrl: string, fileName: string = 'guess-the-script.png'): Promise<'shared' | 'downloaded'> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], fileName, { type: 'image/png' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: 'Guess the Script',
      text: 'I called the match narrative. Can you do better?',
    });
    return 'shared';
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = fileName;
  link.click();
  return 'downloaded';
}
