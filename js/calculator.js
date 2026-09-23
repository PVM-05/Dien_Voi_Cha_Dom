// Module tính toán tiền điện - Core Business Logic
// Tách biệt hoàn toàn khỏi giao diện (DOM) để phục vụ Unit Testing & Kiểm thử tự động

/**
 * Biểu giá điện sinh hoạt bậc thang (theo Quyết định số 2941/QĐ-BCT và quy định hiện hành của EVN)
 * Đơn vị: VNĐ/kWh
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
 * Kiểm tra tính hợp lệ của đầu vào (Input Validation)
 * Sử dụng cho kiểm thử phân vùng tương đương (EP) và phân tích giá trị biên (BVA)
 * 
 * @param {any} oldIdx - Chỉ số cũ
 * @param {any} newIdx - Chỉ số mới
 * @returns {{ isValid: boolean, error?: string, code?: string }}
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

  // 5. Kiểm tra giới hạn tối đa tránh tràn số / phi lý (max 10 triệu kWh)
  const MAX_INDEX = 10000000;
  if (numOld > MAX_INDEX || numNew > MAX_INDEX) {
    return { isValid: false, error: `Chỉ số không được vượt quá ${MAX_INDEX.toLocaleString()} kWh.`, code: 'ERR_MAX_EXCEEDED' };
  }

  // 6. Kiểm tra chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ
  if (numNew < numOld) {
    return { isValid: false, error: 'Chỉ số mới không được nhỏ hơn chỉ số cũ.', code: 'ERR_NEW_LESS_THAN_OLD' };
  }

  return { isValid: true, oldIndex: numOld, newIndex: numNew };
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
      range: tier.to === Infinity ? `Trên ${t.from}` : `${tier.from + 1} - ${tier.to}`,
      used: used,
      price: tier.price,
      amount: amount
    });
  }

  return { tierBreakdown, subtotal };
}

/**
 * Tính toàn bộ hóa đơn tiền điện
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

// Định dạng tiền tệ VNĐ
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
