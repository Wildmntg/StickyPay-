"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Menu, User } from "lucide-react"
import { WalletConnect } from "@/components/wallet/wallet-connect"
import { NetworkSelector } from "@/components/dashboard/network-selector"

export function UserHeader() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Payment sent",
      description: "You sent 0.5 SOL to Example Store",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      title: "Welcome to StickyPay",
      description: "Thank you for joining StickyPay",
      time: "1 day ago",
      read: true,
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleNetworkChange = (network: "mainnet" | "devnet") => {
    console.log(`Network changed to ${network}`)
    // In a real app, this would update the global state or context
  }

  // Toggle sidebar state
  const toggleSidebar = () => {
    const sidebar = document.getElementById("user-sidebar")
    if (sidebar) {
      const isCurrentlyOpen = sidebar.classList.contains("translate-x-0")
      if (isCurrentlyOpen) {
        sidebar.classList.remove("translate-x-0")
        sidebar.classList.add("-translate-x-full")
      } else {
        sidebar.classList.remove("-translate-x-full")
        sidebar.classList.add("translate-x-0")
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <Button variant="outline" size="icon" id="user-sidebar-toggle" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex-1">
        <h1 className="text-lg font-semibold">User Dashboard</h1>
      </div>
      <div className="flex items-center gap-2">
        <NetworkSelector onNetworkChange={handleNetworkChange} />
        <WalletConnect />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="py-2 text-center text-sm text-muted-foreground">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`flex flex-col gap-1 ${notification.read ? "opacity-70" : ""}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read && <span className="h-2 w-2 rounded-full bg-primary"></span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{notification.description}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/user-dashboard/notifications" className="w-full cursor-pointer text-center">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/user-dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/user-dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/logout">Logout</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
