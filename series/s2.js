/* Series 02 — passport page. Coming soon.
   Drop real cards into `cards`, set status to "live", and they use this template. */
(() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function renderCard(c, ctx) {
    const klass = (ctx && ctx.className) || c.rarity;
    return `<article class="tcard theme-passport tier-${c.rarity}" data-cid="${c.cid || 's2'}">
      <div class="tcard-inner">
        <div class="tcard-back"><p>Series 02</p><a class="btn" href="https://www.youtube.com/@Solotravel_365" target="_blank" rel="noopener">Watch the channel</a></div>
        <div class="tcard-face">
          <header><span>Passport</span><b>Series 02</b></header>
          <div class="pp-photo" aria-hidden="true"></div>
          <h3>${esc(c.name)}</h3>
          <p class="pp-class">${esc(klass)}</p>
          <p class="pp-mrz">${esc('P<ST365<<' + (c.name || 'SOON').toUpperCase().replace(/[^A-Z]+/g, '<') + '<<<')}</p>
          <span class="pp-stamp" aria-hidden="true">${esc(klass)}</span>
        </div>
      </div>
    </article>`;
  }
  const sample = { cid: 's2-preview', rarity: 'rare', name: 'Visa page', preview: true };
  window.SERIES = window.SERIES || [];
  window.SERIES.push({
    id: 's2',
    number: 2,
    name: 'Series 02',
    themeName: 'Passport',
    theme: 'passport',
    status: 'soon',
    size: 40,
    classes: { common: 'Visitor', uncommon: 'Visa', rare: 'Diplomatic', ultra: 'Black Visa', mythic: 'Golden Eagle' },
    mythicPrize: '',
    cards: [],
    renderCard,
    renderPreview() { return `<div class="soon-wrap">${renderCard(sample, { className: 'Diplomatic' })}<p class="soon-note">Series 02 · passport pages · coming soon</p></div>`; }
  });
})();
