import { motion } from "framer-motion";
import { Search, BarChart3, CalendarCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const HowItWorksSection = () => {
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  const steps = [
    { icon: Search, step: "1", title: tx("ابحث عن الفندق", "Search for a Hotel"), desc: tx("أدخل وجهتك وتواريخ إقامتك للعثور على أفضل الفنادق المتاحة", "Enter your destination and stay dates to find the best available hotels") },
    { icon: BarChart3, step: "2", title: tx("قارن الأسعار والتقييمات", "Compare Prices & Ratings"), desc: tx("استعرض الأسعار والتقييمات والمرافق لاختيار الفندق المثالي لك", "Browse prices, ratings, and amenities to choose your ideal hotel") },
    { icon: CalendarCheck, step: "3", title: tx("احجز فوراً", "Book Instantly"), desc: tx("أكمل حجزك في ثوانٍ واحصل على تأكيد فوري مباشرة من الفندق", "Complete your booking in seconds and get instant confirmation directly from the hotel") },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{tx("كيف يعمل Naity؟", "How Naity Works")}</h2>
          <p className="text-muted-foreground text-sm">{tx("ثلاث خطوات بسيطة للحجز", "Three simple steps to book")}</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="text-center space-y-4 relative">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 start-[60%] w-[80%] h-px border-t-2 border-dashed border-primary/20" />
              )}
              <div className="relative mx-auto w-16 h-16">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <span className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">{s.step}</span>
              </div>
              <h3 className="font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
