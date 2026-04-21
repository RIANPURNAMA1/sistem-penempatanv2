import { Card, CardContent } from "@/components/ui/components";

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
        <div className="space-y-1">
          {steps.map((step, i) => {
            const isDone = currentIdx > i;
            const isActive = currentIdx === i;
            const isPending = currentIdx < i;

            return (
              <div key={step} className="flex items-center gap-2.5 py-1">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isDone
                      ? 'bg-green-500'
                      : isActive
                      ? 'bg-amber-400'
                      : 'bg-border'
                  }`}
                />
                <span
                  className={`text-xs ${
                    isActive
                      ? 'text-foreground font-medium'
                      : isDone
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  {step === 'lamar ke perusahaan' ? 'Lamar ke Perusahaan' : step}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
