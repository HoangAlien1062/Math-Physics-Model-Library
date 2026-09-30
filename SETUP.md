# HƯỚNG DẪN THIẾT LẬP HỆ THỐNG (SETUP.MD)
## Math & Physics Model Library

Tài liệu này hướng dẫn chi tiết cách cấu hình cơ sở dữ liệu Supabase, Google Cloud Project và Google Drive của Admin cho hệ thống **Math & Physics Model Library**.

---

## 1. NGUYÊN TẮC KIẾN TRÚC LƯU TRỮ

Hệ thống sử dụng **CHỈ 1 GOOGLE DRIVE TRUNG TÂM THUỘC VỀ ADMIN / CHỦ WEBSITE**:
* Người dùng bình thường **không cần kết nối Google Drive**, không cần cấp quyền OAuth.
* Mọi file HTML / ZIP do người dùng tải lên sẽ được Backend lưu trữ vào Google Drive của Admin.
* Supabase PostgreSQL **chỉ lưu trữ Metadata** (thông tin môn học, chủ đề, tag, tác giả, file_id). Tuyệt đối không lưu file binary nặng trong database.
* Mô hình được chạy trong môi trường **Sandboxed Iframe** an toàn, không có quyền truy cập cookie, localStorage hay token của ứng dụng chính.

---

## 2. THIẾT LẬP GOOGLE CLOUD & GOOGLE DRIVE ADMIN

### Bước 2.1: Tạo Google Cloud Project
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/).
2. Nhấn **Select a Project** -> **New Project**, đặt tên: `Math-Physics-Model-Library`.
3. Nhấn **Create**.

### Bước 2.2: Bật Google Drive API
1. Trong menu bên trái, vào **APIs & Services** -> **Library**.
2. Tìm kiếm `Google Drive API`.
3. Bấm vào **Google Drive API** và chọn **Enable**.

### Bước 2.3: Cấu hình OAuth Consent Screen
1. Vào **APIs & Services** -> **OAuth consent screen**.
2. Chọn loại User Type: **External** (hoặc Internal nếu dùng Google Workspace).
3. Nhập:
   * App name: `Math & Physics Model Library`
   * User support email: Email của bạn
   * Developer contact email: Email của bạn
4. Phần **Scopes**: Thêm scope `https://www.googleapis.com/auth/drive.file` (cho phép đọc/ghi các file do app tạo ra).
5. Phần **Test users**: Thêm email Google Admin của bạn.

### Bước 2.4: Tạo OAuth 2.0 Client ID
1. Vào **APIs & Services** -> **Credentials**.
2. Bấm **Create Credentials** -> **OAuth Client ID**.
3. Application type: **Web application**.
4. Authorized redirect URIs:
   * `http://localhost:3000/api/auth/callback/google` (Môi trường dev)
   * `https://your-production-domain.com/api/auth/callback/google` (Môi trường production)
5. Sao chép `Client ID` và `Client Secret`.

### Bước 2.5: Lấy Admin Refresh Token
Sử dụng [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground/):
1. Bấm biểu tượng bánh răng (Settings) góc trên bên phải.
2. Tích vào ô **Use your own OAuth credentials** và điền `Client ID`, `Client Secret` vừa tạo.
3. Trong danh sách API ở bên trái, tìm **Drive API v3** và chọn:
   * `https://www.googleapis.com/auth/drive.file`
4. Bấm **Authorize APIs** và đăng nhập bằng tài khoản Google Admin.
5. Bấm **Exchange authorization code for tokens**.
6. Sao chép giá trị của `Refresh token`.

### Bước 2.6: Chuẩn bị thư mục gốc trên Google Drive Admin
1. Mở [Google Drive](https://drive.google.com/) của tài khoản Admin.
2. Tạo một thư mục mới: `Math Physics Model Library`.
3. Mở thư mục này và copy đoạn ID trên thanh địa chỉ URL (ví dụ: `https://drive.google.com/drive/folders/1a2b3c4d5e...` -> ID là `1a2b3c4d5e...`).
4. Điền ID này vào biến `GOOGLE_DRIVE_ROOT_FOLDER_ID`.

---

## 3. THIẾT LẬP CƠ SỞ DỮ LIỆU SUPABASE

1. Truy cập [Supabase](https://supabase.com/) và tạo một Project mới.
2. Vào **SQL Editor** trong bảng điều khiển Supabase.
3. Mở file [supabase/migrations/001_initial_schema.sql](./supabase/migrations/001_initial_schema.sql) trong source code của dự án.
4. Dán toàn bộ nội dung SQL và nhấn **Run** để khởi tạo các bảng:
   * `profiles`
   * `categories`
   * `models`
   * `model_tags`
   * `favorites`
   * `recent_views`
   * `audit_logs`
   * Kèm toàn bộ chính sách Row Level Security (RLS) bảo vệ dữ liệu cá nhân.
5. Vào **Project Settings** -> **API** để lấy:
   * `Project URL` -> gán vào `SUPABASE_URL`
   * `anon public key` -> gán vào `SUPABASE_ANON_KEY`
   * `service_role secret key` -> gán vào `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. CẤU HÌNH BIẾN MÔI TRƯỜNG (.ENV.LOCAL)

Tạo file `.env.local` ở thư mục gốc của project (dựa theo `.env.example`):

```env
PORT=3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
SUPABASE_URL=https://your-supabase-id.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Drive Admin
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_admin_refresh_token
GOOGLE_DRIVE_ROOT_FOLDER_ID=your_root_folder_id
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

APP_SECRET=your_strong_random_secret_string
```

*Lưu ý: Nếu chưa cấu hình Google credentials ngay, hệ thống tích hợp sẵn `LocalFallbackStorageProvider` lưu trữ tạm trong thư mục `.data/storage`, cho phép bạn chạy và test thử ngay lập tức mà không gặp bất kỳ lỗi nào!*

---

## 5. KHỞI CHẠY DỰ ÁN

```bash
# 1. Cài đặt các thư viện cần thiết
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev
```

Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)
* Bạn có thể chuyển đổi linh hoạt giữa vai trò **User** và **Admin** ngay tại menu Avatar góc trên bên phải để kiểm thử phân quyền và IDOR protection.
