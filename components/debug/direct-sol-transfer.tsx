"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink, Copy } from "lucide-react"
import * as web3 from "@solana/web3.js"

export function DirectSolTransfer() {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("0.01")
  const [recipient, setRecipient] = useState("3NRCPphqcyVmJviPyTzPBvwamLwUW5WN5sgJLifW2Q7q")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [connection, setConnection] = useState<web3.Connection | null>(null)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"
  const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.testnet.solana.com"

  // Initialize connection
  useEffect(() => {
    try {
      const conn = new web3.Connection(rpcEndpoint, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000, // 60 seconds timeout
      })
      setConnection(conn)
      console.log("Connected to Solana RPC:", rpcEndpoint)
    } catch (error) {
      console.error("Failed to connect to Solana RPC:", error)
    }
  }, [rpcEndpoint])

  // Update wallet balance
  const updateWalletBalance = async () => {
    if (connected && publicKey && connection) {
      try {
        const balance = await connection.getBalance(publicKey)
        setWalletBalance(balance / web3.LAMPORTS_PER_SOL)
      } catch (error) {
        console.error("Failed to get wallet balance:", error)
      }
    }
  }

  // Check wallet balance when connected
  useEffect(() => {
    if (connected && publicKey && connection) {
      updateWalletBalance()

      // Set up interval to refresh balance
      const intervalId = setInterval(updateWalletBalance, 5000) // Refresh every 5 seconds

      return () => clearInterval(intervalId)
    }
  }, [connected, publicKey, connection])

  const validateRecipient = (address: string): boolean => {
    try {
      new web3.PublicKey(address)
      return true
    } catch (error) {
      return false
    }
  }

  const handleTransfer = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a transfer",
        variant: "destructive",
      })
      return
    }

    if (!recipient || !validateRecipient(recipient)) {
      toast({
        title: "Invalid recipient",
        description: "The recipient address is invalid",
        variant: "destructive",
      })
      return
    }

    if (!amount || isNaN(Number.parseFloat(amount)) || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      })
      return
    }

    if (!connection) {
      toast({
        title: "Connection error",
        description: "Failed to connect to Solana network",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      console.log("Starting direct SOL transfer...")
      console.log(`From: ${publicKey.toString()}`)
      console.log(`To: ${recipient}`)
      console.log(`Amount: ${amount} SOL`)

      // Check sender balance first
      const balance = await connection.getBalance(publicKey)
      console.log(`Current wallet balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`)

      // Parse recipient address
      const recipientPubkey = new web3.PublicKey(recipient)

      // Calculate lamports
      const parsedAmount = Number.parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error(`Invalid amount: ${amount}`)
      }

      const lamports = Math.floor(web3.LAMPORTS_PER_SOL * parsedAmount)
      console.log(`Lamports to send: ${lamports}`)

      // Check if wallet has enough balance
      if (balance < lamports) {
        throw new Error(
          `Insufficient balance. You have ${balance / web3.LAMPORTS_PER_SOL} SOL but trying to send ${parsedAmount} SOL`,
        )
      }

      // Create transaction
      const transaction = new web3.Transaction()

      // Get recent blockhash
      console.log("Getting recent blockhash...")
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed")
      console.log(`Blockhash: ${blockhash}, Last valid block height: ${lastValidBlockHeight}`)

      // Set recent blockhash and fee payer
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Add transfer instruction
      console.log("Adding transfer instruction...")
      transaction.add(
        web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: lamports,
        }),
      )

      console.log("Sending transaction...")
      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 5,
      })
      console.log("Transaction sent! Signature:", signature)
      setTxSignature(signature)

      console.log("Waiting for confirmation...")
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        "confirmed",
      )

      if (confirmation.value.err) {
        throw new Error(`Transaction failed to confirm: ${JSON.stringify(confirmation.value.err)}`)
      }

      console.log("Transaction confirmed!")

      // Update balance
      await updateWalletBalance()

      toast({
        title: "Transfer successful",
        description: "Your SOL has been sent successfully",
      })
    } catch (error) {
      console.error("Transfer error:", error)
      toast({
        title: "Transfer failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Explorer URL based on network
  const getExplorerUrl = (signature: string) => {
    const baseUrl =
      network === "mainnet-beta" ? "https://explorer.solana.com" : `https://explorer.solana.com/?cluster=${network}`
    return `${baseUrl}/tx/${signature}`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Direct SOL Transfer</CardTitle>
        <CardDescription>Send SOL directly without using the smart contract</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet balance display */}
        {connected && walletBalance !== null && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Your Balance:</span>
              <span className="text-sm font-mono">{walletBalance.toFixed(6)} SOL</span>
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

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (SOL)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={loading}
            step="0.001"
            min="0.001"
          />
        </div>

        {!connected ? (
          <div className="rounded-lg border p-4 text-center">
            <p className="mb-2 text-sm">Connect your wallet to make a transfer</p>
            <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
          </div>
        ) : null}

        {txSignature && (
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Transaction ID</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  navigator.clipboard.writeText(txSignature)
                  toast({
                    title: "Copied to clipboard",
                    description: "Transaction signature copied to clipboard",
                  })
                }}
              >
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
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleTransfer} disabled={loading || !connected}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Send ${amount ? `${amount} SOL` : ""}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
