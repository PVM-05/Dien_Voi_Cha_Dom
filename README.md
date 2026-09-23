# ⚡ Hệ Thống Tính Tiền Điện Sinh Hoạt & Kiểm Định Chất Lượng Phần Mềm (SQA)

> Dự án Web tính tiền điện bậc thang theo quy định EVN kết hợp bộ công cụ kiểm thử tự động, phục vụ môn học **Kiểm định và đánh giá chất lượng phần mềm (Software Testing & QA)**.

[![Tests](https://img.shields.io/badge/Tests-25%20Passed-brightgreen.svg)](test-runner.html)
[![Coverage](https://img.shields.io/badge/Coverage-100%25%20Core%20Logic-success.svg)](test-runner.html)
[![Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2025010-blue.svg)](BAO_CAO_KIEM_DINH_CLPM.md)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## 🌟 Điểm nổi bật của dự án

1. **Kiến trúc phân tách chuẩn SQA**:
   - `js/calculator.js`: Xử lý toàn bộ logic nghiệp vụ tính toán (Pure Functions), dễ dàng kiểm thử đơn vị độc lập.
   - `js/app.js`: Quản lý sự kiện và hiển thị DOM.
   - `test-runner.html`: Bảng điều khiển kiểm thử tự động (Test Runner Dashboard) trực quan, hiển thị kết quả và thời gian chạy tính bằng mili-giây.
2. **Kỹ thuật kiểm thử chuyên sâu**:
   - **Phân vùng tương đương (Equivalence Partitioning - EP)**: Kiểm tra các miền giá trị hợp lệ, rỗng, số âm, số thực, chuỗi ký tự, tràn ngưỡng.
   - **Phân tích giá trị biên (Boundary Value Analysis - BVA)**: Kiểm thử chính xác tại các điểm chuyển giao bậc thang ($0, 1, 50, 51, 100, 101, 200, 201, 300, 301, 400, 401\text{ kWh}$).
   - **Bảng quyết định & Thuế VAT (Decision Table)**: Hỗ trợ thuế suất 8%, 10% và miễn thuế 0%.
   - **Kiểm thử độ chịu lỗi & Bảo mật (Robustness & Security)**: Chặn tấn công tiêm mã XSS, số vô cực `Infinity`, khoảng trắng rỗng.
3. **Báo cáo chuẩn học thuật**:
   - Có sẵn file tài liệu [BAO_CAO_KIEM_DINH_CLPM.md](BAO_CAO_KIEM_DINH_CLPM.md) trình bày đồ thị dòng điều khiển (CFG), độ phức tạp Cyclomatic $V(G)=7$, và đánh giá theo chuẩn quốc tế **ISO/IEC 25010**.

---

## 📁 Cấu trúc thư mục

```text
├── index.html                 # Giao diện chính tính tiền điện sinh hoạt
├── test-runner.html           # Dashboard chạy 25+ ca kiểm thử tự động
├── js/
│   ├── calculator.js          # Logic nghiệp vụ tính bậc thang & validation
│   ├── app.js                 # Xử lý giao diện người dùng (UI Controller)
│   └── test-suite.js          # Tập hợp 25+ ca kiểm thử tự động (EP, BVA, VAT, Sec)
├── BAO_CAO_KIEM_DINH_CLPM.md  # Báo cáo kiểm định & đánh giá chất lượng phần mềm
└── README.md                  # Hướng dẫn dự án và cài đặt
```

---

## 🚀 Hướng dẫn sử dụng

### 1. Mở ứng dụng tính tiền điện

Mở file `index.html` trực tiếp bằng trình duyệt web bất kỳ (Chrome, Edge, Firefox, Cốc Cốc) hoặc dùng Live Server trong VS Code:

- Nhập **Chỉ số cũ** và **Chỉ số mới**.
- Chọn mức **Thuế VAT** (8%, 10% hoặc 0%).
- Nhấn **⚡ Tính Tiền Điện** để xem chi tiết tiền từng bậc thang.
- Có thể nhấn các nút **Dữ liệu mẫu kiểm thử nhanh** để xem ngay kết quả.

### 2. Mở Bảng điều khiển kiểm thử tự động

- Mở file `test-runner.html` bằng trình duyệt web.
- Hệ thống sẽ tự động thực thi toàn bộ **25 ca kiểm thử** và hiển thị tỷ lệ thành công (100% PASS), thời gian thực thi và chi tiết Input/Output từng ca.

---
