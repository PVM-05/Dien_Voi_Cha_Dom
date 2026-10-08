# Hệ Thống Tính Tiền Điện Sinh Hoạt & Kiểm Định Chất Lượng Phần Mềm (SQA)

> Ứng dụng Web tính tiền điện sinh hoạt bậc thang theo biểu giá tham chiếu EVN (QĐ 2941/QĐ-BCT), tích hợp giải thuật gợi ý tiết kiệm thông minh và bộ công cụ kiểm thử tự động đạt chuẩn chất lượng phần mềm.

[![Tests](https://img.shields.io/badge/Tests-41%20Passed-brightgreen.svg)](test-runner.html)
[![Coverage](https://img.shields.io/badge/Coverage-100%25%20Core%20Logic-success.svg)](test-runner.html)
[![Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2025010-blue.svg)](BAO_CAO_KIEM_DINH_CLPM.md)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## Điểm nổi bật của dự án

1. **Trải nghiệm người dùng thông minh (Consumer-First UI)**:
   - Giao diện sạch sẽ, hiện đại, tối giản, tuân thủ nguyên tắc không sử dụng icon/emoji rườm rà.
   - Hỗ trợ 2 phương thức tính: **Theo chỉ số công tơ** (cũ/mới) và **Ước tính nhanh theo số kWh**.
   - Xác thực thông minh theo thời gian thực (Smart Validation): phát hiện lỗi chỉ số, số thập phân, tự động tính và giải thích làm tròn số học theo quy tắc đo đếm điện thương phẩm.
   - Kết quả trực quan nổi bật (Hero Result) với tổng tiền to rõ, tóm tắt thuế VAT, chức năng sao chép hóa đơn (có clipboard fallback) và in ấn.
   - Giải thích cách tính theo bậc thang (Progressive Disclosure) có thể mở rộng/thu gọn.
   - Gợi ý tiết kiệm điện thông minh (Smart Savings Advice) dựa trên phân tích bậc thang thực tế.
   - So sánh sản lượng với tháng trước và lưu trữ lịch sử tính toán vào `localStorage` (hỗ trợ xóa từng mục và xóa toàn bộ).

2. **Kiến trúc mô-đun hóa sạch sẽ (Clean Modular Architecture)**:
   - `js/config.js`: Cấu hình biểu giá tham chiếu QĐ 2941/QĐ-BCT, các mức thuế VAT, hằng số hệ thống.
   - `js/calculator.js`: Xử lý toàn bộ logic nghiệp vụ tính toán (Pure Functions) cho cả 2 chế độ công tơ và số kWh, dễ dàng kiểm thử đơn vị độc lập.
   - `js/recommendations.js`: Thuật toán tư vấn tiết kiệm điện và so sánh kỳ trước.
   - `js/storage.js`: Quản lý lưu trữ cục bộ lịch sử tính toán (có cơ chế fallback an toàn).
   - `js/app.js`: Điều khiển giao diện người dùng (UI Controller).

3. **Kiểm thử tự động chuyên sâu (Automated Testing - 41 Test Cases)**:
   - Bộ kiểm thử tự động 41 ca kiểm thử bao phủ toàn bộ 6 nhóm kỹ thuật:
     - **Phân vùng tương đương (Equivalence Partitioning - EP)**: 11 ca
     - **Phân tích giá trị biên (Boundary Value Analysis - BVA)**: 9 ca
     - **Bảng quyết định & Thuế VAT (Decision Table & VAT)**: 2 ca
     - **Kiểm thử độ chịu lỗi & Bảo mật (Robustness & Security)**: 3 ca
     - **Ước tính nhanh sản lượng (Quick Estimate)**: 10 ca
     - **Lưu trữ cục bộ & Quản lý lịch sử (LocalStorage & History)**: 6 ca
   - Chạy kiểm thử linh hoạt qua CLI (`npm test` hoặc `node run-tests.js`) và qua giao diện trực quan `test-runner.html`.

---

## Cấu trúc thư mục

```text
├── index.html                 # Giao diện ứng dụng tính tiền điện người dùng
├── test-runner.html           # Bảng điều khiển kiểm thử tự động trực quan
├── run-tests.js               # CLI Test Runner cho terminal / CI-CD
├── generate-report.js         # Script tạo file báo cáo kiểm thử Excel
├── package.json               # Cấu hình dự án & scripts kiểm thử
├── js/
│   ├── config.js              # Cấu hình biểu giá tham chiếu & tùy chọn VAT
│   ├── calculator.js          # Logic nghiệp vụ tính bậc thang & validation
│   ├── recommendations.js     # Thuật toán gợi ý tiết kiệm & so sánh
│   ├── storage.js             # Quản lý lịch sử tính toán (localStorage)
│   ├── app.js                 # Điều khiển giao diện người dùng (UI Controller)
│   └── test-suite.js          # Tập hợp 41 ca kiểm thử tự động
├── BAO_CAO_KIEM_DINH_CLPM.md  # Báo cáo kiểm định & đánh giá chất lượng phần mềm
└── README.md                  # Hướng dẫn dự án và tài liệu
```

---

## Hướng dẫn sử dụng

### 1. Mở ứng dụng tính tiền điện

Mở file `index.html` trực tiếp bằng trình duyệt web bất kỳ hoặc dùng Live Server trong VS Code:

- **Tính theo công tơ**: Nhập **Chỉ số cũ** và **Chỉ số mới**, hệ thống sẽ tự động hiển thị sản lượng và tính toán.
- **Ước tính theo số kWh**: Chuyển sang tab "Ước Tính Theo Số kWh" và nhập số kWh dự kiến (hỗ trợ giải thích làm tròn số học nếu nhập số thập phân).
- Nhấn **Tính Tiền Điện** để xem kết quả chi tiết, gợi ý tiết kiệm, lưu vào lịch sử, sao chép hoặc in hóa đơn.
- Trong phần **Lịch sử tính gần đây**, người dùng có thể bấm **Xem lại** để nạp dữ liệu cũ hoặc bấm **Xóa** để xóa từng lượt tính.

### 2. Chạy kiểm thử tự động

- **Qua dòng lệnh (Terminal)**:
  ```bash
  npm test
  ```
- **Tạo báo cáo kiểm thử Excel**:
  ```bash
  npm run report
  ```
- **Qua trình duyệt**:
  Mở file `test-runner.html` bằng trình duyệt để xem bảng điều khiển báo cáo kiểm định trực quan với 41/41 test case vượt qua (100% PASS).
