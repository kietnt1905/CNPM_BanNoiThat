<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Lấy danh sách sản phẩm (có phân trang, tìm kiếm, lọc theo danh mục, sắp xếp)
     */
    public function index(Request $request)
    {
        try {
            $query = Product::where('is_active', true)
                ->with(['category', 'images', 'variants']);

            // 1. Lọc theo danh mục (ID hoặc Slug)
            if ($request->filled('category')) {
                $categoryParam = $request->query('category');
                $query->whereHas('category', function ($q) use ($categoryParam) {
                    $q->where('id', $categoryParam)
                      ->orWhere('slug', $categoryParam);
                });
            }

            // 2. Tìm kiếm theo tên hoặc mô tả
            if ($request->filled('search')) {
                $search = $request->query('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // 3. Lọc theo khoảng giá (dựa trên giá variant)
            if ($request->filled('min_price')) {
                $query->whereHas('variants', function ($q) use ($request) {
                    $q->where('price', '>=', (float) $request->query('min_price'));
                });
            }
            if ($request->filled('max_price')) {
                $query->whereHas('variants', function ($q) use ($request) {
                    $q->where('price', '<=', (float) $request->query('max_price'));
                });
            }

            // 4. Sắp xếp
            $sort = $request->query('sort', 'newest');
            switch ($sort) {
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;
                case 'price_asc':
                    $query->withMin('variants', 'price')->orderBy('variants_min_price', 'asc');
                    break;
                case 'price_desc':
                    $query->withMax('variants', 'price')->orderBy('variants_max_price', 'desc');
                    break;
                case 'newest':
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            $perPage = (int) $request->query('per_page', 12);
            $paginator = $query->paginate($perPage);

            // 5. Chuẩn hóa format dữ liệu tiện lợi cho Frontend hiển thị
            $items = collect($paginator->items())->map(function ($product) {
                return $this->formatProductSummary($product);
            });

            return response()->json([
                'status' => true,
                'data' => $items,
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi lấy danh sách sản phẩm: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy chi tiết sản phẩm theo ID hoặc Slug
     */
    public function show($idOrSlug)
    {
        try {
            $product = Product::where('is_active', true)
                ->where(function ($q) use ($idOrSlug) {
                    $q->where('id', $idOrSlug)
                      ->orWhere('slug', $idOrSlug);
                })
                ->with(['category', 'images', 'variants' => function ($q) {
                    $q->where('is_active', true);
                }])
                ->first();

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm',
                ], 404);
            }

            $minPrice = $product->variants->min('price') ?? 0;
            $maxPrice = $product->variants->max('price') ?? 0;
            $totalStock = $product->variants->sum('stock_quantity');

            $data = [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'brand' => $product->brand,
                'description' => $product->description,
                'warranty_months' => $product->warranty_months,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                ] : null,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'price_display' => number_format($minPrice, 0, ',', '.') . '₫',
                'in_stock' => $totalStock > 0,
                'total_stock' => $totalStock,
                'images' => $product->images->map(function ($img) {
                    return [
                        'id' => $img->id,
                        'url' => $img->image_url,
                        'alt' => $img->alt_text,
                    ];
                }),
                'variants' => $product->variants->map(function ($v) {
                    return [
                        'id' => $v->id,
                        'sku' => $v->sku,
                        'color' => $v->color,
                        'material' => $v->material,
                        'price' => $v->price,
                        'price_display' => number_format($v->price, 0, ',', '.') . '₫',
                        'stock_quantity' => $v->stock_quantity,
                        'dimensions' => trim("{$v->length_cm}x{$v->width_cm}x{$v->height_cm} cm", 'x '),
                        'weight_kg' => $v->weight_kg,
                    ];
                }),
                'created_at' => $product->created_at,
            ];

            return response()->json([
                'status' => true,
                'data' => $data,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Sản phẩm nổi bật cho HomePage
     */
    public function featured()
    {
        try {
            $products = Product::where('is_active', true)
                ->with(['category', 'images', 'variants'])
                ->latest()
                ->take(8)
                ->get()
                ->map(function ($product) {
                    return $this->formatProductSummary($product);
                });

            return response()->json([
                'status' => true,
                'data' => $products,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper định dạng tóm tắt sản phẩm cho danh sách / card sản phẩm
     */
    private function formatProductSummary($product)
    {
        $firstVariant = $product->variants->first();
        $minPrice = $product->variants->min('price') ?? 0;
        $firstImage = $product->images->first()?->image_url;
        $secondaryImage = $product->images->skip(1)->first()?->image_url;
        $totalStock = $product->variants->sum('stock_quantity');

        // Xác định group từ category slug
        $catSlug = $product->category?->slug ?? '';
        $group = 'ban';
        if (in_array($catSlug, ['sofa-da', 'sofa-vai', 'ghe-thu-gian', 'ghe-an'])) {
            $group = 'sofa';
        } elseif (in_array($catSlug, ['giuong-ngu', 'tu-ke', 'phong-ngu'])) {
            $group = 'phong-ngu';
        }

        $dimensions = '';
        if ($firstVariant && ($firstVariant->length_cm || $firstVariant->width_cm || $firstVariant->height_cm)) {
            $dimensions = "D{$firstVariant->length_cm} × R{$firstVariant->width_cm} × C{$firstVariant->height_cm} cm";
        }

        $material = $firstVariant?->material ?? 'Vật liệu cao cấp';
        $materialLower = mb_strtolower($material, 'UTF-8');
        $materialType = 'wood';
        if (str_contains($materialLower, 'đá') || str_contains($materialLower, 'ceramic') || str_contains($materialLower, 'marble')) {
            $materialType = 'stone';
        } elseif (str_contains($materialLower, 'da bò') || str_contains($materialLower, 'da nappa') || str_contains($materialLower, 'da thật')) {
            $materialType = 'leather';
        } elseif (str_contains($materialLower, 'vải') || str_contains($materialLower, 'nỉ') || str_contains($materialLower, 'bouclé')) {
            $materialType = 'fabric';
        }

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'brand' => $product->brand,
            'category_id' => $product->category_id,
            'category_name' => $product->category?->name,
            'categoryName' => $product->category?->name,
            'category_slug' => $catSlug,
            'categorySlug' => $catSlug,
            'group' => $group,
            'price' => $minPrice,
            'price_display' => number_format($minPrice, 0, ',', '.') . '₫',
            'priceDisplay' => number_format($minPrice, 0, ',', '.') . '₫',
            'image' => $firstImage ?: '/images/placeholder.jpg',
            'secondaryImage' => $secondaryImage,
            'secondary_image' => $secondaryImage,
            'inStock' => $totalStock > 0,
            'in_stock' => $totalStock > 0,
            'variants_count' => $product->variants->count(),
            'description' => $product->description,
            'material' => $material,
            'materialType' => $materialType,
            'dimensions' => $dimensions,
            'rating' => 4.9,
            'tag' => 'Mới Ra Mắt',
        ];
    }
}

