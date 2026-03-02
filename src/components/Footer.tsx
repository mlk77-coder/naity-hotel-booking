import { Link } from "react-router-dom";
import naityLogo from "@/assets/naity-logo.png";

const Footer = () => (
  <footer className="bg-accent text-accent-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <img src={naityLogo} alt="نايتي" className="h-8 w-auto" />
            <span className="text-lg font-bold">نايتي</span>
          </div>
          <p className="text-sm text-accent-foreground/70">
            منصتك الموثوقة لحجز الفنادق. متصلة مباشرة بالفنادق التي تعمل بنظام حاجز.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">استكشف</h4>
          <div className="flex flex-col gap-2 text-sm text-accent-foreground/70">
            <Link to="/hotels" className="hover:text-accent-foreground transition-colors">الفنادق</Link>
            <Link to="/how-it-works" className="hover:text-accent-foreground transition-colors">كيف يعمل</Link>
            <Link to="/about" className="hover:text-accent-foreground transition-colors">عن نايتي</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">الدعم</h4>
          <div className="flex flex-col gap-2 text-sm text-accent-foreground/70">
            <Link to="/contact" className="hover:text-accent-foreground transition-colors">تواصل معنا</Link>
            <span>help@naity.com</span>
            <span dir="ltr">+1 800 NAITY</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">للفنادق</h4>
          <p className="text-sm text-accent-foreground/70 mb-3">
            استخدم نظام حاجز لإدارة فندقك والظهور على نايتي.
          </p>
          <Link
            to="/contact"
            className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            انضم إلى حاجز
          </Link>
        </div>
      </div>

      <div className="border-t border-accent-foreground/20 mt-8 pt-6 text-center text-sm text-accent-foreground/50">
        © {new Date().getFullYear()} نايتي. جميع الحقوق محفوظة. مدعوم بنظام حاجز.
      </div>
    </div>
  </footer>
);

export default Footer;
