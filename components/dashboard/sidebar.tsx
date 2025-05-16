"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { CreditCard, DollarSign, Home, Settings, Store, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Checkout",
    icon: CreditCard,
    href: "/dashboard/checkout",
    color: "text-violet-500",
  },
  {
    label: "Transactions",
    icon: DollarSign,
    href: "/dashboard/transactions",
    color: "text-pink-700",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-emerald-500",
    submenu: [
      {
        label: "General",
        href: "/dashboard/settings",
      },
      {
        label: "Tokens",
        href: "/dashboard/settings/tokens",
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Close sidebar when route changes (mobile UX improvement)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("sidebar")
      const toggleButton = document.getElementById("sidebar-toggle")

      if (
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        toggleButton &&
        !toggleButton.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col space-y-4 py-4">
          <div className="px-3 py-2 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center pl-3">
              <div className="relative h-8 w-8 mr-4">
                <Store className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-bold">StickyPay</h1>
            </Link>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close sidebar</span>
            </Button>
          </div>
          <div className="px-3 py-2">
            <div className="space-y-1">
              {routes.map((route) => (
                <div key={route.href}>
                  <Link
                    href={route.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                      pathname === route.href
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-primary/5",
                    )}
                  >
                    <route.icon className={cn("mr-3 h-5 w-5", route.color)} />
                    {route.label}
                  </Link>
                  {route.submenu && pathname.includes(route.href) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {route.submenu.map((submenu) => (
                        <Link
                          key={submenu.href}
                          href={submenu.href}
                          className={cn(
                            "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
                            pathname === submenu.href
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-primary/5",
                          )}
                        >
                          {submenu.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
