// Bộ Test Suite phục vụ Kiểm định & Đánh giá chất lượng phần mềm
// Áp dụng các kỹ thuật:
// 1. Phân vùng tương đương (Equivalence Partitioning - EP)
// 2. Phân tích giá trị biên (Boundary Value Analysis - BVA)
// 3. Kiểm thử bảng quyết định & tính thuế VAT (Decision Table & VAT)
// 4. Kiểm thử bảo mật đầu vào & trường hợp ngoại lệ (Robustness & Error Handling)

import { calculateElectricityBill, validateInput, DEFAULT_TIERS } from './calculator.js';

export const TEST_CATEGORIES = {
  EP: 'Phân vùng tương đương (Equivalence Partitioning)',
  BVA: 'Phân tích giá trị biên (Boundary Value Analysis)',
  VAT: 'Tính toán & Thuế VAT (Decision Table)',
  ROBUST: 'Kiểm thử độ chịu lỗi & Bảo mật (Robustness & Security)'
};

export const TEST_CASES = [
  // =========================================================================
  // 1. PHÂN VÙNG TƯƠNG ĐƯƠNG (EQUIVALENCE PARTITIONING - EP)
  // =========================================================================
  {
    id: 'TC_EP_01',
    category: TEST_CATEGORIES.EP,
    name: 'Đầu vào hợp lệ thông thường (100 -> 250 kWh)',
    description: 'Chỉ số hợp lệ, tiêu thụ 150 kWh trải qua bậc 1, 2 và một phần bậc 3.',
    input: { oldIdx: 100, newIdx: 250, vatRate: 0.08 },
    assert: (res) => {
      // 50*1984 + 50*2050 + 50*2380 = 99200 + 102500 + 119000 = 320,700
      // VAT 8% = 25,656; Total = 346,356
      return res.success === true &&
             res.kwh === 150 &&
             res.subtotal === 320700 &&
             res.vatAmount === 25656 &&
             res.totalAmount === 346356;
    }
  },
  {
    id: 'TC_EP_02',
    category: TEST_CATEGORIES.EP,
    name: 'Để trống chỉ số cũ (Empty Old Index)',
    description: 'Bỏ trống giá trị oldIdx, hệ thống phải chặn và báo lỗi.',
    input: { oldIdx: '', newIdx: 150 },
    assert: (res) => res.success === false && res.code === 'ERR_EMPTY_OLD'
  },
  {
    id: 'TC_EP_03',
    category: TEST_CATEGORIES.EP,
    name: 'Để trống chỉ số mới (Empty New Index)',
    description: 'Bỏ trống giá trị newIdx, hệ thống phải chặn và báo lỗi.',
    input: { oldIdx: 100, newIdx: '   ' },
    assert: (res) => res.success === false && res.code === 'ERR_EMPTY_NEW'
  },
  {
    id: 'TC_EP_04',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số cũ chứa ký tự chữ (NaN)',
    description: 'Nhập ký tự chữ hoặc chuỗi không hợp lệ vào chỉ số cũ.',
    input: { oldIdx: 'abc', newIdx: 200 },
    assert: (res) => res.success === false && res.code === 'ERR_NAN_OLD'
  },
  {
    id: 'TC_EP_05',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số mới chứa ký tự đặc biệt (NaN)',
    description: 'Nhập ký tự đặc biệt vào chỉ số mới.',
    input: { oldIdx: 100, newIdx: '@#$%' },
    assert: (res) => res.success === false && res.code === 'ERR_NAN_NEW'
  },
  {
    id: 'TC_EP_06',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số cũ là số âm',
    description: 'Số âm không hợp lệ cho chỉ số công tơ điện.',
    input: { oldIdx: -50, newIdx: 100 },
    assert: (res) => res.success === false && res.code === 'ERR_NEGATIVE_OLD'
  },
  {
    id: 'TC_EP_07',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số mới là số âm',
    description: 'Số âm không hợp lệ cho chỉ số mới.',
    input: { oldIdx: 100, newIdx: -20 },
    assert: (res) => res.success === false && res.code === 'ERR_NEGATIVE_NEW'
  },
  {
    id: 'TC_EP_08',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số mới nhỏ hơn chỉ số cũ (New < Old)',
    description: 'Công tơ chạy xuôi, chỉ số mới không thể nhỏ hơn chỉ số cũ.',
    input: { oldIdx: 500, newIdx: 300 },
    assert: (res) => res.success === false && res.code === 'ERR_NEW_LESS_THAN_OLD'
  },
  {
    id: 'TC_EP_09',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số mới bằng chỉ số cũ (New == Old, 0 kWh tiêu thụ)',
    description: 'Tháng không sử dụng điện (0 kWh), tiền điện phải là 0 VNĐ.',
    input: { oldIdx: 200, newIdx: 200, vatRate: 0.08 },
    assert: (res) => res.success === true && res.kwh === 0 && res.totalAmount === 0
  },
  {
    id: 'TC_EP_10',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số là số thập phân (Không phải số nguyên)',
    description: 'Chỉ số công tơ tiêu chuẩn gia đình là số nguyên.',
    input: { oldIdx: 100.5, newIdx: 200 },
    assert: (res) => res.success === false && res.code === 'ERR_NOT_INTEGER'
  },
  {
    id: 'TC_EP_11',
    category: TEST_CATEGORIES.EP,
    name: 'Chỉ số vượt ngưỡng tối đa cho phép (> 10 triệu)',
    description: 'Kiểm tra giới hạn chống tràn số và giá trị vô lý.',
    input: { oldIdx: 100, newIdx: 15000000 },
    assert: (res) => res.success === false && res.code === 'ERR_MAX_EXCEEDED'
  },

  // =========================================================================
  // 2. PHÂN TÍCH GIÁ TRỊ BIÊN (BOUNDARY VALUE ANALYSIS - BVA)
  // =========================================================================
  {
    id: 'TC_BVA_01',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 1 tối thiểu: Tiêu thụ 1 kWh (Biên min)',
    description: '1 kWh tính giá bậc 1 (1984 đ), VAT 8% (159 đ) = 2,143 đ.',
    input: { oldIdx: 0, newIdx: 1, vatRate: 0.08 },
    assert: (res) => {
      // 1 * 1984 = 1984; VAT = round(1984 * 0.08) = 159; Total = 2143
      return res.success === true && res.kwh === 1 && res.subtotal === 1984 && res.totalAmount === 2143;
    }
  },
  {
    id: 'TC_BVA_02',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 1 tối đa: Tiêu thụ chính xác 50 kWh',
    description: '50 kWh nằm trọn trong Bậc 1.',
    input: { oldIdx: 100, newIdx: 150, vatRate: 0.08 },
    assert: (res) => {
      // 50 * 1984 = 99200; VAT = 7936; Total = 107,136
      return res.success === true && res.kwh === 50 && res.subtotal === 99200 && res.totalAmount === 107136;
    }
  },
  {
    id: 'TC_BVA_03',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 2 tối thiểu: Tiêu thụ 51 kWh (Chớm sang Bậc 2)',
    description: '50 kWh Bậc 1 + 1 kWh Bậc 2 (2050 đ).',
    input: { oldIdx: 100, newIdx: 151, vatRate: 0.08 },
    assert: (res) => {
      // 99200 + 2050 = 101250; VAT = 8100; Total = 109,350
      return res.success === true && res.kwh === 51 && res.subtotal === 101250 && res.totalAmount === 109350;
    }
  },
  {
    id: 'TC_BVA_04',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 2 tối đa: Tiêu thụ chính xác 100 kWh',
    description: '50 kWh Bậc 1 + 50 kWh Bậc 2.',
    input: { oldIdx: 0, newIdx: 100, vatRate: 0.08 },
    assert: (res) => {
      // 99200 + 50*2050 = 99200 + 102500 = 201700; VAT = 16136; Total = 217,836
      return res.success === true && res.kwh === 100 && res.subtotal === 201700 && res.totalAmount === 217836;
    }
  },
  {
    id: 'TC_BVA_05',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 3 tối thiểu: Tiêu thụ 101 kWh (Chớm sang Bậc 3)',
    description: '100 kWh bậc 1-2 + 1 kWh Bậc 3 (2380 đ).',
    input: { oldIdx: 0, newIdx: 101, vatRate: 0.08 },
    assert: (res) => {
      // 201700 + 2380 = 204080; VAT = 16326; Total = 220,406
      return res.success === true && res.kwh === 101 && res.subtotal === 204080 && res.totalAmount === 220406;
    }
  },
  {
    id: 'TC_BVA_06',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 3 tối đa: Tiêu thụ 200 kWh',
    description: '50 kWh Bậc 1 + 50 kWh Bậc 2 + 100 kWh Bậc 3.',
    input: { oldIdx: 0, newIdx: 200, vatRate: 0.08 },
    assert: (res) => {
      // 201700 + 100*2380 = 201700 + 238000 = 439,700; VAT = 35176; Total = 474,876
      return res.success === true && res.kwh === 200 && res.subtotal === 439700 && res.totalAmount === 474876;
    }
  },
  {
    id: 'TC_BVA_07',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 4 tối đa: Tiêu thụ 300 kWh',
    description: 'Bậc 1 (50) + Bậc 2 (50) + Bậc 3 (100) + Bậc 4 (100).',
    input: { oldIdx: 0, newIdx: 300, vatRate: 0.08 },
    assert: (res) => {
      // 439700 + 100*2998 = 439700 + 299800 = 739,500; VAT = 59160; Total = 798,660
      return res.success === true && res.kwh === 300 && res.subtotal === 739500 && res.totalAmount === 798660;
    }
  },
  {
    id: 'TC_BVA_08',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 5 tối đa: Tiêu thụ 400 kWh',
    description: 'Bậc 1 đến Bậc 4 (739500) + 100 kWh Bậc 5 (335000).',
    input: { oldIdx: 0, newIdx: 400, vatRate: 0.08 },
    assert: (res) => {
      // 739500 + 100*3350 = 1,074,500; VAT = 85960; Total = 1,160,460
      return res.success === true && res.kwh === 400 && res.subtotal === 1074500 && res.totalAmount === 1160460;
    }
  },
  {
    id: 'TC_BVA_09',
    category: TEST_CATEGORIES.BVA,
    name: 'Biên Bậc 6 tối thiểu: Tiêu thụ 401 kWh (Chớm sang Bậc 6 cao nhất)',
    description: '400 kWh (1074500) + 1 kWh Bậc 6 (3460 đ).',
    input: { oldIdx: 0, newIdx: 401, vatRate: 0.08 },
    assert: (res) => {
      // 1074500 + 3460 = 1,077,960; VAT = 86237; Total = 1,164,197
      return res.success === true && res.kwh === 401 && res.subtotal === 1077960 && res.totalAmount === 1164197;
    }
  },

  // =========================================================================
  // 3. KIỂM THỬ THUẾ SUẤT & LÀM TRÒN (DECISION TABLE & VAT)
  // =========================================================================
  {
    id: 'TC_VAT_01',
    category: TEST_CATEGORIES.VAT,
    name: 'Áp dụng thuế VAT 10% (Theo các thời kỳ thông thường)',
    description: 'Kiểm tra độ linh hoạt khi chọn mức thuế 10%.',
    input: { oldIdx: 0, newIdx: 100, vatRate: 0.10 },
    assert: (res) => {
      // Subtotal = 201700; VAT 10% = 20170; Total = 221,870
      return res.success === true && res.vatAmount === 20170 && res.totalAmount === 221870;
    }
  },
  {
    id: 'TC_VAT_02',
    category: TEST_CATEGORIES.VAT,
    name: 'Miễn thuế VAT 0%',
    description: 'Trường hợp khách hàng được miễn giảm hoàn toàn thuế VAT.',
    input: { oldIdx: 0, newIdx: 100, vatRate: 0.0 },
    assert: (res) => {
      return res.success === true && res.vatAmount === 0 && res.totalAmount === res.subtotal;
    }
  },

  // =========================================================================
  // 4. KIỂM THỬ ĐỘ CHỊU LỖI & BẢO MẬT (ROBUSTNESS & SECURITY)
  // =========================================================================
  {
    id: 'TC_SEC_01',
    category: TEST_CATEGORIES.ROBUST,
    name: 'Phòng chống mã độc XSS dạng String',
    description: 'Nhập thẻ script vào trường dữ liệu.',
    input: { oldIdx: '<script>alert(1)</script>', newIdx: 200 },
    assert: (res) => res.success === false && res.code === 'ERR_NAN_OLD'
  },
  {
    id: 'TC_SEC_02',
    category: TEST_CATEGORIES.ROBUST,
    name: 'Giá trị Infinity và -Infinity',
    description: 'Kiểm tra chặn giá trị vô cực.',
    input: { oldIdx: 0, newIdx: Infinity },
    assert: (res) => res.success === false && res.code === 'ERR_NAN_NEW'
  },
  {
    id: 'TC_SEC_03',
    category: TEST_CATEGORIES.ROBUST,
    name: 'Dữ liệu đầu vào dạng khoảng trắng nhiều ký tự',
    description: 'Chỉ chứa các ký tự whitespace.',
    input: { oldIdx: '   \t\n  ', newIdx: 200 },
    assert: (res) => res.success === false && res.code === 'ERR_EMPTY_OLD'
  }
];

/**
 * Hàm thực thi toàn bộ Test Suite và trả về kết quả chi tiết
 */
export function runAllTests() {
  const startTime = performance.now();
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const tc of TEST_CASES) {
    const caseStart = performance.now();
    let passed = false;
    let actualResult = null;
    let errorMessage = null;

    try {
      actualResult = calculateElectricityBill(
        tc.input.oldIdx,
        tc.input.newIdx,
        tc.input.vatRate !== undefined ? tc.input.vatRate : 0.08
      );
      passed = Boolean(tc.assert(actualResult));
    } catch (err) {
      passed = false;
      errorMessage = err.message || String(err);
    }

    const duration = Math.round((performance.now() - caseStart) * 100) / 100;

    if (passed) {
      passedCount++;
    } else {
      failedCount++;
    }

    results.push({
      ...tc,
      passed,
      actualResult,
      errorMessage,
      duration
    });
  }

  const totalTime = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    total: TEST_CASES.length,
    passed: passedCount,
    failed: failedCount,
    passRate: Math.round((passedCount / TEST_CASES.length) * 1000) / 10,
    totalTime,
    results
  };
}
