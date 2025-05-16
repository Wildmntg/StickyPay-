"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink, RefreshCw } from "lucide-react"
import * as web3 from "@solana/web3.js"
import { TESTNET_TOKENS, getTokenBalance, hasTokenAccount, getTokenFaucetUrl } from "@/lib/testnet-tokens"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function TokenTester() {
  const { publicKey, connected } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [selectedToken, setSelectedToken] = useState<keyof typeof TESTNET_TOKENS>("USDC")
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [hasAccount, setHasAccount] = useState(false)
  const [connection, setConnection] = useState<web3.Connection | null>(null)

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"
  const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.testnet.solana.com"

  // Initialize connection
  useEffect(() => {
    try {
      const conn = new web3.Connection(rpcEndpoint, "confirmed")
      setConnection(conn)
      console.log("Connected to Solana RPC:", rpcEndpoint)
    } catch (error) {
      console.error("Failed to connect to Solana RPC:", error)
    }
  }, [rpcEndpoint])

  // Check token account and balance
  useEffect(() => {
    if (connected && publicKey && connection) {
      const checkTokenAccount = async () => {
        try {
          setLoading(true)
          const tokenMint = TESTNET_TOKENS[selectedToken]

          // Check if user has a token account
          const hasTokenAcc = await hasTokenAccount(connection, publicKey, tokenMint)
          setHasAccount(hasTokenAcc)

          // Get token balance if account exists
          if (hasTokenAcc) {
            const balance = await getTokenBalance(connection, publicKey, tokenMint)
            setTokenBalance(balance)
          } else {
            setTokenBalance(null)
          }
        } catch (error) {
          console.error("Error checking token account:", error)
        } finally {
          setLoading(false)
        }
      }

      checkTokenAccount()
    }
  }, [connected, publicKey, connection, selectedToken])

  // Get SOL balance
  const [solBalance, setSolBalance] = useState<number | null>(null)

  useEffect(() => {
    if (connected && publicKey && connection) {
      const getSolBalance = async () => {
        try {
          const balance = await connection.getBalance(publicKey)
          setSolBalance(balance / web3.LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Error getting SOL balance:", error)
        }
      }

      getSolBalance()
      const intervalId = setInterval(getSolBalance, 10000)

      return () => clearInterval(intervalId)
    }
  }, [connected, publicKey, connection])

  // Request SOL airdrop
  const requestAirdrop = async () => {
    if (!connected || !publicKey || !connection) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to request an airdrop",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      toast({
        title: "Requesting airdrop",
        description: "Requesting 1 SOL from testnet faucet...",
      })

      const signature = await connection.requestAirdrop(publicKey, web3.LAMPORTS_PER_SOL)
      await connection.confirmTransaction(signature, "confirmed")

      // Update SOL balance
      const balance = await connection.getBalance(publicKey)
      setSolBalance(balance / web3.LAMPORTS_PER_SOL)

      toast({
        title: "Airdrop successful",
        description: "1 SOL has been added to your wallet",
      })
    } catch (error) {
      console.error("Airdrop error:", error)
      toast({
        title: "Airdrop failed",
        description: error instanceof Error ? error.message : "Failed to request airdrop",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Testnet Token Tester</CardTitle>
        <CardDescription>Test with Solana testnet tokens</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="rounded-lg border p-4 text-center">
            <p className="mb-2 text-sm">Connect your wallet to test tokens</p>
            <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
          </div>
        ) : (
          <>
            {/* SOL Balance */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">SOL Balance</span>
                <span className="text-sm font-mono">{solBalance !== null ? solBalance.toFixed(6) : "—"} SOL</span>
              </div>

              <Button variant="outline" size="sm" className="w-full" onClick={requestAirdrop} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Requesting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Request 1 SOL Airdrop
                  </>
                )}
              </Button>
            </div>

            {/* Token Selection */}
            <div className="space-y-2">
              <Label htmlFor="token-select">Select Token</Label>
              <Select
                value={selectedToken}
                onValueChange={(value) => setSelectedToken(value as keyof typeof TESTNET_TOKENS)}
              >
                <SelectTrigger id="token-select">
                  <SelectValue placeholder="Select a token" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC (Testnet)</SelectItem>
                  <SelectItem value="BONK">BONK (Testnet)</SelectItem>
                  <SelectItem value="JUP">JUP (Testnet)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Token Info */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{selectedToken} Balance</span>
                <span className="text-sm font-mono">
                  {hasAccount ? (tokenBalance !== null ? tokenBalance.toString() : "Loading...") : "No account"}
                </span>
              </div>

              <div className="text-xs text-muted-foreground mb-3">
                {hasAccount
                  ? `You have a ${selectedToken} token account`
                  : `You don't have a ${selectedToken} token account yet`}
              </div>

              <a
                href={getTokenFaucetUrl(TESTNET_TOKENS[selectedToken])}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full"
              >
                <Button variant="outline" size="sm" className="w-full">
                  Get {selectedToken} Testnet Tokens
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>

            {/* Instructions */}
            <Alert>
              <AlertTitle>Testnet Tokens</AlertTitle>
              <AlertDescription>
                <p className="text-sm mb-2">
                  These are testnet tokens for development purposes only. They have no real value.
                </p>
                <p className="text-sm">You need SOL to pay for transaction fees when using tokens.</p>
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-xs text-muted-foreground">
          Network: {network.charAt(0).toUpperCase() + network.slice(1)}
        </div>
      </CardFooter>
    </Card>
  )
}
