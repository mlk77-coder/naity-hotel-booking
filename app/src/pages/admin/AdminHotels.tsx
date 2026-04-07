import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Star, MapPin, Pencil, Trash2, AlertTriangle, ChevronRight, Clock, Wifi, Zap, Droplet, Car, Waves, Thermometer, Mail, Loader2 } from "lucide-react";
import HeartbeatIndicator from "@/components/admin/HeartbeatIndicator";
import { SYRIAN_MAIN_CITIES } from "@/lib/cities";

const AdminHotels = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailLanguageDialog, setEmailLanguageDialog] = useState<any | null>(null);
  const tx = (ar: string, en: string) => lang === "ar" ? ar : en;

  const [form, setForm] = useState<any>({
    name_en: "", name_ar: "", city: "", stars: 3, description_en: "", description_ar: "", address: "",
    contact_phone: "", contact_email: "", property_type: "hotel", tech_partner_id: null, company_id: null, external_hotel_id: null,
    amenities: {
      wifi: false,
      air_conditioning: false,
      hot_water_24h: false,
      parking: false,
      pool: false,
      heating_cooling: false,
    }
  });

  const { data: techPartners = [] } = useQuery({
    queryKey: ["tech-partners-list"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get('/api/admin/tech-partners');
        return response.success ? response.data : [];
      } catch (error) {
        return [];
      }
    },
  });

  const { data: apiCompanies = [] } = useQuery({
    queryKey: ["api-companies-list"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get('/api/admin/api-companies');
        return response.success ? response.data : [];
      } catch (error) {
        return [];
      }
    },
  });

  const { data: hotels, isLoading } = useQuery({
    queryKey: ["admin-hotels"],
    queryFn: async () => {
      const response: any = await apiClient.get('/api/admin/hotels');
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
  });

  const { data: syncSettings } = useQuery({
    queryKey: ["admin-hotels-sync-timestamps"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get('/api/admin/sync-settings');
        return response.success ? response.data : [];
      } catch (error) {
        return [];
      }
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (editing) {
        const response: any = await apiClient.put(`/api/hotels/${editing.id}`, data);
        if (!response.success) throw new Error(response.message);
      } else {
        const response: any = await apiClient.post('/api/hotels', data);
        if (!response.success) throw new Error(response.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      toast.success(editing ? tx("تم تحديث الفندق", "Hotel updated") : tx("تم إضافة الفندق", "Hotel added"));
      if (!editing) {
        // Send notification
        apiClient.post('/api/admin/notifications', {
          type: "new_hotel",
          data: {
            name_en: form.name_en,
            name_ar: form.name_ar,
            city: form.city,
            property_type: form.property_type ?? "hotel",
          },
        }).catch((e) => console.error("Hotel notification failed:", e));
      }
      setOpen(false);
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response: any = await apiClient.delete(`/api/hotels/${id}`);
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      toast.success(tx("تم حذف الفندق", "Hotel deleted"));
    },
  });

  const toggleManualMode = useMutation({
    mutationFn: async ({ id, manual_mode }: { id: string; manual_mode: boolean }) => {
      const response: any = await apiClient.patch(`/api/hotels/${id}/manual-mode`, { manual_mode });
      if (!response.success) throw new Error(response.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hotels"] });
      toast.success(tx("تم تحديث وضع التشغيل", "Manual mode updated"));
    },
  });

  const sendWelcomeEmail = async (hotel: any, language: 'ar' | 'en') => {
    setSendingEmailId(hotel.id);
    setEmailLanguageDialog(null);
    try {
      const response: any = await apiClient.post(`/api/admin/hotels/${hotel.id}/send-welcome`, { language });
      
      if (response.success) {
        const hotelName = language === 'ar' ? (hotel.name_ar || hotel.name_en) : hotel.name_en;
        toast.success(
          tx("✅ تم إرسال البريد بنجاح", "✅ Email sent successfully"),
          { description: tx(`تم إرسال رسالة الترحيب لـ ${hotelName}`, `Welcome email sent to ${hotelName}`) }
        );
      } else {
        toast.error(tx("❌ فشل إرسال البريد", "❌ Failed to send email"));
      }
    } catch (e: any) {
      toast.error(tx("❌ خطأ", "❌ Error"), { description: e.message });
    }
    setSendingEmailId(null);
  };

  const resetForm = () => {
    setForm({ 
      name_en: "", name_ar: "", city: "", stars: 3, description_en: "", description_ar: "", address: "", 
      contact_phone: "", contact_email: "", property_type: "hotel", tech_partner_id: null, company_id: null, external_hotel_id: null,
      amenities: {
        wifi: false,
        air_conditioning: false,
        hot_water_24h: false,
        parking: false,
        pool: false,
        heating_cooling: false,
      }
    });
    setEditing(null);
  };

  const openEdit = (hotel: any) => {
    setEditing(hotel);
    setForm({
      name_en: hotel.name_en, name_ar: hotel.name_ar, city: hotel.city,
      stars: hotel.stars, description_en: hotel.description_en ?? "",
      description_ar: hotel.description_ar ?? "", address: hotel.address ?? "",
      contact_phone: hotel.contact_phone ?? "", contact_email: hotel.contact_email ?? "",
      property_type: (hotel as any).property_type ?? "hotel",
      tech_partner_id: (hotel as any).tech_partner_id ?? null,
      company_id: (hotel as any).company_id ?? null,
      external_hotel_id: (hotel as any).external_hotel_id ?? null,
      amenities: (hotel as any).amenities ? (typeof (hotel as any).amenities === 'string' ? JSON.parse((hotel as any).amenities) : (hotel as any).amenities) : {
        wifi: false,
        air_conditioning: false,
        hot_water_24h: false,
        parking: false,
        pool: false,
        heating_cooling: false,
      }
    });
    setOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {tx("إدارة الفنادق", "Hotel Management")}
          </h1>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gradient-cta gap-2"><Plus className="w-4 h-4" /> {tx("إضافة فندق", "Add Hotel")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? tx("تعديل الفندق", "Edit Hotel") : tx("إضافة فندق جديد", "Add New Hotel")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form as any); }} className="space-y-4">
                {/* Property Type */}
                <div className="space-y-2">
                  <Label>{tx("نوع العقار", "Property Type")}</Label>
                  <div className="flex items-center gap-4">
                    {[
                      { val: "hotel", ar: "🏨 فندق", en: "🏨 Hotel" },
                      { val: "apartment", ar: "🏠 شقة سياحية", en: "🏠 Apartment" },
                    ].map(opt => (
                      <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="property_type_form"
                          checked={form.property_type === opt.val}
                          onChange={() => setForm(f => ({ ...f, property_type: opt.val }))}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-sm text-foreground">{lang === "ar" ? opt.ar : opt.en}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{tx("الاسم (عربي)", "Name (Arabic)")}</Label>
                    <Input value={form.name_ar} onChange={(e) => setForm(f => ({ ...f, name_ar: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>Name (English)</Label>
                    <Input value={form.name_en} onChange={(e) => setForm(f => ({ ...f, name_en: e.target.value }))} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{tx("المدينة", "City")}</Label>
                    <select value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">{tx("اختر المدينة", "Select City")}</option>
                      {SYRIAN_MAIN_CITIES.map(c => (
                        <option key={c.en} value={c.en}>{lang === "ar" ? c.ar : c.en}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>{tx("النجوم", "Stars")}</Label>
                    <Input type="number" min={1} max={5} value={form.stars} onChange={(e) => setForm(f => ({ ...f, stars: +e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>{tx("العنوان", "Address")}</Label>
                  <Input value={form.address ?? ""} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
                </div>
                <div>
                  <Label>{lang === "ar" ? "نظام إدارة الفندق / الشقة" : "Property Management System"}</Label>
                  <select
                    value={form.tech_partner_id ?? ""}
                    onChange={e => setForm(f => ({ ...f, tech_partner_id: e.target.value || null }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">{lang === "ar" ? "— بدون نظام —" : "— None / Independent —"}</option>
                    {techPartners.map((p: any) => (
                      <option key={p.id} value={p.id}>{lang === "ar" ? (p.name_ar || p.name) : p.name}</option>
                    ))}
                  </select>
                </div>
                {/* API Company */}
                <div>
                  <Label>{lang === "ar" ? "شركة إدارة الفندق (API)" : "Hotel API Company"}</Label>
                  <select
                    value={(form as any).company_id ?? ""}
                    onChange={e => setForm(f => ({ ...f, company_id: e.target.value || null }))}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">{lang === "ar" ? "— بدون API —" : "— No API —"}</option>
                    {apiCompanies.map((c: any) => (
                      <option key={c.id} value={c.id}>{lang === "ar" ? (c.name_ar || c.name) : c.name}</option>
                    ))}
                  </select>
                </div>
                {(form as any).company_id && (
                  <div>
                    <Label>{lang === "ar" ? "رقم الفندق في نظام الشركة" : "Hotel ID in Company System"}</Label>
                    <Input
                      type="number"
                      value={(form as any).external_hotel_id ?? ""}
                      onChange={e => setForm(f => ({ ...f, external_hotel_id: e.target.value ? +e.target.value : null }))}
                      placeholder={lang === "ar" ? "مثال: 42" : "e.g. 42"}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{tx("هاتف التواصل", "Contact Phone")}</Label>
                    <Input value={(form as any).contact_phone ?? ""} onChange={(e) => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{tx("بريد التواصل", "Contact Email")}</Label>
                    <Input type="email" value={(form as any).contact_email ?? ""} onChange={(e) => setForm(f => ({ ...f, contact_email: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label>{tx("الوصف (عربي)", "Description (Arabic)")}</Label>
                  <Textarea value={form.description_ar ?? ""} onChange={(e) => setForm(f => ({ ...f, description_ar: e.target.value }))} />
                </div>
                <div>
                  <Label>Description (English)</Label>
                  <Textarea value={form.description_en ?? ""} onChange={(e) => setForm(f => ({ ...f, description_en: e.target.value }))} />
                </div>

                {/* Amenities Checklist */}
                <div className="space-y-3 border-t border-border pt-4">
                  <Label className="text-base font-semibold">{tx("المرافق والخدمات", "Facilities & Services")}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* WiFi */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.amenities?.wifi ?? false}
                        onChange={(e) => setForm(f => ({ ...f, amenities: { ...f.amenities, wifi: e.target.checked } }))}
                        className="w-4 h-4 accent-primary"
                      />
                      <Wifi className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{tx("واي فاي", "WiFi")}</span>
                    </label>

                    {/* Air Conditioning */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.amenities?.air_conditioning ?? false}
                        onChange={(e) => setForm(f => ({ ...f, amenities: { ...f.amenities, air_conditioning: e.target.checked } }))}
                        className="w-4 h-4 accent-primary"
                      />
                      <Zap className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{tx("كهرباء 24 ساعة", "24h Electricity")}</span>
                    </label>

                    {/* Hot Water 24h */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.amenities?.hot_water_24h ?? false}
                        onChange={(e) => setForm(f => ({ ...f, amenities: { ...f.amenities, hot_water_24h: e.target.checked } }))}
                        className="w-4 h-4 accent-primary"
                      />
                      <Droplet className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{tx("مياه ساخنة 24 ساعة", "Hot Water 24h")}</span>
                    </label>

                    {/* Parking */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.amenities?.parking ?? false}
                        onChange={(e) => setForm(f => ({ ...f, amenities: { ...f.amenities, parking: e.target.checked } }))}
                        className="w-4 h-4 accent-primary"
                      />
                      <Car className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{tx("كراج / موقف", "Parking")}</span>
                    </label>

                    {/* Pool */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.amenities?.pool ?? false}
                        onChange={(e) => setForm(f => ({ ...f, amenities: { ...f.amenities, pool: e.target.checked } }))}
                        className="w-4 h-4 accent-primary"
                      />
                      <Waves className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{tx("مسبح", "Pool")}</span>
                    </label>

                    {/* Heating/Cooling */}
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition">
                      <input
                        type="checkbox"
                        checked={form.amenities?.heating_cooling ?? false}
                        onChange={(e) => setForm(f => ({ ...f, amenities: { ...f.amenities, heating_cooling: e.target.checked } }))}
                        className="w-4 h-4 accent-primary"
                      />
                      <Thermometer className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{tx("مكيف وتدفئة", "AC & Heating")}</span>
                    </label>
                  </div>
                </div>

                <Button type="submit" className="w-full gradient-cta" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "..." : editing ? tx("تحديث", "Update") : tx("إضافة", "Add")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {hotels?.map((hotel) => {
              const isApartment = (hotel as any).property_type === "apartment";
              const syncInfo = syncSettings?.find(s => s.hotel_id === hotel.id);
              const lastSync = syncInfo?.last_sync_at;
              const isStale = lastSync && (Date.now() - new Date(lastSync).getTime()) > 24 * 60 * 60 * 1000;

              return (
                <div key={hotel.id} className="bg-card rounded-xl p-4 border border-border/50 shadow-card hover:shadow-elevated transition-shadow cursor-pointer" onClick={() => navigate(`/admin/hotels/${hotel.id}`)}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {hotel.cover_image ? (
                          <img src={hotel.cover_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <HeartbeatIndicator hotelId={hotel.id} />
                          <h3 className="font-semibold text-foreground">{lang === "ar" ? hotel.name_ar : hotel.name_en}</h3>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isApartment ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}`}>
                            {isApartment ? tx("🏠 شقة", "🏠 Apartment") : tx("🏨 فندق", "🏨 Hotel")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{lang === "ar" ? hotel.name_en : hotel.name_ar} • {hotel.city}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
                            ))}
                          </div>
                          {/* Last Synced timestamp */}
                          {lastSync ? (
                            <span className={`flex items-center gap-1 text-[10px] font-medium ${isStale ? "text-destructive" : "text-muted-foreground"}`}>
                              <Clock className="w-3 h-3" />
                              {tx("آخر مزامنة:", "Synced:")}{" "}
                              {new Date(lastSync).toLocaleString(lang === "ar" ? "ar-SY" : "en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              {isStale && <span className="text-destructive ml-1">⚠️</span>}
                            </span>
                          ) : syncInfo ? (
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {tx("لم تتم المزامنة بعد", "Never synced")}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
                        <AlertTriangle className={`w-4 h-4 ${hotel.manual_mode ? "text-destructive" : "text-muted-foreground"}`} />
                        <span className="text-xs font-medium text-foreground">
                          {tx("وضع يدوي", "Manual")}
                        </span>
                        <Switch
                          checked={hotel.manual_mode ?? false}
                          onCheckedChange={(v) => toggleManualMode.mutate({ id: hotel.id, manual_mode: v })}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setEmailLanguageDialog(hotel)}
                        disabled={sendingEmailId === hotel.id}
                        title={tx("إرسال رسالة ترحيب", "Send Welcome Email")}
                      >
                        {sendingEmailId === hotel.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4 text-blue-500" />
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(hotel)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(hotel.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            })}
            {hotels?.length === 0 && (
              <p className="text-center text-muted-foreground py-12">
                {tx("لا توجد فنادق. أضف فندقك الأول!", "No hotels yet. Add your first hotel!")}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Email Language Selection Dialog ──────────────────────────── */}
      <AlertDialog open={!!emailLanguageDialog} onOpenChange={open => !open && setEmailLanguageDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {tx("إرسال رسالة ترحيب", "Send Welcome Email")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {tx(
                `اختر لغة البريد الإلكتروني لـ "${emailLanguageDialog?.name_ar || emailLanguageDialog?.name_en}"`,
                `Choose email language for "${emailLanguageDialog?.name_en}"`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button 
              onClick={() => emailLanguageDialog && sendWelcomeEmail(emailLanguageDialog, 'ar')}
              className="w-full justify-start h-auto py-4"
              variant="outline"
            >
              <div className="text-right w-full">
                <div className="font-bold text-base">🇸🇾 العربية</div>
                <div className="text-xs text-muted-foreground mt-1">
                  مرحباً بك في Naity – فندقك أصبح متاحاً الآن!
                </div>
              </div>
            </Button>
            <Button 
              onClick={() => emailLanguageDialog && sendWelcomeEmail(emailLanguageDialog, 'en')}
              className="w-full justify-start h-auto py-4"
              variant="outline"
            >
              <div className="text-left w-full">
                <div className="font-bold text-base">🇬🇧 English</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Welcome to Naity - Your Hotel is Now Live!
                </div>
              </div>
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{tx("إلغاء", "Cancel")}</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminHotels;
