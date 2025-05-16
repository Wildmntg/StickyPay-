import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TokenList } from "@/components/dashboard/token-list"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getConfig } from "@/lib/actions/config-actions"

export const metadata: Metadata = {
  title: "Token Settings | StickyPay",
  description: "Configure accepted tokens for your StickyPay account",
}

export default async function TokenSettingsPage() {
  const config = await getConfig()

  // Mock merchant ID
  const merchantId = "merchant-123"

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-4">
        <Link
          href="/dashboard/settings"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Settings
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold">Token Settings</h1>
        <p className="text-muted-foreground">Configure which tokens you accept for payments</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accepted Tokens</CardTitle>
            <CardDescription>Choose which tokens you want to accept as payment</CardDescription>
          </CardHeader>
          <CardContent>
            {config.enableMultiToken ? (
              <TokenList merchantId={merchantId} />
            ) : (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-300">
                <p className="font-medium">Multi-token support is disabled</p>
                <p className="text-sm">
                  To enable multi-token support, set the <code>ENABLE_MULTI_TOKEN</code> environment variable to{" "}
                  <code>true</code>.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settlement Token</CardTitle>
            <CardDescription>Choose which token you want to receive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                When customers pay with a different token than your settlement token, it will be automatically
                converted.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <input
                    type="radio"
                    id="settlement-usdc"
                    name="settlement"
                    value="USDC"
                    defaultChecked
                    className="h-4 w-4 rounded-full border-gray-300"
                  />
                  <label htmlFor="settlement-usdc" className="flex flex-1 cursor-pointer items-center">
                    <div className="relative mr-2 h-6 w-6">
                      <img src="/tokens/usdc.png" alt="USDC" className="h-full w-full rounded-full" />
                    </div>
                    <div>
                      <div className="font-medium">USDC</div>
                      <div className="text-xs text-muted-foreground">USD Coin</div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <input
                    type="radio"
                    id="settlement-sol"
                    name="settlement"
                    value="SOL"
                    className="h-4 w-4 rounded-full border-gray-300"
                  />
                  <label htmlFor="settlement-sol" className="flex flex-1 cursor-pointer items-center">
                    <div className="relative mr-2 h-6 w-6">
                      <img src="/tokens/sol.png" alt="SOL" className="h-full w-full rounded-full" />
                    </div>
                    <div>
                      <div className="font-medium">SOL</div>
                      <div className="text-xs text-muted-foreground">Solana</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
