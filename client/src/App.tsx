import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "./components/ui/theme-provider"
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from "./contexts/AuthContext"
import { Login } from "./pages/Login"
import { Register } from "./pages/Register"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { BlankPage } from "./pages/BlankPage"
import { Home } from "./pages/Home"
import { AdminUsers } from "./pages/AdminUsers"
import { AdminSettings } from "./pages/AdminSettings"
import { ManagerTeams } from "./pages/ManagerTeams"
import { ManagerTeamDetail } from "./pages/ManagerTeamDetail"
import { ManagerICDetail } from "./pages/ManagerICDetail"
import { ICGoals } from "./pages/ICGoals"
import { SetupPassword } from "./pages/SetupPassword"

function App() {
  return (
  <AuthProvider>
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/setup-password" element={<SetupPassword />} />
          <Route path="/" element={<ProtectedRoute> <Layout /> </ProtectedRoute>}>
            <Route index element={<Home />} />
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/settings" element={<AdminSettings />} />
            <Route path="manager/teams" element={<ManagerTeams />} />
            <Route path="manager/team/:teamId" element={<ManagerTeamDetail />} />
            <Route path="manager/ic/:icId" element={<ManagerICDetail />} />
            <Route path="ic/goals" element={<ICGoals />} />
          </Route>
          <Route path="*" element={<BlankPage />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  </AuthProvider>
  )
}

export default App