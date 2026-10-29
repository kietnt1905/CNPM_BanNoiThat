<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerOrderApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private ProductVariant $variant;
    private Order $pendingOrder;
    private Order $completedOrder;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'email' => 'customer_orders_' . uniqid() . '@example.com',
        ]);

        $this->otherUser = User::factory()->create([
            'email' => 'other_user_' . uniqid() . '@example.com',
        ]);

        $category = Category::create([
            'name' => 'Ghế Sofa Test',
            'slug' => 'ghe-sofa-test-' . uniqid(),
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Sofa Da Bò Ý Florence',
            'slug' => 'sofa-da-bo-y-florence-' . uniqid(),
            'brand' => 'TK House',
            'is_active' => true,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SOFA-FLO-01',
            'color' => 'Nâu Cognac',
            'material' => 'Da bò Ý cao cấp',
            'price' => 25000000,
            'stock_quantity' => 5,
        ]);

        // Đơn 1: pending
        $this->pendingOrder = Order::create([
            'order_code' => 'TKH202610290001',
            'user_id' => $this->user->id,
            'recipient_name' => 'Nguyễn Tuấn Kiệt',
            'recipient_phone' => '0912345678',
            'shipping_address' => '123 Nguyễn Huệ, Q1, TP.HCM',
            'status' => 'pending',
            'subtotal' => 25000000,
            'shipping_fee' => 0,
            'discount_amount' => 0,
        ]);

        OrderItem::create([
            'order_id' => $this->pendingOrder->id,
            'variant_id' => $this->variant->id,
            'product_name' => 'Sofa Da Bò Ý Florence',
            'sku' => $this->variant->sku,
            'color' => $this->variant->color,
            'material' => $this->variant->material,
            'quantity' => 1,
            'unit_price' => 25000000,
        ]);

        Payment::create([
            'order_id' => $this->pendingOrder->id,
            'method' => 'cod',
            'status' => 'pending',
            'amount' => 25000000,
        ]);

        // Đơn 2: completed
        $this->completedOrder = Order::create([
            'order_code' => 'TKH202610290002',
            'user_id' => $this->user->id,
            'recipient_name' => 'Nguyễn Tuấn Kiệt',
            'recipient_phone' => '0912345678',
            'shipping_address' => '123 Nguyễn Huệ, Q1, TP.HCM',
            'status' => 'completed',
            'subtotal' => 25000000,
            'shipping_fee' => 0,
            'discount_amount' => 0,
        ]);

        Payment::create([
            'order_id' => $this->completedOrder->id,
            'method' => 'vnpay',
            'status' => 'success',
            'amount' => 25000000,
        ]);
    }

    /**
     * Test lấy thống kê số lượng đơn hàng theo từng trạng thái
     */
    public function test_can_get_order_counts_by_status(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/orders/counts');

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.all', 2)
            ->assertJsonPath('data.pending', 1)
            ->assertJsonPath('data.completed', 1)
            ->assertJsonPath('data.confirmed', 0)
            ->assertJsonPath('data.shipping', 0)
            ->assertJsonPath('data.cancelled', 0);
    }

    /**
     * Test lọc đơn hàng theo trạng thái
     */
    public function test_can_filter_orders_by_status(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/orders?status=pending');

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order_code', 'TKH202610290001');
    }

    /**
     * Test tìm kiếm đơn hàng theo từ khóa mã đơn hoặc tên sản phẩm
     */
    public function test_can_search_orders_by_keyword(): void
    {
        Sanctum::actingAs($this->user);

        // Tìm theo mã đơn
        $resCode = $this->getJson('/api/orders?search=0001');
        $resCode->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order_code', 'TKH202610290001');

        // Tìm theo tên sản phẩm
        $resName = $this->getJson('/api/orders?search=Florence');
        $resName->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.order_code', 'TKH202610290001');
    }

    /**
     * Test xem chi tiết đơn hàng
     */
    public function test_can_get_order_detail(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/orders/' . $this->pendingOrder->order_code);

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.order_code', 'TKH202610290001')
            ->assertJsonPath('data.can_cancel', true)
            ->assertJsonCount(1, 'data.items');
    }

    /**
     * Test không thể xem đơn hàng của người khác (403)
     */
    public function test_cannot_view_other_users_order(): void
    {
        Sanctum::actingAs($this->otherUser);

        $response = $this->getJson('/api/orders/' . $this->pendingOrder->id);

        $response->assertStatus(403)
            ->assertJsonPath('status', false);
    }

    /**
     * Test hủy đơn hàng pending và kiểm tra tồn kho được hoàn trả
     */
    public function test_can_cancel_pending_order_and_restores_stock(): void
    {
        Sanctum::actingAs($this->user);

        $initialStock = $this->variant->stock_quantity; // 5

        $response = $this->patchJson('/api/orders/' . $this->pendingOrder->id . '/cancel', [
            'reason' => 'Khách hàng đổi ý muốn chọn màu khác',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('orders', [
            'id' => $this->pendingOrder->id,
            'status' => 'cancelled',
        ]);

        $this->variant->refresh();
        $this->assertEquals($initialStock + 1, $this->variant->stock_quantity); // 5 + 1 = 6
    }
}
