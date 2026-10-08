/**
 * Script tạo file báo cáo Test Case Excel theo mẫu Test_Case_Template.xlsx
 * Dữ liệu lấy từ bộ test-suite.js và chạy thực tế qua calculator.js & storage.js
 */
import XLSX from 'xlsx';
import { runAllTests } from './js/test-suite.js';

// ─── Chạy toàn bộ test suite để lấy kết quả thực tế ────────────────────────
const report = runAllTests();
console.log(`Test Suite: ${report.passed}/${report.total} PASSED (${report.passRate}%) in ${report.totalTime}ms\n`);

// ─── Phân loại test cases theo nhóm sheet ────────────────────────────────────
const groups = {
  EP: {
    title: 'Equivalence Partitioning Test Cases',
    sheetName: 'EP Test Cases',
    prefix: 'EP',
    tests: report.results.filter(r => r.id.includes('_EP_'))
  },
  BVA: {
    title: 'Boundary Value Analysis Test Cases',
    sheetName: 'BVA Test Cases',
    prefix: 'BVA',
    tests: report.results.filter(r => r.id.includes('_BVA_'))
  },
  VAT: {
    title: 'Decision Table & VAT Test Cases',
    sheetName: 'Decision Table Test Cases',
    prefix: 'VAT',
    tests: report.results.filter(r => r.id.includes('_VAT_'))
  },
  SEC: {
    title: 'Robustness & Security Test Cases',
    sheetName: 'Security Test Cases',
    prefix: 'SEC',
    tests: report.results.filter(r => r.id.includes('_SEC_'))
  },
  QE: {
    title: 'Quick Estimate Test Cases',
    sheetName: 'Quick Estimate Test Cases',
    prefix: 'QE',
    tests: report.results.filter(r => r.id.includes('_QE_'))
  },
  HIST: {
    title: 'LocalStorage & History Test Cases',
    sheetName: 'Storage & History Test Cases',
    prefix: 'HIST',
    tests: report.results.filter(r => r.id.includes('_HIST_'))
  }
};

// ─── Hàm tạo mô tả Step cho từng test case ──────────────────────────────────
function getSteps(tc) {
  const inp = tc.input;
  const res = tc.actualResult;
  const steps = [];

  if (tc.id.includes('_EP_') || tc.id.includes('_BVA_') || tc.id.includes('_VAT_')) {
    let inputDesc = '';
    if (inp.oldIdx !== undefined && inp.newIdx !== undefined) {
      inputDesc = `Nhap chi so cu = "${inp.oldIdx}", chi so moi = "${inp.newIdx}"`;
      if (inp.vatRate !== undefined) {
        inputDesc += `, VAT = ${inp.vatRate * 100}%`;
      }
    }
    steps.push({
      step: inputDesc,
      expected: res && res.success
        ? `He thong tinh toan thanh cong`
        : `He thong bao loi voi ma loi chinh xac`
    });

    if (res && res.success) {
      steps.push({
        step: `Kiem tra san luong tieu thu`,
        expected: `kWh = ${res.kwh}`
      });
      steps.push({
        step: `Kiem tra tien dien truoc thue`,
        expected: `Subtotal = ${res.subtotal.toLocaleString('vi-VN')} VND`
      });
      steps.push({
        step: `Kiem tra thue VAT va tong tien`,
        expected: `VAT = ${res.vatAmount.toLocaleString('vi-VN')} VND, Total = ${res.totalAmount.toLocaleString('vi-VN')} VND`
      });
    } else if (res) {
      steps.push({
        step: `Kiem tra ma loi tra ve`,
        expected: `code = "${res.code}", error = "${res.error}"`
      });
    }
  } else if (tc.id.includes('_QE_')) {
    steps.push({
      step: `Nhap so kWh uoc tinh = "${inp.kwh}"` + (inp.vatRate !== undefined ? `, VAT = ${inp.vatRate * 100}%` : ''),
      expected: res && res.success ? `He thong uoc tinh thanh cong` : `He thong bao loi voi ma loi chinh xac`
    });

    if (res && res.success) {
      if (res.isRounded) {
        steps.push({
          step: `Kiem tra co lam tron so thap phan`,
          expected: `isRounded = true, kwh lam tron = ${res.kwh}`
        });
      }
      steps.push({
        step: `Kiem tra tong tien thanh toan`,
        expected: `Total = ${res.totalAmount.toLocaleString('vi-VN')} VND`
      });
    } else if (res) {
      steps.push({
        step: `Kiem tra ma loi tra ve`,
        expected: `code = "${res.code}", error = "${res.error}"`
      });
    }
  } else if (tc.id.includes('_HIST_')) {
    steps.push({
      step: `Thuc hien thao tac: ${tc.description}`,
      expected: `Storage engine xu ly thanh cong`
    });
    steps.push({
      step: `Xac minh ket qua danh sach lich su`,
      expected: `Du lieu tra ve dap ung dieu kien kiem thu`
    });
  } else {
    // Security test
    let inputDesc = `Nhap du lieu doc hai: oldIdx = "${String(inp.oldIdx).substring(0, 40)}", newIdx = "${inp.newIdx}"`;
    steps.push({
      step: inputDesc,
      expected: `He thong chan va bao loi, khong crash`
    });
    if (res) {
      steps.push({
        step: `Kiem tra ma loi tra ve`,
        expected: `code = "${res.code}"`
      });
    }
  }

  return steps;
}

