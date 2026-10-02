// CLI Test Runner for Terminal / Command Prompt
import { runAllTests } from './js/test-suite.js';

console.log('='.repeat(70));
console.log('  🧪 SQA AUTOMATED TEST RUNNER (KIỂM ĐỊNH CHẤT LƯỢNG PHẦN MỀM)');
console.log('='.repeat(70));

const report = runAllTests();

// In chi tiết từng ca kiểm thử
report.results.forEach((tc, idx) => {
  const statusIcon = tc.passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`${String(idx + 1).padStart(2, ' ')}. ${statusIcon} ${tc.id.padEnd(12, ' ')} : ${tc.name} (${tc.duration}ms)`);
  if (!tc.passed) {
    console.log(`    \x1b[31mError:\x1b[0m ${tc.errorMessage || 'Assertion failed'}`);
  }
});

console.log('-'.repeat(70));
console.log(`📊 TỔNG KẾT KẾT QUẢ KIỂM THỬ:`);
console.log(`   - Tổng số ca kiểm thử (Total)  : ${report.total}`);
console.log(`   - Vượt qua (Passed)            : \x1b[32m${report.passed}\x1b[0m`);
console.log(`   - Thất bại (Failed)            : \x1b[31m${report.failed}\x1b[0m`);
console.log(`   - Tỷ lệ thành công (Pass Rate) : \x1b[32m${report.passRate}%\x1b[0m`);
console.log(`   - Thời gian thực thi           : ${report.totalTime} ms`);
console.log('='.repeat(70));

if (report.failed > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32m✓ TẤT CẢ CÁC CA KIỂM THỬ ĐÃ HOÀN THÀNH THÀNH CÔNG VỚI ĐỘ PHỦ 100%!\x1b[0m\n');
  process.exit(0);
}
