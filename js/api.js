/**
 * REST API Integration Layer
 * Connects frontend with backend Database Collections
 */

const API = {
  /**
   * সাধারণ Fetch র‍্যাপার উইথ টাইমআউট এবং এরর হ্যান্ডলিং
   * @param {string} endpoint 
   * @returns {Promise<any>}
   */
  async request(endpoint) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // ৮ সেকেন্ড টাইমআউট

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.warn(`API Error on ${endpoint}:`, error.message);
      throw error;
    }
  },

  /**
   * Collection: 'ad_config' -> Document: 'google_adsense' ফেচ করে
   */
  async getAdConfig() {
    try {
      return await this.request("/ad-config/google_adsense");
    } catch (err) {
      // ব্যাকএন্ড ফেইল করলে fallback রিটার্ন করবে
      return CONFIG.FALLBACK_ADS;
    }
  },

  /**
   * টেস্ট অপশনস (ক্যাটাগরি, ল্যাঙ্গুয়েজ, ডিউরেশন) ফেচ করে
   */
  async getTestOptions() {
    try {
      return await this.request("/test-options");
    } catch (err) {
      // API ফেইল করলে ডিফল্ট স্ট্রাকচার
      return {
        durations: CONFIG.FALLBACK_DURATIONS,
        modes: [
          { id: "words", name: "Words (wordAdd)" },
          { id: "paragraph", name: "Paragraph (paragraphAdd)" }
        ],
        difficulties: ["easy", "medium", "hard"],
        languages: [
          { code: "en", name: "English" },
          { code: "bn", name: "বাংলা" }
        ],
        categories: [
          { id: "technology", name: "Technology" }
        ]
      };
    }
  },

  /**
   * টাইপিং কন্টেন্ট ফেচ করে
   * mode = 'words' হলে wordAdd কালেকশন, 'paragraph' হলে paragraphAdd কালেকশন
   * @param {Object} filters - { mode, category, language, difficulty, duration }
   */
  async getTypingContent(filters) {
    const { mode, category, language, difficulty, duration } = filters;
    const collectionName = mode === "paragraph" ? "paragraphAdd" : "wordAdd";
    
    const params = new URLSearchParams({
      collection: collectionName,
      category: category || CONFIG.DEFAULTS.CATEGORY,
      language: language || CONFIG.DEFAULTS.LANGUAGE,
      difficulty: difficulty || CONFIG.DEFAULTS.DIFFICULTY,
      duration: duration || CONFIG.DEFAULTS.DURATION
    });

    try {
      const data = await this.request(`/typing-content?${params.toString()}`);
      
      // স্ট্যাটাস সক্রিয় (status: true) কি না তা ভ্যালিডেট করা
      if (!data || data.status === false || !data.text) {
        throw new Error("No active typing text returned");
      }
      return data;
    } catch (err) {
      // অফলাইন/এরর হলে যাতে অ্যাপ ক্র্যাশ না করে তার জন্য ফেইল-সেফ ফলব্যাক টেক্সট
      return {
        id: "offline_fallback",
        name: "Technology",
        language: language || "en",
        difficulty: difficulty || "easy",
        status: true,
        text: "Technology continues to evolve at a rapid pace transforming how we communicate work and live across the globe."
      };
    }
  }
};
