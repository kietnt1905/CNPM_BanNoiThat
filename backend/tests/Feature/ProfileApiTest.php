<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'name' => 'Nguyễn Tuấn Kiệt',
            'email' => 'kiet_test@example.com',
            'phone' => '0912345678',
            'address' => '123 Nguyễn Huệ, Quận 1, TP.HCM',
            'password' => Hash::make('Password@123'),
        ]);
    }

    /**
     * Test lấy thông tin cá nhân khi đã đăng nhập
     */
    public function test_can_get_user_profile(): void
    {
        Sanctum::actingAs($this->user);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.name', 'Nguyễn Tuấn Kiệt')
            ->assertJsonPath('data.email', 'kiet_test@example.com')
            ->assertJsonPath('data.phone', '0912345678')
            ->assertJsonPath('data.address', '123 Nguyễn Huệ, Quận 1, TP.HCM')
            ->assertJsonPath('data.has_password', true);
    }

    /**
     * Test lấy profile bị chặn khi chưa đăng nhập (401)
     */
    public function test_cannot_get_profile_unauthenticated(): void
    {
        $response = $this->getJson('/api/profile');
        $response->assertStatus(401);
    }

    /**
     * Test cập nhật thông tin cá nhân thành công
     */
    public function test_can_update_profile_successfully(): void
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'name' => 'Nguyễn Tuấn Kiệt Mới',
            'phone' => '0987654321',
            'address' => '456 Lê Lợi, Quận 1, TP.HCM',
        ];

        $response = $this->putJson('/api/profile', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonPath('data.name', 'Nguyễn Tuấn Kiệt Mới')
            ->assertJsonPath('data.phone', '0987654321')
            ->assertJsonPath('data.address', '456 Lê Lợi, Quận 1, TP.HCM');

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'name' => 'Nguyễn Tuấn Kiệt Mới',
            'phone' => '0987654321',
            'address' => '456 Lê Lợi, Quận 1, TP.HCM',
        ]);
    }

    /**
     * Test cập nhật profile với dữ liệu không hợp lệ (báo lỗi 422)
     */
    public function test_update_profile_validation_error(): void
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'name' => '', // Tên rỗng
            'phone' => 'abc1234', // SĐT không đúng định dạng
        ];

        $response = $this->putJson('/api/profile', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('status', false)
            ->assertJsonValidationErrors(['name', 'phone']);
    }

    /**
     * Test đổi mật khẩu thành công
     */
    public function test_can_change_password_successfully(): void
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'current_password' => 'Password@123',
            'new_password' => 'NewPassword@456',
            'new_password_confirmation' => 'NewPassword@456',
        ];

        $response = $this->putJson('/api/profile/change-password', $payload);

        $response->assertStatus(200)
            ->assertJsonPath('status', true)
            ->assertJsonPath('message', 'Đổi mật khẩu thành công!');

        $this->user->refresh();
        $this->assertTrue(Hash::check('NewPassword@456', $this->user->password));
    }

    /**
     * Test đổi mật khẩu thất bại khi nhập sai mật khẩu hiện tại
     */
    public function test_change_password_fails_with_incorrect_current_password(): void
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'current_password' => 'WrongPassword',
            'new_password' => 'NewPassword@456',
            'new_password_confirmation' => 'NewPassword@456',
        ];

        $response = $this->putJson('/api/profile/change-password', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('status', false)
            ->assertJsonValidationErrors(['current_password']);
    }

    /**
     * Test đổi mật khẩu thất bại khi mật khẩu xác nhận không khớp
     */
    public function test_change_password_fails_when_confirmation_mismatch(): void
    {
        Sanctum::actingAs($this->user);

        $payload = [
            'current_password' => 'Password@123',
            'new_password' => 'NewPassword@456',
            'new_password_confirmation' => 'DifferentPassword@789',
        ];

        $response = $this->putJson('/api/profile/change-password', $payload);

        $response->assertStatus(422)
            ->assertJsonPath('status', false)
            ->assertJsonValidationErrors(['new_password']);
    }
}
