<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách danh mục (kèm số lượng sản phẩm)
     */
    public function index()
    {
        try {
            $categories = Category::where('is_active', true)
                ->withCount(['products' => function ($query) {
                    $query->where('is_active', true);
                }])
                ->get();

            return response()->json([
                'status' => true,
                'message' => 'Lấy danh sách danh mục thành công',
                'data' => $categories,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi khi tải danh mục: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Lấy chi tiết một danh mục theo ID hoặc Slug
     */
    public function show($idOrSlug)
    {
        try {
            $category = Category::where('is_active', true)
                ->where(function ($query) use ($idOrSlug) {
                    $query->where('id', $idOrSlug)
                          ->orWhere('slug', $idOrSlug);
                })
                ->first();

            if (!$category) {
                return response()->json([
                    'status' => false,
                    'message' => 'Không tìm thấy danh mục',
                ], 404);
            }

            return response()->json([
                'status' => true,
                'data' => $category,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Lỗi: ' . $e->getMessage(),
            ], 500);
        }
    }
}
