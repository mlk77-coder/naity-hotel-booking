import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useI18n } from "@/lib/i18n";
import AdminLayout from "./AdminLayout";
import { DollarSign, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  trend 
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex flex-col gap-2">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <p className="text-xl font-bold">${value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminFinance = () => {
  const { lang } = useI18n();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPartner, setSelectedPartner] = useState("all");

  // Fetch partners list
  const { data: partnersData } = useQuery({
    queryKey: ["finance-partners"],
    queryFn: async () => {
      const response: any = await apiClient.get("/api/finance/partners");
      return response.data;
    },
  });

  const partners = partnersData || [];

  const { data: financeData, isLoading, refetch } = useQuery({
    queryKey: ["finance-distribution", startDate, endDate, selectedPartner],
    queryFn: async () => {
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (selectedPartner && selectedPartner !== 'all') params.partner_id = selectedPartner;
      
      const response: any = await apiClient.get("/api/finance/distribution", params);
      return response.data;
    },
  });

  const summary = financeData?.summary || {
    guest_deposits: "0.00",
    mva_commission: "0.00",
    after_commission: "0.00",
    company_payments: "0.00",
    sales_payments: "0.00",
    net_naity: "0.00",
  };

  const bookings = financeData?.bookings || [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {lang === "ar" ? "التوزيع المالي" : "Financial Distribution"}
          </h1>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              {lang === "ar" ? "تصفية" : "Filters"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  {lang === "ar" ? "من تاريخ" : "From Date"}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  {lang === "ar" ? "إلى تاريخ" : "To Date"}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">
                  {lang === "ar" ? "الشركة الشريكة" : "Partner Company"}
                </label>
                <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={lang === "ar" ? "اختر شريك" : "Select Partner"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {lang === "ar" ? "جميع الشركاء" : "All Partners"}
                    </SelectItem>
                    {partners.map((partner: any) => (
                      <SelectItem key={partner.id} value={partner.id}>
                        {lang === "ar" ? partner.name_ar || partner.name : partner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={() => refetch()} className="h-9 flex-1">
                  {lang === "ar" ? "تطبيق" : "Apply"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                    setSelectedPartner("all");
                    refetch();
                  }}
                  className="h-9 flex-1"
                >
                  {lang === "ar" ? "إعادة" : "Reset"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            icon={DollarSign}
            label={lang === "ar" ? "إجمالي العربون" : "Total Deposits"}
            value={summary.guest_deposits}
            color="bg-blue-500"
            trend="neutral"
          />
          <StatCard
            icon={TrendingDown}
            label={lang === "ar" ? "MVA (25%)" : "MVA (25%)"}
            value={summary.mva_commission}
            color="bg-red-500"
            trend="down"
          />
          <StatCard
            icon={TrendingUp}
            label={lang === "ar" ? "بعد الخصرية" : "After Commission"}
            value={summary.after_commission}
            color="bg-orange-500"
            trend="up"
          />
          <StatCard
            icon={DollarSign}
            label={lang === "ar" ? "مدفوعات الشركات" : "Company Payments"}
            value={summary.company_payments}
            color="bg-purple-500"
            trend="down"
          />
          <StatCard
            icon={DollarSign}
            label={lang === "ar" ? "مدفوعات Sales" : "Sales Payments"}
            value={summary.sales_payments}
            color="bg-indigo-500"
            trend="down"
          />
          <StatCard
            icon={TrendingUp}
            label={lang === "ar" ? "صافي Naity" : "Net Naity"}
            value={summary.net_naity}
            color="bg-green-500"
            trend="up"
          />
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {lang === "ar" ? "تفاصيل الحجوزات" : "Booking Details"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                {lang === "ar" ? "جاري التحميل..." : "Loading..."}
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {lang === "ar" ? "لا توجد حجوزات" : "No bookings found"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "رقم" : "ID"}
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "الفندق" : "Hotel"}
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "الشريك" : "Partner"}
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "التاريخ" : "Date"}
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "العربون" : "Deposit"}
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        MVA
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "بعد الخصرية" : "After Comm."}
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "الشركة" : "Company"}
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        Sales
                      </th>
                      <th className="text-start p-2 text-xs font-medium">
                        {lang === "ar" ? "ربح Naity" : "Naity Profit"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking: any) => (
                      <tr key={booking.id} className="border-b hover:bg-muted/30">
                        <td className="p-2 text-xs">{booking.id.substring(0, 8)}</td>
                        <td className="p-2 text-xs">
                          {lang === "ar" ? booking.hotel_name_ar : booking.hotel_name_en}
                        </td>
                        <td className="p-2 text-xs">
                          {lang === "ar" ? booking.partner_name_ar : booking.partner_name}
                        </td>
                        <td className="p-2 text-xs">
                          {new Date(booking.date).toLocaleDateString(lang === "ar" ? "ar-SY" : "en-US", {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="p-2 text-xs font-medium">
                          ${parseFloat(booking.deposit_amount).toFixed(2)}
                        </td>
                        <td className="p-2 text-xs text-red-600">
                          ${parseFloat(booking.mva_commission).toFixed(2)}
                        </td>
                        <td className="p-2 text-xs text-green-600">
                          ${parseFloat(booking.after_commission).toFixed(2)}
                        </td>
                        <td className="p-2 text-xs">
                          ${parseFloat(booking.company_payment || 0).toFixed(2)}
                        </td>
                        <td className="p-2 text-xs">
                          ${parseFloat(booking.sales_payment || 0).toFixed(2)}
                        </td>
                        <td className="p-2 text-xs font-bold text-green-600">
                          ${parseFloat(booking.naity_profit || booking.mva_commission).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminFinance;
