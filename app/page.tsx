"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SimpleTabs, SimpleTabsList, SimpleTabsTrigger, SimpleTabsContent } from "@/components/ui/simple-tabs"
import { ArrowRight, CheckCircle, CreditCard, Wallet } from "lucide-react"
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/user-dashboard")

  const [usingFallback, setUsingFallback] = useState(false)

  useEffect(() => {
    // Check if we need to use the fallback tabs
    try {
      // Try to import the Radix tabs
      require("@radix-ui/react-tabs")
    } catch (error) {
      console.warn("Using fallback tabs due to Radix UI import error:", error)
      setUsingFallback(true)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="StickyPay Logo" width={32} height={32} />
            <span className="text-xl font-bold">StickyPay</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link href="/dashboard" className="text-sm font-medium hover:underline">
              Dashboard
            </Link>
            <Link href="/user-dashboard" className="text-sm font-medium hover:underline">
              Customer Portal
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Web3 Payments for Modern Businesses
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Accept Solana payments directly to your wallet. Instant, secure, and non-custodial.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button className="gap-1">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/user-dashboard">
                  <Button variant="outline">Customer Portal</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <Image
                src="/diverse-products-still-life.png"
                alt="StickyPay in action"
                width={550}
                height={310}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                StickyPay makes accepting crypto payments simple for any business
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Connect Wallet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Link your Solana wallet to receive payments directly
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Create Checkout</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Generate payment links and QR codes for your customers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Get Paid</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive payments directly to your wallet in USDC or other tokens
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Everything you need to accept crypto payments
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-3xl py-12">
            {usingFallback ? (
              <SimpleTabs defaultValue="merchants">
                <SimpleTabsList className="grid w-full grid-cols-2">
                  <SimpleTabsTrigger value="merchants">For Merchants</SimpleTabsTrigger>
                  <SimpleTabsTrigger value="customers">For Customers</SimpleTabsTrigger>
                </SimpleTabsList>
                <SimpleTabsContent value="merchants" className="p-4 pt-6">
                  <ul className="grid gap-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Non-custodial payments</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Funds go directly to your wallet - we never hold your money
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Multi-token support</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Accept SOL, USDC, BONK, JUP and other SPL tokens
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Automatic token conversion</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Convert received tokens to USDC automatically
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Detailed analytics</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Track all your transactions and revenue in real-time
                        </p>
                      </div>
                    </li>
                  </ul>
                </SimpleTabsContent>
                <SimpleTabsContent value="customers" className="p-4 pt-6">
                  <ul className="grid gap-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">One-click payments</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Pay with just a tap using Solana Pay on mobile
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Pay with any token</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Use your preferred SPL token for payments
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">NFT discounts</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get special discounts when you own merchant NFTs
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Transaction history</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          View all your payment history in one place
                        </p>
                      </div>
                    </li>
                  </ul>
                </SimpleTabsContent>
              </SimpleTabs>
            ) : (
              <div className="text-center p-8">
                <p>Loading features...</p>
              </div>
            )}
          </div>
        </div>
      </section>
      <footer className="border-t">
        <div className="container flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="StickyPay Logo" width={24} height={24} />
              <span className="text-lg font-bold">StickyPay</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Web3 payments for modern businesses</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-8">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/dashboard" className="text-gray-500 hover:underline dark:text-gray-400">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/user-dashboard" className="text-gray-500 hover:underline dark:text-gray-400">
                    Customer Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-500 hover:underline dark:text-gray-400">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 StickyPay. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50">
                <span className="sr-only">GitHub</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
