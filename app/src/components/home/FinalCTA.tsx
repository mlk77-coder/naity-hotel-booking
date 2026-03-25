import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const FinalCTA = () => {
  const navigate = useNavigate();
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  return (
    <section className="py-20 gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 start-10 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 end-10 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center max-w-xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            {tx("ابدأ رحلتك الآن مع", "Start Your Journey with")}{" "}
            <span className="text-primary">Naity</span>
          </h2>
          <p className="text-muted-foreground text-sm">
            {tx("اكتشف أفضل الفنادق في سوريا واحجز إقامتك المثالية بخطوات بسيطة", "Discover the best hotels in Syria and book your perfect stay in simple steps")}
          </p>
          <button onClick={() => navigate("/search")}
            className="gradient-cta text-primary-foreground px-8 py-3.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity shadow-elevated">
            <Search className="w-4 h-4" />
            {tx("ابحث عن فندق", "Search Hotels")}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
