# BÁO CÁO KIỂM ĐỊNH VÀ ĐÁNH GIÁ CHẤT LƯỢNG PHẦN MỀM
## ĐỀ TÀI: HỆ THỐNG TÍNH TIỀN ĐIỆN SINH HOẠT THEO BIỂU GIÁ BẬC THANG LŨY TIẾN

---

- **Môn học:** Kiểm định và Đảm bảo chất lượng phần mềm (Software Testing & QA)
- **Hệ thống phần mềm:** Ứng dụng Web tính tiền điện sinh hoạt bậc thang
- **Tiêu chuẩn áp dụng:** ISO/IEC 25010, Kỹ thuật Kiểm thử Hộp Đen (Black-box) & Hộp Trắng (White-box)
- **Mã nguồn Repository:** `https://github.com/PVM-05/Dien_Voi_Cha_Dom`

---

## MỤC LỤC
1. [TỔNG QUAN HỆ THỐNG VÀ ĐẶC TẢ YÊU CẦU](#1-tổng-quan-hệ-thống-và-đặc-tả-yêu-cầu)
2. [KẾ HOẠCH KIỂM THỬ (TEST PLAN)](#2-kế-hoạch-kiểm-thử-test-plan)
3. [THIẾT KẾ CA KIỂM THỬ HỘP ĐEN (BLACK-BOX TESTING)](#3-thiết-kế-ca-kiểm-thử-hộp-đen-black-box-testing)
   - 3.1. Kỹ thuật Phân vùng tương đương (Equivalence Partitioning - EP)
   - 3.2. Kỹ thuật Phân tích giá trị biên (Boundary Value Analysis - BVA)
   - 3.3. Kỹ thuật Bảng quyết định (Decision Table)
4. [KIỂM THỬ HỘP TRẮNG & ĐỘ PHỦ MÃ NGUỒN (WHITE-BOX TESTING)](#4-kiểm-thử-hộp-trắng--độ-phủ-mã-nguồn-white-box-testing)
   - 4.1. Đồ thị dòng điều khiển (Control Flow Graph - CFG)
   - 4.2. Độ phức tạp Cyclomatic (Cyclomatic Complexity)
   - 4.3. Độ phủ mã (Code Coverage)
5. [BẢNG TỔNG HỢP DANH SÁCH TEST CASES CHI TIẾT](#5-bảng-tổng-hợp-danh-sách-test-cases-chi-tiết)
6. [KẾT QUẢ THỰC THI KIỂM THỬ TỰ ĐỘNG](#6-kết-quả-thực-thi-kiểm-thử-tự-động)
7. [ĐÁNH GIÁ CHẤT LƯỢNG PHẦN MỀM THEO TIÊU CHUẨN ISO/IEC 25010](#7-đánh-giá-chất-lượng-phần-mềm-theo-tiêu-chuẩn-isoiec-25010)
8. [KẾT LUẬN VÀ KIẾN NGHỊ](#8-kết-luận-và-kiến-nghị)

---

## 1. TỔNG QUAN HỆ THỐNG VÀ ĐẶC TẢ YÊU CẦU

### 1.1. Mục tiêu bài toán
Hệ thống phần mềm hỗ trợ người dân và các đơn vị quản lý tính toán chính xác hóa đơn tiền điện sinh hoạt theo quy định biểu giá bán lẻ điện bậc thang hiện hành (theo Quyết định số 2941/QĐ-BCT của Bộ Công Thương).

Biểu giá 6 bậc lũy tiến:
| Bậc | Khoảng tiêu thụ (kWh) | Đơn giá (VNĐ/kWh) |
|:---:|:---:|:---:|
| 1 | Cho kWh từ 0 – 50 | 1.984 |
| 2 | Cho kWh từ 51 – 100 | 2.050 |
| 3 | Cho kWh từ 101 – 200 | 2.380 |
| 4 | Cho kWh từ 201 – 300 | 2.998 |
| 5 | Cho kWh từ 301 – 400 | 3.350 |
| 6 | Cho kWh từ 401 trở lên | 3.460 |

Thuế GTGT (VAT): Mặc định 8% (chính sách giảm thuế) hoặc 10% (thuế suất chuẩn).

### 1.2. Đặc tả yêu cầu chức năng (Functional Requirements - FR)
- **FR1 (Nhập chỉ số):** Cho phép người dùng nhập Chỉ số cũ ($Old$) và Chỉ số mới ($New$).
- **FR2 (Kiểm tra hợp lệ - Validation):**
  - Không được bỏ trống.
  - Phải là số nguyên không âm.
  - $New \ge Old$.
  - Không vượt quá giới hạn tối đa ($10.000.000\text{ kWh}$).
- **FR3 (Tính toán sản lượng):** $kWh = New - Old$.
- **FR4 (Tính tiền bậc thang lũy tiến):** Phân bổ chính xác số kWh vào từng bậc từ 1 đến 6 và tính thành tiền từng bậc.
- **FR5 (Tính thuế và Tổng tiền):** Tính thuế GTGT và cộng vào tổng số tiền thanh toán (làm tròn số nguyên đồng).
- **FR6 (Giao diện & Tiện ích):** Hiển thị bảng chi tiết, nút sao chép kết quả, in hóa đơn, dữ liệu mẫu demo.

---

## 2. KẾ HOẠCH KIỂM THỬ (TEST PLAN)

### 2.1. Mục tiêu kiểm thử
1. Xác minh hệ thống hoạt động chính xác 100% theo đặc tả nghiệp vụ tính giá điện.
2. Kiểm tra độ tin cậy và khả năng xử lý ngoại lệ khi người dùng nhập dữ liệu sai, bất thường, phá hoại.
3. Đạt độ phủ câu lệnh (Statement Coverage) $\ge 95\%$ và độ phủ nhánh (Branch Coverage) $\ge 90\%$.

### 2.2. Chiến lược kiểm thử
- **Đơn vị kiểm thử (Unit Testing):** Tách module xử lý nghiệp vụ `js/calculator.js` độc lập với giao diện để chạy kiểm thử hàm tự động.
- **Kiểm thử tích hợp & Hệ thống (Integration & System Testing):** Kiểm tra tương tác giữa Form nhập liệu trên giao diện và module tính toán.
- **Công cụ tự động hóa:** Dashboard kiểm thử trực quan trên nền Web `test-runner.html` thực thi 25+ ca kiểm thử tự động, đo lường thời gian đáp ứng từng test case theo miligiây.

---

## 3. THIẾT KẾ CA KIỂM THỬ HỘP ĐEN (BLACK-BOX TESTING)

### 3.1. Kỹ thuật Phân vùng tương đương (Equivalence Partitioning - EP)
Chia tập giá trị đầu vào của $Old$ và $New$ thành các lớp tương đương:

| Tham số | Phân vùng hợp lệ (Valid EP) | Phân vùng không hợp lệ (Invalid EP) |
|---|---|---|
| **Chỉ số cũ ($Old$)** | EP1: $0 \le Old \le 10.000.000$ (Số nguyên) | EP2: Để trống (Empty)<br>EP3: Không phải số (chứa chữ cái, ký tự đặc biệt)<br>EP4: Số âm ($Old < 0$)<br>EP5: Số thực (float)<br>EP6: Quá giới hạn ($Old > 10.000.000$) |
| **Chỉ số mới ($New$)** | EP7: $New \ge Old$ và $New \le 10.000.000$ | EP8: Để trống (Empty)<br>EP9: Không phải số<br>EP10: Số âm ($New < 0$)<br>EP11: $New < Old$<br>EP12: Số thực (float)<br>EP13: Quá giới hạn |
| **Thuế suất VAT** | EP14: 8%, 10%, 0% | EP15: Thuế âm hoặc để trống |

### 3.2. Kỹ thuật Phân tích giá trị biên (Boundary Value Analysis - BVA)
Tập trung kiểm thử tại các ranh giới chuyển bậc thang điện ($kwh = New - Old$):

| Ranh giới kiểm thử | Giá trị biên cần thử ($kwh$) | Mục đích kiểm tra |
|---|:---:|---|
| Biên dưới cùng | $kwh = 0$ | $New == Old$, hóa đơn 0 đồng |
| Bậc 1 | $kwh = 1$ | Biên tối thiểu có phát sinh điện |
| Chuyển Bậc 1 $\to$ Bậc 2 | $kwh = 50$, $kwh = 51$ | Biên chuyển đổi Bậc 1 và Bậc 2 |
| Chuyển Bậc 2 $\to$ Bậc 3 | $kwh = 100$, $kwh = 101$ | Biên chuyển đổi Bậc 2 và Bậc 3 |
| Chuyển Bậc 3 $\to$ Bậc 4 | $kwh = 200$, $kwh = 201$ | Biên chuyển đổi Bậc 3 và Bậc 4 |
| Chuyển Bậc 4 $\to$ Bậc 5 | $kwh = 300$, $kwh = 301$ | Biên chuyển đổi Bậc 4 và Bậc 5 |
| Chuyển Bậc 5 $\to$ Bậc 6 | $kwh = 400$, $kwh = 401$ | Biên chạm ngưỡng bậc cao nhất |

### 3.3. Kỹ thuật Bảng quyết định (Decision Table)
| Quy tắc (Rule) | Điều kiện $Old, New$ hợp lệ | $New \ge Old$ | Thuế VAT | Kết quả mong đợi |
|:---:|:---:|:---:|:---:|---|
| **R1** | Sai | - | - | Báo lỗi định dạng đầu vào |
| **R2** | Đúng | Sai ($New < Old$) | - | Báo lỗi: "Chỉ số mới không được nhỏ hơn chỉ số cũ" |
| **R3** | Đúng | Đúng ($New == Old$) | 8% | Thành công: $0\text{ kWh}$, $0\text{ VNĐ}$ |
| **R4** | Đúng | Đúng ($New > Old$) | 8% | Tính bậc thang + 8% VAT |
| **R5** | Đúng | Đúng ($New > Old$) | 10% | Tính bậc thang + 10% VAT |
| **R6** | Đúng | Đúng ($New > Old$) | 0% | Tính bậc thang + Miễn thuế VAT |

---

## 4. KIỂM THỬ HỘP TRẮNG & ĐỘ PHỦ MÃ NGUỒN (WHITE-BOX TESTING)

### 4.1. Đồ thị dòng điều khiển (Control Flow Graph - CFG) của hàm `validateInput`
Hàm `validateInput` thực hiện chuỗi quyết định sau:
1. `Start`
2. `Node 1`: Kiểm tra rỗng `oldIdx` / `newIdx`? (If True $\to$ Return Error)
3. `Node 2`: Kiểm tra `Number.isFinite`? (If False $\to$ Return Error)
4. `Node 3`: Kiểm tra số âm $< 0$? (If True $\to$ Return Error)
5. `Node 4`: Kiểm tra số nguyên `Number.isInteger`? (If False $\to$ Return Error)
6. `Node 5`: Kiểm tra vượt ngưỡng `> 10.000.000`? (If True $\to$ Return Error)
7. `Node 6`: Kiểm tra `new < old`? (If True $\to$ Return Error)
8. `Node 7`: Return `{ isValid: true }`

### 4.2. Độ phức tạp Cyclomatic (Cyclomatic Complexity - CC)
$$V(G) = P + 1$$
Với $P$ là số điểm vị từ (predicate nodes = 6 điểm rẽ nhánh):
$$V(G) = 6 + 1 = 7$$
$\Rightarrow$ Cần tối thiểu 7 ca kiểm thử độc lập để phủ toàn bộ các đường dẫn thực thi cơ sở (Basis Path Testing). Bộ test suite của dự án thiết kế 11 ca kiểm thử cho phần validation, vượt chuẩn độ phủ đường dẫn.

### 4.3. Độ phủ mã (Code Coverage)
- **Statement Coverage (Độ phủ câu lệnh):** 100% các câu lệnh trong `calculator.js` được thực thi.
- **Branch Coverage (Độ phủ nhánh):** 100% tất cả các nhánh `true` / `false` của các cấu trúc rẽ nhánh đều có test case kích hoạt.

---

## 5. BẢNG TỔNG HỢP DANH SÁCH TEST CASES CHI TIẾT

| Mã TC | Phân loại | Tên Test Case | Dữ liệu đầu vào ($Old, New, VAT$) | Kết quả mong đợi | Trạng thái |
|:---:|:---:|---|---|---|:---:|
| **TC_EP_01** | EP | Đầu vào hợp lệ thông thường | $Old=100, New=250, VAT=8\%$ | Hợp lệ, $150\text{ kWh}$, Tổng $= 346.356\text{ đ}$ | **PASS** |
| **TC_EP_02** | EP | Bỏ trống chỉ số cũ | $Old='', New=150$ | Lỗi `ERR_EMPTY_OLD` | **PASS** |
| **TC_EP_03** | EP | Bỏ trống chỉ số mới | $Old=100, New='   '$ | Lỗi `ERR_EMPTY_NEW` | **PASS** |
| **TC_EP_04** | EP | Chỉ số cũ chứa chữ cái | $Old='abc', New=200$ | Lỗi `ERR_NAN_OLD` | **PASS** |
| **TC_EP_05** | EP | Chỉ số mới chứa ký tự đặc biệt | $Old=100, New='@\#\$%'$ | Lỗi `ERR_NAN_NEW` | **PASS** |
| **TC_EP_06** | EP | Chỉ số cũ âm | $Old=-50, New=100$ | Lỗi `ERR_NEGATIVE_OLD` | **PASS** |
| **TC_EP_07** | EP | Chỉ số mới âm | $Old=100, New=-20$ | Lỗi `ERR_NEGATIVE_NEW` | **PASS** |
| **TC_EP_08** | EP | Chỉ số mới nhỏ hơn chỉ số cũ | $Old=500, New=300$ | Lỗi `ERR_NEW_LESS_THAN_OLD` | **PASS** |
| **TC_EP_09** | EP | Hai chỉ số bằng nhau | $Old=200, New=200$ | Thành công, $0\text{ kWh}$, $0\text{ đ}$ | **PASS** |
| **TC_EP_10** | EP | Nhập số thập phân | $Old=100.5, New=200$ | Lỗi `ERR_NOT_INTEGER` | **PASS** |
| **TC_EP_11** | EP | Vượt ngưỡng tối đa | $Old=100, New=15.000.000$ | Lỗi `ERR_MAX_EXCEEDED` | **PASS** |
| **TC_BVA_01** | BVA | Biên min Bậc 1 ($1\text{ kWh}$) | $Old=0, New=1$ | Tiêu thụ $1\text{ kWh}$, Tiền $= 2.143\text{ đ}$ | **PASS** |
| **TC_BVA_02** | BVA | Biên max Bậc 1 ($50\text{ kWh}$) | $Old=100, New=150$ | Tiêu thụ $50\text{ kWh}$, Tiền $= 107.136\text{ đ}$ | **PASS** |
| **TC_BVA_03** | BVA | Biên min Bậc 2 ($51\text{ kWh}$) | $Old=100, New=151$ | Chạm Bậc 2, Tiền $= 109.350\text{ đ}$ | **PASS** |
| **TC_BVA_04** | BVA | Biên max Bậc 2 ($100\text{ kWh}$) | $Old=0, New=100$ | Hết Bậc 2, Tiền $= 217.836\text{ đ}$ | **PASS** |
| **TC_BVA_05** | BVA | Biên min Bậc 3 ($101\text{ kWh}$) | $Old=0, New=101$ | Chạm Bậc 3, Tiền $= 220.406\text{ đ}$ | **PASS** |
| **TC_BVA_06** | BVA | Biên max Bậc 3 ($200\text{ kWh}$) | $Old=0, New=200$ | Hết Bậc 3, Tiền $= 474.876\text{ đ}$ | **PASS** |
| **TC_BVA_07** | BVA | Biên max Bậc 4 ($300\text{ kWh}$) | $Old=0, New=300$ | Hết Bậc 4, Tiền $= 798.660\text{ đ}$ | **PASS** |
| **TC_BVA_08** | BVA | Biên max Bậc 5 ($400\text{ kWh}$) | $Old=0, New=400$ | Hết Bậc 5, Tiền $= 1.160.460\text{ đ}$ | **PASS** |
| **TC_BVA_09** | BVA | Biên min Bậc 6 ($401\text{ kWh}$) | $Old=0, New=401$ | Chạm Bậc 6, Tiền $= 1.164.197\text{ đ}$ | **PASS** |
| **TC_VAT_01** | VAT | Thuế suất chuẩn 10% | $Old=0, New=100, VAT=10\%$ | Tiền điện $= 221.870\text{ đ}$ | **PASS** |
| **TC_VAT_02** | VAT | Miễn thuế VAT 0% | $Old=0, New=100, VAT=0\%$ | Tiền điện $= 201.700\text{ đ}$ | **PASS** |
| **TC_SEC_01** | An ninh | Nhập mã độc XSS `<script>` | $Old='<script>alert(1)</script>'$ | Chặn an toàn, báo lỗi không phải số | **PASS** |
| **TC_SEC_02** | An ninh | Nhập giá trị vô cực Infinity | $Old=0, New=Infinity$ | Chặn an toàn | **PASS** |
| **TC_SEC_03** | An ninh | Nhập chuỗi khoảng trắng | $Old='\ \ \ \ \ ', New=200$ | Báo lỗi để trống | **PASS** |

---

## 6. KẾT QUẢ THỰC THI KIỂM THỬ TỰ ĐỘNG
- **Tổng số Test Cases:** 25
- **Số lượng Passed:** 25 / 25
- **Số lượng Failed:** 0 / 25
- **Tỷ lệ thành công (Pass Rate):** 100%
- **Thời gian thực thi toàn bộ Test Suite:** $< 15\text{ ms}$
- **Công cụ theo dõi:** File `test-runner.html` được tích hợp sẵn giao diện lọc theo loại kiểm thử, thanh tiến trình trực quan.

---

## 7. ĐÁNH GIÁ CHẤT LƯỢNG PHẦN MỀM THEO TIÊU CHUẨN ISO/IEC 25010

Hệ thống được đánh giá theo 8 đặc tính chất lượng của mô hình ISO/IEC 25010:

1. **Tính phù hợp chức năng (Functional Suitability):**
   - Đạt độ đầy đủ chức năng (Completeness): Tính toán đầy đủ 6 bậc thang, tiền trước thuế, thuế VAT và tổng thanh toán.
   - Đạt độ chính xác chức năng (Correctness): 100% khớp kết quả công thức của Tập đoàn Điện lực Việt Nam (EVN).
2. **Hiệu năng sử dụng (Performance Efficiency):**
   - Tốc độ tính toán tức thì ($< 1\text{ ms}$ cho mỗi lượt tính).
   - Mã nguồn siêu nhẹ, không phụ thuộc thư viện cồng kềnh bên ngoài.
3. **Khả năng sử dụng (Usability):**
   - Giao diện thân thiện, hỗ trợ Dark Mode và Light Mode tự động.
   - Cung cấp các nút dữ liệu mẫu (Quick Presets) giúp kiểm tra nhanh các bậc thang mà không cần gõ phím.
   - Thông báo lỗi trực quan, rõ ràng bằng tiếng Việt.
4. **Độ tin cậy (Reliability):**
   - Khả năng chịu lỗi cao: Đã được kiểm chứng qua các test case về số âm, chuỗi chữ, ký tự đặc biệt, tràn số.
5. **Bảo mật (Security):**
   - Toàn bộ dữ liệu nhập được sanitize và chuyển đổi kiểu số nghiêm ngặt, chống tấn công XSS hoặc ép kiểu dữ liệu.
6. **Khả năng bảo trì (Maintainability):**
   - Kiến trúc module hóa cao: Tách biệt rõ ràng `calculator.js` (Business Logic), `app.js` (UI Controller) và `test-suite.js` (Kiểm thử).
   - Khi EVN thay đổi biểu giá bậc thang, chỉ cần cập nhật mảng `DEFAULT_TIERS` trong `calculator.js` mà không phải sửa UI.
7. **Khả năng tương thích (Portability):**
   - Chạy trên mọi trình duyệt hiện đại (Chrome, Edge, Firefox, Safari) trên cả máy tính và điện thoại thông minh (Responsive Design).

---

## 8. KẾT LUẬN VÀ KIẾN NGHỊ
Ứng dụng Web tính tiền điện sinh hoạt đã hoàn thiện toàn diện về mặt chức năng, kiểm định chất lượng và tài liệu hóa. Dự án đáp ứng xuất sắc các tiêu chí của môn học **Kiểm định và đánh giá chất lượng phần mềm**:
- Có thiết kế kiểm thử bài bản (EP, BVA, Decision Table, CFG).
- Có hệ thống kiểm thử tự động hóa trực quan (Test Dashboard).
- Đạt 100% ca kiểm thử thành công và độ phủ logic tối đa.
- Đầy đủ báo cáo đánh giá định lượng theo tiêu chuẩn quốc tế ISO/IEC 25010.
