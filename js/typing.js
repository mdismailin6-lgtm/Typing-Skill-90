/**
 * Core Typing Engine
 * Handles character-by-character comparison, timer, WPM & Accuracy calculation
 */

class TypingEngine {
  constructor(contentData, duration) {
    this.text = (contentData.text || "").trim();
    this.totalDuration = parseInt(duration, 10);
    this.remainingTime = this.totalDuration;

    this.timer = null;
    this.isStarted = false;
    this.charIndex = 0;
    this.correctChars = 0;
    this.incorrectChars = 0;

    // DOM Elements
    this.textStream = document.getElementById("text-stream");
    this.input = document.getElementById("hidden-key-input");
    this.timerDisplay = document.getElementById("val-timer");
    this.wpmDisplay = document.getElementById("val-wpm");
    this.accuracyDisplay = document.getElementById("val-accuracy");
    this.surfaceBox = document.getElementById("surface-box");

    this.init();
  }

  init() {
    this.timerDisplay.textContent = `${this.remainingTime}s`;
    this.renderTextSpans();

    // বক্সের যেকোনো জায়গায় ক্লিক করলে ইনপুটে ফোকাস ধরে রাখবে
    this.surfaceBox.addEventListener("click", () => this.input.focus());
    this.input.addEventListener("input", (e) => this.handleTyping(e));

    // অটো-ফোকাস
    this.input.focus();
  }

  renderTextSpans() {
    this.textStream.innerHTML = "";
    this.text.split("").forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.textContent = char;
      if (index === 0) span.classList.add("current");
      this.textStream.appendChild(span);
    });
  }

  startCountdown() {
    this.isStarted = true;
    this.timer = setInterval(() => {
      this.remainingTime--;
      this.timerDisplay.textContent = `${this.remainingTime}s`;
      this.calculateMetrics();

      if (this.remainingTime <= 0) {
        this.completeTest();
      }
    }, 1000);
  }

  handleTyping(e) {
    if (!this.isStarted) {
      this.startCountdown();
    }

    const currentInput = e.target.value;
    const expectedChar = this.text[this.charIndex];
    const charElements = this.textStream.children;
    const currentCharSpan = charElements[this.charIndex];

    if (!expectedChar) {
      this.completeTest();
      return;
    }

    // টাইপ করা লেটেস্ট ক্যারেক্টার যাচাই
    const typedChar = currentInput.slice(-1);

    if (typedChar === expectedChar) {
      currentCharSpan.classList.add("correct");
      this.correctChars++;
    } else {
      currentCharSpan.classList.add("incorrect");
      this.incorrectChars++;
    }

    currentCharSpan.classList.remove("current");
    this.charIndex++;

    // পরবর্তী ক্যারেক্টারে কার্সার মুভ করা
    if (this.charIndex < this.text.length) {
      charElements[this.charIndex].classList.add("current");
    } else {
      this.completeTest();
      return;
    }

    this.calculateMetrics();
  }

  calculateMetrics() {
    const timeSpent = this.totalDuration - this.remainingTime;
    const minutes = timeSpent > 0 ? timeSpent / 60 : 1 / 60;

    // আন্তর্জাতিক স্ট্যান্ডার্ড ফর্মুলা: (সঠিক ক্যারেক্টার / ৫) / মোট মিনিট
    const wpm = Math.round((this.correctChars / 5) / minutes) || 0;

    const totalTyped = this.correctChars + this.incorrectChars;
    const accuracy = totalTyped > 0
      ? ((this.correctChars / totalTyped) * 100).toFixed(1)
      : 100;

    this.wpmDisplay.textContent = wpm;
    this.accuracyDisplay.textContent = `${accuracy}%`;
  }

  completeTest() {
    clearInterval(this.timer);
    this.input.disabled = true;

    const timeSpent = this.totalDuration - this.remainingTime || this.totalDuration;
    const minutes = timeSpent / 60;
    const finalWpm = Math.round((this.correctChars / 5) / minutes) || 0;
    const totalTyped = this.correctChars + this.incorrectChars;
    const finalAccuracy = totalTyped > 0
      ? ((this.correctChars / totalTyped) * 100).toFixed(1)
      : 100;

    // রেজাল্ট অবজেক্ট তৈরি
    const resultSummary = {
      wpm: finalWpm,
      accuracy: finalAccuracy,
      correctChars: this.correctChars,
      incorrectChars: this.incorrectChars,
      totalChars: this.text.length,
      typedChars: totalTyped,
      typedWords: Math.round(this.correctChars / 5),
      duration: timeSpent
    };

    // রেজাল্ট ব্রাউজারের Session-এ সংরক্ষণ করে রিডাইরেক্ট
    sessionStorage.setItem("typing_results", JSON.stringify(resultSummary));
    window.location.href = "result.html";
  }
}

// পেজ রেডি হলে কন্ট্রোল স্টার্ট করা
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || CONFIG.DEFAULTS.MODE;
  const duration = urlParams.get("duration") || CONFIG.DEFAULTS.DURATION;
  const difficulty = urlParams.get("difficulty") || CONFIG.DEFAULTS.DIFFICULTY;
  const language = urlParams.get("language") || CONFIG.DEFAULTS.LANGUAGE;
  const category = urlParams.get("category") || CONFIG.DEFAULTS.CATEGORY;

  const loaderBox = document.getElementById("loader-box");
  const typingZone = document.getElementById("typing-zone");

  try {
    const data = await API.getTypingContent({ mode, category, language, difficulty, duration });

    // কন্টেন্ট রেন্ডার
    loaderBox.style.display = "none";
    typingZone.style.display = "flex";

    new TypingEngine(data, duration);
  } catch (err) {
    loaderBox.innerHTML = `
      <p style="color: var(--char-incorrect); margin-bottom: 16px;">
        Unable to load typing content. Please try again.
      </p>
      <button class="btn-primary" onclick="location.reload()">Retry</button>
    `;
  }
});
