/* Series 03 — fridge magnet. Coming soon.
   Drop real cards into `cards`, set status to "live", and they use this template. */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function renderCard(c, ctx) {
    const klass = (ctx && ctx.className) || c.rarity;
    return `<article class="tcard theme-magnet tier-${c.rarity}" data-cid="${c.cid || 's3'}">
      <div class="tcard-inner">
        <div class="tcard-back"><p>Series 03</p><a class="btn" href="https://www.youtube.com/@Solotravel_365" target="_blank" rel="noopener">Watch the channel</a></div>
        <div class="tcard-face">
          <div class="mag-art" aria-hidden="true"></div>
          <h3>${esc(c.name)}</h3>
          <p>${esc(klass)}</p>
          <span>Solo Travel 365</span>
        </div>
      </div>
    </article>`;
  }
  const sample = { cid: 's3-preview', rarity: 'uncommon', name: 'Fridge door', preview: true };
  window.SERIES = window.SERIES || [];
  window.SERIES.push({
    id: 's3',
    number: 3,
    name: 'Series 03',
    themeName: 'Fridge magnets',
    theme: 'magnet',
    status: 'soon',
    size: 40,
    classes: { common: 'Souvenir', uncommon: 'Enamel', rare: 'Collector', ultra: 'Limited run', mythic: 'Aurora Magnet' },
    mythicPrize: '',
    cards: [],
    renderCard,
    renderPreview() { return `<div class="soon-wrap">${renderCard(sample, { className: 'Enamel' })}<p class="soon-note">Series 03 · fridge magnets · coming soon</p></div>`; }
  });
})();
