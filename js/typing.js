/**
 * Monkeytype Style Real-Time Typing Engine with Interactive Modals & Sound
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

// মডাল ও নেভবার ইন্টারঅ্যাকশন কন্ট্রোলার
const ModalController = {
  overlay: null,
  titleEl: null,
  bodyEl: null,

  init() {
    this.overlay = document.getElementById("app-modal-overlay");
    this.titleEl = document.getElementById("modal-title-text");
    this.bodyEl = document.getElementById("modal-content-area");

    const closeBtn = document.getElementById("modal-close-btn");
    if (closeBtn) closeBtn.onclick = () => this.close();

    // ব্যাকড্রপ ক্লিকে ক্লোজ
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) this.close();
    };

    this.bindNavButtons();
  },

  open(title, htmlContent) {
    this.titleEl.innerHTML = title;
    this.bodyEl.innerHTML = htmlContent;
    this.overlay.classList.add("active");
  },

  close() {
    this.overlay.classList.remove("active");
    const ghostInput = document.getElementById("ghost-input");
    if (ghostInput) ghostInput.focus();
  },

  bindNavButtons() {
    // 📊 Stats / History
    document.getElementById("nav-stats-btn").onclick = () => {
      const history = JSON.parse(localStorage.getItem("typing_history") || "[]");
      let content = `<p style="color: var(--sub-color);">Recent Completed Tests:</p>`;
      if (history.length === 0) {
        content += `<p>No test data recorded yet. Complete a test first!</p>`;
      } else {
        content += `<ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px;">`;
        history.slice(-5).reverse().forEach((item, idx) => {
          content += `<li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 4px 0;">
            <span>#${idx + 1} - ${item.wpm} WPM</span>
            <span style="color: var(--main-color);">${item.accuracy}% ACC</span>
          </li>`;
        });
        content += `</ul>`;
      }
      this.open("📊 Performance Stats", content);
    };

    // 🏆 Leaderboard
    document.getElementById("nav-leaderboard-btn").onclick = () => {
      const content = `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; color: var(--sub-color); font-size: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 4px;">
            <span>RANK & USER</span>
            <span>WPM / ACC</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🥇 fast_typer</span>
            <span style="color: var(--main-color);">142 WPM (99%)</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🥈 dev_ninja</span>
            <span style="color: var(--main-color);">128 WPM (98%)</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>🥉 speed_master</span>
            <span style="color: var(--main-color);">115 WPM (96%)</span>
          </div>
        </div>
      `;
      this.open("🏆 Top Typists Leaderboard", content);
    };

    // ℹ️ About
    document.getElementById("nav-about-btn").onclick = () => {
      const content = `
        <p>A minimalist, ultra-fast typing speed and practice tool built for focus.</p>
        <p style="color: var(--sub-color); font-size: 0.85rem;">Inspired by the clean aesthetic of Monkeytype. Designed for zero latency and accurate metrics tracking.</p>
      `;
      this.open("ℹ️ About TypeSpeed", content);
    };

    // 🔔 Notifications
    document.getElementById("nav-notif-btn").onclick = () => {
      const content = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <strong style="color: var(--main-color);">New Update Available!</strong>
            <p style="color: var(--sub-color); font-size: 0.8rem;">Minimalist audio feedback & quick settings bar are now live.</p>
          </div>
        </div>
      `;
      this.open("🔔 Notifications", content);
    };

    // 👤 Profile
    document.getElementById("nav-profile-btn").onclick = () => {
      const guestName = localStorage.getItem("typer_username") || "Guest Typist";
      const content = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="setting-row">
            <span>Username:</span>
            <strong style="color: var(--main-color);">${guestName}</strong>
          </div>
          <div class="setting-row">
            <span>Session Status:</span>
            <span>Active (Local Storage)</span>
          </div>
        </div>
      `;
      this.open("👤 User Profile", content);
    };

    // ⚙ Test Settings (Direct in-page popup)
    document.getElementById("nav-settings-btn").onclick = () => {
      const soundState = CONFIG.SOUND.ENABLED ? "ON" : "OFF";
      const content = `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div class="setting-row">
            <span>Sound Effects:</span>
            <button type="button" id="toggle-sound-btn" class="setting-toggle-btn ${CONFIG.SOUND.ENABLED ? 'on' : ''}">${soundState}</button>
          </div>
          <div class="setting-row">
            <span>Go to Full Options:</span>
            <a href="index.html" class="setting-toggle-btn" style="text-decoration: none;">Open Setup Page</a>
          </div>
        </div>
      `;
      this.open("⚙ Test Settings", content);

      // সাউন্ড টগল ক্লিক লজিক
      const toggleBtn = document.getElementById("toggle-sound-btn");
      if (toggleBtn) {
        toggleBtn.onclick = () => {
          CONFIG.SOUND.ENABLED = !CONFIG.SOUND.ENABLED;
          toggleBtn.textContent = CONFIG.SOUND.ENABLED ? "ON" : "OFF";
          toggleBtn.classList.toggle("on", CONFIG.SOUND.ENABLED);
        };
      }
    };
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
    document.addEventListener("click", (e) => {
      // মডালে ক্লিক করলে যেন ইনপুট জোর করে ফোকাস না হয়
      if (!e.target.closest(".modal-box") && !e.target.closest(".top-nav") && !e.target.closest(".settings-pill-btn")) {
        SoundFX.init();
        this.input.focus();
      }
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

    // লোকাল স্টোরেজে ইউজারের টেস্ট হিস্ট্রি সেভ করা
    const history = JSON.parse(localStorage.getItem("typing_history") || "[]");
    history.push(resultSummary);
    localStorage.setItem("typing_history", JSON.stringify(history));

    sessionStorage.setItem("typing_results", JSON.stringify(resultSummary));
    window.location.href = "result.html";
  }
}

// ইনিশিয়ালাইজেশন
document.addEventListener("DOMContentLoaded", async () => {
  ModalController.init();

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
