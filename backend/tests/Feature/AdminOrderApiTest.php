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

class AdminOrderApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;
    private Order $order;
    private ProductVariant $variant;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Tạo tài khoản Admin
        $this->admin = User::factory()->create([
            'email' => 'admin_test_' . uniqid() . '@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        // 2. Tạo tài khoản User bình thường
        $this->regularUser = User::factory()->create([
            'email' => 'user_test_' . uniqid() . '@example.com',
            'role' => 'user',
            'is_active' => true,
        ]);

        // 3. Tạo sản phẩm & biến thể mẫu
        $category = Category::create([
            'name' => 'Bàn Test',
            'slug' => 'ban-test-' . uniqid(),
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Bàn Ăn Cao Cấp Test',
            'slug' => 'ban-an-cao-cap-test-' . uniqid(),
            'brand' => 'TK House',
            'is_active' => true,
        ]);

        $this->variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'TEST-VAR-' . uniqid(),
            'price' => 15000000,
            'stock_quantity' => 10,
            'color' => 'Nâu Óc Chó',
            'material' => 'Gỗ Tự Nhiên',
            'dimensions' => '200x90x75cm',
            'is_active' => true,
        ]);

        // 4. Tạo đơn hàng mẫu
        $this->order = Order::create([
            'order_code' => 'TK-TEST-' . strtoupper(uniqid()),
            'user_id' => $this->regularUser->id,
            'recipient_name' => 'Nguyễn Văn Khách',
            'recipient_phone' => '0901234567',
            'shipping_address' => '123 Đường Test, Quận 1, TP.HCM',
            'status' => 'pending',
            'subtotal' => 15000000,
            'shipping_fee' => 0,
            'discount_amount' => 0,
            'total_amount' => 15000000,
            'note' => 'Giao giờ hành chính',
        ]);

        OrderItem::create([
            'order_id' => $this->order->id,
            'variant_id' => $this->variant->id,
            'product_name' => $product->name,
            'sku' => $this->variant->sku,
            'color' => $this->variant->color,
            'material' => $this->variant->material,
            'dimensions_snapshot' => $this->variant->dimensions,
            'quantity' => 1,
            'unit_price' => 15000000,
            'line_total' => 15000000,
        ]);

        Payment::create([
            'order_id' => $this->order->id,
            'method' => 'cod',
            'status' => 'pending',
            'amount' => 15000000,
        ]);
    }

    /**
     * Test: Người chưa đăng nhập không thể truy cập Admin
     */
    public function test_guest_cannot_access_admin_orders()
    {
        $response = $this->getJson('/api/admin/orders');
        $response->assertStatus(401);
    }

    /**
     * Test: User thường (role !== admin) không thể truy cập Admin
     */
    public function test_regular_user_forbidden_from_admin_orders()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/admin/orders');
        $response->assertStatus(403)
            ->assertJson([
                'status' => false,
            ]);
    }

    /**
     * Test: Admin có thể lấy danh sách đơn hàng kèm thống kê
     */
    public function test_admin_can_get_orders_list_and_statistics()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/orders');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data',
                'pagination',
                'statistics' => [
                    'total_orders',
                    'pending_orders',
                    'confirmed_orders',
                    'shipping_orders',
                    'completed_orders',
                    'cancelled_orders',
                    'total_revenue',
                ],
            ]);
    }

    /**
     * Test: Admin có thể xem chi tiết một đơn hàng
     */
    public function test_admin_can_view_order_detail()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/orders/' . $this->order->id);
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
                'data' => [
                    'id' => $this->order->id,
                    'order_code' => $this->order->order_code,
                    'recipient_name' => 'Nguyễn Văn Khách',
                ],
            ]);
    }

    /**
     * Test: Admin có thể cập nhật trạng thái đơn hàng (pending -> confirmed -> shipping)
     */
    public function test_admin_can_update_order_status()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson('/api/admin/orders/' . $this->order->id . '/status', [
            'status' => 'confirmed',
            'admin_note' => 'Đã gọi điện xác nhận đơn thành công',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
                'data' => [
                    'status' => 'confirmed',
                    'status_label' => 'Đã xác nhận',
                ],
            ]);

        $this->assertDatabaseHas('orders', [
            'id' => $this->order->id,
            'status' => 'confirmed',
        ]);
    }

    /**
     * Test: Khi Admin hủy đơn hàng, số lượng tồn kho tự động được hoàn lại
     */
    public function test_cancelling_order_restores_stock_quantity()
    {
        Sanctum::actingAs($this->admin);

        $initialStock = $this->variant->stock_quantity; // 10

        $response = $this->patchJson('/api/admin/orders/' . $this->order->id . '/status', [
            'status' => 'cancelled',
            'admin_note' => 'Khách hàng đổi ý muốn hủy đơn',
        ]);

        $response->assertStatus(200);

        $this->variant->refresh();
        $this->assertEquals($initialStock + 1, $this->variant->stock_quantity); // 11
    }

    /**
     * Test: Admin có thể cập nhật trạng thái thanh toán
     */
    public function test_admin_can_update_payment_status()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson('/api/admin/orders/' . $this->order->id . '/payment-status', [
            'payment_status' => 'success',
            'transaction_code' => 'TXN-BANK-9999',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ]);

        $this->assertDatabaseHas('payments', [
            'order_id' => $this->order->id,
            'status' => 'success',
            'transaction_code' => 'TXN-BANK-9999',
        ]);
    }

    /**
     * Test: Admin có thể xem thống kê chuyên sâu (statistics)
     */
    public function test_admin_can_view_dashboard_statistics()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/orders/statistics');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'overview',
                    'revenue_chart_7_days',
                    'top_selling_products',
                ],
            ]);
    }
}
