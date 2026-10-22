<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductSearchTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = Category::create([
            'name' => 'Bàn Ăn Cao Cấp',
            'slug' => 'ban-an',
            'is_active' => true,
        ]);
    }

    /**
     * Test: Tìm kiếm sản phẩm theo tên qua query 'q' hoặc 'search'
     */
    public function test_can_search_products_by_name()
    {
        $p1 = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bàn Ăn Gỗ Sồi Bắc Âu',
            'slug' => 'ban-an-go-soi-bac-au',
            'brand' => 'Nordic Living',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $p1->id,
            'sku' => 'SKU-01',
            'color' => 'Nâu sồi',
            'material' => 'Gỗ sồi Nga',
            'price' => 8500000,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $p2 = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Sofa Da Thật Nhập Khẩu',
            'slug' => 'sofa-da-that-nhap-khau',
            'brand' => 'Florence Living',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $p2->id,
            'sku' => 'SKU-02',
            'color' => 'Xám khói',
            'material' => 'Da bò tự nhiên',
            'price' => 25000000,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        // 1. Tìm bằng param 'q'
        $responseQ = $this->getJson('/api/products?q=Gỗ Sồi');
        $responseQ->assertStatus(200);
        $this->assertCount(1, $responseQ->json('data'));
        $this->assertEquals($p1->id, $responseQ->json('data.0.id'));

        // 2. Tìm bằng param 'search'
        $responseSearch = $this->getJson('/api/products?search=Sofa');
        $responseSearch->assertStatus(200);
        $this->assertCount(1, $responseSearch->json('data'));
        $this->assertEquals($p2->id, $responseSearch->json('data.0.id'));
    }

    /**
     * Test: Tìm kiếm thông minh theo chất liệu hoặc màu sắc biến thể
     */
    public function test_can_search_products_by_variant_material_or_color()
    {
        $p = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bộ Bàn Ghế Hoàng Gia',
            'slug' => 'bo-ban-ghe-hoang-gia',
            'brand' => 'TK House',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $p->id,
            'sku' => 'SKU-HG-01',
            'color' => 'Vàng Champagne',
            'material' => 'Đá Ceramic Chống Xước',
            'price' => 30000000,
            'stock_quantity' => 8,
            'is_active' => true,
        ]);

        // Tìm theo chất liệu "Ceramic"
        $responseMaterial = $this->getJson('/api/products?q=Ceramic');
        $responseMaterial->assertStatus(200);
        $this->assertCount(1, $responseMaterial->json('data'));
        $this->assertEquals($p->id, $responseMaterial->json('data.0.id'));

        // Tìm theo màu sắc "Champagne"
        $responseColor = $this->getJson('/api/products?q=Champagne');
        $responseColor->assertStatus(200);
        $this->assertCount(1, $responseColor->json('data'));
        $this->assertEquals($p->id, $responseColor->json('data.0.id'));
    }

    /**
     * Test: API gợi ý tìm kiếm nhanh (search-suggestions)
     */
    public function test_search_suggestions_api()
    {
        $p = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bàn Trà Sofa Tròn Đôi',
            'slug' => 'ban-tra-sofa-tron-doi',
            'brand' => 'TK House',
            'is_active' => true,
        ]);

        ProductImage::create([
            'product_id' => $p->id,
            'image_url' => 'https://example.com/bantra.jpg',
            'sort_order' => 0,
        ]);

        ProductVariant::create([
            'product_id' => $p->id,
            'sku' => 'SKU-BT-01',
            'color' => 'Trắng',
            'material' => 'Mặt kính cường lực',
            'price' => 4500000,
            'stock_quantity' => 12,
            'is_active' => true,
        ]);

        // Gợi ý khi có từ khóa
        $response = $this->getJson('/api/products/search-suggestions?q=Bàn Trà');
        $response->assertStatus(200)
            ->assertJson([
                'status' => true,
            ])
            ->assertJsonStructure([
                'status',
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'slug',
                        'price',
                        'price_display',
                        'thumbnail',
                    ]
                ]
            ]);

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($p->name, $response->json('data.0.name'));

        // Gợi ý khi rỗng trả về mảng trống
        $responseEmpty = $this->getJson('/api/products/search-suggestions?q=');
        $responseEmpty->assertStatus(200);
        $this->assertEquals([], $responseEmpty->json('data'));
    }

    /**
     * Test: Sản phẩm bị ẩn (is_active = false) không được xuất hiện trong kết quả tìm kiếm
     */
    public function test_inactive_products_are_not_returned_in_search()
    {
        $inactiveProduct = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Ghế Sofa Cũ Bị Ẩn',
            'slug' => 'ghe-sofa-cu-bi-an',
            'brand' => 'TK House',
            'is_active' => false,
        ]);

        ProductVariant::create([
            'product_id' => $inactiveProduct->id,
            'sku' => 'SKU-INACTIVE',
            'color' => 'Nâu',
            'material' => 'Nỉ',
            'price' => 1000000,
            'stock_quantity' => 2,
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/products?q=Sofa Cũ');
        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));

        $suggestionResponse = $this->getJson('/api/products/search-suggestions?q=Sofa Cũ');
        $suggestionResponse->assertStatus(200);
        $this->assertCount(0, $suggestionResponse->json('data'));
    }

    /**
     * Test: Hỗ trợ tìm kiếm Unicode Tổ Hợp (NFD) từ các bộ gõ Unikey / Telex
     */
    public function test_supports_unicode_nfd_input()
    {
        $p = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bàn Gỗ Sồi Bắc Âu',
            'slug' => 'ban-go-soi-bac-au',
            'brand' => 'TK House',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $p->id,
            'sku' => 'SKU-GO',
            'color' => 'Nâu',
            'material' => 'Gỗ sồi',
            'price' => 5000000,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        // Gõ "gỗ" bằng NFD (Unicode tổ hợp)
        $nfdQuery = \Normalizer::normalize('gỗ', \Normalizer::FORM_D);

        $response = $this->getJson('/api/products?q=' . urlencode($nfdQuery));
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));

        $sugResponse = $this->getJson('/api/products/search-suggestions?q=' . urlencode($nfdQuery));
        $sugResponse->assertStatus(200);
        $this->assertCount(1, $sugResponse->json('data'));
    }

    /**
     * Test: Tìm kiếm linh hoạt đa từ khóa không liền nhau (ví dụ: "bàn sồi")
     */
    public function test_flexible_multi_word_search()
    {
        $p = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Bàn Tròn Cao Cấp Gỗ Sồi',
            'slug' => 'ban-tron-cao-cap-go-soi',
            'brand' => 'TK House',
            'is_active' => true,
        ]);

        ProductVariant::create([
            'product_id' => $p->id,
            'sku' => 'SKU-MULTI',
            'color' => 'Nâu',
            'material' => 'Gỗ tự nhiên',
            'price' => 7000000,
            'stock_quantity' => 3,
            'is_active' => true,
        ]);

        // Từ "bàn" và "sồi" không đứng liền nhau trong tên
        $response = $this->getJson('/api/products?q=bàn sồi');
        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));

        // Không dấu: "ban soi"
        $responseUnaccented = $this->getJson('/api/products?q=ban soi');
        $responseUnaccented->assertStatus(200);
        $this->assertCount(1, $responseUnaccented->json('data'));
    }
}
