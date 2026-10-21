import { Card, CardContent } from "@/components/ui/components";
import { SectionTitle } from "@/components/kandidat";
import { KeyRound, Copy, Info } from "lucide-react";
import { toast } from "@/hooks/useToast";

interface AksesAkunCardProps {
  data: any;
}

const DEFAULT_PASSWORD = "12345678";

export default function AksesAkunCard({ data }: AksesAkunCardProps) {
  const nama = data.nama || data.nama_romaji || "-";
  const email = data.email || "-";
  const password = data.password_akun || DEFAULT_PASSWORD;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} disalin ke clipboard` });
  };

  const CredentialRow = ({
    label,
    value,
    hint,
  }: {
    label: string;
    value: string;
    hint?: string;
  }) => (
    <div className="flex items-start justify-between gap-3 border rounded-xl px-3.5 py-2.5 bg-muted/20">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-bold font-mono break-all">{value}</p>
        {hint && (
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {hint}
          </p>
        )}
      </div>
      <button
        onClick={() => handleCopy(value, label)}
        className="p-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-500 hover:text-foreground transition-colors shrink-0"
        title={`Salin ${label}`}
      >
        <Copy size={14} />
      </button>
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-5">
        <SectionTitle
          icon={KeyRound}
          title="Akses Akun Login"
          description="Kredensial yang dipakai kandidat untuk login"
        />

        <div className="space-y-2.5">
          <CredentialRow
            label="Nama"
            value={nama}
            hint="Bisa digunakan untuk login (nama atau email)"
          />
          <CredentialRow label="Email" value={email} />
          <CredentialRow label="Password (Default)" value={password} />

          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-md px-3 py-2 mt-3">
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
