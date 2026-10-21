import { Card, CardContent } from "@/components/ui/components";
import { Check } from "lucide-react";

interface ProgresTrackerProps {
  statusProgres?: string;
}

const steps = [
  'Job Matching',
  'lamar ke perusahaan',
  'Interview',
  'Lulus interview',
  'Pemberkasan',
  'Berangkat'
];

export default function ProgresTracker({ statusProgres }: ProgresTrackerProps) {
  const currentIdx = steps.indexOf(statusProgres || '');

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
          Alur Progres
        </p>
        <div>
          {steps.map((step, i) => {
            const isDone = currentIdx > i;
            const isActive = currentIdx === i;
            const isLast = i === steps.length - 1;

            return (
              <div key={step} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Garis penghubung */}
                {!isLast && (
                  <div
                    className={`absolute left-[8.5px] top-5 bottom-0 w-0.5 ${
                      isDone ? "bg-emerald-300" : "bg-border"
                    }`}
                  />
                )}

                {/* Titik / centang */}
                <div
                  className={`relative z-10 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "bg-amber-400 text-white ring-4 ring-amber-100"
                      : "bg-muted border-2 border-border"
                  }`}
                >
                  {isDone && <Check size={11} strokeWidth={3} />}
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>

                <div className="-mt-0.5 min-w-0">
                  <p
                    className={`text-xs leading-tight ${
                      isActive
                        ? "text-foreground font-bold"
                        : isDone
                        ? "text-muted-foreground font-medium"
                        : "text-muted-foreground/60"
                    }`}
                  >
                    {step === "lamar ke perusahaan"
                      ? "Lamar ke Perusahaan"
                      : step}
                  </p>
                  {isActive && (
                    <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                      Sedang berlangsung
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
