<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /**
     * GET /api/admin/categories
     * Danh sách danh mục cho Admin (tìm kiếm, lọc trạng thái, đếm sản phẩm, phân trang hoặc lấy tất cả)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Category::query();

            // 1. Thống kê số lượng theo tabs
            $counts = [
                'total' => Category::count(),
                'active' => Category::where('is_active', true)->count(),
                'inactive' => Category::where('is_active', false)->count(),
            ];

            // 2. Lọc theo trạng thái is_active
            if ($request->filled('is_active') && $request->is_active !== 'all') {
                $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                if ($isActive !== null) {
                    $query->where('is_active', $isActive);
                }
            }

            // 3. Tìm kiếm theo tên hoặc slug
            if ($request->filled('q') || $request->filled('search')) {
                $keyword = trim($request->input('q', $request->input('search')));
                $query->where(function ($q) use ($keyword) {
                    $q->where('name', 'like', "%{$keyword}%")
                      ->orWhere('slug', 'like', "%{$keyword}%")
                      ->orWhere('description', 'like', "%{$keyword}%");
                });
            }

            // 4. Đếm số lượng sản phẩm liên kết
            $query->withCount([
                'products',
                'products as active_products_count' => function ($q) {
                    $q->where('is_active', true);
                },
            ]);

            // 5. Sắp xếp
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = strtolower($request->input('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

            $allowedSorts = ['id', 'name', 'created_at', 'products_count'];
            if (in_array($sortBy, $allowedSorts, true)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // 6. Trả về toàn bộ (cho dropdown chọn danh mục ở trang tạo sản phẩm) hoặc phân trang
            if ($request->boolean('all')) {
                $categories = $query->get()->map(fn($cat) => $this->formatCategory($cat));

                return response()->json([
                    'status' => true,
                    'message' => 'Lấy toàn bộ danh mục thành công.',
                    'counts' => $counts,
                    'data' => $categories,
                ]);
            }

            $perPage = max(1, min((int) $request->input('per_page', 15), 100));
            $categories = $query->paginate($perPage);

            $formattedCategories = $categories->map(fn($cat) => $this->formatCategory($cat));

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách danh mục thành công.',
                'counts' => $counts,
                'data' => $formattedCategories,
                'pagination' => [
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'per_page' => $categories->perPage(),
                    'total' => $categories->total(),
                    'from' => $categories->firstItem(),
                    'to' => $categories->lastItem(),
                ],
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải danh sách danh mục: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/admin/categories/{id}
     * Chi tiết danh mục kèm số lượng sản phẩm và danh sách sản phẩm mẫu
     */
    public function show(int|string $id): JsonResponse
    {
        try {
            $category = Category::withCount([
                'products',
                'products as active_products_count' => fn($q) => $q->where('is_active', true),
            ])
            ->where(function ($q) use ($id) {
                if (is_numeric($id)) {
                    $q->where('id', $id);
                } else {
                    $q->where('slug', $id);
                }
            })
            ->first();

            if (!$category) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy danh mục.',
                ], 404);
            }

            // Lấy 5 sản phẩm gần nhất thuộc danh mục này
            $recentProducts = $category->products()
                ->with(['images', 'variants'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($prod) {
                    $minPrice = $prod->variants->min('price') ?? 0;
                    return [
                        'id' => $prod->id,
                        'name' => $prod->name,
                        'slug' => $prod->slug,
                        'brand' => $prod->brand,
                        'is_active' => (bool) $prod->is_active,
                        'price_from' => (float) $minPrice,
                        'price_from_display' => number_format((float) $minPrice, 0, ',', '.') . '₫',
                        'image' => $prod->images->first()?->image_url ?? '/images/placeholder.jpg',
                        'variants_count' => $prod->variants->count(),
                    ];
                });

            $data = $this->formatCategory($category);
            $data['recent_products'] = $recentProducts;

            return response()->json([
                'status' => true,
                'message' => 'Lấy chi tiết danh mục thành công.',
                'data' => $data,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải chi tiết danh mục: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/admin/categories
     * Tạo danh mục mới
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:191|unique:categories,slug',
            'description' => 'nullable|string|max:1000',
            'is_active' => 'nullable|boolean',
        ], [
            'name.required' => 'Tên danh mục không được để trống.',
            'name.max' => 'Tên danh mục không được vượt quá 100 ký tự.',
            'slug.unique' => 'Đường dẫn (slug) này đã tồn tại, vui lòng chọn đường dẫn khác.',
            'slug.max' => 'Đường dẫn không được vượt quá 191 ký tự.',
            'description.max' => 'Mô tả không được vượt quá 1000 ký tự.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $name = trim($request->name);
            $slug = $request->filled('slug')
                ? Str::slug($request->slug)
                : $this->generateUniqueSlug($name);

            $category = Category::create([
                'name' => $name,
                'slug' => $slug,
                'description' => $request->filled('description') ? trim($request->description) : null,
                'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
            ]);

            return response()->json([
                'status' => true,
                'message' => "Tạo danh mục '{$category->name}' thành công.",
                'data' => $this->formatCategory($category),
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tạo danh mục: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/admin/categories/{id}
     * Cập nhật danh mục
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy danh mục cần cập nhật.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'slug' => 'nullable|string|max:191|unique:categories,slug,' . $id,
            'description' => 'nullable|string|max:1000',
            'is_active' => 'required|boolean',
        ], [
            'name.required' => 'Tên danh mục không được để trống.',
            'name.max' => 'Tên danh mục không được vượt quá 100 ký tự.',
            'slug.unique' => 'Đường dẫn (slug) này đã được sử dụng bởi danh mục khác.',
            'is_active.required' => 'Vui lòng xác định trạng thái hiển thị của danh mục.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $name = trim($request->name);
            $slug = $request->filled('slug')
                ? Str::slug($request->slug)
                : $this->generateUniqueSlug($name, $id);

            $category->name = $name;
            $category->slug = $slug;
            $category->description = $request->filled('description') ? trim($request->description) : null;
            $category->is_active = (bool) $request->is_active;
            $category->save();

            $category->loadCount([
                'products',
                'products as active_products_count' => fn($q) => $q->where('is_active', true),
            ]);

            return response()->json([
                'status' => true,
                'message' => "Cập nhật danh mục '{$category->name}' thành công.",
                'data' => $this->formatCategory($category),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật danh mục: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PATCH /api/admin/categories/{id}/status
     * Bật / Tắt trạng thái hoạt động của danh mục (Ẩn hoặc Hiển thị)
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

        $category = Category::find($id);

        if (!$category) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy danh mục.',
            ], 404);
        }

        try {
            $category->is_active = (bool) $request->is_active;
            $category->save();

            $statusText = $category->is_active ? 'Hiển thị' : 'Ẩn';

            return response()->json([
                'status' => true,
                'message' => "Đã chuyển trạng thái danh mục sang '{$statusText}' thành công.",
                'data' => $this->formatCategory($category),
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi cập nhật trạng thái danh mục: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/admin/categories/{id}
     * Xóa danh mục (Ràng buộc: Không được xóa nếu còn sản phẩm liên kết)
     */
    public function destroy(int $id): JsonResponse
    {
        $category = Category::withCount('products')->find($id);

        if (!$category) {
            return response()->json([
                'status' => false,
                'message' => 'Không tìm thấy danh mục cần xóa.',
            ], 404);
        }

        // RÀNG BUỘC TOÀN VẸN DỮ LIỆU: Không được xóa nếu còn sản phẩm
        if ($category->products_count > 0) {
            return response()->json([
                'status' => false,
                'message' => "Không thể xóa danh mục '{$category->name}' vì đang có {$category->products_count} sản phẩm liên kết. Vui lòng chuyển các sản phẩm sang danh mục khác hoặc chuyển trạng thái danh mục sang 'Ẩn' (is_active = false) thay vì xóa.",
            ], 400);
        }

        try {
            $name = $category->name;
            $category->delete();

            return response()->json([
                'status' => true,
                'message' => "Xóa danh mục '{$name}' thành công.",
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi xóa danh mục: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Tự động sinh slug duy nhất từ tên
     */
    private function generateUniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (Category::where('slug', $slug)
            ->when($ignoreId, fn($q) => $q->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }

    /**
     * Định dạng dữ liệu danh mục trả về
     */
    private function formatCategory(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'is_active' => (bool) $category->is_active,
            'status_label' => $category->is_active ? 'Đang hiển thị' : 'Đang ẩn',
            'products_count' => (int) ($category->products_count ?? 0),
            'active_products_count' => (int) ($category->active_products_count ?? 0),
            'created_at' => $category->created_at ? $category->created_at->format('Y-m-d H:i:s') : null,
            'created_at_display' => $category->created_at ? $category->created_at->format('d/m/Y H:i') : null,
            'updated_at' => $category->updated_at ? $category->updated_at->format('Y-m-d H:i:s') : null,
        ];
    }
}
