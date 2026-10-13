<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Product $product;
    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        // Tạo user test
        $this->user = User::factory()->create([
            'email' => 'test_buyer_' . uniqid() . '@example.com',
            'phone' => '0987654321',
        ]);

        // Tạo category test
        $category = Category::firstOrCreate(
            ['slug' => 'ban-an-test'],
            ['name' => 'Bàn ăn test', 'description' => 'Mô tả test', 'is_active' => true]
        );

        // Tạo product test
        $this->product = Product::create([
            'category_id' => $category->id,
            'name' => 'Bàn ăn cao cấp Grand Lux',
            'slug' => 'ban-an-cao-cap-grand-lux-' . uniqid(),
            'description' => 'Bàn ăn sang trọng nhập khẩu',
            'brand' => 'TKHouse',
            'warranty_months' => 24,
            'is_active' => true,
        ]);

        // Tạo variant test có tồn kho 10
        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'sku' => 'VAR-TEST-' . strtoupper(uniqid()),
            'color' => 'Nâu Óc Chó',
            'material' => 'Gỗ óc chó Bắc Mỹ',
            'length_cm' => 180,
            'width_cm' => 90,
            'height_cm' => 75,
            'weight_kg' => 45,
            'price' => 15000000,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);
    }

    /**
     * Test 1: Báo lỗi 422 nếu thiếu thông tin người nhận hoặc phương thức thanh toán
     */
    public function test_cannot_create_order_with_missing_recipient_information(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/orders', [
            // Không gửi gì
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['recipient_name', 'recipient_phone', 'shipping_address', 'payment_method']);
    }

    /**
     * Test 2: Báo lỗi 422 nếu giỏ hàng trống và không gửi items
     */
    public function test_cannot_create_order_when_cart_is_empty(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/orders', [
            'recipient_name' => 'Nguyễn Văn A',
            'recipient_phone' => '0901234567',
            'shipping_address' => '123 Nguyễn Trãi, Quận 1, TP.HCM',
            'payment_method' => 'cod',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'status' => false,
            ]);
    }

    /**
     * Test 3: Báo lỗi 422 và rollback nếu thiếu hàng tồn kho
     */
    public function test_cannot_create_order_if_stock_is_insufficient(): void
    {
        // Cho tồn kho hiện tại chỉ còn 2
        $this->variant->update(['stock_quantity' => 2]);

        // Cho vào giỏ hàng số lượng 5 (vượt quá tồn kho 2)
        $cart = Cart::firstOrCreate(['user_id' => $this->user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'variant_id' => $this->variant->id,
            'quantity' => 5,
        ]);

        $initialOrdersCount = Order::count();

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/orders', [
            'recipient_name' => 'Trần Thị B',
            'recipient_phone' => '0912345678',
            'shipping_address' => '456 Lê Văn Sỹ, Quận 3, TP.HCM',
            'payment_method' => 'bank_transfer',
        ]);

        // Phải trả về 422 và rollback
        $response->assertStatus(422);
        $response->assertJson([
            'status' => false,
        ]);
        $response->assertJsonStructure(['status', 'message', 'out_of_stock_item']);

        // Số lượng tồn kho không bị trừ
        $this->assertEquals(2, $this->variant->fresh()->stock_quantity);

        // Không có bản ghi order nào được tạo
        $this->assertEquals($initialOrdersCount, Order::count());

        // Giỏ hàng của khách vẫn giữ nguyên
        $this->assertDatabaseHas('cart_items', [
            'cart_id' => $cart->id,
            'variant_id' => $this->variant->id,
            'quantity' => 5,
        ]);
    }

    /**
     * Test 4: Đặt hàng thành công từ giỏ hàng, trừ tồn kho và làm trống giỏ hàng
     */
    public function test_create_order_successfully_from_cart(): void
    {
        // Cho tồn kho ban đầu là 10
        $this->variant->update(['stock_quantity' => 10]);

        // Thêm vào giỏ hàng 3 sản phẩm
        $cart = Cart::firstOrCreate(['user_id' => $this->user->id]);
        CartItem::create([
            'cart_id' => $cart->id,
            'variant_id' => $this->variant->id,
            'quantity' => 3,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/orders', [
            'recipient_name' => 'Nguyễn Tuấn Kiệt',
            'recipient_phone' => '0909999888',
            'shipping_address' => 'Tòa Landmark 81, Vinhomes Central Park, TP.HCM',
            'payment_method' => 'cod',
            'note' => 'Giao hàng vào thứ 7 và hỗ trợ lắp đặt tầng 20',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'status' => true,
            'message' => 'Đặt hàng thành công!',
        ]);

        $orderData = $response->json('data');
        $this->assertNotEmpty($orderData['order_code']);
        $this->assertEquals('pending', $orderData['status']);
        $this->assertEquals(45000000, $orderData['subtotal']);
        $this->assertEquals(45000000, $orderData['total_amount']);
        $this->assertEquals(1, count($orderData['items']));
        $this->assertEquals('cod', $orderData['payment']['method']);

        // Kiểm tra tồn kho đã bị trừ (10 - 3 = 7)
        $this->assertEquals(7, $this->variant->fresh()->stock_quantity);

        // Kiểm tra giỏ hàng đã bị làm trống
        $this->assertDatabaseMissing('cart_items', [
            'cart_id' => $cart->id,
        ]);

        // Kiểm tra bản ghi orders và order_items trong DB
        $this->assertDatabaseHas('orders', [
            'id' => $orderData['id'],
            'user_id' => $this->user->id,
            'recipient_name' => 'Nguyễn Tuấn Kiệt',
        ]);

        $this->assertDatabaseHas('order_items', [
            'order_id' => $orderData['id'],
            'variant_id' => $this->variant->id,
            'quantity' => 3,
            'unit_price' => 15000000,
        ]);

        $this->assertDatabaseHas('payments', [
            'order_id' => $orderData['id'],
            'method' => 'cod',
            'amount' => 45000000,
        ]);
    }

    /**
     * Test 5: Lấy danh sách đơn hàng đã mua của user đang đăng nhập (GET /api/orders)
     */
    public function test_get_user_orders_list(): void
    {
        // Tạo 2 đơn hàng cho user hiện tại
        $order1 = Order::create([
            'order_code' => 'ORD-TEST-1',
            'user_id' => $this->user->id,
            'recipient_name' => 'Người nhận 1',
            'recipient_phone' => '0901234567',
            'shipping_address' => 'Địa chỉ 1',
            'status' => 'pending',
            'subtotal' => 1000000,
        ]);

        $order2 = Order::create([
            'order_code' => 'ORD-TEST-2',
            'user_id' => $this->user->id,
            'recipient_name' => 'Người nhận 2',
            'recipient_phone' => '0901234567',
            'shipping_address' => 'Địa chỉ 2',
            'status' => 'confirmed',
            'subtotal' => 2000000,
        ]);

        // Tạo 1 đơn hàng cho user khác (không được xuất hiện trong list của user này)
        $otherUser = User::factory()->create();
        Order::create([
            'order_code' => 'ORD-OTHER-USER',
            'user_id' => $otherUser->id,
            'recipient_name' => 'Người lạ',
            'recipient_phone' => '0900000000',
            'shipping_address' => 'Địa chỉ người lạ',
            'status' => 'pending',
            'subtotal' => 3000000,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/orders');

        $response->assertStatus(200);
        $response->assertJson([
            'status' => true,
        ]);

        $data = $response->json('data');
        $this->assertCount(2, $data);
        $orderCodes = collect($data)->pluck('order_code')->toArray();
        $this->assertContains('ORD-TEST-1', $orderCodes);
        $this->assertContains('ORD-TEST-2', $orderCodes);
        $this->assertNotContains('ORD-OTHER-USER', $orderCodes);
    }

    /**
     * Test 6: Xem chi tiết các món trong đơn (GET /api/orders/{id})
     */
    public function test_get_order_detail_with_items(): void
    {
        $order = Order::create([
            'order_code' => 'ORD-DETAIL-TEST',
            'user_id' => $this->user->id,
            'recipient_name' => 'Kiệt Nguyễn',
            'recipient_phone' => '0901234567',
            'shipping_address' => 'Quận 1, TP.HCM',
            'status' => 'pending',
            'subtotal' => 30000000,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'sku' => $this->variant->sku,
            'color' => $this->variant->color,
            'material' => $this->variant->material,
            'dimensions_snapshot' => 'D180 × R90 × C75 cm',
            'quantity' => 2,
            'unit_price' => 15000000,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson("/api/orders/{$order->id}");

        $response->assertStatus(200);
        $response->assertJson([
            'status' => true,
            'data' => [
                'id' => $order->id,
                'order_code' => 'ORD-DETAIL-TEST',
                'recipient_name' => 'Kiệt Nguyễn',
                'items' => [
                    [
                        'variant_id' => $this->variant->id,
                        'product_name' => $this->product->name,
                        'quantity' => 2,
                        'unit_price' => 15000000,
                    ],
                ],
            ],
        ]);
    }

    /**
     * Test 7: Khách tự hủy đơn hàng pending và cộng hoàn lại số lượng tồn kho (PATCH /api/orders/{id}/cancel)
     */
    public function test_customer_can_cancel_pending_order_and_restock(): void
    {
        // Tồn kho ban đầu là 5
        $this->variant->update(['stock_quantity' => 5]);

        // Giả sử trước đó user đã đặt 3 món (tồn kho còn 5)
        $order = Order::create([
            'order_code' => 'ORD-CANCEL-PENDING',
            'user_id' => $this->user->id,
            'recipient_name' => 'Kiệt Nguyễn',
            'recipient_phone' => '0901234567',
            'shipping_address' => 'Quận 1, TP.HCM',
            'status' => 'pending',
            'subtotal' => 45000000,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'sku' => $this->variant->sku,
            'color' => $this->variant->color,
            'material' => $this->variant->material,
            'quantity' => 3,
            'unit_price' => 15000000,
        ]);

        // Thực hiện hủy đơn
        $response = $this->actingAs($this->user, 'sanctum')->patchJson("/api/orders/{$order->id}/cancel");

        $response->assertStatus(200);
        $response->assertJson([
            'status' => true,
            'message' => 'Hủy đơn hàng thành công và đã hoàn lại số lượng tồn kho.',
            'data' => [
                'status' => 'cancelled',
            ],
        ]);

        // Kiểm tra trạng thái đơn đã chuyển sang cancelled
        $this->assertEquals('cancelled', $order->fresh()->status);

        // Kiểm tra tồn kho được cộng hoàn lại: 5 + 3 = 8
        $this->assertEquals(8, $this->variant->fresh()->stock_quantity);
    }

    /**
     * Test 8: Không cho phép hủy đơn nếu đơn không ở trạng thái pending (ví dụ confirmed hoặc shipping)
     */
    public function test_cannot_cancel_order_if_status_is_not_pending(): void
    {
        $this->variant->update(['stock_quantity' => 5]);

        $order = Order::create([
            'order_code' => 'ORD-CANCEL-CONFIRMED',
            'user_id' => $this->user->id,
            'recipient_name' => 'Kiệt Nguyễn',
            'recipient_phone' => '0901234567',
            'shipping_address' => 'Quận 1, TP.HCM',
            'status' => 'confirmed', // Đã xác nhận bởi shop
            'subtotal' => 15000000,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'variant_id' => $this->variant->id,
            'product_name' => $this->product->name,
            'sku' => $this->variant->sku,
            'color' => $this->variant->color,
            'material' => $this->variant->material,
            'quantity' => 1,
            'unit_price' => 15000000,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->patchJson("/api/orders/{$order->id}/cancel");

        // Không cho phép hủy
        $response->assertStatus(400);
        $response->assertJson([
            'status' => false,
        ]);

        // Trạng thái đơn không đổi
        $this->assertEquals('confirmed', $order->fresh()->status);

        // Tồn kho không đổi
        $this->assertEquals(5, $this->variant->fresh()->stock_quantity);
    }

    /**
     * Test 9: Khách vãng lai chưa đăng nhập không thể truy cập các API đơn hàng (401 Unauthorized)
     */
    public function test_unauthenticated_user_cannot_access_order_apis(): void
    {
        $this->postJson('/api/orders', [])->assertStatus(401);
        $this->getJson('/api/orders')->assertStatus(401);
        $this->getJson('/api/orders/1')->assertStatus(401);
        $this->patchJson('/api/orders/1/cancel')->assertStatus(401);
    }

    /**
     * Test 10: Đặt hàng trực tiếp với danh sách items (Mua ngay)
     */
    public function test_create_order_with_direct_items_payload(): void
    {
        $this->variant->update(['stock_quantity' => 10]);

        $response = $this->actingAs($this->user, 'sanctum')->postJson('/api/orders', [
            'recipient_name' => 'Nguyễn Tuấn Kiệt',
            'recipient_phone' => '0988776655',
            'shipping_address' => '789 Đường 3 Tháng 2, Quận 10, TP.HCM',
            'payment_method' => 'bank_transfer',
            'items' => [
                [
                    'variant_id' => $this->variant->id,
                    'quantity' => 4,
                ],
            ],
            'shipping_fee' => 50000,
            'discount_amount' => 100000,
        ]);

        $response->assertStatus(201);
        $orderData = $response->json('data');

        $this->assertEquals(4 * 15000000, $orderData['subtotal']);
        $this->assertEquals(50000, $orderData['shipping_fee']);
        $this->assertEquals(100000, $orderData['discount_amount']);
        $this->assertEquals((4 * 15000000) + 50000 - 100000, $orderData['total_amount']);

        // Tồn kho bị trừ: 10 - 4 = 6
        $this->assertEquals(6, $this->variant->fresh()->stock_quantity);
    }

    /**
     * Test 11: Không thể xem hoặc hủy đơn hàng của khách hàng khác (403 Forbidden)
     */
    public function test_user_cannot_view_or_cancel_another_users_order(): void
    {
        $otherUser = User::factory()->create();

        $order = Order::create([
            'order_code' => 'ORD-OTHER-USER-TEST',
            'user_id' => $otherUser->id,
            'recipient_name' => 'Khách hàng khác',
            'recipient_phone' => '0911223344',
            'shipping_address' => 'Hà Nội',
            'status' => 'pending',
            'subtotal' => 10000000,
        ]);

        // Cố tình xem đơn của người khác
        $viewResponse = $this->actingAs($this->user, 'sanctum')->getJson("/api/orders/{$order->id}");
        $viewResponse->assertStatus(403);

        // Cố tình hủy đơn của người khác
        $cancelResponse = $this->actingAs($this->user, 'sanctum')->patchJson("/api/orders/{$order->id}/cancel");
        $cancelResponse->assertStatus(403);
    }

    /**
     * Test 12: Lọc danh sách đơn hàng theo trạng thái
     */
    public function test_filter_orders_by_status(): void
    {
        Order::create([
            'order_code' => 'ORD-STATUS-PENDING',
            'user_id' => $this->user->id,
            'recipient_name' => 'Kiệt',
            'recipient_phone' => '0901234567',
            'shipping_address' => 'TP.HCM',
            'status' => 'pending',
            'subtotal' => 1000000,
        ]);

        Order::create([
            'order_code' => 'ORD-STATUS-COMPLETED',
            'user_id' => $this->user->id,
            'recipient_name' => 'Kiệt',
            'recipient_phone' => '0901234567',
            'shipping_address' => 'TP.HCM',
            'status' => 'completed',
            'subtotal' => 2000000,
        ]);

        $response = $this->actingAs($this->user, 'sanctum')->getJson('/api/orders?status=pending');

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('ORD-STATUS-PENDING', $data[0]['order_code']);
    }
}
