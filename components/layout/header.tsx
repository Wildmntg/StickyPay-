"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { MobileMenu } from "./mobile-menu"

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
          <Link href="/" className="flex items-center">
            <span className="ml-2 text-xl font-bold">StickyPay</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-4">
          <Link href="/dashboard" className="text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/user-dashboard" className="text-sm font-medium">
            User Dashboard
          </Link>
          <Link href="/pay" className="text-sm font-medium">
            Pay
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.push("/receive")}
          >
            <QrCode className="h-4 w-4" />
            Receive
          </Button>
        </nav>

        <div className="flex items-center">
          <WalletMultiButton className="wallet-adapter-button-custom" />
        </div>
      </div>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  )
}
