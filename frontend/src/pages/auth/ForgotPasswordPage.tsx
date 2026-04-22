import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/components";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import { Loader2, ArrowLeft } from "lucide-react";

const LogoMenduniaJepang = "/images/logo4.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Error", description: "Email wajib diisi", variant: "destructive" as any });
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Password baru dan konfirmasi wajib diisi", variant: "destructive" as any });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "Password baru tidak cocok", variant: "destructive" as any });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password minimal 6 karakter", variant: "destructive" as any });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email, newPassword });
      toast({ title: "Berhasil", description: data.message });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message || "Terjadi kesalahan", variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1">
            <img src={LogoMenduniaJepang} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <span className="font-semibold text-lg">Sistem Penempatan</span>
        </div>
        <div>
          <p className="font-display text-5xl text-white leading-tight mb-6">
            Reset Password
          </p>
          <p className="text-white/70 text-lg">
            Masukkan email dan password baru untuk mereset password akun Anda.
          </p>
        </div>
        <div />
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
              <img src={LogoMenduniaJepang} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-sm">Sistem Penempatan</span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reset Password</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Masukkan email dan password baru Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Password baru (min 6 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Konfirmasi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>

            <div className="text-center">
              <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft size={16} className="mr-1" />
                Kembali ke login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}