"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Check, AlertTriangle, Wallet, ArrowRight } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFeatureFlags } from "@/lib/actions/config-actions"
import { getDefaultAcceptedTokens } from "@/lib/actions/token-actions"

interface CustomerWalletProps {
  amount: string
  token: string
  merchantAddress: string
  network?: "mainnet" | "devnet"
  onSuccess?: (txId: string) => void
  onError?: (error: string) => void
}

export function CustomerWallet({
  amount,
  token,
  merchantAddress,
  network = "devnet",
  onSuccess,
  onError,
}: CustomerWalletProps) {
  const { toast } = useToast()
  const { publicKey, connected, connecting, connect, signTransaction, sendTransaction } = useWallet()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedToken, setSelectedToken] = useState(token)
  const [enableMultiToken, setEnableMultiToken] = useState(false)
  const [acceptedTokens, setAcceptedTokens] = useState<string[]>([])
  const [txId, setTxId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Fetch feature flags and accepted tokens
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [flags, tokens] = await Promise.all([getFeatureFlags(), getDefaultAcceptedTokens()])

        setEnableMultiToken(flags.enableMultiToken)
        setAcceptedTokens(tokens)
      } catch (err) {
        console.error("Error fetching configuration:", err)
        // Default to SOL and USDC if fetch fails
        setAcceptedTokens(["SOL", "USDC"])
      }
    }

    fetchConfig()
  }, [])

  // Handle payment
  const handlePayment = async () => {
    if (!connected || !publicKey) {
      try {
        await connect()
        return // Will re-render with connected state
      } catch (err) {
        setError("Failed to connect wallet")
        if (onError) onError("Failed to connect wallet")
        return
      }
    }

    setIsProcessing(true)
    setError(null)

    try {
      // In a real implementation, this would:
      // 1. Create a transaction to transfer tokens
      // 2. If token is not the requested token, swap to the desired token
      // 3. Send the transaction to the merchant address

      // For demo purposes, we'll simulate a successful transaction
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulate transaction ID
      const simulatedTxId = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
      setTxId(simulatedTxId)

      toast({
        title: "Payment Successful",
        description: `Payment of ${amount} ${selectedToken} has been sent`,
      })

      if (onSuccess) onSuccess(simulatedTxId)
    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "Payment failed")
      if (onError) onError(err instanceof Error ? err.message : "Payment failed")
      toast({
        title: "Payment Failed",
        description: err instanceof Error ? err.message : "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Payment</CardTitle>
        <CardDescription>Pay with your Solana wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment details */}
        <div className="rounded-md border p-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium">Amount:</div>
            <div className="text-right">
              {amount} {token}
            </div>

            <div className="text-sm font-medium">Recipient:</div>
            <div className="text-right truncate text-xs">
              {merchantAddress.substring(0, 4)}...
              {merchantAddress.substring(merchantAddress.length - 4)}
            </div>

            <div className="text-sm font-medium">Network:</div>
            <div className="text-right">
              <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {network}
              </span>
            </div>
          </div>
        </div>

        {/* Token selection */}
        {enableMultiToken && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Pay with Token</label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {acceptedTokens.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedToken !== token && (
              <p className="text-xs text-muted-foreground">
                Your {selectedToken} will be automatically converted to {token}
              </p>
            )}
          </div>
        )}

        {/* Wallet connection and payment button */}
        {!txId ? (
          <div className="flex flex-col space-y-4">
            {!connected && !connecting ? (
              <Button onClick={() => connect()} disabled={connecting}>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            ) : (
              <Button onClick={handlePayment} disabled={isProcessing || !connected}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay {amount} {selectedToken}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700 dark:text-green-300">Payment Successful</span>
            </div>
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              Transaction ID: {txId.substring(0, 8)}...{txId.substring(txId.length - 8)}
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-300">Payment Failed</span>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">Powered by StickyPay</CardFooter>
    </Card>
  )
}
