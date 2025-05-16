"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, Wallet, AlertTriangle } from "lucide-react"
import { getSolBalance, requestAirdrop, getNetworkName } from "@/lib/solana-rpc"
import { useToast } from "@/components/ui/use-toast"

export function WalletBalanceChecker() {
  const { toast } = useToast()
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAirdropping, setIsAirdropping] = useState(false)
  const [balanceResult, setBalanceResult] = useState<{
    success: boolean
    balance?: number
    error?: string
  } | null>(null)
  const networkName = getNetworkName()
  const isTestnet = networkName === "Devnet" || networkName === "Testnet"

  const handleCheckBalance = async () => {
    if (!address) {
      toast({
        title: "Address Required",
        description: "Please enter a Solana wallet address",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await getSolBalance(address)
      setBalanceResult(result)
    } catch (error) {
      setBalanceResult({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAirdrop = async () => {
    if (!address) {
      toast({
        title: "Address Required",
        description: "Please enter a Solana wallet address",
        variant: "destructive",
      })
      return
    }

    setIsAirdropping(true)
    try {
      const result = await requestAirdrop(address)

      if (result.success) {
        toast({
          title: "Airdrop Successful",
          description: "1 SOL has been airdropped to the wallet",
        })

        // Refresh balance after airdrop
        const balanceResult = await getSolBalance(address)
        setBalanceResult(balanceResult)
      } else {
        toast({
          title: "Airdrop Failed",
          description: result.error || "Failed to airdrop SOL",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Airdrop Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsAirdropping(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wallet Balance Checker</CardTitle>
        <CardDescription>Check SOL balance for any Solana wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Solana Wallet Address</label>
            <Input
              placeholder="Enter Solana wallet address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {balanceResult && (
            <div className={`rounded-md ${balanceResult.success ? "border" : "bg-red-50 dark:bg-red-900/20"} p-4`}>
              {balanceResult.success ? (
                <div className="text-center">
                  <p className="text-2xl font-bold">{balanceResult.balance?.toFixed(4)} SOL</p>
                  <p className="text-sm text-muted-foreground">Current wallet balance</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span>{balanceResult.error || "Failed to get balance"}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button onClick={handleCheckBalance} disabled={isLoading || isAirdropping} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Check Balance
            </>
          )}
        </Button>

        {isTestnet && balanceResult?.success && (
          <Button variant="outline" onClick={handleAirdrop} disabled={isAirdropping || isLoading} className="w-full">
            {isAirdropping ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Airdropping...
              </>
            ) : (
              "Request 1 SOL Airdrop"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
