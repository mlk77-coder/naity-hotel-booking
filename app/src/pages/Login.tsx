import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { apiClient } from "@/lib/apiClient";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error.message);
        return;
      }

      // Check if partner user → redirect to /partner
      try {
        const response = await apiClient.get('/api/auth/me');
        if (response.success && response.data) {
          // Check if user is a partner
          const partnerResponse: any = await apiClient.get('/api/partner/check');
          if (partnerResponse.success && partnerResponse.is_partner) {
            toast.success("تم تسجيل الدخول بنجاح");
            navigate("/partner");
            return;
          }
        }
      } catch (err) {
        // Not a partner, continue to dashboard
      }

      toast.success("تم تسجيل الدخول بنجاح");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "فشل تسجيل الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-elevated p-8 border border-border/50">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-3">
              <LogIn className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">تسجيل الدخول</h1>
            <p className="text-sm text-muted-foreground mt-1">لوحة إدارة الفنادق</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@naity.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full gradient-cta" disabled={isLoading}>
              {isLoading ? "جاري الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
