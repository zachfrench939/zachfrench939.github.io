// Pull rates for every series. Weights are shares of `scale` (10,000 = 100%).
// A pack rolls one tier with these weights, then a random card of that tier.
// Ultra Rare weight 20 / 10,000 with 2 cards in the set = 1 in 1,000 each.
// Mythic weight 1 / 10,000 with 1 card = 1 in 10,000.
// Edit this file only — the packs page reads it when it renders "Pull rates".
window.PULL_ODDS = {
  scale: 10000,
  tiers: [
    { id: 'common', name: 'Common', weight: 6500 },
    { id: 'uncommon', name: 'Uncommon', weight: 2500 },
    { id: 'rare', name: 'Rare', weight: 979 },
    { id: 'ultra', name: 'Ultra Rare', weight: 20 },
    { id: 'mythic', name: 'Mythic', weight: 1 }
  ]
};
