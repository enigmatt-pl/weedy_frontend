import { apiClient } from './api';

/**
 * Fuzzes an analytics payload to obscure it from network inspection.
 * @param {Object} data - The raw analytics data object to send.
 * @returns {string} - The fuzzed payload string.
 */
function fuzzPayload(data: unknown): string {
  // 1. Convert to JSON string
  const jsonString = JSON.stringify(data);
  
  // 2. Base64 encode the string
  // Note: For characters outside the Latin1 range, consider using a UTF-8 aware encode
  const base64Encoded = btoa(unescape(encodeURIComponent(jsonString))); 
  
  // 3. Reverse the string
  return base64Encoded.split('').reverse().join('');
}

export interface PageViewPayload {
  // Metadata
  visitor_id: string;
  // Navigation
  path: string;
  referrer: string;
  // Browser & OS
  user_agent: string;
  browser_name: string;
  browser_version: string;
  os_name: string;
  os_version: string;
  // Locale
  language: string;
  languages: string;
  timezone: string;
  timezone_offset_minutes: number;
  // Display
  screen_width: number;
  screen_height: number;
  screen_color_depth: number;
  screen_orientation: string;
  device_pixel_ratio: number;
  viewport_width: number;
  viewport_height: number;
  // Connection & Battery
  connection_type?: string;
  connection_effective_type?: string;
  connection_downlink_mbps?: number;
  connection_rtt_ms?: number;
  battery_level?: number;
  battery_charging?: boolean;
  // Hardware hints
  hardware_concurrency: number;
  device_memory_gb?: number;
  max_touch_points: number;
  gpu_vendor?: string;
  gpu_renderer?: string;
  cpu_architecture?: string;
  device_model?: string;
  platform?: string;
  vendor?: string;
  // Session
  page_title: string;
  session_storage_available: boolean;
  local_storage_available: boolean;
  cookies_enabled: boolean;
  // User prefs
  color_scheme: 'light' | 'dark' | 'unknown';
  prefers_reduced_motion?: boolean;
  prefers_high_contrast?: boolean;
  prefers_forced_colors?: boolean;
  // Privacy & Security
  do_not_track: string | null;
  is_bot?: boolean;
  is_in_app_browser?: boolean;
  pdf_viewer_enabled?: boolean;
  save_data?: boolean;
  // Misc
  js_heap_size_mb?: number;
  storage_quota_mb?: number;
  storage_usage_mb?: number;
  // Performance Vitals
  perf_fcp_ms?: number;
  perf_lcp_ms?: number;
  perf_ttfb_ms?: number;
  perf_dom_load_ms?: number;
  perf_page_load_ms?: number;
  // Engagement
  scroll_depth_pct?: number;
  scroll_milestones?: string;
  time_on_page_sec?: number;
  click_count?: number;
  exit_intent?: boolean;
}

/** Best-effort browser + OS parser from the User-Agent string */
const parseUA = (ua: string): { browser: [string, string]; os: [string, string] } => {
  let browserName = 'Unknown';
  let browserVersion = '';
  let osName = 'Unknown';
  let osVersion = '';

  // Browser detection order matters (Edge before Chrome, etc.)
  if (/Edg\/([0-9.]+)/.test(ua)) {
    browserName = 'Edge'; browserVersion = RegExp.$1;
  } else if (/OPR\/([0-9.]+)/.test(ua) || /Opera\/([0-9.]+)/.test(ua)) {
    browserName = 'Opera'; browserVersion = RegExp.$1;
  } else if (/Firefox\/([0-9.]+)/.test(ua)) {
    browserName = 'Firefox'; browserVersion = RegExp.$1;
  } else if (/Chrome\/([0-9.]+)/.test(ua)) {
    browserName = 'Chrome'; browserVersion = RegExp.$1;
  } else if (/Version\/([0-9.]+).*Safari/.test(ua)) {
    browserName = 'Safari'; browserVersion = RegExp.$1;
  } else if (/MSIE ([0-9.]+)/.test(ua) || /Trident.*rv:([0-9.]+)/.test(ua)) {
    browserName = 'IE'; browserVersion = RegExp.$1;
  }

  // OS detection
  if (/Windows NT ([0-9.]+)/.test(ua)) {
    osName = 'Windows';
    const map: Record<string, string> = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
    osVersion = map[RegExp.$1] || RegExp.$1;
  } else if (/Mac OS X ([0-9_]+)/.test(ua)) {
    osName = 'macOS'; osVersion = RegExp.$1.replace(/_/g, '.');
  } else if (/Android ([0-9.]+)/.test(ua)) {
    osName = 'Android'; osVersion = RegExp.$1;
  } else if (/iPhone OS ([0-9_]+)/.test(ua) || /iPad; CPU OS ([0-9_]+)/.test(ua)) {
    osName = 'iOS'; osVersion = RegExp.$1.replace(/_/g, '.');
  } else if (/Linux/.test(ua)) {
    osName = 'Linux'; osVersion = '';
  }

  return { browser: [browserName, browserVersion], os: [osName, osVersion] };
};

