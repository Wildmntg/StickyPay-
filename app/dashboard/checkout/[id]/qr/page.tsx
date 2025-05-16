"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { QRCodeGenerator } from "@/components/checkout/qr-code-generator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock function to get checkout session data
const getCheckoutSession = async (id: string) => {
  // In a real app, this would fetch from an API
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Mock data
  return {
    id,
    name: "Premium Subscription",
    amount: "49.99",
    token: "USDC",
    merchantAddress: "8YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3",
    merchantName: "Example Store",
  }
}

export default function CheckoutQRPage() {
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [checkoutData, setCheckoutData] = useState<any>(null)

  useEffect(() => {
    const fetchCheckoutData = async () => {
      try {
        const id = params.id as string
        const data = await getCheckoutSession(id)
        setCheckoutData(data)
      } catch (error) {
        console.error("Error fetching checkout data:", error)
        toast({
          title: "Error",
          description: "Failed to load checkout session data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheckoutData()
  }, [params.id, toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading checkout data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center">
        <Link href={`/dashboard/checkout/${params.id}`} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Checkout Details
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payment QR Code</h1>
        <p className="text-muted-foreground">
          Generate a QR code for customers to scan and pay for this checkout session
        </p>
      </div>

      <div className="flex justify-center">
        {checkoutData ? (
          <QRCodeGenerator
            merchantAddress={checkoutData.merchantAddress}
            defaultAmount={checkoutData.amount}
            defaultToken={checkoutData.token}
            merchantName={checkoutData.merchantName}
            itemName={checkoutData.name}
            sessionId={checkoutData.id}
          />
        ) : (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-400">
              Checkout session not found. Please check the ID and try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
