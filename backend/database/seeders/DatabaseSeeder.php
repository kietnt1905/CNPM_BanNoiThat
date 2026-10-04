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
        // 1. Tạo tài khoản Admin
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@gmail.com'],
            [
                'name' => 'Quản Trị Viên',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '0901234567',
                'address' => 'Hồ Chí Minh',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 2. Tạo 4 danh mục bàn ghế
        $categories = [
            ['id' => 1, 'name' => 'Bàn làm việc', 'slug' => 'ban-lam-viec', 'description' => 'Bàn làm việc gỗ công nghiệp, hiện đại và công thái học.'],
            ['id' => 2, 'name' => 'Ghế văn phòng', 'slug' => 'ghe-van-phong', 'description' => 'Ghế xoay lưới, ghế công thái học bảo vệ cột sống.'],
            ['id' => 3, 'name' => 'Bàn ăn gia đình', 'slug' => 'ban-an-gia-dinh', 'description' => 'Bàn ăn mặt đá, gỗ sồi tự nhiên sang trọng.'],
            ['id' => 4, 'name' => 'Ghế sofa phòng khách', 'slug' => 'ghe-sofa-phong-khach', 'description' => 'Sofa bọc nỉ cao cấp, sofa da êm ái.'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['id' => $cat['id']],
                array_merge($cat, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // 3. Tạo 10 sản phẩm bàn/ghế kèm kích thước và ảnh Unsplash
        $products = [
            // Bàn làm việc (Category 1)
            [
                'category_id' => 1,
                'name' => 'Bàn làm việc Minimalist Wood Desk',
                'slug' => 'ban-lam-viec-minimalist-wood-desk',
                'price' => 1850000,
                'stock' => 25,
                'dimensions' => '120 x 60 x 75 cm',
                'image_url' => 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
                'description' => 'Mặt bàn phủ melamine chống trầy, chân sắt sơn tĩnh điện chịu lực cao.'
            ],
            [
                'category_id' => 1,
                'name' => 'Bàn nâng hạ thông minh Pro Desk',
                'slug' => 'ban-nang-ha-thong-minh-pro-desk',
                'price' => 4200000,
                'stock' => 15,
                'dimensions' => '140 x 70 x 72-118 cm',
                'image_url' => 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80',
                'description' => 'Động cơ kép êm ái, bộ nhớ 4 vị trí chiều cao tiện lợi cho công việc.'
            ],
            [
                'category_id' => 1,
                'name' => 'Bàn làm việc góc chữ L Studio',
                'slug' => 'ban-lam-viec-goc-chu-l-studio',
                'price' => 2650000,
                'stock' => 10,
                'dimensions' => '160 x 120 x 75 cm',
                'image_url' => 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?auto=format&fit=crop&w=800&q=80',
                'description' => 'Tối ưu không gian góc phòng, diện tích mặt bàn rộng rãi để setup 2 màn hình.'
            ],

            // Ghế văn phòng (Category 2)
            [
                'category_id' => 2,
                'name' => 'Ghế công thái học Ergonomic Mesh Chair',
                'slug' => 'ghe-cong-thai-hoc-ergonomic-mesh-chair',
                'price' => 2100000,
                'stock' => 40,
                'dimensions' => '65 x 65 x 115-125 cm',
                'image_url' => 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
                'description' => 'Lưới thoáng khí cao cấp, tựa lưng hỗ trợ đốt sống thắt lưng giảm mỏi khi ngồi lâu.'
            ],
            [
                'category_id' => 2,
                'name' => 'Ghế xoay văn phòng Classic Black',
                'slug' => 'ghe-xoay-van-phong-classic-black',
                'price' => 950000,
                'stock' => 50,
                'dimensions' => '58 x 58 x 90-100 cm',
                'image_url' => 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80',
                'description' => 'Thiết kế nhỏ gọn, đệm mút nguyên khối đàn hồi cao, bánh xe xoay 360 độ.'
            ],

            // Bàn ăn gia đình (Category 3)
            [
                'category_id' => 3,
                'name' => 'Bàn ăn gỗ Sồi tự nhiên Scandinavian',
                'slug' => 'ban-an-go-soi-tu-nhien-scandinavian',
                'price' => 5600000,
                'stock' => 8,
                'dimensions' => '160 x 80 x 75 cm',
                'image_url' => 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
                'description' => 'Gỗ sồi nhập khẩu vân đẹp mắt, bo tròn 4 góc an toàn cho gia đình có trẻ nhỏ.'
            ],
            [
                'category_id' => 3,
                'name' => 'Bàn ăn mặt đá Ceramic chống trầy',
                'slug' => 'ban-an-mat-da-ceramic-chong-tray',
                'price' => 6900000,
                'stock' => 12,
                'dimensions' => '180 x 90 x 76 cm',
                'image_url' => 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80',
                'description' => 'Mặt đá phiến ceramic chống ố và chịu nhiệt, chân chữ X kim loại chắc chắn.'
            ],

            // Ghế sofa phòng khách (Category 4)
            [
                'category_id' => 4,
                'name' => 'Ghế Sofa băng vải nỉ Pastel Cozy',
                'slug' => 'ghe-sofa-bang-vai-ni-pastel-cozy',
                'price' => 4800000,
                'stock' => 14,
                'dimensions' => '180 x 85 x 82 cm',
                'image_url' => 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
                'description' => 'Vải nỉ bọc đệm 3 lớp chống xẹp lún, gam màu thanh lịch chuẩn phong cách Bắc Âu.'
            ],
            [
                'category_id' => 4,
                'name' => 'Ghế Sofa da góc L Luxury Living',
                'slug' => 'ghe-sofa-da-goc-l-luxury-living',
                'price' => 8900000,
                'stock' => 6,
                'dimensions' => '240 x 150 x 85 cm',
                'image_url' => 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
                'description' => 'Chất liệu da Microfiber cao cấp chống nước, khung gỗ dầu tự nhiên đã qua xử lý mối mọt.'
            ],
            [
                'category_id' => 4,
                'name' => 'Ghế đôn sofa tròn Velvet Accent',
                'slug' => 'ghe-don-sofa-tron-velvet-accent',
                'price' => 650000,
                'stock' => 30,
                'dimensions' => '45 x 45 x 42 cm',
                'image_url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
                'description' => 'Bọc vải nhung mềm mại, chân viền mạ vàng bóng sang trọng làm điểm nhấn phòng khách.'
            ],
        ];

        foreach ($products as $prod) {
            DB::table('products')->updateOrInsert(
                ['slug' => $prod['slug']],
                array_merge($prod, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
