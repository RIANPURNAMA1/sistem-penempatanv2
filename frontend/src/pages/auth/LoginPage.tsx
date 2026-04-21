import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// PERBAIKAN: Path biasanya ke ui/label bukan ui/components

import { toast } from "@/hooks/useToast";
import api from "@/lib/api";
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { Label } from "@/components/ui/components";

// PERBAIKAN: Jika gambar di folder public, panggil langsung via string path di tag img
// Atau jika ingin tetap import, pindahkan logo4.png ke src/assets/logo4.png
const LogoMenduniaJepang = "/images/logo4.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  // Generate random text CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return { text: result, result: result };
  };

  const [currentCaptcha, setCurrentCaptcha] = useState(generateCaptcha());

  const handleRefreshCaptcha = () => {
    setCurrentCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check CAPTCHA
    if (captchaInput !== currentCaptcha.result) {
      setCaptchaError(true);
      setCurrentCaptcha(generateCaptcha()); // Generate new captcha on failure
      setCaptchaInput("");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.user, data.token);
      if (data.user.role === "kandidat") navigate("/formulir");
      else navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login gagal",
        description: err.response?.data?.message || "Terjadi kesalahan",
        variant: "destructive",
      });
      // Generate new captcha on login failure
      setCurrentCaptcha(generateCaptcha());
      setCaptchaInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1e3a5f] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden p-1">
            <img
              src={LogoMenduniaJepang}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-semibold text-lg">Sistem Penempatan</span>
        </div>
        <div>
          <p className="font-display text-5xl text-white leading-tight mb-6">
            Matching
            <br />
            Kandidat
            <br />
          </p>
          <p className="text-sm text-white/60 leading-relaxed max-w-xs">
            Platform penempatan kerja ke Jepang yang menghubungkan kandidat
            terbaik dengan perusahaan terpercaya.
          </p>
        </div>
        <p className="text-xs text-white/30 font-mono">
          © 2026 Sistem Penempatan
        </p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center p-1">
                {/* PERBAIKAN: Gunakan LogoMenduniaJepang bukan Logo */}
                <img
                  src={LogoMenduniaJepang}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-semibold text-sm">Sistem Penempatan</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground">
              Selamat datang kembali
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
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
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Label htmlFor="captcha">Verifikasi Keamanan</Label>

              {/* TEXT + REFRESH */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg tracking-widest select-none">
                  {currentCaptcha.text}
                </span>

                <button
                  type="button"
                  onClick={handleRefreshCaptcha}
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* INPUT */}
              <Input
                id="captcha"
                type="text"
                placeholder="Ketik captcha"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  setCaptchaError(false);
                }}
              />

              {/* ERROR */}
              {captchaError && (
                <p className="text-sm text-red-500">Captcha salah</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="text-foreground font-medium hover:underline underline-offset-4"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs font-mono text-muted-foreground mb-2">Demo akses:</p>
            <p className="text-xs text-muted-foreground">Admin: <span className="font-mono">admin@kandidat.com</span></p>
            <p className="text-xs text-muted-foreground">Password: <span className="font-mono">password</span></p>
          </div> */}
        </div>
      </div>
    </div>
  );
}
