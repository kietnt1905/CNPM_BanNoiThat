<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Services\VNPayService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VNPayPaymentTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'vnpay.tmn_code' => '7J0Z11SC',
            'vnpay.hash_secret' => 'WUZHELPNENQDABOFEKVTRIBZFJIIPULA',
            'vnpay.url' => 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
            'vnpay.return_url' => 'http://localhost:5173/thanh-toan/vnpay-return',
        ]);

        $this->user = User::factory()->create([
            'email' => 'buyer_' . uniqid() . '@example.com',
            'phone' => '0988776655',
        ]);

        $category = Category::firstOrCreate(
            ['slug' => 'ban-an-vnpay-test'],
            ['name' => 'Bàn ăn test', 'description' => 'Mô tả', 'is_active' => true]
        );

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Bàn làm việc Giám đốc Luxury',
            'slug' => 'ban-lam-viec-luxury-' . uniqid(),
            'brand' => 'TK House',
            'is_active' => true,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'VAR-VNPAY-' . strtoupper(uniqid()),
            'color' => 'Nâu Gỗ Tự Nhiên',
            'material' => 'Gỗ Sồi Nga',
            'price' => 15000000,
            'stock_quantity' => 10,
        ]);
    }

    /**
     * Test tạo đơn hàng với payment_method = 'vnpay' trả về link payment_url hợp lệ
     */
    public function test_can_create_order_with_vnpay_and_receive_payment_url(): void
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'recipient_name' => 'Nguyễn Văn Test',
            'recipient_phone' => '0988776655',
            'shipping_address' => 'Số 123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
            'payment_method' => 'vnpay',
            'shipping_fee' => 0,
            'discount_amount' => 0,
            'items' => [
                [
                    'variant_id' => $this->variant->id,
                    'quantity' => 1,
                ],
            ],
        ];

        $response = $this->postJson('/api/orders', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('status', true)
            ->assertJsonStructure([
                'status',
                'message',
                'payment_url',
                'data' => [
                    'id',
                    'order_code',
                    'total_amount',
                    'payment' => [
                        'method',
                        'status',
                    ],
                ],
            ]);

        $paymentUrl = $response->json('payment_url');
        $this->assertNotNull($paymentUrl);
        $this->assertStringContainsString('https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', $paymentUrl);
        $this->assertStringContainsString('vnp_TmnCode=7J0Z11SC', $paymentUrl);
        $this->assertStringContainsString('vnp_SecureHash=', $paymentUrl);

        $this->assertDatabaseHas('payments', [
            'method' => 'vnpay',
            'status' => 'pending',
        ]);
    }

    /**
     * Test callback hợp lệ từ VNPay cập nhật trạng thái đơn hàng thành công
     */
    public function test_vnpay_callback_success_updates_order_and_payment(): void
    {
        $order = Order::create([
            'order_code' => 'TKH' . date('Ymd') . '9999',
            'user_id' => $this->user->id,
            'recipient_name' => 'Nguyễn Văn A',
            'recipient_phone' => '0988776655',
            'shipping_address' => 'Hà Nội',
            'status' => 'pending',
            'subtotal' => 15000000,
            'shipping_fee' => 0,
            'discount_amount' => 0,
        ]);

        $payment = Payment::create([
            'order_id' => $order->id,
            'method' => 'vnpay',
            'status' => 'pending',
            'amount' => 15000000,
            'transaction_code' => 'TXN_TEST_' . uniqid(),
        ]);

        $params = [
            'vnp_Amount' => '1500000000',
            'vnp_BankCode' => 'NCB',
            'vnp_BankTranNo' => 'VNP14892301',
            'vnp_CardType' => 'ATM',
            'vnp_OrderInfo' => 'Thanh toan don hang #' . $order->order_code,
            'vnp_PayDate' => '20261029150000',
            'vnp_ResponseCode' => '00',
            'vnp_TmnCode' => '7J0Z11SC',
            'vnp_TransactionNo' => '14892301',
            'vnp_TransactionStatus' => '00',
            'vnp_TxnRef' => $order->order_code,
        ];

        // Tạo chữ ký hợp lệ
        ksort($params);
        $hashData = '';
        $i = 0;
        foreach ($params as $k => $v) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($k) . '=' . urlencode($v);
            } else {
                $hashData .= urlencode($k) . '=' . urlencode($v);
                $i = 1;
            }
        }
        $params['vnp_SecureHash'] = hash_hmac('sha512', $hashData, 'WUZHELPNENQDABOFEKVTRIBZFJIIPULA');

        $response = $this->getJson('/api/payment/vnpay/callback?' . http_build_query($params));

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonPath('response_code', '00')
            ->assertJsonPath('data.payment_status', 'success');

        $this->assertDatabaseHas('payments', [
            'id' => $payment->id,
            'status' => 'success',
            'transaction_code' => '14892301',
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * Test callback bị sai chữ ký hash sẽ trả về 400
     */
    public function test_vnpay_callback_with_invalid_signature_rejected(): void
    {
        $params = [
            'vnp_Amount' => '1500000000',
            'vnp_ResponseCode' => '00',
            'vnp_TxnRef' => 'TKH999999',
            'vnp_SecureHash' => 'fake_invalid_hash_signature',
        ];

        $response = $this->getJson('/api/payment/vnpay/callback?' . http_build_query($params));

        $response->assertStatus(400)
            ->assertJsonPath('status', false)
            ->assertJsonPath('response_code', '97');
    }

    /**
     * Test IPN webhook xác nhận thanh toán hợp lệ
     */
    public function test_vnpay_ipn_confirms_valid_payment(): void
    {
        $order = Order::create([
            'order_code' => 'TKH' . date('Ymd') . '8888',
            'user_id' => $this->user->id,
            'recipient_name' => 'Nguyễn Văn B',
            'recipient_phone' => '0988776655',
            'shipping_address' => 'TP.HCM',
            'status' => 'pending',
            'subtotal' => 10000000,
            'shipping_fee' => 0,
            'discount_amount' => 0,
        ]);

        Payment::create([
            'order_id' => $order->id,
            'method' => 'vnpay',
            'status' => 'pending',
            'amount' => 10000000,
        ]);

        $params = [
            'vnp_Amount' => '1000000000',
            'vnp_ResponseCode' => '00',
            'vnp_TmnCode' => '7J0Z11SC',
            'vnp_TransactionNo' => '14899999',
            'vnp_TxnRef' => $order->order_code,
        ];

        ksort($params);
        $hashData = '';
        $i = 0;
        foreach ($params as $k => $v) {
            if ($i == 1) {
                $hashData .= '&' . urlencode($k) . '=' . urlencode($v);
            } else {
                $hashData .= urlencode($k) . '=' . urlencode($v);
                $i = 1;
            }
        }
        $params['vnp_SecureHash'] = hash_hmac('sha512', $hashData, 'WUZHELPNENQDABOFEKVTRIBZFJIIPULA');

        $response = $this->getJson('/api/payment/vnpay/ipn?' . http_build_query($params));

        $response->assertStatus(200)
            ->assertJsonPath('RspCode', '00')
            ->assertJsonPath('Message', 'Confirm Success');
    }
}
