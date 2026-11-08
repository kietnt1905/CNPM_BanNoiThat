# Nội Thất TK House

Website thương mại điện tử bán nội thất: xem sản phẩm theo danh mục/bộ sưu tập, giỏ hàng (có mua hàng vãng lai), đặt hàng, thanh toán VNPay, đăng nhập bằng email (OTP) hoặc Google, và trang quản trị (sản phẩm, danh mục, đơn hàng, người dùng, thống kê).

## Công nghệ

| Phần | Công nghệ |
| --- | --- |
| Backend (`backend/`) | Laravel 13, PHP ≥ 8.3, Sanctum (token), Socialite (Google), MySQL (SQLite cho test) |
| Frontend (`frontend/`) | React 19, Vite 6, Tailwind CSS 3, React Router 7, Axios, Framer Motion, Recharts |
| Thanh toán | VNPay Sandbox |
| Triển khai | Docker, Docker Compose |

## Cấu trúc thư mục

```
.
├── backend/              # Laravel API (routes/api.php chứa toàn bộ endpoint)
├── frontend/             # React SPA
├── Dockerfile            # 2 target: backend, frontend
├── docker-compose.yml    # Chạy local: db + backend + frontend
```

## Chạy bằng Docker (khuyến nghị)

Yêu cầu: Docker Desktop (có BuildKit).

**1. Tạo file `backend/.env`** (file này không được commit):

```bash
cp backend/.env.example backend/.env
```

**2. Tạo `APP_KEY`** và dán vào dòng `APP_KEY=` trong `backend/.env`:

```bash
docker run --rm php:8.3-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

**3. (Tùy chọn) Điền cấu hình dịch vụ ngoài** trong `backend/.env` nếu cần dùng:
- Gửi OTP qua email: `MAIL_*`
- Đăng nhập Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- VNPay: `VNPAY_TMN_CODE`, `VNPAY_HASH_SECRET`, `VNPAY_RETURN_URL`

**4. Chạy:**

```bash
docker compose up --build
```

| Dịch vụ | Địa chỉ |
| --- | --- |
| Website | http://localhost:5173 |
| API | http://localhost:8000/api |
| Health check | http://localhost:8000/up |

Khi khởi động, backend tự động chạy migrate và nạp dữ liệu mẫu nếu database còn trống. Docker Compose ghi đè cấu hình database trong `.env` để dùng MySQL chạy trong container (host `db`).

Một số lệnh hữu ích:

```bash
docker compose logs -f backend     # xem log backend
docker compose down                # dừng (giữ dữ liệu)
docker compose down -v             # dừng và xóa database để seed lại từ đầu
docker compose exec backend php artisan <lệnh>
```

> **Lưu ý:** frontend hiện gọi API tại địa chỉ cố định `http://127.0.0.1:8000`, nên backend phải được publish ở cổng 8000 (đã cấu hình sẵn). Cổng 8000 và 5173 cần còn trống.

### Tài khoản mẫu

Mật khẩu chung: `password123`

| Vai trò | Email |
| --- | --- |
| Admin | `admin@gmail.com` |
| Khách hàng | `customer@gmail.com`, `thinh@gmail.com` |

Trang quản trị nằm ở đường dẫn `/admin` trên frontend.

## Chạy không dùng Docker

Yêu cầu: PHP ≥ 8.3, Composer, Node.js, MySQL.

**Backend** (trong `backend/`):

```bash
composer install
cp .env.example .env            # chỉnh DB_* sang MySQL của bạn
php artisan key:generate
php artisan migrate --seed
php artisan serve               # http://127.0.0.1:8000
```

**Frontend** (trong `frontend/`):

```bash
npm install
npm run dev                     # http://localhost:5173
```

## Kiểm thử và lint

```bash
# Backend (trong backend/) — dùng SQLite in-memory
php artisan test
php artisan test --filter=OrderApiTest
vendor/bin/pint                 # format code

# Frontend (trong frontend/)
npm run lint
npm run build
```

## Kiến trúc tóm tắt

- **Phân quyền API:** public (sản phẩm, danh mục, đăng ký/đăng nhập, callback VNPay, xem trước giỏ hàng khách) → `auth:sanctum` (hồ sơ, giỏ hàng, đơn hàng) → `auth:sanctum` + `admin` (`/api/admin/*`).
- **Dữ liệu sản phẩm:** `Category` → `Product` → `ProductVariant` (giá, tồn kho, SKU nằm ở biến thể) + `ProductImage`.
- **Giỏ hàng:** người dùng đăng nhập dùng giỏ hàng trên server; khách vãng lai lưu trong `localStorage` và được đồng bộ khi đăng nhập.
- **Thanh toán VNPay:** tạo đơn → chuyển sang VNPay → xác thực chữ ký HMAC-SHA512 ở `callback` (trình duyệt quay về) và `ipn` (VNPay gọi server).
- **Ảnh sản phẩm** được lưu ở `backend/public/uploads/` (khi chạy Docker thư mục này được mount từ máy nên không bị mất).

## Triển khai production

Cấu hình trong repo dành cho **chạy local** (`APP_DEBUG=true`, mật khẩu MySQL là `secret`). Trước khi triển khai thật cần:

- Thay frontend gọi API bằng biến môi trường (`VITE_API_URL`) thay vì địa chỉ `127.0.0.1:8000` đang ghi cứng.
- Đặt `APP_ENV=production`, `APP_DEBUG=false`, mật khẩu database mạnh, và thông tin `VNPAY_*` thật qua biến môi trường.
- Thêm domain thật vào `backend/config/cors.php` và cấu hình `FRONTEND_URL`, `APP_URL`.
- Dùng HTTPS (bắt buộc với VNPay và đăng nhập Google) và gắn volume cho `public/uploads`, `storage`, database.
