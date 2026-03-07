import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const CustomerReviews = () => {
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  const reviews = [
    {
      name: tx("أحمد محمد", "Ahmad Mohammad"),
      rating: 5,
      text: tx("تجربة حجز ممتازة! الموقع سهل الاستخدام والتأكيد كان فورياً. الفندق كان تماماً كما في الصور.", "Excellent booking experience! The site is easy to use and confirmation was instant. The hotel was exactly as shown."),
      city: tx("دمشق", "Damascus"),
    },
    {
      name: tx("سارة الحسن", "Sara Al-Hasan"),
      rating: 5,
      text: tx("أفضل منصة لحجز الفنادق في سوريا. الأسعار شفافة وبدون رسوم مخفية. أنصح بها بشدة!", "Best hotel booking platform in Syria. Transparent prices with no hidden fees. Highly recommended!"),
      city: tx("حلب", "Aleppo"),
    },
    {
      name: tx("خالد العلي", "Khaled Al-Ali"),
      rating: 4,
      text: tx("حجزت فندقاً في اللاذقية عبر Naity وكانت التجربة سلسة جداً. خدمة العملاء ممتازة ومتجاوبة.", "Booked a hotel in Lattakia through Naity and the experience was very smooth. Customer service is excellent and responsive."),
      city: tx("اللاذقية", "Lattakia"),
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{tx("آراء عملائنا", "What Our Guests Say")}</h2>
          <p className="text-muted-foreground text-sm">{tx("تجارب حقيقية من ضيوف حجزوا عبر Naity", "Real experiences from guests who booked through Naity")}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-4 relative">
              <Quote className="w-8 h-8 text-primary/15 absolute top-4 end-4" />
              <div className="flex items-center gap-1">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
                {Array.from({ length: 5 - review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-border" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
              <div className="pt-2 border-t border-border/50">
                <p className="font-semibold text-foreground text-sm">{review.name}</p>
                <p className="text-xs text-muted-foreground">{review.city}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
