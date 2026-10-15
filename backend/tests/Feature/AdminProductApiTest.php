<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminProductApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;
    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin_prod_' . uniqid() . '@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->regularUser = User::factory()->create([
            'email' => 'user_prod_' . uniqid() . '@example.com',
            'role' => 'user',
            'is_active' => true,
        ]);

        $this->category = Category::create([
            'name' => 'Bàn Ăn',
            'slug' => 'ban-an',
            'is_active' => true,
        ]);
    }

    /**
     * Test: Khách chưa đăng nhập không thể truy cập (401)
     */
    public function test_unauthenticated_user_cannot_access_products()
    {
        $response = $this->getJson('/api/admin/products');
        $response->assertStatus(401);
    }

    /**
     * Test: User thường không có quyền truy cập (403)
     */
    public function test_regular_user_cannot_access_products()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/admin/products');
        $response->assertStatus(403);
    }

    /**
     * Test: Admin có thể xem danh sách sản phẩm kèm bộ lọc và đếm tabs
     */
    public function test_admin_can_list_products_with_filters()
    {
        Sanctum::actingAs($this->admin);

        // Tạo 2 sản phẩm mẫu
        $p1 = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bàn Ăn Gỗ Sồi Bắc Âu',
            'slug' => 'ban-an-go-soi-bac-au',
            'brand' => 'Nordic Living',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $p1->id,
            'sku' => 'SKU-BAN-01',
            'color' => 'Gỗ tự nhiên',
            'material' => 'Gỗ sồi Nga',
            'price' => 8500000,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $p2 = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bàn Ăn Mặt Đá Cẩm Thạch',
            'slug' => 'ban-an-mat-da-cam-thach',
            'brand' => 'Luxury Home',
            'is_active' => false,
        ]);

        ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'SKU-BAN-02',
            'color' => 'Trắng vân mây',
            'material' => 'Đá ceramic',
            'price' => 12500000,
            'stock_quantity' => 2, // low stock <= 5
            'is_active' => true,
        ]);

        // 1. Lấy tất cả
        $response = $this->getJson('/api/admin/products');
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'counts' => ['total', 'active', 'inactive', 'low_stock', 'out_of_stock'],
                'data',
                'pagination',
            ]);

        $this->assertEquals(2, $response->json('counts.total'));
        $this->assertEquals(1, $response->json('counts.active'));
        $this->assertEquals(1, $response->json('counts.inactive'));
        $this->assertEquals(1, $response->json('counts.low_stock'));

        // 2. Lọc theo is_active=1
        $responseActive = $this->getJson('/api/admin/products?is_active=1');
        $responseActive->assertStatus(200);
        $this->assertCount(1, $responseActive->json('data'));
        $this->assertEquals($p1->id, $responseActive->json('data.0.id'));

        // 3. Tìm kiếm theo tên
        $responseSearch = $this->getJson('/api/admin/products?q=Cẩm Thạch');
        $responseSearch->assertStatus(200);
        $this->assertCount(1, $responseSearch->json('data'));
        $this->assertEquals($p2->id, $responseSearch->json('data.0.id'));
    }

    /**
     * Test: Admin có thể xem chi tiết sản phẩm
     */
    public function test_admin_can_view_product_detail()
    {
        Sanctum::actingAs($this->admin);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Ghế Ăn Bọc Da Bò',
            'slug' => 'ghe-an-boc-da-bo',
            'brand' => 'HomeArt',
            'description' => 'Mô tả chi tiết ghế ăn',
            'is_active' => true,
        ]);

        ProductImage::create([
            'product_id' => $product->id,
            'image_url' => '/images/chair.jpg',
            'alt_text' => 'Ghế ăn bọc da',
            'sort_order' => 0,
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'GHE-01-NAU',
            'color' => 'Nâu cà phê',
            'material' => 'Da PU cao cấp',
            'price' => 1500000,
            'stock_quantity' => 20,
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/admin/products/' . $product->id);
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
                'data' => [
                    'id' => $product->id,
                    'name' => 'Ghế Ăn Bọc Da Bò',
                    'slug' => 'ghe-an-boc-da-bo',
                ],
            ]);

        $this->assertNotEmpty($response->json('data.images'));
        $this->assertNotEmpty($response->json('data.variants'));
        $this->assertEquals(20, $response->json('data.stats.total_stock'));
    }

    /**
     * Test: Admin có thể tạo mới sản phẩm kèm biến thể và hình ảnh
     */
    public function test_admin_can_create_product()
    {
        Sanctum::actingAs($this->admin);

        $payload = [
            'category_id' => $this->category->id,
            'name' => 'Bàn Trà Sofa Tròn Đôi',
            'brand' => 'Living Luxury',
            'warranty_months' => 24,
            'description' => 'Bàn trà mặt kính cường lực',
            'is_active' => true,
            'images' => [
                [
                    'image_url' => 'https://example.com/bantra-1.jpg',
                    'alt_text' => 'Bàn trà mặt kính',
                    'sort_order' => 0,
                ],
            ],
            'variants' => [
                [
                    'color' => 'Khung vàng mặt trắng',
                    'material' => 'Thép sơn tĩnh điện + Kính',
                    'price' => 3200000,
                    'stock_quantity' => 15,
                    'length_cm' => 80,
                    'width_cm' => 80,
                    'height_cm' => 45,
                ],
            ],
        ];

        $response = $this->postJson('/api/admin/products', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'status' => true,
            ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Bàn Trà Sofa Tròn Đôi',
            'brand' => 'Living Luxury',
        ]);

        $this->assertDatabaseHas('product_variants', [
            'color' => 'Khung vàng mặt trắng',
            'price' => 3200000,
            'stock_quantity' => 15,
        ]);

        $this->assertDatabaseHas('product_images', [
            'image_url' => 'https://example.com/bantra-1.jpg',
        ]);
    }

    /**
     * Test: Admin có thể cập nhật thông tin sản phẩm và đồng bộ biến thể
     */
    public function test_admin_can_update_product()
    {
        Sanctum::actingAs($this->admin);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bàn Làm Việc Cũ',
            'slug' => 'ban-lam-viec-cu',
            'is_active' => true,
        ]);

        $var1 = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'VAR-OLD-01',
            'color' => 'Màu gỗ',
            'material' => 'Gỗ ép',
            'price' => 2000000,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $updatePayload = [
            'category_id' => $this->category->id,
            'name' => 'Bàn Làm Việc Nâng Hạ Ergonomic',
            'is_active' => true,
            'variants' => [
                [
                    'id' => $var1->id,
                    'sku' => 'VAR-OLD-01',
                    'color' => 'Đen nhám',
                    'material' => 'Khung thép đôi',
                    'price' => 5500000,
                    'stock_quantity' => 12,
                ],
                [
                    // Thêm biến thể mới
                    'color' => 'Trắng sứ',
                    'material' => 'Khung thép đôi',
                    'price' => 5800000,
                    'stock_quantity' => 8,
                ],
            ],
        ];

        $response = $this->putJson('/api/admin/products/' . $product->id, $updatePayload);

        $response->assertStatus(200);

        $product->refresh();
        $this->assertEquals('Bàn Làm Việc Nâng Hạ Ergonomic', $product->name);
        $this->assertEquals(2, $product->variants()->count());

        $var1->refresh();
        $this->assertEquals('Đen nhám', $var1->color);
        $this->assertEquals(5500000, $var1->price);
    }

    /**
     * Test: Admin có thể bật tắt nhanh trạng thái sản phẩm
     */
    public function test_admin_can_toggle_product_status()
    {
        Sanctum::actingAs($this->admin);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Tủ Đầu Giường',
            'slug' => 'tu-dau-giuong',
            'is_active' => true,
        ]);

        $response = $this->patchJson('/api/admin/products/' . $product->id . '/status', [
            'is_active' => false,
        ]);

        $response->assertStatus(200);
        $product->refresh();
        $this->assertFalse((bool) $product->is_active);
    }

    /**
     * Test: Admin có thể cập nhật nhanh số lượng tồn kho của biến thể
     */
    public function test_admin_can_update_variant_stock()
    {
        Sanctum::actingAs($this->admin);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Kệ Sách Gỗ',
            'slug' => 'ke-sach-go',
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'KE-SACH-01',
            'color' => 'Gỗ óc chó',
            'material' => 'Gỗ tự nhiên',
            'price' => 3000000,
            'stock_quantity' => 3,
            'is_active' => true,
        ]);

        $response = $this->patchJson("/api/admin/products/{$product->id}/variants/{$variant->id}/stock", [
            'stock_quantity' => 25,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
                'data' => [
                    'stock_quantity' => 25,
                ],
            ]);

        $variant->refresh();
        $this->assertEquals(25, $variant->stock_quantity);
    }

    /**
     * Test: RÀNG BUỘC - Không được xóa sản phẩm đã có đơn hàng (400)
     */
    public function test_cannot_delete_product_with_orders()
    {
        Sanctum::actingAs($this->admin);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Sofa Đã Bán',
            'slug' => 'sofa-da-ban',
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SOFA-SOLD-01',
            'color' => 'Xám đậm',
            'material' => 'Vải nỉ',
            'price' => 7000000,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        $order = Order::create([
            'order_code' => 'ORD-TEST-PROD',
            'user_id' => $this->regularUser->id,
            'recipient_name' => 'Khách Hàng A',
            'recipient_phone' => '0987654321',
            'shipping_address' => 'Địa chỉ test',
            'status' => 'completed',
            'subtotal' => 7000000,
            'shipping_fee' => 0,
            'discount_amount' => 0,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'variant_id' => $variant->id,
            'product_name' => $product->name,
            'sku' => $variant->sku,
            'color' => $variant->color,
            'material' => $variant->material,
            'quantity' => 1,
            'unit_price' => 7000000,
        ]);

        $response = $this->deleteJson('/api/admin/products/' . $product->id);

        $response->assertStatus(400);
        $this->assertStringContainsString('đã có dữ liệu đơn hàng', $response->json('message'));
        $this->assertDatabaseHas('products', ['id' => $product->id]);
    }

    /**
     * Test: Admin có thể xóa sản phẩm chưa có đơn hàng nào
     */
    public function test_admin_can_delete_product_without_orders()
    {
        Sanctum::actingAs($this->admin);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Sản Phẩm Chưa Bán',
            'slug' => 'san-pham-chua-ban',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $product->id,
            'sku' => 'SKU-TEMP-01',
            'color' => 'Đỏ',
            'material' => 'Nhựa',
            'price' => 500000,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $response = $this->deleteJson('/api/admin/products/' . $product->id);
        $response->assertStatus(200);

        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }
}
