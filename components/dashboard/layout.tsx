"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Brain,
  Upload,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User,
  Zap,
  FileText,
  HelpCircle,
  Heart,
  Sparkles,
  Mic,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Get profile data
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (profile) {
          setProfile(profile)
        }
      } else {
        router.push("/auth/signin")
      }
    }

    getUser()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Brain },
    { name: "Upload", href: "/dashboard/upload", icon: Upload },
    { name: "Study Materials", href: "/dashboard/materials", icon: BookOpen },
    {
      name: "Voice Tutor",
      href: "/dashboard/voice-tutor",
      icon: Mic,
      badge: ""
    },
    { name: "Flashcards", href: "/dashboard/flashcards", icon: Zap },
    { name: "Quiz", href: "/dashboard/quiz", icon: HelpCircle },
    { name: "Summarizer", href: "/dashboard/summarizer", icon: Sparkles },
    { name: "Stress Relief", href: "/dashboard/stress-relief", icon: Heart },
    { name: "Exam Generator", href: "/dashboard/exam-generator", icon: FileText },
    { name: "Study Planner", href: "/dashboard/planner", icon: Calendar },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ]

  if (!user) {
    return (
      <div className="min-h-screen nature-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Neural Forest" width={32} height={32} />
              <span className="text-lg font-bold text-green-800 dark:text-green-400">Duoheads</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex h-16 items-center px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Image src="/logo.png" alt="Neural Forest" width={32} height={32} />
              <span className="text-lg font-bold text-green-800 dark:text-green-400">Duoheads</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 sm:px-4 shadow-sm lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden p-1 sm:p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center min-w-0">
              <h1 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                Welcome back, {profile?.full_name || user?.email}!
              </h1>
            </div>
            <div className="flex items-center gap-x-1 sm:gap-x-2 lg:gap-x-4">
              {profile?.subscription_tier && (
                <Badge
                  variant={profile.subscription_tier === "pro" ? "default" : "secondary"}
                  className="hidden sm:inline-flex text-xs"
                >
                  {profile.subscription_tier.toUpperCase()}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="p-1 sm:p-2"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>

              <Button variant="ghost" size="sm" className="p-1 sm:p-2 hidden sm:flex">
                <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.full_name} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {profile?.subscription_tier && (
                    <>
                      <DropdownMenuItem className="sm:hidden">
                        <Badge
                          variant={profile.subscription_tier === "pro" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {profile.subscription_tier.toUpperCase()}
                        </Badge>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="sm:hidden" />
                    </>
                  )}
                  <DropdownMenuItem className="sm:hidden">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
