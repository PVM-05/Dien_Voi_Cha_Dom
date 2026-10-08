# Hệ Thống Tính Tiền Điện Sinh Hoạt & Kiểm Định Chất Lượng Phần Mềm (SQA)

> Ứng dụng Web tính tiền điện sinh hoạt bậc thang theo biểu giá tham chiếu Quyết định số 2941/QĐ-BCT, tích hợp thuật toán gợi ý tiết kiệm thông minh và bộ công cụ kiểm thử tự động đạt chuẩn chất lượng phần mềm (ISO/IEC 25010).

[![Tests](https://img.shields.io/badge/Tests-41%20Passed-brightgreen.svg)](test-runner.html)
[![Coverage](https://img.shields.io/badge/Coverage-100%25%20Core%20Logic-success.svg)](test-runner.html)
[![Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2025010-blue.svg)](test-runner.html)
[![Reference](https://img.shields.io/badge/Tariff-QD%202941%2FQD--BCT-informational.svg)](index.html)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

---

## 1. Điểm nổi bật của dự án

### Trải nghiệm người dùng thông minh (Consumer-First UI)
- **Thiết kế tối giản & Hiện đại**: Toàn bộ giao diện được xây dựng theo phong cách Typography-driven, phân cấp trực quan bằng độ tương phản và đường viền sạch sẽ, tuân thủ nguyên tắc không dùng icon hay emoji rườm rà.
- **2 Chế độ tính toán linh hoạt**:
  - *Theo chỉ số công tơ*: Nhập chỉ số cũ và mới của công tơ điện gia đình.
  - *Ước tính nhanh theo sản lượng (Quick Estimate)*: Nhập trực tiếp số kWh dự kiến tiêu thụ.
- **Xác thực thông minh theo thời gian thực (Smart Validation)**:
  - Tự động kiểm tra và tính toán ngay khi dữ liệu hợp lệ.
  - Giải thích rõ ràng lỗi logic (chỉ số mới nhỏ hơn cũ, ký tự lạ, số âm, số vượt ngưỡng).
  - Tự động nhận diện số thập phân và giải thích quy tắc làm tròn số học theo nguyên tắc đo đếm điện thương phẩm.
- **Kết quả trực quan nổi bật (Hero Result)**:
  - Hiển thị nổi bật tổng tiền thanh toán ở trung tâm.
  - Tóm tắt chi tiết tiền điện trước thuế, thuế suất VAT và tiền thuế.
  - Tính năng **Sao chép hóa đơn** (tích hợp cơ chế Clipboard Fallback an toàn) và **In hóa đơn** hỗ trợ định dạng in chuẩn (`@media print`).
- **Minh bạch cách tính (Progressive Disclosure)**: Khối thu gọn mở rộng chi tiết phân bổ 6 bậc thang, đơn giá và thành tiền của từng bậc.
- **Tư vấn tiết kiệm điện (Smart Recommendations)**: Phân tích bậc thang người dùng đang chạm tới, đưa ra dự báo số tiền tiết kiệm cụ thể nếu cắt giảm 10% điện năng tiêu thụ.
- **So sánh kỳ trước & Lịch sử tính toán (LocalStorage)**:
  - Cho phép nhập số kWh kỳ trước để so sánh mức tăng/giảm phần trăm.
  - Tự động lưu các lượt tính gần đây, hỗ trợ tải lại dữ liệu (**Xem lại**) và xóa từng lượt tính (**Xóa**).

---

## 2. Kiến trúc mã nguồn mô-đun hóa (Clean Architecture)

Mã nguồn được phân tách độc lập, tách biệt hoàn toàn giữa logic nghiệp vụ (Pure Functions) và giao diện điều khiển (UI Controller):

- `js/config.js`: Cấu hình biểu giá bậc thang tham chiếu (QĐ 2941/QĐ-BCT), các mức thuế VAT tham chiếu, hằng số giới hạn.
- `js/calculator.js`: Logic tính toán tiền điện 6 bậc, kiểm tra tính hợp lệ dữ liệu (Input Validation) và hàm định dạng tiền tệ.
- `js/recommendations.js`: Thuật toán phân tích bậc thang, tư vấn tiết kiệm điện và so sánh kỳ trước.
- `js/storage.js`: Quản lý lưu trữ cục bộ (`localStorage`) kèm cơ chế bộ nhớ đệm an toàn dự phòng.
- `js/app.js`: Điều khiển giao diện người dùng, lắng nghe sự kiện, hiển thị kết quả và xử lý clipboard.
- `js/test-suite.js`: Tập hợp toàn bộ 41 ca kiểm thử tự động.

---

## 3. Kiểm thử tự động chuyên sâu (Automated Testing Suite)

Hệ thống sở hữu bộ kiểm thử tự động gồm **41 ca kiểm thử**, đạt tỷ lệ thành công **100% (41/41 Passed)** với độ phủ toàn diện:

| Nhóm kiểm thử (Test Category) | Mã kiểm thử | Số lượng | Kỹ thuật & Mục tiêu kiểm thử |
|---|:---:|:---:|---|
| **Phân vùng tương đương (EP)** | `TC_EP_01` – `TC_EP_11` | 11 | Kiểm tra các lớp tương đương hợp lệ, rỗng, chữ cái, số âm, số thập phân, tràn số $>10$ triệu kWh. |
| **Phân tích giá trị biên (BVA)** | `TC_BVA_01` – `TC_BVA_09` | 9 | Kiểm thử chính xác tại các điểm chuyển giao bậc thang ($1, 50, 51, 100, 101, 200, 300, 400, 401\text{ kWh}$). |
| **Bảng quyết định & Thuế VAT** | `TC_VAT_01` – `TC_VAT_02` | 2 | Kiểm thử mức thuế suất VAT 10% chuẩn và miễn thuế VAT 0%. |
| **Bảo mật & Độ chịu lỗi (Security)** | `TC_SEC_01` – `TC_SEC_03` | 3 | Phòng chống tấn công tiêm mã Script XSS, chặn giá trị vô cực `Infinity` và khoảng trắng bất thường. |
| **Ước tính nhanh (Quick Estimate)** | `TC_QE_01` – `TC_QE_10` | 10 | Kiểm thử tính toán trực tiếp theo kWh, làm tròn số thập phân xuống/lên, bắt lỗi âm, rỗng, tràn số. |
| **Quản lý lịch sử (LocalStorage)** | `TC_HIST_01` – `TC_HIST_06` | 6 | Khởi tạo, lưu bản ghi công tơ, lưu ước tính, giới hạn tối đa 8 bản ghi, xóa từng mục theo ID, xóa tất cả. |

---

## 4. Cấu trúc thư mục

```text
├── index.html                 # Giao diện chính ứng dụng tính tiền điện người dùng
├── test-runner.html           # Bảng điều khiển kiểm thử tự động trực quan
├── run-tests.js               # CLI Test Runner thực thi trong terminal / CI-CD
├── generate-report.js         # Script tạo file báo cáo kiểm thử Excel
├── package.json               # Cấu hình dự án & scripts kiểm thử
├── js/
│   ├── config.js              # Cấu hình biểu giá tham chiếu & tùy chọn VAT
│   ├── calculator.js          # Logic nghiệp vụ tính bậc thang & validation
│   ├── recommendations.js     # Thuật toán gợi ý tiết kiệm & so sánh kỳ trước
│   ├── storage.js             # Quản lý lịch sử tính toán (localStorage)
│   ├── app.js                 # Điều khiển giao diện người dùng (UI Controller)
│   └── test-suite.js          # Bộ 41 ca kiểm thử tự động
└── README.md                  # Hướng dẫn dự án và tài liệu kỹ thuật
```

---

## 5. Hướng dẫn sử dụng & Kiểm thử

### 5.1. Sử dụng ứng dụng trên trình duyệt
Mở trực tiếp file `index.html` bằng trình duyệt web bất kỳ hoặc sử dụng Live Server trong VS Code:
1. Chọn chế độ tính (**Theo Chỉ Số Công Tơ** hoặc **Ước Tính Theo Số kWh**).
2. Nhập thông tin chỉ số điện.
3. Nhấn **Tính Tiền Điện** để xem kết quả tổng tiền, biểu phí từng bậc, lời khuyên tiết kiệm, sao chép hoặc in hóa đơn.
4. Lịch sử tính toán được lưu tự động, cho phép bấm **Xem lại** hoặc **Xóa** từng lượt tính.

### 5.2. Chạy kiểm thử tự động qua Terminal
Chạy toàn bộ 41 ca kiểm thử trực tiếp từ dòng lệnh:
```bash
npm test
```

### 5.3. Tạo báo cáo kiểm thử Excel
Tạo file bảng tính Excel chi tiết đầy đủ 41 ca kiểm thử theo mẫu:
```bash
npm run report
```
*(Lưu ý: File Excel tạo ra được cấu hình tự động bỏ qua qua `.gitignore` để không đẩy lên repository Git).*

### 5.4. Chạy kiểm thử qua giao diện trực quan
Mở file `test-runner.html` bằng trình duyệt để xem báo cáo kiểm định trực quan với bộ lọc từng nhóm ca kiểm thử và thời gian thực thi mili-giây.

---

## 6. Giấy phép (License)
Dự án được phát hành theo giấy phép [MIT License](LICENSE).
