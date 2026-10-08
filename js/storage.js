// Module quản lý lịch sử tính toán lưu cục bộ (LocalStorage Manager)
import { STORAGE_KEYS, APP_LIMITS } from './config.js';

// Bộ nhớ đệm tạm thời (In-memory fallback khi môi trường không có localStorage, ví dụ CLI / Node.js)
const memoryStore = new Map();

/**
 * Lấy đối tượng storage an toàn
 */
function getStorageEngine() {
  try {
    if (typeof globalThis !== 'undefined' && globalThis.localStorage) {
      // Kiểm tra thực tế xem localStorage có hoạt động không (tránh lỗi Safari Private Mode)
      const testKey = '__storage_test__';
      globalThis.localStorage.setItem(testKey, testKey);
      globalThis.localStorage.removeItem(testKey);
      return globalThis.localStorage;
    }
  } catch (e) {
    // Không truy cập được localStorage
  }

  return {
    getItem: (key) => (memoryStore.has(key) ? memoryStore.get(key) : null),
    setItem: (key, val) => { memoryStore.set(key, String(val)); },
    removeItem: (key) => { memoryStore.delete(key); },
    clear: () => { memoryStore.clear(); }
  };
}

/**
 * Lưu một lượt tính toán vào lịch sử
 * 
 * @param {object} item - Dữ liệu kết quả tính toán
 * @returns {Array} Danh sách lịch sử cập nhật
 */
export function saveHistoryItem(item) {
  try {
    const storage = getStorageEngine();
    const history = getHistory();
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    const record = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      timestamp: now.toISOString(),
      dateFormatted,
      calculationType: item.calculationType || 'meter',
      oldIndex: item.oldIndex !== undefined ? item.oldIndex : null,
      newIndex: item.newIndex !== undefined ? item.newIndex : null,
      kwh: item.kwh,
      totalAmount: item.totalAmount,
      subtotal: item.subtotal,
      vatAmount: item.vatAmount,
      vatRate: item.vatRate
    };

    // Thêm bản ghi mới lên đầu danh sách và giới hạn số lượng tối đa
    const updated = [record, ...history].slice(0, APP_LIMITS.MAX_HISTORY_ITEMS);
    storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Không thể lưu lịch sử:', e);
    return [];
  }
}

/**
 * Lấy danh sách lịch sử tính toán
 * 
 * @returns {Array} Danh sách các bản ghi lịch sử
 */
export function getHistory() {
  try {
    const storage = getStorageEngine();
    const raw = storage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Không thể đọc lịch sử:', e);
    return [];
  }
}

/**
 * Xóa một bản ghi trong lịch sử theo ID
 * 
 * @param {string} id - ID bản ghi
 * @returns {Array} Danh sách sau khi xóa
 */
export function removeHistoryItem(id) {
  try {
    const storage = getStorageEngine();
    const history = getHistory().filter(item => item.id !== id);
    storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.warn('Không thể xóa mục lịch sử:', e);
    return [];
  }
}

/**
 * Xóa toàn bộ lịch sử tính toán
 * 
 * @returns {boolean} Kết quả xóa
 */
export function clearAllHistory() {
  try {
    const storage = getStorageEngine();
    storage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (e) {
    console.warn('Không thể xóa toàn bộ lịch sử:', e);
    return false;
  }
}
