<?php

namespace App\Services;

use App\Models\Order;

class VNPayService
{
    protected string $tmnCode;
    protected string $hashSecret;
    protected string $url;
    protected string $returnUrl;

    public function __construct()
    {
        $this->tmnCode = config('vnpay.tmn_code', env('VNPAY_TMN_CODE', ''));
        $this->hashSecret = config('vnpay.hash_secret', env('VNPAY_HASH_SECRET', ''));
        $this->url = config('vnpay.url', env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'));
        $this->returnUrl = config('vnpay.return_url', env('VNPAY_RETURN_URL', 'http://localhost:5173/thanh-toan/vnpay-return'));
    }

    /**
     * Tạo đường dẫn URL chuyển hướng sang cổng thanh toán VNPAY
     *
     * @param Order $order
     * @param string|null $clientIp
     * @param string|null $customReturnUrl
     * @return string
     */
    public function createPaymentUrl(Order $order, ?string $clientIp = null, ?string $customReturnUrl = null): string
    {
        $vnp_TxnRef = $order->order_code;
        $vnp_OrderInfo = 'Thanh toan don hang #' . $order->order_code . ' - TK House';
        $vnp_OrderType = 'other';
        $vnp_Amount = (int) round(($order->total_amount ?? ($order->subtotal + $order->shipping_fee - $order->discount_amount)) * 100);
        $vnp_Locale = 'vn';
        $vnp_IpAddr = $clientIp ?: request()->ip() ?: '127.0.0.1';

        $tz = new \DateTimeZone('Asia/Ho_Chi_Minh');
        $now = new \DateTime('now', $tz);
        $startTime = $now->format('YmdHis');
        $expireTime = (clone $now)->modify('+15 minutes')->format('YmdHis');

        $inputData = [
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $this->tmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => $startTime,
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $customReturnUrl ?: $this->returnUrl,
            "vnp_TxnRef" => $vnp_TxnRef,
            "vnp_ExpireDate" => $expireTime,
        ];

        ksort($inputData);

        $query = "";
        $i = 0;
        $hashdata = "";

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $this->url . "?" . $query;
        $vnpSecureHash = hash_hmac('sha512', $hashdata, $this->hashSecret);
        $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;

        return $vnp_Url;
    }

    /**
     * Xác thực chữ ký dữ liệu phản hồi từ VNPAY (Return URL hoặc IPN Webhook)
     *
     * @param array $params Mảng dữ liệu GET nhận được từ VNPay
     * @return bool True nếu hợp lệ, False nếu dữ liệu bị giả mạo
     */
    public function verifySignature(array $params): bool
    {
        $vnp_SecureHash = $params['vnp_SecureHash'] ?? '';
        if (empty($vnp_SecureHash) || empty($this->hashSecret)) {
            return false;
        }

        $inputData = [];
        foreach ($params as $key => $value) {
            if (str_starts_with($key, 'vnp_') && !in_array($key, ['vnp_SecureHash', 'vnp_SecureHashType'])) {
                $inputData[$key] = $value;
            }
        }

        ksort($inputData);

        $i = 0;
        $hashData = "";
        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashData .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
        }

        $secureHash = hash_hmac('sha512', $hashData, $this->hashSecret);

        return hash_equals(strtolower($secureHash), strtolower($vnp_SecureHash));
    }

    /**
     * Lấy thông điệp mô tả mã phản hồi từ VNPAY
     *
     * @param string|null $responseCode
     * @return string
     */
    public function getResponseMessage(?string $responseCode): string
    {
        $messages = [
            '00' => 'Giao dịch thành công.',
            '07' => 'Trừ tiền thành công. Giao dịch bị nghi ngờ bất thường.',
            '09' => 'Giao dịch không thành công: Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking.',
            '10' => 'Giao dịch không thành công: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.',
            '11' => 'Giao dịch không thành công: Đã hết hạn chờ thanh toán. Vui lòng thực hiện lại.',
            '12' => 'Giao dịch không thành công: Thẻ/Tài khoản của khách hàng đang bị khóa.',
            '13' => 'Giao dịch không thành công: Quý khách nhập sai mật khẩu OTP xác thực.',
            '24' => 'Giao dịch đã bị hủy bởi khách hàng.',
            '51' => 'Giao dịch không thành công: Tài khoản của quý khách không đủ số dư.',
            '65' => 'Giao dịch không thành công: Tài khoản đã vượt quá hạn mức giao dịch trong ngày.',
            '75' => 'Ngân hàng thanh toán đang bảo trì.',
            '79' => 'Giao dịch không thành công: Nhập sai mật khẩu thanh toán quá số lần quy định.',
            '99' => 'Lỗi không xác định từ cổng thanh toán.',
        ];

        return $messages[$responseCode] ?? ('Mã phản hồi không xác định: ' . $responseCode);
    }
}
