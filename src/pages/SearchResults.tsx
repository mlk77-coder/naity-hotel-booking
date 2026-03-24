import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlidersHorizontal, Star, MapPin, X, Map as MapIcon, List, ArrowUpDown
} from "lucide-react";

import { toast } from "sonner";
import Layout from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiClient } from "@/lib/apiClient";

const HotelMapView = lazy(() => import("@/components/search/HotelMapView"));

type SortOption = "recommended" | "price_low" | "price_high";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { lang } = useI18n();
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;
  const isMobile = useIsMobile();

  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  const city = searchParams.get("city") || "";

  // Load hotels from API
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const response: any = await apiClient.get("/api/hotels", { is_active: true });
        setHotels(response.data || []);
      } catch (error) {
        console.error(error);
        toast.error(tx("خطأ في تحميل الفنادق", "Error loading hotels"));
      }

      setLoading(false);
    };

    load();
  }, [lang]);

  // Filter and sort hotels
  const filtered = useMemo(() => {
    let result = hotels;

    if (city) {
      result = result.filter(h => h.city === city);
    }

    if (sortBy === "price_low") {
      result.sort((a, b) => (a.min_price || 0) - (b.min_price || 0));
    }

    if (sortBy === "price_high") {
      result.sort((a, b) => (b.min_price || 0) - (a.min_price || 0));
    }

    return result;
  }, [hotels, city, sortBy]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {tx("نتائج البحث", "Search Results")}
          </h1>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="border rounded px-2 py-1"
          >
            <option value="recommended">Default</option>
            <option value="price_low">Price Low</option>
            <option value="price_high">Price High</option>
          </select>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">{tx("لا توجد نتائج", "No results found")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((hotel) => {
              const name = lang === "ar" ? hotel.name_ar : hotel.name_en;
              const coverImage = hotel.cover_image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800";
              return (
                <Link key={hotel.id} to={`/hotels/${hotel.id}`} className="border rounded-xl overflow-hidden shadow hover:shadow-lg transition-shadow">
                  <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: hotel.stars || 0 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                      ))}
                    </div>
                    <h2 className="font-bold text-lg mb-1">{name}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                      <MapPin size={14} /> {hotel.city}
                    </p>
                    {hotel.min_price && (
                      <p className="text-primary font-bold">
                        ${hotel.min_price} <span className="text-sm text-muted-foreground font-normal">/{tx("ليلة", "night")}</span>
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchResults;
