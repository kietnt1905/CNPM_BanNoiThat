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

            // 1. Lọc theo danh mục (ID hoặc Slug hoặc Group)
            if ($request->filled('category')) {
                $categoryParam = $request->query('category');
                if ($categoryParam === 'ban') {
                    $query->whereHas('category', function ($q) {
                        $q->whereIn('slug', ['ban-an', 'ban-tra', 'ban-lam-viec', 'ban-trang-diem']);
                    });
                } elseif ($categoryParam === 'sofa' || $categoryParam === 'ghe') {
                    $query->whereHas('category', function ($q) {
                        $q->whereIn('slug', ['sofa-da', 'sofa-vai', 'ghe-thu-gian', 'ghe-an']);
                    });
                } elseif ($categoryParam === 'phong-ngu') {
                    $query->whereHas('category', function ($q) {
                        $q->whereIn('slug', ['giuong-ngu', 'tu-ke', 'phong-ngu']);
                    });
                } elseif ($categoryParam === 'phong-khach') {
                    $query->whereHas('category', function ($q) {
                        $q->whereIn('slug', ['sofa-da', 'sofa-vai', 'ban-tra', 'ghe-thu-gian']);
                    });
                } elseif ($categoryParam === 'phong-an') {
                    $query->whereHas('category', function ($q) {
                        $q->whereIn('slug', ['ban-an', 'ghe-an']);
                    });
                } else {
                    $query->whereHas('category', function ($q) use ($categoryParam) {
                        $q->where('id', $categoryParam)
                          ->orWhere('slug', $categoryParam);
                    });
                }
            }

            // 1.5. Lọc theo bộ sưu tập (Collection)
            if ($request->filled('collection')) {
                $collectionParam = mb_strtolower($request->query('collection'), 'UTF-8');
                $collectionKeywords = [
                    'victoria' => ['victoria', 'hoang-gia', 'elegance', 'tuscany', 'soi'],
                    'valencia' => ['valencia', 'calacatta', 'ceramic', 'marble', 'boucle', 'pvd', 'monaco'],
                    'moretti' => ['moretti', 'artisan', 'oc-cho', 'atelier', 'pro-desk', 'rotunda', 'japandi'],
                ];
                $keywords = $collectionKeywords[$collectionParam] ?? [$collectionParam];
                $query->where(function ($q) use ($keywords, $collectionParam) {
                    $q->where('name', 'like', "%{$collectionParam}%")
                      ->orWhere('slug', 'like', "%{$collectionParam}%");
                    foreach ($keywords as $kw) {
                        $q->orWhere('name', 'like', "%{$kw}%")
                          ->orWhere('slug', 'like', "%{$kw}%");
                    }
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
     * Trả về:
     * - Thông tin chi tiết bàn/ghế
     * - Thông số kỹ thuật (Kích thước Dài x Rộng x Cao, chất liệu, màu sắc, bảo hành, tồn kho)
     * - Danh sách ảnh phụ (product_images)
     * - 4–6 sản phẩm liên quan (cùng category_id, trừ sản phẩm đang xem)
     */
    public function show(Request $request, $idOrSlug)
    {
        try {
            $product = Product::where('is_active', true)
                ->where(function ($q) use ($idOrSlug) {
                    $q->where('id', $idOrSlug)
                      ->orWhere('slug', $idOrSlug);
                })
                ->with([
                    'category',
                    'images' => function ($q) {
                        $q->orderBy('sort_order', 'asc');
                    },
                    'variants' => function ($q) {
                        $q->where('is_active', true);
                    }
                ])
                ->first();

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm',
                ], 404);
            }

            // 1. Tính toán giá và tồn kho tổng quan
            $minPrice = (float) ($product->variants->min('price') ?? 0);
            $maxPrice = (float) ($product->variants->max('price') ?? 0);
            $totalStock = (int) $product->variants->sum('stock_quantity');
            $firstVariant = $product->variants->first();

            // 2. Danh sách ảnh (product_images)
            $allImages = $product->images->map(function ($img, $index) {
                return [
                    'id' => $img->id,
                    'image_url' => $img->image_url,
                    'url' => $img->image_url,
                    'alt_text' => $img->alt_text,
                    'alt' => $img->alt_text,
                    'sort_order' => (int) $img->sort_order,
                    'is_primary' => $index === 0,
                ];
            });

            $firstImageItem = $allImages->first();
            $primaryImage = $firstImageItem ? $firstImageItem['image_url'] : '/images/placeholder.jpg';
            // Danh sách ảnh phụ (loại bỏ ảnh đại diện đầu tiên)
            $secondaryImages = $allImages->slice(1)->values();

            // 3. Chuẩn hóa biến thể (variants) với chi tiết kích thước D x R x C
            $variants = $product->variants->map(function ($v) {
                $hasDimensions = $v->length_cm || $v->width_cm || $v->height_cm;
                $dimensionsFormatted = $hasDimensions
                    ? "Dài {$v->length_cm} cm × Rộng {$v->width_cm} cm × Cao {$v->height_cm} cm"
                    : 'Đang cập nhật';
                $dimensionsCompact = $hasDimensions
                    ? "{$v->length_cm}x{$v->width_cm}x{$v->height_cm} cm"
                    : null;

                return [
                    'id' => $v->id,
                    'sku' => $v->sku,
                    'color' => $v->color,
                    'material' => $v->material,
                    'price' => (float) $v->price,
                    'price_display' => number_format($v->price, 0, ',', '.') . '₫',
                    'stock_quantity' => (int) $v->stock_quantity,
                    'in_stock' => $v->stock_quantity > 0,
                    'length_cm' => $v->length_cm ? (float) $v->length_cm : null,
                    'width_cm' => $v->width_cm ? (float) $v->width_cm : null,
                    'height_cm' => $v->height_cm ? (float) $v->height_cm : null,
                    'weight_kg' => $v->weight_kg ? (float) $v->weight_kg : null,
                    'dimensions' => $dimensionsCompact,
                    'dimensions_formatted' => $dimensionsFormatted,
                    'is_active' => (bool) $v->is_active,
                ];
            });

            // 4. Thông số kỹ thuật chi tiết (Specifications)
            $specDimensions = ($firstVariant && ($firstVariant->length_cm || $firstVariant->width_cm || $firstVariant->height_cm))
                ? "Dài {$firstVariant->length_cm} cm × Rộng {$firstVariant->width_cm} cm × Cao {$firstVariant->height_cm} cm"
                : 'Đang cập nhật';

            $specifications = [
                'dimensions' => $specDimensions,
                'dimensions_detail' => [
                    'length_cm' => $firstVariant?->length_cm ? (float) $firstVariant->length_cm : null,
                    'width_cm' => $firstVariant?->width_cm ? (float) $firstVariant->width_cm : null,
                    'height_cm' => $firstVariant?->height_cm ? (float) $firstVariant->height_cm : null,
                    'weight_kg' => $firstVariant?->weight_kg ? (float) $firstVariant->weight_kg : null,
                    'formatted' => $specDimensions,
                ],
                'material' => $firstVariant?->material ?? 'Vật liệu cao cấp',
                'color' => $firstVariant?->color ?? 'Tiêu chuẩn',
                'warranty' => $product->warranty_months ? "{$product->warranty_months} tháng" : '12 tháng',
                'warranty_months' => (int) $product->warranty_months,
                'stock_quantity' => $totalStock,
                'in_stock' => $totalStock > 0,
                'brand' => $product->brand ?? 'TK House',
                'sku' => $firstVariant?->sku ?? 'N/A',
                'available_colors' => $product->variants->pluck('color')->unique()->filter()->values(),
                'available_materials' => $product->variants->pluck('material')->unique()->filter()->values(),
            ];

            // 5. Truy vấn 4–6 sản phẩm liên quan (cùng category_id, trừ sản phẩm đang xem)
            $relatedLimit = (int) $request->query('related_limit', 6);
            if ($relatedLimit < 4) {
                $relatedLimit = 4;
            } elseif ($relatedLimit > 10) {
                $relatedLimit = 6;
            }

            $relatedProducts = $this->getRelatedProducts($product, $relatedLimit);

            // 6. Dữ liệu chi tiết trả về
            $data = [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'brand' => $product->brand,
                'description' => $product->description,
                'warranty_months' => (int) $product->warranty_months,
                'category_id' => $product->category_id,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                    'description' => $product->category->description,
                ] : null,
                'min_price' => $minPrice,
                'max_price' => $maxPrice,
                'price' => $minPrice,
                'price_display' => number_format($minPrice, 0, ',', '.') . '₫',
                'in_stock' => $totalStock > 0,
                'total_stock' => $totalStock,
                'stock_quantity' => $totalStock,
                'specifications' => $specifications,
                'specs' => $specifications,
                'primary_image' => $primaryImage,
                'images' => $allImages,
                'product_images' => $allImages,
                'secondary_images' => $secondaryImages,
                'variants' => $variants,
                'related_products' => $relatedProducts,
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at,
            ];

            return response()->json([
                'status' => true,
                'message' => 'Lấy thông tin chi tiết sản phẩm thành công',
                'data' => $data,
                'related_products' => $relatedProducts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API GET /api/products/{idOrSlug}/related
     * Lấy 4–6 sản phẩm liên quan của một sản phẩm (cùng category_id, trừ sản phẩm đang xem)
     */
    public function related(Request $request, $idOrSlug)
    {
        try {
            $product = Product::where('is_active', true)
                ->where(function ($q) use ($idOrSlug) {
                    $q->where('id', $idOrSlug)
                      ->orWhere('slug', $idOrSlug);
                })
                ->first();

            if (!$product) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy sản phẩm',
                ], 404);
            }

            $limit = (int) $request->query('limit', 6);
            if ($limit < 4) {
                $limit = 4;
            } elseif ($limit > 10) {
                $limit = 6;
            }

            $relatedProducts = $this->getRelatedProducts($product, $limit);

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách sản phẩm liên quan thành công',
                'data' => $relatedProducts,
                'total' => $relatedProducts->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Helper truy vấn 4-6 sản phẩm liên quan (cùng category_id, trừ sản phẩm đang xem)
     */
    public function getRelatedProducts($product, $limit = 6)
    {
        // 1. Truy vấn sản phẩm cùng category_id, loại trừ sản phẩm hiện tại
        $related = Product::where('is_active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'images', 'variants' => function ($q) {
                $q->where('is_active', true);
            }])
            ->latest()
            ->take($limit)
            ->get();

        // 2. Nếu cùng category_id có ít hơn 4 sản phẩm, bổ sung thêm các sản phẩm khác
        // để đảm bảo luôn trả về ít nhất 4–6 sản phẩm liên quan cho frontend
        if ($related->count() < 4) {
            $needed = 4 - $related->count();
            $excludeIds = $related->pluck('id')->push($product->id)->all();

            $fallback = Product::where('is_active', true)
                ->whereNotIn('id', $excludeIds)
                ->with(['category', 'images', 'variants' => function ($q) {
                    $q->where('is_active', true);
                }])
                ->latest()
                ->take($needed)
                ->get();

            $related = $related->concat($fallback);
        }

        return $related->map(function ($item) {
            return $this->formatProductSummary($item);
        });
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
        $firstVariant = $product->variants->where('is_active', true)->first() ?? $product->variants->first();
        $minPrice = $product->variants->where('is_active', true)->min('price') ?? ($product->variants->min('price') ?? 0);
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

        // Xác định collection từ tên hoặc slug
        $nameLower = mb_strtolower($product->name, 'UTF-8');
        $productSlugLower = mb_strtolower($product->slug, 'UTF-8');
        $collection = '';
        if (str_contains($nameLower, 'victoria') || str_contains($productSlugLower, 'victoria') || str_contains($nameLower, 'tuscany')) {
            $collection = 'victoria';
        } elseif (str_contains($nameLower, 'valencia') || str_contains($productSlugLower, 'valencia') || str_contains($nameLower, 'calacatta')) {
            $collection = 'valencia';
        } elseif (str_contains($nameLower, 'moretti') || str_contains($productSlugLower, 'moretti') || str_contains($nameLower, 'atelier')) {
            $collection = 'moretti';
        } elseif (str_contains($nameLower, 'osaka') || str_contains($productSlugLower, 'osaka')) {
            $collection = 'osaka';
        } elseif (str_contains($nameLower, 'elegance') || str_contains($productSlugLower, 'elegance')) {
            $collection = 'elegance';
        } elseif (str_contains($nameLower, 'coastal') || str_contains($productSlugLower, 'coastal') || str_contains($nameLower, 'nordic')) {
            $collection = 'coastal';
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
            'collection' => $collection,
            'price' => $minPrice,
            'price_display' => number_format($minPrice, 0, ',', '.') . '₫',
            'priceDisplay' => number_format($minPrice, 0, ',', '.') . '₫',
            'image' => $firstImage ?: '/images/placeholder.jpg',
            'secondaryImage' => $secondaryImage,
            'secondary_image' => $secondaryImage,
            'inStock' => $totalStock > 0,
            'in_stock' => $totalStock > 0,
            'variants_count' => $product->variants->count(),
            'default_variant_id' => $firstVariant?->id,
            'variant_id' => $firstVariant?->id,
            'first_variant_id' => $firstVariant?->id,
            'stock_quantity' => $firstVariant?->stock_quantity ?? $totalStock,
            'description' => $product->description,
            'material' => $material,
            'materialType' => $materialType,
            'dimensions' => $dimensions,
            'rating' => 4.9,
            'tag' => 'Mới Ra Mắt',
        ];
    }
}

