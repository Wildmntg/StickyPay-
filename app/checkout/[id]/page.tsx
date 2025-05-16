import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Copy, Share2 } from "lucide-react"
import { getConfig } from "@/lib/actions/config-actions"

export const metadata: Metadata = {
  title: "Checkout | StickyPay",
  description: "Complete your payment with StickyPay",
}

interface CheckoutPageProps {
  params: {
    id: string
  }
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = params
  const config = await getConfig()

  // Mock checkout data
  const checkout = {
    id,
    merchantName: "Demo Store",
    amount: "25.00",
    currency: "USDC",
    description: "Premium Subscription",
    recipientAddress: "DummyRecipientAddressForSolana",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold">Complete Your Payment</h1>
          <p className="text-muted-foreground">{checkout.merchantName}</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{checkout.description}</CardTitle>
                <CardDescription>Order #{id.substring(0, 8)}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {checkout.amount} {checkout.currency}
                </div>
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                >
                  Testnet
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="aspect-square w-full max-w-xs overflow-hidden rounded-lg border bg-white p-2">
                <div className="flex h-full w-full items-center justify-center bg-white">
                  <QrCode className="h-full w-full p-4 text-black" />
                </div>
              </div>
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Scan this QR code with the StickyPay app</p>
                <p>to pay with USDC</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-4">
            <div className="flex w-full items-center justify-between text-sm">
              <span className="text-muted-foreground">Expires in</span>
              <span>30:00</span>
            </div>
            {config.enableNftDiscounts && (
              <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <p className="font-medium">NFT Holder Discounts Available</p>
                <p>Connect your wallet to check if you qualify for NFT holder discounts.</p>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