/** Safely read navigator.connection (experimental, not available everywhere) */
const getConnection = (): Partial<PageViewPayload> => {
  const nav = navigator as Navigator & { connection?: { type?: string; effectiveType?: string; downlink?: number; rtt?: number } };
  const conn = nav.connection;
  if (!conn) return {};
  return {
    connection_type: conn.type ?? undefined,
    connection_effective_type: conn.effectiveType ?? undefined,
    connection_downlink_mbps: conn.downlink ?? undefined,
    connection_rtt_ms: conn.rtt ?? undefined,
  };
};

/** Safely check storage availability */
const storageAvailable = (type: 'localStorage' | 'sessionStorage'): boolean => {
  try {
    const s = window[type];
    const key = '__test__';
    s.setItem(key, '1');
    s.removeItem(key);
    return true;
  } catch {
    return false;
  }
};

/** Extracts GPU information using WebGL */
const getGPUInfo = (): { vendor?: string; renderer?: string } => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return {};
    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return {};
    return {
      vendor: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    };
  } catch {
    return {};
  }
};

/** Extracts battery status */
const getBatteryInfo = async (): Promise<{ level?: number; charging?: boolean }> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav.getBattery) {
      const b = await nav.getBattery();
      return { level: b.level, charging: b.charging };
    }
    return {};
  } catch {
    return {};
  }
};

/** Approximate JS heap usage (Chrome only) */
const getHeapMB = (): number | undefined => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const perf = performance as any;
  if (perf?.memory?.usedJSHeapSize) {
    return Math.round(perf.memory.usedJSHeapSize / 1024 / 1024);
  }
  return undefined;
};

/** Extracts storage estimation */
const getStorageInfo = async (): Promise<{ quota?: number; usage?: number }> => {
  try {
    if (navigator.storage?.estimate) {
      const { quota, usage } = await navigator.storage.estimate();
      return {
        quota: quota ? Math.round(quota / 1024 / 1024) : undefined,
        usage: usage ? Math.round(usage / 1024 / 1024) : undefined
      };
    }
    return {};
  } catch {
    return {};
  }
};

/** Detects preferred color scheme */
const getColorScheme = (): 'light' | 'dark' | 'unknown' => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
  return 'unknown';
};

/** Persistent visitor identifier stored in localStorage */
const getVisitorId = (): string => {
  const KEY = 'weedy_visitor_id';
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
};

/** Extracts high-entropy client hints if available */
const getClientHints = async (): Promise<{ architecture?: string; model?: string }> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    if (nav.userAgentData?.getHighEntropyValues) {
      const hints = await nav.userAgentData.getHighEntropyValues(['architecture', 'model', 'platformVersion', 'uaFullVersion']);
      return { architecture: hints.architecture, model: hints.model };
    }
    return {};
  } catch {
    return {};
  }
};

/** Collects User Preference signals */
const getUserPreferences = () => ({
  prefers_reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  prefers_high_contrast: window.matchMedia('(prefers-contrast: more)').matches,
  prefers_forced_colors: window.matchMedia('(forced-colors: active)').matches,
});

/** Privacy & Security audit signals */
const getPrivacySignals = () => {
  const ua = navigator.userAgent;
  // Common in-app browser signals (FB, Instagram, TikTok, Line, WeChat)
  const inAppPattern = /FBAN|FBAV|Instagram|TikTok|Line\/|MicroMessenger|LinkedInApp|Snapchat/i;
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    is_bot: !!(navigator as any).webdriver,
    is_in_app_browser: inAppPattern.test(ua),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdf_viewer_enabled: !!(navigator as any).pdfViewerEnabled,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    save_data: !!((navigator as any).connection?.saveData),
  };
};

