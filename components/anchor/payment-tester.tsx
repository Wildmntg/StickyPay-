"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ExternalLink } from "lucide-react"
import * as web3 from "@solana/web3.js"
import { useAnchorProgram, initializeMerchant, createPayment, processPayment } from "@/lib/anchor-client"

export function AnchorPaymentTester() {
  const { publicKey, connected } = useWallet()
  const { toast } = useToast()
  const program = useAnchorProgram()
  const [loading, setLoading] = useState(false)
  const [merchantPDA, setMerchantPDA] = useState<web3.PublicKey | null>(null)
  const [paymentPDA, setPaymentPDA] = useState<web3.PublicKey | null>(null)
  const [amount, setAmount] = useState("0.1")
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const [step, setStep] = useState<"init" | "create" | "process" | "complete">("init")

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"

  // Explorer URL based on network
  const getExplorerUrl = (signature: string) => {
    const baseUrl =
      network === "mainnet-beta" ? "https://explorer.solana.com" : `https://explorer.solana.com/?cluster=${network}`
    return `${baseUrl}/tx/${signature}`
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
      const { merchantPDA, tx } = await initializeMerchant(program, publicKey)
      setMerchantPDA(merchantPDA)
      setTxSignature(tx)
      setStep("create")

      toast({
        title: "Merchant initialized",
        description: "Your merchant account has been created",
      })
    } catch (error) {
      console.error("Error initializing merchant:", error)
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
      // Generate a random reference
      const reference = web3.Keypair.generate().publicKey

      // Convert amount from SOL to lamports
      const lamports = web3.LAMPORTS_PER_SOL * Number.parseFloat(amount)

      const { paymentPDA, tx } = await createPayment(program, merchantPDA, publicKey, lamports, reference)

      setPaymentPDA(paymentPDA)
      setTxSignature(tx)
      setStep("process")

      toast({
        title: "Payment created",
        description: `Payment of ${amount} SOL has been created`,
      })
    } catch (error) {
      console.error("Error creating payment:", error)
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

      const { tx } = await processPayment(
        program,
        merchantPDA,
        paymentPDA,
        publicKey,
        publicKey, // In this test, merchant and payer are the same
      )

      setTxSignature(tx)
      setStep("complete")

      toast({
        title: "Payment processed",
        description: `Payment of ${amount} SOL has been processed`,
      })
    } catch (error) {
      console.error("Error processing payment:", error)
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
    setMerchantPDA(null)
    setPaymentPDA(null)
    setTxSignature(null)
    setStep("init")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Anchor Payment Test</CardTitle>
        <CardDescription>Test the Anchor payment program</CardDescription>
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
                    Step 2: Create a payment request. This creates a PDA that will hold the payment information.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (SOL)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <Button className="w-full" onClick={handleCreatePayment} disabled={loading || !connected}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Payment"
                  )}
                </Button>
              </div>
            )}

            {step === "process" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm">
                    Step 3: Process the payment. This transfers SOL from your wallet to the merchant.
                  </p>
                </div>
                <Button className="w-full" onClick={handleProcessPayment} disabled={loading || !connected}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ${amount} SOL`
                  )}
                </Button>
              </div>
            )}

            {step === "complete" && (
              <div className="space-y-4">
                <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Payment Complete!</p>
                  <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                    Your payment of {amount} SOL has been processed successfully.
                  </p>
                </div>

                {txSignature && (
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Transaction ID:</p>
                    <p className="mt-1 break-all text-xs text-muted-foreground">{txSignature}</p>
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
                  Start Over
                </Button>
              </div>
            )}
          </>
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
