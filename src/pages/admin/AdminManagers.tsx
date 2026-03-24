import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import AdminLayout from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { UserPlus, Trash2, Users, Building2, AlertCircle, ExternalLink } from "lucide-react";

const AdminManagers = () => {
  const { lang } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [hotelId, setHotelId] = useState("");
  const [hotelsList, setHotelsList] = useState<any[]>([]);

  // Fetch hotels directly with useEffect to avoid RLS timing issues
  useEffect(() => {
    const fetchHotels = async () => {
      const response: any = await apiClient.get("/api/admin/hotels");
      if (response.data) {
        setHotelsList(response.data);
      }
    };
    fetchHotels();
  }, []);

  const { data: managers, isLoading } = useQuery({
    queryKey: ["admin-managers"],
    queryFn: async () => {
      const response: any = await apiClient.get("/api/admin/managers");
      return response.data ?? [];
    },
  });

  const createManager = useMutation({
    mutationFn: async () => {
      await apiClient.post("/api/admin/managers", {
        email,
        password,
        full_name: fullName,
        hotel_id: hotelId || null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
      toast.success(lang === "ar" ? "تم إنشاء حساب مدير الفندق" : "Hotel manager created");
      setOpen(false);
      setEmail(""); setPassword(""); setFullName(""); setHotelId("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeManager = useMutation({
    mutationFn: async (roleId: string) => {
      await apiClient.delete(`/api/admin/managers/${roleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-managers"] });
      toast.success(lang === "ar" ? "تم إزالة مدير الفندق" : "Manager removed");
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-foreground">
            {lang === "ar" ? "مدراء الفنادق" : "Hotel Managers"}
          </h1>
          <Dialog open={open} onOpenChange={(v) => {
            setOpen(v);
            if (v) {
              // Refresh hotels list when dialog opens
              apiClient.get("/api/admin/hotels")
                .then((response: any) => { if (response.data) setHotelsList(response.data); });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-cta gap-2">
                <UserPlus className="w-4 h-4" />
                {lang === "ar" ? "إضافة مدير" : "Add Manager"}
              </Button>
            </DialogTrigger>
            <DialogContent className="z-[200]">
              <DialogHeader>
                <DialogTitle>
                  {lang === "ar" ? "إضافة مدير فندق جديد" : "Add New Hotel Manager"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createManager.mutate(); }} className="space-y-4">
                <div>
                  <Label>{lang === "ar" ? "الاسم الكامل" : "Full Name"}</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label>{lang === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label>{lang === "ar" ? "كلمة المرور" : "Password"}</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="mt-1" />
                </div>
                <div>
                  <Label>{lang === "ar" ? "الفندق" : "Hotel"}</Label>
                  {hotelsList.length === 0 ? (
                    <p className="text-sm text-muted-foreground mt-1">
                      {lang === "ar" ? "جاري تحميل الفنادق..." : "Loading hotels..."}
                    </p>
                  ) : (
                    <select
                      value={hotelId}
                      onChange={(e) => setHotelId(e.target.value)}
                      className="w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
                    >
                      <option value="">{lang === "ar" ? "اختر فندق" : "Select hotel"}</option>
                      {hotelsList.map((h: any) => (
                        <option key={h.id} value={h.id}>
                          {lang === "ar" ? (h.name_ar || h.name_en) : (h.name_en || h.name_ar)} - {h.city}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <Button type="submit" className="w-full gradient-cta" disabled={createManager.isPending}>
                  {createManager.isPending ? "..." : (lang === "ar" ? "إنشاء حساب" : "Create Account")}
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
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card text-center">
                <p className="text-2xl font-extrabold text-primary">{managers?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ar" ? "إجمالي المدراء" : "Total Managers"}
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card text-center">
                <p className="text-2xl font-extrabold text-green-500">
                  {managers?.filter(m => m.hotel).length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ar" ? "مرتبط بفندق" : "Linked to Hotel"}
                </p>
              </div>
              <div className="bg-card rounded-xl p-4 border border-border/50 shadow-card text-center">
                <p className="text-2xl font-extrabold text-amber-500">
                  {managers?.filter(m => !m.hotel).length ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ar" ? "بدون فندق" : "No Hotel Assigned"}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/40">
                      <th className="text-start px-5 py-3.5 font-semibold text-muted-foreground">
                        {lang === "ar" ? "المدير" : "Manager"}
                      </th>
                      <th className="text-start px-5 py-3.5 font-semibold text-muted-foreground">
                        {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                      </th>
                      <th className="text-start px-5 py-3.5 font-semibold text-muted-foreground">
                        {lang === "ar" ? "الفندق المرتبط" : "Assigned Hotel"}
                      </th>
                      <th className="text-start px-5 py-3.5 font-semibold text-muted-foreground">
                        {lang === "ar" ? "المدينة" : "City"}
                      </th>
                      <th className="text-start px-5 py-3.5 font-semibold text-muted-foreground">
                        {lang === "ar" ? "حالة الفندق" : "Hotel Status"}
                      </th>
                      <th className="px-5 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {managers?.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-muted-foreground">
                          <div className="flex flex-col items-center gap-3">
                            <Users className="w-10 h-10 opacity-30" />
                            <p>{lang === "ar" ? "لا يوجد مدراء فنادق بعد" : "No hotel managers yet"}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                    {managers?.map((m) => {
                      const profile = m.profile as any;
                      const hotel = m.hotel as any;
                      const hotelName = hotel ? (lang === "ar" ? hotel.name_ar : hotel.name_en) : null;
                      return (
                        <tr key={m.id} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary text-sm">
                                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : "?"}
                              </div>
                              <span className="font-semibold text-foreground">
                                {profile?.full_name || (lang === "ar" ? "بدون اسم" : "No name")}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground" dir="ltr">
                            {profile?.email ?? "—"}
                          </td>
                          <td className="px-5 py-4">
                            {hotel ? (
                              <div className="flex items-center gap-2.5">
                                {hotel.cover_image ? (
                                  <img src={hotel.cover_image} alt={hotelName}
                                    className="w-9 h-9 rounded-lg object-cover shrink-0 border border-border/50" />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium text-foreground leading-tight">{hotelName}</p>
                                  <div className="flex gap-0.5 mt-0.5">
                                    {Array.from({ length: hotel.stars ?? 0 }).map((_, i) => (
                                      <span key={i} className="text-amber-400 text-xs">★</span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
                                <AlertCircle className="w-3 h-3" />
                                {lang === "ar" ? "لم يُحدد فندق" : "No hotel assigned"}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">{hotel?.city ?? "—"}</td>
                          <td className="px-5 py-4">
                            {hotel ? (
                              <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                                hotel.is_active
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-slate-100 text-slate-500 border-slate-200"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${hotel.is_active ? "bg-green-500" : "bg-slate-400"}`} />
                                {hotel.is_active ? (lang === "ar" ? "نشط" : "Active") : (lang === "ar" ? "غير نشط" : "Inactive")}
                              </span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {hotel && (
                                <button onClick={() => navigate(`/admin/hotels/${hotel.id}`)}
                                  className="p-2 rounded-lg hover:bg-muted transition text-muted-foreground hover:text-primary">
                                  <ExternalLink className="w-4 h-4" />
                                </button>
                              )}
                              <button onClick={() => removeManager.mutate(m.id)}
                                className="p-2 rounded-lg hover:bg-red-50 transition text-muted-foreground hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminManagers;
