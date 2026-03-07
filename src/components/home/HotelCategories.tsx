import { motion } from "framer-motion";
import { Crown, Wallet, Palmtree, Users, Building2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const HotelCategories = () => {
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  const categories = [
    { icon: Crown, title: tx("فنادق فاخرة", "Luxury Hotels"), desc: tx("إقامة استثنائية مع خدمات 5 نجوم", "Exceptional stays with 5-star services") },
    { icon: Wallet, title: tx("فنادق اقتصادية", "Budget Hotels"), desc: tx("إقامة مريحة بأسعار معقولة", "Comfortable stays at affordable prices") },
    { icon: Palmtree, title: tx("منتجعات", "Resorts"), desc: tx("استرخاء تام في أجمل المواقع", "Total relaxation in stunning locations") },
    { icon: Users, title: tx("فنادق عائلية", "Family Hotels"), desc: tx("مساحات واسعة ومرافق للعائلات", "Spacious rooms & family amenities") },
    { icon: Building2, title: tx("شقق فندقية", "Serviced Apartments"), desc: tx("خصوصية الشقة مع خدمات الفندق", "Apartment privacy with hotel services") },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{tx("تصفح حسب النوع", "Browse by Category")}</h2>
          <p className="text-muted-foreground text-sm">{tx("اختر نوع الإقامة المناسب لك", "Choose the accommodation that suits you")}</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="group bg-card rounded-2xl p-5 border border-border/50 shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 text-center space-y-3 cursor-pointer">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <cat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{cat.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HotelCategories;
