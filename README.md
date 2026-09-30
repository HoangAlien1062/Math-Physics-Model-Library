# Math & Physics Model Library 🧮 ⚡

Thư viện mô hình tương tác Toán học và Vật lý hoàn chỉnh, được xây dựng theo kiến trúc hiện đại, cho phép quản lý, hiển thị và chạy trực tiếp các mô hình HTML/CSS/JavaScript trong môi trường Sandbox an toàn ngay trên trình duyệt web.

---

## ✨ ĐẶC ĐIỂM NỔI BẬT

1. **Mô hình tương tác thực sự**:
   * Mô hình chạy trực tiếp bằng HTML5 Canvas, SVG, WebGL và JavaScript, không phải video hay ảnh chụp giả lập.
   * Kéo thả, điều chỉnh slider tham số, xem đồ thị, chu kỳ, áp suất và quỹ đạo thời gian thực.
   * Chế độ xem thông thường, phóng to toàn màn hình (Fullscreen API), hoặc mở trong tab riêng biệt.

2. **Kiến trúc lưu trữ Google Drive Admin tập trung**:
   * **Chỉ sử dụng 1 Google Drive trung tâm duy nhất của Admin**: Người dùng bình thường không cần kết nối Google Drive, không cần cấp quyền OAuth.
   * File tải lên của người dùng được tự động phân vùng lưu trữ theo cấu trúc thư mục chuẩn trên Google Drive của Admin:
     ```text
     Math Physics Model Library/
     ├── Public Models/
     │   ├── Math/
     │   └── Physics/
     └── User Uploads/
         ├── user_001/
         │   ├── Math/
         │   └── Physics/
         └── ...
     ```
   * **Database chỉ lưu metadata**: Supabase / PostgreSQL chỉ lưu thông tin môn, chủ đề, tag, file_id. Tuyệt đối không lưu binary files vào database.

3. **Môi trường Runtime mô hình an toàn (Isolated Sandbox)**:
   * Chạy trong `iframe` có sandbox nghiêm ngặt (`sandbox="allow-scripts allow-forms allow-downloads allow-pointer-lock"`).
   * **Cách ly Origin hoàn toàn**: JavaScript của mô hình không thể truy cập Cookie, `localStorage`, `sessionStorage`, token OAuth hoặc can thiệp vào DOM của trang chính.
   * Hỗ trợ giao thức `postMessage` hai chiều (`MODEL_READY`, `MODEL_RESIZE`, `MODEL_ERROR`).

4. **Hỗ trợ cả File HTML đơn và Project ZIP nén**:
   * Tự động quét file entry point (`index.html`, `index.htm` hoặc file được chỉ định).
   * Hỗ trợ file cấu hình `model.json` (tự động đọc tiêu đề, chủ đề, tác giả, tags, version).
   * Tích hợp cơ chế phòng chống tấn công Path Traversal (`../../`) và Zip Bomb.

5. **Bộ lọc khoa học & Tìm kiếm thông minh**:
   * Hai môn học chuyên biệt: **TOÁN HỌC** và **VẬT LÝ** (Đại số, Giải tích, Hình học, Cơ học, Nhiệt học, Dao động, Sóng...).
   * Tìm kiếm toàn diện theo tên, mô tả, môn học, chủ đề và hashtag với cơ chế **Debounce** chống spam request.
   * Sắp xếp theo: Mới cập nhật, Mới thêm, Tên A-Z, Tên Z-A.
   * Đánh dấu yêu thích (Favorites) và theo dõi lịch sử xem gần đây (Recent Views) đồng bộ đa thiết bị.

6. **Phân quyền chặt chẽ & IDOR Protection**:
   * Mô hình người dùng tải lên mặc định là **PRIVATE** (chỉ chủ sở hữu và Admin mới có quyền xem, chỉnh sửa hoặc xóa).
   * Khi xóa mô hình: tự động xóa metadata trong DB và xóa sạch tệp tin trên Google Drive Admin.

---

## 🚀 CÁCH KHỞI CHẠY DỰ ÁN

### 1. Cài đặt Dependencies
```bash
npm install
```

