# 📘 HƯỚNG DẪN KẾT NỐI FRONTEND CHO THỊNH
### Tính năng: "Hồ sơ của tôi" & "Đơn hàng của tôi" (TK House)

> **Dành cho Thịnh (hoặc AI của Thịnh):**  
> Backend đã hoàn tất 100% các API cho cả 2 module dưới đây. Toàn bộ API đều yêu cầu Header:  
> `Authorization: Bearer <access_token>` (Token lấy từ `localStorage.getItem('token')`).

---

## 🧭 1. ĐỀ XUẤT CẤU TRÚC GIAO DIỆN (UI/UX)
- Tạo trang **Tài khoản cá nhân** tại route: `/tai-khoan` (hoặc `/profile`).
- Có Sidebar/Tabs bên trái để chuyển đổi giữa 3 mục:
  1. 👤 **Hồ sơ cá nhân** (Xem & sửa tên, số điện thoại, địa chỉ nhận hàng).
  2. 📦 **Đơn hàng của tôi** (Danh sách đơn, bộ lọc tab, tìm kiếm, hủy đơn, xem chi tiết).
  3. 🔒 **Bảo mật & Mật khẩu** (Đổi mật khẩu).
- Route alias: Thêm route `/don-hang` trong `App.jsx` tự động trỏ vào tab Đơn hàng.
- Cập nhật menu dropdown Avatar trên `Header.jsx`:
  - "Hồ sơ tài khoản" -> `to="/tai-khoan?tab=profile"`
  - "Đơn hàng của tôi" -> `to="/don-hang"` (hoặc `/tai-khoan?tab=orders`)

---

## 👤 2. MODULE "HỒ SƠ CỦA TÔI" (PROFILE & PASSWORD)

### 2.1. Lấy thông tin cá nhân
- **Endpoint:** `GET /api/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Response thành công (200):**
```json
{
  "status": true,
  "message": "Lấy thông tin tài khoản thành công.",
  "data": {
    "id": 1,
    "name": "Nguyễn Tuấn Kiệt",
    "email": "kietnt1905@gmail.com",
    "phone": "0912345678",
    "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
    "avatar": null,
    "role": "customer",
    "email_verified": true,
    "has_password": true,
    "created_at": "2026-10-01 14:29:19",
    "created_at_display": "01/10/2026"
  }
}
```

---

### 2.2. Cập nhật thông tin cá nhân
- **Endpoint:** `PUT /api/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body (JSON):**
```json
{
  "name": "Nguyễn Tuấn Kiệt",
  "phone": "0987654321",
  "address": "456 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM"
}
```
*(Lưu ý: `name` là bắt buộc; `phone` và `address` có thể để trống hoặc gửi null).*

- **Response thành công (200):**
```json
{
  "status": true,
  "message": "Cập nhật thông tin hồ sơ thành công!",
  "data": {
    "id": 1,
    "name": "Nguyễn Tuấn Kiệt",
    "email": "kietnt1905@gmail.com",
    "phone": "0987654321",
    "address": "456 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    "avatar": null,
    "role": "customer",
    "email_verified": true,
    "has_password": true,
    "created_at": "2026-10-01 14:29:19",
    "created_at_display": "01/10/2026"
  }
}
```
- **Response lỗi validation (422):**
```json
{
  "status": false,
  "message": "Thông tin cập nhật không hợp lệ.",
  "errors": {
    "name": ["Họ và tên không được để trống."],
    "phone": ["Số điện thoại không đúng định dạng (9 - 20 số)."]
  }
}
```

---

### 2.3. Tải lên ảnh đại diện (Upload Avatar)
- **Endpoint:** `POST /api/profile/avatar`
- **Headers:** 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body (FormData):**
  - `avatar`: Tệp hình ảnh (hỗ trợ jpeg, png, jpg, webp, gif; dung lượng tối đa 5MB).
- **Response thành công (200):**
```json
{
  "status": true,
  "message": "Cập nhật ảnh đại diện thành công!",
  "data": {
    "id": 1,
    "name": "Nguyễn Tuấn Kiệt",
    "email": "kietnt1905@gmail.com",
    "phone": "0987654321",
    "address": "456 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM",
    "avatar": "/uploads/avatars/avatar_1_1730263940_a1b2c3.jpg",
    "avatar_url": "http://127.0.0.1:8000/uploads/avatars/avatar_1_1730263940_a1b2c3.jpg",
    "role": "customer",
    "email_verified": true,
    "has_password": true,
    "created_at_display": "01/10/2026"
  }
}
```

