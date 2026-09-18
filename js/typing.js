/**
 * Monkeytype Style Real-Time Typing Engine with Audio Feedback
 * Zero-latency synthetic mechanical sound effects
 */

// সাউন্ড এফেক্টস কন্ট্রোলার (Web Audio API)
const SoundFX = {
  ctx: null,

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },

  playCorrect() {
    if (!CONFIG.SOUND.ENABLED || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(650, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(850, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(CONFIG.SOUND.VOLUME, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  },

  playIncorrect() {
    if (!CONFIG.SOUND.ENABLED || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(130, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(CONFIG.SOUND.VOLUME * 1.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }
};

class MonkeyTypingEngine {
  constructor(contentData, duration) {
    this.rawText = (contentData.text || "").trim();
    this.wordsList = this.rawText.split(/\s+/);
    this.totalDuration = parseInt(duration, 10);
    this.remainingTime = this.totalDuration;

    this.timer = null;
    this.isStarted = false;
    this.currentWordIdx = 0;
    this.lastInputLength = 0;

    this.correctChars = 0;
    this.incorrectChars = 0;

    // DOM Elements
    this.wordsWrapper = document.getElementById("words-wrapper");
    this.input = document.getElementById("ghost-input");
    this.restartBtn = document.getElementById("btn-restart");

    this.init();
  }

  init() {
    this.renderWords();
    this.setupListeners();
    this.focusInput();
  }

  renderWords() {
    this.wordsWrapper.innerHTML = "";
    this.wordsList.forEach((wordText, wIdx) => {
      const wordEl = document.createElement("div");
      wordEl.className = "word";
      wordEl.dataset.index = wIdx;

      wordText.split("").forEach((char, cIdx) => {
        const charSpan = document.createElement("span");
        charSpan.className = "char";
        charSpan.textContent = char;
        if (wIdx === 0 && cIdx === 0) {
          charSpan.classList.add("current");
        }
        wordEl.appendChild(charSpan);
      });

      this.wordsWrapper.appendChild(wordEl);
    });
  }

  focusInput() {
    this.input.focus();
    document.addEventListener("click", () => {
      SoundFX.init();
      this.input.focus();
    });
  }

  setupListeners() {
    this.input.value = "";
    this.lastInputLength = 0;

    this.input.addEventListener("input", (e) => this.handleInput(e));
    this.restartBtn.addEventListener("click", () => location.reload());

    // Tab + Enter কুইক রিস্টার্ট
    window.addEventListener("keydown", (e) => {
      SoundFX.init();
      if (e.key === "Tab") {
        e.preventDefault();
        this.tabPressed = true;
      }
      if (e.key === "Enter" && this.tabPressed) {
        e.preventDefault();
        location.reload();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "Tab") this.tabPressed = false;
    });
  }

  startTimer() {
    this.isStarted = true;
    this.timer = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.finishTest();
      }
    }, 1000);
  }

  handleInput(e) {
    SoundFX.init();

    if (!this.isStarted) {
      this.startTimer();
    }

    const currentWordEl = this.wordsWrapper.children[this.currentWordIdx];
    if (!currentWordEl) {
      this.finishTest();
      return;
    }

    const targetWord = this.wordsList[this.currentWordIdx];
    const inputValue = this.input.value;

    // স্পেস চাপলে পরের শব্দে যাওয়া
    if (inputValue.endsWith(" ")) {
      if (inputValue.trim().length > 0) {
        SoundFX.playCorrect();
        this.moveToNextWord();
      }
      this.input.value = "";
      this.lastInputLength = 0;
      return;
    }

    const charElements = currentWordEl.children;
    const typedLen = inputValue.length;

    // নতুন ক্যারেক্টার টাইপ হলে সাউন্ড ফিডব্যাক
    if (typedLen > this.lastInputLength) {
      const typedIndex = typedLen - 1;
      const expected = targetWord[typedIndex];
      const typedChar = inputValue[typedIndex];

      if (typedChar === expected) {
        SoundFX.playCorrect();
      } else {
        SoundFX.playIncorrect();
      }
    }
    this.lastInputLength = typedLen;

    // ক্যারেক্টার ক্লাস স্টেট আপডেট
    for (let i = 0; i < targetWord.length; i++) {
      const span = charElements[i];
      span.classList.remove("current", "correct", "incorrect");

      if (i < typedLen) {
        if (inputValue[i] === targetWord[i]) {
          span.classList.add("correct");
        } else {
          span.classList.add("incorrect");
        }
      }
    }

    // কার্সার আপডেট
    if (typedLen < targetWord.length) {
      charElements[typedLen].classList.add("current");
    }
  }

  moveToNextWord() {
    const currentWordEl = this.wordsWrapper.children[this.currentWordIdx];
    const targetWord = this.wordsList[this.currentWordIdx];
    const typedWord = this.input.value.trim();

    for (let i = 0; i < targetWord.length; i++) {
      if (i < typedWord.length && typedWord[i] === targetWord[i]) {
        this.correctChars++;
      } else {
        this.incorrectChars++;
      }
    }

    this.correctChars++; // স্পেস কাউন্ট

    Array.from(currentWordEl.children).forEach(span => span.classList.remove("current"));

    this.currentWordIdx++;
    if (this.currentWordIdx >= this.wordsList.length) {
      this.finishTest();
      return;
    }

    const nextWordEl = this.wordsWrapper.children[this.currentWordIdx];
    if (nextWordEl && nextWordEl.children.length > 0) {
      nextWordEl.children[0].classList.add("current");
    }
  }

  finishTest() {
    clearInterval(this.timer);
    this.input.disabled = true;

    const timeSpent = this.totalDuration - this.remainingTime || this.totalDuration;
    const minutes = timeSpent / 60;
    const finalWpm = Math.round((this.correctChars / 5) / minutes) || 0;
    const totalTyped = this.correctChars + this.incorrectChars;
    const finalAccuracy = totalTyped > 0 
      ? ((this.correctChars / totalTyped) * 100).toFixed(1) 
      : 100;

    const resultSummary = {
      wpm: finalWpm,
      accuracy: finalAccuracy,
      correctChars: this.correctChars,
      incorrectChars: this.incorrectChars,
      totalChars: this.rawText.length,
      typedChars: totalTyped,
      typedWords: Math.round(this.correctChars / 5),
      duration: timeSpent
    };

    sessionStorage.setItem("typing_results", JSON.stringify(resultSummary));
    window.location.href = "result.html";
  }
}

// ইনিশিয়ালাইজেশন
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || CONFIG.DEFAULTS.MODE;
  const duration = urlParams.get("duration") || CONFIG.DEFAULTS.DURATION;
  const difficulty = urlParams.get("difficulty") || CONFIG.DEFAULTS.DIFFICULTY;
  const language = urlParams.get("language") || CONFIG.DEFAULTS.LANGUAGE;
  const category = urlParams.get("category") || CONFIG.DEFAULTS.CATEGORY;

  const activeLangEl = document.getElementById("active-language");
  if (activeLangEl) activeLangEl.textContent = language;

  const loaderBox = document.getElementById("loader-box");
  const typingZone = document.getElementById("typing-zone");

  const adConfig = await API.getAdConfig();
  AdManager.setup(adConfig);
  if (adConfig && adConfig.enabled) {
    AdManager.renderBanner("typing-ad-bottom", adConfig.publisherId, CONFIG.FALLBACK_ADS.SLOTS.RESULT_BOTTOM);
  }

  try {
    const data = await API.getTypingContent({ mode, category, language, difficulty, duration });
    loaderBox.style.display = "none";
    typingZone.style.display = "block";

    new MonkeyTypingEngine(data, duration);
  } catch (err) {
    loaderBox.innerHTML = `
      <p style="color: var(--error-color); margin-bottom: 12px;">Failed to load content.</p>
      <button class="settings-pill-btn" onclick="location.reload()">Retry</button>
    `;
  }
});