### 2. Cấu hình Môi trường
Sao chép file `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```
*(Chi tiết thiết lập Google Drive Admin và Supabase xem tại [SETUP.md](./SETUP.md))*.

### 3. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Truy cập ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**

### 4. Chạy kiểm thử tự động (Test Suite)
```bash
npm test
```

---

## 🏛️ KIẾN TRÚC THƯ MỤC DỰ ÁN

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── models/            # REST API CRUD mô hình
│   │   │   │   └── [id]/runner/   # Endpoint phục vụ Model Runner an toàn
│   │   │   ├── upload/            # API xử lý upload, giải nén ZIP & đẩy lên Drive
│   │   │   ├── storage/status/    # API trạng thái & đồng bộ Google Drive
│   │   │   ├── categories/        # API danh mục môn học
│   │   │   ├── favorites/         # API mục yêu thích
│   │   │   └── recent/            # API lịch sử xem gần đây
│   │   ├── math/                  # Trang thư viện Toán học (/math)
│   │   ├── physics/               # Trang thư viện Vật lý (/physics)
│   │   ├── models/[id]/           # Trang chi tiết & viewer mô hình (/models/:id)
│   │   ├── my-library/            # Thư viện cá nhân của người dùng (/my-library)
│   │   ├── admin/                 # Bảng điều khiển Quản trị viên (/admin)
│   │   ├── settings/              # Cài đặt tài khoản & lưu trữ (/settings)
│   │   └── page.tsx               # Trang chủ (Hero, Featured, Recent, Favorites)
│   ├── components/
│   │   ├── layout/                # Navbar, Footer, Shell
│   │   ├── model/                 # ModelCard, ModelViewer, UploadModal, SubjectView
│   │   └── ui/                    # Toast notifications, Dialogs
│   ├── lib/
│   │   ├── auth/                  # Quản lý phiên, kiểm tra quyền & IDOR protection
│   │   ├── database/              # Quản lý Database & dữ liệu mô hình
│   │   ├── security/              # Phòng chống Path traversal, Zip bomb, sanitization
│   │   └── storage/               # StorageProvider, GoogleDriveProvider & LocalFallback
│   └── types/                     # Định nghĩa TypeScript interfaces
├── supabase/
│   └── migrations/                # SQL Schema migration cho Supabase PostgreSQL
├── public/
│   └── demo-models/               # Các mô hình mẫu thực tế (Quadratic, Pendulum, Ideal Gas)
├── SETUP.md                       # Tài liệu hướng dẫn thiết lập Google Cloud & Supabase
└── README.md                      # Tài liệu tổng quan dự án
```

---

## 🧪 CÁC MÔ HÌNH MẪU ĐI KÈM

Hệ thống được tích hợp sẵn 3 mô hình tương tác hoàn chỉnh:
1. **Khảo sát hàm số bậc hai $y = ax^2 + bx + c$** (Toán - Hàm số/Đại số):
   * Điều chỉnh các hệ số $a, b, c$ thời gian thực.
   * Tự động tính đỉnh Parabol, trục đối xứng, biệt thức $\Delta$ và nghiệm.
   * Vẽ đồ thị Parabol tương tác trên HTML5 Canvas với lưới tọa độ.
2. **Mô phỏng con lắc đơn & Dao động điều hòa** (Vật lý - Dao động/Cơ học):
   * Tích phân số học thời gian thực mô phỏng chuyển động con lắc với góc $\theta(t)$ và vận tốc góc $\omega(t)$.
   * Tùy chỉnh chiều dài dây $L$, gia tốc trọng trường $g$, lực cản không khí.
   * Cho phép dùng chuột/chạm kéo thả vật nặng để thả góc ban đầu.
3. **Mô phỏng khí lý tưởng & Thuyết động học phân tử** (Vật lý - Nhiệt học):
   * Hàng chục phân tử khí chuyển động hỗn loạn va chạm thành bình trong xi lanh có piston.
   * Thanh trượt điều chỉnh nhiệt độ $T$, thể tích $V$ (vị trí piston) và số hạt $N$.
   * Đồng hồ áp kế hiển thị áp suất thực tế $P = \frac{N k_B T}{V}$.
