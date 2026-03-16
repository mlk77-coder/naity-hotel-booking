import { Link } from "react-router-dom";
import naityLogo from "@/assets/naity-logo.png";
import { useI18n } from "@/lib/i18n";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <img src={naityLogo} alt="Naity" className="h-8 w-auto" />
              <span className="text-lg font-bold">Naity</span>
            </div>
            <p className="text-xs font-medium text-primary">{t("footer.slogan")}</p>
            <p className="text-sm text-accent-foreground/70">{t("footer.desc")}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("footer.explore")}</h4>
            <div className="flex flex-col gap-2 text-sm text-accent-foreground/70">
              <Link to="/hotels" className="hover:text-accent-foreground transition-colors">{t("nav.hotels")}</Link>
              <Link to="/how-it-works" className="hover:text-accent-foreground transition-colors">{t("nav.howItWorks")}</Link>
              <Link to="/about" className="hover:text-accent-foreground transition-colors">{t("nav.about")}</Link>
              <Link to="/my-bookings" className="hover:text-accent-foreground transition-colors">{t("nav.myBookings")}</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("footer.support")}</h4>
            <div className="flex flex-col gap-2 text-sm text-accent-foreground/70">
              <Link to="/contact" className="hover:text-accent-foreground transition-colors">{t("nav.contact")}</Link>
              <span>support@naity.net</span>
              <span>{t("contact.office")}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">{t("footer.forHotels")}</h4>
            <p className="text-sm text-accent-foreground/70 mb-3">
              {t("lang") === "ar"
                ? "أضف فندقك أو شقتك إلى Naity واستقبل حجوزات مباشرة."
                : "List your hotel or apartment on Naity and receive direct bookings."}
            </p>
            <Link
              to="/join"
              className="inline-block px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              {t("footer.joinNaity")}
            </Link>
          </div>
        </div>

        <div className="border-t border-accent-foreground/20 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-accent-foreground/50">© {new Date().getFullYear()} Naity. {t("footer.copyright")}</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a
                href="https://www.facebook.com/share/18NsXS2Eh2/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-accent-foreground/10 hover:bg-accent-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/naity_booking"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-accent-foreground/10 hover:bg-accent-foreground/20 flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            </div>
            <div className="flex items-center gap-4 text-sm text-accent-foreground/50">
              <Link to="/terms" className="hover:text-accent-foreground transition-colors">{t("footer.terms")}</Link>
              <Link to="/privacy" className="hover:text-accent-foreground transition-colors">{t("footer.privacy")}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
