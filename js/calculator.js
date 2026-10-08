// Module tính toán tiền điện - Core Business Logic
import { DEFAULT_TIERS, APP_LIMITS } from './config.js';

export { DEFAULT_TIERS };

/**
 * Kiểm tra tính hợp lệ của đầu vào công tơ (Input Validation)
 * Phục vụ cho tính theo cặp chỉ số (Cũ - Mới)
 * 
 * @param {any} oldIdx - Chỉ số cũ
 * @param {any} newIdx - Chỉ số mới
 * @returns {{ isValid: boolean, error?: string, code?: string, oldIndex?: number, newIndex?: number }}
 */
export function validateInput(oldIdx, newIdx) {
  // 1. Kiểm tra để trống / undefined / null
  if (oldIdx === undefined || oldIdx === null || String(oldIdx).trim() === '') {
    return { isValid: false, error: 'Chỉ số cũ không được để trống.', code: 'ERR_EMPTY_OLD' };
  }
  if (newIdx === undefined || newIdx === null || String(newIdx).trim() === '') {
    return { isValid: false, error: 'Chỉ số mới không được để trống.', code: 'ERR_EMPTY_NEW' };
  }

  const numOld = Number(oldIdx);
  const numNew = Number(newIdx);

  // 2. Kiểm tra có phải là số hợp lệ không (NaN / Infinity)
  if (!Number.isFinite(numOld)) {
    return { isValid: false, error: 'Chỉ số cũ phải là số hợp lệ.', code: 'ERR_NAN_OLD' };
  }
  if (!Number.isFinite(numNew)) {
    return { isValid: false, error: 'Chỉ số mới phải là số hợp lệ.', code: 'ERR_NAN_NEW' };
  }

  // 3. Kiểm tra số âm
  if (numOld < 0) {
    return { isValid: false, error: 'Chỉ số cũ không được âm.', code: 'ERR_NEGATIVE_OLD' };
  }
  if (numNew < 0) {
    return { isValid: false, error: 'Chỉ số mới không được âm.', code: 'ERR_NEGATIVE_NEW' };
  }

  // 4. Kiểm tra số nguyên (chỉ số công tơ chuẩn thực tế)
  if (!Number.isInteger(numOld) || !Number.isInteger(numNew)) {
    return { isValid: false, error: 'Chỉ số công tơ phải là số nguyên không âm.', code: 'ERR_NOT_INTEGER' };
  }

  // 5. Kiểm tra giới hạn tối đa tránh tràn số / phi lý
  const maxLimit = APP_LIMITS?.MAX_KWH || 10000000;
  if (numOld > maxLimit || numNew > maxLimit) {
    return { isValid: false, error: `Chỉ số không được vượt quá ${maxLimit.toLocaleString('vi-VN')} kWh.`, code: 'ERR_MAX_EXCEEDED' };
  }

  // 6. Kiểm tra chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ
  if (numNew < numOld) {
    return { isValid: false, error: 'Chỉ số mới không được nhỏ hơn chỉ số cũ.', code: 'ERR_NEW_LESS_THAN_OLD' };
  }

  return { isValid: true, oldIndex: numOld, newIndex: numNew };
}

/**
 * Kiểm tra tính hợp lệ khi người dùng nhập trực tiếp sản lượng kWh (Ước tính nhanh)
 * 
 * @param {any} kwhInput - Sản lượng kWh nhập vào
 * @returns {{ isValid: boolean, error?: string, kwh?: number }}
 */
export function validateDirectKwh(kwhInput) {
  if (kwhInput === undefined || kwhInput === null || String(kwhInput).trim() === '') {
    return { isValid: false, error: 'Vui lòng nhập số kWh dự kiến.', code: 'ERR_EMPTY_KWH' };
  }

  const numKwh = Number(kwhInput);
  if (!Number.isFinite(numKwh)) {
    return { isValid: false, error: 'Số kWh phải là số hợp lệ.', code: 'ERR_NAN_KWH' };
  }

  if (numKwh < 0) {
    return { isValid: false, error: 'Số kWh không được âm.', code: 'ERR_NEGATIVE_KWH' };
  }

  const maxLimit = APP_LIMITS?.MAX_KWH || 10000000;
  if (numKwh > maxLimit) {
    return { isValid: false, error: `Số kWh không được vượt quá ${maxLimit.toLocaleString('vi-VN')} kWh.`, code: 'ERR_MAX_EXCEEDED' };
  }

  const isDecimal = !Number.isInteger(numKwh);
  const roundedKwh = Math.round(numKwh);

  return { 
    isValid: true, 
    kwh: roundedKwh,
    originalKwh: numKwh,
    isRounded: isDecimal,
    roundingExplanation: isDecimal 
      ? `Sản lượng ước tính ${numKwh} kWh được làm tròn số học thành ${roundedKwh} kWh (theo nguyên tắc đo đếm điện thương phẩm).` 
      : null
  };
}

