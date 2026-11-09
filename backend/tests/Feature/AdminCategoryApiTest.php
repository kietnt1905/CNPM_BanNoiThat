<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminCategoryApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'email' => 'admin_cat_' . uniqid() . '@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->regularUser = User::factory()->create([
            'email' => 'user_cat_' . uniqid() . '@example.com',
            'role' => 'user',
            'is_active' => true,
        ]);
    }

    /**
     * Test: Khách chưa đăng nhập không thể truy cập (401)
     */
    public function test_unauthenticated_user_cannot_access_categories()
    {
        $response = $this->getJson('/api/admin/categories');
        $response->assertStatus(401);
    }

    /**
     * Test: User thường không thể truy cập (403)
     */
    public function test_regular_user_cannot_access_categories()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/admin/categories');
        $response->assertStatus(403);
    }

    /**
     * Test: Admin có thể xem danh sách danh mục có thống kê tabs và đếm sản phẩm
     */
    public function test_admin_can_list_categories_with_filters()
    {
        Sanctum::actingAs($this->admin);

        Category::create([
            'name' => 'Ghế Sofa Phòng Khách',
            'slug' => 'sofa-phong-khach',
            'is_active' => true,
        ]);

        Category::create([
            'name' => 'Bàn Ăn Cổ Điển',
            'slug' => 'ban-an-co-dien',
            'is_active' => false,
        ]);

        // 1. Lấy tất cả
        $response = $this->getJson('/api/admin/categories');
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'counts' => ['total', 'active', 'inactive'],
                'data',
                'pagination',
            ]);

        $this->assertEquals(2, $response->json('counts.total'));
        $this->assertEquals(1, $response->json('counts.active'));
        $this->assertEquals(1, $response->json('counts.inactive'));

        // 2. Lọc theo trạng thái is_active=1
        $responseActive = $this->getJson('/api/admin/categories?is_active=1');
        $responseActive->assertStatus(200);
        $this->assertCount(1, $responseActive->json('data'));
        $this->assertEquals('sofa-phong-khach', $responseActive->json('data.0.slug'));

        // 3. Tìm kiếm từ khóa q=Bàn
        $responseSearch = $this->getJson('/api/admin/categories?q=Bàn');
        $responseSearch->assertStatus(200);
        $this->assertCount(1, $responseSearch->json('data'));
        $this->assertEquals('ban-an-co-dien', $responseSearch->json('data.0.slug'));

        // 4. Lấy tất cả không phân trang all=true (cho dropdown)
        $responseAll = $this->getJson('/api/admin/categories?all=true');
        $responseAll->assertStatus(200);
        $this->assertCount(2, $responseAll->json('data'));
        $this->assertArrayNotHasKey('pagination', $responseAll->json());
    }

    /**
     * Test: Admin có thể xem chi tiết danh mục
     */
    public function test_admin_can_view_category_detail()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::create([
            'name' => 'Tủ Quần Áo',
            'slug' => 'tu-quan-ao',
            'description' => 'Mô tả tủ áo gỗ sồi',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/admin/categories/' . $category->id);
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
                'data' => [
                    'id' => $category->id,
                    'name' => 'Tủ Quần Áo',
                    'slug' => 'tu-quan-ao',
                ],
            ]);
    }

    /**
     * Test: Admin có thể tạo mới danh mục (kèm tự động sinh slug)
     */
    public function test_admin_can_create_category_with_auto_slug()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->postJson('/api/admin/categories', [
            'name' => 'Kệ Ti Vi Gỗ Tự Nhiên',
            'description' => 'Kệ tivi phòng khách hiện đại',
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => true,
                'data' => [
                    'name' => 'Kệ Ti Vi Gỗ Tự Nhiên',
                    'slug' => 'ke-ti-vi-go-tu-nhien',
                    'is_active' => true,
                ],
            ]);

        $this->assertDatabaseHas('categories', [
            'slug' => 'ke-ti-vi-go-tu-nhien',
        ]);
    }

    /**
     * Test: Admin có thể cập nhật danh mục
     */
    public function test_admin_can_update_category()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::create([
            'name' => 'Giường Ngủ Cũ',
            'slug' => 'giuong-ngu-cu',
            'is_active' => true,
        ]);

        $response = $this->putJson('/api/admin/categories/' . $category->id, [
            'name' => 'Giường Ngủ Cao Cấp King Size',
            'slug' => 'giuong-ngu-king-size',
            'description' => 'Giường gỗ óc chó nhập khẩu',
            'is_active' => true,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ]);

        $category->refresh();
        $this->assertEquals('Giường Ngủ Cao Cấp King Size', $category->name);
        $this->assertEquals('giuong-ngu-king-size', $category->slug);
    }

    /**
     * Test: Admin có thể bật tắt nhanh trạng thái hiển thị (updateStatus)
     */
    public function test_admin_can_toggle_category_status()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::create([
            'name' => 'Bàn Trang Điểm',
            'slug' => 'ban-trang-diem',
            'is_active' => true,
        ]);

        // Chuyển sang ẩn (false)
        $response = $this->patchJson('/api/admin/categories/' . $category->id . '/status', [
            'is_active' => false,
        ]);

        $response->assertStatus(200);
        $category->refresh();
        $this->assertFalse((bool) $category->is_active);

        // Chuyển lại sang hiển thị (true)
        $response2 = $this->patchJson('/api/admin/categories/' . $category->id . '/status', [
            'is_active' => true,
        ]);

        $response2->assertStatus(200);
        $category->refresh();
        $this->assertTrue((bool) $category->is_active);
    }

    /**
     * Test: RÀNG BUỘC - Không được xóa danh mục đang có sản phẩm (400)
     */
    public function test_cannot_delete_category_with_products()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::create([
            'name' => 'Bàn Làm Việc',
            'slug' => 'ban-lam-viec',
            'is_active' => true,
        ]);

        // Tạo 1 sản phẩm thuộc danh mục này
        Product::create([
            'category_id' => $category->id,
            'name' => 'Bàn Làm Việc Chữ L',
            'slug' => 'ban-lam-viec-chu-l',
            'brand' => 'Decor House',
            'is_active' => true,
        ]);

        $response = $this->deleteJson('/api/admin/categories/' . $category->id);

        $response->assertStatus(400);
        $this->assertStringContainsString('đang có 1 sản phẩm liên kết', $response->json('message'));
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    /**
     * Test: Admin có thể xóa danh mục trống (chưa có sản phẩm nào)
     */
    public function test_admin_can_delete_empty_category()
    {
        Sanctum::actingAs($this->admin);

        $category = Category::create([
            'name' => 'Danh Mục Thử Nghiệm Trống',
            'slug' => 'danh-muc-trong',
            'is_active' => true,
        ]);

        $response = $this->deleteJson('/api/admin/categories/' . $category->id);

        $response->assertStatus(200);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }
}
