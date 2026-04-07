import { useI18n } from "@/lib/i18n";
import { Smartphone, Star, Download, Zap, Shield, Globe } from "lucide-react";
import mobileImage from "@/assets/mobileimage.png";

const AppDownloadSection = () => {
  const { lang } = useI18n();

  const features = [
    {
      icon: Zap,
      titleAr: "حجز سريع",
      titleEn: "Fast Booking",
      descAr: "احجز في ثوانٍ",
      descEn: "Book in seconds"
    },
    {
      icon: Shield,
      titleAr: "دفع آمن",
      titleEn: "Secure Payment",
      descAr: "معاملات محمية",
      descEn: "Protected transactions"
    },
    {
      icon: Globe,
      titleAr: "متاح دائماً",
      titleEn: "Always Available",
      descAr: "24/7 في جيبك",
      descEn: "24/7 in your pocket"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Download className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                {lang === "ar" ? "حمّل التطبيق الآن" : "Download Now"}
              </span>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
                {lang === "ar" ? (
                  <>
                    احجز فندقك من
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-500">
                       هاتفك
                    </span>
                  </>
                ) : (
                  <>
                    Book Your Hotel from
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-purple-500">
                      Your Phone
                    </span>
                  </>
                )}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                {lang === "ar"
                  ? "حمّل تطبيق Naity واستمتع بتجربة حجز سلسة وسريعة. آلاف الفنادق في سوريا بين يديك."
                  : "Download the Naity app and enjoy a seamless booking experience. Thousands of hotels in Syria at your fingertips."}
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {lang === "ar" ? feature.titleAr : feature.titleEn}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar" ? feature.descAr : feature.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              {/* Google Play */}
              <a
                href="https://play.google.com/store/apps/details?id=net.naity.app&hl=sv"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-black hover:bg-black/90 text-white transition-all hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">
                    {lang === "ar" ? "حمّل من" : "GET IT ON"}
                  </div>
                  <div className="text-base font-bold">Google Play</div>
                </div>
              </a>

              {/* App Store */}
              <a
                href="https://apps.apple.com/no/app/naity/id6760296192"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-black hover:bg-black/90 text-white transition-all hover:scale-105 hover:shadow-xl"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs opacity-80">
                    {lang === "ar" ? "حمّل من" : "Download on the"}
                  </div>
                  <div className="text-base font-bold">App Store</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right side - Phone mockup */}
          <div className="relative lg:block hidden">
            <div className="relative mx-auto w-[280px]">
              {/* Phone frame */}
              <div className="relative z-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Actual app screenshot */}
                  <img 
                    src={mobileImage} 
                    alt="Naity Mobile App" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-8 -right-8 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-75"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;
