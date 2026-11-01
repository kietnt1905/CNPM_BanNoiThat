<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    /**
     * Lấy thông tin tài khoản người dùng đang đăng nhập
     * GET /api/profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'status' => true,
            'message' => 'Lấy thông tin tài khoản thành công.',
            'data' => $this->formatUserProfile($user),
        ]);
    }

    /**
     * Cập nhật thông tin cá nhân (Họ tên, SĐT, Địa chỉ, Avatar)
     * PUT /api/profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'phone' => ['nullable', 'string', 'max:20', 'regex:/^[0-9+().\s-]{9,20}$/'],
            'address' => 'nullable|string|max:500',
            'avatar' => 'nullable|string|max:1000',
        ], [
            'name.required' => 'Họ và tên không được để trống.',
            'name.max' => 'Họ và tên không được vượt quá 100 ký tự.',
            'phone.regex' => 'Số điện thoại không đúng định dạng (9 - 20 số).',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'address.max' => 'Địa chỉ không được vượt quá 500 ký tự.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Thông tin cập nhật không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->name = trim($request->name);

        if ($request->has('phone')) {
            $user->phone = $request->filled('phone') ? trim($request->phone) : null;
        }

        if ($request->has('address')) {
            $user->address = $request->filled('address') ? trim($request->address) : null;
        }

        if ($request->has('avatar')) {
            $user->avatar = $request->filled('avatar') ? trim($request->avatar) : null;
        }

        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thông tin hồ sơ thành công!',
            'data' => $this->formatUserProfile($user),
        ]);
    }

    /**
     * Tải lên hoặc thay đổi ảnh đại diện (Avatar)
     * POST /api/profile/avatar
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120',
        ], [
            'avatar.required' => 'Vui lòng chọn tệp hình ảnh đại diện.',
            'avatar.image' => 'Tệp tải lên phải là hình ảnh hợp lệ.',
            'avatar.mimes' => 'Hình ảnh phải có định dạng: jpeg, png, jpg, webp, gif.',
            'avatar.max' => 'Dung lượng hình ảnh không được vượt quá 5MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Tệp hình ảnh đại diện không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('avatar');
            $extension = $file->getClientOriginalExtension() ?: 'jpg';
            $fileName = 'avatar_' . $user->id . '_' . time() . '_' . Str::random(6) . '.' . $extension;

            $destinationPath = public_path('uploads/avatars');
            if (!File::isDirectory($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true, true);
            }

            // Xóa file avatar cũ nếu đã từng tải lên local
            if ($user->avatar && str_starts_with($user->avatar, '/uploads/avatars/')) {
                $oldFilePath = public_path(ltrim($user->avatar, '/'));
                if (File::exists($oldFilePath)) {
                    File::delete($oldFilePath);
                }
            }

            $file->move($destinationPath, $fileName);

            $relativePath = '/uploads/avatars/' . $fileName;
            $user->avatar = $relativePath;
            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật ảnh đại diện thành công!',
                'data' => $this->formatUserProfile($user),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi trong quá trình tải lên hình ảnh: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa ảnh đại diện (khôi phục avatar mặc định)
     * DELETE /api/profile/avatar
     */
    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar && str_starts_with($user->avatar, '/uploads/avatars/')) {
            $oldFilePath = public_path(ltrim($user->avatar, '/'));
            if (File::exists($oldFilePath)) {
                File::delete($oldFilePath);
            }
        }

        $user->avatar = null;
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa ảnh đại diện thành công.',
            'data' => $this->formatUserProfile($user),
        ]);
    }

    /**
     * Đổi mật khẩu tài khoản
     * PUT /api/profile/change-password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();
        $hasExistingPassword = !empty($user->password);

        $rules = [
            'new_password' => 'required|string|min:6|confirmed',
        ];
        $messages = [
            'new_password.required' => 'Vui lòng nhập mật khẩu mới.',
            'new_password.min' => 'Mật khẩu mới phải có ít nhất 6 ký tự.',
            'new_password.confirmed' => 'Xác nhận mật khẩu mới không khớp.',
        ];

        // Nếu tài khoản đã có mật khẩu (không phải tài khoản Google chưa đặt pass)
        if ($hasExistingPassword) {
            $rules['current_password'] = 'required|string';
            $rules['new_password'] .= '|different:current_password';
            $messages['current_password.required'] = 'Vui lòng nhập mật khẩu hiện tại.';
            $messages['new_password.different'] = 'Mật khẩu mới phải khác với mật khẩu hiện tại.';
        }

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu đổi mật khẩu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Kiểm tra mật khẩu cũ
        if ($hasExistingPassword && !Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Mật khẩu hiện tại không chính xác.',
                'errors' => [
                    'current_password' => ['Mật khẩu hiện tại không chính xác.'],
                ],
            ], 422);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Đổi mật khẩu thành công!',
        ]);
    }

    /**
     * Chuẩn hóa dữ liệu hồ sơ người dùng trả về cho Frontend
     */
    private function formatUserProfile($user): array
    {
        $avatarPath = $user->avatar;
        $fullAvatarUrl = null;

        if ($avatarPath) {
            $fullAvatarUrl = str_starts_with($avatarPath, 'http') ? $avatarPath : url($avatarPath);
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'avatar' => $avatarPath,
            'avatar_url' => $fullAvatarUrl,
            'role' => $user->role ?? 'customer',
            'email_verified' => !empty($user->email_verified_at),
            'has_password' => !empty($user->password),
            'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $user->created_at ? $user->created_at->format('d/m/Y') : null,
        ];
    }
}
