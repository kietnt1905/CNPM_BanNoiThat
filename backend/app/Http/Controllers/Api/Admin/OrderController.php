<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class OrderController extends Controller
{
    /**
     * Danh sách nhãn tiếng Việt cho trạng thái đơn hàng
     */
    public const STATUS_LABELS = [
        'pending' => 'Chờ xác nhận',
        'confirmed' => 'Đã xác nhận',
        'shipping' => 'Đang giao hàng',
        'completed' => 'Đã hoàn thành',
        'cancelled' => 'Đã hủy',
    ];

    /**
     * Danh sách nhãn tiếng Việt cho phương thức thanh toán
     */
    public const PAYMENT_METHOD_LABELS = [
        'cod' => 'Thanh toán khi nhận hàng (COD)',
        'bank_transfer' => 'Chuyển khoản ngân hàng',
        'vnpay' => 'Ví điện tử VNPAY',
        'momo' => 'Ví MoMo',
    ];

    /**
     * Danh sách nhãn tiếng Việt cho trạng thái thanh toán
     */
    public const PAYMENT_STATUS_LABELS = [
        'pending' => 'Chờ thanh toán',
        'success' => 'Đã thanh toán',
        'failed' => 'Thanh toán thất bại',
        'refunded' => 'Đã hoàn tiền',
    ];

    /**
     * GET /api/admin/orders
     * Lấy danh sách toàn bộ đơn hàng (có phân trang, bộ lọc, tìm kiếm, thống kê)
     */
    public function index(Request $request)
    {
        try {
            $query = Order::with(['user', 'items.variant.product.images', 'payment']);

            // 1. Lọc theo trạng thái đơn hàng (status)
            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // 2. Lọc theo trạng thái thanh toán (payment_status)
            if ($request->filled('payment_status') && $request->payment_status !== 'all') {
                $paymentStatus = $request->payment_status;
                $query->whereHas('payment', function ($q) use ($paymentStatus) {
                    $q->where('status', $paymentStatus);
                });
            }

            // 3. Lọc theo phương thức thanh toán (payment_method)
            if ($request->filled('payment_method') && $request->payment_method !== 'all') {
                $paymentMethod = $request->payment_method;
                $query->whereHas('payment', function ($q) use ($paymentMethod) {
                    $q->where('method', $paymentMethod);
                });
            }

            // 4. Tìm kiếm từ khóa (Mã đơn hàng, tên người nhận, số điện thoại, địa chỉ)
            if ($request->filled('search')) {
                $search = trim($request->search);
                $query->where(function ($q) use ($search) {
                    $q->where('order_code', 'like', "%{$search}%")
                      ->orWhere('recipient_name', 'like', "%{$search}%")
                      ->orWhere('recipient_phone', 'like', "%{$search}%")
                      ->orWhere('shipping_address', 'like', "%{$search}%");
                });
            }

            // 5. Lọc theo khoảng ngày tạo đơn (date_from, date_to)
            if ($request->filled('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->filled('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // 6. Sắp xếp đơn hàng (Mặc định: mới nhất)
            $sort = $request->query('sort', 'newest');
            switch ($sort) {
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'total_asc':
                    $query->orderBy('total_amount', 'asc');
                    break;
                case 'total_desc':
                    $query->orderBy('total_amount', 'desc');
                    break;
                case 'newest':
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            // 7. Phân trang
            $perPage = max(1, min((int) $request->query('per_page', 15), 100));
            $paginator = $query->paginate($perPage);

            // 8. Tính toán số liệu thống kê nhanh cho Header / Tabs của Admin
            $statistics = [
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'confirmed_orders' => Order::where('status', 'confirmed')->count(),
                'shipping_orders' => Order::where('status', 'shipping')->count(),
                'completed_orders' => Order::where('status', 'completed')->count(),
                'cancelled_orders' => Order::where('status', 'cancelled')->count(),
                'total_revenue' => (float) Order::where('status', 'completed')->sum('total_amount'),
                'total_revenue_display' => number_format((float) Order::where('status', 'completed')->sum('total_amount'), 0, ',', '.') . '₫',
            ];

            // 9. Chuẩn hóa dữ liệu trả về
            $formattedOrders = collect($paginator->items())->map(function ($order) {
                return $this->formatOrderSummary($order);
            });

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách đơn hàng thành công.',
                'data' => $formattedOrders,
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
                'statistics' => $statistics,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải danh sách đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/admin/orders/{id}
     * Lấy thông tin chi tiết một đơn hàng theo ID hoặc Order Code
     */
    public function show(string|int $id)
    {
        try {
            $order = Order::with(['user', 'items.variant.product.images', 'payment'])
                ->where(function ($q) use ($id) {
                    $q->where('id', $id)
                      ->orWhere('order_code', $id);
                })
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => false,
                    'message' => 'Đơn hàng không tồn tại trong hệ thống.',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'message' => 'Lấy chi tiết đơn hàng thành công.',
                'data' => $this->formatOrderDetail($order),
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy chi tiết đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/orders/{id}/status
     * Cập nhật trạng thái đơn hàng (pending -> confirmed -> shipping -> completed -> cancelled)
     * Kèm xử lý tự động tồn kho khi hủy đơn hoặc phục hồi đơn
     */
    public function updateStatus(Request $request, string|int $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pending,confirmed,shipping,completed,cancelled',
            'admin_note' => 'nullable|string|max:500',
        ], [
            'status.required' => 'Vui lòng cung cấp trạng thái đơn hàng mới.',
            'status.in' => 'Trạng thái đơn hàng không hợp lệ (Chỉ chấp nhận: pending, confirmed, shipping, completed, cancelled).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::with(['items.variant', 'payment'])
            ->where(function ($q) use ($id) {
                $q->where('id', $id)
                  ->orWhere('order_code', $id);
            })
            ->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Đơn hàng không tồn tại.',
            ], 404);
        }

        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Nếu trạng thái không thay đổi
        if ($oldStatus === $newStatus) {
            return response()->json([
                'status' => true,
                'message' => 'Đơn hàng đã ở trạng thái này từ trước.',
                'data' => $this->formatOrderDetail($order),
            ]);
        }

        DB::beginTransaction();

        try {
            // ==========================================
            // LOGIC QUẢN LÝ KHO KHI THAY ĐỔI TRẠNG THÁI
            // ==========================================

            // 1. Chuyển sang CANCELLED (Hủy đơn): Hoàn lại số lượng tồn kho
            if ($oldStatus !== 'cancelled' && $newStatus === 'cancelled') {
                foreach ($order->items as $item) {
                    $variant = ProductVariant::lockForUpdate()->find($item->variant_id);
                    if ($variant) {
                        $variant->increment('stock_quantity', $item->quantity);
                    }
                }

                // Cập nhật payment nếu đang pending
                if ($order->payment && $order->payment->status === 'pending') {
                    $order->payment->status = 'failed';
                    $order->payment->save();
                }
            }

            // 2. Chuyển từ CANCELLED sang các trạng thái khác (Phục hồi đơn): Trừ lại tồn kho
            if ($oldStatus === 'cancelled' && $newStatus !== 'cancelled') {
                // Kiểm tra đủ tồn kho trước khi trừ
                foreach ($order->items as $item) {
                    $variant = ProductVariant::lockForUpdate()->find($item->variant_id);
                    if (!$variant || $variant->stock_quantity < $item->quantity) {
                        DB::rollBack();
                        $varName = $item->product_name . ' (' . ($item->color ?: '') . ')';
                        return response()->json([
                            'status' => false,
                            'message' => "Không thể phục hồi đơn hàng vì sản phẩm '{$varName}' hiện không còn đủ số lượng tồn kho.",
                        ], 400);
                    }
                }

                // Trừ kho
                foreach ($order->items as $item) {
                    $variant = ProductVariant::find($item->variant_id);
                    if ($variant) {
                        $variant->decrement('stock_quantity', $item->quantity);
                    }
                }
            }

            // 3. Chuyển sang COMPLETED (Đã hoàn thành): Nếu thanh toán COD đang pending thì tự động xác nhận đã thu tiền
            if ($newStatus === 'completed') {
                if ($order->payment && $order->payment->method === 'cod' && $order->payment->status === 'pending') {
                    $order->payment->status = 'success';
                    $order->payment->paid_at = now();
                    $order->payment->save();
                }
            }

            // 4. Cập nhật trạng thái và ghi chú
            $order->status = $newStatus;
            if ($request->filled('admin_note')) {
                $currentNote = $order->note ? $order->note . " | " : "";
                $order->note = $currentNote . "[Admin: " . trim($request->admin_note) . "]";
            }
            $order->save();

            DB::commit();

            $order->refresh();
            $order->load(['user', 'items.variant.product.images', 'payment']);

            $newLabel = self::STATUS_LABELS[$newStatus] ?? $newStatus;

            return response()->json([
                'status' => true,
                'message' => "Cập nhật trạng thái đơn hàng sang '{$newLabel}' thành công.",
                'data' => $this->formatOrderDetail($order),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/orders/{id}/payment-status
     * Cập nhật trạng thái thanh toán đơn hàng (pending, success, failed, refunded)
     */
    public function updatePaymentStatus(Request $request, string|int $id)
    {
        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|string|in:pending,success,failed,refunded',
            'transaction_code' => 'nullable|string|max:100',
        ], [
            'payment_status.required' => 'Vui lòng cung cấp trạng thái thanh toán mới.',
            'payment_status.in' => 'Trạng thái thanh toán không hợp lệ (Chỉ chấp nhận: pending, success, failed, refunded).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $order = Order::with('payment')
            ->where(function ($q) use ($id) {
                $q->where('id', $id)
                  ->orWhere('order_code', $id);
            })
            ->first();

        if (!$order) {
            return response()->json([
                'status' => false,
                'message' => 'Đơn hàng không tồn tại.',
            ], 404);
        }

        $payment = $order->payment;

        if (!$payment) {
            // Nếu đơn hàng chưa có bản ghi payment, tạo mới
            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => 'cod',
                'status' => $request->payment_status,
                'amount' => $order->total_amount,
                'transaction_code' => $request->transaction_code,
                'paid_at' => $request->payment_status === 'success' ? now() : null,
            ]);
        } else {
            $payment->status = $request->payment_status;
            if ($request->filled('transaction_code')) {
                $payment->transaction_code = trim($request->transaction_code);
            }
            if ($request->payment_status === 'success' && !$payment->paid_at) {
                $payment->paid_at = now();
            }
            $payment->save();
        }

        $order->refresh();
        $order->load(['user', 'items.variant.product.images', 'payment']);

        $statusLabel = self::PAYMENT_STATUS_LABELS[$request->payment_status] ?? $request->payment_status;

        return response()->json([
            'status' => true,
            'message' => "Cập nhật trạng thái thanh toán sang '{$statusLabel}' thành công.",
            'data' => $this->formatOrderDetail($order),
        ]);
    }

    /**
     * GET /api/admin/orders/statistics
     * Báo cáo thống kê chuyên sâu về doanh thu và đơn hàng
     */
    public function statistics(Request $request)
    {
        try {
            $now = Carbon::now();
            $today = Carbon::today();
            $thisMonth = Carbon::now()->startOfMonth();

            // 1. Thống kê tổng quan
            $totalOrders = Order::count();
            $pendingOrders = Order::where('status', 'pending')->count();
            $confirmedOrders = Order::where('status', 'confirmed')->count();
            $shippingOrders = Order::where('status', 'shipping')->count();
            $completedOrders = Order::where('status', 'completed')->count();
            $cancelledOrders = Order::where('status', 'cancelled')->count();

            // Doanh thu
            $totalRevenue = (float) Order::where('status', 'completed')->sum('total_amount');
            $todayRevenue = (float) Order::where('status', 'completed')->whereDate('created_at', $today)->sum('total_amount');
            $thisMonthRevenue = (float) Order::where('status', 'completed')->where('created_at', '>=', $thisMonth)->sum('total_amount');

            // 2. Doanh thu 7 ngày gần nhất (để vẽ biểu đồ)
            $last7Days = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $dateStr = $date->format('Y-m-d');
                $displayDate = $date->format('d/m');
                $dayRevenue = (float) Order::where('status', 'completed')
                    ->whereDate('created_at', $dateStr)
                    ->sum('total_amount');
                $dayOrderCount = Order::whereDate('created_at', $dateStr)->count();

                $last7Days[] = [
                    'date' => $dateStr,
                    'display_date' => $displayDate,
                    'revenue' => $dayRevenue,
                    'order_count' => $dayOrderCount,
                ];
            }

            // 3. Top 5 sản phẩm bán chạy nhất
            $topSellingItems = OrderItem::select(
                    'product_name',
                    DB::raw('SUM(quantity) as total_sold'),
                    DB::raw('SUM(line_total) as total_revenue')
                )
                ->whereHas('order', function ($q) {
                    $q->where('status', 'completed');
                })
                ->groupBy('product_name')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy dữ liệu thống kê thành công.',
                'data' => [
                    'overview' => [
                        'total_orders' => $totalOrders,
                        'pending_orders' => $pendingOrders,
                        'confirmed_orders' => $confirmedOrders,
                        'shipping_orders' => $shippingOrders,
                        'completed_orders' => $completedOrders,
                        'cancelled_orders' => $cancelledOrders,
                        'total_revenue' => $totalRevenue,
                        'total_revenue_display' => number_format($totalRevenue, 0, ',', '.') . '₫',
                        'today_revenue' => $todayRevenue,
                        'today_revenue_display' => number_format($todayRevenue, 0, ',', '.') . '₫',
                        'this_month_revenue' => $thisMonthRevenue,
                        'this_month_revenue_display' => number_format($thisMonthRevenue, 0, ',', '.') . '₫',
                    ],
                    'revenue_chart_7_days' => $last7Days,
                    'top_selling_products' => $topSellingItems,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi thống kê dữ liệu: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Định dạng tóm tắt đơn hàng (dùng cho danh sách bảng đơn hàng)
     */
    private function formatOrderSummary(Order $order): array
    {
        $statusKey = $order->status;
        $payment = $order->payment;

        return [
            'id' => $order->id,
            'order_code' => $order->order_code,
            'recipient_name' => $order->recipient_name,
            'recipient_phone' => $order->recipient_phone,
            'shipping_address' => $order->shipping_address,
            'status' => $statusKey,
            'status_label' => self::STATUS_LABELS[$statusKey] ?? $statusKey,
            'total_amount' => (float) $order->total_amount,
            'total_amount_display' => number_format((float) $order->total_amount, 0, ',', '.') . '₫',
            'total_items' => $order->items->sum('quantity'),
            'payment_method' => $payment?->method ?? 'cod',
            'payment_method_label' => self::PAYMENT_METHOD_LABELS[$payment?->method ?? 'cod'] ?? strtoupper($payment?->method ?? 'cod'),
            'payment_status' => $payment?->status ?? 'pending',
            'payment_status_label' => self::PAYMENT_STATUS_LABELS[$payment?->status ?? 'pending'] ?? ($payment?->status ?? 'pending'),
            'created_at' => $order->created_at ? $order->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $order->created_at ? $order->created_at->format('d/m/Y H:i') : null,
        ];
    }

    /**
     * Định dạng chi tiết đơn hàng (dùng cho trang xem chi tiết và sau khi cập nhật)
     */
    private function formatOrderDetail(Order $order): array
    {
        $statusKey = $order->status;
        $payment = $order->payment;

        $formattedItems = [];
        foreach ($order->items as $item) {
            $unitPrice = (float) $item->unit_price;
            $lineTotal = (float) ($item->line_total ?? ($unitPrice * $item->quantity));
            $imageUrl = $item->variant?->product?->images->first()?->image_url ?? '/images/placeholder.jpg';

            $formattedItems[] = [
                'id' => $item->id,
                'variant_id' => $item->variant_id,
                'product_name' => $item->product_name,
                'sku' => $item->sku,
                'color' => $item->color,
                'material' => $item->material,
                'dimensions' => $item->dimensions_snapshot,
                'quantity' => $item->quantity,
                'unit_price' => $unitPrice,
                'unit_price_display' => number_format($unitPrice, 0, ',', '.') . '₫',
                'line_total' => $lineTotal,
                'line_total_display' => number_format($lineTotal, 0, ',', '.') . '₫',
                'image' => $imageUrl,
                'current_stock' => $item->variant?->stock_quantity ?? 0,
            ];
        }

        $subtotal = (float) $order->subtotal;
        $shippingFee = (float) $order->shipping_fee;
        $discountAmount = (float) $order->discount_amount;
        $totalAmount = (float) ($order->total_amount ?? (($subtotal + $shippingFee) - $discountAmount));

        return [
            'id' => $order->id,
            'order_code' => $order->order_code,
            'user' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone,
                'role' => $order->user->role,
            ] : null,
            'recipient_name' => $order->recipient_name,
            'recipient_phone' => $order->recipient_phone,
            'shipping_address' => $order->shipping_address,
            'note' => $order->note,
            'status' => $statusKey,
            'status_label' => self::STATUS_LABELS[$statusKey] ?? $statusKey,
            'subtotal' => $subtotal,
            'subtotal_display' => number_format($subtotal, 0, ',', '.') . '₫',
            'shipping_fee' => $shippingFee,
            'shipping_fee_display' => number_format($shippingFee, 0, ',', '.') . '₫',
            'discount_amount' => $discountAmount,
            'discount_amount_display' => number_format($discountAmount, 0, ',', '.') . '₫',
            'total_amount' => $totalAmount,
            'total_amount_display' => number_format($totalAmount, 0, ',', '.') . '₫',
            'total_items' => $order->items->sum('quantity'),
            'items' => $formattedItems,
            'payment' => $payment ? [
                'id' => $payment->id,
                'method' => $payment->method,
                'method_label' => self::PAYMENT_METHOD_LABELS[$payment->method] ?? strtoupper($payment->method),
                'status' => $payment->status,
                'status_label' => self::PAYMENT_STATUS_LABELS[$payment->status] ?? $payment->status,
                'amount' => (float) $payment->amount,
                'amount_display' => number_format((float) $payment->amount, 0, ',', '.') . '₫',
                'transaction_code' => $payment->transaction_code,
                'paid_at' => $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i:s') : null,
            ] : null,
            'created_at' => $order->created_at ? $order->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $order->created_at ? $order->created_at->format('d/m/Y H:i') : null,
            'updated_at' => $order->updated_at ? $order->updated_at->format('Y-m-d H:i:s') : null,
            'updated_at_display' => $order->updated_at ? $order->updated_at->format('d/m/Y H:i') : null,
        ];
    }
}
