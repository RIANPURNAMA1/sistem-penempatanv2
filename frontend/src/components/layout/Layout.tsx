import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Building2, GitBranch, LogOut,
  Menu, X, ChevronRight, FileText, User, Settings, Briefcase,
  Database, PanelLeftClose, PanelLeftOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  roles: string[]
}

const LogoMenduniaJepang = "/images/logo4.png"

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin_penempatan', 'admin_cabang'] },
  { label: 'Data Kandidat', href: '/kandidat', icon: Users, roles: ['admin_penempatan', 'admin_cabang'] },
  { label: 'Job Order', href: '/joborder', icon: Briefcase, roles: ['admin_penempatan'] },
  { label: 'Perusahaan', href: '/perusahaan', icon: Building2, roles: ['admin_penempatan'] },
  { label: 'Cabang', href: '/cabang', icon: GitBranch, roles: ['admin_penempatan'] },
  { label: 'Manajemen User', href: '/users', icon: Settings, roles: ['admin_penempatan'] },
  { label: 'Data Sistem Lama', href: '/data-sistem-lama', icon: Database, roles: ['admin_penempatan'] },
  { label: 'Dashboard', href: '/kandidat-dashboard', icon: LayoutDashboard, roles: ['kandidat'] },
  { label: 'Isi Formulir', href: '/formulir', icon: FileText, roles: ['kandidat'] },
  { label: 'Profil', href: '/profil', icon: User, roles: ['kandidat'] },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved) setSidebarCollapsed(JSON.parse(saved))
  }, [])

  const toggleSidebar = () => {
    const newValue = !sidebarCollapsed
    setSidebarCollapsed(newValue)
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue))
  }

  const filtered = navItems.filter(i => user && i.roles.includes(user.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel: Record<string, string> = {
    kandidat: 'Kandidat',
    admin_cabang: 'Admin Cabang',
    admin_penempatan: 'Admin Penempatan'
  }

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-[#1e3a5f]/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 bg-white border-r border-border flex flex-col shadow-sm transition-all duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:static lg:translate-x-0",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        {/* Logo */}
        <div className={cn(
          "h-16 flex items-center border-b border-border shrink-0",
          sidebarCollapsed ? "lg:px-2 justify-center" : "px-6 justify-between"
        )}>
          {/* Logo - show when collapsed, hide when expanded */}
          <div className={cn(
            "items-center justify-center",
            sidebarCollapsed ? "lg:flex w-full h-10" : "lg:hidden"
          )}>
            <img src={LogoMenduniaJepang} alt="Logo" className="w-full h-full object-contain" />
          </div>
          {/* Text - show when expanded, hide when collapsed */}
          <div className={cn(
            "flex items-center gap-2.5",
            sidebarCollapsed ? "lg:hidden" : ""
          )}>
            <div className="w-8 h-8  rounded-lg flex items-center justify-center">
               <img src={LogoMenduniaJepang} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none text-[#1e3a5f]">Sistem</p>
              <p className="text-[10px] text-muted-foreground font-mono">Penempatan</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
          {/* Collapse button - desktop only */}
          <button 
            onClick={toggleSidebar} 
            className={cn(
              "hidden lg:flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
              sidebarCollapsed ? "absolute -right-3.5 top-4 bg-white border shadow-sm" : ""
            )}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* User info */}
        <div className={cn("border-b border-border shrink-0", sidebarCollapsed ? "lg:py-3 lg:flex lg:justify-center" : "px-4 py-4")}>
          <div className={cn("flex items-center gap-3 p-2 rounded-lg bg-muted/50", sidebarCollapsed && "lg:flex-col lg:p-1.5")}>
            <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-semibold">{user?.nama?.charAt(0)?.toUpperCase()}</span>
            </div>
            <div className={cn("min-w-0", sidebarCollapsed && "lg:hidden")}>
              <p className="text-sm font-medium truncate text-foreground">{user?.nama}</p>
              <p className="text-[11px] text-muted-foreground">{user && roleLabel[user.role]}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className={cn("flex-1 py-4 space-y-0.5 overflow-y-auto", sidebarCollapsed ? "lg:px-1.5" : "px-3")}>
          {filtered.map(item => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                  active
                    ? "bg-[#1e3a5f] text-white font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  sidebarCollapsed && "lg:justify-center lg:px-2"
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className={cn("flex-1", sidebarCollapsed && "lg:hidden")}>{item.label}</span>
                {active && !sidebarCollapsed && <ChevronRight size={14} className="opacity-80" />}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className={cn("border-t border-border shrink-0", sidebarCollapsed ? "lg:px-1.5" : "p-3")}>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all",
              sidebarCollapsed && "lg:justify-center lg:px-2"
            )}
          >
            <LogOut size={16} />
            <span className={sidebarCollapsed ? "lg:hidden" : ""}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center px-4 lg:px-6 gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          {user?.nama_cabang && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <GitBranch size={12} />
              <span>{user.nama_cabang}</span>
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
