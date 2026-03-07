import { motion } from "framer-motion";
import { BadgeDollarSign, Zap, Headphones, MessageSquareText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const WhyBookSection = () => {
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  const cards = [
    { icon: BadgeDollarSign, title: tx("أفضل سعر مضمون", "Best Price Guaranteed"), desc: tx("نضمن لك أفضل الأسعار المتاحة مباشرة من الفنادق بدون عمولات إضافية", "We guarantee the best prices directly from hotels with no extra commissions") },
    { icon: Zap, title: tx("حجز فوري", "Instant Booking"), desc: tx("احجز غرفتك فوراً مع تأكيد لحظي عبر الاتصال المباشر بنظام الفندق", "Book your room instantly with real-time confirmation via direct hotel connection") },
    { icon: Headphones, title: tx("دعم فني 24/7", "24/7 Support"), desc: tx("فريق الدعم متاح على مدار الساعة لمساعدتك في أي استفسار", "Our support team is available around the clock for any inquiry") },
    { icon: MessageSquareText, title: tx("تقييمات حقيقية من النزلاء", "Real Guest Reviews"), desc: tx("تقييمات موثوقة من ضيوف حقيقيين لمساعدتك في اختيار الفندق المناسب", "Verified reviews from real guests to help you choose the right hotel") },
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{tx("لماذا تحجز مع Naity؟", "Why Book with Naity?")}</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center space-y-3 hover:shadow-elevated transition-shadow">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
                <card.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBookSection;
