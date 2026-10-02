import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Award,
  Truck,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Eye,
  Heart,
  ShoppingBag,
  Star,
  Quote,
  CheckCircle2,
  Maximize2,
  Layers,
  Compass,
  Check,
  ZoomIn,
  X
} from 'lucide-react';

export default function HomePage() {
  const location = useLocation();

  // Đảm bảo khi tải trang mặc định "/" luôn nằm ở đỉnh trang (Hero Banner Victoria)
  useEffect(() => {
    // Nếu có hash tồn dư trong URL từ các lần click trước, xóa hash và giữ ở top
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);
  }, []);

  // Dữ liệu Slider Hero Banner (chuẩn phong cách Nhà Xinh)
  const heroSlides = [
    {
      id: 1,
      tag: 'BỘ SƯU TẬP MỚI',
      title: 'Victoria',
      description:
        'Từ cảm hứng miền quê Pháp đến cảm xúc ngôi nhà Việt, đường cong mềm mại, chi tiết chạm tay và tông màu ấm cho từng không gian sống.',
      image: '/images/banners/banner-hero/banner-victoria.jpg',
      primaryBtn: {
        text: 'KHÁM PHÁ BỘ SƯU TẬP',
        link: '/bo-suu-tap/victoria',
      },
      secondaryBtn: {
        text: 'CÂU CHUYỆN VICTORIA',
        link: '/cau-chuyen/victoria',
      },
    },
    {
      id: 2,
      tag: 'HÀNG MỚI VỀ',
      title: 'Côte Noire',
      description:
        'Bộ sưu tập hoa lụa nghệ thuật & hương thơm thượng lưu từ Pháp, thắp sáng nét quý phái và lãng mạn cho không gian nhà bạn.',
      image: '/images/banners/banner-hero/banner-cotenoire.jpg',
      primaryBtn: {
        text: 'XEM BỘ SƯU TẬP',
        link: '/bo-suu-tap/cote-noire',
      },
      secondaryBtn: {
        text: 'HƯƠNG THƠM NGHỆ THUẬT',
        link: '/san-pham/den-trang-tri',
      },
    },
    {
      id: 3,
      tag: 'KHÔNG GIAN ĐƯƠNG ĐẠI 2026',
      title: 'Modern Living',
      description:
        'Định nghĩa chuẩn mực tiện nghi đương đại: Tinh tế trong từng đường nét kiến trúc, bền bỉ cùng thời gian và nâng tầm phong cách sống.',
      image: '/images/banners/banner-hero/banner-modern.jpg',
      primaryBtn: {
        text: 'KHÁM PHÁ KHÔNG GIAN',
        link: '/phong/phong-khach',
      },
      secondaryBtn: {
        text: 'TƯ VẤN THIẾT KẾ',
        link: '/thiet-ke-noi-that',
      },
    },
  ];

  // Trạng thái Hero Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const SLIDE_DURATION = 6000; // 6 giây mỗi slide

  // Tự động chuyển slide sau mỗi 6 giây liên tục
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, SLIDE_DURATION);

    return () => clearTimeout(timer);
  }, [currentSlide, heroSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleGoToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Ref và hàm điều khiển lướt Carousel sản phẩm nổi bật
  const productScrollRef = useRef(null);
  const scrollProducts = (direction) => {
    if (productScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      productScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Dữ liệu danh mục không gian sống chuyên sâu Bàn & Ghế (4 Cổng vòm kiến trúc)
  const featuredCategories = [
    {
      id: '01',
      tag: 'Phòng Ăn Đương Đại',
      title: 'Bộ Bàn Ăn Sang Trọng',
      subtitle: 'Mặt đá Ceramic chống ố, Ghế ăn bọc da cao cấp',
      image: '/images/categories/phong-am.jpg',
      link: '/san-pham?danh-muc=ban-an',
      isTaller: false,
    },
    {
      id: '02',
      tag: 'Không Gian Phòng Khách',
      title: 'Sofa & Bàn Trà Tinh Tế',
      subtitle: 'Sofa da thảo mộc, Bàn trà đôi đá tự nhiên',
      image: '/images/categories/phong-khach.jpg',
      link: '/san-pham?danh-muc=sofa',
      isTaller: true,
    },
    {
      id: '03',
      tag: 'Xưởng Cảm Hứng',
      title: 'Góc Làm Việc Nghệ Thuật',
      subtitle: 'Bàn làm việc gỗ sồi khối, Ghế công thái học êm ái',
      image: '/images/categories/phong-lam-viec.jpg',
      link: '/san-pham?danh-muc=ban-lam-viec',
      isTaller: true,
    },
    {
      id: '04',
      tag: 'Góc Tĩnh Lặng',
      title: 'Ghế Thư Giãn & Armchair',
      subtitle: 'Đệm lông vũ mềm mại, nâng niu từng phút giây thư thái',
      image: '/images/products/ghe-thu-gian.jpg',
      link: '/san-pham?danh-muc=ghe-thu-gian',
      isTaller: false,
    },
  ];

  // Trạng thái bộ lọc sản phẩm (Tất cả / Bàn cao cấp / Ghế & Sofa)
  const [productFilter, setProductFilter] = useState('all');

  // Trạng thái Hotspot tương tác không gian thực (mặc định null để ảnh phòng khách sạch thoáng, không hiện bảng giá đè lên)
  const [activeHotspot, setActiveHotspot] = useState(null);

  // Trạng thái Bản giao hưởng chất liệu xa xỉ
  const [activeMaterial, setActiveMaterial] = useState('leather');

  // Trạng thái màu sắc / swatch đang được chọn cho từng sản phẩm
  const [selectedSwatches, setSelectedSwatches] = useState({});

  // Dữ liệu các điểm Hotspot tương tác trong không gian sống thực tế (Lookbook Living)
  const roomHotspots = [
    {
      id: 0,
      name: 'Sofa 3 Chỗ Victoria Da Thật',
      category: 'Ghế & Sofa Phòng Khách',
      price: '38.500.000₫',
      material: 'Da Bò Ý Thuộc Thảo Mộc Tuscany',
      dimension: 'D240 × R100 × C82 cm',
      image: '/images/products/sofa-3-cho-victoria.jpg',
      link: '/san-pham/1',
      coords: { top: '64%', left: '42%' },
      tag: 'Tâm điểm phòng khách',
      description: 'Chạm khắc tinh tế, da bò đanh mịn lưu hương thảo mộc tự nhiên.',
    },
    {
      id: 1,
      name: 'Bàn Trà Đôi Mặt Đá Marble Elegance',
      category: 'Bàn Trà Sang Trọng',
      price: '11.500.000₫',
      material: 'Đá Marble Calacatta & Khung Titan Mạ Vàng',
      dimension: 'Ø90 × C45 cm & Ø60 × C38 cm',
      image: '/images/products/ban-tra-doi.jpg',
      link: '/san-pham/4',
      coords: { top: '75%', left: '62%' },
      tag: 'Bán chạy nhất',
      description: 'Cặp đôi bàn lồng nghệ thuật, mặt đá vân mây bóng mịn chống ố.',
    },
    {
      id: 2,
      name: 'Ghế Thư Giãn Armchair Mây Osaka',
      category: 'Ghế Thư Giãn Nghệ Thuật',
      price: '14.200.000₫',
      material: 'Mây Đan Mắt Cáo Thủ Công & Gỗ Sồi Khối',
      dimension: 'D82 × R80 × C95 cm',
      image: '/images/products/ghe-thu-gian.jpg',
      link: '/san-pham/3',
      coords: { top: '56%', left: '17%' },
      tag: 'Thiết kế biểu tượng',
      description: 'Góc ngả lưng chuẩn công thái học kết hợp đệm lông vũ siêu êm ái.',
    },
  ];

  // Dữ liệu Bản giao hưởng chất liệu xa xỉ (Symphony of Noble Materials)
  const luxuryMaterials = [
    {
      id: 'leather',
      name: 'Da Bò Thảo Mộc Tuscany',
      origin: 'Tuscany, Ý (Santa Croce sull’Arno)',
      tagline: '“Vẻ đẹp của thời gian – Càng sử dụng càng đằm sâu và bóng mượt độc bản.”',
      description:
        'Phương pháp thuộc da bằng tanin chiết xuất từ vỏ cây sồi và hạt dẻ cổ truyền qua hơn 40 ngày ủ tự nhiên. Không kim loại nặng, thân thiện tuyệt đối với làn da, giữ trọn vẹn từng thớ vân tự nhiên và tỏa hương thảo mộc dịu nhẹ.',
      specs: [
        { label: 'Độ Dày Tiêu Chuẩn', value: '1.4 - 1.6 mm Full-Grain' },
        { label: 'Chứng Nhận', value: 'Pelle Conciata al Vegetale in Toscana' },
        { label: 'Cảm Giác Tiếp Xúc', value: 'Mát mịn, ấm dần thích ứng thân nhiệt' },
      ],
      image: '/images/materials/mat-leather.jpg',
      badge: 'ITALIAN HERITAGE',
      themeColor: '#8C5D3E',
      productType: 'ghe',
    },
    {
      id: 'walnut',
      name: 'Gỗ Óc Chó Bắc Mỹ Tự Nhiên',
      origin: 'Rừng Khai Thác Bền Vững Đông Bắc Hoa Kỳ (Chuẩn FSC)',
      tagline: '“Vân gỗ cuộn sóng mềm mại & độ bền trường tồn theo cùng năm tháng.”',
      description:
        'Từng phách gỗ óc chó được tinh tuyển đạt phân hạng FAS cao nhất, sấy nhiệt chân không đạt độ ẩm lý tưởng 8-12%. Hoàn thiện thủ công bằng dầu lau tự nhiên không chứa VOCs, giữ nguyên ánh nâu socola sang trọng và vân mắt gỗ huyền bí.',
      specs: [
        { label: 'Phân Hạng Gỗ', value: 'FAS (First & Seconds) Thượng Hạng' },
        { label: 'Lớp Hoàn Thiện', value: 'Dầu lau hữu cơ Hardwax Satin' },
        { label: 'Đặc Tính Cơ Học', value: 'Kháng cong vênh, chống mối mọt tự nhiên' },
      ],
      image: '/images/materials/mat-walnut.jpg',
      badge: 'NOBLE HARDWOOD',
      themeColor: '#5C4033',
      productType: 'ban',
    },
    {
      id: 'ceramic',
      name: 'Đá Thiêu Kết Calacatta Gold',
      origin: 'Công nghệ nung ép 1200°C nguyên khối tại Ý',
      tagline: '“Độ cứng kim cương – Kháng nhiệt độ, chống trầy xước và vết ố vĩnh cửu.”',
      description:
        'Được ép dưới áp lực 25.000 tấn và tôi luyện ở nhiệt độ trên 1200°C. Tái hiện vân mây Calacatta màu vàng champagne quý phái với độ bền vô địch: không thấm sốt vang hay cà phê, an toàn đặt nồi gang sôi trực tiếp mà không cần lót.',
      specs: [
        { label: 'Độ Cứng Thang Mohs', value: 'Cấp độ 7 (Chống trầy xước kim loại)' },
        { label: 'Độ Hút Nước', value: '< 0.02% (Kháng hoàn toàn vết ố bẩn)' },
        { label: 'An Toàn Thực Phẩm', value: 'Chuẩn NSF tiếp xúc trực tiếp thức ăn' },
      ],
      image: '/images/materials/mat-ceramic.jpg',
      badge: 'SINTERED STONE',
      themeColor: '#B08D57',
      productType: 'ban',
    },
    {
      id: 'boucle',
      name: 'Vải Dệt Lông Cừu Bouclé Cao Cấp',
      origin: 'Dệt sợi xoắn công nghệ cao Atelier Pháp',
      tagline: '“Xúc cảm xúc giác mềm mại ôm ấp – Biểu tượng Haute Couture của nội thất đương đại.”',
      description:
        'Được dệt từ những sợi len xoắn kết hợp cotton tự nhiên tạo nên bề mặt gồ ghề xúc giác đặc trưng của phong cách Scandinavia. Thoáng mát vào mùa hạ, êm ấm vào mùa đông, ôm ấp cơ thể mang lại trải nghiệm thư thái tuyệt đối.',
      specs: [
        { label: 'Định Lượng Vải', value: '680 g/m² (Dày dặn, đầm tay)' },
        { label: 'Độ Bền Ma Sát', value: '> 50.000 lượt Martindale' },
        { label: 'Tiêu Chuẩn Sức Khỏe', value: 'OEKO-TEX® Standard 100 Quốc Tế' },
      ],
      image: '/images/materials/mat-boucle.jpg',
      badge: 'TACTILE COUTURE',
      themeColor: '#7A6E5D',
      productType: 'ghe',
    },
  ];

  // Dữ liệu mẫu sản phẩm tiêu biểu chuyên sâu Bàn & Ghế (8 sản phẩm tinh tuyển với Swatches màu & Kích thước may đo)
  const featuredProducts = [
    {
      id: 1,
      type: 'ghe',
      name: 'Sofa 3 Chỗ Victoria Da Thật',
      category: 'Ghế & Sofa Phòng Khách',
      price: '38.500.000₫',
      oldPrice: '42.000.000₫',
      image: '/images/products/sofa-3-cho-victoria.jpg',
      secondaryImage: '/images/categories/sofa-3cho.jpg',
      tag: 'Bán chạy',
      dimensions: 'D240 × R100 × C82 cm',
      materialHighlight: 'Da Bò Thảo Mộc Tuscany',
      swatches: [
        { name: 'Cognac Nâu Ấm', hex: '#8C5D3E' },
        { name: 'Kem Ngà Ivory', hex: '#EDE6DD' },
        { name: 'Xám Than Lịch Lãm', hex: '#3A3937' },
      ],
    },
    {
      id: 2,
      type: 'ban',
      name: 'Bàn Ăn Mặt Đá Ceramic Elegance',
      category: 'Bàn Ăn Cao Cấp',
      price: '24.900.000₫',
      oldPrice: '',
      image: '/images/products/ban-an.jpg',
      secondaryImage: '/images/lookbook/lookbook-dining.jpg',
      tag: 'Mới ra mắt',
      dimensions: 'D180 × R90 × C75 cm (Mở rộng 240cm)',
      materialHighlight: 'Đá Ceramic Chống Xước',
      swatches: [
        { name: 'Trắng Calacatta Gold', hex: '#F5F3EF' },
        { name: 'Đen Nero Vân Sét', hex: '#252525' },
        { name: 'Xám Khói Titan', hex: '#7D7C79' },
      ],
    },
    {
      id: 3,
      type: 'ghe',
      name: 'Ghế Thư Giãn Armchair Mây Osaka',
      category: 'Ghế Thư Giãn & Bành',
      price: '14.200.000₫',
      oldPrice: '16.500.000₫',
      image: '/images/products/ghe-thu-gian.jpg',
      secondaryImage: '/images/lookbook/lookbook-armchair.jpg',
      tag: 'Ưu đãi -15%',
      dimensions: 'D82 × R80 × C95 cm',
      materialHighlight: 'Mây Tự Nhiên & Gỗ Sồi',
      swatches: [
        { name: 'Mây Tự Nhiên Ấm', hex: '#C8A97E' },
        { name: 'Gỗ Mun Walnut', hex: '#4E3A2F' },
        { name: 'Sồi Vintage Bắc Âu', hex: '#E2D5C3' },
      ],
    },
    {
      id: 4,
      type: 'ban',
      name: 'Bàn Trà Đôi Mặt Đá Marble Elegance',
      category: 'Bàn Trà Phòng Khách',
      price: '11.500.000₫',
      oldPrice: '',
      image: '/images/products/ban-tra-doi.jpg',
      secondaryImage: '/images/lookbook/lookbook-living.jpg',
      tag: 'Bán chạy',
      dimensions: 'Ø90 × C45 cm & Ø60 × C38 cm',
      materialHighlight: 'Đá Marble & Khung Titan',
      swatches: [
        { name: 'Marble Trắng Mây', hex: '#F0ECE1' },
        { name: 'Marble Đen Vân Chỉ', hex: '#2C2B29' },
        { name: 'Hổ Phách Champagne', hex: '#D4B282' },
      ],
    },
    {
      id: 5,
      type: 'ghe',
      name: 'Sofa Băng Scandinavia Vải Dệt Êm Ái',
      category: 'Sofa Vải Cao Cấp',
      price: '22.800.000₫',
      oldPrice: '25.000.000₫',
      image: '/images/categories/sofa-3cho.jpg',
      secondaryImage: '/images/products/sofa-3-cho-victoria.jpg',
      tag: 'Mới ra mắt',
      dimensions: 'D210 × R92 × C80 cm',
      materialHighlight: 'Vải Dệt Lông Cừu Bouclé',
      swatches: [
        { name: 'Kem Bouclé Ấm', hex: '#EDE7DC' },
        { name: 'Xanh Rêu Sage Mờ', hex: '#717F6C' },
        { name: 'Cam Đất Terracotta', hex: '#A85A3F' },
      ],
    },
    {
      id: 6,
      type: 'ban',
      name: 'Bàn Làm Việc Gỗ Sồi Japandi Modern',
      category: 'Bàn Làm Việc',
      price: '15.900.000₫',
      oldPrice: '',
      image: '/images/categories/phong-lam-viec.jpg',
      secondaryImage: '/images/lookbook/lookbook-dining.jpg',
      tag: 'Độc quyền',
      dimensions: 'D160 × R75 × C75 cm',
      materialHighlight: 'Gỗ Sồi Khối Tự Nhiên',
      swatches: [
        { name: 'Gỗ Sồi Tự Nhiên Sáng', hex: '#DAC2A6' },
        { name: 'Gỗ Óc Chó Nâu Sâu', hex: '#583D2A' },
        { name: 'Sồi Hun Khói Than', hex: '#403A35' },
      ],
    },
    {
      id: 7,
      type: 'ghe',
      name: 'Bộ Ghế Ăn Tựa Mây Duyên Dáng',
      category: 'Ghế Bàn Ăn',
      price: '6.200.000₫',
      oldPrice: '7.500.000₫',
      image: '/images/lookbook/lookbook-dining.jpg',
      secondaryImage: '/images/categories/phong-am.jpg',
      tag: 'Ưa chuộng',
      dimensions: 'D54 × R56 × C84 cm',
      materialHighlight: 'Khung Gỗ Sồi & Tựa Mây',
      swatches: [
        { name: 'Sồi Tự Nhiên & Mây', hex: '#DECDB8' },
        { name: 'Khung Đen Sang Trọng', hex: '#242424' },
        { name: 'Gỗ Walnut Cổ Điển', hex: '#634735' },
      ],
    },
    {
      id: 8,
      type: 'ban',
      name: 'Bàn Tròn Cà Phê Gỗ Óc Chó Nghệ Thuật',
      category: 'Bàn Trà & Bàn Phụ',
      price: '8.600.000₫',
      oldPrice: '',
      image: '/images/lookbook/lookbook-armchair.jpg',
      secondaryImage: '/images/categories/phong-khach.jpg',
      tag: 'Mới ra mắt',
      dimensions: 'Ø75 × C42 cm',
      materialHighlight: 'Gỗ Óc Chó Bắc Mỹ Liền Tấm',
      swatches: [
        { name: 'Óc Chó Bắc Mỹ Nâu', hex: '#523A28' },
        { name: 'Sồi Trắng Tinh Khiết', hex: '#DDCBB7' },
        { name: 'Ash Hạt Dẻ Ấm', hex: '#7E5F46' },
      ],
    },
  ];

  // Danh sách sản phẩm hiển thị theo tab lọc
  const filteredProducts =
    productFilter === 'all'
      ? featuredProducts
      : featuredProducts.filter((p) => p.type === productFilter);

  // Dữ liệu 2 danh mục chủ đạo dạng Tạp chí Kiến trúc phi đối xứng
  const coreCategories = [
    {
      num: '01',
      title: 'GHẾ & SOFA NGHỆ THUẬT',
      subtitle: 'Sofa băng, Armchair thư giãn và ghế bàn ăn bọc da cao cấp',
      link: '/san-pham?danh-muc=sofa',
      image: '/images/categories/sofa-3cho.jpg',
      tag: 'LOOKBOOK 2026',
    },
    {
      num: '02',
      title: 'BÀN ĂN & BÀN TRÀ TINH TẾ',
      subtitle: 'Mặt đá Ceramic chống ố, vân gỗ tự nhiên ấm cúng trường tồn',
      link: '/san-pham?danh-muc=ban',
      image: '/images/categories/ban-an.jpg',
      tag: 'EXCLUSIVE PIECES',
    },
  ];

  // Dữ liệu Đánh Giá Khách Hàng (Testimonials) - Tinh gọn, chân thực
  const testimonials = [
    {
      id: 1,
      name: 'Chị Minh Anh',
      role: 'Kiến trúc sư',
      location: 'Thảo Điền, TP.HCM',
      comment:
        'Bàn ăn đá Ceramic và ghế bọc da TK House rất tinh xảo, đệm ngồi êm ái hàng giờ mà không mỏi. Khách đến thăm ai cũng tấm tắc khen gu bài trí ấm cúng.',
      rating: 5,
      product: 'Bàn ăn Ceramic & Ghế da',
      date: 'Tháng 9/2026',
    },
    {
      id: 2,
      name: 'Anh Hoàng Nam',
      role: 'Chủ nhân Penthouse',
      location: 'Ba Đình, Hà Nội',
      comment:
        'Sofa da thật Victoria sở hữu chất da thảo mộc mịn mát tay, bo cong gỗ sồi hoàn thiện bậc thầy. Cảm giác sang trọng, gần gũi và rất bền đẹp.',
      rating: 5,
      product: 'Sofa Victoria Da Thật',
      date: 'Tháng 8/2026',
    },
    {
      id: 3,
      name: 'Chị Thu Trang',
      role: 'Biệt thự Ecopark',
      location: 'Hưng Yên',
      comment:
        'Chiếc Armchair thư giãn và bàn trà đôi gỗ sồi hoàn thiện mượt mà, thơm mùi gỗ tự nhiên dễ chịu. Đội ngũ giao hàng lắp đặt tận nơi rất chu đáo.',
      rating: 5,
      product: 'Ghế Armchair & Bàn trà đôi',
      date: 'Tháng 9/2026',
    },
  ];

  return (
    <div className="w-full bg-[#F9F6F0] text-[#2C241E] selection:bg-[#E8DCCB] selection:text-[#523A28]">
      {/* 1. HERO BANNER - SLIDER TỰ ĐỘNG VỚI HIỆU ỨNG KEN BURNS (SLOW ZOOM & FADE) */}
      <section className="relative w-full h-[620px] lg:h-[740px] flex items-center justify-center overflow-hidden select-none bg-neutral-900">
        {/* Slides Container với hiệu ứng Crossfade & Ken Burns */}
        {heroSlides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive
                  ? 'opacity-100 z-10 pointer-events-auto'
                  : 'opacity-0 z-0 pointer-events-none'
                }`}
            >
              {/* Ảnh nền có hiệu ứng Ken Burns */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  key={isActive ? `img-active-${slide.id}` : `img-inactive-${slide.id}`}
                  src={slide.image}
                  alt={slide.title}
                  className={`w-full h-full object-cover object-center ${isActive ? 'animate-kenburns' : 'scale-100'
                    }`}
                />
                {/* Lớp phủ chuyển màu ấm cúng, tôn vinh nhiếp ảnh kiến trúc */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-black/25" />
              </div>

              {/* Nội dung Banner từng slide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`max-w-4xl mx-auto px-4 sm:px-6 text-center text-white space-y-5 transition-all duration-700 delay-150 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
                    }`}
                >
                  <p className="text-[11px] sm:text-xs font-semibold tracking-[0.35em] uppercase text-[#E6C280] drop-shadow">
                    {slide.tag}
                  </p>

                  <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-normal tracking-wide italic text-white drop-shadow-md">
                    {slide.title}
                  </h1>

                  <p className="text-sm sm:text-base md:text-lg font-light text-neutral-100 max-w-2xl mx-auto leading-relaxed drop-shadow">
                    {slide.description}
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to={slide.primaryBtn.link}
                      className="w-full sm:w-auto px-8 py-3.5 backdrop-blur-md bg-white/90 text-neutral-900 font-semibold text-xs tracking-widest uppercase hover:bg-neutral-900 hover:text-white rounded-full transition-all duration-300 shadow-xl"
                    >
                      {slide.primaryBtn.text}
                    </Link>

                    {slide.secondaryBtn && (
                      <Link
                        to={slide.secondaryBtn.link}
                        className="w-full sm:w-auto px-8 py-3.5 bg-black/25 border border-white/60 text-white font-semibold text-xs tracking-widest uppercase hover:bg-white hover:text-neutral-900 rounded-full transition-all duration-300 shadow-lg backdrop-blur-sm"
                      >
                        {slide.secondaryBtn.text}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Nút mũi tên chuyển slide thủ công bên Trái */}
        <button
          onClick={handlePrevSlide}
          aria-label="Slide trước"
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group focus:outline-none"
        >
          <ChevronLeft className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
        </button>

        {/* Nút mũi tên chuyển slide thủ công bên Phải */}
        <button
          onClick={handleNextSlide}
          aria-label="Slide tiếp theo"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/25 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg group focus:outline-none"
        >
          <ChevronRight className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
        </button>

        {/* Thanh điều hướng: Các vạch tiến trình (Progress Bar Indicators) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-3">
          {heroSlides.map((_, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={index}
                onClick={() => handleGoToSlide(index)}
                aria-label={`Chuyển sang slide ${index + 1}`}
                className="group py-2 focus:outline-none"
              >
                <div className="w-14 sm:w-20 h-1.5 bg-white/35 rounded-full overflow-hidden backdrop-blur-sm group-hover:bg-white/60 transition-all">
                  {isActive ? (
                    <div
                      key={`progress-${currentSlide}`}
                      className="h-full bg-white rounded-full animate-progress-fill"
                    />
                  ) : (
                    <div className="h-full w-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. TRẢI NGHIỆM KHÔNG GIAN THỰC (INTERACTIVE ROOM HOTSPOT LOOKBOOK) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-[0.3em] text-[#8C5D3E] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C8A97E] animate-pulse" />
              <span>TRẢI NGHIỆM KHÔNG GIAN THỰC TẾ</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#2C241E] font-normal italic">
              Khám Phá Chi Tiết Trong Bối Cảnh Sống
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md leading-relaxed">
            Chạm vào các điểm tròn nhỏ <span className="text-[#8C5D3E] font-medium">●</span> để chiêm ngưỡng tuyệt tác nội thất trong bối cảnh kiến trúc hoàn mỹ.
          </p>
        </div>

        {/* Hotspot Room Visual Container */}
        <div className="relative rounded-3xl lg:rounded-[36px] overflow-hidden border border-[#E8E2D8] bg-[#1a1614] shadow-[0_16px_45px_rgba(0,0,0,0.06)] group">
          {/* Main Room Canvas (Clicking empty area closes the card) */}
          <div
            onClick={() => setActiveHotspot(null)}
            className="relative h-[480px] sm:h-[580px] lg:h-[640px] w-full overflow-hidden select-none cursor-pointer"
          >
            <img
              src="/images/lookbook/lookbook-living.jpg"
              alt="Phối cảnh phòng khách tương tác TK House"
              className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-102"
            />
            {/* Ambient luxury vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/30 pointer-events-none" />

            {/* Top architectural badge */}
            <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10 flex items-center space-x-2.5 pointer-events-none">
              <span className="backdrop-blur-md bg-black/40 text-white/90 text-[11px] font-sans tracking-[0.25em] uppercase px-4 py-1.5 rounded-full border border-white/20">
                LIVING ROOM LOOKBOOK
              </span>
              <span className="hidden sm:inline-flex backdrop-blur-md bg-white/20 text-white text-[11px] font-sans px-3 py-1.5 rounded-full border border-white/20 items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E6C280]" />
                3 Điểm Chạm Tương Tác
              </span>
            </div>

            {/* Interactive Pins */}
            {roomHotspots.map((spot) => {
              const isSelected = activeHotspot === spot.id;
              // Tính toán căn chỉnh card để không bị tràn ra ngoài màn hình
              const leftPercent = parseFloat(spot.coords.left);
              let cardAlignClass = 'left-1/2 -translate-x-1/2';
              if (leftPercent < 30) cardAlignClass = 'left-0 sm:left-1/2 sm:-translate-x-1/2';
              if (leftPercent > 55) cardAlignClass = 'right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2';

              return (
                <div
                  key={spot.id}
                  style={{ top: spot.coords.top, left: spot.coords.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/pin"
                >
                  {/* Subtle, gentle breathing aura (Không còn sóng chớp giật mạnh, nhỏ gọn và thanh tao) */}
                  <span className="absolute -inset-1 rounded-full bg-white/30 opacity-70 animate-pulse pointer-events-none" />

                  {/* Hotspot Pin Button (Nhỏ gọn 24px, nhẹ nhàng tinh tế) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot((prev) => (prev === spot.id ? null : spot.id));
                    }}
                    className={`relative w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-sm ${
                      isSelected
                        ? 'bg-[#8C5D3E] text-white scale-110 shadow-lg ring-2 ring-white/80 border border-white'
                        : 'bg-white/85 text-[#8C5D3E] border border-white/95 hover:bg-white hover:scale-110'
                    }`}
                    aria-label={`Chi tiết ${spot.name}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-transform duration-300 ${
                        isSelected ? 'bg-white' : 'bg-[#8C5D3E]'
                      }`}
                    />
                  </button>

                  {/* Desktop Floating Card Tooltip (Đặt phía trên pin để không che thanh điều khiển bên dưới) */}
                  {isSelected && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`hidden lg:block absolute z-30 bottom-full mb-3.5 ${cardAlignClass} w-68 bg-white/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-[0_12px_32px_rgba(0,0,0,0.2)] border border-[#E8E2D8] transition-all duration-300 animate-in fade-in zoom-in-95 cursor-auto`}
                    >
                      {/* Mũi tên nhỏ trỏ xuống điểm ghim */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-x-[6px] border-x-transparent border-t-[6px] border-t-white" />

                      <div className="flex items-start gap-3">
                        <img
                          src={spot.image}
                          alt={spot.name}
                          className="w-14 h-14 rounded-xl object-cover border border-[#E8E2D8] bg-[#FAF7F2] flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#8C5D3E] font-semibold uppercase tracking-wider truncate">
                              {spot.category}
                            </span>
                            {/* Nút X đóng bảng giá */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveHotspot(null);
                              }}
                              className="w-4 h-4 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors -mr-0.5 -mt-0.5 flex-shrink-0"
                              title="Đóng bảng thông tin"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <h4 className="font-serif text-sm font-normal text-neutral-900 truncate mt-0.5">
                            {spot.name}
                          </h4>
                          <p className="text-xs font-semibold text-neutral-900 mt-0.5">
                            {spot.price}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#F2ECE4] space-y-0.5">
                        <p className="text-[10.5px] text-neutral-500 font-light flex items-center gap-1.5">
                          <Maximize2 className="w-3 h-3 text-[#8C5D3E]" />
                          <span>{spot.dimension}</span>
                        </p>
                        <p className="text-[10.5px] text-neutral-600 font-light line-clamp-1">
                          {spot.material}
                        </p>
                      </div>

                      <div className="mt-2.5">
                        <Link
                          to={spot.link}
                          className="w-full py-2 bg-[#8C5D3E] hover:bg-[#72482E] text-white text-[11px] font-semibold tracking-wider uppercase rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Xem chi tiết sản phẩm</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Floating Control Bar on Mobile / Desktop */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 z-20 cursor-auto"
            >
              <div className="backdrop-blur-xl bg-black/60 border border-white/20 rounded-2xl p-3 sm:p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                {/* 3 Hotspot quick tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  {roomHotspots.map((item) => {
                    const isTabActive = activeHotspot === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setActiveHotspot((prev) => (prev === item.id ? null : item.id))
                        }
                        className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 flex items-center gap-2 border ${
                          isTabActive
                            ? 'bg-white text-neutral-900 border-white shadow-md font-semibold'
                            : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/10'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isTabActive ? 'bg-[#8C5D3E]' : 'bg-[#E6C280]'
                          }`}
                        />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Hotspot Info & CTA (Chỉ hiện khi người dùng chủ động chọn) */}
                {activeHotspot !== null ? (
                  <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-4 border-t md:border-t-0 border-white/15 pt-2.5 md:pt-0 animate-in fade-in duration-200">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] text-[#E6C280] uppercase tracking-wider font-semibold">
                        {roomHotspots[activeHotspot].tag}
                      </p>
                      <p className="text-xs sm:text-sm font-serif italic text-white">
                        {roomHotspots[activeHotspot].price}
                      </p>
                    </div>
                    <Link
                      to={roomHotspots[activeHotspot].link}
                      className="px-4 py-2 sm:px-5 sm:py-2.5 backdrop-blur-md bg-[#8C5D3E] hover:bg-[#72482E] text-white text-[11px] sm:text-xs font-semibold tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:scale-105"
                    >
                      <span>Xem sản phẩm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center justify-end gap-2 text-white/70 text-xs font-light">
                    <Sparkles className="w-3.5 h-3.5 text-[#E6C280]" />
                    <span>Chạm vào điểm tròn trên hình để xem giá và chi tiết</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHỐI 2 BANNER DANH MỤC CHỦ ĐẠO (EDITORIAL ASYMMETRIC LOOKBOOK) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-12 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Banner 1: GHẾ & SOFA (7 Cột, Rộng 58%, Chiều cao thanh thoát) */}
          <Link
            to={coreCategories[0].link}
            className="lg:col-span-7 group relative h-[500px] sm:h-[540px] lg:h-[620px] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] border border-[#E8E2D8] block transition-all duration-700"
          >
            <img
              src={coreCategories[0].image}
              alt={coreCategories[0].title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Lớp phủ ánh sáng chuyển đổi mượt mà */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 group-hover:from-black/85 group-hover:via-black/30 transition-colors duration-700" />

            {/* Badge số thứ tự góc trên phong cách tạp chí */}
            <div className="absolute top-6 left-6 z-10">
              <span className="backdrop-blur-md bg-white/15 text-white/90 text-[11px] font-sans tracking-[0.25em] uppercase px-3.5 py-1.5 rounded-full border border-white/20">
                {coreCategories[0].num} / COLLECTION
              </span>
            </div>

            {/* Nội dung Tạp chí Kiến trúc góc dưới */}
            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2 z-10">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#E6C280] uppercase block">
                {coreCategories[0].tag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal italic tracking-wide drop-shadow-md">
                {coreCategories[0].title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200/90 font-light max-w-md leading-relaxed">
                {coreCategories[0].subtitle}
              </p>
              <div className="pt-2">
                <span className="backdrop-blur-md bg-white/80 group-hover:bg-white text-neutral-900 shadow-xl px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 border border-white/60">
                  Khám phá bộ sưu tập <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Banner 2: BÀN (5 Cột, Rộng 42%, So le thấp hơn lg:mt-14) */}
          <Link
            to={coreCategories[1].link}
            className="lg:col-span-5 group relative h-[460px] sm:h-[500px] lg:h-[550px] lg:mt-14 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] border border-[#E8E2D8] block transition-all duration-700"
          >
            <img
              src={coreCategories[1].image}
              alt={coreCategories[1].title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 group-hover:from-black/85 group-hover:via-black/30 transition-colors duration-700" />

            <div className="absolute top-6 left-6 z-10">
              <span className="backdrop-blur-md bg-white/15 text-white/90 text-[11px] font-sans tracking-[0.25em] uppercase px-3.5 py-1.5 rounded-full border border-white/20">
                {coreCategories[1].num} / COLLECTION
              </span>
            </div>

            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2 z-10">
              <span className="text-xs font-semibold tracking-[0.25em] text-[#E6C280] uppercase block">
                {coreCategories[1].tag}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-normal italic tracking-wide drop-shadow-md">
                {coreCategories[1].title}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-200/90 font-light max-w-sm leading-relaxed">
                {coreCategories[1].subtitle}
              </p>
              <div className="pt-2">
                <span className="backdrop-blur-md bg-white/80 group-hover:bg-white text-neutral-900 shadow-xl px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase inline-flex items-center gap-2 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 border border-white/60">
                  Khám phá bộ sưu tập <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. NGHỆ THUẬT BÀN & GHẾ (CỔNG VÒM KIẾN TRÚC & SO LE ĐỘ CAO) */}
      <section className="bg-[#FAF7F2] border-t border-[#E8E2D8] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2.5 mb-14 sm:mb-16">
            <p className="text-xs font-semibold tracking-[0.3em] text-[#8C5D3E] uppercase">
              NGHỆ THUẬT BÀN & GHẾ
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#2C241E] font-normal italic">
              Tuyệt Tác Cho Không Gian Sống
            </h2>
            <div className="w-14 h-[1.5px] bg-[#C8A97E] mx-auto mt-3" />
            <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-lg mx-auto pt-1 leading-relaxed">
              Từng đường nét chạm khắc, từng điểm uốn cong được sinh ra để nâng niu nếp sống an yên và đong đầy xúc cảm tổ ấm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 group/cards-wrap items-end">
            {featuredCategories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.link}
                className={`group/arch relative overflow-hidden bg-[#F6F2EC] rounded-t-[100px] sm:rounded-t-[120px] lg:rounded-t-[140px] rounded-b-3xl border border-[#E8E2D8] shadow-[0_8px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.12)] transition-all duration-700 ease-out group-hover/cards-wrap:opacity-85 hover:!opacity-100 hover:-translate-y-2.5 ${
                  cat.isTaller
                    ? 'h-[500px] sm:h-[530px] lg:h-[560px] lg:-translate-y-3'
                    : 'h-[460px] sm:h-[480px] lg:h-[510px]'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover/arch:scale-108 transition-transform duration-1000 ease-out"
                />
                {/* Tag vòm trên đỉnh */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
                  <span className="backdrop-blur-md bg-black/30 text-white/90 text-[10px] font-sans tracking-[0.25em] px-3.5 py-1 rounded-full border border-white/20 uppercase shadow-sm">
                    {cat.id} • {cat.tag}
                  </span>
                </div>

                {/* Lớp gradient nâu ấm nghệ thuật làm nổi bật chữ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5 group-hover/arch:from-black/90 transition-colors duration-500" />

                {/* Nội dung thẻ góc dưới */}
                <div className="absolute bottom-7 left-6 right-6 text-white space-y-1.5 z-10">
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-white italic group-hover/arch:translate-x-1 transition-transform duration-300 drop-shadow">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-neutral-200/90 font-light leading-relaxed">
                    {cat.subtitle}
                  </p>
                  <div className="pt-2 flex items-center space-x-1.5 text-xs text-[#E6C280] font-medium opacity-0 group-hover/arch:opacity-100 transition-opacity duration-300">
                    <span>Khám phá bộ sưu tập</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/arch:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SẢN PHẨM NỔI BẬT MỚI NHẤT (DUAL-PHOTO SWAP & CREAM CAROUSEL) */}
      <section className="bg-[#F9F6F0] border-t border-[#E8E2D8] py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.3em] text-[#8C5D3E] uppercase">
                TUYỆT TÁC CHẾ TÁC
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#2C241E] font-normal italic">
                Sản phẩm nổi bật mới nhất
              </h2>
            </div>

            {/* Tab lọc dạng pill tinh tế */}
            <div className="flex items-center gap-2 p-1.5 bg-[#FAF7F2] rounded-full border border-[#E8E2D8] self-start md:self-auto shadow-sm">
              <button
                type="button"
                onClick={() => setProductFilter('all')}
                className={`px-5 py-2 text-xs font-medium rounded-full transition-all duration-300 ${
                  productFilter === 'all'
                    ? 'bg-[#8C5D3E] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/80'
                }`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setProductFilter('ban')}
                className={`px-5 py-2 text-xs font-medium rounded-full transition-all duration-300 ${
                  productFilter === 'ban'
                    ? 'bg-[#8C5D3E] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/80'
                }`}
              >
                Bàn cao cấp
              </button>
              <button
                type="button"
                onClick={() => setProductFilter('ghe')}
                className={`px-5 py-2 text-xs font-medium rounded-full transition-all duration-300 ${
                  productFilter === 'ghe'
                    ? 'bg-[#8C5D3E] text-white shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/80'
                }`}
              >
                Ghế & Sofa
              </button>
            </div>

            <div className="hidden lg:block">
              <Link
                to="/san-pham"
                className="group inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-neutral-800 hover:text-[#8C5D3E] transition-colors pb-1 border-b border-neutral-400 hover:border-[#8C5D3E]"
              >
                <span>Xem tất cả sản phẩm</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Carousel trượt ngang kèm Floating Navigation Arrows */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => scrollProducts('left')}
              className="absolute -left-3 sm:-left-5 top-[150px] sm:top-[160px] -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-md bg-white/90 text-neutral-800 hover:bg-[#8C5D3E] hover:text-white border border-[#E8E2D8] shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="Lướt sang trái"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2]" />
            </button>

            <div
              ref={productScrollRef}
              className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-1 snap-x snap-mandatory px-1"
            >
              {filteredProducts.map((p) => {
                const activeSwatchIdx = selectedSwatches[p.id] ?? 0;
                const activeSwatch = p.swatches?.[activeSwatchIdx] || p.swatches?.[0];

                return (
                  <div
                    key={p.id}
                    className="w-[285px] sm:w-[315px] lg:w-[335px] flex-shrink-0 snap-start group/card bg-white rounded-3xl p-4 sm:p-5 border border-[#E8E2D8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.09)] hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between"
                  >
                    {/* Top: Image frame with Dual-photo swap & floating badges */}
                    <div>
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2]">
                        {/* Primary Image */}
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover/card:scale-106 transition-all duration-700 ease-out"
                        />
                        {/* Secondary Image (Dual-photo swap) */}
                        <img
                          src={p.secondaryImage || p.image}
                          alt={`${p.name} phối cảnh không gian`}
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover/card:opacity-100 group-hover/card:scale-106 transition-all duration-700 ease-in-out"
                        />

                        {/* Tag be đất sang trọng */}
                        {p.tag && (
                          <span className="absolute top-3 left-3 bg-[#F2ECE4] text-[#8C5D3E] border border-[#E2D8CC] text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full uppercase shadow-sm">
                            {p.tag}
                          </span>
                        )}

                        {/* Quick actions trên mặt kính mờ */}
                        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-full backdrop-blur-md bg-white/90 text-neutral-800 hover:bg-[#8C5D3E] hover:text-white flex items-center justify-center shadow-md transition-colors border border-white/60"
                            title="Thêm vào yêu thích"
                          >
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/san-pham/${p.id}`}
                            className="w-8 h-8 rounded-full backdrop-blur-md bg-white/90 text-neutral-800 hover:bg-[#8C5D3E] hover:text-white flex items-center justify-center shadow-md transition-colors border border-white/60"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        {/* Architectural Dimensions Tag hover overlay */}
                        {p.dimensions && (
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 backdrop-blur-md bg-black/60 text-white rounded-xl px-2.5 py-1 text-[10px] font-mono tracking-tight flex items-center justify-between opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 border border-white/20">
                            <span className="flex items-center gap-1">
                              <Maximize2 className="w-2.5 h-2.5 text-[#E6C280]" />
                              <span>{p.dimensions}</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Swatch Selector Dots & Active Color Label */}
                      {p.swatches && p.swatches.length > 0 && (
                        <div className="pt-3 pb-1 flex items-center justify-between">
                          <div className="flex items-center space-x-1.5">
                            {p.swatches.map((swatch, sIdx) => {
                              const isSwatchActive = activeSwatchIdx === sIdx;
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() =>
                                    setSelectedSwatches((prev) => ({
                                      ...prev,
                                      [p.id]: sIdx,
                                    }))
                                  }
                                  className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                                    isSwatchActive
                                      ? 'ring-2 ring-[#8C5D3E] ring-offset-2 scale-110 border-white'
                                      : 'border-black/15 hover:scale-110'
                                  }`}
                                  style={{ backgroundColor: swatch.hex }}
                                  title={swatch.name}
                                  aria-label={`Chọn màu ${swatch.name}`}
                                />
                              );
                            })}
                          </div>
                          <span className="text-[10px] text-neutral-500 font-light truncate max-w-[150px]">
                            {activeSwatch?.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom: Info, Specs, Price, CTA */}
                    <div className="pt-2 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-[#8C5D3E] uppercase tracking-wider font-semibold">
                            {p.category}
                          </p>
                          {p.materialHighlight && (
                            <span className="text-[10px] text-neutral-400 font-light hidden sm:inline">
                              {p.materialHighlight}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-[15px] sm:text-base font-normal text-neutral-900 line-clamp-1 hover:text-[#8C5D3E] transition-colors mt-1">
                          <Link to={`/san-pham/${p.id}`}>{p.name}</Link>
                        </h3>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[#F2ECE4]">
                        <div>
                          <span className="text-[15px] sm:text-base font-semibold text-neutral-900">
                            {p.price}
                          </span>
                          {p.oldPrice && (
                            <span className="text-xs text-neutral-400 line-through ml-2 font-light">
                              {p.oldPrice}
                            </span>
                          )}
                        </div>
                        <Link
                          to={`/san-pham/${p.id}`}
                          className="w-9 h-9 rounded-full bg-[#FAF7F2] hover:bg-[#8C5D3E] text-neutral-700 hover:text-white flex items-center justify-center transition-all duration-300 border border-[#E8E2D8] hover:border-[#8C5D3E] shadow-sm"
                          title="Xem chi tiết"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollProducts('right')}
              className="absolute -right-3 sm:-right-5 top-[150px] sm:top-[160px] -translate-y-1/2 z-20 w-12 h-12 rounded-full backdrop-blur-md bg-white/90 text-neutral-800 hover:bg-[#8C5D3E] hover:text-white border border-[#E8E2D8] shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 focus:outline-none"
              aria-label="Lướt sang phải"
            >
              <ChevronRight className="w-5 h-5 stroke-[2]" />
            </button>
          </div>

          <div className="mt-8 text-center lg:hidden">
            <Link
              to="/san-pham"
              className="inline-flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-neutral-900 hover:text-[#8C5D3E] transition-colors py-3 px-7 bg-white border border-[#E8E2D8] rounded-full shadow-sm"
            >
              <span>Xem tất cả sản phẩm</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BẢN GIAO HƯỞNG CHẤT LIỆU XA XỈ (SYMPHONY OF NOBLE MATERIALS) */}
      <section className="bg-[#FAF7F2] border-t border-[#E8E2D8] py-20 sm:py-28 relative overflow-hidden">
        {/* Watermark typography chìm */}
        <div className="font-serif text-[75px] sm:text-[120px] lg:text-[160px] font-bold text-[#EFEAE1]/60 absolute -top-5 sm:-top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none whitespace-nowrap z-0 italic tracking-wider">
          NOBLE MATERIALS
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center space-y-2.5 mb-12 sm:mb-14">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-[0.3em] text-[#8C5D3E] uppercase">
              <span className="w-2 h-2 rounded-full bg-[#C8A97E]" />
              <span>TRIẾT LÝ VẬT LIỆU THƯỢNG HẠNG</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#2C241E] font-normal italic">
              Bản Giao Hưởng Chất Liệu Xa Xỉ
            </h2>
            <div className="w-14 h-[1.5px] bg-[#C8A97E] mx-auto mt-3" />
            <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-xl mx-auto pt-1 leading-relaxed">
              Vẻ đẹp đích thực bắt nguồn từ sự nguyên bản. Chúng tôi tuyển chọn 4 chất liệu danh giá nhất thế giới để định hình nên linh hồn của từng tác phẩm nội thất.
            </p>
          </div>

          {/* 4 Tabs Selector Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
            {luxuryMaterials.map((mat) => {
              const isMatActive = activeMaterial === mat.id;
              return (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => setActiveMaterial(mat.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 flex items-center gap-3.5 shadow-sm ${
                    isMatActive
                      ? 'bg-white border-[#8C5D3E] shadow-[0_8px_25px_rgba(140,93,62,0.12)] -translate-y-1'
                      : 'bg-white/70 hover:bg-white border-[#E8E2D8] hover:border-[#C8A97E]'
                  }`}
                >
                  <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 border border-[#E8E2D8]">
                    <img
                      src={mat.image}
                      alt={mat.name}
                      className="w-full h-full object-cover"
                    />
                    {isMatActive && (
                      <div className="absolute inset-0 bg-[#8C5D3E]/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-[#8C5D3E] font-semibold uppercase tracking-wider block">
                      {mat.badge}
                    </span>
                    <h3 className="font-serif text-xs sm:text-sm font-normal text-neutral-900 truncate">
                      {mat.name}
                    </h3>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Material Editorial Showcase (2 Columns) */}
          {(() => {
            const currentMat = luxuryMaterials.find((m) => m.id === activeMaterial) || luxuryMaterials[0];
            return (
              <div className="bg-white rounded-3xl border border-[#E8E2D8] shadow-[0_12px_40px_rgba(0,0,0,0.04)] p-6 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                {/* Column 1: Macro Photography Showcase */}
                <div className="lg:col-span-6 relative group">
                  <div className="relative h-[340px] sm:h-[420px] lg:h-[460px] w-full rounded-2xl overflow-hidden border border-[#E8E2D8] shadow-md bg-[#F2ECE4]">
                    <img
                      src={currentMat.image}
                      alt={currentMat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Inspection badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="backdrop-blur-md bg-black/50 text-white/90 text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full border border-white/20 inline-flex items-center gap-1.5">
                        <ZoomIn className="w-3 h-3 text-[#E6C280]" />
                        MACRO TEXTURE 100%
                      </span>
                    </div>

                    {/* Origin badge bottom */}
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="backdrop-blur-md bg-black/60 text-white p-3 rounded-xl border border-white/20">
                        <p className="text-[10px] text-[#E6C280] uppercase tracking-wider font-semibold">
                          Xuất xứ nguyên liệu
                        </p>
                        <p className="text-xs sm:text-sm font-light text-neutral-100 truncate">
                          {currentMat.origin}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 2: Material Narrative & Technical Specs */}
                <div className="lg:col-span-6 space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold tracking-[0.25em] text-[#8C5D3E] uppercase block">
                      {currentMat.badge}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-neutral-900 font-normal italic">
                      {currentMat.name}
                    </h3>
                  </div>

                  <blockquote className="border-l-2 border-[#C8A97E] pl-4 py-1 text-xs sm:text-sm font-serif italic text-neutral-800 leading-relaxed bg-[#FAF7F2] rounded-r-xl">
                    {currentMat.tagline}
                  </blockquote>

                  <p className="text-xs sm:text-[13.5px] text-neutral-600 font-light leading-relaxed">
                    {currentMat.description}
                  </p>

                  {/* 3 Technical Specs Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {currentMat.specs.map((spec, spIdx) => (
                      <div
                        key={spIdx}
                        className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D8] space-y-1"
                      >
                        <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-medium">
                          {spec.label}
                        </span>
                        <span className="text-xs font-semibold text-neutral-900 block leading-snug">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <Link
                      to={`/san-pham?danh-muc=${currentMat.productType}`}
                      className="px-7 py-3.5 bg-[#8C5D3E] hover:bg-[#72482E] text-white rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-md inline-flex items-center justify-center gap-2"
                    >
                      <span>Khám phá sản phẩm {currentMat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 6. DỊCH VỤ THIẾT KẾ NỘI THẤT (OVERLAPPING COLLAGE LAYOUT) */}
      <section id="thiet-ke-noi-that" className="w-full bg-[#FAF7F2] py-20 sm:py-28 border-t border-[#E8E2D8] relative overflow-hidden scroll-mt-20 sm:scroll-mt-24">
        {/* Watermark typography chìm nghệ thuật */}
        <div className="font-serif text-[80px] sm:text-[130px] lg:text-[170px] font-bold text-[#EFEAE1]/60 absolute -top-6 sm:-top-10 left-1/2 -translate-x-1/2 select-none pointer-events-none whitespace-nowrap z-0 italic tracking-wider">
          ARCHITECTURAL
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-[#E8E2D8] p-8 sm:p-12 lg:p-16 shadow-[0_12px_40px_rgba(0,0,0,0.04)] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Cột trái: Văn bản & Triết lý thiết kế */}
            <div className="lg:col-span-6 flex flex-col justify-center items-start space-y-5">
              <div className="inline-flex items-center space-x-2 text-xs font-semibold tracking-[0.3em] text-[#8C5D3E] uppercase">
                <span className="w-2 h-2 rounded-full bg-[#C8A97E]" />
                <span>DỊCH VỤ THIẾT KẾ ĐỘC BẢN</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] text-neutral-900 font-normal leading-[1.25]">
                Tư Vấn & May Đo <br className="hidden sm:inline" />
                <span className="italic font-normal text-neutral-800">Không Gian Tổ Ấm</span>
              </h2>

              <blockquote className="border-l-2 border-[#C8A97E] pl-4 py-1 text-xs sm:text-[13.5px] font-serif italic text-neutral-700 leading-relaxed bg-[#FAF7F2]/80 rounded-r-xl">
                “Chúng tôi không chỉ sắp đặt bàn và ghế, chúng tôi tạo nên những khoảng lặng bình yên nơi tâm hồn được trở về.”
              </blockquote>

              <p className="text-xs sm:text-[13.5px] text-neutral-600 font-light leading-relaxed max-w-lg">
                Với hơn 27 năm kinh nghiệm cùng đội ngũ kiến trúc sư tận tâm, TK House mang đến giải pháp bài trí bàn ghế tương thích hoàn hảo với phong thủy và ánh sáng tự nhiên, biến mỗi góc nhà thành một tác phẩm nghệ thuật sống động.
              </p>

              <div className="space-y-2.5 pt-1 text-xs sm:text-[13px] text-neutral-700">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#8C5D3E]" />
                  <span className="font-light">Phác thảo phối cảnh 3D trực quan & may đo kích thước chuẩn xác</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#8C5D3E]" />
                  <span className="font-light">Chất liệu gỗ tự nhiên & đá Ceramic nhập khẩu cao cấp</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#8C5D3E]" />
                  <span className="font-light">Bảo hành hoàn thiện 5 năm & chăm sóc định kỳ tận tâm</span>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/thiet-ke-noi-that"
                  className="px-8 py-3.5 bg-[#8C5D3E] hover:bg-[#72482E] text-white rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-xl inline-flex items-center gap-2.5"
                >
                  <span>Nhận tư vấn thiết kế 3D</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Cột phải: Overlapping collage ảnh thiết kế */}
            <div className="lg:col-span-6 relative">
              <div className="relative h-80 sm:h-[400px] lg:h-[440px] w-full rounded-3xl overflow-hidden shadow-lg border border-[#E8E2D8] bg-neutral-100">
                <img
                  src="/images/banners/thiet-ke.jpg"
                  alt="Thiết kế nội thất TK House"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              {/* Floating badge chi tiết chồng lên góc ảnh */}
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-[#E8E2D8] hidden sm:flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-full bg-[#FAF7F2] border border-[#C8A97E] flex items-center justify-center text-[#8C5D3E]">
                  <Sparkles className="w-5 h-5 text-[#C8A97E]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900 tracking-wide">
                    Bảo hành chuẩn 5 năm
                  </p>
                  <p className="text-[11px] text-neutral-500 font-light">
                    Cam kết chất lượng thủ công
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PHẦN CÂU CHUYỆN THƯƠNG HIỆU (ROTATING SEAL & EDITORIAL COLLAGE) */}
      <section id="cau-chuyen-thuong-hieu" className="w-full bg-[#F9F6F0] pt-16 sm:pt-24 pb-20 sm:pb-28 border-t border-[#E8E2D8] scroll-mt-20 sm:scroll-mt-24 relative overflow-hidden">
        {/* Watermark typography chìm */}
        <div className="font-serif text-[70px] sm:text-[110px] lg:text-[150px] font-bold text-[#EFEAE1]/60 absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 select-none pointer-events-none whitespace-nowrap z-0 italic tracking-wider">
          HERITAGE CRAFT
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tiêu đề mục */}
          <div className="text-center mb-14 sm:mb-16">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-[#8C5D3E] uppercase block">
              CÂU CHUYỆN THƯƠNG HIỆU
            </span>
            <div className="w-14 h-[1.5px] bg-[#C8A97E] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* CỘT TRÁI: Bố cục 2 ảnh so le nghệ thuật + Rotating circular seal badge */}
            <div className="lg:col-span-6 relative pb-10 sm:pb-14 pr-6 sm:pr-10">
              {/* Rotating Circular Stamp Badge */}
              <div className="absolute -top-7 -right-7 sm:-top-8 sm:-right-8 z-20 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center pointer-events-none">
                <div className="relative w-full h-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <path
                      id="circlePath"
                      d="M 60, 60 m -44, 0 a 44,44 0 1,1 88,0 a 44,44 0 1,1 -88,0"
                      fill="transparent"
                    />
                    <text className="text-[10px] font-semibold uppercase tracking-[0.22em] fill-[#8C5D3E]">
                      <textPath href="#circlePath" startOffset="0%">
                        TK HOUSE • HANDCRAFTED QUALITY • SINCE 1999 •
                      </textPath>
                    </text>
                  </svg>
                </div>
                <div className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#C8A97E] shadow-sm flex items-center justify-center text-[#8C5D3E]">
                  <Sparkles className="w-5 h-5 text-[#C8A97E]" />
                </div>
              </div>

              {/* Ảnh lớn chính */}
              <div className="relative aspect-[4/5] sm:aspect-[3/4] w-[82%] sm:w-[84%] overflow-hidden rounded-3xl shadow-lg border border-[#E8E2D8] bg-neutral-200">
                <img
                  src="/images/story/st1.jpg"
                  alt="Không gian sống êm dịu TK House"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              {/* Ảnh nhỏ chi tiết cận cảnh đổ bóng mờ mềm mại */}
              <div className="absolute right-0 bottom-0 w-[52%] sm:w-[48%] aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl border-4 sm:border-[6px] border-[#F9F6F0] bg-neutral-100">
                <img
                  src="/images/story/st2.jpg"
                  alt="Chi tiết thủ công tỉ mỉ"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              <div className="absolute -top-3 -left-3 w-24 h-24 border-t border-l border-[#C8A97E]/40 -z-0 hidden sm:block pointer-events-none" />
            </div>

            {/* CỘT PHẢI: Nội dung tự sự nhẹ nhàng, font serif mềm mại */}
            <div className="lg:col-span-6 space-y-6 lg:pl-6">
              <div className="space-y-2.5">
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-[40px] font-normal text-neutral-900 leading-[1.25] tracking-normal">
                  Nơi chốn đi về, <br className="hidden sm:inline" />
                  <span className="italic font-normal text-neutral-800">khơi nguồn xúc cảm an yên</span>
                </h2>
              </div>

              <div className="space-y-3.5 text-xs sm:text-[13.5px] text-neutral-600 font-light leading-relaxed">
                <p>
                  Với <strong className="font-medium text-neutral-900">TK House</strong>, mỗi chiếc bàn chiếc ghế không đơn thuần là vật dụng bài trí trong bốn bức tường, mà là một thực thể sống chứa đựng linh hồn, văn hóa và từng nhịp thở êm đềm của năm tháng.
                </p>
                <p>
                  Chúng tôi chắt lọc sự chuẩn mực của ngôn ngữ thiết kế đương đại hòa quyện cùng nét đằm thắm, ấm cúng của nếp nhà Việt. Từng đường cong mềm mại của gỗ, từng thớ vải da tinh tuyển hay bề mặt đá mát lành đều được tạo tác để nâng niu từng giác quan và lưu giữ trọn vẹn những phút giây gắn kết gia đình.
                </p>
              </div>

              {/* Trích dẫn nổi bật viền nét mỏng màu đồng */}
              <blockquote className="border-l-2 border-[#C8A97E] pl-5 py-2 text-xs sm:text-sm font-serif italic text-neutral-800 leading-relaxed bg-[#FAF7F2] rounded-r-xl border border-y-[#E8E2D8] border-r-[#E8E2D8]">
                “Một ngôi nhà đẹp không chỉ đo bằng thước tấc vật liệu, mà được đong đầy bằng sự dịu dàng của ánh sáng và cảm giác thuộc về.”
              </blockquote>

              {/* 3 Huy hiệu thông số nhỏ */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-white/80 rounded-2xl border border-[#E8E2D8] text-center">
                  <span className="block font-serif text-xl sm:text-2xl text-[#8C5D3E] font-medium">27+</span>
                  <span className="text-[10px] sm:text-[11px] text-neutral-500 font-light uppercase tracking-wider">Năm Chế Tác</span>
                </div>
                <div className="p-3 bg-white/80 rounded-2xl border border-[#E8E2D8] text-center">
                  <span className="block font-serif text-xl sm:text-2xl text-[#8C5D3E] font-medium">100%</span>
                  <span className="text-[10px] sm:text-[11px] text-neutral-500 font-light uppercase tracking-wider">Gỗ Tự Nhiên</span>
                </div>
                <div className="p-3 bg-white/80 rounded-2xl border border-[#E8E2D8] text-center">
                  <span className="block font-serif text-xl sm:text-2xl text-[#8C5D3E] font-medium">10K+</span>
                  <span className="text-[10px] sm:text-[11px] text-neutral-500 font-light uppercase tracking-wider">Tổ Ấm Hoàn Mỹ</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/cau-chuyen"
                  className="group inline-flex items-center space-x-2 text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:text-[#8C5D3E] transition-colors pb-1 border-b border-neutral-900 hover:border-[#8C5D3E]"
                >
                  <span>KHÁM PHÁ CÂU CHUYỆN TK HOUSE</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ĐÁNH GIÁ TỪ KHÁCH HÀNG (TESTIMONIALS) - TINH GỌN, SANG TRỌNG */}
      <section className="bg-[#FAF7F2] py-12 sm:py-16 border-t border-[#E8E2D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header thu gọn */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-[#E8E2D8] pb-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-500 mb-1">
                <div className="flex space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-neutral-800 tracking-wide">5.0 / 5.0</span>
                <span className="text-neutral-400">•</span>
                <span className="text-xs text-neutral-500 font-light">Hơn 10.000+ khách hàng hài lòng</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-neutral-900 font-normal italic">
                Khách Hàng Nói Gì Về TK House
              </h2>
            </div>
            <p className="text-xs text-neutral-500 font-light sm:text-right">
              Chất lượng gỗ tự nhiên, da thật và độ hoàn thiện bậc thầy.
            </p>
          </div>

          {/* 3 Thẻ đánh giá nhỏ gọn */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.06)] border border-[#E8E2D8] transition-all duration-300 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-0.5 text-amber-400">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#8C5D3E] bg-[#F2ECE4] border border-[#E2D8CC] font-medium px-2.5 py-0.5 rounded-full">
                      {item.product}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 font-light leading-relaxed italic">
                    "{item.comment}"
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F2ECE4] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-xs">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-light">
                      {item.role} • {item.location}
                    </p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-light">
                    {item.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
