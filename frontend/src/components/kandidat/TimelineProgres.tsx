import { 
  Search, Clock, Send, Microscope, Calendar, 
  CheckCircle, XCircle, FileText, Plane, Ban,
  Check
} from 'lucide-react'

const PROGRES_STEPS = [
  { key: 'Job Matching', label: 'Job Matching', icon: Search },
  { key: 'Pending', label: 'Pending', icon: Clock },
  { key: 'lamar ke perusahaan', label: 'Lamar ke Perusahaan', icon: Send },
  { key: 'Interview', label: 'Interview', icon: Microscope },
  { key: 'Jadwalkan Interview Ulang', label: 'Interview Ulang', icon: Calendar },
  { key: 'Lulus interview', label: 'Lulus Interview', icon: CheckCircle },
  { key: 'Gagal Interview', label: 'Gagal Interview', icon: XCircle },
  { key: 'Pemberkasan', label: 'Pemberkasan', icon: FileText },
  { key: 'Berangkat', label: 'Berangkat', icon: Plane },
  { key: 'Ditolak', label: 'Ditolak', icon: Ban },
]

const ACTIVE_PROGRES_STEPS = PROGRES_STEPS.filter(s => s.key !== 'Gagal Interview' && s.key !== 'Ditolak')

interface TimelineProgresProps {
  currentStatus?: string
}

export default function TimelineProgres({ currentStatus }: TimelineProgresProps) {
  const currentIndex = ACTIVE_PROGRES_STEPS.findIndex(s => s.key === currentStatus)
  
  if (!currentStatus) return null

  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3">Progress Kandidat</h2>
      
      {/* Desktop: Horizontal Timeline */}
      <div className="hidden sm:flex items-center justify-between overflow-x-auto pb-2">
        {ACTIVE_PROGRES_STEPS.map((step, idx) => {
          const Icon = step.icon
          const isCurrent = step.key === currentStatus
          const isPast = idx < currentIndex && currentStatus !== 'Gagal Interview' && currentStatus !== 'Ditolak'
          
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center min-w-[70px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${isCurrent ? 'bg-[#1e3a5f] text-white ring-4 ring-[#1e3a5f]/20' : 
                    isPast ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {isPast ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className={`text-xs mt-1 text-center ${isCurrent ? 'font-medium text-[#1e3a5f]' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              {idx < ACTIVE_PROGRES_STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 ${isPast ? 'bg-emerald-500' : 'bg-muted'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: Card List */}
      <div className="sm:hidden space-y-2">
        <div className="grid grid-cols-1 gap-2">
          {ACTIVE_PROGRES_STEPS.map((step, idx) => {
            const Icon = step.icon
            const isCurrent = step.key === currentStatus
            const isPast = idx < currentIndex && currentStatus !== 'Gagal Interview' && currentStatus !== 'Ditolak'
            
            return (
              <div 
                key={step.key} 
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                  ${isCurrent ? 'bg-[#1e3a5f]/5 border-[#1e3a5f]/30' : 
                    isPast ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/30 border-border'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${isCurrent ? 'bg-[#1e3a5f] text-white' : 
                    isPast ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {isPast ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-sm ${isCurrent ? 'font-medium text-[#1e3a5f]' : isPast ? 'text-emerald-700 font-medium' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
                {isCurrent && (
                  <span className="ml-auto text-xs bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full">
                    Aktif
                  </span>
                )}
                {isPast && (
                  <span className="ml-auto text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                    Selesai
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
      
      {currentStatus === 'Gagal Interview' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <span className="text-red-600 font-medium text-sm">Maaf, Anda tidak lolos pada tahap Interview</span>
        </div>
      )}
      {currentStatus === 'Ditolak' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
          <span className="text-red-600 font-medium text-sm">Mohon maaf, pendaftaran Anda ditolak</span>
        </div>
      )}
    </div>
  )
}