### 2.4. Xóa ảnh đại diện (Khôi phục avatar mặc định)
- **Endpoint:** `DELETE /api/profile/avatar`
- **Headers:** `Authorization: Bearer <token>`
- **Response thành công (200):** Trả về `avatar: null`, `avatar_url: null`.

---

### 2.5. Đổi mật khẩu
- **Endpoint:** `PUT /api/profile/change-password`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body (JSON):**
```json
{
  "current_password": "PasswordCu123",
  "new_password": "PasswordMoi456",
  "new_password_confirmation": "PasswordMoi456"
}
```
*(Nếu tài khoản đăng nhập qua Google chưa từng đặt mật khẩu thì không cần gửi `current_password`).*

- **Response thành công (200):**
```json
{
  "status": true,
  "message": "Đổi mật khẩu thành công!"
}
```
- **Response lỗi (422):**
  - Nhập sai mật khẩu cũ:
    ```json
    {
      "status": false,
      "message": "Mật khẩu hiện tại không chính xác.",
      "errors": {
        "current_password": ["Mật khẩu hiện tại không chính xác."]
      }
    }
    ```
  - Mật khẩu mới trùng mật khẩu cũ hoặc không khớp xác nhận:
    ```json
    {
      "status": false,
      "message": "Dữ liệu đổi mật khẩu không hợp lệ.",
      "errors": {
        "new_password": [
          "Mật khẩu mới phải khác với mật khẩu hiện tại.",
          "Xác nhận mật khẩu mới không khớp."
        ]
      }
    }
    ```

---

## 📦 3. MODULE "ĐƠN HÀNG CỦA TÔI" (ORDERS & TRACKING)

### 3.1. Thống kê số lượng đơn theo trạng thái (Dùng cho Badge trên Tabs)
- **Endpoint:** `GET /api/orders/counts`
- **Headers:** `Authorization: Bearer <token>`
- **Response thành công (200):**
```json
{
  "status": true,
  "data": {
    "all": 8,
    "pending": 2,
    "confirmed": 1,
    "shipping": 2,
    "completed": 2,
    "cancelled": 1
  }
}
```
*(Thịnh dùng API này để hiển thị số trên thanh tab: `Tất cả (8)`, `Chờ xác nhận (2)`, `Đang giao (2)`, v.v.).*

---

### 3.2. Lấy danh sách đơn hàng (Kèm bộ lọc & tìm kiếm)
- **Endpoint:** `GET /api/orders`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params hỗ trợ:**
  - `status`: Lọc theo trạng thái (`all`, `pending`, `confirmed`, `shipping`, `completed`, `cancelled`).
  - `search` hoặc `q`: Tìm kiếm theo **Mã đơn hàng** (ví dụ `TKH202610...`) hoặc **Tên sản phẩm**.
  - `page`: Số trang (mặc định: `1`).
  - `per_page`: Số đơn mỗi trang (mặc định: `10`).
- **Ví dụ gọi:** `GET /api/orders?status=pending&search=sofa&page=1`
- **Response thành công (200):**
```json
{
  "status": true,
  "data": [
    {
      "id": 15,
      "order_code": "TKH202610290001",
      "recipient_name": "Nguyễn Tuấn Kiệt",
      "recipient_phone": "0912345678",
      "shipping_address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
      "note": null,
      "status": "pending",
      "status_label": "Chờ xác nhận",
      "can_cancel": true,
      "subtotal": 25000000,
      "subtotal_display": "25.000.000₫",
      "shipping_fee": 0,
      "shipping_fee_display": "0₫",
      "discount_amount": 0,
      "discount_amount_display": "0₫",
      "total_amount": 25000000,
      "total_amount_display": "25.000.000₫",
      "total_items": 1,
      "items": [
        {
          "id": 20,
          "variant_id": 5,
          "product_name": "Sofa Da Bò Ý Florence",
          "sku": "SOFA-FLO-01",
          "color": "Nâu Cognac",
          "material": "Da bò Ý cao cấp",
          "dimensions": "220x90x85cm",
          "quantity": 1,
          "unit_price": 25000000,
          "unit_price_display": "25.000.000₫",
          "line_total": 25000000,
          "line_total_display": "25.000.000₫",
          "image": "http://localhost:8000/storage/products/sofa.jpg",
          "product_slug": "sofa-da-bo-y-florence"
        }
      ],
      "payment": {
        "id": 14,
        "method": "cod",
        "method_label": "Thanh toán khi nhận hàng (COD)",
        "status": "pending",
        "status_label": "Chờ thanh toán",
        "amount": 25000000,
        "amount_display": "25.000.000₫",
        "transaction_code": "TXN20261029...",
        "paid_at": null
      },
      "created_at": "2026-10-29 15:00:00",
      "created_at_display": "29/10/2026 15:00",
      "updated_at": "2026-10-29 15:00:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 10,
    "total": 1
  }
}
```

