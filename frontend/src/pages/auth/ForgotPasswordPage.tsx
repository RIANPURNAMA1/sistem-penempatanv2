import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/components";
import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import { Loader2, ArrowLeft, Mail, Lock, KeyRound } from "lucide-react";

const LogoMenduniaJepang = "/images/logo4.png";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({ title: "Error", description: "Email wajib diisi", variant: "destructive" as any });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/send-forgot-otp", { email });
      toast({ title: "Kode terkirim", description: "Cek email untuk kode verifikasi" });
      setStep(2);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message || "Terjadi kesalahan", variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp) {
      toast({ title: "Error", description: "Kode OTP wajib diisi", variant: "destructive" as any });
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
      const { data } = await api.post("/auth/verify-otp", { email, otp, newPassword });
      toast({ title: "Berhasil", description: data.message });
      navigate("/login");
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message || "Terjadi kesalahan", variant: "destructive" as any });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    
    setResending(true);
    try {
      await api.post("/auth/send-forgot-otp", { email });
      toast({ title: "Kode terkirim", description: "Kode verifikasi baru telah dikirim" });
      setCooldown(60);
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message || "Terjadi kesalahan", variant: "destructive" as any });
    } finally {
      setResending(false);
    }
  };

  if (cooldown > 0) {
    setTimeout(() => setCooldown(c => c - 1), 1000);
  }

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
            {step === 1 ? "Lupa Password" : "Verifikasi"}
          </p>
          <p className="text-white/70 text-lg">
            {step === 1 
              ? "Masukkan email untuk menerima kode verifikasi" 
              : "Masukkan kode yang dikirim ke email Anda"}
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
            <h1 className="text-2xl font-semibold text-foreground">
              {step === 1 ? "Lupa Password" : "Verifikasi Email"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1 
                ? "Kami akan mengirim kode verifikasi ke email Anda" 
                : "Masukkan kode dari email dan password baru"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@contoh.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Kode Verifikasi"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Kode Verifikasi</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Masukkan 6 digit kode"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="pl-10"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Password baru (min 6 karakter)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Konfirmasi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
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

              <div className="flex justify-center">
                <button 
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || resending}
                  className="text-sm text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <Loader2 size={14} className="inline mr-1 animate-spin" />
                      Mengirim...
                    </>
                  ) : cooldown > 0 ? (
                    <>Kirim ulang dalam ${cooldown}s</>
                  ) : (
                    "Kirim ulang kode verifikasi"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} className="mr-1" />
              Kembali ke login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}