/**
 * Tính toán phân bổ số điện và tiền điện theo từng bậc
 * 
 * @param {number} kwh - Số kWh tiêu thụ
 * @param {Array} tiers - Danh sách bậc giá
 * @returns {{ tierBreakdown: Array, subtotal: number }}
 */
export function calculateTierDetails(kwh, tiers = DEFAULT_TIERS) {
  if (kwh <= 0) {
    return {
      tierBreakdown: tiers.map(t => ({
        tier: t.tier,
        name: t.name,
        range: t.to === Infinity ? `Trên ${t.from}` : `${t.from + 1} - ${t.to}`,
        used: 0,
        price: t.price,
        amount: 0
      })),
      subtotal: 0
    };
  }

  let remaining = kwh;
  let subtotal = 0;
  const tierBreakdown = [];

  for (const tier of tiers) {
    const tierCapacity = tier.to === Infinity ? Infinity : (tier.to - tier.from);
    let used = 0;

    if (remaining > 0) {
      used = Math.min(remaining, tierCapacity);
      remaining -= used;
    }

    const amount = used * tier.price;
    subtotal += amount;

    tierBreakdown.push({
      tier: tier.tier,
      name: tier.name,
      range: tier.to === Infinity ? `Trên ${tier.from}` : `${tier.from + 1} - ${tier.to}`,
      used: used,
      price: tier.price,
      amount: amount
    });
  }

  return { tierBreakdown, subtotal };
}

/**
 * Tính toàn bộ hóa đơn tiền điện theo chỉ số cũ và mới
 * 
 * @param {number|string} oldIdx - Chỉ số cũ
 * @param {number|string} newIdx - Chỉ số mới
 * @param {number} vatRate - Thuế suất VAT (mặc định 0.08 = 8%)
 * @param {Array} tiers - Biểu giá bậc thang
 * @returns {object} Kết quả hóa đơn hoặc lỗi
 */
export function calculateElectricityBill(oldIdx, newIdx, vatRate = 0.08, tiers = DEFAULT_TIERS) {
  const validation = validateInput(oldIdx, newIdx);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      code: validation.code
    };
  }

  const kwh = validation.newIndex - validation.oldIndex;
  const { tierBreakdown, subtotal } = calculateTierDetails(kwh, tiers);

  // Tính thuế VAT và làm tròn tiền theo quy định tài chính
  const vatAmount = Math.round(subtotal * vatRate);
  const totalAmount = subtotal + vatAmount;

  return {
    success: true,
    calculationType: 'meter',
    oldIndex: validation.oldIndex,
    newIndex: validation.newIndex,
    kwh: kwh,
    subtotal: subtotal,
    vatRate: vatRate,
    vatAmount: vatAmount,
    totalAmount: totalAmount,
    tierBreakdown: tierBreakdown
  };
}

/**
 * Tính hóa đơn tiền điện trực tiếp theo số kWh (Ước tính nhanh)
 * 
 * @param {number|string} kwhInput - Số kWh tiêu thụ
 * @param {number} vatRate - Thuế suất VAT
 * @param {Array} tiers - Biểu giá bậc thang
 * @returns {object} Kết quả hóa đơn hoặc lỗi
 */
export function calculateDirectKwh(kwhInput, vatRate = 0.08, tiers = DEFAULT_TIERS) {
  const validation = validateDirectKwh(kwhInput);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      code: validation.code
    };
  }

  const kwh = validation.kwh;
  const { tierBreakdown, subtotal } = calculateTierDetails(kwh, tiers);
  const vatAmount = Math.round(subtotal * vatRate);
  const totalAmount = subtotal + vatAmount;

  return {
    success: true,
    calculationType: 'direct',
    kwh: kwh,
    originalKwh: validation.originalKwh,
    isRounded: validation.isRounded,
    roundingExplanation: validation.roundingExplanation,
    subtotal: subtotal,
    vatRate: vatRate,
    vatAmount: vatAmount,
    totalAmount: totalAmount,
    tierBreakdown: tierBreakdown
  };
}

// Định dạng tiền tệ VNĐ
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Định dạng số nguyên có dấu chấm ngăn cách
export function formatNumber(num) {
  return new Intl.NumberFormat('vi-VN').format(num);
}
