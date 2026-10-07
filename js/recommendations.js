// Module tư vấn và gợi ý tiết kiệm điện thông minh (Smart Recommendations)
import { calculateDirectKwh, formatCurrency, formatNumber } from './calculator.js';

/**
 * Phân tích sản lượng và đưa ra gợi ý tiết kiệm điện thực tế
 * 
 * @param {number} kwh - Sản lượng điện tiêu thụ
 * @param {number} totalAmount - Tổng tiền thanh toán
 * @param {number} vatRate - Thuế suất VAT
 * @param {Array} tierBreakdown - Chi tiết từng bậc đã tính
 * @returns {{ tierName: string, tierPrice: number, advice: string, potentialSavingsText?: string }}
 */
export function getEnergySavingRecommendation(kwh, totalAmount, vatRate = 0.08, tierBreakdown = []) {
  if (kwh <= 0) {
    return {
      tierName: 'Chưa sử dụng',
      tierPrice: 0,
      advice: 'Chưa có sản lượng điện tiêu thụ trong kỳ này.'
    };
  }

  // Tìm bậc cao nhất mà người dùng đang chạm tới
  const activeTiers = tierBreakdown.filter(t => t.used > 0);
  const highestTier = activeTiers.length > 0 ? activeTiers[activeTiers.length - 1] : null;

  const tierName = highestTier ? highestTier.name : 'Bậc 1';
  const tierPrice = highestTier ? highestTier.price : 1984;

  // Tính toán tiết kiệm nếu giảm 10% sản lượng
  const reductionKwh = Math.max(1, Math.round(kwh * 0.10));
  const hypotheticalKwh = Math.max(0, kwh - reductionKwh);
  const hypotheticalCalc = calculateDirectKwh(hypotheticalKwh, vatRate);
  const estimatedSavings = Math.max(0, totalAmount - (hypotheticalCalc.totalAmount || 0));

  let advice = '';
  let potentialSavingsText = '';

  if (kwh <= 50) {
    advice = 'Mức tiêu thụ của bạn đang nằm trọn trong Bậc 1 (mức đơn giá thấp nhất: 1.984 đ/kWh). Bạn đang sử dụng điện rất hiệu quả và tiết kiệm.';
  } else if (kwh <= 100) {
    advice = `Bạn đang sử dụng ở mức ${tierName} (đơn giá ${formatCurrency(tierPrice)}/kWh). Duy trì thói quen tắt thiết bị khi ra khỏi phòng sẽ giúp kiểm soát tốt hóa đơn.`;
    potentialSavingsText = `Nếu giảm 10% điện năng (~${reductionKwh} kWh), bạn có thể tiết kiệm khoảng ${formatCurrency(estimatedSavings)}/kỳ.`;
  } else if (kwh <= 200) {
    advice = `Bạn đang chạm tới ${tierName} (${formatCurrency(tierPrice)}/kWh). Đây là ngưỡng tiêu thụ phổ biến của hộ gia đình. Tận dụng ánh sáng tự nhiên và điều chỉnh nhiệt độ điều hòa từ 26°C trở lên sẽ giúp giảm bớt chi phí.`;
    potentialSavingsText = `Nếu giảm 10% điện năng (~${reductionKwh} kWh), bạn có thể tiết kiệm khoảng ${formatCurrency(estimatedSavings)}/kỳ.`;
  } else if (kwh <= 400) {
    advice = `Lượng điện của bạn đang tính ở ${tierName} với đơn giá lũy tiến cao (${formatCurrency(tierPrice)}/kWh).`;
    potentialSavingsText = `Nếu cắt giảm khoảng 10% (~${reductionKwh} kWh) bằng cách hạn chế thiết bị công suất lớn trong giờ cao điểm, bạn có thể tiết kiệm khoảng ${formatCurrency(estimatedSavings)} mỗi kỳ.`;
  } else {
    advice = `Bạn đang tiêu thụ vượt 400 kWh, rơi vào Bậc 6 với đơn giá cao nhất (${formatCurrency(tierPrice)}/kWh).`;
    potentialSavingsText = `Nếu cắt giảm 10% (~${reductionKwh} kWh), số tiền tiết kiệm được có thể lên tới khoảng ${formatCurrency(estimatedSavings)} mỗi kỳ.`;
  }

  return {
    tierName,
    tierPrice,
    advice,
    potentialSavingsText
  };
}

/**
 * So sánh sản lượng tiêu thụ với tháng trước
 * 
 * @param {number} currentKwh - Sản lượng kỳ hiện tại
 * @param {number|string} previousKwhInput - Sản lượng kỳ trước do người dùng nhập
 * @returns {object|null} Kết quả so sánh hoặc null nếu chưa nhập
 */
export function compareWithPreviousMonth(currentKwh, previousKwhInput) {
  if (previousKwhInput === undefined || previousKwhInput === null || String(previousKwhInput).trim() === '') {
    return null;
  }

  const prevKwh = Number(previousKwhInput);
  if (!Number.isFinite(prevKwh) || prevKwh < 0) {
    return {
      isValid: false,
      message: 'Chỉ số tháng trước phải là số hợp lệ.'
    };
  }

  const diff = currentKwh - prevKwh;
  const isHigher = diff > 0;
  const isEqual = diff === 0;
  const absDiff = Math.abs(diff);

  let percentText = '';
  if (prevKwh > 0) {
    const pct = ((absDiff / prevKwh) * 100).toFixed(1);
    percentText = `(${isHigher ? '+' : '-'}${pct}%)`;
  }

  let message = '';
  if (isEqual) {
    message = 'Sản lượng tiêu thụ bằng chính xác so với tháng trước.';
  } else if (isHigher) {
    message = `Bạn sử dụng nhiều hơn ${formatNumber(absDiff)} kWh ${percentText} so với tháng trước.`;
  } else {
    message = `Bạn đã tiết kiệm được ${formatNumber(absDiff)} kWh ${percentText} so với tháng trước.`;
  }

  return {
    isValid: true,
    diff,
    absDiff,
    isHigher,
    isEqual,
    percentText,
    message
  };
}
