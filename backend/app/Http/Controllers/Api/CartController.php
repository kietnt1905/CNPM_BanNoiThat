<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    /**
     * Lấy danh sách sản phẩm trong giỏ hàng của người dùng hiện tại (Yêu cầu đăng nhập)
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);

            return response()->json([
                'status' => true,
                'data' => $this->formatCartResponse($cart),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải giỏ hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Thêm sản phẩm (biến thể) vào giỏ hàng
     */
    public function addItem(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'variant_id' => 'required|integer|exists:product_variants,id',
            'quantity' => 'nullable|integer|min:1',
        ], [
            'variant_id.required' => 'Vui lòng chọn biến thể sản phẩm.',
            'variant_id.exists' => 'Biến thể sản phẩm không tồn tại.',
            'quantity.integer' => 'Số lượng phải là số nguyên.',
            'quantity.min' => 'Số lượng ít nhất là 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = $request->user();
            $variantId = (int) $request->variant_id;
            $addQuantity = (int) ($request->quantity ?? 1);

            // Kiểm tra trạng thái và tồn kho của biến thể
            $variant = ProductVariant::with('product')->find($variantId);

            if (!$variant || !$variant->is_active || !$variant->product || !$variant->product->is_active) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm hoặc biến thể này hiện không khả dụng.',
                ], 400);
            }

            if ($variant->stock_quantity <= 0) {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm này tạm thời đã hết hàng trong kho.',
                ], 400);
            }

            $cart = Cart::firstOrCreate(['user_id' => $user->id]);

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('variant_id', $variantId)
                ->first();

            if ($cartItem) {
                $newQuantity = $cartItem->quantity + $addQuantity;

                if ($newQuantity > $variant->stock_quantity) {
                    return response()->json([
                        'status' => false,
                        'message' => "Số lượng trong giỏ hàng sẽ vượt quá tồn kho hiện có (Kho còn: {$variant->stock_quantity}, trong giỏ đã có: {$cartItem->quantity}).",
                        'available_stock' => $variant->stock_quantity,
                        'current_cart_quantity' => $cartItem->quantity,
                    ], 422);
                }

                $cartItem->quantity = $newQuantity;
                $cartItem->save();
            } else {
                if ($addQuantity > $variant->stock_quantity) {
                    return response()->json([
                        'status' => false,
                        'message' => "Số lượng yêu cầu ({$addQuantity}) vượt quá số lượng còn lại trong kho ({$variant->stock_quantity}).",
                        'available_stock' => $variant->stock_quantity,
                    ], 422);
                }

                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'variant_id' => $variantId,
                    'quantity' => $addQuantity,
                ]);
            }

            return response()->json([
                'status' => true,
                'message' => 'Đã thêm sản phẩm vào giỏ hàng thành công.',
                'data' => $this->formatCartResponse($cart),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi thêm vào giỏ hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Cập nhật số lượng của một mục trong giỏ hàng
     */
    public function updateItem(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ], [
            'quantity.required' => 'Vui lòng cung cấp số lượng mới.',
            'quantity.integer' => 'Số lượng phải là số nguyên.',
            'quantity.min' => 'Số lượng ít nhất là 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = $request->user();
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Giỏ hàng không tồn tại.',
                ], 404);
            }

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->with('variant')
                ->find($id);

            if (!$cartItem) {
                return response()->json([
                    'status' => false,
                    'message' => 'Mục giỏ hàng không tồn tại.',
                ], 404);
            }

            $variant = $cartItem->variant;
            $newQuantity = (int) $request->quantity;

            if ($variant && $newQuantity > $variant->stock_quantity) {
                return response()->json([
                    'status' => false,
                    'message' => "Số lượng cập nhật ({$newQuantity}) vượt quá tồn kho hiện có ({$variant->stock_quantity}).",
                    'available_stock' => $variant->stock_quantity,
                ], 422);
            }

            $cartItem->quantity = $newQuantity;
            $cartItem->save();

            return response()->json([
                'status' => true,
                'message' => 'Cập nhật số lượng thành công.',
                'data' => $this->formatCartResponse($cart),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật giỏ hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa 1 mục khỏi giỏ hàng
     */
    public function removeItem(Request $request, $id)
    {
        try {
            $user = $request->user();
            $cart = Cart::where('user_id', $user->id)->first();

            if (!$cart) {
                return response()->json([
                    'status' => false,
                    'message' => 'Giỏ hàng không tồn tại.',
                ], 404);
            }

            $cartItem = CartItem::where('cart_id', $cart->id)->find($id);

            if (!$cartItem) {
                return response()->json([
                    'status' => false,
                    'message' => 'Mục giỏ hàng không tồn tại.',
                ], 404);
            }

            $cartItem->delete();

            return response()->json([
                'status' => true,
                'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.',
                'data' => $this->formatCartResponse($cart),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xóa sạch toàn bộ giỏ hàng
     */
    public function clearCart(Request $request)
    {
        try {
            $user = $request->user();
            $cart = Cart::where('user_id', $user->id)->first();

            if ($cart) {
                $cart->items()->delete();
            }

            return response()->json([
                'status' => true,
                'message' => 'Đã làm trống giỏ hàng thành công.',
                'data' => $cart ? $this->formatCartResponse($cart) : [
                    'id' => null,
                    'items' => [],
                    'summary' => [
                        'total_items' => 0,
                        'total_unique_items' => 0,
                        'total_amount' => 0,
                        'total_amount_display' => '0₫',
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa giỏ hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Đồng bộ giỏ hàng từ Guest (LocalStorage) vào tài khoản khi người dùng Đăng nhập
     */
    public function syncCart(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.variant_id' => 'required|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ], [
            'items.required' => 'Danh sách sản phẩm đồng bộ không được để trống.',
            'items.array' => 'Dữ liệu sản phẩm phải là một danh sách mảng.',
            'items.*.variant_id.required' => 'Thiếu variant_id.',
            'items.*.variant_id.exists' => 'Biến thể không tồn tại.',
            'items.*.quantity.min' => 'Số lượng phải lớn hơn hoặc bằng 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu đồng bộ không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $user = $request->user();
            $cart = Cart::firstOrCreate(['user_id' => $user->id]);

            DB::beginTransaction();

            foreach ($request->items as $itemData) {
                $variantId = (int) $itemData['variant_id'];
                $quantity = (int) $itemData['quantity'];

                $variant = ProductVariant::with('product')->find($variantId);

                // Bỏ qua nếu biến thể không còn khả dụng hoặc hết hàng
                if (!$variant || !$variant->is_active || !$variant->product || !$variant->product->is_active || $variant->stock_quantity <= 0) {
                    continue;
                }

                $cartItem = CartItem::where('cart_id', $cart->id)
                    ->where('variant_id', $variantId)
                    ->first();

                if ($cartItem) {
                    // Cộng dồn nhưng không vượt quá tồn kho hiện có
                    $mergedQuantity = min($cartItem->quantity + $quantity, $variant->stock_quantity);
                    $cartItem->quantity = $mergedQuantity;
                    $cartItem->save();
                } else {
                    // Thêm mới với số lượng tối đa bằng tồn kho
                    $initialQuantity = min($quantity, $variant->stock_quantity);
                    if ($initialQuantity > 0) {
                        CartItem::create([
                            'cart_id' => $cart->id,
                            'variant_id' => $variantId,
                            'quantity' => $initialQuantity,
                        ]);
                    }
                }
            }

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => 'Đồng bộ giỏ hàng thành công.',
                'data' => $this->formatCartResponse($cart),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi đồng bộ giỏ hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Xem trước và tính toán giỏ hàng cho Khách vãng lai (Public route - không cần token)
     * Request body: { items: [ { variant_id: 1, quantity: 2 }, ... ] }
     */
    public function guestPreview(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'present|array',
            'items.*.variant_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu giỏ hàng không hợp lệ',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $rawItems = $request->input('items', []);
            $formattedItems = [];
            $totalAmount = 0;
            $totalQuantity = 0;

            foreach ($rawItems as $rawItem) {
                $variantId = (int) $rawItem['variant_id'];
                $quantity = (int) $rawItem['quantity'];

                $variant = ProductVariant::with(['product.images', 'product.category'])->find($variantId);

                if (!$variant) {
                    continue;
                }

                $product = $variant->product;
                $imageUrl = $product?->images->first()?->image_url ?? '/images/placeholder.jpg';
                $price = (float) $variant->price;
                $lineTotal = $price * $quantity;
                $isAvailable = (bool) ($variant->is_active && ($product?->is_active ?? false) && $variant->stock_quantity >= $quantity);
                $isOutOfStock = $variant->stock_quantity <= 0;
                $exceedsStock = $quantity > $variant->stock_quantity;

                $dims = '';
                if ($variant->length_cm || $variant->width_cm || $variant->height_cm) {
                    $dims = "D{$variant->length_cm} × R{$variant->width_cm} × C{$variant->height_cm} cm";
                }

                $formattedItems[] = [
                    'id' => null, // Khách chưa có cart_item_id trong DB
                    'variant_id' => $variant->id,
                    'product_id' => $product?->id,
                    'product_name' => $product?->name ?? 'Sản phẩm không xác định',
                    'product_slug' => $product?->slug,
                    'category_name' => $product?->category?->name,
                    'sku' => $variant->sku,
                    'color' => $variant->color,
                    'material' => $variant->material,
                    'dimensions' => $dims ?: null,
                    'image' => $imageUrl,
                    'price' => $price,
                    'price_display' => number_format($price, 0, ',', '.') . '₫',
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                    'line_total_display' => number_format($lineTotal, 0, ',', '.') . '₫',
                    'stock_quantity' => $variant->stock_quantity,
                    'is_active' => (bool) ($variant->is_active && ($product?->is_active ?? false)),
                    'is_out_of_stock' => $isOutOfStock,
                    'exceeds_stock' => $exceedsStock,
                    'is_available' => $isAvailable,
                    'max_quantity' => $variant->stock_quantity,
                ];

                if ($isAvailable) {
                    $totalAmount += $lineTotal;
                    $totalQuantity += $quantity;
                }
            }

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => null,
                    'items' => $formattedItems,
                    'summary' => [
                        'total_items' => $totalQuantity,
                        'total_unique_items' => count($formattedItems),
                        'total_amount' => $totalAmount,
                        'total_amount_display' => number_format($totalAmount, 0, ',', '.') . '₫',
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tính toán giỏ hàng: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Định dạng cấu trúc trả về chuẩn cho Giỏ hàng
     */
    private function formatCartResponse(Cart $cart)
    {
        $cart->load([
            'items.variant.product.images',
            'items.variant.product.category',
        ]);

        $formattedItems = [];
        $totalAmount = 0;
        $totalQuantity = 0;

        foreach ($cart->items as $item) {
            $variant = $item->variant;
            if (!$variant) {
                continue;
            }

            $product = $variant->product;
            $imageUrl = $product?->images->first()?->image_url ?? '/images/placeholder.jpg';
            $price = (float) $variant->price;
            $lineTotal = $price * $item->quantity;
            $isAvailable = (bool) ($variant->is_active && ($product?->is_active ?? false) && $variant->stock_quantity >= $item->quantity);
            $isOutOfStock = $variant->stock_quantity <= 0;
            $exceedsStock = $item->quantity > $variant->stock_quantity;

            $dims = '';
            if ($variant->length_cm || $variant->width_cm || $variant->height_cm) {
                $dims = "D{$variant->length_cm} × R{$variant->width_cm} × C{$variant->height_cm} cm";
            }

            $formattedItems[] = [
                'id' => $item->id,
                'cart_id' => $cart->id,
                'variant_id' => $variant->id,
                'product_id' => $product?->id,
                'product_name' => $product?->name ?? 'Sản phẩm không xác định',
                'product_slug' => $product?->slug,
                'category_name' => $product?->category?->name,
                'sku' => $variant->sku,
                'color' => $variant->color,
                'material' => $variant->material,
                'dimensions' => $dims ?: null,
                'image' => $imageUrl,
                'price' => $price,
                'price_display' => number_format($price, 0, ',', '.') . '₫',
                'quantity' => $item->quantity,
                'line_total' => $lineTotal,
                'line_total_display' => number_format($lineTotal, 0, ',', '.') . '₫',
                'stock_quantity' => $variant->stock_quantity,
                'is_active' => (bool) ($variant->is_active && ($product?->is_active ?? false)),
                'is_out_of_stock' => $isOutOfStock,
                'exceeds_stock' => $exceedsStock,
                'is_available' => $isAvailable,
                'max_quantity' => $variant->stock_quantity,
            ];

            if ($isAvailable) {
                $totalAmount += $lineTotal;
                $totalQuantity += $item->quantity;
            }
        }

        return [
            'id' => $cart->id,
            'items' => $formattedItems,
            'summary' => [
                'total_items' => $totalQuantity,
                'total_unique_items' => count($formattedItems),
                'total_amount' => $totalAmount,
                'total_amount_display' => number_format($totalAmount, 0, ',', '.') . '₫',
            ],
        ];
    }
}
