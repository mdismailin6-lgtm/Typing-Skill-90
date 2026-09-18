/**
 * Global Application Configuration
 * Typing Practice & Test Platform
 */

const CONFIG = {
  // আপনার ব্যাকএন্ড REST API-এর বেস ইউআরএল
  API_BASE_URL: "https://api.yourdomain.com/api",

  // ডিফল্ট টেস্ট সেটিংস (যদি ব্যাকএন্ড রেসপন্স না দেয় বা প্রাথমিক অবস্থার জন্য)
  DEFAULTS: {
    LANGUAGE: "en",
    DIFFICULTY: "easy",
    DURATION: 60, // সেকেন্ড
  },

  // সমর্থিত ডিউরেশন লিস্ট (UI জেনারেশনের জন্য ব্যাকআপ)
  FALLBACK_DURATIONS: [15, 30, 60, 120],

  // Google AdSense কনফিগারেশন
  ADS: {
    ENABLED: false, // ডেভেলপমেন্টে false রাখুন, সাইট লাইভ ও অনুমোদিত হলে true করবেন
    PUBLISHER_ID: "ca-pub-XXXXXXXXXXXXXXXX", // আপনার AdSense Publisher ID
    SLOTS: {
      HOME_TOP: "1234567890",       // হোম পেজের উপরের অ্যাড স্লট আইডি
      RESULT_BOTTOM: "0987654321"   // রেজাল্ট পেজের নিচের অ্যাড স্লট আইডি
    }
  }
};

// কোনো স্ক্রিপ্ট যাতে রানটাইমে অনিচ্ছাকৃতভাবে কনফিগারেশন পরিবর্তন করতে না পারে
Object.freeze(CONFIG);
Object.freeze(CONFIG.DEFAULTS);
Object.freeze(CONFIG.FALLBACK_DURATIONS);
Object.freeze(CONFIG.ADS);
Object.freeze(CONFIG.ADS.SLOTS);