---

### 3.3. Xem chi tiết 1 đơn hàng
- **Endpoint:** `GET /api/orders/{id_hoac_order_code}`
- **Headers:** `Authorization: Bearer <token>`
- **Response thành công (200):** Cấu trúc tương tự 1 item đơn hàng ở trên, có đầy đủ `items`, `payment`, `can_cancel`.

---

### 3.4. Khách hàng hủy đơn hàng
- **Endpoint:** `PATCH /api/orders/{id_hoac_order_code}/cancel`
- **Headers:** `Authorization: Bearer <token>`
- **Request Body (Tùy chọn):**
```json
{
  "reason": "Khách muốn đổi sang mẫu bàn ăn kích thước lớn hơn"
}
```
- **Quy tắc:** Chỉ được hủy khi đơn đang ở trạng thái `pending` (Chờ xác nhận). Khi hủy, backend sẽ tự động cộng hoàn lại số lượng tồn kho `stock_quantity`.
- **Response thành công (200):**
```json
{
  "status": true,
  "message": "Hủy đơn hàng thành công và đã hoàn lại số lượng tồn kho.",
  "data": { ...thong_tin_don_hang_sau_khi_huy... }
}
```
- **Response lỗi nếu đơn đã được xác nhận/đang giao (400):**
```json
{
  "status": false,
  "message": "Không thể hủy đơn hàng vì đơn đang ở trạng thái 'Đang giao hàng'. Quý khách chỉ có thể tự hủy đơn khi đơn ở trạng thái Chờ xác nhận (pending)."
}
```

---

## 🤖 PROMPT MẪU CHO THỊNH GỬI TRỰC TIẾP CHO AI:

> "Bạn là Senior Frontend React Developer. Tôi cần bạn tạo giao diện cho 2 module **'Hồ sơ của tôi'** và **'Đơn hàng của tôi'** trong dự án nội thất cao cấp TK House.
> 
> **Yêu cầu chi tiết:**
> 1. Tạo component trang chính `AccountPage.jsx` tại route `/tai-khoan` (phong cách sang trọng tối giản của TK House: tone màu `#FAF8F5`, `#8C6A48`, `#2C241E`).
> 2. Có Sidebar điều hướng dạng Tab:
>    - **Tab 1 - Hồ sơ cá nhân:** Xem/sửa Họ tên, SĐT, Địa chỉ nhận hàng (`GET /api/profile` và `PUT /api/profile`). Cho phép bấm vào Avatar để chọn ảnh tải lên thay đổi ảnh đại diện (`POST /api/profile/avatar`) hoặc xóa avatar (`DELETE /api/profile/avatar`).
>    - **Tab 2 - Đơn hàng của tôi:** Gọi `GET /api/orders/counts` để hiển thị số lượng trên các tab trạng thái (*Tất cả*, *Chờ xác nhận*, *Đang giao*, *Hoàn thành*, *Đã hủy*). Gọi `GET /api/orders` hỗ trợ phân trang và tìm kiếm theo mã đơn / tên sản phẩm. Cho phép bấm **Hủy đơn** khi `can_cancel: true` (`PATCH /api/orders/:id/cancel`) và popup xem chi tiết đơn hàng.
>    - **Tab 3 - Bảo mật:** Đổi mật khẩu (`PUT /api/profile/change-password`).
> 3. Cập nhật route alias `/don-hang` trong `App.jsx` để mở thẳng tab Đơn hàng.
> 4. Cập nhật link trên `Header.jsx` ở dropdown Avatar trỏ về `/tai-khoan` và `/don-hang`.
> 5. Đọc file `backend/THINH_FRONTEND_GUIDE.md` để xem toàn bộ cấu trúc API và định dạng JSON mẫu."
