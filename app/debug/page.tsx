"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { getConfig } from "@/lib/actions/config-actions"
import { getAcceptedTokens } from "@/lib/actions/token-actions"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Loader2, Check, X } from "lucide-react"

export default function DebugPage() {
  const { toast } = useToast()
  const { connected, publicKey } = useWallet()
  const [config, setConfig] = useState<any>(null)
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const [configData, tokensData] = await Promise.all([getConfig(), getAcceptedTokens()])

        setConfig(configData)
        setTokens(tokensData)
      } catch (err) {
        console.error("Error fetching debug data:", err)
        setError("Failed to fetch debug data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const testWalletConnection = () => {
    if (connected) {
      toast({
        title: "Wallet Connected",
        description: `Connected to wallet: ${publicKey?.toString().substring(0, 8)}...`,
      })
    } else {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to test the connection",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="mb-6 text-2xl font-bold">StickyPay Debug Page</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Current application configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Loading configuration...</span>
              </div>
            ) : error ? (
              <div className="rounded-md bg-red-50 p-4 text-red-700 dark:bg-red-900/20 dark:text-red-300">{error}</div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md bg-muted p-4">
                  <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(config, null, 2)}</pre>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Multi-Token Support:</span>
                    {config?.enableMultiToken ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Check className="mr-1 h-4 w-4" /> Enabled
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 dark:text-red-400">
                        <X className="mr-1 h-4 w-4" /> Disabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Network:</span>
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      {config?.solanaNetwork || "unknown"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Wormhole Network:</span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {config?.wormholeNetwork || "unknown"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription>Test wallet connectivity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                {connected ? (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <Check className="mr-1 h-4 w-4" /> Connected
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400">
                    <X className="mr-1 h-4 w-4" /> Not Connected
                  </span>
                )}
              </div>

              {connected && publicKey && (
                <div className="flex items-center justify-between">
                  <span>Wallet Address:</span>
                  <span className="font-mono text-xs">
                    {publicKey.toString().substring(0, 8)}...
                    {publicKey.toString().substring(publicKey.toString().length - 8)}
                  </span>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <WalletMultiButton className="wallet-adapter-button-trigger" />
                <Button onClick={testWalletConnection} variant="outline">
                  Test Connection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Supported Tokens</CardTitle>
            <CardDescription>Tokens available for payment</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Loading tokens...</span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {tokens.map((token) => (
                  <div key={token.symbol} className="flex items-center space-x-3 rounded-lg border p-3">
                    <div className="h-8 w-8 overflow-hidden rounded-full">
                      <img
                        src={token.logoUrl || `/placeholder.svg?height=32&width=32&query=${token.symbol}`}
                        alt={token.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
