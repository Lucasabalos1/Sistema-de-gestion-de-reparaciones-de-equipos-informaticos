import { useState, type ReactNode } from "react"
import { Header } from "./Header"
import { Navbar } from "./Navbar"

interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false)

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onToggleSidebar={toggleSidebar} />
      <Navbar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <main className="flex-1 p-6 flex justify-center">
        {children}
      </main>
    </div>
  )
}
