import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, Star, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

const HotelsListing = () => {
  const [searchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [minStars, setMinStars] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const { t, lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  const [hotels, setHotels] = useState<any[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPrices, setMinPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      const { data: hotelsData } = await supabase
        .from("hotels")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (hotelsData) {
        setHotels(hotelsData);
        const uniqueCities = [...new Set(hotelsData.map((h: any) => h.city))];
        setCities(uniqueCities);

        // Fetch min prices per hotel
        const { data: roomsData } = await supabase
          .from("room_categories")
          .select("hotel_id, price_per_night")
          .eq("is_active", true);
        
        if (roomsData) {
          const prices: Record<string, number> = {};
          roomsData.forEach((r: any) => {
            if (!prices[r.hotel_id] || r.price_per_night < prices[r.hotel_id]) {
              prices[r.hotel_id] = r.price_per_night;
            }
          });
          setMinPrices(prices);
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = useMemo(
    () =>
      hotels.filter(
        (h) =>
          (!city || h.city === city) &&
          h.stars >= minStars &&
          (minPrices[h.id] ? minPrices[h.id] <= maxPrice : true)
      ),
    [city, minStars, maxPrice, hotels, minPrices]
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold text-accent mb-8"
        >
          {t("hotels.title")}
        </motion.h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 shrink-0 bg-card rounded-xl p-5 shadow-card border border-border/50 h-fit space-y-5"
          >
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
              {t("hotels.filter")}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("hotels.city")}</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none text-foreground"
              >
                <option value="">{t("hotels.allCities")}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("hotels.minStars")}</label>
              <select
                value={minStars}
                onChange={(e) => setMinStars(Number(e.target.value))}
                className="w-full bg-muted rounded-lg px-3 py-2 text-sm outline-none text-foreground"
              >
                <option value={0}>{t("hotels.all")}</option>
                {[3, 4, 5].map((s) => (
                  <option key={s} value={s}>{s}+ {t("hotels.stars")}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t("hotels.maxPrice")}: <span dir="ltr">${maxPrice}</span>
              </label>
              <input
                type="range"
                min={50}
                max={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </motion.aside>

          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 text-muted-foreground">{tx("جاري التحميل...", "Loading...")}</div>
            ) : filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-20">{t("hotels.noResults")}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((hotel, i) => {
                  const name = lang === "ar" ? hotel.name_ar : hotel.name_en;
                  const price = minPrices[hotel.id];
                  return (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={`/hotels/${hotel.id}`}
                        className="group block rounded-xl overflow-hidden bg-card shadow-card border border-border/50 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={hotel.cover_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {price && (
                            <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-primary" dir="ltr">
                              ${price}{t("hotel.perNight")}
                            </div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                            ))}
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            {hotel.city}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HotelsListing;
