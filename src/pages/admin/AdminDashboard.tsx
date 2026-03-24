import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import AdminLayout from "./AdminLayout";
import { Hotel, BookOpen, Users, DollarSign, CalendarCheck, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const StatCard = ({ icon: Icon, label, value, subtitle, color }: {
  icon: any; label: string; value: number | string; subtitle?: string; color: string;
}) => (
  <div className="bg-card rounded-xl p-5 border border-border/50 shadow-card">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground truncate">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { lang } = useI18n();
  const today = format(new Date(), "yyyy-MM-dd");

  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get('/api/admin/stats');
        if (response.success && response.data) {
          const { overview } = response.data;
          return {
            hotels: overview?.total_hotels ?? 0,
            bookings: overview?.total_bookings ?? 0,
            managers: overview?.total_managers ?? 0,
            todayCheckIns: overview?.today_checkins ?? 0,
            totalDeposits: overview?.total_deposits ?? 0,
            pendingSync: overview?.pending_sync ?? 0,
          };
        }
        return {
          hotels: 0,
          bookings: 0,
          managers: 0,
          todayCheckIns: 0,
          totalDeposits: 0,
          pendingSync: 0,
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          hotels: 0,
          bookings: 0,
          managers: 0,
          todayCheckIns: 0,
          totalDeposits: 0,
          pendingSync: 0,
        };
      }
    },
  });

  const { data: recentBookings } = useQuery({
    queryKey: ["admin-recent-bookings"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get('/api/admin/stats');
        if (response.success && response.data?.recent_bookings) {
          return response.data.recent_bookings;
        }
        return [];
      } catch (error) {
        console.error('Error fetching recent bookings:', error);
        return [];
      }
    },
  });

  const { data: recentLogs } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: async () => {
      try {
        const response: any = await apiClient.get('/api/admin/webhook-logs', { limit: 5 });
        if (response.success && response.data) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Error fetching webhook logs:', error);
        return [];
      }
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">
          {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={Hotel} label={lang === "ar" ? "الفنادق" : "Hotels"} value={stats?.hotels ?? 0} color="gradient-primary" />
          <StatCard icon={BookOpen} label={lang === "ar" ? "الحجوزات" : "Bookings"} value={stats?.bookings ?? 0} color="bg-secondary" />
          <StatCard icon={Users} label={lang === "ar" ? "المدراء" : "Managers"} value={stats?.managers ?? 0} color="bg-accent" />
          <StatCard
            icon={CalendarCheck}
            label={lang === "ar" ? "وصول اليوم" : "Today's Check-ins"}
            value={stats?.todayCheckIns ?? 0}
            color="gradient-cta"
          />
          <StatCard
            icon={DollarSign}
            label={lang === "ar" ? "العربون المحصّل" : "Deposits (USD)"}
            value={`$${(stats?.totalDeposits ?? 0).toLocaleString()}`}
            color="bg-primary"
          />
          <StatCard
            icon={Activity}
            label={lang === "ar" ? "بانتظار المزامنة" : "Pending Sync"}
            value={stats?.pendingSync ?? 0}
            subtitle={stats?.pendingSync && stats.pendingSync > 0 ? (lang === "ar" ? "تحتاج مراجعة" : "Need attention") : undefined}
            color={stats?.pendingSync && stats.pendingSync > 0 ? "bg-destructive" : "bg-muted"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card">
            <div className="p-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">
                {lang === "ar" ? "أحدث الحجوزات" : "Recent Bookings"}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {recentBookings?.length === 0 && (
                <p className="p-6 text-center text-muted-foreground text-sm">
                  {lang === "ar" ? "لا توجد حجوزات" : "No bookings yet"}
                </p>
              )}
              {recentBookings?.map((b: any) => (
                <div key={b.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{b.guest_first_name} {b.guest_last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar" ? b.hotel_name_ar : b.hotel_name_en} • {b.check_in}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className="font-semibold text-foreground text-sm">${b.total_price}</span>
                    <span className={`block text-xs px-2 py-0.5 rounded-full mt-1 ${
                      b.status === "confirmed" ? "bg-green-100 text-green-800" :
                      b.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Webhook Logs */}
          <div className="bg-card rounded-xl border border-border/50 shadow-card">
            <div className="p-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">
                {lang === "ar" ? "سجل المزامنة (Webhooks)" : "Sync Log (Webhooks)"}
              </h2>
            </div>
            <div className="divide-y divide-border">
              {recentLogs?.length === 0 && (
                <p className="p-6 text-center text-muted-foreground text-sm">
                  {lang === "ar" ? "لا توجد سجلات مزامنة بعد" : "No sync logs yet"}
                </p>
              )}
              {recentLogs?.map((log: any) => (
                <div key={log.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{log.event_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "ar" ? log.hotel_name_ar : log.hotel_name_en}
                    </p>
                  </div>
                  <div className="text-end">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      log.status === "received" ? "bg-green-100 text-green-800" :
                      log.status === "failed" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                    }`}>{log.status}</span>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.created_at), "HH:mm • dd/MM")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
