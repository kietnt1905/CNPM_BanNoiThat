<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * GET /api/admin/products
     * Danh sách sản phẩm dành cho Admin (lọc theo danh mục, trạng thái, tồn kho, tìm kiếm, phân trang)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with(['category', 'images', 'variants']);

            // 1. Thống kê số lượng theo tabs (để hiển thị badge trên giao diện)
            $totalCount = Product::count();
            $activeCount = Product::where('is_active', true)->count();
            $inactiveCount = Product::where('is_active', false)->count();

            // Đếm sản phẩm có tồn kho thấp (ít nhất 1 biến thể có 0 < stock <= 5)
            $lowStockCount = Product::whereHas('variants', function ($q) {
                $q->where('stock_quantity', '>', 0)
                  ->where('stock_quantity', '<=', 5);
            })->count();

            // Đếm sản phẩm hết hàng (tất cả biến thể đều có stock <= 0)
            $outOfStockCount = Product::whereDoesntHave('variants', function ($q) {
                $q->where('stock_quantity', '>', 0);
            })->count();

            $counts = [
                'total' => $totalCount,
                'active' => $activeCount,
                'inactive' => $inactiveCount,
                'low_stock' => $lowStockCount,
                'out_of_stock' => $outOfStockCount,
            ];

            // 2. Lọc theo trạng thái hiển thị is_active
            if ($request->filled('is_active') && $request->is_active !== 'all') {
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($isActive !== null) {
                    $query->where('is_active', $isActive);
                }
            }

            // 3. Lọc theo danh mục (category_id hoặc category slug)
            if ($request->filled('category_id') && $request->category_id !== 'all') {
                $catParam = $request->category_id;
                $query->where(function ($q) use ($catParam) {
                    if (is_numeric($catParam)) {
                        $q->where('category_id', $catParam);
                    } else {
                        $q->whereHas('category', fn($cq) => $cq->where('slug', $catParam));
                    }
                });
            }

            // 4. Lọc theo tình trạng tồn kho (stock_status)
            if ($request->filled('stock_status')) {
                if ($request->stock_status === 'in_stock') {
                    // Còn hàng (có ít nhất 1 biến thể stock > 5)
                    $query->whereHas('variants', fn($q) => $q->where('stock_quantity', '>', 5));
                } elseif ($request->stock_status === 'low_stock') {
                    // Sắp hết hàng (có biến thể 0 < stock <= 5)
                    $query->whereHas('variants', function ($q) {
                        $q->where('stock_quantity', '>', 0)
                          ->where('stock_quantity', '<=', 5);
                    });
                } elseif ($request->stock_status === 'out_of_stock') {
                    // Hết hàng (tất cả biến thể stock <= 0)
                    $query->whereDoesntHave('variants', fn($q) => $q->where('stock_quantity', '>', 0));
                }
            }

            // 5. Tìm kiếm từ khóa (tên sản phẩm, slug, thương hiệu, hoặc mã SKU)
            if ($request->filled('q') || $request->filled('search')) {
                $search = trim($request->input('q', $request->input('search')));
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%")
                      ->orWhere('brand', 'like', "%{$search}%")
                      ->orWhereHas('variants', fn($vq) => $vq->where('sku', 'like', "%{$search}%"));
                });
            }

            // 6. Sắp xếp
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

            $allowedSorts = ['id', 'name', 'created_at'];
            if (in_array($sortBy, $allowedSorts, true)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // 7. Phân trang
            $perPage = max(1, min((int) $request->input('per_page', 15), 100));
            $products = $query->paginate($perPage);

            $formattedProducts = $products->map(fn($p) => $this->formatProductSummary($p));

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách sản phẩm thành công.',
                'counts' => $counts,
                'data' => $formattedProducts,
                'pagination' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải danh sách sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/admin/products/{id}
     * Chi tiết sản phẩm kèm danh mục, toàn bộ hình ảnh và các biến thể chi tiết
     */
    public function show(int|string $id): JsonResponse
    {
        try {
            $product = Product::with(['category', 'images', 'variants'])
                ->where(function ($q) use ($id) {
                    if (is_numeric($id)) {
                        $q->where('id', $id);
                    } else {
                        $q->where('slug', $id);
                    }
                })
                ->first();

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm.',
                ], 404);
            }

            // Tính số lượng đã bán từ các đơn hàng completed
            $variantIds = $product->variants->pluck('id')->toArray();
            $soldCount = (int) OrderItem::whereIn('variant_id', $variantIds)
                ->whereHas('order', fn($q) => $q->where('status', 'completed'))
                ->sum('quantity');

            return response()->json([
                'status' => true,
                'message' => 'Lấy chi tiết sản phẩm thành công.',
                'data' => $this->formatProductDetail($product, $soldCount),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải chi tiết sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/admin/products
     * Tạo sản phẩm mới kèm hình ảnh và các biến thể (Transaction an toàn)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:200',
            'slug' => 'nullable|string|max:191|unique:products,slug',
            'brand' => 'nullable|string|max:100',
            'warranty_months' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',

            // Hình ảnh
            'images' => 'nullable|array',
            'images.*.image_url' => 'required_with:images|string',
            'images.*.alt_text' => 'nullable|string|max:200',
            'images.*.sort_order' => 'nullable|integer',

            // Biến thể (bắt buộc ít nhất 1 biến thể)
            'variants' => 'required|array|min:1',
            'variants.*.sku' => 'nullable|string|max:50|unique:product_variants,sku',
            'variants.*.color' => 'required|string|max:50',
            'variants.*.material' => 'required|string|max:100',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.length_cm' => 'nullable|numeric|min:0',
            'variants.*.width_cm' => 'nullable|numeric|min:0',
            'variants.*.height_cm' => 'nullable|numeric|min:0',
            'variants.*.weight_kg' => 'nullable|numeric|min:0',
            'variants.*.is_active' => 'nullable|boolean',
        ], [
            'category_id.required' => 'Vui lòng chọn danh mục cho sản phẩm.',
            'category_id.exists' => 'Danh mục đã chọn không tồn tại.',
            'name.required' => 'Tên sản phẩm không được để trống.',
            'name.max' => 'Tên sản phẩm không được vượt quá 200 ký tự.',
            'slug.unique' => 'Đường dẫn (slug) này đã được sử dụng.',
            'variants.required' => 'Sản phẩm phải có ít nhất một biến thể quy cách/màu sắc.',
            'variants.min' => 'Sản phẩm phải có ít nhất một biến thể quy cách/màu sắc.',
            'variants.*.color.required' => 'Màu sắc biến thể không được để trống.',
            'variants.*.material.required' => 'Chất liệu biến thể không được để trống.',
            'variants.*.price.required' => 'Giá bán biến thể không được để trống.',
            'variants.*.price.min' => 'Giá bán biến thể không được nhỏ hơn 0.',
            'variants.*.stock_quantity.required' => 'Số lượng tồn kho không được để trống.',
            'variants.*.stock_quantity.min' => 'Số lượng tồn kho không được nhỏ hơn 0.',
            'variants.*.sku.unique' => 'Mã SKU của biến thể đã tồn tại trong hệ thống.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            $name = trim($request->name);
            $slug = $request->filled('slug')
                ? Str::slug($request->slug)
                : $this->generateUniqueSlug($name);

            // 1. Tạo sản phẩm chính
            $product = Product::create([
                'category_id' => $request->category_id,
                'name' => $name,
                'slug' => $slug,
                'brand' => $request->filled('brand') ? trim($request->brand) : null,
                'warranty_months' => $request->input('warranty_months', 12),
                'description' => $request->input('description'),
                'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
            ]);

            // 2. Thêm hình ảnh
            if ($request->filled('images') && is_array($request->images)) {
                $sort = 0;
                foreach ($request->images as $img) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => trim($img['image_url']),
                        'alt_text' => $img['alt_text'] ?? $product->name,
                        'sort_order' => $img['sort_order'] ?? $sort++,
                    ]);
                }
            }

            // 3. Thêm các biến thể
            $variantCounter = 1;
            foreach ($request->variants as $var) {
                $sku = !empty($var['sku'])
                    ? trim($var['sku'])
                    : $this->generateUniqueSku($product->slug, $var['color'] ?? 'VAR', $variantCounter++);

                ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $sku,
                    'color' => trim($var['color']),
                    'material' => trim($var['material']),
                    'length_cm' => $var['length_cm'] ?? null,
                    'width_cm' => $var['width_cm'] ?? null,
                    'height_cm' => $var['height_cm'] ?? null,
                    'weight_kg' => $var['weight_kg'] ?? null,
                    'price' => (float) $var['price'],
                    'stock_quantity' => (int) $var['stock_quantity'],
                    'is_active' => isset($var['is_active']) ? (bool) $var['is_active'] : true,
                ]);
            }

            DB::commit();

            $product->load(['category', 'images', 'variants']);

            return response()->json([
                'status' => true,
                'message' => "Tạo sản phẩm '{$product->name}' thành công.",
                'data' => $this->formatProductDetail($product, 0),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tạo sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/admin/products/{id}
     * Cập nhật thông tin sản phẩm, đồng bộ hình ảnh và các biến thể
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $product = Product::with(['images', 'variants'])->find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm cần cập nhật.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:200',
            'slug' => 'nullable|string|max:191|unique:products,slug,' . $id,
            'brand' => 'nullable|string|max:100',
            'warranty_months' => 'nullable|integer|min:0',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',

            'images' => 'nullable|array',
            'images.*.image_url' => 'required_with:images|string',
            'images.*.alt_text' => 'nullable|string|max:200',
            'images.*.sort_order' => 'nullable|integer',

            'variants' => 'required|array|min:1',
            'variants.*.id' => 'nullable|integer',
            'variants.*.sku' => 'nullable|string|max:50',
            'variants.*.color' => 'required|string|max:50',
            'variants.*.material' => 'required|string|max:100',
            'variants.*.price' => 'required|numeric|min:0',
            'variants.*.stock_quantity' => 'required|integer|min:0',
            'variants.*.length_cm' => 'nullable|numeric|min:0',
            'variants.*.width_cm' => 'nullable|numeric|min:0',
            'variants.*.height_cm' => 'nullable|numeric|min:0',
            'variants.*.weight_kg' => 'nullable|numeric|min:0',
            'variants.*.is_active' => 'nullable|boolean',
        ], [
            'category_id.required' => 'Vui lòng chọn danh mục cho sản phẩm.',
            'category_id.exists' => 'Danh mục đã chọn không tồn tại.',
            'name.required' => 'Tên sản phẩm không được để trống.',
            'slug.unique' => 'Đường dẫn (slug) này đã được sử dụng.',
            'variants.required' => 'Sản phẩm phải có ít nhất một biến thể.',
            'variants.min' => 'Sản phẩm phải có ít nhất một biến thể.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();

        try {
            $name = trim($request->name);
            $slug = $request->filled('slug')
                ? Str::slug($request->slug)
                : $this->generateUniqueSlug($name, $id);

            // 1. Cập nhật thông tin chính của sản phẩm
            $product->category_id = $request->category_id;
            $product->name = $name;
            $product->slug = $slug;
            $product->brand = $request->filled('brand') ? trim($request->brand) : null;
            $product->warranty_months = $request->input('warranty_months', 12);
            $product->description = $request->input('description');
            $product->is_active = (bool) $request->is_active;
            $product->save();

            // 2. Đồng bộ hình ảnh (Nếu có truyền images thì làm mới danh sách ảnh)
            if ($request->has('images')) {
                $product->images()->delete();
                $sort = 0;
                foreach ($request->images as $img) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => trim($img['image_url']),
                        'alt_text' => $img['alt_text'] ?? $product->name,
                        'sort_order' => $img['sort_order'] ?? $sort++,
                    ]);
                }
            }

            // 3. Đồng bộ biến thể
            $incomingVariantIds = [];
            $variantCounter = 1;

            foreach ($request->variants as $var) {
                $sku = !empty($var['sku'])
                    ? trim($var['sku'])
                    : $this->generateUniqueSku($product->slug, $var['color'] ?? 'VAR', $variantCounter++);

                if (!empty($var['id'])) {
                    // Cập nhật biến thể đã có
                    $existingVariant = ProductVariant::where('product_id', $product->id)->find($var['id']);
                    if ($existingVariant) {
                        $existingVariant->update([
                            'sku' => $sku,
                            'color' => trim($var['color']),
                            'material' => trim($var['material']),
                            'length_cm' => $var['length_cm'] ?? null,
                            'width_cm' => $var['width_cm'] ?? null,
                            'height_cm' => $var['height_cm'] ?? null,
                            'weight_kg' => $var['weight_kg'] ?? null,
                            'price' => (float) $var['price'],
                            'stock_quantity' => (int) $var['stock_quantity'],
                            'is_active' => isset($var['is_active']) ? (bool) $var['is_active'] : true,
                        ]);
                        $incomingVariantIds[] = $existingVariant->id;
                    }
                } else {
                    // Tạo mới biến thể
                    $newVariant = ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $sku,
                        'color' => trim($var['color']),
                        'material' => trim($var['material']),
                        'length_cm' => $var['length_cm'] ?? null,
                        'width_cm' => $var['width_cm'] ?? null,
                        'height_cm' => $var['height_cm'] ?? null,
                        'weight_kg' => $var['weight_kg'] ?? null,
                        'price' => (float) $var['price'],
                        'stock_quantity' => (int) $var['stock_quantity'],
                        'is_active' => isset($var['is_active']) ? (bool) $var['is_active'] : true,
                    ]);
                    $incomingVariantIds[] = $newVariant->id;
                }
            }

            // Xử lý các biến thể cũ không còn trong danh sách gửi lên
            $removedVariants = ProductVariant::where('product_id', $product->id)
                ->whereNotIn('id', $incomingVariantIds)
                ->get();

            foreach ($removedVariants as $rem) {
                // RÀNG BUỘC: Nếu biến thể này đã có đơn hàng thì chỉ tắt is_active chứ không xóa cứng
                if ($rem->orderItems()->exists()) {
                    $rem->update(['is_active' => false]);
                } else {
                    $rem->cartItems()->delete();
                    $rem->delete();
                }
            }

            DB::commit();

            $product->refresh();
            $product->load(['category', 'images', 'variants']);

            $soldCount = (int) OrderItem::whereIn('variant_id', $product->variants->pluck('id')->toArray())
                ->whereHas('order', fn($q) => $q->where('status', 'completed'))
                ->sum('quantity');

            return response()->json([
                'status' => true,
                'message' => "Cập nhật sản phẩm '{$product->name}' thành công.",
                'data' => $this->formatProductDetail($product, $soldCount),
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/products/{id}/status
     * Bật / Tắt nhanh trạng thái hiển thị của sản phẩm
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'is_active' => 'required|boolean',
        ], [
            'is_active.required' => 'Vui lòng cung cấp trạng thái hiển thị (true hoặc false).',
            'is_active.boolean' => 'Trạng thái hiển thị phải là kiểu boolean.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $product = Product::with(['category', 'images', 'variants'])->find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm.',
            ], 404);
        }

        try {
            $product->is_active = (bool) $request->is_active;
            $product->save();

            $statusText = $product->is_active ? 'Hiển thị' : 'Ẩn';

            return response()->json([
                'status' => true,
                'message' => "Đã chuyển trạng thái sản phẩm sang '{$statusText}' thành công.",
                'data' => $this->formatProductSummary($product),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/products/{productId}/variants/{variantId}/stock
     * Cập nhật nhanh số lượng tồn kho của một biến thể (dùng cho quản lý kho nhanh)
     */
    public function updateVariantStock(Request $request, int $productId, int $variantId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'stock_quantity' => 'required|integer|min:0',
        ], [
            'stock_quantity.required' => 'Vui lòng cung cấp số lượng tồn kho mới.',
            'stock_quantity.integer' => 'Số lượng tồn kho phải là số nguyên.',
            'stock_quantity.min' => 'Số lượng tồn kho không được nhỏ hơn 0.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $variant = ProductVariant::where('product_id', $productId)->find($variantId);

        if (!$variant) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy biến thể sản phẩm.',
            ], 404);
        }

        try {
            $variant->stock_quantity = (int) $request->stock_quantity;
            $variant->save();

            return response()->json([
                'status' => true,
                'message' => "Đã cập nhật tồn kho biến thể '{$variant->sku}' thành {$variant->stock_quantity}.",
                'data' => [
                    'variant_id' => $variant->id,
                    'sku' => $variant->sku,
                    'stock_quantity' => $variant->stock_quantity,
                    'color' => $variant->color,
                    'material' => $variant->material,
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật tồn kho: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/admin/products/{id}
     * Xóa sản phẩm (Ràng buộc: Không được xóa nếu các biến thể của sản phẩm đã có đơn hàng)
     */
    public function destroy(int $id): JsonResponse
    {
        $product = Product::with('variants')->find($id);

        if (!$product) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy sản phẩm để xóa.',
            ], 404);
        }

        $variantIds = $product->variants->pluck('id')->toArray();

        // RÀNG BUỘC TOÀN VẸN: Kiểm tra xem có đơn hàng nào chứa sản phẩm này không
        $hasOrders = OrderItem::whereIn('variant_id', $variantIds)->exists();

        if ($hasOrders) {
            return response()->json([
                'status' => false,
                'message' => "Không thể xóa sản phẩm '{$product->name}' vì đã có dữ liệu đơn hàng trong hệ thống. Vui lòng chuyển trạng thái sang 'Ẩn' (is_active = false) thay vì xóa để bảo toàn dữ liệu lịch sử hóa đơn.",
            ], 400);
        }

        DB::beginTransaction();

        try {
            // Xóa hình ảnh
            $product->images()->delete();

            // Xóa giỏ hàng liên quan và biến thể
            foreach ($product->variants as $variant) {
                $variant->cartItems()->delete();
                $variant->delete();
            }

            $productName = $product->name;
            $product->delete();

            DB::commit();

            return response()->json([
                'status' => true,
                'message' => "Xóa sản phẩm '{$productName}' thành công.",
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/admin/products/upload-image
     * Upload hình ảnh sản phẩm trực tiếp từ máy tính lên server
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120', // Tối đa 5MB
        ], [
            'image.required' => 'Vui lòng chọn tệp hình ảnh để tải lên.',
            'image.image' => 'Tệp tải lên phải là hình ảnh hợp lệ.',
            'image.mimes' => 'Hình ảnh chỉ hỗ trợ định dạng: jpeg, png, jpg, webp, gif.',
            'image.max' => 'Dung lượng hình ảnh không được vượt quá 5MB.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Hình ảnh không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $file = $request->file('image');
            $fileName = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $destinationPath = public_path('uploads/products');

            if (!File::isDirectory($destinationPath)) {
                File::makeDirectory($destinationPath, 0755, true, true);
            }

            $file->move($destinationPath, $fileName);

            $relativePath = '/uploads/products/' . $fileName;
            $fullUrl = url($relativePath);

            return response()->json([
                'status' => true,
                'message' => 'Tải lên hình ảnh thành công.',
                'data' => [
                    'image_url' => $relativePath,
                    'full_url' => $fullUrl,
                    'file_name' => $fileName,
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải lên hình ảnh: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Tự sinh slug duy nhất từ tên sản phẩm
     */
    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (Product::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Tự sinh mã SKU duy nhất cho biến thể nếu để trống
     */
    private function generateUniqueSku(string $productSlug, string $color, int $counter = 1): string
    {
        $prefix = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $productSlug), 0, 6));
        $colorCode = strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', Str::slug($color)), 0, 3));
        if (empty($colorCode)) {
            $colorCode = 'VAR';
        }

        $sku = "{$prefix}-{$colorCode}-" . str_pad((string) $counter, 2, '0', STR_PAD_LEFT);

        while (ProductVariant::where('sku', $sku)->exists()) {
            $sku = "{$prefix}-{$colorCode}-" . strtoupper(Str::random(4));
        }

        return $sku;
    }

    /**
     * Định dạng dữ liệu hiển thị tóm tắt trên bảng danh sách
     */
    private function formatProductSummary(Product $product): array
    {
        $variants = $product->variants;
        $prices = $variants->pluck('price');
        $minPrice = $prices->min() ?? 0;
        $maxPrice = $prices->max() ?? 0;
        $totalStock = (int) $variants->sum('stock_quantity');

        $priceDisplay = ($minPrice === $maxPrice)
            ? number_format((float) $minPrice, 0, ',', '.') . '₫'
            : number_format((float) $minPrice, 0, ',', '.') . '₫ - ' . number_format((float) $maxPrice, 0, ',', '.') . '₫';

        $stockStatus = 'out_of_stock';
        $stockStatusLabel = 'Hết hàng';
        if ($totalStock > 5) {
            $stockStatus = 'in_stock';
            $stockStatusLabel = 'Còn hàng';
        } elseif ($totalStock > 0) {
            $stockStatus = 'low_stock';
            $stockStatusLabel = 'Sắp hết hàng';
        }

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'brand' => $product->brand,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'thumbnail' => $product->images->first()?->image_url ?? '/images/placeholder.jpg',
            'images_count' => $product->images->count(),
            'variants_count' => $variants->count(),
            'total_stock' => $totalStock,
            'stock_status' => $stockStatus,
            'stock_status_label' => $stockStatusLabel,
            'min_price' => (float) $minPrice,
            'max_price' => (float) $maxPrice,
            'price_display' => $priceDisplay,
            'is_active' => (bool) $product->is_active,
            'status_label' => $product->is_active ? 'Đang hiển thị' : 'Đang ẩn',
            'warranty_months' => $product->warranty_months,
            'created_at' => $product->created_at ? $product->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $product->created_at ? $product->created_at->format('d/m/Y H:i') : null,
        ];
    }

    /**
     * Định dạng dữ liệu hiển thị chi tiết cho màn hình xem & sửa sản phẩm
     */
    private function formatProductDetail(Product $product, int $soldCount = 0): array
    {
        $variants = $product->variants;
        $prices = $variants->pluck('price');
        $minPrice = $prices->min() ?? 0;
        $maxPrice = $prices->max() ?? 0;
        $totalStock = (int) $variants->sum('stock_quantity');

        return [
            'id' => $product->id,
            'category_id' => $product->category_id,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'name' => $product->name,
            'slug' => $product->slug,
            'brand' => $product->brand,
            'warranty_months' => $product->warranty_months,
            'description' => $product->description,
            'is_active' => (bool) $product->is_active,
            'status_label' => $product->is_active ? 'Đang hiển thị' : 'Đang ẩn',
            'stats' => [
                'total_stock' => $totalStock,
                'variants_count' => $variants->count(),
                'images_count' => $product->images->count(),
                'sold_count' => $soldCount,
                'min_price' => (float) $minPrice,
                'max_price' => (float) $maxPrice,
            ],
            'images' => $product->images->map(function ($img) {
                return [
                    'id' => $img->id,
                    'image_url' => $img->image_url,
                    'alt_text' => $img->alt_text,
                    'sort_order' => $img->sort_order,
                ];
            }),
            'variants' => $product->variants->map(function ($v) {
                $price = (float) $v->price;
                return [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'color' => $v->color,
                    'material' => $v->material,
                    'length_cm' => $v->length_cm ? (float) $v->length_cm : null,
                    'width_cm' => $v->width_cm ? (float) $v->width_cm : null,
                    'height_cm' => $v->height_cm ? (float) $v->height_cm : null,
                    'weight_kg' => $v->weight_kg ? (float) $v->weight_kg : null,
                    'dimensions_display' => ($v->length_cm && $v->width_cm && $v->height_cm)
                        ? "{$v->length_cm}x{$v->width_cm}x{$v->height_cm} cm"
                        : null,
                    'price' => $price,
                    'price_display' => number_format($price, 0, ',', '.') . '₫',
                    'stock_quantity' => (int) $v->stock_quantity,
                    'is_active' => (bool) $v->is_active,
                ];
            }),
            'created_at' => $product->created_at ? $product->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $product->created_at ? $product->created_at->format('d/m/Y H:i') : null,
            'updated_at' => $product->updated_at ? $product->updated_at->format('Y-m-d H:i:s') : null,
            'updated_at_display' => $product->updated_at ? $product->updated_at->format('d/m/Y H:i') : null,
        ];
    }
}
