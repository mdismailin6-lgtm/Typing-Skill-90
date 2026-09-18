/**
 * Global Configuration File
 * Typing Website Platform
 */

const CONFIG = {
  // আপনার ব্যাকএন্ড REST API-এর বেস ইউআরএল
  API_BASE_URL: "https://api.yourdomain.com/api",

  // ডিফল্ট টেস্ট সেটিংস (প্রাথমিক লোডিং ও ফলব্যাকের জন্য)
  DEFAULTS: {
    MODE: "words",          // 'words' (wordAdd) অথবা 'paragraph' (paragraphAdd)
    CATEGORY: "technology", // কালেকশনের Document ID
    LANGUAGE: "en",         // ভাষা কোড
    DIFFICULTY: "easy",     // easy, medium, hard
    DURATION: 60            // সেকেন্ডে ডিউরেশন
  },

  // সাউন্ড সেটিংস
  SOUND: {
    ENABLED: true,          // সাউন্ড অন/অফ
    VOLUME: 0.15            // ভলিউম লেভেল (০.০ থেকে ১.০)
  },

  // সমর্থিত টেস্ট ডিউরেশন (API লোড না হলে ফলব্যাক হিসেবে ব্যবহৃত হবে)
  FALLBACK_DURATIONS: [15, 30, 60, 120],

  // Google AdSense স্ট্যাটিক ব্যাকআপ (ডেটাবেসের ad_config ফেচ ফেইল করলে কার্যকর হবে)
  FALLBACK_ADS: {
    ENABLED: false,
    PUBLISHER_ID: "ca-pub-XXXXXXXXXXXXXXXX",
    AUTO_ADS: true,
    SLOTS: {
      HOME_TOP: "1234567890",
      RESULT_BOTTOM: "0987654321"
    }
  }
};

// গ্লোবালি কনফিগারেশন ডেটা অপরিবর্তনীয় রাখা হলো
Object.freeze(CONFIG);
Object.freeze(CONFIG.DEFAULTS);
Object.freeze(CONFIG.SOUND);
Object.freeze(CONFIG.FALLBACK_DURATIONS);
Object.freeze(CONFIG.FALLBACK_ADS);
Object.freeze(CONFIG.FALLBACK_ADS.SLOTS);
