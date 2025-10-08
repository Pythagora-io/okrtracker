import { LogOut, Settings, Users, Target } from "lucide-react"
import { Button } from "./ui/button"
import { ThemeToggle } from "./ui/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import { UserRole } from "../../../shared/types/user"

export function Header() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const userRole = (localStorage.getItem('userRole') as UserRole) || UserRole.IC

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const getNavItems = () => {
    switch (userRole) {
      case UserRole.ADMIN:
        return [
          { path: '/admin/users', label: 'Users', icon: Users },
          { path: '/admin/settings', label: 'Settings', icon: Settings }
        ]
      case UserRole.MANAGER:
        return [
          { path: '/manager/teams', label: 'My Teams', icon: Users }
        ]
      case UserRole.IC:
        return [
          { path: '/ic/goals', label: 'My Goals', icon: Target }
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div 
            className="text-xl font-bold cursor-pointer bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            onClick={() => navigate("/")}
          >
            OKR Tracker
          </div>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}