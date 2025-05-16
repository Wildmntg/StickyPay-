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
import {
  useAnchorProgram,
  initializeMerchant,
  createPaymentSession,
  processPayment,
  getMerchantPDA,
} from "@/lib/anchor-client"

export function StickyPayTester() {
  const { publicKey, connected } = useWallet()
  const { toast } = useToast()
  const program = useAnchorProgram()
  const [loading, setLoading] = useState(false)
  const [merchantPDA, setMerchantPDA] = useState<web3.PublicKey | null>(null)
  const [paymentPDA, setPaymentPDA] = useState<web3.PublicKey | null>(null)
  const [reference, setReference] = useState<web3.PublicKey | null>(null)
  const [merchantName, setMerchantName] = useState("Test Merchant")
  const [amount, setAmount] = useState("0.01")
  const [memo, setMemo] = useState("Test payment via StickyPay")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [step, setStep] = useState<"init" | "create" | "process" | "complete">("init")
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"

  // Explorer URL based on network
  const getExplorerUrl = (signature: string) => {
    const baseUrl =
      network === "mainnet-beta" ? "https://explorer.solana.com" : `https://explorer.solana.com/?cluster=${network}`
    return `${baseUrl}/tx/${signature}`
  }

  // Check if merchant already exists
  useEffect(() => {
    const checkMerchant = async () => {
      if (!connected || !publicKey || !program) return

      try {
        const merchantPDA = await getMerchantPDA(publicKey)
        setMerchantPDA(merchantPDA)

        try {
          // Try to fetch the merchant account
          const merchantAccount = await program.account.merchant.fetch(merchantPDA)
          console.log("Merchant already exists:", merchantAccount)
          setStep("create") // Skip to create payment step
        } catch (error) {
          // Merchant doesn't exist yet
          console.log("Merchant doesn't exist yet")
          setStep("init")
        }
      } catch (error) {
        console.error("Error checking merchant:", error)
      }
    }

    checkMerchant()
  }, [connected, publicKey, program])

  const addDebugLog = (message: string) => {
    console.log(`[DEBUG] ${message}`)
    setDebugInfo((prev) => [...prev, message])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Text copied to clipboard",
    })
  }

  const handleInitializeMerchant = async () => {
    if (!connected || !publicKey || !program) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      addDebugLog("Initializing merchant...")

      const { merchantPDA, tx } = await initializeMerchant(
        program,
        publicKey,
        merchantName,
        100, // 1% fee
      )

      setMerchantPDA(merchantPDA)
      setTxSignature(tx)
      setStep("create")

      addDebugLog(`Merchant initialized with PDA: ${merchantPDA.toString()}`)
      addDebugLog(`Transaction signature: ${tx}`)

      toast({
        title: "Merchant initialized",
        description: "Your merchant account has been created",
      })
    } catch (error) {
      console.error("Error initializing merchant:", error)
      addDebugLog(`Error initializing merchant: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Initialization failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePayment = async () => {
    if (!connected || !publicKey || !program || !merchantPDA) {
      toast({
        title: "Not ready",
        description: "Please initialize merchant first",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      addDebugLog("Creating payment session...")

      // Convert amount from SOL to lamports
      const lamports = web3.LAMPORTS_PER_SOL * Number.parseFloat(amount)
      addDebugLog(`Amount: ${amount} SOL (${lamports} lamports)`)

      const { paymentPDA, reference, tx } = await createPaymentSession(
        program,
        merchantPDA,
        publicKey,
        lamports,
        memo,
        1, // 1 hour expiry
      )

      setPaymentPDA(paymentPDA)
      setReference(reference)
      setTxSignature(tx)
      setStep("process")

      addDebugLog(`Payment session created with PDA: ${paymentPDA.toString()}`)
      addDebugLog(`Reference: ${reference.toString()}`)
      addDebugLog(`Transaction signature: ${tx}`)

      toast({
        title: "Payment created",
        description: `Payment of ${amount} SOL has been created`,
      })
    } catch (error) {
      console.error("Error creating payment:", error)
      addDebugLog(`Error creating payment: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Payment creation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayment = async () => {
    if (!connected || !publicKey || !program || !merchantPDA || !paymentPDA) {
      toast({
        title: "Not ready",
        description: "Please create a payment first",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      addDebugLog("Processing payment...")

      const { tx } = await processPayment(
        program,
        merchantPDA,
        paymentPDA,
        publicKey,
        publicKey, // In this test, merchant and payer are the same
      )

      setTxSignature(tx)
      setStep("complete")

      addDebugLog(`Payment processed successfully`)
      addDebugLog(`Transaction signature: ${tx}`)

      toast({
        title: "Payment processed",
        description: `Payment of ${amount} SOL has been processed`,
      })
    } catch (error) {
      console.error("Error processing payment:", error)
      addDebugLog(`Error processing payment: ${error instanceof Error ? error.message : String(error)}`)

      toast({
        title: "Payment processing failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setPaymentPDA(null)
    setReference(null)
    setTxSignature(null)
    setStep("create") // Keep the merchant initialized
    setDebugInfo([])
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>StickyPay Smart Contract Test</CardTitle>
        <CardDescription>Test the StickyPay Anchor program</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="rounded-lg border p-4 text-center">
            <p className="mb-2 text-sm">Connect your wallet to test payments</p>
            <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
          </div>
        ) : (
          <>
            {step === "init" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm">
                    Step 1: Initialize a merchant account. This creates a PDA that will hold your merchant information.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchantName">Merchant Name</Label>
                  <Input
                    id="merchantName"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button className="w-full" onClick={handleInitializeMerchant} disabled={loading || !connected}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Initialize Merchant"
                  )}
                </Button>
              </div>
            )}

            {step === "create" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm">
                    Step 2: Create a payment session. This creates a PDA that will hold the payment information.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (SOL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    step="0.001"
                    min="0.001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memo">Memo</Label>
                  <Input
                    id="memo"
                    placeholder="Payment memo"
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button className="w-full" onClick={handleCreatePayment} disabled={loading || !connected}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Payment Session"
                  )}
                </Button>
              </div>
            )}

            {step === "process" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm">
                    Step 3: Process the payment. This transfers SOL from your wallet to the merchant using the smart
                    contract.
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Payment PDA</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(paymentPDA!.toString())}
                    >
                      <Copy className="h-3 w-3" />
                      <span className="sr-only">Copy payment PDA</span>
                    </Button>
                  </div>
                  <p className="break-all text-xs text-muted-foreground">{paymentPDA?.toString()}</p>
                </div>

                <Button className="w-full" onClick={handleProcessPayment} disabled={loading || !connected}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${amount} SOL via Smart Contract`
                  )}
                </Button>
              </div>
            )}

            {step === "complete" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Payment Complete!</p>
                  <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                    Your payment of {amount} SOL has been processed successfully through the StickyPay smart contract.
                  </p>
                </div>

                {txSignature && (
                  <div className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Transaction ID</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(txSignature)}
                      >
                        <Copy className="h-3 w-3" />
                        <span className="sr-only">Copy transaction ID</span>
                      </Button>
                    </div>
                    <p className="break-all text-xs text-muted-foreground">{txSignature}</p>
                    <a
                      href={getExplorerUrl(txSignature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
                    >
                      View on Solana Explorer
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </div>
                )}

                <Button className="w-full" onClick={reset}>
                  Create Another Payment
                </Button>
              </div>
            )}
          </>
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
      </CardContent>
      {txSignature && step !== "complete" && (
        <CardFooter className="flex flex-col items-start">
          <p className="text-xs font-medium">Last Transaction:</p>
          <a
            href={getExplorerUrl(txSignature)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center text-xs text-primary hover:underline"
          >
            {txSignature.slice(0, 20)}...{txSignature.slice(-4)}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </CardFooter>
      )}
    </Card>
  )
}
