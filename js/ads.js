/**
 * AdSense Management Layer
 * Integrates with database 'ad_config' and renders responsive safe ads
 */

const AdManager = {
  scriptLoaded: false,

  /**
   * Google AdSense মূল স্ক্রিপ্ট ইনজেক্ট করে
   * @param {string} publisherId
   * @param {boolean} autoAds
   */
  loadAdSenseScript(publisherId, autoAds = true) {
    if (this.scriptLoaded || !publisherId) return;

    const existingScript = document.getElementById("adsense-core-script");
    if (existingScript) {
      this.scriptLoaded = true;
      return;
    }

    const script = document.createElement("script");
    script.id = "adsense-core-script";
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.crossOrigin = "anonymous";

    if (!autoAds) {
      script.setAttribute("data-ad-client", publisherId);
    }

    script.onload = () => {
      this.scriptLoaded = true;
    };

    script.onerror = () => {
      console.warn("AdSense script blocked or network unavailable.");
    };

    document.head.appendChild(script);
  },

  /**
   * নির্দিষ্ট কন্টেইনারে ব্যানার/রেসপন্সিভ অ্যাড বসায়
   * @param {string} containerId - HTML উপাদানের ID
   * @param {string} publisherId - ডেটাবেস থেকে প্রাপ্ত Publisher ID
   * @param {string} slotId - ঐচ্ছিক Ad Slot ID
   */
  renderBanner(containerId, publisherId, slotId = "") {
    const target = document.getElementById(containerId);
    if (!target || !publisherId) return;

    target.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", publisherId);

    if (slotId) {
      ins.setAttribute("data-ad-slot", slotId);
    }
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");

    target.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("AdSense push error:", err);
    }
  },

  /**
   * Database Collection: 'ad_config' Document: 'google_adsense' দিয়ে শুরু করা
   * @param {Object} dbAdConfig
   */
  setup(dbAdConfig) {
    const config = dbAdConfig || CONFIG.FALLBACK_ADS;

    if (!config || !config.enabled) {
      return;
    }

    this.loadAdSenseScript(config.publisherId, config.autoAds);
  }
};
