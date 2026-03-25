export interface Hotel {
  id: number;
  name: string;
  city: string;
  stars: number;
  pricePerNight: number;
  image: string;
  description: string;
  amenities: string[];
  rating: number;
  reviewCount: number;
}

export interface Room {
  id: number;
  hotelId: number;
  type: string;
  price: number;
  capacity: number;
  available: boolean;
  amenities: string[];
  image: string;
}

export const hotels: Hotel[] = [
  {
    id: 1,
    name: "منتجع أزور مارينا",
    city: "دبي",
    stars: 5,
    pricePerNight: 320,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    description: "منتجع فاخر على الشاطئ مع إطلالات خلابة على الخليج العربي. استمتع بتجربة طعام عالمية وعلاجات سبا وشاطئ خاص.",
    amenities: ["مسبح", "سبا", "شاطئ خاص", "مطعم", "صالة رياضية", "واي فاي", "خدمة الغرف", "موقف سيارات"],
    rating: 4.8,
    reviewCount: 1240,
  },
  {
    id: 2,
    name: "فندق القصر الكبير",
    city: "إسطنبول",
    stars: 5,
    pricePerNight: 250,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
    description: "أناقة تاريخية تلتقي بالفخامة العصرية في قلب إسطنبول. يطل على البوسفور مع ضيافة تركية استثنائية.",
    amenities: ["مسبح", "سبا", "مطعم", "بار", "صالة رياضية", "واي فاي", "كونسيرج", "خدمة صف السيارات"],
    rating: 4.7,
    reviewCount: 890,
  },
  {
    id: 3,
    name: "فندق سكاي لاين للأعمال",
    city: "الرياض",
    stars: 4,
    pricePerNight: 180,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    description: "فندق أعمال عصري في الحي المالي بالرياض. مثالي لرجال الأعمال الباحثين عن الراحة والملاءمة.",
    amenities: ["مركز أعمال", "مطعم", "صالة رياضية", "واي فاي", "قاعات اجتماعات", "موقف سيارات"],
    rating: 4.5,
    reviewCount: 560,
  },
  {
    id: 4,
    name: "فندق واحة الحديقة",
    city: "مراكش",
    stars: 4,
    pricePerNight: 150,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    description: "ملاذ هادئ محاط بحدائق غنّاء في قلب مراكش. عمارة رياض تقليدية مع وسائل راحة عصرية.",
    amenities: ["مسبح", "حديقة", "مطعم", "سبا", "واي فاي", "نقل من المطار"],
    rating: 4.6,
    reviewCount: 720,
  },
  {
    id: 5,
    name: "نزل نسيم الساحل",
    city: "الدار البيضاء",
    stars: 3,
    pricePerNight: 95,
    image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
    description: "فندق ساحلي ساحر مع إطلالات على المحيط وضيافة مغربية دافئة. مثالي للمسافرين بميزانية محدودة.",
    amenities: ["مطعم", "واي فاي", "تراس", "موقف سيارات", "غسيل"],
    rating: 4.3,
    reviewCount: 340,
  },
  {
    id: 6,
    name: "فندق قمة المرتفعات",
    city: "عمّان",
    stars: 4,
    pricePerNight: 130,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    description: "فخامة راقية في عمّان مع إطلالات بانورامية على المدينة. مزيج من السحر الأردني والتصميم المعاصر.",
    amenities: ["مسبح", "مطعم", "بار", "صالة رياضية", "واي فاي", "سبا", "موقف سيارات"],
    rating: 4.4,
    reviewCount: 480,
  },
];

export const getRooms = (hotelId: number): Room[] => [
  {
    id: 1,
    hotelId,
    type: "غرفة قياسية",
    price: hotels.find(h => h.id === hotelId)?.pricePerNight || 100,
    capacity: 2,
    available: true,
    amenities: ["سرير كينغ", "واي فاي", "تلفزيون", "ميني بار"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  },
  {
    id: 2,
    hotelId,
    type: "جناح ديلوكس",
    price: Math.round((hotels.find(h => h.id === hotelId)?.pricePerNight || 100) * 1.6),
    capacity: 2,
    available: true,
    amenities: ["سرير كينغ", "صالة جلوس", "واي فاي", "تلفزيون", "ميني بار", "شرفة"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d955f4e24?w=600&q=80",
  },
  {
    id: 3,
    hotelId,
    type: "غرفة عائلية",
    price: Math.round((hotels.find(h => h.id === hotelId)?.pricePerNight || 100) * 1.3),
    capacity: 4,
    available: true,
    amenities: ["سريرين كوين", "واي فاي", "تلفزيون", "ميني بار", "مساحة إضافية"],
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&q=80",
  },
  {
    id: 4,
    hotelId,
    type: "الجناح الرئاسي",
    price: Math.round((hotels.find(h => h.id === hotelId)?.pricePerNight || 100) * 3),
    capacity: 2,
    available: false,
    amenities: ["سرير كينغ", "غرفة معيشة", "غرفة طعام", "خدمة كبير الخدم", "جاكوزي", "إطلالة بانورامية"],
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  },
];

export const cities = ["دبي", "إسطنبول", "الرياض", "مراكش", "الدار البيضاء", "عمّان"];
