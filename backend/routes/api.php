<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;

// Public routes - Auth
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

// Public routes - Catalog
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{idOrSlug}', [CategoryController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/featured', [ProductController::class, 'featured']);
Route::get('/products/{idOrSlug}/related', [ProductController::class, 'related']);
Route::get('/products/{idOrSlug}', [ProductController::class, 'show']);

// Public routes - Cart Preview (Dành cho khách chưa đăng nhập tính toán giỏ hàng)
Route::post('/cart/guest-preview', [CartController::class, 'guestPreview']);

// Protected routes (yêu cầu gửi kèm Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart routes (Người dùng đã đăng nhập)
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/add', [CartController::class, 'addItem']);
        Route::put('/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/items/{id}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clearCart']);
        Route::post('/sync', [CartController::class, 'syncCart']);
    });
    // Order routes (Đơn hàng)
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::patch('/{id}/cancel', [OrderController::class, 'cancel']);
    });
});

Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// =========================================================================
// ADMIN ROUTES (Yêu cầu đăng nhập token + vai trò Admin: auth:sanctum & admin)
// =========================================================================
use App\Http\Controllers\Api\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Thống kê tổng quan Dashboard
    Route::get('/dashboard/overview', [AdminDashboardController::class, 'overview']);

    // Quản lý người dùng & Phân quyền (Admin Users & Roles Management)
    Route::prefix('users')->group(function () {
        Route::get('/', [AdminUserController::class, 'index']);
        Route::get('/{id}', [AdminUserController::class, 'show']);
        Route::post('/', [AdminUserController::class, 'store']);
        Route::put('/{id}', [AdminUserController::class, 'update']);
        Route::patch('/{id}/role', [AdminUserController::class, 'updateRole']);
        Route::patch('/{id}/status', [AdminUserController::class, 'updateStatus']);
        Route::delete('/{id}', [AdminUserController::class, 'destroy']);
    });

    // Quản lý đơn hàng (Admin Orders Management)
    Route::prefix('orders')->group(function () {
        Route::get('/statistics', [AdminOrderController::class, 'statistics']);
        Route::get('/', [AdminOrderController::class, 'index']);
        Route::get('/{id}', [AdminOrderController::class, 'show']);
        Route::patch('/{id}/status', [AdminOrderController::class, 'updateStatus']);
        Route::patch('/{id}/payment-status', [AdminOrderController::class, 'updatePaymentStatus']);
    });
});