/** Collects real performance vitals via PerformanceObserver */
const getPerformanceVitals = (): Promise<{ fcp?: number; lcp?: number; ttfb?: number; dom_load?: number; page_load?: number }> => {
  return new Promise((resolve) => {
    try {
      const vitals: { fcp?: number; lcp?: number; ttfb?: number; dom_load?: number; page_load?: number } = {};

      // TTFB & DOM/Page load from Navigation Timing API
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        vitals.ttfb = Math.round(nav.responseStart - nav.requestStart);
        vitals.dom_load = Math.round(nav.domContentLoadedEventEnd - nav.startTime);
        vitals.page_load = Math.round(nav.loadEventEnd - nav.startTime);
      }

      // FCP from Paint Timing
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry) vitals.fcp = Math.round(fcpEntry.startTime);

      // LCP via PerformanceObserver (async — wait up to 3s)
      let lcpResolved = false;
      const finish = () => { if (!lcpResolved) { lcpResolved = true; resolve(vitals); } };

      if ('PerformanceObserver' in window) {
        try {
          const po = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const last = entries[entries.length - 1];
            vitals.lcp = Math.round(last.startTime);
          });
          po.observe({ type: 'largest-contentful-paint', buffered: true });
          setTimeout(() => { po.disconnect(); finish(); }, 3000);
        } catch { finish(); }
      } else {
        finish();
      }
    } catch {
      resolve({});
    }
  });
};

export const AnalyticsService = {
  /**
   * Fire a page view event. Call this on every route change.
   * Silently ignores errors — never disrupts the user experience.
   */
  trackPageView: async (path: string): Promise<void> => {
    const ua = navigator.userAgent;
    const { browser, os } = parseUA(ua);
    const gpu = getGPUInfo();
    const battery = await getBatteryInfo();
    const storage = await getStorageInfo();
    const hints = await getClientHints();

    const payload: PageViewPayload = {
      visitor_id: getVisitorId(),
      // Navigation
      path,
      referrer: document.referrer || '',
      // Browser & OS
      user_agent: ua,
      browser_name: browser[0],
      browser_version: browser[1],
      os_name: os[0],
      os_version: os[1],
      // Locale
      language: navigator.language,
      languages: navigator.languages?.join(',') ?? navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezone_offset_minutes: -new Date().getTimezoneOffset(), // positive = ahead of UTC
      // Display
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      screen_color_depth: window.screen.colorDepth,
      screen_orientation: window.screen.orientation?.type ?? 'unknown',
      device_pixel_ratio: window.devicePixelRatio ?? 1,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      // Hardware hints
      hardware_concurrency: navigator.hardwareConcurrency ?? 0,
      device_memory_gb: (navigator as { deviceMemory?: number }).deviceMemory ?? undefined,
      max_touch_points: navigator.maxTouchPoints ?? 0,
      gpu_vendor: gpu.vendor,
      gpu_renderer: gpu.renderer,
      cpu_architecture: hints.architecture,
      device_model: hints.model,
      platform: navigator.platform,
      vendor: navigator.vendor,
      // Connection & Battery
      ...getConnection(),
      battery_level: battery.level,
      battery_charging: battery.charging,
      // Session
      page_title: document.title,
      session_storage_available: storageAvailable('sessionStorage'),
      local_storage_available: storageAvailable('localStorage'),
      cookies_enabled: navigator.cookieEnabled,
      // User prefs
      color_scheme: getColorScheme(),
      ...getUserPreferences(),
      // Privacy & Security
      do_not_track: navigator.doNotTrack ?? null,
      ...getPrivacySignals(),
      // Misc
      js_heap_size_mb: getHeapMB(),
      storage_quota_mb: storage.quota,
      storage_usage_mb: storage.usage,
    };

    // Collect performance vitals after page settles (non-blocking)
    try {
      const vitals = await getPerformanceVitals();
      if (vitals.fcp) payload.perf_fcp_ms = vitals.fcp;
      if (vitals.lcp) payload.perf_lcp_ms = vitals.lcp;
      if (vitals.ttfb) payload.perf_ttfb_ms = vitals.ttfb;
      if (vitals.dom_load) payload.perf_dom_load_ms = vitals.dom_load;
      if (vitals.page_load) payload.perf_page_load_ms = vitals.page_load;
    } catch { /* silently ignore */ }

    try {
      const user = import.meta.env.VITE_ANALYTICS_USER_ID;
      const pass = import.meta.env.VITE_ANALYTICS_SECRET_KEY;

      if (!user || !pass) {
        console.warn('Analytics: Missing VITE_ANALYTICS_USER_ID or VITE_ANALYTICS_SECRET_KEY. Skipping tracking.');
        return;
      }

      const headers: Record<string, string> = {
        'Authorization': `Basic ${btoa(`${user}:${pass}`)}`
      };

      await apiClient.post('health/ping', { pd: fuzzPayload(payload) }, { headers });
    } catch {
      // Silently fail — analytics must never break the app
    }
  },

  /**
   * Track a generic event (e.g. click, impression).
   */
  trackEvent: async (category: string, action: string, label?: string, value?: number): Promise<void> => {
    const payload = {
      visitor_id: getVisitorId(),
      path: window.location.pathname,
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString()
    };

    try {
      const user = import.meta.env.VITE_ANALYTICS_USER_ID;
      const pass = import.meta.env.VITE_ANALYTICS_SECRET_KEY;

      if (!user || !pass) return;

      const headers: Record<string, string> = {
        'Authorization': `Basic ${btoa(`${user}:${pass}`)}`
      };

      await apiClient.post('health/pulse', { pd: fuzzPayload(payload) }, { headers });
    } catch {
      // Silently fail
    }
  }
};

