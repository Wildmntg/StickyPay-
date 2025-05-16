"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { QRCodeScanner } from "@/components/checkout/qr-code-scanner"
import { PaymentProcessor } from "@/components/checkout/payment-processor"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, QrCode, ArrowLeft, ExternalLink } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@solana/wallet-adapter-react"

export default function PayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { connected, publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(true)
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"

  // Explorer URL based on network
  const getExplorerUrl = (signature: string) => {
    const baseUrl =
      network === "mainnet-beta" ? "https://explorer.solana.com" : `https://explorer.solana.com/?cluster=${network}`
    return `${baseUrl}/tx/${signature}`
  }

  // Check for payment data in URL
  useEffect(() => {
    const dataParam = searchParams.get("data")
    if (dataParam) {
      try {
        const decodedData = decodeURIComponent(dataParam)
        const parsedData = JSON.parse(decodedData)
        console.log("Payment data from URL:", parsedData)
        setPaymentData(parsedData)
      } catch (error) {
        console.error("Error parsing payment data:", error)
        toast({
          title: "Invalid Payment Data",
          description: "The payment data in the URL is invalid",
          variant: "destructive",
        })
      }
    }
    setIsLoading(false)
  }, [searchParams, toast])

  // Handle QR code scan
  const handleScan = (data: any) => {
    try {
      console.log("QR scan data received:", data)

      // If data is a string, try to parse it as JSON
      if (typeof data === "string") {
        try {
          const parsedData = JSON.parse(data)
          console.log("Parsed JSON data:", parsedData)
          setPaymentData(parsedData)
        } catch (e) {
          // If it's not valid JSON, check if it's a URL with data parameter
          if (data.includes("/pay?data=")) {
            const url = new URL(data)
            const dataParam = url.searchParams.get("data")
            if (dataParam) {
              const decodedData = decodeURIComponent(dataParam)
              const parsedData = JSON.parse(decodedData)
              console.log("Parsed URL data:", parsedData)
              setPaymentData(parsedData)
            } else {
              throw new Error("Invalid QR code data")
            }
          } else if (data.startsWith("solana:")) {
            // Handle Solana Pay URL format
            console.log("Detected Solana Pay URL:", data)
            const [prefix, queryString] = data.split("?")
            const recipient = prefix.replace("solana:", "")

            // Parse query parameters
            const params = new URLSearchParams(queryString || "")
            const amount = params.get("amount")
            const reference = params.get("reference")
            const label = params.get("label")
            const message = params.get("message")
            const memo = params.get("memo")

            const parsedData = {
              recipient,
              amount: amount || "0.1",
              reference,
              label: label || "Payment",
              message: message || "Solana Pay Transaction",
              memo,
              timestamp: Date.now(),
            }

            console.log("Parsed Solana Pay data:", parsedData)
            setPaymentData(parsedData)
          } else {
            throw new Error("Invalid QR code data")
          }
        }
      } else {
        // If data is already an object, use it directly
        console.log("Using data object directly:", data)
        setPaymentData(data)
      }
    } catch (error) {
      console.error("Error processing scan data:", error)
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not a valid payment code",
        variant: "destructive",
      })
    }
  }

  // Handle payment success
  const handlePaymentSuccess = (transactionId: string) => {
    console.log("Payment successful! Transaction ID:", transactionId)
    setTxId(transactionId)
    setPaymentComplete(true)
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully",
    })
  }

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error)
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive",
    })
  }

  // Reset payment flow
  const resetPayment = () => {
    setPaymentData(null)
    setPaymentComplete(false)
    setTxId(null)
  }

  // Handle back button
  const handleBack = () => {
    if (paymentComplete) {
      resetPayment()
    } else if (paymentData) {
      setPaymentData(null)
    } else {
      router.push("/")
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading payment data...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col overflow-auto py-8">
      <header className="mb-8 flex items-center justify-between px-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="p-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {connected && publicKey && (
          <div className="flex items-center text-sm">
            <span className="font-medium">
              {publicKey.toString().substring(0, 4)}...{publicKey.toString().substring(publicKey.toString().length - 4)}
            </span>
          </div>
        )}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-8">
        <h1 className="mb-6 text-center text-2xl font-bold">Payment</h1>

        {paymentComplete ? (
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Payment Complete!</CardTitle>
              <CardDescription>Your payment has been processed successfully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              {txId && (
                <>
                  <div className="rounded-md bg-muted p-3 text-sm">
                    <p className="font-medium">Transaction ID:</p>
                    <p className="mt-1 break-all text-xs">{txId}</p>
                  </div>

                  <a
                    href={getExplorerUrl(txId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center"
                  >
                    <Button variant="outline" className="w-full">
                      View on Solana Explorer
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </>
              )}

              <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button variant="outline" onClick={resetPayment} className="flex-1">
                  <QrCode className="mr-2 h-4 w-4" />
                  Scan Another Code
                </Button>
                <Link href="/" className="flex-1">
                  <Button className="w-full">Return Home</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : paymentData ? (
          <PaymentProcessor paymentData={paymentData} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
        ) : (
          <div className="h-[500px] w-full max-w-md overflow-hidden rounded-lg border">
            <QRCodeScanner onScan={handleScan} autostart={true} />
          </div>
        )}
      </main>
    </div>
  )
}
