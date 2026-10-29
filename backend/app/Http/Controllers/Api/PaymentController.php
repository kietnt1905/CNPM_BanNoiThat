<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\VNPayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected VNPayService $vnpayService;

    public function __construct(VNPayService $vnpayService)
    {
        $this->vnpayService = $vnpayService;
    }

    /**
     * Tiếp nhận và đối soát kết quả thanh toán khi khách hàng quay lại từ VNPAY (Return URL)
     * GET /api/payment/vnpay/callback
     */
    public function vnpayCallback(Request $request): JsonResponse
    {
        $allParams = $request->all();

        // 1. Kiểm tra chữ ký bảo mật HMAC-SHA512
        $isValidSignature = $this->vnpayService->verifySignature($allParams);
        if (!$isValidSignature) {
            return response()->json([
                'status' => false,
                'response_code' => '97',
                'message' => 'Chữ ký không hợp lệ! Dữ liệu giao dịch có thể đã bị can thiệp.',
                'data' => null,
            ], 400);
        }

        $orderCode = $request->input('vnp_TxnRef');
        $responseCode = $request->input('vnp_ResponseCode');
        $transactionNo = $request->input('vnp_TransactionNo');
        $bankCode = $request->input('vnp_BankCode');
        $bankTranNo = $request->input('vnp_BankTranNo');
        $cardType = $request->input('vnp_CardType');
        $payDate = $request->input('vnp_PayDate');
        $amount = (float) ($request->input('vnp_Amount', 0) / 100);

        // 2. Tìm đơn hàng tương ứng
        $order = Order::where('order_code', $orderCode)->with('payment')->first();
        if (!$order) {
            return response()->json([
                'status' => false,
                'response_code' => '01',
                'message' => "Không tìm thấy đơn hàng #{$orderCode} trong hệ thống.",
                'data' => null,
            ], 404);
        }

        $payment = $order->payment;
        $isSuccess = ($responseCode === '00');
        $msg = $this->vnpayService->getResponseMessage($responseCode);

        DB::beginTransaction();
        try {
            if ($payment) {
                // Tránh ghi đè nếu IPN hoặc callback trước đó đã đánh dấu success
                if ($isSuccess && $payment->status !== 'success') {
                    $payment->update([
                        'status' => 'success',
                        'transaction_code' => $transactionNo ?: $payment->transaction_code,
                        'paid_at' => now(),
                    ]);

                    if ($order->status === 'pending') {
                        $order->update(['status' => 'confirmed']);
                    }
                } elseif (!$isSuccess && $payment->status === 'pending') {
                    $payment->update([
                        'status' => 'failed',
                        'transaction_code' => $transactionNo ?: $payment->transaction_code,
                    ]);
                }
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('VNPay Callback DB Update Error: ' . $e->getMessage());
        }

        $order->refresh();

        return response()->json([
            'status' => $isSuccess,
            'response_code' => $responseCode,
            'message' => $msg,
            'data' => [
                'order_code' => $order->order_code,
                'order_id' => $order->id,
                'order_status' => $order->status,
                'payment_status' => $order->payment?->status ?? ($isSuccess ? 'success' : 'failed'),
                'amount' => $amount,
                'amount_display' => number_format($amount, 0, ',', '.') . '₫',
                'bank_code' => $bankCode,
                'bank_tran_no' => $bankTranNo,
                'card_type' => $cardType,
                'vnp_transaction_no' => $transactionNo,
                'pay_date' => $payDate,
                'recipient_name' => $order->recipient_name,
                'recipient_phone' => $order->recipient_phone,
                'shipping_address' => $order->shipping_address,
            ],
        ]);
    }

    /**
     * Webhook IPN tiếp nhận thông báo thanh toán bất đồng bộ từ Server VNPAY (Server-to-Server)
     * GET /api/payment/vnpay/ipn
     */
    public function vnpayIpn(Request $request): JsonResponse
    {
        $allParams = $request->all();

        // 1. Kiểm tra Checksum
        if (!$this->vnpayService->verifySignature($allParams)) {
            return response()->json([
                'RspCode' => '97',
                'Message' => 'Invalid Checksum',
            ]);
        }

        $orderCode = $request->input('vnp_TxnRef');
        $responseCode = $request->input('vnp_ResponseCode');
        $transactionNo = $request->input('vnp_TransactionNo');
        $vnpAmount = (int) $request->input('vnp_Amount', 0);

        // 2. Tìm đơn hàng
        $order = Order::where('order_code', $orderCode)->with('payment')->first();
        if (!$order) {
            return response()->json([
                'RspCode' => '01',
                'Message' => 'Order not found',
            ]);
        }

        // 3. Kiểm tra số tiền
        $expectedAmount = (int) round(($order->total_amount ?? ($order->subtotal + $order->shipping_fee - $order->discount_amount)) * 100);
        if ($vnpAmount !== $expectedAmount) {
            return response()->json([
                'RspCode' => '04',
                'Message' => 'Invalid amount',
            ]);
        }

        $payment = $order->payment;

        // 4. Kiểm tra trạng thái giao dịch (chống cập nhật trùng lặp)
        if ($payment && $payment->status === 'success') {
            return response()->json([
                'RspCode' => '02',
                'Message' => 'Order already confirmed',
            ]);
        }

        // 5. Cập nhật kết quả vào CSDL
        DB::beginTransaction();
        try {
            if ($payment) {
                if ($responseCode === '00') {
                    $payment->update([
                        'status' => 'success',
                        'transaction_code' => $transactionNo ?: $payment->transaction_code,
                        'paid_at' => now(),
                    ]);

                    if ($order->status === 'pending') {
                        $order->update(['status' => 'confirmed']);
                    }
                } else {
                    $payment->update([
                        'status' => 'failed',
                        'transaction_code' => $transactionNo ?: $payment->transaction_code,
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'RspCode' => '00',
                'Message' => 'Confirm Success',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('VNPay IPN Error: ' . $e->getMessage());

            return response()->json([
                'RspCode' => '99',
                'Message' => 'Unknown error: ' . $e->getMessage(),
            ]);
        }
    }
}
