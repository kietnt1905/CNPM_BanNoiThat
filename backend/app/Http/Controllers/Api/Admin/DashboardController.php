<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Nhãn tiếng Việt và mã màu cho trạng thái đơn hàng (phục vụ biểu đồ frontend)
     */
    public const STATUS_CONFIG = [
        'pending' => [
            'label' => 'Chờ xác nhận',
            'color' => '#F59E0B', // Amber
            'badge' => 'warning',
        ],
        'confirmed' => [
            'label' => 'Đã xác nhận',
            'color' => '#3B82F6', // Blue
            'badge' => 'info',
        ],
        'shipping' => [
            'label' => 'Đang giao hàng',
            'color' => '#8B5CF6', // Purple
            'badge' => 'primary',
        ],
        'completed' => [
            'label' => 'Đã hoàn thành',
            'color' => '#10B981', // Emerald green
            'badge' => 'success',
        ],
        'cancelled' => [
            'label' => 'Đã hủy',
            'color' => '#EF4444', // Red
            'badge' => 'danger',
        ],
    ];

    /**
     * Nhãn tiếng Việt cho phương thức thanh toán
     */
    public const PAYMENT_METHOD_LABELS = [
        'cod' => 'Thanh toán khi nhận hàng (COD)',
        'bank_transfer' => 'Chuyển khoản ngân hàng',
        'vnpay' => 'Ví điện tử VNPAY',
        'momo' => 'Ví MoMo',
    ];

    /**
     * GET /api/admin/dashboard/overview
     * API Trung tâm thống kê tổng quan toàn bộ hệ thống cho Admin Dashboard
     */
    public function overview(Request $request): JsonResponse
    {
        try {
            $period = $request->query('period', '7_days'); // 7_days, 30_days, 12_months
            $now = Carbon::now();
            $today = Carbon::today();
            $yesterday = Carbon::yesterday();
            $startOfWeek = Carbon::now()->startOfWeek();
            $startOfMonth = Carbon::now()->startOfMonth();
            $startOfLastMonth = Carbon::now()->subMonth()->startOfMonth();
            $endOfLastMonth = Carbon::now()->subMonth()->endOfMonth();
            $startOfYear = Carbon::now()->startOfYear();

            // =========================================================================
            // 1. THỐNG KÊ DOANH THU (CHỈ TÍNH TỪ ĐƠN HÀNG COMPLETED)
            // =========================================================================
            $completedOrdersQuery = Order::where('status', 'completed');

            $allTimeRevenue = (float) (clone $completedOrdersQuery)->sum('total_amount');
            $todayRevenue = (float) (clone $completedOrdersQuery)->whereDate('created_at', $today)->sum('total_amount');
            $yesterdayRevenue = (float) (clone $completedOrdersQuery)->whereDate('created_at', $yesterday)->sum('total_amount');
            $thisWeekRevenue = (float) (clone $completedOrdersQuery)->where('created_at', '>=', $startOfWeek)->sum('total_amount');
            $thisMonthRevenue = (float) (clone $completedOrdersQuery)->where('created_at', '>=', $startOfMonth)->sum('total_amount');
            $lastMonthRevenue = (float) (clone $completedOrdersQuery)->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->sum('total_amount');
            $thisYearRevenue = (float) (clone $completedOrdersQuery)->where('created_at', '>=', $startOfYear)->sum('total_amount');

            // Tỷ lệ tăng trưởng doanh thu so với ngày hôm qua
            $revenueGrowthDayPercent = $this->calculateGrowthRate($todayRevenue, $yesterdayRevenue);

            // Tỷ lệ tăng trưởng doanh thu so với tháng trước
            $revenueGrowthMonthPercent = $this->calculateGrowthRate($thisMonthRevenue, $lastMonthRevenue);

            // =========================================================================
            // 2. THỐNG KÊ ĐƠN HÀNG
            // =========================================================================
            $totalOrders = Order::count();
            $todayOrders = Order::whereDate('created_at', $today)->count();
            $thisMonthOrders = Order::where('created_at', '>=', $startOfMonth)->count();

            // Đếm theo từng trạng thái
            $statusCountsRaw = Order::select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $statusCounts = [
                'pending' => $statusCountsRaw['pending'] ?? 0,
                'confirmed' => $statusCountsRaw['confirmed'] ?? 0,
                'shipping' => $statusCountsRaw['shipping'] ?? 0,
                'completed' => $statusCountsRaw['completed'] ?? 0,
                'cancelled' => $statusCountsRaw['cancelled'] ?? 0,
            ];

            // Tỷ lệ hoàn thành đơn (%)
            $finishedOrders = $statusCounts['completed'] + $statusCounts['cancelled'];
            $completionRatePercent = $finishedOrders > 0
                ? round(($statusCounts['completed'] / $finishedOrders) * 100, 1)
                : 0.0;

            // =========================================================================
            // 3. THỐNG KÊ KHÁCH HÀNG / TÀI KHOẢN
            // =========================================================================
            $totalCustomers = User::where('role', 'user')->count();
            $totalAdmins = User::where('role', 'admin')->count();
            $newCustomersThisMonth = User::where('role', 'user')->where('created_at', '>=', $startOfMonth)->count();
            $customersWithOrders = Order::whereNotNull('user_id')->distinct('user_id')->count('user_id');

            // =========================================================================
            // 4. THỐNG KÊ SẢN PHẨM & TỒN KHO
            // =========================================================================
            $totalProducts = Product::count();
            $activeProducts = Product::where('is_active', true)->count();
            $totalVariants = ProductVariant::count();
            $outOfStockCount = ProductVariant::where('stock_quantity', '<=', 0)->count();
            $lowStockCount = ProductVariant::where('stock_quantity', '>', 0)->where('stock_quantity', '<=', 5)->count();

            // =========================================================================
            // 5. DỮ LIỆU BIỂU ĐỒ DOANH THU & ĐƠN HÀNG (REVENUE TREND)
            // =========================================================================
            $revenueTrend = $this->buildRevenueTrend($period);

            // =========================================================================
            // 6. DỮ LIỆU BIỂU ĐỒ CƠ CẤU DOANH THU THEO DANH MỤC SẢN PHẨM
            // =========================================================================
            $categorySales = $this->buildCategorySalesBreakdown($allTimeRevenue);

            // =========================================================================
            // 7. DỮ LIỆU BIỂU ĐỒ PHƯƠNG THỨC THANH TOÁN
            // =========================================================================
            $paymentMethods = $this->buildPaymentMethodDistribution();

            // =========================================================================
            // 8. DỮ LIỆU BIỂU ĐỒ TRẠNG THÁI ĐƠN HÀNG (STATUS DONUT CHART)
            // =========================================================================
            $statusDistribution = [];
            foreach (self::STATUS_CONFIG as $stKey => $conf) {
                $count = $statusCounts[$stKey] ?? 0;
                $pct = $totalOrders > 0 ? round(($count / $totalOrders) * 100, 1) : 0.0;
                $statusDistribution[] = [
                    'status' => $stKey,
                    'label' => $conf['label'],
                    'color' => $conf['color'],
                    'badge' => $conf['badge'],
                    'count' => $count,
                    'percentage' => $pct,
                ];
            }

            // =========================================================================
            // 9. DANH SÁCH CẦN HÀNH ĐỘNG & HOẠT ĐỘNG GẦN ĐÂY
            // =========================================================================

            // A. Top 5 đơn hàng mới cần xử lý (Pending hoặc Confirmed)
            $pendingOrders = Order::with(['payment'])
                ->whereIn('status', ['pending', 'confirmed'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($order) {
                    $total = (float) $order->total_amount;
                    return [
                        'id' => $order->id,
                        'order_code' => $order->order_code,
                        'recipient_name' => $order->recipient_name,
                        'recipient_phone' => $order->recipient_phone,
                        'total_amount' => $total,
                        'total_amount_display' => number_format($total, 0, ',', '.') . '₫',
                        'status' => $order->status,
                        'status_label' => self::STATUS_CONFIG[$order->status]['label'] ?? $order->status,
                        'payment_method' => $order->payment?->method ?? 'cod',
                        'payment_status' => $order->payment?->status ?? 'pending',
                        'created_at' => $order->created_at ? $order->created_at->format('Y-m-d H:i:s') : null,
                        'created_at_display' => $order->created_at ? $order->created_at->format('d/m/Y H:i') : null,
                    ];
                });

            // B. Top 5 sản phẩm bán chạy nhất
            $topProducts = OrderItem::select(
                    'product_name',
                    'variant_id',
                    DB::raw('SUM(quantity) as total_sold'),
                    DB::raw('SUM(line_total) as total_revenue')
                )
                ->whereHas('order', function ($q) {
                    $q->where('status', 'completed');
                })
                ->groupBy('product_name', 'variant_id')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get()
                ->map(function ($item) {
                    $variant = ProductVariant::with(['product.images', 'product.category'])->find($item->variant_id);
                    $totalRev = (float) $item->total_revenue;
                    $imageUrl = $variant?->product?->images->first()?->image_url ?? '/images/placeholder.jpg';

                    return [
                        'variant_id' => $item->variant_id,
                        'product_name' => $item->product_name,
                        'category_name' => $variant?->product?->category?->name ?? 'Nội thất',
                        'color' => $variant?->color ?? '',
                        'material' => $variant?->material ?? '',
                        'image' => $imageUrl,
                        'total_sold' => (int) $item->total_sold,
                        'total_revenue' => $totalRev,
                        'total_revenue_display' => number_format($totalRev, 0, ',', '.') . '₫',
                    ];
                });

            // C. Cảnh báo sắp hết hàng (stock_quantity <= 5)
            $lowStockAlerts = ProductVariant::with(['product.images'])
                ->where('stock_quantity', '<=', 5)
                ->where('is_active', true)
                ->orderBy('stock_quantity', 'asc')
                ->limit(8)
                ->get()
                ->map(function ($var) {
                    $price = (float) $var->price;
                    return [
                        'variant_id' => $var->id,
                        'product_id' => $var->product_id,
                        'product_name' => $var->product?->name ?? 'Sản phẩm',
                        'sku' => $var->sku,
                        'color' => $var->color,
                        'material' => $var->material,
                        'price' => $price,
                        'price_display' => number_format($price, 0, ',', '.') . '₫',
                        'stock_quantity' => (int) $var->stock_quantity,
                        'is_out_of_stock' => $var->stock_quantity <= 0,
                        'image' => $var->product?->images->first()?->image_url ?? '/images/placeholder.jpg',
                    ];
                });

            // D. Top 5 khách hàng mới đăng ký gần nhất
            $recentCustomers = User::where('role', 'user')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'phone' => $u->phone,
                        'avatar' => $u->avatar,
                        'is_active' => (bool) $u->is_active,
                        'created_at_display' => $u->created_at ? $u->created_at->format('d/m/Y H:i') : null,
                    ];
                });

            // =========================================================================
            // 10. TRẢ VỀ PAYLOAD TỔNG HỢP CHO FRONTEND DASHBOARD
            // =========================================================================
            return response()->json([
                'status' => true,
                'message' => 'Lấy dữ liệu thống kê tổng quan thành công.',
                'data' => [
                    'kpis' => [
                        'revenue' => [
                            'today' => $todayRevenue,
                            'today_display' => number_format($todayRevenue, 0, ',', '.') . '₫',
                            'yesterday' => $yesterdayRevenue,
                            'yesterday_display' => number_format($yesterdayRevenue, 0, ',', '.') . '₫',
                            'growth_day_percent' => $revenueGrowthDayPercent,
                            'this_week' => $thisWeekRevenue,
                            'this_week_display' => number_format($thisWeekRevenue, 0, ',', '.') . '₫',
                            'this_month' => $thisMonthRevenue,
                            'this_month_display' => number_format($thisMonthRevenue, 0, ',', '.') . '₫',
                            'last_month' => $lastMonthRevenue,
                            'last_month_display' => number_format($lastMonthRevenue, 0, ',', '.') . '₫',
                            'growth_month_percent' => $revenueGrowthMonthPercent,
                            'this_year' => $thisYearRevenue,
                            'this_year_display' => number_format($thisYearRevenue, 0, ',', '.') . '₫',
                            'all_time' => $allTimeRevenue,
                            'all_time_display' => number_format($allTimeRevenue, 0, ',', '.') . '₫',
                        ],
                        'orders' => [
                            'total' => $totalOrders,
                            'today' => $todayOrders,
                            'this_month' => $thisMonthOrders,
                            'pending' => $statusCounts['pending'],
                            'confirmed' => $statusCounts['confirmed'],
                            'shipping' => $statusCounts['shipping'],
                            'completed' => $statusCounts['completed'],
                            'cancelled' => $statusCounts['cancelled'],
                            'completion_rate_percent' => $completionRatePercent,
                        ],
                        'customers' => [
                            'total_customers' => $totalCustomers,
                            'total_admins' => $totalAdmins,
                            'new_this_month' => $newCustomersThisMonth,
                            'customers_with_orders' => $customersWithOrders,
                        ],
                        'inventory' => [
                            'total_products' => $totalProducts,
                            'active_products' => $activeProducts,
                            'total_variants' => $totalVariants,
                            'out_of_stock_count' => $outOfStockCount,
                            'low_stock_count' => $lowStockCount,
                        ],
                    ],
                    'charts' => [
                        'revenue_trend' => [
                            'period' => $period,
                            'data' => $revenueTrend,
                        ],
                        'category_sales' => $categorySales,
                        'payment_methods' => $paymentMethods,
                        'status_distribution' => $statusDistribution,
                    ],
                    'actionable' => [
                        'pending_orders' => $pendingOrders,
                        'top_selling_products' => $topProducts,
                        'low_stock_alerts' => $lowStockAlerts,
                        'recent_customers' => $recentCustomers,
                    ],
                    'meta' => [
                        'generated_at' => Carbon::now()->format('Y-m-d H:i:s'),
                        'generated_at_display' => Carbon::now()->format('d/m/Y H:i:s'),
                    ],
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải dữ liệu thống kê tổng quan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Tính tỷ lệ tăng trưởng % an toàn (tránh chia cho 0)
     */
    private function calculateGrowthRate(float $current, float $previous): float
    {
        if ($previous <= 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Dựng dữ liệu chuỗi thời gian cho biểu đồ doanh thu theo period
     */
    private function buildRevenueTrend(string $period): array
    {
        $dayNames = [
            'Monday' => 'Thứ 2',
            'Tuesday' => 'Thứ 3',
            'Wednesday' => 'Thứ 4',
            'Thursday' => 'Thứ 5',
            'Friday' => 'Thứ 6',
            'Saturday' => 'Thứ 7',
            'Sunday' => 'Chủ nhật',
        ];

        $trend = [];

        if ($period === '12_months') {
            // Thống kê 12 tháng của năm hiện tại
            $currentYear = Carbon::now()->year;
            for ($month = 1; $month <= 12; $month++) {
                $start = Carbon::createFromDate($currentYear, $month, 1)->startOfMonth();
                $end = (clone $start)->endOfMonth();

                $rev = (float) Order::where('status', 'completed')
                    ->whereBetween('created_at', [$start, $end])
                    ->sum('total_amount');

                $orderCount = Order::whereBetween('created_at', [$start, $end])->count();

                $trend[] = [
                    'month' => $month,
                    'label' => "Thg $month",
                    'full_label' => "Tháng $month/$currentYear",
                    'revenue' => $rev,
                    'revenue_display' => number_format($rev, 0, ',', '.') . '₫',
                    'order_count' => $orderCount,
                ];
            }
        } elseif ($period === '30_days') {
            // Thống kê 30 ngày gần nhất
            for ($i = 29; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $dateStr = $date->format('Y-m-d');

                $rev = (float) Order::where('status', 'completed')
                    ->whereDate('created_at', $dateStr)
                    ->sum('total_amount');

                $orderCount = Order::whereDate('created_at', $dateStr)->count();

                $trend[] = [
                    'date' => $dateStr,
                    'label' => $date->format('d/m'),
                    'full_label' => $date->format('d/m/Y'),
                    'day_name' => $dayNames[$date->format('l')] ?? '',
                    'revenue' => $rev,
                    'revenue_display' => number_format($rev, 0, ',', '.') . '₫',
                    'order_count' => $orderCount,
                ];
            }
        } else {
            // Mặc định: 7 ngày gần nhất
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $dateStr = $date->format('Y-m-d');

                $rev = (float) Order::where('status', 'completed')
                    ->whereDate('created_at', $dateStr)
                    ->sum('total_amount');

                $orderCount = Order::whereDate('created_at', $dateStr)->count();

                $trend[] = [
                    'date' => $dateStr,
                    'label' => $date->format('d/m'),
                    'full_label' => $date->format('d/m/Y'),
                    'day_name' => $dayNames[$date->format('l')] ?? '',
                    'revenue' => $rev,
                    'revenue_display' => number_format($rev, 0, ',', '.') . '₫',
                    'order_count' => $orderCount,
                ];
            }
        }

        return $trend;
    }

    /**
     * Dựng dữ liệu cơ cấu doanh thu theo danh mục sản phẩm (Donut Chart)
     */
    private function buildCategorySalesBreakdown(float $totalRevenue): array
    {
        $rawCategories = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', 'completed')
            ->groupBy('categories.id', 'categories.name', 'categories.slug')
            ->select(
                'categories.id as category_id',
                'categories.name as category_name',
                'categories.slug as category_slug',
                DB::raw('SUM(order_items.quantity) as total_quantity'),
                DB::raw('SUM(order_items.line_total) as total_revenue')
            )
            ->orderByDesc('total_revenue')
            ->get();

        $categoryColors = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#64748B'];

        $result = [];
        $colorIndex = 0;

        foreach ($rawCategories as $cat) {
            $catRev = (float) $cat->total_revenue;
            $pct = $totalRevenue > 0 ? round(($catRev / $totalRevenue) * 100, 1) : 0.0;

            $result[] = [
                'category_id' => $cat->category_id,
                'name' => $cat->category_name,
                'slug' => $cat->category_slug,
                'total_quantity' => (int) $cat->total_quantity,
                'total_revenue' => $catRev,
                'total_revenue_display' => number_format($catRev, 0, ',', '.') . '₫',
                'percentage' => $pct,
                'color' => $categoryColors[$colorIndex % count($categoryColors)],
            ];
            $colorIndex++;
        }

        return $result;
    }

    /**
     * Dựng dữ liệu cơ cấu phương thức thanh toán
     */
    private function buildPaymentMethodDistribution(): array
    {
        $payments = DB::table('payments')
            ->select(
                'method',
                DB::raw('COUNT(id) as count'),
                DB::raw('SUM(amount) as total_amount')
            )
            ->groupBy('method')
            ->get();

        $totalPaymentsCount = $payments->sum('count');

        $methodColors = [
            'cod' => '#3B82F6',          // Xanh dương
            'bank_transfer' => '#10B981', // Xanh lá
            'vnpay' => '#EF4444',         // Đỏ VNPay
            'momo' => '#EC4899',          // Hồng MoMo
        ];

        $result = [];
        foreach ($payments as $p) {
            $amt = (float) $p->total_amount;
            $count = (int) $p->count;
            $pct = $totalPaymentsCount > 0 ? round(($count / $totalPaymentsCount) * 100, 1) : 0.0;

            $result[] = [
                'method' => $p->method,
                'label' => self::PAYMENT_METHOD_LABELS[$p->method] ?? strtoupper($p->method),
                'count' => $count,
                'total_amount' => $amt,
                'total_amount_display' => number_format($amt, 0, ',', '.') . '₫',
                'percentage' => $pct,
                'color' => $methodColors[$p->method] ?? '#6B7280',
            ];
        }

        return $result;
    }
}
