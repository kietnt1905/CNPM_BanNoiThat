/**
 * Bộ nhớ đệm Client Cache (sessionStorage) với cơ chế Stale-While-Revalidate
 * Giúp tải trang tức thì (0 giây), không xoay loading khi F5 hoặc chuyển trang
 */

const CACHE_PREFIX = 'tk_cache_';

export const cacheHelper = {
  /**
   * Lấy dữ liệu từ cache
   * @param {string} key
   * @returns {any|null}
   */
  get: (key) => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return null;
      const fullKey = CACHE_PREFIX + key;
      const raw = sessionStorage.getItem(fullKey);
      if (!raw) return null;

      const record = JSON.parse(raw);
      // Kiểm tra hạn sử dụng (TTL)
      if (record.expiry && Date.now() > record.expiry) {
        sessionStorage.removeItem(fullKey);
        return null;
      }
      return record.data;
    } catch {
      return null;
    }
  },

  /**
   * Lưu dữ liệu vào cache
   * @param {string} key
   * @param {any} data
   * @param {number} ttlMinutes Thời hạn lưu (mặc định 10 phút)
   */
  set: (key, data, ttlMinutes = 10) => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      const fullKey = CACHE_PREFIX + key;
      const record = {
        data,
        timestamp: Date.now(),
        expiry: ttlMinutes ? Date.now() + ttlMinutes * 60 * 1000 : null,
      };
      sessionStorage.setItem(fullKey, JSON.stringify(record));
    } catch (e) {
      console.warn('[Cache] Không thể ghi vào sessionStorage:', e);
    }
  },

  /**
   * Xóa một key cụ thể
   * @param {string} key
   */
  remove: (key) => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      sessionStorage.removeItem(CACHE_PREFIX + key);
    } catch {}
  },

  /**
   * Xóa toàn bộ cache của hệ thống
   */
  clearAll: () => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return;
      Object.keys(sessionStorage).forEach((k) => {
        if (k.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(k);
        }
      });
    } catch {}
  },
};

export default cacheHelper;
