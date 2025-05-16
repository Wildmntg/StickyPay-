"use client"

import { useState } from "react"
import { QRCodeScanner } from "./qr-code-scanner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { ArrowRight } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

interface SolanaPayScannerProps {
  onScanComplete: (data: any) => void
  onError: (error: string) => void
}

export function SolanaPayScanner({ onScanComplete, onError }: SolanaPayScannerProps) {
  const { toast } = useToast()
  const { connected } = useWallet()
  const [scannedData, setScannedData] = useState<any>(null)
  const [parsedData, setParsedData] = useState<any>(null)

  // Handle QR code scan
  const handleScan = (data: any) => {
    try {
      if (!data) return

      setScannedData(data)

      // Parse Solana Pay URL
      // Format: solana:<recipient>?amount=<amount>&reference=<reference>&label=<label>&message=<message>&memo=<memo>
      if (typeof data === "string" && data.startsWith("solana:")) {
        // Extract recipient address
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

        const parsedPayment = {
          recipient,
          amount: amount || "",
          reference,
          label: label || "Payment",
          message: message || "Solana Pay Transaction",
          memo,
          splToken,
          timestamp: Date.now(),
        }

        setParsedData(parsedPayment)
        onScanComplete(parsedPayment)
      } else {
        throw new Error("Invalid Solana Pay QR code")
      }
    } catch (error) {
      console.error("Error processing scan data:", error)
      onError("Invalid Solana Pay QR code")
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not a valid Solana Pay code",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full">
      {!parsedData ? (
        <div className="relative">
          <QRCodeScanner onScan={handleScan} autostart={true} />

          {/* Overlay for camera instructions */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end p-4">
            <div className="w-full rounded-lg bg-background/80 p-2 text-center backdrop-blur-sm">
              <p className="text-xs text-muted-foreground">Position the QR code within the frame to scan</p>
            </div>
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Review the payment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm font-medium">Recipient:</div>
                <div className="text-right truncate text-xs">
                  {parsedData.recipient.substring(0, 4)}...
                  {parsedData.recipient.substring(parsedData.recipient.length - 4)}
                </div>

                {parsedData.amount && (
                  <>
                    <div className="text-sm font-medium">Amount:</div>
                    <div className="text-right">
                      {parsedData.amount} {parsedData.splToken ? "Tokens" : "SOL"}
                    </div>
                  </>
                )}

                {parsedData.label && (
                  <>
                    <div className="text-sm font-medium">Label:</div>
                    <div className="text-right">{parsedData.label}</div>
                  </>
                )}

                {parsedData.message && (
                  <>
                    <div className="text-sm font-medium">Message:</div>
                    <div className="text-right">{parsedData.message}</div>
                  </>
                )}
              </div>
            </div>

            {!connected ? (
              <div className="text-center">
                <p className="mb-2 text-sm">Connect your wallet to continue</p>
                <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
              </div>
            ) : (
              <Button className="w-full" onClick={() => onScanComplete(parsedData)}>
                Continue to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
