<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\ProductVariant;
use App\Services\VNPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Danh sách trạng thái đơn hàng và nhãn tiếng Việt
     */
    private const STATUS_LABELS = [
        'pending' => 'Chờ xác nhận',
        'confirmed' => 'Đã xác nhận',
        'shipping' => 'Đang giao hàng',
        'completed' => 'Đã hoàn thành',
        'cancelled' => 'Đã hủy',
    ];

    /**
     * Danh sách phương thức thanh toán và nhãn tiếng Việt
     */
    private const PAYMENT_METHOD_LABELS = [
        'cod' => 'Thanh toán khi nhận hàng (COD)',
        'bank_transfer' => 'Chuyển khoản ngân hàng',
        'vnpay' => 'Ví điện tử VNPAY',
        'momo' => 'Ví MoMo',
    ];

    /**
     * Danh sách trạng thái thanh toán và nhãn tiếng Việt
     */
    private const PAYMENT_STATUS_LABELS = [
        'pending' => 'Chờ thanh toán',
        'success' => 'Đã thanh toán',
        'failed' => 'Thanh toán thất bại',
        'refunded' => 'Đã hoàn tiền',
    ];

    /**
     * Tạo đơn hàng mới (POST /api/orders)
     * - Dùng DB::beginTransaction() đảm bảo an toàn giao dịch
     * - Validate thông tin người nhận (Họ tên, SĐT, địa chỉ giao lắp nội thất, PT thanh toán, ghi chú)
     * - Kiểm tra tồn kho, trừ tồn kho, lưu order và order_items, làm trống giỏ hàng
     * - Báo lỗi 422 và rollback nếu thiếu hàng
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_name' => 'required|string|max:100',
            'recipient_phone' => ['required', 'string', 'max:20', 'regex:/^[0-9+().\s-]{9,20}$/'],
            'shipping_address' => 'required|string|max:500',
            'payment_method' => 'required|string|in:cod,bank_transfer,COD,bank,BANK_TRANSFER,chuyen_khoan,chuyenkhoan,Chuyển khoản,vnpay,VNPAY,vn_pay',
            'note' => 'nullable|string|max:1000',
            'shipping_fee' => 'nullable|numeric|min:0',
            'discount_amount' => 'nullable|numeric|min:0',
            'items' => 'nullable|array',
            'items.*.variant_id' => 'required_with:items|integer|exists:product_variants,id',
            'items.*.quantity' => 'required_with:items|integer|min:1',
        ], [
            'recipient_name.required' => 'Vui lòng nhập họ và tên người nhận hàng.',
            'recipient_name.max' => 'Họ và tên không được vượt quá 100 ký tự.',
            'recipient_phone.required' => 'Vui lòng nhập số điện thoại người nhận.',
            'recipient_phone.regex' => 'Số điện thoại không đúng định dạng.',
            'shipping_address.required' => 'Vui lòng cung cấp địa chỉ giao hàng và lắp đặt nội thất.',
            'shipping_address.max' => 'Địa chỉ không được vượt quá 500 ký tự.',
            'payment_method.required' => 'Vui lòng chọn phương thức thanh toán (COD, Chuyển khoản hoặc VNPAY).',
            'payment_method.in' => 'Phương thức thanh toán không hợp lệ (Hỗ trợ COD, Chuyển khoản hoặc VNPAY).',
            'items.*.variant_id.exists' => 'Biến thể sản phẩm đã chọn không tồn tại.',
            'items.*.quantity.min' => 'Số lượng mỗi món phải lớn hơn hoặc bằng 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Thông tin đặt hàng không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();

        DB::beginTransaction();

        try {
            // 1. Xác định danh sách món hàng cần mua
            // Nếu gửi mảng items riêng (ví dụ Mua ngay hoặc chỉ định) thì dùng items đó
            // Nếu không gửi, mặc định lấy toàn bộ món hàng trong Giỏ hàng hiện tại của user trong database
            $checkoutItems = [];

            if ($request->has('items') && is_array($request->items) && count($request->items) > 0) {
                foreach ($request->items as $item) {
                    $checkoutItems[] = [
                        'variant_id' => (int) $item['variant_id'],
                        'quantity' => (int) $item['quantity'],
                    ];
                }
            } else {
                $cart = Cart::where('user_id', $user->id)->with('items')->first();

                if (!$cart || $cart->items->isEmpty()) {
                    DB::rollBack();
                    return response()->json([
                        'status' => false,
                        'message' => 'Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng.',
                    ], 422);
                }

                foreach ($cart->items as $cartItem) {
                    $checkoutItems[] = [
                        'variant_id' => (int) $cartItem->variant_id,
                        'quantity' => (int) $cartItem->quantity,
                    ];
                }
            }

            if (empty($checkoutItems)) {
                DB::rollBack();
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm nào để tạo đơn hàng.',
                ], 422);
            }

            // 2. Khóa dòng và kiểm tra tồn kho, trạng thái của từng biến thể sản phẩm
            $subtotal = 0;
            $preparedItems = [];

            foreach ($checkoutItems as $item) {
                $variantId = $item['variant_id'];
                $quantity = $item['quantity'];

                // Dùng lockForUpdate để tránh xung đột số lượng tồn kho đồng thời
                $variant = ProductVariant::lockForUpdate()
                    ->with('product.images')
                    ->find($variantId);

                if (!$variant || !$variant->is_active || !$variant->product || !$variant->product->is_active) {
                    DB::rollBack();
                    $productName = $variant?->product?->name ?? "Biến thể #{$variantId}";
                    return response()->json([
                        'status' => false,
                        'message' => "Sản phẩm '{$productName}' hiện đang tạm ngừng kinh doanh hoặc không khả dụng.",
                    ], 422);
                }

                // Kiểm tra số lượng tồn kho
                if ($variant->stock_quantity < $quantity) {
                    DB::rollBack();
                    $productName = $variant->product->name;
                    return response()->json([
                        'status' => false,
                        'message' => "Sản phẩm '{$productName}' (Màu: {$variant->color}, Chất liệu: {$variant->material}) không đủ tồn kho. Hiện chỉ còn {$variant->stock_quantity} sản phẩm (Yêu cầu: {$quantity}).",
                        'out_of_stock_item' => [
                            'variant_id' => $variant->id,
                            'product_name' => $productName,
                            'sku' => $variant->sku,
                            'color' => $variant->color,
                            'material' => $variant->material,
                            'available_stock' => $variant->stock_quantity,
                            'requested_quantity' => $quantity,
                        ],
                    ], 422);
                }

                $unitPrice = (float) $variant->price;
                $lineTotal = $unitPrice * $quantity;
                $subtotal += $lineTotal;

                $dims = '';
                if ($variant->length_cm || $variant->width_cm || $variant->height_cm) {
                    $dims = "D{$variant->length_cm} × R{$variant->width_cm} × C{$variant->height_cm} cm";
                }

                $preparedItems[] = [
                    'variant' => $variant,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'product_name' => $variant->product->name,
                    'sku' => $variant->sku,
                    'color' => $variant->color,
                    'material' => $variant->material,
                    'dimensions_snapshot' => $dims ?: null,
                ];
            }

            // 3. Chuẩn bị mã đơn hàng duy nhất và chi phí
            $orderCode = 'ORD' . date('Ymd') . strtoupper(Str::random(6));
            while (Order::where('order_code', $orderCode)->exists()) {
                $orderCode = 'ORD' . date('Ymd') . strtoupper(Str::random(6));
            }

            $shippingFee = max(0, (float) ($request->shipping_fee ?? 0));
            $discountAmount = max(0, (float) ($request->discount_amount ?? 0));

            // 4. Tạo bản ghi bảng orders
            $order = Order::create([
                'order_code' => $orderCode,
                'user_id' => $user->id,
                'recipient_name' => trim($request->recipient_name),
                'recipient_phone' => trim($request->recipient_phone),
                'shipping_address' => trim($request->shipping_address),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'shipping_fee' => $shippingFee,
                'discount_amount' => $discountAmount,
                'note' => $request->note ? trim($request->note) : null,
            ]);

            // 5. Lưu chi tiết vào bảng order_items và trừ số lượng tồn kho từng bàn/ghế
            foreach ($preparedItems as $prep) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'variant_id' => $prep['variant']->id,
                    'product_name' => $prep['product_name'],
                    'sku' => $prep['sku'],
                    'color' => $prep['color'],
                    'material' => $prep['material'],
                    'dimensions_snapshot' => $prep['dimensions_snapshot'],
                    'quantity' => $prep['quantity'],
                    'unit_price' => $prep['unit_price'],
                ]);

                // Trừ tồn kho
                $prep['variant']->decrement('stock_quantity', $prep['quantity']);
            }

            // 6. Tạo bản ghi thanh toán (Payment)
            $rawMethod = strtolower($request->payment_method);
            if (in_array($rawMethod, ['cod']) || stripos($rawMethod, 'cod') !== false) {
                $normalizedMethod = 'cod';
            } elseif (in_array($rawMethod, ['vnpay', 'vn_pay']) || stripos($rawMethod, 'vnpay') !== false) {
                $normalizedMethod = 'vnpay';
            } else {
                $normalizedMethod = 'bank_transfer';
            }

            $totalAmount = max(0, ($subtotal + $shippingFee) - $discountAmount);

            Payment::create([
                'order_id' => $order->id,
                'method' => $normalizedMethod,
                'status' => 'pending',
                'amount' => $totalAmount,
                'transaction_code' => 'TXN' . date('YmdHis') . strtoupper(Str::random(4)),
            ]);

            // 7. Xóa các món đã đặt mua khỏi giỏ hàng của khách
            $cart = Cart::where('user_id', $user->id)->first();
            if ($cart) {
                if ($request->has('items') && is_array($request->items) && count($request->items) > 0) {
                    $purchasedVariantIds = collect($checkoutItems)->pluck('variant_id')->all();
                    $cart->items()->whereIn('variant_id', $purchasedVariantIds)->delete();
                } else {
                    $cart->items()->delete();
                }
            }

            DB::commit();

            // Load lại đầy đủ quan hệ để format phản hồi
            $order->refresh();
            $order->load(['items.variant.product.images', 'payment']);

            $responseData = $this->formatOrderResponse($order);
            $paymentUrl = null;

            if ($normalizedMethod === 'vnpay') {
                try {
                    $vnpayService = app(VNPayService::class);
                    $paymentUrl = $vnpayService->createPaymentUrl($order, $request->ip());
                    $responseData['payment_url'] = $paymentUrl;
                } catch (\Exception $vnpEx) {
                    \Log::error('VNPay URL Generation Error: ' . $vnpEx->getMessage());
                }
            }

            return response()->json([
                'status' => true,
                'message' => 'Đặt hàng thành công!',
                'payment_url' => $paymentUrl,
                'data' => $responseData,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Lỗi trong quá trình xử lý đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Thống kê số lượng đơn hàng theo từng trạng thái của user (GET /api/orders/counts)
     */
    public function counts(Request $request)
    {
        try {
            $userId = $request->user()->id;

            $counts = Order::where('user_id', $userId)
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status')
                ->all();

            $allTotal = array_sum($counts);

            return response()->json([
                'status' => true,
                'data' => [
                    'all' => $allTotal,
                    'pending' => $counts['pending'] ?? 0,
                    'confirmed' => $counts['confirmed'] ?? 0,
                    'shipping' => $counts['shipping'] ?? 0,
                    'completed' => $counts['completed'] ?? 0,
                    'cancelled' => $counts['cancelled'] ?? 0,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi thống kê đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy danh sách đơn hàng đã mua của user đang đăng nhập (GET /api/orders)
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $query = Order::where('user_id', $user->id)
                ->with(['items.variant.product.images', 'payment'])
                ->orderBy('created_at', 'desc');

            // Lọc theo trạng thái đơn hàng nếu có
            if ($request->filled('status') && $request->query('status') !== 'all') {
                $query->where('status', $request->query('status'));
            }

            // Tìm kiếm theo từ khóa (Mã đơn hàng hoặc Tên sản phẩm)
            if ($request->filled('search') || $request->filled('q')) {
                $keyword = trim($request->query('search', $request->query('q')));
                $query->where(function ($subQ) use ($keyword) {
                    $subQ->where('order_code', 'like', "%{$keyword}%")
                         ->orWhereHas('items', function ($itemQ) use ($keyword) {
                             $itemQ->where('product_name', 'like', "%{$keyword}%");
                         });
                });
            }

            $perPage = (int) $request->query('per_page', 10);
            $paginator = $query->paginate($perPage);

            $formattedOrders = collect($paginator->items())->map(function ($order) {
                return $this->formatOrderResponse($order);
            });

            return response()->json([
                'status' => true,
                'data' => $formattedOrders,
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải danh sách đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xem chi tiết các món trong đơn hàng (GET /api/orders/{id})
     */
    public function show(Request $request, $id)
    {
        try {
            $user = $request->user();

            $order = Order::with(['items.variant.product.images', 'payment', 'user'])
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

            // Kiểm tra quyền: chỉ chủ đơn hàng hoặc admin mới có quyền xem
            if ($order->user_id !== $user->id && ($user->role ?? '') !== 'admin') {
                return response()->json([
                    'status' => false,
                    'message' => 'Bạn không có quyền xem thông tin đơn hàng này.',
                ], 403);
            }

            return response()->json([
                'status' => true,
                'data' => $this->formatOrderResponse($order),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xem chi tiết đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Hủy đơn hàng và hoàn lại số lượng tồn kho (PATCH /api/orders/{id}/cancel)
     * - Chỉ cho phép hủy khi đơn hàng ở trạng thái 'pending'
     * - Hoàn lại số lượng tồn kho (ProductVariant::increment)
     */
    public function cancel(Request $request, $id)
    {
        $user = $request->user();

        $order = Order::with(['items', 'payment'])
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

        // Quyền sở hữu
        if ($order->user_id !== $user->id && ($user->role ?? '') !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Bạn không có quyền hủy đơn hàng này.',
            ], 403);
        }

        // Kiểm tra trạng thái đơn: chỉ cho phép hủy khi pending
        if ($order->status !== 'pending') {
            $currentStatusText = self::STATUS_LABELS[$order->status] ?? $order->status;
            return response()->json([
                'status' => false,
                'message' => "Không thể hủy đơn hàng vì đơn đang ở trạng thái '{$currentStatusText}'. Quý khách chỉ có thể tự hủy đơn khi đơn ở trạng thái Chờ xác nhận (pending).",
            ], 400);
        }

        DB::beginTransaction();

        try {
            // 1. Hoàn lại số lượng tồn kho cho từng biến thể
            foreach ($order->items as $item) {
                $variant = ProductVariant::lockForUpdate()->find($item->variant_id);
                if ($variant) {
                    $variant->increment('stock_quantity', $item->quantity);
                }
            }

            // 2. Chuyển trạng thái đơn sang cancelled
            $order->status = 'cancelled';
            $order->save();

            // 3. Cập nhật trạng thái thanh toán nếu có
            if ($order->payment && $order->payment->status === 'pending') {
                $order->payment->status = 'failed';
                $order->payment->save();
            }

            DB::commit();

            $order->refresh();
            $order->load(['items.variant.product.images', 'payment']);

            return response()->json([
                'status' => true,
                'message' => 'Hủy đơn hàng thành công và đã hoàn lại số lượng tồn kho.',
                'data' => $this->formatOrderResponse($order),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi hủy đơn hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Chuẩn hóa cấu trúc phản hồi chi tiết cho đơn hàng
     */
    private function formatOrderResponse(Order $order): array
    {
        $statusKey = $order->status;
        $statusLabel = self::STATUS_LABELS[$statusKey] ?? $statusKey;

        $payment = $order->payment;
        $paymentData = null;

        if ($payment) {
            $paymentData = [
                'id' => $payment->id,
                'method' => $payment->method,
                'method_label' => self::PAYMENT_METHOD_LABELS[$payment->method] ?? strtoupper($payment->method),
                'status' => $payment->status,
                'status_label' => self::PAYMENT_STATUS_LABELS[$payment->status] ?? $payment->status,
                'amount' => (float) $payment->amount,
                'amount_display' => number_format((float) $payment->amount, 0, ',', '.') . '₫',
                'transaction_code' => $payment->transaction_code,
                'paid_at' => $payment->paid_at ? $payment->paid_at->format('d/m/Y H:i:s') : null,
            ];
        }

        $formattedItems = [];
        $totalItemsCount = 0;

        foreach ($order->items as $item) {
            $totalItemsCount += $item->quantity;
            $unitPrice = (float) $item->unit_price;
            $lineTotal = (float) ($item->line_total ?? ($unitPrice * $item->quantity));

            // Lấy ảnh từ quan hệ nếu còn, hoặc placeholder
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
                'product_slug' => $item->variant?->product?->slug,
            ];
        }

        $subtotal = (float) $order->subtotal;
        $shippingFee = (float) $order->shipping_fee;
        $discountAmount = (float) $order->discount_amount;
        $totalAmount = (float) ($order->total_amount ?? (($subtotal + $shippingFee) - $discountAmount));

        return [
            'id' => $order->id,
            'order_code' => $order->order_code,
            'user_id' => $order->user_id,
            'recipient_name' => $order->recipient_name,
            'recipient_phone' => $order->recipient_phone,
            'shipping_address' => $order->shipping_address,
            'note' => $order->note,
            'status' => $statusKey,
            'status_label' => $statusLabel,
            'can_cancel' => ($statusKey === 'pending'),
            'subtotal' => $subtotal,
            'subtotal_display' => number_format($subtotal, 0, ',', '.') . '₫',
            'shipping_fee' => $shippingFee,
            'shipping_fee_display' => number_format($shippingFee, 0, ',', '.') . '₫',
            'discount_amount' => $discountAmount,
            'discount_amount_display' => number_format($discountAmount, 0, ',', '.') . '₫',
            'total_amount' => $totalAmount,
            'total_amount_display' => number_format($totalAmount, 0, ',', '.') . '₫',
            'total_items' => $totalItemsCount,
            'items' => $formattedItems,
            'payment' => $paymentData,
            'created_at' => $order->created_at ? $order->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $order->created_at ? $order->created_at->format('d/m/Y H:i') : null,
            'updated_at' => $order->updated_at ? $order->updated_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