/**
 * Initialises engagement tracking for a single page view.
 * Tracks scroll depth, time on page, click count, and exit intent.
 * Sends via sendBeacon (+ keepalive fetch fallback) on tab close / route change.
 * Returns a cleanup function — call it on next route change.
 */
export const initEngagementTracking = (visitorId: string, path: string): (() => void) => {
  const startTime = Date.now();
  let maxScrollDepth = 0;
  const milestones = new Set<number>();
  let clickCount = 0;
  let exitIntent = false;
  let sent = false;

  const sendEngagement = () => {
    if (sent) return;
    sent = true;

    const user = import.meta.env.VITE_ANALYTICS_USER_ID;
    const pass = import.meta.env.VITE_ANALYTICS_SECRET_KEY;
    if (!user || !pass) return;

    const timeOnPage = Math.round((Date.now() - startTime) / 1000);
    const rawEngagementData = {
      visitor_id: visitorId,
      path,
      scroll_depth_pct: maxScrollDepth,
      scroll_milestones: Array.from(milestones).sort((a, b) => a - b).join(','),
      time_on_page_sec: timeOnPage,
      click_count: clickCount,
      exit_intent: exitIntent,
    };
    
    const body = JSON.stringify({
      pd: fuzzPayload(rawEngagementData)
    });

    const apiBase = `${import.meta.env.VITE_API_URL || ''}/api/v1`;
    const auth = btoa(`${user}:${pass}`);
    const url = `${apiBase}/health/pulse`;

    // sendBeacon is the only reliable method when the tab is closing
    // It doesn't support custom headers, so we pass auth as query param
    const sent1 = navigator.sendBeacon?.(
      `${url}?_auth=${encodeURIComponent(auth)}`,
      new Blob([body], { type: 'application/json' })
    );

    // Fallback: keepalive fetch (supported in modern browsers)
    if (!sent1) {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Basic ${auth}` },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  };

  // Scroll depth tracking
  const onScroll = () => {
    const el = document.documentElement;
    const pct = Math.round(((el.scrollTop + el.clientHeight) / el.scrollHeight) * 100);
    if (pct > maxScrollDepth) maxScrollDepth = Math.min(pct, 100);
    [25, 50, 75, 100].forEach(m => { if (pct >= m) milestones.add(m); });
  };

  // Click tracking
  const onClick = () => { clickCount++; };

  // Exit intent — mouse leaves viewport upward
  const onMouseLeave = (e: MouseEvent) => { if (e.clientY <= 0) exitIntent = true; };

  // Flush on tab hide or close
  const onVisibilityChange = () => { if (document.visibilityState === 'hidden') sendEngagement(); };
  const onPageHide = () => sendEngagement();

  document.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onClick, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', onPageHide);

  // Cleanup — removes all listeners and flushes data on route change
  return () => {
    sendEngagement();
    document.removeEventListener('scroll', onScroll);
    document.removeEventListener('click', onClick);
    document.removeEventListener('mouseleave', onMouseLeave);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', onPageHide);
  };
};
