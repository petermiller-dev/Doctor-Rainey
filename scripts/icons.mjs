// Line icons drawn for this site (no icon font, no external requests).
const wrap = (d) =>
  `<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

export const icons = {
  sprout: wrap('<path d="M24 42V22"/><path d="M24 26c0-7-5-12-13-12 0 8 5 12 13 12z"/><path d="M24 22c0-6 4-11 12-11 0 7-4 11-12 11z"/><path d="M14 42h20"/>'),
  leaf: wrap('<path d="M10 38C10 20 22 9 40 8c0 18-11 30-29 30z"/><path d="M10 38 30 18"/><path d="M18 30h8M22 26v-6"/>'),
  drop: wrap('<path d="M24 7c6 9 12 15 12 22a12 12 0 0 1-24 0c0-7 6-13 12-22z"/><path d="M19 31a5 5 0 0 0 5 5"/>'),
  shield: wrap('<path d="M24 6 39 12v11c0 10-7 16-15 19C16 39 9 33 9 23V12z"/><path d="m18 24 4 4 8-9"/>'),
  rings: wrap('<circle cx="24" cy="24" r="5"/><circle cx="24" cy="24" r="11"/><circle cx="24" cy="24" r="17" stroke-dasharray="2 4"/>'),
  path: wrap('<path d="M8 40c8 0 8-10 16-10s8-10 16-10"/><circle cx="8" cy="40" r="2"/><circle cx="40" cy="20" r="2"/><path d="M36 8l4 4-4 4"/><path d="M40 12H28"/>'),
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h15"/><path d="m13 6 6 6-6 6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  external: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 11 13"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  play: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M26 21v22l18-11z" fill="currentColor"/></svg>',
};
