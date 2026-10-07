// Module quản lý lịch sử tính toán lưu cục bộ (LocalStorage Manager)
import { STORAGE_KEYS, APP_LIMITS } from './config.js';

/**
 * Lưu một lượt tính toán vào lịch sử
 * 
 * @param {object} item - Dữ liệu kết quả tính toán
 * @returns {Array} Danh sách lịch sử cập nhật
 */
export function saveHistoryItem(item) {
  try {
    const history = getHistory();
    const now = new Date();
    const dateFormatted = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

    const record = {
      id: Date.now().toString(),
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

    // Thêm bản ghi mới lên đầu danh sách
    const updated = [record, ...history].slice(0, APP_LIMITS.MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Không thể lưu lịch sử vào localStorage:', e);
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
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Không thể đọc lịch sử từ localStorage:', e);
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
    const history = getHistory().filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return history;
  } catch (e) {
    console.warn('Không thể xóa mục lịch sử:', e);
    return [];
  }
}

/**
 * Xóa toàn bộ lịch sử tính toán
 */
export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    return true;
  } catch (e) {
    console.warn('Không thể xóa toàn bộ lịch sử:', e);
    return false;
  }
}
