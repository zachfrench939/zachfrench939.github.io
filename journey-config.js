// Tune the Solo Journey pack here.
// milesPerPack is the only number you should need to change.
//
// Active play, as designed, is about 35 taps a minute, the transport income while Play is open, a short challenge every few minutes, and the odd event. At 1050 miles that mix takes about 15 minutes.
// Lower the number for a faster pack. Raise it for a slower one.
// Leaving the tab closed uses offlineRate of the transport income only,
// and never more than offlineCapMs.
window.JOURNEY_CONFIG = {
  milesPerPack: 1050,
  offlineRate: 0.12,
  offlineCapMs: 3 * 60 * 60 * 1000
};
