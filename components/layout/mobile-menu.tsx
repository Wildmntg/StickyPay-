"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, Home, CreditCard, User, HelpCircle, QrCode, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"
import { cn } from "@/lib/utils"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { connected, publicKey } = useWallet()
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname, isOpen, onClose])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Handle navigation
  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: CreditCard },
    { href: "/user-dashboard", label: "User Dashboard", icon: User },
    { href: "/pay", label: "Scan & Pay", icon: QrCode },
    { href: "/receive", label: "Receive", icon: Wallet },
    { href: "/test-qr", label: "Test QR Generator", icon: QrCode },
    { href: "/debug", label: "Debug Tools", icon: HelpCircle },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose} aria-hidden="true" />}

      {/* Menu */}
      <div
        ref={menuRef}
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-xs flex flex-col bg-background shadow-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">StickyPay</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Wallet connection */}
          <div className="border-b p-4">
            <div className="rounded-lg border p-4">
              <WalletMultiButton className="wallet-adapter-button-custom w-full" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p>Connected to {process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"}</p>
            <p className="mt-1">© 2023 StickyPay</p>
          </div>
        </div>
      </div>
    </>
  )
}
