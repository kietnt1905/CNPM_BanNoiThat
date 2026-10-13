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
            // ==================== BÀN ĂN (category: ban-an) ====================
            [
                'category_slug' => 'ban-an',
                'name' => 'Bộ Bàn Ăn Hoàng Gia Elegance 8 Chỗ Mặt Đá',
                'slug' => 'bo-ban-an-hoang-gia-elegance-8-cho-mat-da',
                'brand' => 'TK House',
                'description' => 'Mặt đá Ceramic Nano tôi luyện nhiệt độ 1200°C chống xước vĩnh cửu và chân gỗ óc chó nguyên khối phong cách quý tộc.',
                'warranty_months' => 36,
                'price' => 46500000,
                'stock' => 10,
                'sku' => 'BA-ELG-01',
                'color' => 'Nâu óc chó & Trắng vân mây',
                'material' => 'Mặt đá Ceramic Nano & Gỗ Óc Chó FAS',
                'dimensions' => ['length' => 220, 'width' => 95, 'height' => 75, 'weight' => 85],
                'images' => [
                    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-an',
                'name' => 'Bàn Ăn Mở Rộng Thông Minh Calacatta Gold',
                'slug' => 'ban-an-mo-rong-thong-minh-calacatta-gold',
                'brand' => 'TK House',
                'description' => 'Bàn mở rộng thông minh với thanh trượt êm ái linh hoạt 6-10 người, mặt đá thiêu kết Calacatta cao cấp.',
                'warranty_months' => 24,
                'price' => 24900000,
                'stock' => 15,
                'sku' => 'BA-CAL-02',
                'color' => 'Trắng vân mây vàng & Khung Vàng Champagne',
                'material' => 'Đá Thiêu Kết Calacatta & Khung Titan Mạ PVD',
                'dimensions' => ['length' => 240, 'width' => 90, 'height' => 75, 'weight' => 72],
                'images' => [
                    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-an',
                'name' => 'Bàn Ăn Gỗ Óc Chó Nguyên Khối Artisan 6 Chỗ',
                'slug' => 'ban-an-go-oc-cho-nguyen-khoi-artisan',
                'brand' => 'TK House',
                'description' => 'Chế tác từ tấm gỗ óc chó Bắc Mỹ nguyên khối dày dặn, viền tự nhiên live edge mang hơi thở thiên nhiên mộc mạc.',
                'warranty_months' => 36,
                'price' => 38000000,
                'stock' => 8,
                'sku' => 'BA-ART-03',
                'color' => 'Nâu hạt dẻ tự nhiên',
                'material' => 'Gỗ Óc Chó Bắc Mỹ FAS Nguyên Khối',
                'dimensions' => ['length' => 200, 'width' => 90, 'height' => 76, 'weight' => 90],
                'images' => [
                    'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-an',
                'name' => 'Bàn Ăn Mặt Đá Ceramic Chân Chữ V Luxury',
                'slug' => 'ban-an-mat-da-ceramic-chan-chu-v-luxury',
                'brand' => 'TK House',
                'description' => 'Thiết kế chân chữ V tạo hình kiến trúc điêu khắc vững chãi kết hợp mặt đá Ceramic chống trầy, chống ố 100%.',
                'warranty_months' => 24,
                'price' => 28500000,
                'stock' => 12,
                'sku' => 'BA-CHV-04',
                'color' => 'Đen tia chớp & Khung Đen Mờ',
                'material' => 'Đá Ceramic Tây Ban Nha & Khung Thép Carbon',
                'dimensions' => ['length' => 180, 'width' => 90, 'height' => 75, 'weight' => 68],
                'images' => [
                    'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-an',
                'name' => 'Bàn Ăn Tròn Mâm Xoay Thông Minh Rotunda',
                'slug' => 'ban-an-tron-mam-xoay-thong-minh-rotunda',
                'brand' => 'TK House',
                'description' => 'Kiểu dáng bàn tròn gắn kết sum vầy gia đình, mâm xoay âm mặt đá êm ái xoay 360 độ tiện nghi.',
                'warranty_months' => 24,
                'price' => 31200000,
                'stock' => 14,
                'sku' => 'BA-ROT-05',
                'color' => 'Trắng khói & Nâu Walnut',
                'material' => 'Đá Marble Nhân Tạo & Chân Gỗ Tần Bì Sơn PU',
                'dimensions' => ['length' => 150, 'width' => 150, 'height' => 76, 'weight' => 78],
                'images' => [
                    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-an',
                'name' => 'Bàn Ăn Gỗ Sồi Bắc Âu Minimalist 6 Chỗ',
                'slug' => 'ban-an-go-soi-bac-au-minimalist',
                'brand' => 'TK House',
                'description' => 'Phong cách Scandinavian tinh giản với những góc bo tròn an toàn cho trẻ nhỏ và vân sồi sáng thanh lịch.',
                'warranty_months' => 24,
                'price' => 18600000,
                'stock' => 20,
                'sku' => 'BA-MIN-06',
                'color' => 'Vàng sồi tự nhiên',
                'material' => 'Gỗ Sồi Trắng Bắc Mỹ Tự Nhiên & Dầu Dưỡng Rubio',
                'dimensions' => ['length' => 180, 'width' => 85, 'height' => 75, 'weight' => 55],
                'images' => [
                    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // ==================== BÀN TRÀ - SOFA (category: ban-tra) ====================
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
                'dimensions' => ['length' => 90, 'width' => 90, 'height' => 45, 'weight' => 32],
                'images' => [
                    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-tra',
                'name' => 'Bàn Tròn Cà Phê Gỗ Óc Chó Nghệ Thuật',
                'slug' => 'ban-tron-ca-phe-go-oc-cho-nghe-thuat',
                'brand' => 'TK House',
                'description' => 'Thiết kế tinh xảo từ gỗ óc chó FAS tự nhiên và dầu lau hữu cơ an toàn cho sức khỏe gia đình.',
                'warranty_months' => 24,
                'price' => 8600000,
                'stock' => 12,
                'sku' => 'BT-WAL-02',
                'color' => 'Nâu gỗ óc chó trầm',
                'material' => 'Gỗ Óc Chó FAS Tự Nhiên & Dầu Lau Hữu Cơ',
                'dimensions' => ['length' => 75, 'width' => 75, 'height' => 42, 'weight' => 18],
                'images' => [
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-tra',
                'name' => 'Bàn Trà Sofa Mặt Kính Khói Chân Inox PVD',
                'slug' => 'ban-tra-sofa-mat-kinh-khoi-chan-inox-pvd',
                'brand' => 'TK House',
                'description' => 'Mặt kính cường lực xám khói sang trọng tạo cảm giác cơi nới không gian, chân đế mạ PVD chống oxy hóa.',
                'warranty_months' => 12,
                'price' => 7900000,
                'stock' => 16,
                'sku' => 'BT-GLA-03',
                'color' => 'Kính xám khói & Kim loại đen',
                'material' => 'Kính Cường Lực 12mm & Inox 304 Mạ PVD',
                'dimensions' => ['length' => 120, 'width' => 60, 'height' => 42, 'weight' => 26],
                'images' => [
                    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ban-tra',
                'name' => 'Bàn Trà Thông Minh Nâng Hạ Đa Năng',
                'slug' => 'ban-tra-thong-minh-nang-ha-da-nang',
                'brand' => 'TK House',
                'description' => 'Cơ cấu nâng hạ mặt bàn mượt mà biến bàn trà thành bàn làm việc hoặc bàn ăn tiện ích, ngăn chứa đồ rộng rãi.',
                'warranty_months' => 24,
                'price' => 9800000,
                'stock' => 15,
                'sku' => 'BT-LIFT-04',
                'color' => 'Gỗ óc chó kết hợp xám than',
                'material' => 'Gỗ MDF Chống Ẩm Phủ Melamine & Piston Thủy Lực',
                'dimensions' => ['length' => 110, 'width' => 55, 'height' => 45, 'weight' => 38],
                'images' => [
                    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // ==================== BÀN LÀM VIỆC (category: ban-lam-viec) ====================
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
                'dimensions' => ['length' => 180, 'width' => 85, 'height' => 76, 'weight' => 65],
                'images' => [
                    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
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
                'dimensions' => ['length' => 140, 'width' => 70, 'height' => 118, 'weight' => 45],
                'images' => [
                    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // ==================== SOFA DA (category: sofa-da) ====================
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
                'dimensions' => ['length' => 260, 'width' => 98, 'height' => 82, 'weight' => 95],
                'images' => [
                    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // ==================== SOFA VẢI (category: sofa-vai) ====================
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
                'dimensions' => ['length' => 230, 'width' => 95, 'height' => 78, 'weight' => 75],
                'images' => [
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // ==================== GHẾ THƯ GIÃN (category: ghe-thu-gian) ====================
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
                'dimensions' => ['length' => 78, 'width' => 82, 'height' => 85, 'weight' => 18],
                'images' => [
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ghe-thu-gian',
                'name' => 'Ghế Thư Giãn Bập Bênh Đệm Lông Vũ Relax Lounge',
                'slug' => 'ghe-thu-gian-bap-benh-dem-long-vu-relax-lounge',
                'brand' => 'TK House',
                'description' => 'Trục bập bênh gỗ nguyên khối với độ cong hoàn hảo, đệm lông vũ dày 15cm mang lại cảm giác nghỉ ngơi êm dịu.',
                'warranty_months' => 24,
                'price' => 12500000,
                'stock' => 11,
                'sku' => 'ARM-RLX-02',
                'color' => 'Xám lông chuột & Gỗ tự nhiên',
                'material' => 'Vải Linen Thoáng Khí & Gỗ Dẻ Gai Châu Âu',
                'dimensions' => ['length' => 95, 'width' => 72, 'height' => 88, 'weight' => 22],
                'images' => [
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ghe-thu-gian',
                'name' => 'Ghế Lounge Da Thật Kèm Đôn Gác Chân Monaco',
                'slug' => 'ghe-lounge-da-that-kem-don-gac-chan-monaco',
                'brand' => 'TK House',
                'description' => 'Thiết kế biểu tượng công thái học ngả lưng thư giãn, bọc da bò Ý mềm mại và đế xoay nhôm đúc đầm chắc.',
                'warranty_months' => 36,
                'price' => 23500000,
                'stock' => 8,
                'sku' => 'ARM-MNC-03',
                'color' => 'Nâu da bò cognac & Đen',
                'material' => 'Da Bò Thật Ý & Hợp Kim Nhôm Đúc',
                'dimensions' => ['length' => 85, 'width' => 85, 'height' => 92, 'weight' => 34],
                'images' => [
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ghe-thu-gian',
                'name' => 'Ghế Đơn Xoay 360 Độ Vải Nỉ Bouclé Tròn',
                'slug' => 'ghe-don-xoay-360-do-vai-ni-boucle-tron',
                'brand' => 'TK House',
                'description' => 'Dáng tròn ôm trọn cơ thể, trục xoay 360 độ linh hoạt nhẹ nhàng, chất vải dệt Bouclé cao cấp thời thượng.',
                'warranty_months' => 24,
                'price' => 9600000,
                'stock' => 16,
                'sku' => 'ARM-BOU-04',
                'color' => 'Trắng ngọc trai',
                'material' => 'Vải Nỉ Bouclé & Đệm Mút D40 Đúc Khối',
                'dimensions' => ['length' => 80, 'width' => 80, 'height' => 75, 'weight' => 21],
                'images' => [
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                ]
            ],

            // ==================== GHẾ ĂN (category: ghe-an) ====================
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
                'color' => 'Xám tro & Chân Vàng PVD',
                'material' => 'Da Nappa Cao Cấp & Khung Thép Mạ PVD',
                'dimensions' => ['length' => 52, 'width' => 55, 'height' => 84, 'weight' => 8],
                'images' => [
                    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ghe-an',
                'name' => 'Ghế Ăn Gỗ Óc Chó Bọc Đệm Monaco',
                'slug' => 'ghe-an-go-oc-cho-boc-dem-monaco',
                'brand' => 'TK House',
                'description' => 'Khung gỗ óc chó tự nhiên được bo vát thủ công tỉ mỉ, đệm bọc da cao cấp chống thấm bám bẩn.',
                'warranty_months' => 24,
                'price' => 4800000,
                'stock' => 24,
                'sku' => 'GA-MNC-02',
                'color' => 'Nâu óc chó & Đệm Nâu Da Bò',
                'material' => 'Gỗ Óc Chó FAS & Da Công Nghiệp Microfiber',
                'dimensions' => ['length' => 50, 'width' => 54, 'height' => 82, 'weight' => 9],
                'images' => [
                    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ghe-an',
                'name' => 'Ghế Ăn Tựa Cong Công Thái Học Scandinavian',
                'slug' => 'ghe-an-tua-cong-cong-thai-hoc-scandinavian',
                'brand' => 'TK House',
                'description' => 'Tựa lưng uốn cong sinh học nâng đỡ cột sống tuyệt hảo, phong cách tối giản thanh lịch phù hợp mọi không gian.',
                'warranty_months' => 12,
                'price' => 2900000,
                'stock' => 40,
                'sku' => 'GA-SCA-03',
                'color' => 'Vàng sồi tự nhiên & Đệm Vải Be',
                'material' => 'Gỗ Sồi Trắng & Vải Bố Linen Dệt Mộc',
                'dimensions' => ['length' => 48, 'width' => 52, 'height' => 80, 'weight' => 7],
                'images' => [
                    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ghe-an',
                'name' => 'Ghế Ăn Bọc Vải Nhung Chân Inox Mạ Vàng Luxury',
                'slug' => 'ghe-an-boc-vai-nhung-chan-inox-ma-vang-luxury',
                'brand' => 'TK House',
                'description' => 'Chất liệu vải nhung mềm mượt bắt sáng kiêu sa cùng chân inox mạ vàng tạo điểm nhấn quý phái cho phòng ăn.',
                'warranty_months' => 24,
                'price' => 3600000,
                'stock' => 28,
                'sku' => 'GA-VEL-04',
                'color' => 'Xanh Emerald & Chân Vàng Hoàng Gia',
                'material' => 'Vải Nhung Tuyết & Inox 304 Mạ PVD',
                'dimensions' => ['length' => 54, 'width' => 56, 'height' => 86, 'weight' => 8.5],
                'images' => [
                    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                ]
            ],
            [
                'category_slug' => 'ghe-an',
                'name' => 'Ghế Ăn Tựa Mây Đan Khung Gỗ Tần Bì Japandi',
                'slug' => 'ghe-an-tua-may-dan-khung-go-tan-bi-japandi',
                'brand' => 'TK House',
                'description' => 'Sự giao thoa giữa nét thanh tao Nhật Bản và mộc mạc Bắc Âu với tựa mây mắt cáo đan thủ công thoáng khí.',
                'warranty_months' => 24,
                'price' => 3400000,
                'stock' => 35,
                'sku' => 'GA-JAP-05',
                'color' => 'Gỗ tự nhiên & Mây vàng nhạt',
                'material' => 'Gỗ Tần Bì & Mây Đan Tự Nhiên',
                'dimensions' => ['length' => 49, 'width' => 53, 'height' => 83, 'weight' => 7.5],
                'images' => [
                    'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
                    'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80',
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
                    'weight_kg' => $p['dimensions']['weight'] ?? null,
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
