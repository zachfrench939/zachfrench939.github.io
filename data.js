/* Video grid adapter. Shorts with a YouTube id, taken from Series 01.
   Card art, rarities, and copy live in series/s1.js — not here. */
(() => {
  const s1 = (window.SERIES || []).find(s => s.id === 's1');
  const cards = (s1 && s1.cards) || [];
  window.VIDEOS = cards
    .filter(c => c.videoId && c.kind === 'short')
    .map(c => [c.videoId, c.title, c.country]);
})();
