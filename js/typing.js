/**
 * Monkeytype Style Real-Time Typing Engine
 * Supports space-delimited words, accurate metrics & quick restart
 */

class MonkeyTypingEngine {
  constructor(contentData, duration) {
    this.rawText = (contentData.text || "").trim();
    this.wordsList = this.rawText.split(/\s+/);
    this.totalDuration = parseInt(duration, 10);
    this.remainingTime = this.totalDuration;

    this.timer = null;
    this.isStarted = false;
    this.currentWordIdx = 0;
    this.currentCharIdx = 0;

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
    // মোবাইল স্ক্রল প্রিভেনশন ও ফোকাস নিশ্চিত করা
    document.addEventListener("click", () => this.input.focus());
  }

  setupListeners() {
    this.input.value = "";
    this.input.addEventListener("input", (e) => this.handleInput(e));
    this.restartBtn.addEventListener("click", () => location.reload());

    // Tab + Enter দিয়ে কুইক রিস্টার্ট (স্ক্রিনশটের মতো)
    window.addEventListener("keydown", (e) => {
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

    // স্পেস চাপলে পরের শব্দে জাম্প করা
    if (inputValue.endsWith(" ")) {
      if (inputValue.trim().length > 0) {
        this.moveToNextWord();
      }
      this.input.value = "";
      return;
    }

    const charElements = currentWordEl.children;
    const typedLen = inputValue.length;

    // কারেন্ট ক্যারেক্টার ও ভুল/সঠিক ভ্যালিডেশন
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

    // কার্সার ইন্ডিকেটর আপডেট
    if (typedLen < targetWord.length) {
      charElements[typedLen].classList.add("current");
    }

    this.currentCharIdx = typedLen;
  }

  moveToNextWord() {
    const currentWordEl = this.wordsWrapper.children[this.currentWordIdx];
    const targetWord = this.wordsList[this.currentWordIdx];
    const typedWord = this.input.value.trim();

    // শব্দের স্ট্যাটাস গণনা
    for (let i = 0; i < targetWord.length; i++) {
      if (i < typedWord.length && typedWord[i] === targetWord[i]) {
        this.correctChars++;
      } else {
        this.incorrectChars++;
      }
    }

    // স্পেসের জন্য ১টি সঠিক কাউন্ট যোগ করা
    this.correctChars++;

    // কার্সার রিমুভ ও নেক্সট ওয়ার্ড সিলেক্ট
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

  // AdSense ব্যানার হ্যান্ডলিং (নিচের নিরাপদ স্লটে)
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
