"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink, Copy, RefreshCw } from "lucide-react"
import * as web3 from "@solana/web3.js"
import { useSimpleAnchorProgram, sendSol, sendSplTokens, TESTNET_TOKENS } from "@/lib/simple-anchor-client"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SimplePaymentTester() {
  const { publicKey, connected } = useWallet()
  const { toast } = useToast()
  const { program, connection } = useSimpleAnchorProgram()
  const [loading, setLoading] = useState(false)
  const [airdropLoading, setAirdropLoading] = useState(false)
  const [solAmount, setSolAmount] = useState("0.01")
  const [tokenAmount, setTokenAmount] = useState("1")
  const [recipient, setRecipient] = useState("3NRCPphqcyVmJviPyTzPBvwamLwUW5WN5sgJLifW2Q7q")
  const [selectedToken, setSelectedToken] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>({})
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"

  // Add debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[DEBUG] ${message}`)
    setDebugInfo((prev) => [...prev, message])
  }

  // Explorer URL based on network
  const getExplorerUrl = (signature: string) => {
    const baseUrl =
      network === "mainnet-beta" ? "https://explorer.solana.com" : `https://explorer.solana.com/?cluster=${network}`
    return `${baseUrl}/tx/${signature}`
  }

  // Update wallet balance
  const updateWalletBalance = async () => {
    if (connected && publicKey && connection) {
      try {
        const balance = await connection.getBalance(publicKey)
        setWalletBalance(balance / web3.LAMPORTS_PER_SOL)
        addDebugLog(`Wallet balance updated: ${balance / web3.LAMPORTS_PER_SOL} SOL`)

        // Update token balances
        const tokenBalancesObj: Record<string, number> = {}
        for (const [symbol, mint] of Object.entries(TESTNET_TOKENS)) {
          if (mint) {
            try {
              const tokenAccount = await getAssociatedTokenAddress(mint, publicKey, false)
              const balance = await connection
                .getTokenAccountBalance(tokenAccount)
                .catch(() => ({ value: { amount: "0" } }))
              tokenBalancesObj[symbol] = Number.parseInt(balance.value.amount) / Math.pow(10, 6) // Assuming 6 decimals
              addDebugLog(`${symbol} balance: ${tokenBalancesObj[symbol]}`)
            } catch (error) {
              console.log(`No ${symbol} account found`)
              tokenBalancesObj[symbol] = 0
            }
          }
        }
        setTokenBalances(tokenBalancesObj)
      } catch (error) {
        console.error("Failed to get wallet balance:", error)
        addDebugLog(`Failed to get wallet balance: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }

  // Check wallet balance when connected
  useEffect(() => {
    if (connected && publicKey && connection) {
      updateWalletBalance()

      // Set up interval to refresh balance
      const intervalId = setInterval(updateWalletBalance, 10000) // Refresh every 10 seconds

      return () => clearInterval(intervalId)
    }
  }, [connected, publicKey, connection])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text copied to clipboard",
    })
  }

  const validateRecipient = (address: string): boolean => {
    try {
      new web3.PublicKey(address)
      return true
    } catch (error) {
      return false
    }
  }

  // Request airdrop function
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
      setAirdropLoading(true)
      addDebugLog("Requesting airdrop...")

      toast({
        title: "Requesting airdrop",
        description: "Requesting 1 SOL from testnet faucet...",
      })

      // Request airdrop
      const signature = await connection.requestAirdrop(publicKey, web3.LAMPORTS_PER_SOL)
      addDebugLog(`Airdrop requested. Signature: ${signature}`)

      // Wait for confirmation
      addDebugLog("Waiting for airdrop confirmation...")
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()

      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      })

      addDebugLog("Airdrop confirmed!")

      // Update balance
      await updateWalletBalance()

      toast({
        title: "Airdrop successful",
        description: "1 SOL has been added to your wallet",
      })
    } catch (error) {
      console.error("Airdrop error:", error)
      addDebugLog(`Airdrop error: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Airdrop failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to request airdrop. Try using the Solana faucet website instead.",
        variant: "destructive",
      })
    } finally {
      setAirdropLoading(false)
    }
  }

  const handleSendSol = async () => {
    if (!connected || !publicKey || !program || !connection) {
      toast({
        title: "Not ready",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!recipient || !validateRecipient(recipient)) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a valid recipient address",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setDebugInfo([]) // Clear debug logs
      addDebugLog("Starting SOL transfer via smart contract...")

      // Convert amount from SOL to lamports
      const lamports = Math.floor(web3.LAMPORTS_PER_SOL * Number.parseFloat(solAmount))
      addDebugLog(`Amount: ${solAmount} SOL (${lamports} lamports)`)

      const recipientPubkey = new web3.PublicKey(recipient)

      // Send SOL
      const { tx } = await sendSol(program, publicKey, recipientPubkey, lamports)
      setTxSignature(tx)

      addDebugLog(`Transaction signature: ${tx}`)
      addDebugLog("Waiting for confirmation...")

      // Update balance
      await updateWalletBalance()

      toast({
        title: "Transfer successful",
        description: `${solAmount} SOL has been sent to the recipient`,
      })
    } catch (error) {
      console.error("Transfer error:", error)
      addDebugLog(`Transfer error: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Transfer failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSendTokens = async () => {
    if (!connected || !publicKey || !program || !connection) {
      toast({
        title: "Not ready",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!recipient || !validateRecipient(recipient)) {
      toast({
        title: "Invalid recipient",
        description: "Please enter a valid recipient address",
        variant: "destructive",
      })
      return
    }

    if (!selectedToken) {
      toast({
        title: "No token selected",
        description: "Please select a token to send",
        variant: "destructive",
      })
      return
    }

    const tokenMint = TESTNET_TOKENS[selectedToken as keyof typeof TESTNET_TOKENS]
    if (!tokenMint) {
      toast({
        title: "Invalid token",
        description: "The selected token is not supported",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      setDebugInfo([]) // Clear debug logs
      addDebugLog(`Starting ${selectedToken} transfer via smart contract...`)

      // Convert amount to token units (assuming 6 decimals for simplicity)
      const tokenUnits = Math.floor(Number.parseFloat(tokenAmount) * 1_000_000)
      addDebugLog(`Amount: ${tokenAmount} ${selectedToken} (${tokenUnits} units)`)

      const recipientPubkey = new web3.PublicKey(recipient)

      // Send tokens
      const { tx } = await sendSplTokens(program, connection, publicKey, recipientPubkey, tokenMint, tokenUnits)
      setTxSignature(tx)

      addDebugLog(`Transaction signature: ${tx}`)
      addDebugLog("Waiting for confirmation...")

      // Update balance
      await updateWalletBalance()

      toast({
        title: "Transfer successful",
        description: `${tokenAmount} ${selectedToken} has been sent to the recipient`,
      })
    } catch (error) {
      console.error("Transfer error:", error)
      addDebugLog(`Transfer error: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Transfer failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Simple Payment Tester</CardTitle>
        <CardDescription>Test the simplified payment smart contract</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="rounded-lg border p-4 text-center">
            <p className="mb-2 text-sm">Connect your wallet to test payments</p>
            <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
          </div>
        ) : (
          <>
            {/* Wallet balance display */}
            {connected && walletBalance !== null && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Your Balance:</span>
                  <span className="text-sm font-mono">{walletBalance.toFixed(6)} SOL</span>
                </div>
                {Object.entries(tokenBalances).map(([symbol, balance]) => (
                  <div key={symbol} className="flex justify-between items-center mt-1">
                    <span className="text-sm font-medium">{symbol}:</span>
                    <span className="text-sm font-mono">{balance.toFixed(6)}</span>
                  </div>
                ))}
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={updateWalletBalance}
                    disabled={loading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Balances
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <Tabs defaultValue="sol" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sol">Send SOL</TabsTrigger>
                <TabsTrigger value="token">Send Tokens</TabsTrigger>
              </TabsList>
              <TabsContent value="sol" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="solAmount">Amount (SOL)</Label>
                  <Input
                    id="solAmount"
                    type="number"
                    placeholder="0.01"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    disabled={loading}
                    step="0.001"
                    min="0.001"
                  />
                </div>

                <Button className="w-full" onClick={handleSendSol} disabled={loading || !connected}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Send ${solAmount} SOL via Smart Contract`
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="token" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenSelect">Select Token</Label>
                  <Select onValueChange={setSelectedToken} value={selectedToken || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TESTNET_TOKENS).map(
                        ([symbol, mint]) =>
                          symbol !== "SOL" && (
                            <SelectItem key={symbol} value={symbol}>
                              {symbol}
                            </SelectItem>
                          ),
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tokenAmount">Amount</Label>
                  <Input
                    id="tokenAmount"
                    type="number"
                    placeholder="1"
                    value={tokenAmount}
                    onChange={(e) => setTokenAmount(e.target.value)}
                    disabled={loading}
                    step="0.01"
                    min="0.01"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSendTokens}
                  disabled={loading || !connected || !selectedToken}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Send ${tokenAmount} ${selectedToken || "tokens"} via Smart Contract`
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Testnet airdrop button */}
            {network !== "mainnet-beta" && connected && publicKey && (
              <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950/30">
                <h3 className="text-sm font-medium mb-2">Need testnet SOL?</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  This is a testnet application. You need testnet SOL to test payments.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={requestAirdrop}
                  disabled={airdropLoading}
                >
                  {airdropLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Requesting Airdrop...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Request 1 SOL Airdrop
                    </>
                  )}
                </Button>
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  <a
                    href="https://faucet.solana.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary"
                  >
                    Or visit the Solana Faucet
                  </a>
                </div>
              </div>
            )}

            {txSignature && (
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Transaction ID</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(txSignature)}>
                    <Copy className="h-3 w-3" />
                    <span className="sr-only">Copy transaction ID</span>
                  </Button>
                </div>
                <p className="break-all text-xs text-muted-foreground">{txSignature}</p>
                <div className="mt-2">
                  <a
                    href={getExplorerUrl(txSignature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:underline flex items-center"
                  >
                    View on Solana Explorer
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Debug information */}
            {debugInfo.length > 0 && (
              <details className="rounded-lg border p-2">
                <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
                <div className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs font-mono dark:bg-gray-800">
                  {debugInfo.map((log, index) => (
                    <div key={index} className="py-1">
                      {log}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
