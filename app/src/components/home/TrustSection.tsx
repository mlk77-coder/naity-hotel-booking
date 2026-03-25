import { motion } from "framer-motion";
import { Building2, CalendarCheck, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const TrustSection = () => {
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  const stats = [
    { icon: Building2, value: "+500", label: tx("فندق شريك", "Partner Hotels") },
    { icon: CalendarCheck, value: "+10,000", label: tx("حجز ناجح", "Successful Bookings") },
    { icon: Users, value: "+25,000", label: tx("عميل سعيد", "Happy Customers") },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">{tx("الفنادق الشريكة تثق بنا", "Trusted by Partner Hotels")}</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center space-y-3 p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <stat.icon className="w-7 h-7 text-primary" />
              </div>
              <p className="text-3xl font-extrabold text-foreground" dir="ltr">{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
