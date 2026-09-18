/**
 * AdSense Integration & Management Layer
 * Handles ad injection and lifecycle without breaking typing UX
 */

const AdManager = {
  isInitialized: false,

  /**
   * AdSense Script ইনজেক্ট করে ব্রাউজারে
   * @param {string} publisherId - 'ca-pub-XXXXXXXXXXXX'
   * @param {boolean} autoAds - Auto ads চালু থাকবে কি না
   */
  loadScript(publisherId, autoAds = true) {
    if (this.isInitialized || !publisherId) return;

    const existingScript = document.getElementById("adsense-core-script");
    if (existingScript) {
      this.isInitialized = true;
      return;
    }

    const script = document.createElement("script");
    script.id = "adsense-core-script";
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.crossOrigin = "anonymous";

    // Auto Ads কনফিগারেশন
    if (!autoAds) {
      script.setAttribute("data-ad-client", publisherId);
    }

    script.onload = () => {
      this.isInitialized = true;
      console.log("AdSense loaded successfully.");
    };

    script.onerror = () => {
      console.warn("AdSense failed to load (AdBlocker active or network error).");
    };

    document.head.appendChild(script);
  },

  /**
   * নির্দিষ্ট কন্টেইনারে অ্যাড ইউনিট রেন্ডার করা
   * @param {string} containerId - HTML div ID
   * @param {string} publisherId - AdSense Publisher ID
   * @param {string} slotId - Unit Slot ID (ঐচ্ছিক)
   */
  renderSlot(containerId, publisherId, slotId = "") {
    const container = document.getElementById(containerId);
    if (!container || !publisherId) return;

    // পূর্বের কোনো ফাঁকা বা ভুল কনটেন্ট মুছে ফেলা
    container.innerHTML = "";

    const ins = document.createElement("ins");
    ins.className = "adsbygoogle";
    ins.style.display = "block";
    ins.setAttribute("data-ad-client", publisherId);

    if (slotId) {
      ins.setAttribute("data-ad-slot", slotId);
    }
    ins.setAttribute("data-ad-format", "auto");
    ins.setAttribute("data-full-width-responsive", "true");

    container.appendChild(ins);

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.warn("Ad unit push error:", err);
    }
  },

  /**
   * ad_config ডেটাবেস রেকর্ড অনুযায়ী সম্পূর্ণ সিস্টেম শুরু করা
   * @param {Object} adConfig - Collection: ad_config / Document: google_adsense
   */
  initFromConfig(adConfig) {
    if (!adConfig || !adConfig.enabled) {
      console.log("Ads are disabled by database configuration.");
      return;
    }

    this.loadScript(adConfig.publisherId, adConfig.autoAds);
  }
};
