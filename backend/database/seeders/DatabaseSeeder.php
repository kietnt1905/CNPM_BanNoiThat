<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tạo tài khoản Admin & User mẫu
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Quản Trị Viên',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '0901234567',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 2. Tạo danh mục sản phẩm (Khớp với Frontend của Thịnh)
        $categories = [
            ['id' => 1, 'name' => 'Bàn ăn cao cấp', 'slug' => 'ban-an', 'description' => 'Mặt đá Ceramic chống ố, Gỗ óc chó FAS.'],
            ['id' => 2, 'name' => 'Bàn trà - Sofa', 'slug' => 'ban-tra', 'description' => 'Đá Marble Calacatta & Kim loại mạ PVD.'],
            ['id' => 3, 'name' => 'Bàn làm việc', 'slug' => 'ban-lam-viec', 'description' => 'Gỗ óc chó Bắc Mỹ & Thiết kế công thái học.'],
            ['id' => 4, 'name' => 'Bàn trang điểm', 'slug' => 'ban-trang-diem', 'description' => 'Gương Bỉ tráng bạc & Đường uốn lượn duyên dáng.'],
            ['id' => 5, 'name' => 'Sofa da thật', 'slug' => 'sofa-da', 'description' => 'Da bò Ý thuộc thảo mộc tự nhiên 100%.'],
            ['id' => 6, 'name' => 'Sofa vải nỉ', 'slug' => 'sofa-vai', 'description' => 'Vải len Bouclé nhập khẩu & Đệm lông vũ êm ái.'],
            ['id' => 7, 'name' => 'Ghế Armchair thư giãn', 'slug' => 'ghe-thu-gian', 'description' => 'Mây đan mắt cáo thủ công & Đệm lông vũ.'],
            ['id' => 8, 'name' => 'Ghế ăn sang trọng', 'slug' => 'ghe-an', 'description' => 'Da Nappa cao cấp, tựa cong ôm trọn cơ thể.'],
            ['id' => 9, 'name' => 'Giường ngủ Master', 'slug' => 'giuong-ngu', 'description' => 'Gỗ sồi khối và gỗ óc chó nâng niu giấc ngủ.'],
            ['id' => 10, 'name' => 'Tab & Tủ kệ cao cấp', 'slug' => 'tu-ke', 'description' => 'Cánh kính khói & Phụ kiện Hafele giảm chấn.'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['slug' => $cat['slug']],
                [
                    'name' => $cat['name'],
                    'description' => $cat['description'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // Lấy lại danh sách ID theo slug
        $catIds = DB::table('categories')->pluck('id', 'slug');

        // 3. Danh sách sản phẩm mẫu chuẩn
        $productsSeed = [
            // Bàn ăn
            [
                'category_slug' => 'ban-an',
                'name' => 'Bộ Bàn Ăn Hoàng Gia Elegance 8 Chỗ Mặt Đá',
                'slug' => 'bo-ban-an-hoang-gia-elegance-8-cho-mat-da',
                'brand' => 'TK House',
                'description' => 'Mặt đá Ceramic Nano tôi luyện nhiệt độ 1200°C chống xước vĩnh cửu và chân gỗ óc chó nguyên khối.',
                'warranty_months' => 36,
                'price' => 46500000,
                'stock' => 10,
                'sku' => 'BA-ELG-01',
                'color' => 'Nâu óc chó',
                'material' => 'Mặt đá Ceramic Nano & Gỗ Óc Chó FAS',
                'dimensions' => ['length' => 220, 'width' => 95, 'height' => 75],
                'images' => [
                    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-an',
                'name' => 'Bàn Ăn Mở Rộng Thông Minh Calacatta Gold',
                'slug' => 'ban-an-mo-rong-thong-minh-calacatta-gold',
                'brand' => 'TK House',
                'description' => 'Bàn mở rộng thông minh với thanh trượt êm ái, mặt đá thiêu kết Calacatta sang trọng.',
                'warranty_months' => 24,
                'price' => 24900000,
                'stock' => 15,
                'sku' => 'BA-CAL-02',
                'color' => 'Trắng vân mây vàng',
                'material' => 'Đá Thiêu Kết Calacatta & Khung Titan Mạ PVD',
                'dimensions' => ['length' => 240, 'width' => 90, 'height' => 75],
                'images' => [
                    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // Bàn trà
            [
                'category_slug' => 'ban-tra',
                'name' => 'Bàn Trà Đôi Mặt Đá Marble Calacatta Elegance',
                'slug' => 'ban-tra-doi-mat-da-marble-calacatta-elegance',
                'brand' => 'TK House',
                'description' => 'Sự kết hợp hoàn hảo giữa những đường vân mây Calacatta mềm mại và khung Titan mạ vàng sang trọng.',
                'warranty_months' => 24,
                'price' => 11500000,
                'stock' => 18,
                'sku' => 'BT-CAL-01',
                'color' => 'Vàng Champagne & Trắng',
                'material' => 'Đá Marble Calacatta & Khung Titan Mạ Vàng',
                'dimensions' => ['length' => 90, 'width' => 90, 'height' => 45],
                'images' => [
                    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-tra',
                'name' => 'Bàn Tròn Cà Phê Gỗ Óc Chó Nghệ Thuật',
                'slug' => 'ban-tron-ca-phe-go-oc-cho-nghe-thuat',
                'brand' => 'TK House',
                'description' => 'Thiết kế tinh xảo từ gỗ óc chó FAS tự nhiên và dầu lau hữu cơ an toàn cho gia đình.',
                'warranty_months' => 24,
                'price' => 8600000,
                'stock' => 12,
                'sku' => 'BT-WAL-02',
                'color' => 'Nâu gỗ óc chó',
                'material' => 'Gỗ Óc Chó FAS Tự Nhiên & Dầu Lau Hữu Cơ',
                'dimensions' => ['length' => 75, 'width' => 75, 'height' => 42],
                'images' => [
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // Bàn làm việc
            [
                'category_slug' => 'ban-lam-viec',
                'name' => 'Bàn Làm Việc Giám Đốc Atelier Master Óc Chó',
                'slug' => 'ban-lam-viec-giam-doc-atelier-master-oc-cho',
                'brand' => 'TK House',
                'description' => 'Không gian nuôi dưỡng những quyết định lớn với hệ bàn gỗ nguyên tấm và tỉ lệ công thái học chuẩn mực.',
                'warranty_months' => 36,
                'price' => 32000000,
                'stock' => 5,
                'sku' => 'BLV-ATL-01',
                'color' => 'Gỗ óc chó tối màu',
                'material' => 'Gỗ Óc Chó FAS & Chân Kim Loại Sơn Tĩnh Điện',
                'dimensions' => ['length' => 180, 'width' => 85, 'height' => 76],
                'images' => [
                    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-lam-viec',
                'name' => 'Bàn Làm Việc Nâng Hạ Thông Minh Pro Desk',
                'slug' => 'ban-lam-viec-nang-ha-thong-minh-pro-desk',
                'brand' => 'TK House',
                'description' => 'Động cơ nâng hạ êm ái, bộ nhớ 4 vị trí chiều cao, kết hợp mặt bàn gỗ tự nhiên thanh lịch.',
                'warranty_months' => 24,
                'price' => 12500000,
                'stock' => 20,
                'sku' => 'BLV-PRO-02',
                'color' => 'Gỗ sồi tự nhiên',
                'material' => 'Mặt Gỗ Sồi Khối & Khung Động Cơ Điện Kép',
                'dimensions' => ['length' => 140, 'width' => 70, 'height' => 118],
                'images' => [
                    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // Sofa da
            [
                'category_slug' => 'sofa-da',
                'name' => 'Sofa Da Thật Tuscany Thượng Hạng 3 Chỗ',
                'slug' => 'sofa-da-that-tuscany-thuong-hang-3-cho',
                'brand' => 'TK House',
                'description' => 'Da bò Ý thuộc thảo mộc tự nhiên 100%, càng dùng bề mặt càng đằm sâu và bóng mượt độc bản.',
                'warranty_months' => 60,
                'price' => 68000000,
                'stock' => 6,
                'sku' => 'SF-TUS-01',
                'color' => 'Nâu da bò cổ điển',
                'material' => 'Da Bò Ý Thuộc Thảo Mộc & Khung Gỗ Thông Bắc Âu',
                'dimensions' => ['length' => 260, 'width' => 98, 'height' => 82],
                'images' => [
                    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // Sofa vải
            [
                'category_slug' => 'sofa-vai',
                'name' => 'Sofa Vải Dệt Bouclé Scandinavian Cloud',
                'slug' => 'sofa-vai-det-boucle-scandinavian-cloud',
                'brand' => 'TK House',
                'description' => 'Vải len Bouclé nhập khẩu ôm ấp mềm mại, đệm lông vũ 3 lớp thư giãn tuyệt đối.',
                'warranty_months' => 36,
                'price' => 38500000,
                'stock' => 8,
                'sku' => 'SF-BOU-02',
                'color' => 'Trắng kem Bouclé',
                'material' => 'Vải Len Bouclé & Đệm Lông Vũ Tự Nhiên',
                'dimensions' => ['length' => 230, 'width' => 95, 'height' => 78],
                'images' => [
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // Ghế thư giãn
            [
                'category_slug' => 'ghe-thu-gian',
                'name' => 'Ghế Armchair Mây Đan Mắt Cáo Thủ Công Osaka',
                'slug' => 'ghe-armchair-may-dan-mat-cao-thu-cong-osaka',
                'brand' => 'TK House',
                'description' => 'Mây đan mắt cáo thủ công truyền thống kết hợp khung gỗ sồi trắng mộc mạc phong cách Japandi.',
                'warranty_months' => 24,
                'price' => 14800000,
                'stock' => 14,
                'sku' => 'ARM-OSA-01',
                'color' => 'Mây tự nhiên & Gỗ sồi',
                'material' => 'Mây Tự Nhiên & Gỗ Sồi Trắng Khối',
                'dimensions' => ['length' => 78, 'width' => 82, 'height' => 85],
                'images' => [
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // Ghế ăn
            [
                'category_slug' => 'ghe-an',
                'name' => 'Ghế Ăn Da Nappa Khung Kim Loại Mạ PVD',
                'slug' => 'ghe-an-da-nappa-khung-kim-loai-ma-pvd',
                'brand' => 'TK House',
                'description' => 'Đệm da Nappa êm dịu, lưng cong duyên dáng ôm trọn cơ thể cho trải nghiệm dùng bữa trọn vẹn.',
                'warranty_months' => 24,
                'price' => 4200000,
                'stock' => 32,
                'sku' => 'GA-NAP-01',
                'color' => 'Xám tro & Chân Vàng',
                'material' => 'Da Nappa Cao Cấp & Khung Thép Mạ PVD',
                'dimensions' => ['length' => 52, 'width' => 55, 'height' => 84],
                'images' => [
                    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
                ]
            ],
        ];

        foreach ($productsSeed as $p) {
            $catId = $catIds[$p['category_slug']] ?? null;
            if (!$catId) continue;

            // 1. Thêm hoặc cập nhật bảng products
            $existingProduct = DB::table('products')->where('slug', $p['slug'])->first();
            $productId = null;

            if ($existingProduct) {
                $productId = $existingProduct->id;
                DB::table('products')->where('id', $productId)->update([
                    'category_id' => $catId,
                    'name' => $p['name'],
                    'brand' => $p['brand'],
                    'description' => $p['description'],
                    'warranty_months' => $p['warranty_months'],
                    'is_active' => true,
                    'updated_at' => now(),
                ]);
            } else {
                $productId = DB::table('products')->insertGetId([
                    'category_id' => $catId,
                    'name' => $p['name'],
                    'slug' => $p['slug'],
                    'brand' => $p['brand'],
                    'description' => $p['description'],
                    'warranty_months' => $p['warranty_months'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // 2. Thêm hoặc cập nhật bảng product_variants
            DB::table('product_variants')->updateOrInsert(
                ['sku' => $p['sku']],
                [
                    'product_id' => $productId,
                    'color' => $p['color'],
                    'material' => $p['material'],
                    'length_cm' => $p['dimensions']['length'] ?? null,
                    'width_cm' => $p['dimensions']['width'] ?? null,
                    'height_cm' => $p['dimensions']['height'] ?? null,
                    'price' => $p['price'],
                    'stock_quantity' => $p['stock'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            // 3. Thêm ảnh vào bảng product_images
            // Xóa ảnh cũ của sản phẩm này để seed lại
            DB::table('product_images')->where('product_id', $productId)->delete();
            foreach ($p['images'] as $index => $imageUrl) {
                DB::table('product_images')->insert([
                    'product_id' => $productId,
                    'image_url' => $imageUrl,
                    'alt_text' => $p['name'],
                    'sort_order' => $index,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
