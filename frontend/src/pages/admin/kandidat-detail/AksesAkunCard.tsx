import { Card, CardContent } from "@/components/ui/components";
import { SectionTitle } from "@/components/kandidat";
import { KeyRound, Info } from "lucide-react";

interface AksesAkunCardProps {
  data: any;
}

const DEFAULT_PASSWORD = "12345678";

export default function AksesAkunCard({ data }: AksesAkunCardProps) {
  const nama = data.nama || data.nama_romaji || "-";
  const email = data.email || "-";
  const password = data.password_akun || DEFAULT_PASSWORD;

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle icon={KeyRound} title="Akses Akun" />

        <div className="space-y-3 mt-4">
          <div className="grid gap-1.5">
            <span className="text-xs text-muted-foreground">Nama</span>
            <code className="text-sm font-medium px-2.5 py-1.5 bg-muted rounded-md w-fit">
              {nama}
            </code>
            <p className="text-[11px] text-muted-foreground">
              Bisa digunakan untuk login (nama atau email)
            </p>
          </div>

          <div className="grid gap-1.5">
            <span className="text-xs text-muted-foreground">Email</span>
            <code className="text-sm font-medium px-2.5 py-1.5 bg-muted rounded-md w-fit">
              {email}
            </code>
          </div>

          <div className="grid gap-1.5">
            <span className="text-xs text-muted-foreground">Password (Default)</span>
            <code className="text-sm font-medium px-2.5 py-1.5 bg-muted rounded-md w-fit">
              {password}
            </code>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-relaxed">
              Jika password tidak berfungsi / salah, berarti sudah diganti oleh
              pemilik akun (kandidat).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
