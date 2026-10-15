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

class AdminDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin_dash_' . uniqid() . '@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->regularUser = User::factory()->create([
            'email' => 'user_dash_' . uniqid() . '@example.com',
            'role' => 'user',
            'is_active' => true,
        ]);
    }

    /**
     * Test: Khách chưa đăng nhập không thể truy cập dashboard overview (401)
     */
    public function test_unauthenticated_user_cannot_access_dashboard()
    {
        $response = $this->getJson('/api/admin/dashboard/overview');
        $response->assertStatus(401);
    }

    /**
     * Test: Người dùng vai trò thông thường (user) bị từ chối truy cập (403)
     */
    public function test_regular_user_cannot_access_dashboard()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/admin/dashboard/overview');
        $response->assertStatus(403)
            ->assertJson([
                'status' => false,
                'message' => 'Truy cập bị từ chối. Bạn không có quyền truy cập vào khu vực quản trị (Admin).',
            ]);
    }

    /**
     * Test: Admin có thể lấy dữ liệu Dashboard Overview thành công
     */
    public function test_admin_can_get_dashboard_overview()
    {
        Sanctum::actingAs($this->admin);

        // Tạo dữ liệu danh mục & sản phẩm
        $category = Category::create([
            'name' => 'Ghế Sofa Test',
            'slug' => 'ghe-sofa-test-' . uniqid(),
            'is_active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Sofa Da Cao Cấp',
            'slug' => 'sofa-da-cao-cap-' . uniqid(),
            'brand' => 'Living Decor',
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SOFA-VAR-01',
            'color' => 'Nâu da bò',
            'material' => 'Da bò Ý',
            'price' => 15000000,
            'stock_quantity' => 4, // low stock test
            'is_active' => true,
        ]);

        // Tạo 1 đơn hàng completed
        $order = Order::create([
            'order_code' => 'ORD-TEST-1',
            'user_id' => $this->regularUser->id,
            'recipient_name' => 'Nguyễn Văn A',
            'recipient_phone' => '0987654321',
            'shipping_address' => '123 Đường Test, Q1, TP.HCM',
            'status' => 'completed',
            'subtotal' => 15000000,
            'shipping_fee' => 50000,
            'discount_amount' => 0,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'variant_id' => $variant->id,
            'product_name' => 'Sofa Da Cao Cấp',
            'sku' => 'SOFA-VAR-01',
            'color' => 'Nâu da bò',
            'material' => 'Da bò Ý',
            'quantity' => 1,
            'unit_price' => 15000000,
        ]);

        Payment::create([
            'order_id' => $order->id,
            'method' => 'cod',
            'status' => 'success',
            'amount' => 15050000,
            'paid_at' => now(),
        ]);

        $response = $this->getJson('/api/admin/dashboard/overview?period=7_days');

        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'kpis' => [
                        'revenue',
                        'orders',
                        'customers',
                        'inventory',
                    ],
                    'charts' => [
                        'revenue_trend' => [
                            'period',
                            'data',
                        ],
                        'category_sales',
                        'payment_methods',
                        'status_distribution',
                    ],
                    'actionable' => [
                        'pending_orders',
                        'top_selling_products',
                        'low_stock_alerts',
                        'recent_customers',
                    ],
                ],
            ]);

        $data = $response->json('data');

        // Kiểm tra KPI doanh thu
        $this->assertGreaterThanOrEqual(15050000, $data['kpis']['revenue']['all_time']);
        $this->assertEquals(1, $data['kpis']['orders']['completed']);

        // Kiểm tra cảnh báo tồn kho thấp (low_stock_alerts có variant stock_quantity <= 5)
        $this->assertNotEmpty($data['actionable']['low_stock_alerts']);
        $this->assertEquals('SOFA-VAR-01', $data['actionable']['low_stock_alerts'][0]['sku']);
    }

    /**
     * Test: Thống kê theo kỳ 12 tháng (12_months)
     */
    public function test_admin_can_get_dashboard_with_12_months_period()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/dashboard/overview?period=12_months');

        $response->assertStatus(200);
        $trend = $response->json('data.charts.revenue_trend.data');

        // Phải có đúng 12 tháng
        $this->assertCount(12, $trend);
        $this->assertEquals(1, $trend[0]['month']);
        $this->assertEquals(12, $trend[11]['month']);
    }
}
