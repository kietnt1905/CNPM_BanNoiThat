<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     * Kiểm tra người dùng đã đăng nhập và có vai trò quản trị viên (role === 'admin')
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // 1. Kiểm tra đăng nhập
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Vui lòng đăng nhập để truy cập tài nguyên này.',
            ], 401);
        }

        // 2. Kiểm tra tài khoản có bị khóa không
        if (isset($user->is_active) && !$user->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị hệ thống.',
            ], 403);
        }

        // 3. Kiểm tra vai trò Admin
        if (($user->role ?? '') !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Truy cập bị từ chối. Bạn không có quyền truy cập vào khu vực quản trị (Admin).',
            ], 403);
        }

        return $next($request);
    }
}
