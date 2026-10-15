<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Order;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Lấy danh sách người dùng kèm bộ lọc, tìm kiếm, tab đếm và phân trang
     */
    public function index(Request $request)
    {
        $query = User::query();

        // 1. Tìm kiếm (Tên, Email, SĐT)
        if ($search = trim($request->query('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // 2. Lọc theo Tab hoặc Bộ lọc vai trò / trạng thái
        $tab = $request->query('tab', 'total');
        if ($tab === 'admins') {
            $query->where('role', 'admin');
        } elseif ($tab === 'customers') {
            $query->where('role', 'customer');
        } elseif ($tab === 'active') {
            $query->where('is_active', true);
        } elseif ($tab === 'locked') {
            $query->where('is_active', false);
        }

        if ($role = $request->query('role')) {
            if (in_array($role, ['admin', 'customer'])) {
                $query->where('role', $role);
            }
        }

        if ($request->has('status') && $request->query('status') !== 'all') {
            $status = $request->query('status');
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'locked') {
                $query->where('is_active', false);
            }
        }

        // 3. Sắp xếp
        $sort = $request->query('sort', 'newest');
        if ($sort === 'oldest') {
            $query->orderBy('created_at', 'asc');
        } elseif ($sort === 'name_asc') {
            $query->orderBy('name', 'asc');
        } elseif ($sort === 'name_desc') {
            $query->orderBy('name', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        // 4. Counts theo từng tab
        $counts = [
            'total' => User::count(),
            'admins' => User::where('role', 'admin')->count(),
            'customers' => User::where('role', 'customer')->count(),
            'active' => User::where('is_active', true)->count(),
            'locked' => User::where('is_active', false)->count(),
        ];

        // 5. Phân trang
        $perPage = (int) $request->query('per_page', 10);
        if ($perPage <= 0 || $perPage > 100) $perPage = 10;

        $paginator = $query->paginate($perPage);

        // Chuẩn hóa dữ liệu kèm đơn hàng & chi tiêu
        $usersData = collect($paginator->items())->map(function ($u) {
            $orders = Order::where('user_id', $u->id)->get();
            $ordersCount = $orders->count();
            $totalSpent = (float) $orders->whereIn('status', ['confirmed', 'shipping', 'completed'])->sum('total_amount');

            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'phone' => $u->phone,
                'role' => $u->role ?: 'customer',
                'is_active' => (bool) $u->is_active,
                'avatar' => $u->avatar,
                'orders_count' => $ordersCount,
                'total_spent' => $totalSpent,
                'total_spent_display' => number_format($totalSpent, 0, ',', '.') . '₫',
                'created_at' => $u->created_at ? $u->created_at->toISOString() : null,
                'created_at_display' => $u->created_at ? $u->created_at->format('d/m/Y H:i') : '---',
            ];
        });

        return response()->json([
            'status' => true,
            'message' => 'Lấy danh sách người dùng thành công.',
            'data' => $usersData,
            'counts' => $counts,
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    /**
     * Lấy chi tiết người dùng và lịch sử 10 đơn hàng gần nhất
     */
    public function show($id)
    {
        $user = User::findOrFail($id);

        $orders = Order::where('user_id', $user->id)
            ->with(['items'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $allOrders = Order::where('user_id', $user->id)->get();
        $totalSpent = (float) $allOrders->whereIn('status', ['confirmed', 'shipping', 'completed'])->sum('total_amount');
        $completedCount = $allOrders->where('status', 'completed')->count();

        $recentOrders = $orders->map(function ($ord) {
            return [
                'id' => $ord->id,
                'order_code' => $ord->order_code,
                'status' => $ord->status,
                'total_amount' => (float) $ord->total_amount,
                'total_amount_display' => number_format($ord->total_amount, 0, ',', '.') . '₫',
                'items_count' => $ord->items->sum('quantity'),
                'created_at' => $ord->created_at ? $ord->created_at->toISOString() : null,
                'created_at_display' => $ord->created_at ? $ord->created_at->format('d/m/Y H:i') : '---',
            ];
        });

        return response()->json([
            'status' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role ?: 'customer',
                'is_active' => (bool) $user->is_active,
                'avatar' => $user->avatar,
                'orders_count' => $allOrders->count(),
                'completed_orders_count' => $completedCount,
                'total_spent' => $totalSpent,
                'total_spent_display' => number_format($totalSpent, 0, ',', '.') . '₫',
                'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
                'created_at_display' => $user->created_at ? $user->created_at->format('d/m/Y H:i') : '---',
                'recent_orders' => $recentOrders,
            ],
        ]);
    }

    /**
     * Tạo tài khoản mới từ trang Admin
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20',
            'role' => ['required', Rule::in(['admin', 'customer'])],
            'is_active' => 'boolean',
        ], [
            'name.required' => 'Họ và tên không được để trống.',
            'email.required' => 'Địa chỉ email không được để trống.',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
            'email.unique' => 'Email này đã tồn tại trong hệ thống.',
            'password.required' => 'Mật khẩu không được để trống.',
            'password.min' => 'Mật khẩu phải chứa ít nhất 6 ký tự.',
            'role.in' => 'Vai trò không hợp lệ.',
        ]);

        $user = User::create([
            'name' => trim($request->name),
            'email' => strtolower(trim($request->email)),
            'phone' => $request->phone ? trim($request->phone) : null,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Tạo tài khoản người dùng thành công.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
            ],
        ], 201);
    }

    /**
     * Cập nhật thông tin tài khoản
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentAdmin = Auth::user();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'role' => ['required', Rule::in(['admin', 'customer'])],
            'is_active' => 'boolean',
            'password' => 'nullable|string|min:6',
        ], [
            'name.required' => 'Họ và tên không được để trống.',
            'email.required' => 'Địa chỉ email không được để trống.',
            'email.unique' => 'Email này đã thuộc về người dùng khác.',
            'password.min' => 'Mật khẩu phải chứa ít nhất 6 ký tự.',
        ]);

        // Safeguard: Không thể hạ quyền hoặc khóa chính mình
        if ($currentAdmin && $currentAdmin->id === $user->id) {
            if ($request->role !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Bạn không thể tự hạ quyền Admin của chính mình.',
                ], 403);
            }
            if ($request->has('is_active') && !$request->boolean('is_active')) {
                return response()->json([
                    'status' => false,
                    'message' => 'Bạn không thể tự khóa tài khoản của chính mình.',
                ], 403);
            }
        }

        // Safeguard: Không thể hạ quyền nếu là Admin duy nhất
        if ($user->role === 'admin' && $request->role !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Hệ thống cần ít nhất 1 Quản trị viên, không thể chuyển vai trò tài khoản này.',
                ], 400);
            }
        }

        $user->name = trim($request->name);
        $user->email = strtolower(trim($request->email));
        $user->phone = $request->phone ? trim($request->phone) : null;
        $user->role = $request->role;
        $user->is_active = $request->boolean('is_active', true);

        if (!empty($request->password)) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật thông tin tài khoản thành công.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
            ],
        ]);
    }

    /**
     * Cập nhật nhanh vai trò (Role)
     */
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentAdmin = Auth::user();

        $request->validate([
            'role' => ['required', Rule::in(['admin', 'customer'])],
        ]);

        $newRole = $request->role;

        // Safeguard: Không thể tự đổi quyền của bản thân
        if ($currentAdmin && $currentAdmin->id === $user->id && $newRole !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể tự tước quyền Quản trị viên của chính mình.',
            ], 403);
        }

        // Safeguard: Không thể hạ quyền admin duy nhất
        if ($user->role === 'admin' && $newRole !== 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể hạ quyền Quản trị viên duy nhất trong hệ thống.',
                ], 400);
            }
        }

        $user->role = $newRole;
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Cập nhật vai trò người dùng thành công.',
            'data' => [
                'id' => $user->id,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Cập nhật nhanh trạng thái hoạt động (Khóa / Mở khóa)
     */
    public function updateStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $currentAdmin = Auth::user();

        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $newStatus = $request->boolean('is_active');

        // Safeguard: Không thể tự khóa tài khoản bản thân
        if ($currentAdmin && $currentAdmin->id === $user->id && !$newStatus) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể tự khóa tài khoản Quản trị đang đăng nhập.',
            ], 403);
        }

        // Safeguard: Không thể khóa admin duy nhất
        if ($user->role === 'admin' && !$newStatus) {
            $activeAdminCount = User::where('role', 'admin')->where('is_active', true)->count();
            if ($activeAdminCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không thể khóa Quản trị viên đang hoạt động duy nhất.',
                ], 400);
            }
        }

        $user->is_active = $newStatus;
        $user->save();

        return response()->json([
            'status' => true,
            'message' => $newStatus ? 'Đã mở khóa tài khoản thành công.' : 'Đã khóa tài khoản thành công.',
            'data' => [
                'id' => $user->id,
                'is_active' => (bool) $user->is_active,
            ],
        ]);
    }

    /**
     * Xóa tài khoản người dùng
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $currentAdmin = Auth::user();

        // Safeguard 1: Không thể xóa chính mình
        if ($currentAdmin && $currentAdmin->id === $user->id) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không thể xóa tài khoản Quản trị viên của chính mình.',
            ], 403);
        }

        // Safeguard 2: Không thể xóa admin duy nhất
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Hệ thống cần ít nhất 1 Quản trị viên, không thể xóa tài khoản này.',
                ], 400);
            }
        }

        // Safeguard 3: Không thể xóa nếu người dùng đã có đơn hàng
        $hasOrders = Order::where('user_id', $user->id)->exists();
        if ($hasOrders) {
            return response()->json([
                'status' => false,
                'message' => 'Không thể xóa tài khoản đã có lịch sử đơn hàng trong hệ thống. Quý khách có thể chọn Khóa tài khoản thay thế.',
            ], 400);
        }

        $user->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa tài khoản người dùng thành công.',
        ]);
    }
}
