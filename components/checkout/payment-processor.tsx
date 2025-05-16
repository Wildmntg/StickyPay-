"use client"

import { useState, useEffect, useRef } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink, Check, Copy, AlertCircle } from "lucide-react"
import * as web3 from "@solana/web3.js"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PaymentProcessorProps {
  paymentData: any
  onSuccess: (transactionId: string) => void
  onError: (error: string) => void
}

export function PaymentProcessor({ paymentData, onSuccess, onError }: PaymentProcessorProps) {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState(paymentData?.amount || "0.01") // Smaller default amount for easier testing
  const [memo, setMemo] = useState(paymentData?.memo || "Payment via StickyPay")
  const [recipient, setRecipient] = useState("")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [connection, setConnection] = useState<web3.Connection | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const debugRef = useRef<string[]>([])

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"
  const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.testnet.solana.com"

  // Add debug logging function
  const addDebugLog = (message: string) => {
    console.log(`[DEBUG] ${message}`)
    debugRef.current = [...debugRef.current, message]
    setDebugInfo([...debugRef.current])
  }

  // Explorer URL based on network
  const getExplorerUrl = (signature: string) => {
    const baseUrl =
      network === "mainnet-beta" ? "https://explorer.solana.com" : `https://explorer.solana.com/?cluster=${network}`
    return `${baseUrl}/tx/${signature}`
  }

  // Initialize connection
  useEffect(() => {
    try {
      // Use commitment level "confirmed" for better transaction confirmation
      const conn = new web3.Connection(rpcEndpoint, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000, // 60 seconds timeout
      })
      setConnection(conn)
      addDebugLog(`Connected to Solana RPC: ${rpcEndpoint}`)
    } catch (error) {
      console.error("Failed to connect to Solana RPC:", error)
      addDebugLog(`Failed to connect to Solana RPC: ${error instanceof Error ? error.message : String(error)}`)
      setErrorMessage(`Failed to connect to Solana network: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [rpcEndpoint])

  // Update wallet balance
  const updateWalletBalance = async () => {
    if (connected && publicKey && connection) {
      try {
        const balance = await connection.getBalance(publicKey)
        setWalletBalance(balance / web3.LAMPORTS_PER_SOL)
        addDebugLog(`Wallet balance updated: ${balance / web3.LAMPORTS_PER_SOL} SOL`)
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
      const intervalId = setInterval(updateWalletBalance, 5000) // Refresh every 5 seconds

      return () => clearInterval(intervalId)
    }
  }, [connected, publicKey, connection])

  useEffect(() => {
    // Set recipient based on payment data format
    if (paymentData?.merchantAddress) {
      setRecipient(paymentData.merchantAddress)
      addDebugLog(`Set recipient from merchantAddress: ${paymentData.merchantAddress}`)
    } else if (paymentData?.recipient) {
      setRecipient(paymentData.recipient)
      addDebugLog(`Set recipient from recipient field: ${paymentData.recipient}`)
    } else {
      // Default test recipient if none provided - using a known working testnet wallet
      setRecipient("3NRCPphqcyVmJviPyTzPBvwamLwUW5WN5sgJLifW2Q7q")
      addDebugLog("Set default test recipient: 3NRCPphqcyVmJviPyTzPBvwamLwUW5WN5sgJLifW2Q7q")
    }

    // Set amount if provided
    if (paymentData?.amount) {
      setAmount(paymentData.amount)
      addDebugLog(`Set amount: ${paymentData.amount}`)
    }

    // Set memo if provided
    if (paymentData?.memo || paymentData?.message) {
      setMemo(paymentData.memo || paymentData.message)
      addDebugLog(`Set memo: ${paymentData.memo || paymentData.message}`)
    }
  }, [paymentData])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Transaction signature copied to clipboard",
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

  const handlePayment = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a payment",
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
      setPaymentStatus("processing")
      setErrorMessage(null)
      debugRef.current = [] // Reset debug logs
      setDebugInfo([])

      addDebugLog("Starting payment process...")
      addDebugLog(`From: ${publicKey.toString()}`)
      addDebugLog(`To: ${recipient}`)
      addDebugLog(`Amount: ${amount} SOL`)
      addDebugLog(`Network: ${network}`)
      addDebugLog(`RPC Endpoint: ${rpcEndpoint}`)

      // Check sender balance first
      const balance = await connection.getBalance(publicKey)
      addDebugLog(`Current wallet balance: ${balance / web3.LAMPORTS_PER_SOL} SOL`)

      // Parse recipient address
      const recipientPubkey = new web3.PublicKey(recipient)

      // Calculate lamports - ensure we're using a valid number
      const parsedAmount = Number.parseFloat(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error(`Invalid amount: ${amount}`)
      }

      const lamports = Math.floor(web3.LAMPORTS_PER_SOL * parsedAmount)
      addDebugLog(`Lamports to send: ${lamports}`)

      // Calculate transaction fee (estimate)
      const feeCalculator = await connection.getRecentBlockhash()
      const estimatedFee = feeCalculator.feeCalculator.lamportsPerSignature
      addDebugLog(`Estimated transaction fee: ${estimatedFee} lamports`)

      // Check if wallet has enough balance (including fee)
      const totalRequired = lamports + estimatedFee
      addDebugLog(`Total required (amount + fee): ${totalRequired} lamports`)

      if (balance < totalRequired) {
        throw new Error(
          `Insufficient balance. You have ${balance / web3.LAMPORTS_PER_SOL} SOL but need ${
            totalRequired / web3.LAMPORTS_PER_SOL
          } SOL (including fees)`,
        )
      }

      // Create transaction
      const transaction = new web3.Transaction()

      // Get recent blockhash first
      addDebugLog("Getting recent blockhash...")
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed")
      addDebugLog(`Blockhash: ${blockhash}, Last valid block height: ${lastValidBlockHeight}`)

      // Set recent blockhash and fee payer
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Add transfer instruction
      addDebugLog("Adding transfer instruction...")
      transaction.add(
        web3.SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports: lamports,
        }),
      )

      // Add memo if provided
      if (memo) {
        addDebugLog(`Adding memo: ${memo}`)
        transaction.add(
          new web3.TransactionInstruction({
            keys: [],
            programId: new web3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: Buffer.from(memo, "utf8"),
          }),
        )
      }

      // Add reference if provided (for Solana Pay)
      if (paymentData?.reference) {
        try {
          const reference = new web3.PublicKey(paymentData.reference)
          addDebugLog(`Adding reference: ${reference.toString()}`)
          transaction.add(
            new web3.TransactionInstruction({
              keys: [
                {
                  pubkey: reference,
                  isSigner: false,
                  isWritable: false,
                },
              ],
              programId: new web3.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
              data: Buffer.from([]),
            }),
          )
        } catch (e) {
          addDebugLog(`Invalid reference: ${e instanceof Error ? e.message : String(e)}`)
        }
      }

      // Serialize the transaction to verify it's valid
      try {
        const serializedTransaction = transaction.serialize({ verifySignatures: false })
        addDebugLog(`Transaction serialized successfully, size: ${serializedTransaction.length} bytes`)
      } catch (e) {
        addDebugLog(`Transaction serialization error: ${e instanceof Error ? e.message : String(e)}`)
        throw new Error(`Failed to serialize transaction: ${e instanceof Error ? e.message : String(e)}`)
      }

      addDebugLog("Sending transaction...")

      // Send transaction with explicit options
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false, // Enable preflight checks
        preflightCommitment: "confirmed",
        maxRetries: 5,
      })

      addDebugLog(`Transaction sent! Signature: ${signature}`)
      setTxSignature(signature)

      addDebugLog("Waiting for confirmation...")
      // Wait for confirmation with explicit parameters
      const confirmationStrategy = {
        signature,
        blockhash,
        lastValidBlockHeight,
      }

      // Use a more reliable confirmation method
      const status = await connection.confirmTransaction(confirmationStrategy, "confirmed")

      if (status.value.err) {
        throw new Error(`Transaction failed to confirm: ${JSON.stringify(status.value.err)}`)
      }

      // Verify the transaction was successful by checking recipient balance
      try {
        const newRecipientBalance = await connection.getBalance(recipientPubkey)
        addDebugLog(`Recipient new balance: ${newRecipientBalance / web3.LAMPORTS_PER_SOL} SOL`)
      } catch (e) {
        addDebugLog(`Failed to check recipient balance: ${e instanceof Error ? e.message : String(e)}`)
      }

      // Update sender balance
      await updateWalletBalance()

      addDebugLog("Transaction confirmed!")
      // Payment successful
      setPaymentStatus("success")
      toast({
        title: "Payment sent",
        description: "Your payment has been sent successfully",
      })

      onSuccess(signature)
    } catch (error) {
      console.error("Payment error:", error)
      addDebugLog(`Payment error: ${error instanceof Error ? error.message : String(error)}`)
      setPaymentStatus("error")
      const errorMsg = error instanceof Error ? error.message : String(error)
      setErrorMessage(errorMsg)
      toast({
        title: "Payment failed",
        description: errorMsg,
        variant: "destructive",
      })
      onError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (paymentStatus === "success" && txSignature) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your payment of {amount} SOL has been sent successfully</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Transaction ID</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(txSignature)}>
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy transaction ID</span>
              </Button>
            </div>
            <p className="break-all text-xs text-muted-foreground">{txSignature}</p>
          </div>

          <div className="flex flex-col space-y-2">
            <a
              href={getExplorerUrl(txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center"
            >
              <Button variant="outline" className="w-full">
                View on Solana Explorer
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>

            <Button onClick={() => onSuccess(txSignature)}>Continue</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Make Payment</CardTitle>
        <CardDescription>
          {paymentData?.label || paymentData?.merchantName
            ? `Payment to ${paymentData.label || paymentData.merchantName}`
            : "Send SOL to the recipient"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

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

        <div className="space-y-2">
          <Label htmlFor="memo">Memo (Optional)</Label>
          <Input
            id="memo"
            placeholder="Add a note to this payment"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={loading}
          />
        </div>

        {!connected ? (
          <div className="rounded-lg border p-4 text-center">
            <p className="mb-2 text-sm">Connect your wallet to make a payment</p>
            <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
          </div>
        ) : (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">From</span>
              <span className="text-sm">
                {publicKey
                  ? `${publicKey.toString().substring(0, 4)}...${publicKey
                      .toString()
                      .substring(publicKey.toString().length - 4)}`
                  : "Not connected"}
              </span>
            </div>
          </div>
        )}

        {/* Debug information (collapsible) */}
        <details className="rounded-lg border p-2" open>
          <summary className="cursor-pointer text-sm font-medium">Debug Information</summary>
          <div className="mt-2 max-h-40 overflow-auto rounded bg-gray-100 p-2 text-xs font-mono dark:bg-gray-800">
            {debugInfo.length > 0 ? (
              debugInfo.map((log, index) => (
                <div key={index} className="py-1">
                  {log}
                </div>
              ))
            ) : (
              <div className="py-1 text-muted-foreground">No debug information available yet.</div>
            )}
          </div>
        </details>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button className="w-full" onClick={handlePayment} disabled={loading || !connected}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${amount ? `${amount} SOL` : ""}`
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
