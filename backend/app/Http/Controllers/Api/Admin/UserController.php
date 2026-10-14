<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Nhãn vai trò tiếng Việt
     */
    public const ROLE_LABELS = [
        'admin' => 'Quản trị viên',
        'user' => 'Khách hàng',
    ];

    /**
     * GET /api/admin/users
     * Lấy danh sách người dùng & phân quyền (có tìm kiếm, lọc vai trò, lọc trạng thái, sắp xếp, phân trang)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::query();

            // 1. Thống kê nhanh số lượng theo tab (để hiển thị badge ở header/tabs của frontend)
            $counts = [
                'total' => User::count(),
                'admins' => User::where('role', 'admin')->count(),
                'customers' => User::where('role', 'user')->count(),
                'active' => User::where('is_active', true)->count(),
                'locked' => User::where('is_active', false)->count(),
            ];

            // 2. Lọc theo vai trò (role)
            if ($request->filled('role') && $request->role !== 'all') {
                $query->where('role', $request->role);
            }

            // 3. Lọc theo trạng thái tài khoản (is_active)
            if ($request->filled('is_active') && $request->is_active !== 'all') {
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($isActive !== null) {
                    $query->where('is_active', $isActive);
                }
            }

            // 4. Tìm kiếm từ khóa (tên, email, số điện thoại)
            if ($request->filled('q') || $request->filled('search')) {
                $search = trim($request->input('q', $request->input('search')));
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            // 5. Đính kèm số lượng đơn hàng và tổng chi tiêu hoàn thành
            $query->withCount([
                'orders',
                'orders as completed_orders_count' => function ($q) {
                    $q->where('status', 'completed');
                },
            ]);

            $query->withSum([
                'orders as total_spent' => function ($q) {
                    $q->where('status', 'completed');
                },
            ], 'total_amount');

            // 6. Sắp xếp
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

            $allowedSorts = ['id', 'name', 'email', 'created_at', 'orders_count', 'total_spent'];
            if (in_array($sortBy, $allowedSorts, true)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // 7. Phân trang
            $perPage = max(1, min((int) $request->input('per_page', 15), 100));
            $users = $query->paginate($perPage);

            // 8. Định dạng dữ liệu trả về cho frontend
            $formattedUsers = $users->map(function ($u) {
                return $this->formatUserSummary($u);
            });

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách người dùng thành công.',
                'counts' => $counts,
                'data' => $formattedUsers,
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                    'from' => $users->firstItem(),
                    'to' => $users->lastItem(),
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải danh sách người dùng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/admin/users/{id}
     * Chi tiết người dùng kèm lịch sử đơn hàng và tổng quan chi tiêu
     */
    public function show(int $id): JsonResponse
    {
        try {
            $user = User::withCount([
                'orders',
                'orders as completed_orders_count' => fn($q) => $q->where('status', 'completed'),
                'orders as cancelled_orders_count' => fn($q) => $q->where('status', 'cancelled'),
                'orders as pending_orders_count' => fn($q) => $q->where('status', 'pending'),
            ])
            ->withSum([
                'orders as total_spent' => fn($q) => $q->where('status', 'completed'),
            ], 'total_amount')
            ->find($id);

            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy thông tin người dùng.',
                ], 404);
            }

            // Lấy 10 đơn hàng gần đây nhất của người dùng này
            $recentOrders = Order::with('payment')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($order) {
                    $total = (float) $order->total_amount;
                    return [
                        'id' => $order->id,
                        'order_code' => $order->order_code,
                        'status' => $order->status,
                        'status_label' => OrderController::STATUS_LABELS[$order->status] ?? $order->status,
                        'payment_method' => $order->payment?->method ?? 'cod',
                        'payment_status' => $order->payment?->status ?? 'pending',
                        'total_amount' => $total,
                        'total_amount_display' => number_format($total, 0, ',', '.') . '₫',
                        'created_at' => $order->created_at ? $order->created_at->format('Y-m-d H:i:s') : null,
                        'created_at_display' => $order->created_at ? $order->created_at->format('d/m/Y H:i') : null,
                    ];
                });

            $totalSpent = (float) ($user->total_spent ?? 0);

            return response()->json([
                'status' => true,
                'message' => 'Lấy chi tiết người dùng thành công.',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'avatar' => $user->avatar,
                    'role' => $user->role,
                    'role_label' => self::ROLE_LABELS[$user->role] ?? $user->role,
                    'is_active' => (bool) $user->is_active,
                    'status_label' => $user->is_active ? 'Đang hoạt động' : 'Đã bị khóa',
                    'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->format('d/m/Y H:i') : null,
                    'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
                    'created_at_display' => $user->created_at ? $user->created_at->format('d/m/Y H:i') : null,
                    'stats' => [
                        'orders_count' => (int) $user->orders_count,
                        'completed_orders_count' => (int) $user->completed_orders_count,
                        'cancelled_orders_count' => (int) $user->cancelled_orders_count,
                        'pending_orders_count' => (int) $user->pending_orders_count,
                        'total_spent' => $totalSpent,
                        'total_spent_display' => number_format($totalSpent, 0, ',', '.') . '₫',
                    ],
                    'recent_orders' => $recentOrders,
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải thông tin người dùng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/admin/users
     * Tạo tài khoản mới (khách hàng hoặc quản trị viên)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:admin,user',
            'is_active' => 'nullable|boolean',
        ], [
            'name.required' => 'Họ và tên không được để trống.',
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng trong hệ thống.',
            'password.required' => 'Mật khẩu không được để trống.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'role.required' => 'Vui lòng chọn vai trò người dùng.',
            'role.in' => 'Vai trò không hợp lệ (Chỉ chấp nhận admin hoặc user).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = User::create([
                'name' => trim($request->name),
                'email' => strtolower(trim($request->email)),
                'password' => Hash::make($request->password),
                'phone' => $request->filled('phone') ? trim($request->phone) : null,
                'role' => $request->role,
                'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
                'email_verified_at' => Carbon::now(),
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Tạo tài khoản ' . (self::ROLE_LABELS[$user->role] ?? $user->role) . ' thành công.',
                'data' => $this->formatUserSummary($user),
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tạo tài khoản: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/admin/users/{id}
     * Cập nhật thông tin người dùng
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy người dùng cần cập nhật.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:admin,user',
            'is_active' => 'required|boolean',
        ], [
            'name.required' => 'Họ và tên không được để trống.',
            'email.required' => 'Email không được để trống.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng bởi người dùng khác.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'role.required' => 'Vui lòng chọn vai trò.',
            'role.in' => 'Vai trò không hợp lệ (Chỉ chấp nhận admin hoặc user).',
            'is_active.required' => 'Vui lòng xác định trạng thái kích hoạt tài khoản.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $currentUser = $request->user();

        // RÀNG BUỘC BẢO VỆ: Quản trị viên không thể tự hạ quyền của chính mình
        if ($currentUser && $currentUser->id === $user->id && $request->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể tự hạ quyền Quản trị viên của chính tài khoản mình đang đăng nhập.',
            ], 400);
        }

        // RÀNG BUỘC BẢO VỆ: Quản trị viên không thể tự khóa tài khoản của chính mình
        if ($currentUser && $currentUser->id === $user->id && !$request->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể tự khóa tài khoản của chính mình.',
            ], 400);
        }

        // RÀNG BUỘC BẢO VỆ: Không thể hạ quyền hoặc khóa Admin duy nhất còn lại
        if ($user->role === 'admin' && ($request->role === 'user' || !$request->is_active)) {
            $activeAdminsCount = User::where('role', 'admin')->where('is_active', true)->count();
            if ($activeAdminsCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Hệ thống phải có ít nhất một Quản trị viên đang hoạt động.',
                ], 400);
            }
        }

        try {
            $user->name = trim($request->name);
            $user->email = strtolower(trim($request->email));
            $user->phone = $request->filled('phone') ? trim($request->phone) : null;
            $user->role = $request->role;
            $user->is_active = (bool) $request->is_active;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật thông tin người dùng thành công.',
                'data' => $this->formatUserSummary($user),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật tài khoản: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/users/{id}/role
     * Thay đổi vai trò người dùng (Thăng quyền Admin hoặc Chuyển thành Khách hàng)
     */
    public function updateRole(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'role' => 'required|string|in:admin,user',
        ], [
            'role.required' => 'Vui lòng cung cấp vai trò cần thay đổi.',
            'role.in' => 'Vai trò không hợp lệ (Chỉ chấp nhận admin hoặc user).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy người dùng.',
            ], 404);
        }

        $currentUser = $request->user();

        // 1. Không thể tự hạ quyền Admin của bản thân
        if ($currentUser && $currentUser->id === $user->id && $request->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể tự hạ quyền Quản trị viên của chính mình.',
            ], 400);
        }

        // 2. Không thể hạ quyền Admin duy nhất còn lại
        if ($user->role === 'admin' && $request->role === 'user') {
            $activeAdminsCount = User::where('role', 'admin')->where('is_active', true)->count();
            if ($activeAdminsCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Hệ thống phải có ít nhất một Quản trị viên đang hoạt động.',
                ], 400);
            }
        }

        $user->role = $request->role;
        $user->save();

        $roleLabel = self::ROLE_LABELS[$user->role] ?? $user->role;

        return response()->json([
            'status' => true,
            'message' => "Đã chuyển vai trò người dùng sang '{$roleLabel}' thành công.",
            'data' => $this->formatUserSummary($user),
        ]);
    }

    /**
     * PATCH /api/admin/users/{id}/status
     * Khóa hoặc Mở khóa tài khoản người dùng
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ], [
            'is_active.required' => 'Vui lòng cung cấp trạng thái kích hoạt (true hoặc false).',
            'is_active.boolean' => 'Trạng thái kích hoạt phải là kiểu boolean.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy người dùng.',
            ], 404);
        }

        $currentUser = $request->user();

        // 1. Không thể tự khóa tài khoản của chính mình
        if ($currentUser && $currentUser->id === $user->id && !$request->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể tự khóa tài khoản của chính mình.',
            ], 400);
        }

        // 2. Không thể khóa Admin duy nhất còn lại
        if ($user->role === 'admin' && !$request->is_active) {
            $activeAdminsCount = User::where('role', 'admin')->where('is_active', true)->count();
            if ($activeAdminsCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Hệ thống phải có ít nhất một Quản trị viên đang hoạt động.',
                ], 400);
            }
        }

        $user->is_active = (bool) $request->is_active;
        $user->save();

        $statusText = $user->is_active ? 'Mở khóa hoạt động' : 'Khóa tài khoản';

        return response()->json([
            'status' => true,
            'message' => "Đã {$statusText} thành công.",
            'data' => $this->formatUserSummary($user),
        ]);
    }

    /**
     * DELETE /api/admin/users/{id}
     * Xóa tài khoản người dùng (có kiểm tra ràng buộc toàn vẹn dữ liệu)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy người dùng để xóa.',
            ], 404);
        }

        $currentUser = $request->user();

        // 1. Không thể tự xóa tài khoản của chính mình
        if ($currentUser && $currentUser->id === $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể tự xóa tài khoản của chính mình.',
            ], 400);
        }

        // 2. Không thể xóa Admin duy nhất
        if ($user->role === 'admin') {
            $activeAdminsCount = User::where('role', 'admin')->where('is_active', true)->count();
            if ($activeAdminsCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể xóa Quản trị viên duy nhất còn lại trong hệ thống.',
                ], 400);
            }
        }

        // 3. RÀNG BUỘC TOÀN VẸN: Nếu người dùng đã có đơn hàng, không cho xóa cứng
        if ($user->orders()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'Người dùng này đã có lịch sử đơn hàng trong hệ thống. Vui lòng sử dụng tính năng "Khóa tài khoản" thay vì xóa để bảo toàn dữ liệu tài chính & lịch sử hóa đơn.',
            ], 400);
        }

        try {
            $user->tokens()->delete();
            $user->delete();

            return response()->json([
                'status' => true,
                'message' => 'Xóa tài khoản người dùng thành công.',
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa người dùng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Định dạng dữ liệu tóm tắt người dùng
     */
    private function formatUserSummary(User $user): array
    {
        $totalSpent = (float) ($user->total_spent ?? 0);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'role' => $user->role,
            'role_label' => self::ROLE_LABELS[$user->role] ?? $user->role,
            'is_active' => (bool) $user->is_active,
            'status_label' => $user->is_active ? 'Đang hoạt động' : 'Đã bị khóa',
            'orders_count' => (int) ($user->orders_count ?? 0),
            'completed_orders_count' => (int) ($user->completed_orders_count ?? 0),
            'total_spent' => $totalSpent,
            'total_spent_display' => number_format($totalSpent, 0, ',', '.') . '₫',
            'email_verified_at' => $user->email_verified_at ? $user->email_verified_at->format('d/m/Y H:i') : null,
            'created_at' => $user->created_at ? $user->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $user->created_at ? $user->created_at->format('d/m/Y H:i') : null,
        ];
    }
}