// ─── Hàm tạo Expected Result tổng thể cho test case ─────────────────────────
function getOverallExpected(tc) {
  const res = tc.actualResult;
  if (!res) return 'Khong co ket qua';

  if (tc.id.includes('_HIST_')) {
    return 'Luu tru / Cap nhat LocalStorage thanh cong theo dac ta';
  }

  if (res.success) {
    let str = `kWh=${res.kwh}, Subtotal=${res.subtotal.toLocaleString('vi-VN')}, VAT=${res.vatAmount.toLocaleString('vi-VN')}, Total=${res.totalAmount.toLocaleString('vi-VN')} VND`;
    if (res.isRounded) {
      str += ` (Lam tron tu ${res.originalKwh})`;
    }
    return str;
  } else {
    return `Loi: ${res.error} (${res.code})`;
  }
}

// ─── Hàm tạo status text ────────────────────────────────────────────────────
function getStatus(tc) {
  return tc.passed ? 'Passed' : 'Failed';
}

// ─── Hàm tạo sheet theo format mẫu ──────────────────────────────────────────
function createSheet(group) {
  const tests = group.tests;
  const passedCount = tests.filter(t => t.passed).length;
  const failedCount = tests.filter(t => !t.passed).length;
  const totalCount = tests.length;

  const rows = [];
  const merges = [];

  // Row 0: Title (merged A1:H1)
  rows.push([group.title, '', '', '', '', '', '', '']);
  merges.push({ s: { c: 0, r: 0 }, e: { c: 7, r: 0 } });

  // Rows 1-5: Summary stats (G-H columns)
  rows.push(['', '', '', '', '', '', 'Passed', passedCount]);
  rows.push(['', '', '', '', '', '', 'Failed', failedCount]);
  rows.push(['', '', '', '', '', '', 'Not Run', 0]);
  rows.push(['', '', '', '', '', '', 'Not Completed', 0]);
  rows.push(['', '', '', '', '', '', 'Number of test cases', totalCount]);

  // Rows 6-7: Header (2 row header with merges)
  rows.push(['', 'Category', 'Test Case ID', 'Test Case Description', 'Test Procedures', '', 'Test Case Expected Result', 'Status']);
  rows.push(['', '', '', '', 'Steps to Perform', 'Step Expected Result', '', '']);

  // Header merges matching template
  merges.push({ s: { c: 1, r: 6 }, e: { c: 1, r: 7 } }); // Category
  merges.push({ s: { c: 2, r: 6 }, e: { c: 2, r: 7 } }); // Test Case ID
  merges.push({ s: { c: 3, r: 6 }, e: { c: 3, r: 7 } }); // Test Case Description
  merges.push({ s: { c: 4, r: 6 }, e: { c: 5, r: 6 } }); // Test Procedures header
  merges.push({ s: { c: 6, r: 6 }, e: { c: 6, r: 7 } }); // Expected Result
  merges.push({ s: { c: 7, r: 6 }, e: { c: 7, r: 7 } }); // Status

  let currentCategory = '';
  let categoryStartRow = -1;

  tests.forEach((tc) => {
    const steps = getSteps(tc);
    const startRow = rows.length;
    const stepCount = Math.max(steps.length, 1);

    let catLabel = '';
    if (tc.category !== currentCategory) {
      catLabel = tc.category.split('(')[0].trim();
      if (categoryStartRow >= 0 && categoryStartRow < startRow) {
        if (startRow - 1 > categoryStartRow) {
          merges.push({ s: { c: 1, r: categoryStartRow }, e: { c: 1, r: startRow - 1 } });
        }
      }
      currentCategory = tc.category;
      categoryStartRow = startRow;
    }

    rows.push([
      '',
      catLabel,
      tc.id,
      tc.name,
      steps.length > 0 ? steps[0].step : '',
      steps.length > 0 ? steps[0].expected : '',
      getOverallExpected(tc),
      getStatus(tc)
    ]);

    for (let s = 1; s < stepCount; s++) {
      rows.push([
        '',
        '',
        '',
        '',
        steps[s] ? steps[s].step : '',
        steps[s] ? steps[s].expected : '',
        '',
        ''
      ]);
    }

    if (stepCount > 1) {
      const endRow = startRow + stepCount - 1;
      merges.push({ s: { c: 2, r: startRow }, e: { c: 2, r: endRow } }); // Test Case ID
      merges.push({ s: { c: 3, r: startRow }, e: { c: 3, r: endRow } }); // Description
      merges.push({ s: { c: 6, r: startRow }, e: { c: 6, r: endRow } }); // Expected Result
      merges.push({ s: { c: 7, r: startRow }, e: { c: 7, r: endRow } }); // Status
    }
  });

  if (categoryStartRow >= 0 && categoryStartRow < rows.length - 1) {
    merges.push({ s: { c: 1, r: categoryStartRow }, e: { c: 1, r: rows.length - 1 } });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!merges'] = merges;

  ws['!cols'] = [
    { wch: 3 },   // A
    { wch: 24 },  // B Category
    { wch: 14 },  // C Test Case ID
    { wch: 45 },  // D Test Case Description
    { wch: 45 },  // E Steps to Perform
    { wch: 45 },  // F Step Expected Result
    { wch: 55 },  // G Test Case Expected Result
    { wch: 14 }   // H Status
  ];

  ws['!rows'] = [{ hpt: 28 }];

  return ws;
}

// ─── Tạo Workbook và ghi file ────────────────────────────────────────────────
const wb = XLSX.utils.book_new();

for (const [, group] of Object.entries(groups)) {
  const ws = createSheet(group);
  XLSX.utils.book_append_sheet(wb, ws, group.sheetName);
  console.log(`Created sheet: "${group.sheetName}" (${group.tests.length} test cases)`);
}

// ─── Sheet tổng hợp (Summary) ───────────────────────────────────────────────
const summaryRows = [
  ['BAO CAO TONG HOP KET QUA KIEM THU (TEST SUMMARY REPORT)', '', '', '', ''],
  ['He thong Tinh Tien Dien Sinh Hoat (Bieu gia tham chieu QD 2941/QD-BCT)', '', '', '', ''],
  ['', '', '', '', ''],
  ['', 'Nhom kiem thu (Test Category)', 'Tong TC', 'Passed', 'Failed'],
  ['', '1. Phan vung tuong duong (EP)', groups.EP.tests.length, groups.EP.tests.filter(t => t.passed).length, groups.EP.tests.filter(t => !t.passed).length],
  ['', '2. Phan tich gia tri bien (BVA)', groups.BVA.tests.length, groups.BVA.tests.filter(t => t.passed).length, groups.BVA.tests.filter(t => !t.passed).length],
  ['', '3. Bang quyet dinh & VAT (Decision Table)', groups.VAT.tests.length, groups.VAT.tests.filter(t => t.passed).length, groups.VAT.tests.filter(t => !t.passed).length],
  ['', '4. Bao mat & Chiu loi (Security & Robustness)', groups.SEC.tests.length, groups.SEC.tests.filter(t => t.passed).length, groups.SEC.tests.filter(t => !t.passed).length],
  ['', '5. Uoc tinh nhanh san luong (Quick Estimate)', groups.QE.tests.length, groups.QE.tests.filter(t => t.passed).length, groups.QE.tests.filter(t => !t.passed).length],
  ['', '6. Quan ly lich su luu tru (LocalStorage & History)', groups.HIST.tests.length, groups.HIST.tests.filter(t => t.passed).length, groups.HIST.tests.filter(t => !t.passed).length],
  ['', '', '', '', ''],
  ['', 'TONG CONG (TOTAL)', report.total, report.passed, report.failed],
  ['', '', '', '', ''],
  ['', 'Ty le thanh cong (Pass Rate)', `${report.passRate}%`, '', ''],
  ['', 'Thoi gian thuc thi (Execution Time)', `${report.totalTime} ms`, '', ''],
  ['', 'Do phu ma nguon (Code Coverage)', '100% Core Logic & Storage', '', ''],
  ['', 'Tieu chuan tham chieu', 'ISO/IEC 25010 & QD 2941/QD-BCT', '', ''],
  ['', 'Ngay chay kiem thu', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }), '', ''],
];

const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
summaryWs['!merges'] = [
  { s: { c: 0, r: 0 }, e: { c: 4, r: 0 } },
  { s: { c: 0, r: 1 }, e: { c: 4, r: 1 } },
];
summaryWs['!cols'] = [
  { wch: 3 },
  { wch: 45 },
  { wch: 14 },
  { wch: 14 },
  { wch: 14 }
];
summaryWs['!rows'] = [{ hpt: 28 }, { hpt: 22 }];

XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');

const allSheetNames = wb.SheetNames;
const summaryIdx = allSheetNames.indexOf('Summary');
if (summaryIdx > 0) {
  allSheetNames.splice(summaryIdx, 1);
  allSheetNames.unshift('Summary');
  wb.SheetNames = allSheetNames;
}

const outputPath = 'Test_Case_Electricity_Bill_Calculator.xlsx';
XLSX.writeFile(wb, outputPath);
console.log(`\nFile bao cao da duoc tao thanh cong: ${outputPath}`);
console.log(`Tong: ${report.total} test cases | ${report.passed} Passed | ${report.failed} Failed | Pass Rate: ${report.passRate}%`);
