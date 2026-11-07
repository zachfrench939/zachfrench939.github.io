(function () {
  "use strict";

  var DURATION_MS = 60 * 1000;
  var ROUND_SIZE = 100;
  var ADVANCE_MS = 380;
  var BEST_KEY = "wick-best-score";
  var SOUND_KEY = "wick-sound";

  var wrap = document.getElementById("wrap");
  var screens = {
    start: document.getElementById("screen-start"),
    play: document.getElementById("screen-play"),
    end: document.getElementById("screen-end")
  };
  var startBtn = document.getElementById("start-btn");
  var bestScoreEl = document.getElementById("best-score");
  var loadError = document.getElementById("load-error");
  var soundBtn = document.getElementById("sound-toggle");
  var timer = document.getElementById("timer");
  var timerClock = document.getElementById("timer-clock");
  var wickWrap = document.getElementById("wick-wrap");
  var wickBar = document.getElementById("wick-bar");
  var counterEl = document.getElementById("counter");
  var scoreEl = document.getElementById("score");
  var streakEl = document.getElementById("streak");
  var categoryEl = document.getElementById("category");
  var questionEl = document.getElementById("question");
  var questionText = document.getElementById("question-text");
  var pop = document.getElementById("pop");
  var choicesEl = document.getElementById("choices");
  var nextBtn = document.getElementById("next-btn");
  var endBtn = document.getElementById("end-btn");
  var endReason = document.getElementById("end-reason");
  var verdictEl = document.getElementById("verdict");
  var endScore = document.getElementById("end-score");
  var endAcc = document.getElementById("end-acc");
  var endCorrect = document.getElementById("end-correct");
  var endStreak = document.getElementById("end-streak");
  var endBest = document.getElementById("end-best");
  var newBestEl = document.getElementById("new-best");
  var gridEl = document.getElementById("grid");
  var shareBtn = document.getElementById("share-btn");
  var shareStatus = document.getElementById("share-status");
  var shareFallback = document.getElementById("share-fallback");
  var shareText = document.getElementById("share-text");
  var againBtn = document.getElementById("again-btn");
  var confirmEl = document.getElementById("confirm");
  var confirmYes = document.getElementById("confirm-yes");
  var confirmNo = document.getElementById("confirm-no");
  var live = document.getElementById("live");

  var mode = "start";
  var deck = [];
  var index = 0;
  var score = 0;
  var streak = 0;
  var bestStreak = 0;
  var correct = 0;
  var answered = 0;
  var results = [];
  var current = null;
  var locked = false;
  var ended = false;
  var endAt = 0;
  var timerId = 0;
  var advanceId = 0;
  var warnedTen = false;
  var soundOn = false;
  var audioCtx = null;
  var lastResult = null;

  function readBest() {
    try {
      var raw = localStorage.getItem(BEST_KEY);
      if (raw === null || raw === "") return null;
      var n = Number(raw);
      return Number.isFinite(n) ? n : null;
    } catch (err) {
      return null;
    }
  }

  function writeBest(n) {
    try {
      localStorage.setItem(BEST_KEY, String(n));
      return true;
    } catch (err) {
      return false;
    }
  }

  function formatScore(n) {
    return Number(n).toLocaleString("en-GB");
  }

  function formatClock(ms) {
    var total = Math.ceil(Math.max(0, ms) / 1000);
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ":" + (s < 10 ? "0" + s : String(s));
  }

  function pageUrl() {
    var url = new URL("./", window.location.href);
    url.search = "";
    url.hash = "";
    return url.href;
  }

  function bank() {
    var list = window.WICK_QUESTIONS;
    if (!list || !list.length) return [];
    return list.filter(function (item) {
      return item && item.q && item.answer && item.category &&
        item.choices && item.choices.length === 4 &&
        item.choices.indexOf(item.answer) !== -1;
    });
  }

  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function pointsFor(n) {
    if (n >= 4) return 250;
    if (n >= 3) return 200;
    if (n >= 2) return 150;
    return 100;
  }

  function labelFor(n) {
    if (n >= 4) return "BLAZING";
    if (n >= 3) return "SHARP";
    if (n >= 2) return "NICE";
    return "GOT IT";
  }

  function say(text) {
    live.textContent = text;
  }

  function renderBest() {
    var best = readBest();
    bestScoreEl.textContent = best === null ? "—" : formatScore(best);
  }

  function renderSound() {
    soundBtn.textContent = soundOn ? "Sound on" : "Sound off";
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    soundBtn.setAttribute("aria-label", soundOn ? "Sound on" : "Sound off");
  }

  function ensureAudio() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!audioCtx) audioCtx = new AC();
      if (audioCtx.state === "suspended") {
        var resumed = audioCtx.resume();
        if (resumed && resumed.catch) resumed.catch(function () {});
      }
      return audioCtx;
    } catch (err) {
      return null;
    }
  }

  function blip(steps) {
    if (!soundOn) return;
    try {
      var ctx = ensureAudio();
      if (!ctx) return;
      var now = ctx.currentTime;
      steps.forEach(function (step) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var start = now + (step.at || 0);
        osc.type = step.type || "sine";
        osc.frequency.setValueAtTime(step.freq, start);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(step.gain || 0.05, start + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + step.dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + step.dur + 0.02);
      });
    } catch (err) {}
  }

  function showScreen(name) {
    screens.start.hidden = name !== "start";
    screens.play.hidden = name !== "play";
    screens.end.hidden = name !== "end";
    document.body.classList.remove("is-start", "is-play", "is-end");
    document.body.classList.add("is-" + name);
    var playing = name === "play";
    timer.hidden = !playing;
    wickWrap.hidden = !playing;
    if (!playing) document.body.classList.remove("is-urgent");
  }

  function renderTimer(ms) {
    var low = ms > 0 && ms <= 10000;
    timerClock.textContent = formatClock(ms);
    timer.classList.toggle("is-low", low);
    document.body.classList.toggle("is-urgent", low);
    var pct = Math.max(0, Math.min(100, (ms / DURATION_MS) * 100));
    wickBar.style.width = pct + "%";
  }

  function renderStatus() {
    counterEl.textContent = "QUESTION " + index + " OF " + deck.length;
    scoreEl.textContent = "SCORE " + formatScore(score);
    streakEl.textContent = "STREAK " + streak;
  }

  function showPop(text, bad) {
    pop.textContent = text;
    pop.classList.toggle("is-bad", !!bad);
    pop.classList.remove("is-show");
    void pop.offsetWidth;
    pop.classList.add("is-show");
  }

  function paintChoices(picked) {
    Array.prototype.forEach.call(choicesEl.children, function (btn) {
      var i = Number(btn.getAttribute("data-i"));
      var text = current.choices[i];
      btn.disabled = true;
      if (text === current.answer) btn.classList.add("is-correct");
      else if (i === picked) btn.classList.add("is-wrong");
      else btn.classList.add("is-idle");
    });
  }

  function renderChoices() {
    choicesEl.textContent = "";
    current.choices.forEach(function (text, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choice";
      btn.setAttribute("data-i", String(i));
      var key = document.createElement("span");
      key.className = "key";
      key.setAttribute("aria-hidden", "true");
      key.textContent = String(i + 1);
      var label = document.createElement("span");
      label.className = "choice-text";
      label.textContent = text;
      btn.appendChild(key);
      btn.appendChild(label);
      btn.setAttribute("aria-label", "Answer " + (i + 1) + ": " + text);
      choicesEl.appendChild(btn);
    });
  }

  function showQuestion() {
    if (index >= deck.length) {
      finish("bank");
      return;
    }
    current = deck[index];
    index += 1;
    locked = false;
    mode = "play";
    categoryEl.textContent = current.category;
    questionText.textContent = current.q;
    pop.textContent = "";
    pop.classList.remove("is-show", "is-bad");
    nextBtn.hidden = true;
    renderChoices();
    renderStatus();
    renderTimer(Math.max(0, endAt - Date.now()));
    if (questionEl.focus) questionEl.focus({ preventScroll: true });
  }

  function choose(i) {
    if (mode !== "play" || locked || !current) return;
    if (i < 0 || i > 3) return;
    var choice = current.choices[i];
    var right = choice === current.answer;
    locked = true;
    mode = "feedback";
    answered += 1;
    results.push(right);
    if (right) {
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
      var pts = pointsFor(streak);
      score += pts;
      correct += 1;
      var label = labelFor(streak);
      showPop("+" + pts + " " + label, false);
      say("Correct. " + label + ". Plus " + pts + " points. Streak " + streak + ".");
      blip([
        { freq: 523, dur: 0.09, gain: 0.05 },
        { freq: 659, dur: 0.12, gain: 0.05, at: 0.08 }
      ]);
    } else {
      streak = 0;
      showPop("NOT QUITE", true);
      say("Not quite. The answer was " + current.answer + ".");
      blip([{ freq: 180, dur: 0.14, gain: 0.045, type: "sine" }]);
    }
    paintChoices(i);
    renderStatus();
    nextBtn.hidden = true;
    clearTimeout(advanceId);
    advanceId = setTimeout(advance, ADVANCE_MS);
  }

  function advance() {
    clearTimeout(advanceId);
    if (mode !== "feedback" || ended) return;
    if (Date.now() >= endAt) {
      finish("time");
      return;
    }
    if (index >= deck.length) {
      finish("bank");
      return;
    }
    showQuestion();
  }

  function verdictFor(reason) {
    if (answered === 0) return "The wick is lit. Take a swing.";
    if (answered >= 3 && correct === answered) return "All correct. Clean burn.";
    var pct = correct / answered;
    if (answered >= 8 && pct >= 0.9) return "Brilliant. That wick burned bright.";
    if (answered >= 5 && pct >= 0.75) return "Sharp work. Steady flame.";
    if (pct >= 0.6) return "Solid sprint. Nicely done.";
    if (pct >= 0.4) return "A warm run. Light it again.";
    return "Tricky set. One good answer starts a streak.";
  }

  function reasonLabel(reason) {
    if (reason === "bank") return "All 100 done";
    if (reason === "end") return "You ended it";
    return "Time's up";
  }

  function accuracyText() {
    if (!answered) return "—";
    return Math.round((correct / answered) * 100) + "%";
  }

  function buildShare(result) {
    var lines = ["WICK", "1 minute · " + result.roundSize + " questions", "Score " + formatScore(result.score)];
    if (result.newBest) lines.push("New best on this device");
    lines.push(result.answered + " of " + result.roundSize + " · " + result.accuracy);
    lines.push("Best streak " + result.bestStreak);
    lines.push("");
    if (result.results.length) {
      for (var i = 0; i < result.results.length; i += 8) {
        lines.push(result.results.slice(i, i + 8).map(function (ok) {
          return ok ? "🟩" : "🟥";
        }).join(""));
      }
      lines.push("");
    }
    lines.push(pageUrl());
    return lines.join("\n");
  }

  function renderGrid(flags) {
    gridEl.textContent = "";
    if (!flags.length) return;
    for (var i = 0; i < flags.length; i += 8) {
      var span = document.createElement("span");
      span.textContent = flags.slice(i, i + 8).map(function (ok) {
        return ok ? "🟩" : "🟥";
      }).join("");
      gridEl.appendChild(span);
    }
  }

  function closeConfirmQuiet() {
    confirmEl.hidden = true;
    document.body.classList.remove("modal-open");
    wrap.inert = false;
  }

  function closeConfirm() {
    closeConfirmQuiet();
    if (mode === "feedback" && !ended) {
      clearTimeout(advanceId);
      advanceId = setTimeout(advance, ADVANCE_MS);
    }
    if (!screens.play.hidden) endBtn.focus();
  }

  function openConfirm() {
    if (ended || mode === "start" || mode === "end") return;
    clearTimeout(advanceId);
    confirmEl.hidden = false;
    document.body.classList.add("modal-open");
    wrap.inert = true;
    confirmYes.focus();
  }

  function finish(reason) {
    if (ended) return;
    ended = true;
    clearInterval(timerId);
    clearTimeout(advanceId);
    mode = "end";
    closeConfirmQuiet();
    var had = readBest();
    var better = score > (had === null ? 0 : had);
    var savedBest = had;
    if (better) {
      if (writeBest(score)) savedBest = score;
      else better = false;
    }
    var accuracy = accuracyText();
    lastResult = {
      score: score,
      correct: correct,
      answered: answered,
      accuracy: accuracy,
      bestStreak: bestStreak,
      results: results.slice(),
      roundSize: deck.length,
      newBest: better,
      reason: reason
    };
    endReason.textContent = reasonLabel(reason);
    verdictEl.textContent = verdictFor(reason);
    endScore.textContent = formatScore(score);
    endAcc.textContent = accuracy;
    endCorrect.textContent = answered + " of " + deck.length;
    endStreak.textContent = String(bestStreak);
    endBest.textContent = savedBest === null ? "—" : formatScore(savedBest);
    newBestEl.hidden = !better;
    renderGrid(results);
    shareStatus.textContent = "";
    shareFallback.hidden = true;
    shareText.value = "";
    renderBest();
    showScreen("end");
    verdictEl.focus();
    say(reasonLabel(reason) + ". Score " + formatScore(score) + ". " + verdictEl.textContent);
  }

  function tick() {
    if (ended) return;
    var left = endAt - Date.now();
    if (left <= 0) {
      renderTimer(0);
      finish("time");
      return;
    }
    renderTimer(left);
    if (!warnedTen && left <= 10000) {
      warnedTen = true;
      say("Ten seconds left.");
    }
  }

  function startGame() {
    if (mode === "play" || mode === "feedback" || mode === "starting") return;
    var source = bank();
    if (!source.length) {
      mode = "start";
      loadError.hidden = false;
      showScreen("start");
      return;
    }
    mode = "starting";
    loadError.hidden = true;
    deck = shuffle(source).slice(0, ROUND_SIZE).map(function (item) {
      return {
        category: item.category,
        q: item.q,
        answer: item.answer,
        choices: shuffle(item.choices)
      };
    });
    index = 0;
    score = 0;
    streak = 0;
    bestStreak = 0;
    correct = 0;
    answered = 0;
    results = [];
    current = null;
    locked = false;
    ended = false;
    warnedTen = false;
    endAt = Date.now() + DURATION_MS;
    clearInterval(timerId);
    clearTimeout(advanceId);
    closeConfirmQuiet();
    showScreen("play");
    renderTimer(DURATION_MS);
    timerId = setInterval(tick, 200);
    showQuestion();
    say("Game started. One minute. " + deck.length + " questions.");
  }

  var canon = document.querySelector('link[rel="canonical"]');
  if (canon) canon.setAttribute("href", pageUrl());

  soundOn = false;
  try {
    soundOn = localStorage.getItem(SOUND_KEY) === "on";
  } catch (err) {
    soundOn = false;
  }
  renderSound();
  renderBest();
  showScreen("start");

  soundBtn.addEventListener("click", function () {
    soundOn = !soundOn;
    try {
      localStorage.setItem(SOUND_KEY, soundOn ? "on" : "off");
    } catch (err) {}
    renderSound();
    if (soundOn) {
      ensureAudio();
      blip([{ freq: 660, dur: 0.07, gain: 0.05 }]);
    }
  });

  startBtn.addEventListener("click", startGame);
  againBtn.addEventListener("click", startGame);
  nextBtn.addEventListener("click", advance);
  endBtn.addEventListener("click", openConfirm);
  confirmYes.addEventListener("click", function () {
    closeConfirmQuiet();
    finish("end");
  });
  confirmNo.addEventListener("click", closeConfirm);

  choicesEl.addEventListener("click", function (event) {
    var btn = event.target.closest("button[data-i]");
    if (!btn) return;
    choose(Number(btn.getAttribute("data-i")));
  });

  confirmEl.addEventListener("keydown", function (event) {
    if (confirmEl.hidden) return;
    var items = [confirmYes, confirmNo];
    if (event.key === "Escape") {
      event.preventDefault();
      closeConfirm();
      return;
    }
    if (event.key !== "Tab") return;
    if (items.indexOf(document.activeElement) === -1) {
      event.preventDefault();
      (event.shiftKey ? confirmNo : confirmYes).focus();
      return;
    }
    if (event.shiftKey && document.activeElement === confirmYes) {
      event.preventDefault();
      confirmNo.focus();
    } else if (!event.shiftKey && document.activeElement === confirmNo) {
      event.preventDefault();
      confirmYes.focus();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (!confirmEl.hidden) return;
    if (mode === "play" && !locked) {
      var map = { "1": 0, "2": 1, "3": 2, "4": 3 };
      if (Object.prototype.hasOwnProperty.call(map, event.key)) {
        event.preventDefault();
        choose(map[event.key]);
      }
    }
  });

  shareBtn.addEventListener("click", function () {
    if (!lastResult) return;
    var text = buildShare(lastResult);
    var copy = navigator.clipboard && navigator.clipboard.writeText;
    if (!copy) {
      shareFallback.hidden = false;
      shareText.value = text;
      shareStatus.textContent = "Select the result below and copy it.";
      shareText.focus();
      shareText.select();
      return;
    }
    navigator.clipboard.writeText(text).then(function () {
      shareFallback.hidden = true;
      shareStatus.textContent = "Copied. You can paste it anywhere.";
    }).catch(function () {
      shareFallback.hidden = false;
      shareText.value = text;
      shareStatus.textContent = "Select the result below and copy it.";
      shareText.focus();
      shareText.select();
    });
  });
})();
