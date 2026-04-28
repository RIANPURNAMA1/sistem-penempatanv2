import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  GitBranch,
  LogOut,
  Menu,
  X,
  ChevronRight,
  FileText,
  User,
  Settings,
  Briefcase,
  Database,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  History,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[];
}

const LogoMenduniaJepang = "/images/logo4.png";

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin_penempatan", "admin_cabang"],
  },
  {
    label: "Data Kandidat",
    href: "/kandidat",
    icon: Users,
    roles: ["admin_penempatan", "admin_cabang"],
  },
  {
    label: "Job Order",
    href: "/joborder",
    icon: Briefcase,
    roles: ["admin_penempatan"],
  },
  {
    label: "Perusahaan",
    href: "/perusahaan",
    icon: Building2,
    roles: ["admin_penempatan"],
  },
  {
    label: "Cabang",
    href: "/cabang",
    icon: GitBranch,
    roles: ["admin_penempatan"],
  },
  {
    label: "Manajemen User",
    href: "/users",
    icon: Settings,
    roles: ["admin_penempatan"],
  },
  {
    label: "Data Sistem Lama",
    href: "/data-sistem-lama",
    icon: Database,
    roles: ["admin_penempatan"],
  },
  {
    label: "Dashboard",
    href: "/kandidat-dashboard",
    icon: LayoutDashboard,
    roles: ["kandidat"],
  },
  {
    label: "History",
    href: "/kandidat-history",
    icon: History,
    roles: ["kandidat"],
  },
  {
    label: "Isi Formulir",
    href: "/formulir",
    icon: FileText,
    roles: ["kandidat"],
  },
  { label: "Profil", href: "/profil", icon: User, roles: ["kandidat"] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHeaderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      navigate(`/kandidat?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch("");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved) setSidebarCollapsed(JSON.parse(saved));
  }, []);

  const toggleSidebar = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(newValue));
  };

  const filtered = navItems.filter((i) => user && i.roles.includes(user.role));

  const confirmLogout = () => {
    setLogoutOpen(true);
  };

  const handleLogout = () => {
    setLogoutOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#1e3a5f]/30 lg:hidden "
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r flex flex-col transition-all duration-300 p-2",
          "w-64", // mobile selalu full
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:translate-x-0",
          sidebarCollapsed ? "lg:w-20" : "lg:w-[250px]",
        )}
      >
        {/* LOGO */}
        <div
          className={cn(
            "h-16 flex items-center border-b relative",
            sidebarCollapsed ? "justify-center px-0" : "justify-between px-6",
          )}
        >
          <div
            className={cn(
              "flex items-center",
              sidebarCollapsed ? "justify-center w-full" : "gap-3",
            )}
          >
            {/* LOGO */}
            <div
              className={cn(
                "flex items-center justify-center rounded-lg transition-all duration-300",
                sidebarCollapsed ? "w-10 h-10" : "w-9 h-9 bg-[#1e3a5f]",
              )}
            >
              <img
                src={LogoMenduniaJepang}
                alt="Logo"
                className={cn(
                  "object-contain transition-all duration-300",
                  sidebarCollapsed ? "w-6 h-6" : "w-7 h-7",
                )}
              />
            </div>

            {/* TEXT → FIX RESPONSIVE */}
            <div
              className={cn(
                "transition-all",
                sidebarCollapsed ? "lg:hidden" : "lg:block",
              )}
            >
              <p className="text-sm font-semibold text-[#1e3a5f] leading-none">
                Sistem
              </p>
              <p className="text-[10px] text-muted-foreground font-mono">
                Penempatan
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1"
          >
            <X size={20} />
          </button>

          <button
            onClick={toggleSidebar}
            className={cn(
              "hidden lg:flex items-center justify-start w-7 h-7 rounded-md hover:bg-muted absolute right-2 top-4 right-[-28px] ",
              sidebarCollapsed && "right-[-20px] bg-white border shadow ",
            )}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
          </button>
        </div>

        {/* NAV */}
        <nav
          className={cn(
            "flex-1 py-4 space-y-1 overflow-y-auto",
            sidebarCollapsed ? "px-1.5" : "px-3",
          )}
        >
          {filtered.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-lg text-sm transition-all",
                  active
                    ? "bg-[#1e3a5f] text-white"
                    : "text-muted-foreground hover:bg-muted",
                  sidebarCollapsed ? "lg:justify-center px-2" : "px-3",
                )}
              >
                <Icon size={18} />

                {/* TEXT → FIX RESPONSIVE */}
                <span
                  className={cn(sidebarCollapsed ? "lg:hidden" : "lg:block")}
                >
                  {item.label}
                </span>

                {active && !sidebarCollapsed && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className={cn("border-t p-3", sidebarCollapsed && "px-1.5")}>
          <button
            onClick={confirmLogout}
            className={cn(
              "flex items-center gap-3 w-full py-2.5 rounded-lg text-sm hover:bg-red-50 hover:text-red-500",
              sidebarCollapsed ? "justify-center px-2" : "px-3",
            )}
          >
            <LogOut size={18} />
            <span className={cn(sidebarCollapsed ? "lg:hidden" : "lg:block")}>
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 relative">
          {/* LEFT */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-black"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* CENTER (SAFE MOBILE LOGO) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:hidden max-w-[60%]">
            <div className="flex items-center justify-center gap-2 truncate">
              {/* LOGO */}
              <img
                src={LogoMenduniaJepang}
                alt="Logo"
                className="h-6 w-6 object-contain shrink-0"
              />

              {/* TEXT */}
              <div className="leading-tight truncate">
                <p className="text-[11px] font-semibold text-[#1e3a5f] truncate">
                  Sistem
                </p>
                <p className="text-[10px] text-gray-400 truncate">Penempatan</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* 🔍 Search icon (mobile) */}
            {/* <Link
              to="/kandidat"
              className="md:hidden text-gray-500 hover:text-black"
            >
              <Search size={18} />
            </Link> */}

            {/* 🔍 Search input (desktop) */}
            <form
              onSubmit={handleHeaderSearch}
              className="hidden md:flex items-center bg-gray-100 rounded-lg px-2.5 py-1.5"
            >
              <button type="submit">
                <Search
                  size={14}
                  className="text-gray-400 hover:text-gray-600"
                />
              </button>
              <input
                type="text"
                placeholder="Cari kandidat..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="bg-transparent outline-none text-xs px-2 w-32"
              />
            </form>

            {/* Avatar */}
            <div className="w-8 h-8 mx-4 rounded-full bg-[#1e3a5f] flex items-center justify-center text-white text-xs font-semibold">
              {user?.nama?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[#fafafa] overflow-visible">
          <div className="p-4 sm:p-6 animate-fade-in overflow-visible">
            {children}
          </div>
        </main>
      </div>

      {/* LOGOUT CONFIRMATION */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Konfirmasi Logout</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin logout dari aplikasi?
          </p>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setLogoutOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
