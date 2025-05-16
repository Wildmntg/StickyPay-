"use client"

import { useState, useEffect } from "react"
import { QRCodeScanner } from "@/components/checkout/qr-code-scanner"
import { PaymentProcessor } from "@/components/checkout/payment-processor"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@solana/wallet-adapter-react"
import { QRCodeGenerator } from "@/components/checkout/qr-code-generator"
import { TokenIcon } from "@/components/ui/token-icon"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export default function UserDashboardPage() {
  const { toast } = useToast()
  const { connected, publicKey, connection } = useWallet()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("wallet")
  const [balance, setBalance] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch wallet balance
  useEffect(() => {
    if (connected && publicKey && connection) {
      const fetchBalance = async () => {
        try {
          setIsLoading(true)
          const bal = await connection.getBalance(publicKey)
          setBalance(bal / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Failed to fetch balance:", error)
          toast({
            title: "Error",
            description: "Failed to fetch wallet balance",
            variant: "destructive",
          })
        } finally {
          setIsLoading(false)
        }
      }

      fetchBalance()
      // Set up interval to refresh balance
      const intervalId = setInterval(fetchBalance, 15000) // Refresh every 15 seconds
      return () => clearInterval(intervalId)
    } else {
      setBalance(null)
    }
  }, [connected, publicKey, connection, toast])

  // Handle QR code scan
  const handleScan = (data: any) => {
    try {
      // If data is a string, try to parse it as JSON
      if (typeof data === "string") {
        try {
          const parsedData = JSON.parse(data)
          setPaymentData(parsedData)
        } catch (e) {
          // If it's not valid JSON, check if it's a URL with data parameter
          if (data.includes("/pay?data=")) {
            const url = new URL(data)
            const dataParam = url.searchParams.get("data")
            if (dataParam) {
              const decodedData = decodeURIComponent(dataParam)
              const parsedData = JSON.parse(decodedData)
              setPaymentData(parsedData)
            } else {
              throw new Error("Invalid QR code data")
            }
          } else if (data.startsWith("solana:")) {
            // Handle Solana Pay URL format
            const [prefix, queryString] = data.split("?")
            const recipient = prefix.replace("solana:", "")

            // Parse query parameters
            const params = new URLSearchParams(queryString || "")
            const amount = params.get("amount")
            const reference = params.get("reference")
            const label = params.get("label")
            const message = params.get("message")
            const memo = params.get("memo")
            const splToken = params.get("spl-token")

            const parsedData = {
              recipient,
              amount: amount || "0.1",
              reference,
              label: label || "Payment",
              message: message || "Solana Pay Transaction",
              memo,
              splToken,
              timestamp: Date.now(),
            }

            setPaymentData(parsedData)
          } else {
            throw new Error("Invalid QR code data")
          }
        }
      } else {
        // If data is already an object, use it directly
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
    setTxId(transactionId)
    setPaymentComplete(true)
    toast({
      title: "Payment Successful",
      description: "Your payment has been processed successfully",
    })
  }

  // Handle payment error
  const handlePaymentError = (error: string) => {
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
    setActiveTab("wallet")
  }

  // Mock transaction data
  const recentTransactions = [
    { id: 1, type: "send", amount: "0.5", token: "SOL", date: "Today, 2:30 PM", recipient: "Merchant A" },
    { id: 2, type: "receive", amount: "10", token: "USDC", date: "Yesterday, 10:15 AM", sender: "Friend B" },
    { id: 3, type: "send", amount: "25", token: "USDT", date: "May 10, 9:45 AM", recipient: "Store C" },
  ]

  // Render wallet not connected state
  if (!connected) {
    return (
      <div className="container mx-auto flex flex-col items-center justify-center py-10 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
            <CardDescription>Connect your wallet to start using StickyPay</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="wallet-adapter-button-wrapper">
              <WalletMultiButton className="wallet-adapter-button-custom" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render payment flow
  if (paymentData) {
    if (paymentComplete) {
      return (
        <div className="container mx-auto flex flex-col items-center justify-center py-6 px-4">
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
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium">Transaction ID:</p>
                  <p className="mt-1 break-all text-xs">{txId}</p>
                </div>
              )}

              <Button onClick={resetPayment} className="w-full">
                <Wallet className="mr-2 h-4 w-4" />
                Return to Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="container mx-auto flex flex-col items-center justify-center py-6 px-4">
        <PaymentProcessor paymentData={paymentData} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
        <Button variant="outline" onClick={resetPayment} className="mt-4">
          Cancel
        </Button>
      </div>
    )
  }

  // Render main wallet UI with custom tabs implementation to avoid Radix UI issues
  return (
    <div className="container mx-auto flex flex-col py-4 px-4 max-w-md">
      <div className="w-full">
        <div className="grid w-full grid-cols-3 gap-1 rounded-lg bg-muted p-1 mb-4">
          <button
            onClick={() => setActiveTab("wallet")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === "wallet" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            Wallet
          </button>
          <button
            onClick={() => setActiveTab("scan")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === "scan" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            Scan
          </button>
          <button
            onClick={() => setActiveTab("receive")}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === "receive" ? "bg-background shadow" : "text-muted-foreground"
            }`}
          >
            Receive
          </button>
        </div>

        {activeTab === "wallet" && (
          <div className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Your Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                    <div className="flex items-center space-x-3">
                      <TokenIcon symbol="SOL" size={36} />
                      <div>
                        <p className="font-medium">SOL</p>
                        <p className="text-xs text-muted-foreground">Solana</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">
                        {isLoading ? "..." : balance !== null ? balance.toFixed(4) : "0.0000"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ≈ ${isLoading ? "..." : balance !== null ? (balance * 150).toFixed(2) : "0.00"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => setActiveTab("scan")}
                      className="flex flex-col items-center py-6"
                      variant="outline"
                    >
                      <ArrowUpRight className="h-5 w-5 mb-1" />
                      <span className="text-xs">Send</span>
                    </Button>
                    <Button
                      onClick={() => setActiveTab("receive")}
                      className="flex flex-col items-center py-6"
                      variant="outline"
                    >
                      <ArrowDownLeft className="h-5 w-5 mb-1" />
                      <span className="text-xs">Receive</span>
                    </Button>
                    <Button className="flex flex-col items-center py-6" variant="outline">
                      <Plus className="h-5 w-5 mb-1" />
                      <span className="text-xs">Buy</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`rounded-full p-2 ${tx.type === "send" ? "bg-red-100" : "bg-green-100"}`}>
                            {tx.type === "send" ? (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            ) : (
                              <ArrowDownLeft className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{tx.type === "send" ? "Sent to" : "Received from"}</p>
                            <p className="text-xs text-muted-foreground">
                              {tx.type === "send" ? tx.recipient : tx.sender}
                            </p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${tx.type === "send" ? "text-red-600" : "text-green-600"}`}>
                            {tx.type === "send" ? "-" : "+"}
                            {tx.amount} {tx.token}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No transactions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "scan" && (
          <div className="mt-4">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Scan to Pay</CardTitle>
                <CardDescription>Scan a QR code to make a payment</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px]">
                  <QRCodeScanner onScan={handleScan} autostart={true} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "receive" && (
          <div className="mt-4">
            <QRCodeGenerator merchantAddress={publicKey?.toString() || ""} merchantName="Your Name" includeSOL={true} />
          </div>
        )}
      </div>
    </div>
  )
}
