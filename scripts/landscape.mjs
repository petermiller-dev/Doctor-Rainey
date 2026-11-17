// Illustrated North Texas landscape used as the temporary hero backdrop.
// Four independent layers so each can drift at its own parallax speed.
// Replace with a photograph by adding assets/images/hero/texas-landscape.jpg
// (see PHOTO-GUIDE.md) — the build swaps it in automatically.

const svg = (cls, speed, inner) =>
  `<svg class="scene__layer ${cls}" data-parallax="${speed}" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">${inner}</svg>`;

// A spreading live oak: broad, low, scalloped canopy over wide-reaching limbs.
function liveOak(x, y, s, fill) {
  const W = 310 * s, H = 105 * s; // canopy half-width and height
  const puffs = [];
  const K = 17;
  for (let i = 0; i <= K; i++) {
    const t = Math.PI + (i / K) * Math.PI;
    const r = (38 + 12 * Math.sin(i * 1.9) + 7 * Math.cos(i * 3.3)) * s;
    puffs.push([x + Math.cos(t) * W, y + Math.sin(t) * H * (0.72 + 0.28 * Math.abs(Math.sin(t))), r]);
  }
  for (let i = 0; i <= 8; i++) {
    const px = x - W * 0.95 + (i / 8) * W * 1.9;
    const droop = Math.pow(Math.abs(px - x) / W, 2) * 26 * s; // edges droop like live oak limbs
    puffs.push([px, y + 4 * s + droop, (30 + 8 * Math.sin(i * 2.3)) * s]);
  }
  const d = '';
  const body = `<ellipse cx="${x}" cy="${y - H * 0.38}" rx="${W * 0.94}" ry="${H * 0.78}"/><rect x="${x - W * 0.95}" y="${y - H * 0.4}" width="${W * 1.9}" height="${H * 0.45}" rx="${20 * s}"/>`;
  const canopy = body + puffs.map(([cx, cy, r]) => `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}"/>`).join('');
  const g = (n) => +(n * s).toFixed(1);
  const base = y + 175 * s;
  const limbs = [
    `M${x - g(6)} ${base} C${x - g(4)} ${y + g(110)} ${x - g(40)} ${y + g(60)} ${x - g(250)} ${y + g(22)}`,
    `M${x - g(2)} ${base} C${x - g(2)} ${y + g(90)} ${x - g(30)} ${y + g(40)} ${x - g(110)} ${y + g(10)}`,
    `M${x + g(4)} ${base} C${x + g(6)} ${y + g(100)} ${x + g(30)} ${y + g(50)} ${x + g(140)} ${y + g(16)}`,
    `M${x + g(8)} ${base} C${x + g(14)} ${y + g(118)} ${x + g(70)} ${y + g(72)} ${x + g(285)} ${y + g(30)}`,
    `M${x} ${y + g(90)} C${x + g(4)} ${y + g(50)} ${x - g(4)} ${y + g(30)} ${x + g(10)} ${y + g(6)}`,
  ];
  return `<g fill="${fill}">${canopy}</g>` +
    `<g fill="none" stroke="${fill}" stroke-linecap="round">` +
    limbs.map((l, i) => `<path d="${l}" stroke-width="${(i === 4 ? 9 : i % 3 === 0 ? 11 : 14) * s}"/>`).join('') +
    `<path d="M${x - g(14)} ${base + g(4)} L${x + g(16)} ${base + g(4)}" stroke-width="${18 * s}"/></g>`;
}

function smallTree(x, y, s, fill) {
  return `<g fill="${fill}"><ellipse cx="${x}" cy="${y}" rx="${26 * s}" ry="${15 * s}"/><ellipse cx="${x + 18 * s}" cy="${y + 4 * s}" rx="${18 * s}" ry="${11 * s}"/><rect x="${x - 1.5 * s}" y="${y + 8 * s}" width="${3 * s}" height="${14 * s}"/></g>`;
}

export function landscapeScene() {
  const far = svg(
    'scene__far',
    0.08,
    `<path fill="var(--scene-far)" d="M0 560 C180 520 320 540 470 515 C640 488 760 530 930 505 C1100 480 1250 520 1400 500 C1500 488 1560 495 1600 500 V900 H0Z"/>`
  );
  const mid = svg(
    'scene__mid',
    0.16,
    `<path fill="var(--scene-mid)" d="M0 640 C160 600 300 615 460 590 C640 562 820 615 1010 590 C1180 568 1330 600 1600 575 V900 H0Z"/>` +
      smallTree(240, 590, 1, 'var(--scene-mid-tree)') +
      smallTree(320, 596, 0.7, 'var(--scene-mid-tree)') +
      smallTree(890, 590, 0.8, 'var(--scene-mid-tree)') +
      smallTree(1290, 582, 0.9, 'var(--scene-mid-tree)') +
      smallTree(1350, 586, 0.6, 'var(--scene-mid-tree)')
  );
  const near = svg(
    'scene__near',
    0.28,
    `<path fill="var(--scene-near)" d="M0 735 C220 700 420 720 640 705 C860 690 1060 720 1260 700 C1400 688 1520 690 1600 695 V900 H0Z"/>` +
      liveOak(1255, 545, 0.95, 'var(--scene-oak)') +
      `<g stroke="var(--scene-grass)" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".55">` +
      Array.from({ length: 70 }, (_, i) => {
        const x = 20 + i * 23 + ((i * 37) % 11);
        const h = 10 + ((i * 53) % 18);
        const y = 760 + ((i * 29) % 40);
        return `<path d="M${x} ${y} q2 -${h / 2} ${((i % 3) - 1) * 4} -${h}"/>`;
      }).join('') +
      `</g>`
  );
  return `<div class="scene" aria-hidden="true">
  <div class="scene__sky" data-parallax="0.04"><span class="scene__sun"></span></div>
  ${far}
  <div class="scene__haze"></div>
  ${mid}
  ${near}
</div>`;
}
