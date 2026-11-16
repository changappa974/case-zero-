export interface CertificateCardData {
  participantName: string;
  timeTaken: string;
  confirmationCode: string;
  submittedAt: string;
  score?: number;
}

export function downloadCertifiedCard(data: CertificateCardData): void {
  const width = 1200;
  const height = 675;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Background gradient (Deep Obsidian Slate)
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0d14');
  bgGrad.addColorStop(0.5, '#0f172a');
  bgGrad.addColorStop(1, '#050811');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Micro-grid lines pattern (Forensic Guilloche effect)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  const gridSize = 28;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. Double Metallic Gold Foil Border
  // Outer border
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Inner border
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.lineWidth = 3;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // Corner Accents (Gold L-brackets)
  const drawCorner = (x: number, y: number, dx: number, dy: number) => {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + dy * 26);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * 26, y);
    ctx.stroke();
  };
  drawCorner(46, 46, 1, 1);
  drawCorner(width - 46, 46, -1, 1);
  drawCorner(46, height - 46, 1, -1);
  drawCorner(width - 46, height - 46, -1, -1);

  // 4. Header Badge / Top Tagline
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('SPECIAL FORENSIC DIVISION // INCIDENT ARCHIVE', width / 2, 85);

  // 5. Main Title
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 32px "Trebuchet MS", sans-serif';
  ctx.fillText('CASE ZERO: THE VISUAL MYSTERY CHALLENGE', width / 2, 126);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'italic 16px serif';
  ctx.fillText('Frostpeak Conservatory Homicide Investigation Inquiry', width / 2, 153);

  // Divider line with gold diamond
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(240, 175);
  ctx.lineTo(width - 240, 175);
  ctx.stroke();

  // Diamond at center of divider
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(width / 2, 175, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // 6. Commendation Lead-in
  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillText('THIS CERTIFIES THAT INVESTIGATING DETECTIVE', width / 2, 222);

  // 7. Detective Name (Large, Golden Highlight with glow shadow)
  ctx.fillStyle = '#fef08a';
  ctx.font = '900 46px "Trebuchet MS", sans-serif';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.55)';
  ctx.shadowBlur = 18;
  ctx.fillText(data.participantName.toUpperCase(), width / 2, 280);
  ctx.shadowBlur = 0; // reset shadow

  // 8. Description Paragraph
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px sans-serif';
  ctx.fillText(
    'has conducted an official forensic review of surveillance reels, physical evidence, and suspect alibis',
    width / 2,
    320
  );
  ctx.fillText(
    'and successfully filed their investigative deduction into the permanent incident registry.',
    width / 2,
    342
  );

  // 9. Data Badges Grid (Time Taken, Case Ref, Date)
  const badgeY = 380;
  const badgeH = 88;

  // Box 1: TIME TAKEN
  const box1X = 140;
  const boxW = 260;
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.strokeStyle = 'rgba(71, 85, 105, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.fillRect(box1X, badgeY, boxW, badgeH);
  ctx.strokeRect(box1X, badgeY, boxW, badgeH);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('TIME TAKEN', box1X + boxW / 2, badgeY + 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 28px "Courier New", monospace';
  ctx.fillText(data.timeTaken, box1X + boxW / 2, badgeY + 68);

  // Box 2: CASE CODE
  const box2X = 420;
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.fillRect(box2X, badgeY, boxW, badgeH);
  ctx.strokeRect(box2X, badgeY, boxW, badgeH);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('OFFICIAL CASE CODE', box2X + boxW / 2, badgeY + 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillText(data.confirmationCode, box2X + boxW / 2, badgeY + 66);

  // Box 3: FILING DATE
  const box3X = 700;
  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
  ctx.fillRect(box3X, badgeY, boxW, badgeH);
  ctx.strokeRect(box3X, badgeY, boxW, badgeH);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillText('DATE RECORDED', box3X + boxW / 2, badgeY + 28);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.fillText(data.submittedAt, box3X + boxW / 2, badgeY + 65);

  // 10. Official “CASE ZERO CERTIFIED” Rubber Stamp (Tilted Seal)
  ctx.save();
  ctx.translate(1030, 420);
  ctx.rotate((-14 * Math.PI) / 180);

  // Stamp outer border
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.strokeRect(-90, -50, 180, 100);

  // Stamp inner dashed border
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(-83, -43, 166, 86);
  ctx.setLineDash([]);

  // Stamp text
  ctx.fillStyle = '#dc2626';
  ctx.textAlign = 'center';

  ctx.font = 'bold 9px "Courier New", monospace';
  ctx.fillText('★ FORENSIC ARCHIVE ★', 0, -26);

  ctx.font = '900 20px "Arial Black", sans-serif';
  ctx.fillText('CASE ZERO', 0, -3);

  ctx.font = '900 17px "Arial Black", sans-serif';
  ctx.fillText('CERTIFIED', 0, 18);

  ctx.font = 'bold 8px "Courier New", monospace';
  ctx.fillText('OFFICIAL VERIFIED', 0, 34);

  ctx.restore();

  // 11. Card Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '11px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(
    'RECORD IDENTIFIER: ' + data.confirmationCode + ' • FORENSIC INTEGRITY SEAL • FROSTPEAK CONSERVATORY DIVISION',
    width / 2,
    608
  );

  // Barcode decoration along bottom center
  const barcodeY = 624;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  const barPattern = [3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 4, 1, 3, 2, 1, 4, 1, 2, 3, 4, 1, 2];
  let curX = width / 2 - 120;
  barPattern.forEach((w) => {
    ctx.fillRect(curX, barcodeY, w, 14);
    curX += w + 2;
  });

  // 12. Trigger Instant Download
  const link = document.createElement('a');
  const safeName = data.participantName.trim().replace(/[^a-zA-Z0-9]/g, '_') || 'Detective';
  link.download = `Case_Zero_Certified_${safeName}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
