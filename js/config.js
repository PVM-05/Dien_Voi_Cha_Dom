// Cấu hình hệ thống biểu giá và tùy chọn ứng dụng (EVN Config)

/**
 * Biểu giá bán lẻ điện sinh hoạt bậc thang tham chiếu
 * Căn cứ: Quyết định số 2941/QĐ-BCT của Bộ Công Thương ban hành ngày 08/11/2023 (áp dụng từ ngày 09/11/2023)
 * Đơn vị: VNĐ/kWh (chưa bao gồm thuế GTGT)
 * 
 * Lưu ý: Đây là biểu giá tham chiếu phục vụ mục đích học thuật / kiểm định phần mềm.
 */
export const DEFAULT_TIERS = [
  { tier: 1, name: 'Bậc 1', from: 0,   to: 50,       price: 1984, desc: 'Cho kWh từ 0 - 50' },
  { tier: 2, name: 'Bậc 2', from: 50,  to: 100,      price: 2050, desc: 'Cho kWh từ 51 - 100' },
  { tier: 3, name: 'Bậc 3', from: 100, to: 200,      price: 2380, desc: 'Cho kWh từ 101 - 200' },
  { tier: 4, name: 'Bậc 4', from: 200, to: 300,      price: 2998, desc: 'Cho kWh từ 201 - 300' },
  { tier: 5, name: 'Bậc 5', from: 300, to: 400,      price: 3350, desc: 'Cho kWh từ 301 - 400' },
  { tier: 6, name: 'Bậc 6', from: 400, to: Infinity,  price: 3460, desc: 'Cho kWh từ 401 trở lên' }
];

/**
 * Các mức thuế suất GTGT (VAT) tham chiếu
 * Căn cứ: Luật Thuế GTGT và các Nghị quyết của Quốc hội về chính sách giảm thuế GTGT
 */
export const VAT_OPTIONS = [
  { rate: 0.08, label: '8% (Mức tham chiếu giảm thuế GTGT)', isDefault: true, desc: 'Theo chính sách kích cầu tiêu dùng' },
  { rate: 0.10, label: '10% (Thuế suất chuẩn theo Luật Thuế GTGT)', desc: 'Thuế suất chuẩn' },
  { rate: 0.00, label: '0% (Miễn thuế GTGT)', desc: 'Đối tượng được miễn thuế' }
];

/**
 * Thông tin văn bản pháp lý tham chiếu
 */
export const LEGAL_REFERENCES = {
  ELECTRICITY_TARIFF: 'Quyết định số 2941/QĐ-BCT (Áp dụng từ 09/11/2023)',
  VAT_POLICY: 'Nghị quyết của Quốc hội về giảm thuế giá trị gia tăng & Luật Thuế GTGT',
  METER_ROUNDING_RULE: 'Nguyên tắc làm tròn số học theo quy định đo đếm điện năng thương phẩm'
};

/**
 * Cấu hình lưu trữ và giới hạn
 */
export const STORAGE_KEYS = {
  HISTORY: 'evn_calc_history_v2',
  PREFERENCES: 'evn_calc_prefs_v2'
};

export const APP_LIMITS = {
  MAX_KWH: 10000000,
  MAX_HISTORY_ITEMS: 8
};
