<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $admin2;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name' => 'Nguyễn Admin Chính',
            'email' => 'main_admin_' . uniqid() . '@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->admin2 = User::factory()->create([
            'name' => 'Trần Admin Phụ',
            'email' => 'sub_admin_' . uniqid() . '@example.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->regularUser = User::factory()->create([
            'name' => 'Lê Khách Hàng',
            'email' => 'customer_' . uniqid() . '@example.com',
            'role' => 'user',
            'is_active' => true,
        ]);
    }

    /**
     * Test: Khách chưa đăng nhập không thể truy cập danh sách người dùng (401)
     */
    public function test_unauthenticated_user_cannot_access_users_api()
    {
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(401);
    }

    /**
     * Test: Người dùng vai trò 'user' không thể truy cập quản trị người dùng (403)
     */
    public function test_regular_user_cannot_access_users_api()
    {
        Sanctum::actingAs($this->regularUser);

        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(403);
    }

    /**
     * Test: Admin có thể xem danh sách người dùng kèm bộ lọc và đếm số lượng
     */
    public function test_admin_can_list_users_with_filters()
    {
        Sanctum::actingAs($this->admin);

        // Lấy tất cả
        $response = $this->getJson('/api/admin/users');
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ])
            ->assertJsonStructure([
                'status',
                'message',
                'counts' => ['total', 'admins', 'customers', 'active', 'locked'],
                'data',
                'pagination',
            ]);

        $this->assertEquals(3, $response->json('counts.total'));
        $this->assertEquals(2, $response->json('counts.admins'));
        $this->assertEquals(1, $response->json('counts.customers'));

        // Lọc theo role=user
        $responseUserOnly = $this->getJson('/api/admin/users?role=user');
        $responseUserOnly->assertStatus(200);
        $this->assertCount(1, $responseUserOnly->json('data'));
        $this->assertEquals($this->regularUser->email, $responseUserOnly->json('data.0.email'));

        // Tìm kiếm theo tên
        $responseSearch = $this->getJson('/api/admin/users?q=Khách Hàng');
        $responseSearch->assertStatus(200);
        $this->assertCount(1, $responseSearch->json('data'));
    }

    /**
     * Test: Admin có thể xem chi tiết người dùng
     */
    public function test_admin_can_view_user_detail()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->getJson('/api/admin/users/' . $this->regularUser->id);
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
                'data' => [
                    'id' => $this->regularUser->id,
                    'email' => $this->regularUser->email,
                    'role' => 'user',
                    'is_active' => true,
                ],
            ]);
    }

    /**
     * Test: Admin có thể tạo tài khoản mới
     */
    public function test_admin_can_create_new_user()
    {
        Sanctum::actingAs($this->admin);

        $newEmail = 'new_staff_' . uniqid() . '@example.com';
        $response = $this->postJson('/api/admin/users', [
            'name' => 'Nhân Viên Mới',
            'email' => $newEmail,
            'password' => 'secret123',
            'phone' => '0912345678',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'status' => true,
            ]);

        $this->assertDatabaseHas('users', [
            'email' => $newEmail,
            'role' => 'admin',
        ]);
    }

    /**
     * Test: Admin có thể phân quyền / thăng quyền người dùng
     */
    public function test_admin_can_update_user_role()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson('/api/admin/users/' . $this->regularUser->id . '/role', [
            'role' => 'admin',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ]);

        $this->regularUser->refresh();
        $this->assertEquals('admin', $this->regularUser->role);
    }

    /**
     * Test: RÀNG BUỘC - Admin KHÔNG THỂ tự hạ quyền của chính mình (400)
     */
    public function test_admin_cannot_demote_themselves()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson('/api/admin/users/' . $this->admin->id . '/role', [
            'role' => 'user',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'status' => false,
                'message' => 'Bạn không thể tự hạ quyền Quản trị viên của chính mình.',
            ]);
    }

    /**
     * Test: Admin có thể khóa và mở khóa tài khoản
     */
    public function test_admin_can_lock_and_unlock_user()
    {
        Sanctum::actingAs($this->admin);

        // Khóa tài khoản
        $responseLock = $this->patchJson('/api/admin/users/' . $this->regularUser->id . '/status', [
            'is_active' => false,
        ]);

        $responseLock->assertStatus(200)
            ->assertJson([
                'status' => true,
            ]);

        $this->regularUser->refresh();
        $this->assertFalse((bool) $this->regularUser->is_active);

        // Mở khóa tài khoản
        $responseUnlock = $this->patchJson('/api/admin/users/' . $this->regularUser->id . '/status', [
            'is_active' => true,
        ]);

        $responseUnlock->assertStatus(200);
        $this->regularUser->refresh();
        $this->assertTrue((bool) $this->regularUser->is_active);
    }

    /**
     * Test: RÀNG BUỘC - Admin KHÔNG THỂ tự khóa tài khoản của chính mình (400)
     */
    public function test_admin_cannot_lock_themselves()
    {
        Sanctum::actingAs($this->admin);

        $response = $this->patchJson('/api/admin/users/' . $this->admin->id . '/status', [
            'is_active' => false,
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'status' => false,
                'message' => 'Bạn không thể tự khóa tài khoản của chính mình.',
            ]);
    }

    /**
     * Test: RÀNG BUỘC - Không thể xóa người dùng đã có đơn hàng (400)
     */
    public function test_cannot_delete_user_with_orders()
    {
        Sanctum::actingAs($this->admin);

        // Tạo đơn hàng cho regularUser
        Order::create([
            'order_code' => 'ORD-DEL-TEST',
            'user_id' => $this->regularUser->id,
            'recipient_name' => $this->regularUser->name,
            'recipient_phone' => '0987654321',
            'shipping_address' => 'Test Address',
            'status' => 'pending',
            'subtotal' => 1000000,
            'shipping_fee' => 30000,
            'discount_amount' => 0,
        ]);

        $response = $this->deleteJson('/api/admin/users/' . $this->regularUser->id);

        $response->assertStatus(400);
        $this->assertStringContainsString('đã có lịch sử đơn hàng', $response->json('message'));
        $this->assertDatabaseHas('users', ['id' => $this->regularUser->id]);
    }

    /**
     * Test: Admin có thể xóa người dùng chưa có đơn hàng nào
     */
    public function test_admin_can_delete_user_without_orders()
    {
        Sanctum::actingAs($this->admin);

        $userToDelete = User::factory()->create([
            'role' => 'user',
            'is_active' => true,
        ]);

        $response = $this->deleteJson('/api/admin/users/' . $userToDelete->id);
        $response->assertStatus(200);

        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
    }
}
