import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";
import Layout from "@/components/Layout";

const About = () => (
  <Layout>
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-4"
        >
          <h1 className="text-4xl font-extrabold text-accent">عن نايتي</h1>
          <p className="text-muted-foreground text-lg">
            تحديث حجز الفنادق من خلال الاتصال المباشر بنظام حاجز لإدارة الفنادق.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Target,
              title: "مهمتنا",
              desc: "سد الفجوة بين الفنادق والمسافرين من خلال توفير تجربة حجز سلسة. عبر منظومة حاجز + نايتي، نضمن أن كل حجز دقيق وفوري وموثوق.",
            },
            {
              icon: Eye,
              title: "رؤيتنا",
              desc: "عالم يستخدم فيه كل فندق، من البوتيك إلى السلسلة الفاخرة، نظام حاجز للعمليات ونايتي للتوزيع — لخلق سوق حجز موثوق وشفاف.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-card border border-border/50 space-y-4"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <item.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-muted/50 rounded-2xl p-8 max-w-4xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center flex items-center justify-center gap-2">
            <Heart className="w-5 h-5 text-primary" /> قيمنا
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "الشفافية", desc: "ما تراه هو ما تحصل عليه. أسعار حقيقية، توفر حقيقي." },
              { title: "الموثوقية", desc: "كل حجز يمر عبر حاجز لتأكيد فوري ومضمون." },
              { title: "الابتكار", desc: "تحسين مستمر لتجربة الفندق والضيف من خلال التكنولوجيا." },
            ].map((v, i) => (
              <div key={i} className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  </Layout>
);

export default About;
