# Hệ Thống Tính Tiền Điện Sinh Hoạt & Kiểm Định Chất Lượng Phần Mềm (SQA)

> Ứng dụng Web tính tiền điện sinh hoạt bậc thang theo biểu giá EVN, tích hợp giải thuật gợi ý tiết kiệm thông minh và bộ công cụ kiểm thử tự động đạt chuẩn chất lượng phần mềm.

[![Tests](https://img.shields.io/badge/Tests-25%20Passed-brightgreen.svg)](test-runner.html)
[![Coverage](https://img.shields.io/badge/Coverage-100%25%20Core%20Logic-success.svg)](test-runner.html)
[![Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2025010-blue.svg)](BAO_CAO_KIEM_DINH_CLPM.md)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## Điểm nổi bật của dự án

1. **Trải nghiệm người dùng thông minh (Consumer-First UI)**:
   - Giao diện sạch sẽ, hiện đại, tối giản, không sử dụng icon hay emoji rườm rà.
   - Hỗ trợ 2 phương thức tính: **Theo chỉ số công tơ** (cũ/mới) và **Ước tính theo số kWh**.
   - Xác thực thông minh theo thời gian thực (Smart Validation): phát hiện lỗi chỉ số, số thập phân, tự động tính và hiển thị sản lượng.
   - Kết quả trực quan nổi bật (Hero Result) với tổng tiền to rõ, tóm tắt thuế VAT, chức năng sao chép hóa đơn và in ấn.
   - Giải thích cách tính theo bậc thang (Progressive Disclosure) có thể mở rộng/thu gọn.
   - Gợi ý tiết kiệm điện thông minh (Smart Savings Advice) dựa trên phân tích bậc thang thực tế.
   - So sánh sản lượng với tháng trước và lưu trữ lịch sử tính toán vào `localStorage`.

2. **Kiến trúc mô-đun hóa sạch sẽ (Clean Modular Architecture)**:
   - `js/config.js`: Cấu hình biểu giá EVN, mức thuế VAT, hằng số hệ thống.
   - `js/calculator.js`: Xử lý toàn bộ logic nghiệp vụ tính toán (Pure Functions), dễ dàng kiểm thử đơn vị độc lập.
   - `js/recommendations.js`: Thuật toán tư vấn tiết kiệm điện và so sánh kỳ trước.
   - `js/storage.js`: Quản lý lưu trữ cục bộ lịch sử tính toán.
   - `js/app.js`: Điều khiển giao diện người dùng (UI Controller).

3. **Kiểm thử tự động chuyên sâu (Automated Testing)**:
   - Bộ kiểm thử tự động 25 ca kiểm thử bao phủ toàn bộ các kỹ thuật:
     - **Phân vùng tương đương (Equivalence Partitioning - EP)**
     - **Phân tích giá trị biên (Boundary Value Analysis - BVA)**
     - **Bảng quyết định & Thuế VAT (Decision Table & VAT)**
     - **Kiểm thử độ chịu lỗi & Bảo mật (Robustness & Security)**
   - Chạy kiểm thử linh hoạt qua CLI (`npm test` hoặc `node run-tests.js`) và qua giao diện trực quan `test-runner.html`.

---

## Cấu trúc thư mục

```text
├── index.html                 # Giao diện ứng dụng tính tiền điện người dùng
├── test-runner.html           # Bảng điều khiển kiểm thử tự động trực quan
├── run-tests.js               # CLI Test Runner cho terminal / CI-CD
├── package.json               # Cấu hình dự án & scripts kiểm thử
├── js/
│   ├── config.js              # Cấu hình biểu giá EVN & tùy chọn VAT
│   ├── calculator.js          # Logic nghiệp vụ tính bậc thang & validation
│   ├── recommendations.js     # Thuật toán gợi ý tiết kiệm & so sánh
│   ├── storage.js             # Quản lý lịch sử tính toán (localStorage)
│   ├── app.js                 # Điều khiển giao diện người dùng (UI Controller)
│   └── test-suite.js          # Tập hợp 25 ca kiểm thử tự động
├── BAO_CAO_KIEM_DINH_CLPM.md  # Báo cáo kiểm định & đánh giá chất lượng phần mềm
└── README.md                  # Hướng dẫn dự án và tài liệu
```

---

## Hướng dẫn sử dụng

### 1. Mở ứng dụng tính tiền điện

Mở file `index.html` trực tiếp bằng trình duyệt web bất kỳ hoặc dùng Live Server trong VS Code:

- **Tính theo công tơ**: Nhập **Chỉ số cũ** và **Chỉ số mới**, hệ thống sẽ tự động hiển thị sản lượng và tính toán.
- **Ước tính theo số kWh**: Chuyển sang tab "Ước Tính Theo Số kWh" và nhập số kWh dự kiến.
- Nhấn **Tính Tiền Điện** để xem kết quả chi tiết, gợi ý tiết kiệm, lưu vào lịch sử, sao chép hoặc in hóa đơn.

### 2. Chạy kiểm thử tự động

- **Qua dòng lệnh (Terminal)**:
  ```bash
  npm test
  ```
- **Qua trình duyệt**:
  Mở file `test-runner.html` bằng trình duyệt để xem báo cáo kiểm định trực quan với 100% test pass.
