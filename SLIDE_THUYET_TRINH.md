# DÀN Ý SLIDE BÁO CÁO BẢO VỆ BÀI TẬP LỚN
## MÔN: ĐÁNH GIÁ VÀ KIỂM ĐỊNH CHẤT LƯỢNG PHẦN MỀM (SQA)
### Đề tài: Hệ thống tính tiền điện sinh hoạt 6 bậc thang theo quy định EVN

---

### SLIDE 1: TRANG TIÊU ĐỀ
- **Tên đề tài:** Kiểm định và Đánh giá Chất lượng Phần mềm: Hệ thống Tính Tiền Điện Sinh Hoạt Bậc Thang EVN
- **Môn học:** Đánh giá & Kiểm định chất lượng phần mềm
- **Trường:** Đại học Phenikaa - Khoa Công nghệ Thông tin
- **Giảng viên hướng dẫn:** [Tên Giảng Viên]
- **Nhóm sinh viên thực hiện:** Nhóm [Số nhóm] - [Họ tên thành viên, MSSV]

---

### SLIDE 2: ĐẶT VẤN ĐỀ & MỤC TIÊU DỰ ÁN
- **Bài toán thực tế:** Tính tiền điện sinh hoạt theo 6 bậc lũy tiến (Quyết định số 2941/QĐ-BCT của Bộ Công Thương).
- **Thách thức nghiệp vụ:** Ranh giới giữa các bậc thang rất nhạy cảm ($50, 100, 200, 300, 400\text{ kWh}$), dễ xảy ra lỗi tính thừa/thiếu tiền hoặc lỗi làm tròn thuế VAT.
- **Mục tiêu kiểm định:**
  - Áp dụng chuẩn mực các kỹ thuật Hộp đen (Black-box) và Hộp trắng (White-box).
  - Đạt 100% độ phủ mã nguồn (Code Coverage: Statement, Branch, MC/DC).
  - Tự động hóa kiểm thử để đo lường định lượng theo tiêu chuẩn ISO/IEC 25010.

---

### SLIDE 3: KIẾN TRÚC MÃ NGUỒN PHÂN TÁCH (MODULAR ARCHITECTURE)
- **Mô hình 3 lớp phân tách rõ rệt:**
  1. `index.html`: Giao diện người dùng thuần HTML5/CSS3 (Responsive, Dark/Light Mode).
  2. `js/app.js`: Lớp điều khiển sự kiện DOM, in ấn, sao chép kết quả.
  3. `js/calculator.js`: Module chứa pure functions (`validateInput`, `calculateElectricityBill`).
- **Ưu điểm kiến trúc:**
  - Logic tính toán không dính dáng đến DOM $\implies$ Cho phép thực thi Unit Test siêu tốc ($< 0.1\text{ms}$).
  - Dễ bảo trì: Khi EVN đổi biểu giá điện, chỉ cần sửa mảng cấu hình mà không đụng chạm đến giao diện.

---

### SLIDE 4: KẾ HOẠCH KIỂM THỬ (TEST PLAN)
- **Phạm vi In-Scope:**
  - Xác thực đầu vào (rỗng, số âm, ký tự chữ, số thập phân, tràn số, mới < cũ).
  - Thuật toán phân bổ sản lượng điện vào 6 bậc lũy tiến.
  - Tính thuế VAT (8%, 10%, 0%) và quy tắc làm tròn tiền tệ.
- **Phân loại mức độ lỗi (Defect Severity):** High, Medium, Low.
- **Công cụ áp dụng:** Microsoft Excel (Quản lý Test Cases & Defect Log), Git/GitHub, Automated Test Dashboard.

---

### SLIDE 5: KIỂM THỬ HỘP ĐEN (BLACK-BOX TESTING)
- **Phân vùng tương đương (Equivalence Partitioning - EP):**
  - Miền hợp lệ: $0 \le Old \le New \le 10.000.000$.
  - Miền không hợp lệ: Bỏ trống, ký tự lạ, số âm, số thực, $New < Old$.
- **Phân tích giá trị biên (Boundary Value Analysis - BVA):**
  - Kiểm thử tại các ranh giới: $0, 1, 50, 51, 100, 101, 200, 201, 300, 301, 400, 401\text{ kWh}$.
  - Chứng minh sự chuyển bậc chính xác tại $50 \to 51\text{ kWh}$ và $100 \to 101\text{ kWh}$.

---

### SLIDE 6: KIỂM THỬ HỘP TRẮNG (WHITE-BOX TESTING)
- **Đồ thị dòng điều khiển (Control Flow Graph - CFG):**
  - Xây dựng CFG cho hàm `validateInput` với 9 nút và 14 cạnh.
  - Độ phức tạp Cyclomatic: $V(G) = E - V + 2P = 14 - 9 + 2(1) = 7$.
  - Đảm bảo tối thiểu 7 đường dẫn cơ sở độc lập đều được kiểm thử.
- **Độ phủ mã nguồn (Coverage Metrics):**
  - **Statement Coverage:** 100% (toàn bộ dòng lệnh đều được chạy).
  - **Branch / Decision Coverage:** 100% (mọi nhánh True/False đều có ca kiểm thử).

---

### SLIDE 7: TIÊU CHUẨN NÂNG CAO: MC/DC & MÔ HÌNH RIPR
- **Độ phủ MC/DC (Modified Condition/Decision Coverage):**
  - Chứng minh các cặp độc lập cho biểu thức phức hợp: `numOld < 0 || numNew < 0`.
  - Chỉ cần $n + 1 = 3$ ca kiểm thử để phủ hoàn toàn điều kiện đa biến.
- **Mô hình RIPR (Reachability - Infection - Propagation - Revealability):**
  - Phân tích cơ chế phát hiện lỗi và hiện tượng "Đúng ngẫu nhiên" (Coincidental Correctness).
- **Cơ chế Test Oracles:**
  - True Oracle: Công thức toán độc lập từ văn bản Nhà nước.
  - Metamorphic Relations: Tính đơn điệu ($New_2 > New_1 \implies Total_2 \ge Total_1$).

---

### SLIDE 8: KIỂM THỬ ĐỘT BIẾN (MUTATION TESTING)
- **Mục tiêu:** Đo lường năng lực phát hiện lỗi của bộ Test Suite.
- **Thực nghiệm 10 Mutants:**
  - Đổi toán tử số học (AOR): $+ \to -$.
  - Đổi toán tử so sánh (ROR): $< \to \le$.
  - Đổi hằng số đơn giá (COR): $1.984 \to 1.980$.
- **Kết quả:** Tiêu diệt **9/10 Mutants** (1 mutant tương đương không đổi ngữ nghĩa).
- **Mutation Score hiệu dụng:** $\frac{9}{9} = \mathbf{100\%}$.

---

### SLIDE 9: QUẢN LÝ LỖI & THỰC THI KIỂM THỬ TỰ ĐỘNG
- **Theo dõi lỗi (Defect Tracking Log):**
  - Ghi nhận 5 lỗi thực tế trong quá trình phát triển (lỗi số âm, số thập phân, làm tròn VAT...).
  - Vòng đời lỗi: New $\to$ Assigned $\to$ Fixed $\to$ Re-tested $\to$ Closed (100% đã đóng).
- **Hệ thống Kiểm thử tự động:**
  - Chạy trên Web: `test-runner.html` (Giao diện trực quan, lọc test case).
  - Chạy trên Terminal: `node run-tests.js` (Tốc độ $< 50\text{ms}$, 25/25 Passed).

---

### SLIDE 10: ĐÁNH GIÁ CHẤT LƯỢNG (ISO/IEC 25010) & KẾT LUẬN
- **Đánh giá theo 8 đặc tính ISO/IEC 25010:**
  - *Chức năng:* Tính toán chính xác 100% theo quy định EVN.
  - *Hiệu năng:* Phản hồi tức thì ($< 1\text{ms}$ / lượt tính).
  - *Độ tin cậy & Bảo mật:* Chặn triệt để số âm, tràn số, mã độc XSS.
  - *Khả năng bảo trì:* Code phân lớp, dễ cấu hình bảng giá.
- **Sản phẩm bàn giao đầy đủ:**
  - 📄 Tài liệu SRS (`srs_template-vi.docx`).
  - 📄 Tài liệu Test Plan (`Test_Plan_Template_Vn.docx`).
  - 📊 Bảng tính Test Cases & Defect Log (`Test_Case_Template.xlsx`).
  - 🌐 Mã nguồn GitHub: `https://github.com/PVM-05/Dien_Voi_Cha_Dom`.
