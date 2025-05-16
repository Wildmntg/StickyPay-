"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Download, Share2, RefreshCw } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface QRCodeGeneratorProps {
  merchantAddress?: string
  defaultAmount?: string
  merchantName?: string
  itemName?: string
  sessionId?: string
  onQRGenerated?: (qrValue: string, paymentData: any) => void
  testnetWallet?: string
  includeSOL?: boolean
}

export function QRCodeGenerator({
  merchantAddress,
  defaultAmount = "",
  merchantName = "",
  itemName = "",
  sessionId = "",
  onQRGenerated,
  testnetWallet,
  includeSOL = true, // Default to true to always include SOL
}: QRCodeGeneratorProps) {
  const { toast } = useToast()
  const [amount, setAmount] = useState(defaultAmount || "0.1")
  const [token, setToken] = useState("SOL") // Default to SOL
  const [reference, setReference] = useState("")
  const [qrValue, setQrValue] = useState("")
  const [qrSize, setQrSize] = useState(250)
  const [itemNameState, setItemName] = useState(itemName || "")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [showQR, setShowQR] = useState(false)
  const [qrError, setQrError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Use testnet wallet if provided, otherwise use merchantAddress
  const receiverWallet = testnetWallet || merchantAddress || ""

  // Generate a unique reference ID
  useEffect(() => {
    try {
      const generateReference = () => {
        const id = sessionId || `session_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
        setReference(id)
      }
      generateReference()
    } catch (error) {
      console.error("Error generating reference:", error)
      setReference(`fallback_${Date.now()}`)
    }
  }, [sessionId])

  // Generate QR code when component mounts
  useEffect(() => {
    if (receiverWallet) {
      try {
        generateQRCode()
      } catch (error) {
        console.error("Error auto-generating QR code:", error)
        setQrError("Failed to generate QR code automatically. Please try again.")
      }
    }
  }, [receiverWallet]) // Only run on mount or when wallet changes

  // Generate QR code value
  const generateQRCode = () => {
    try {
      setIsGenerating(true)
      setQrError(null)

      if (!receiverWallet) {
        toast({
          title: "Wallet Address Required",
          description: "A receiver wallet address is required to generate a QR code",
          variant: "destructive",
        })
        setIsGenerating(false)
        return
      }

      // Allow empty amount to generate QR code with 0
      const amountToUse = amount ? amount : "0"

      // Create payment data object
      const data = {
        merchantAddress: receiverWallet,
        amount: amountToUse,
        token,
        reference,
        merchantName: merchantName || "StickyPay User",
        itemName: itemNameState,
        timestamp: Date.now(),
      }

      setPaymentData(data)

      // For SOL, use Solana Pay URL format
      if (token === "SOL") {
        const params = new URLSearchParams()
        params.append("amount", amountToUse)
        params.append("reference", reference)
        params.append("label", merchantName || "StickyPay Payment")
        params.append("message", itemNameState || "Payment via StickyPay")

        const solanaPayUrl = `solana:${receiverWallet}?${params.toString()}`
        setQrValue(solanaPayUrl)
        console.log("Generated Solana Pay URL:", solanaPayUrl)
      } else {
        // For tokens, use JSON format
        const jsonData = JSON.stringify(data)
        const encodedData = encodeURIComponent(jsonData)
        const deepLink = `${window.location.origin}/pay?data=${encodedData}`
        setQrValue(deepLink)
        console.log("Generated deep link:", deepLink)
      }

      setShowQR(true)

      // Notify parent component that QR code has been generated
      if (onQRGenerated) {
        onQRGenerated(qrValue, data)
      }

      toast({
        title: "QR Code Generated",
        description: `Payment QR code for ${amountToUse} ${token} created successfully`,
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      setQrError("Failed to generate QR code. Please try again.")
      toast({
        title: "QR Code Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Update QR code when inputs change
  useEffect(() => {
    if (receiverWallet && (showQR || qrValue)) {
      generateQRCode()
    }
  }, [amount, token, itemNameState, receiverWallet])

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(qrValue)
      toast({
        title: "Link copied",
        description: "Payment link has been copied to clipboard",
      })
    } catch (error) {
      console.error("Error copying to clipboard:", error)
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Payment Request for ${amount || "0"} ${token}`,
            text: `Payment request from ${merchantName || "Merchant"}`,
            url: qrValue,
          })
          toast({
            title: "Shared successfully",
            description: "Payment link has been shared",
          })
        } catch (error) {
          console.error("Error sharing:", error)
          // Fallback to copy if sharing fails
          handleCopyLink()
        }
      } else {
        // Fallback for browsers that don't support sharing
        handleCopyLink()
      }
    } catch (error) {
      console.error("Error in share handler:", error)
      toast({
        title: "Share Failed",
        description: "Failed to share payment link",
        variant: "destructive",
      })
    }
  }

  const handleDownloadQR = () => {
    try {
      const canvas = document.getElementById("payment-qr-code") as HTMLCanvasElement
      if (!canvas) {
        throw new Error("QR code canvas not found")
      }

      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `stickypay-qr-${reference}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download QR code",
        variant: "destructive",
      })
    }
  }

  const regenerateReference = () => {
    try {
      const id = `session_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
      setReference(id)
      generateQRCode()
    } catch (error) {
      console.error("Error regenerating reference:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate reference",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Receive Payment</CardTitle>
        <CardDescription>Generate a QR code for others to scan and pay you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Select value={token} onValueChange={setToken}>
            <SelectTrigger id="token" className="w-full">
              <SelectValue placeholder="Select token">
                {token === "SOL" && (
                  <div className="flex items-center">
                    <div className="mr-2 h-5 w-5 rounded-full overflow-hidden">
                      <Image src="/tokens/sol.png" alt="SOL" width={20} height={20} />
                    </div>
                    SOL
                  </div>
                )}
                {token === "USDC" && (
                  <div className="flex items-center">
                    <div className="mr-2 h-5 w-5 rounded-full overflow-hidden">
                      <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} />
                    </div>
                    USDC
                  </div>
                )}
                {token === "USDT" && (
                  <div className="flex items-center">
                    <div className="mr-2 h-5 w-5 rounded-full overflow-hidden">
                      <Image src="/tokens/usdt.png" alt="USDT" width={20} height={20} />
                    </div>
                    USDT
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SOL">
                <div className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full overflow-hidden">
                    <Image src="/tokens/sol.png" alt="SOL" width={20} height={20} />
                  </div>
                  SOL
                </div>
              </SelectItem>
              <SelectItem value="USDC">
                <div className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full overflow-hidden">
                    <Image src="/tokens/usdc.png" alt="USDC" width={20} height={20} />
                  </div>
                  USDC
                </div>
              </SelectItem>
              <SelectItem value="USDT">
                <div className="flex items-center">
                  <div className="mr-2 h-5 w-5 rounded-full overflow-hidden">
                    <Image src="/tokens/usdt.png" alt="USDT" width={20} height={20} />
                  </div>
                  USDT
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="itemName">Description (Optional)</Label>
          <Input
            id="itemName"
            placeholder="Coffee, Lunch, etc."
            value={itemNameState}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="reference">Reference ID</Label>
          <Button variant="ghost" size="sm" onClick={regenerateReference} className="h-8 px-2">
            <RefreshCw className="h-3 w-3 mr-1" />
            Regenerate
          </Button>
        </div>
        <Input id="reference" value={reference} readOnly className="font-mono text-xs" />

        <Button onClick={generateQRCode} disabled={isGenerating || !receiverWallet} className="w-full">
          {isGenerating ? "Generating..." : "Generate QR Code"}
        </Button>

        {qrError && (
          <div className="rounded-lg bg-red-50 p-3 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <p className="text-sm">{qrError}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={generateQRCode}>
              Try Again
            </Button>
          </div>
        )}

        {showQR && qrValue && !qrError && (
          <div className="flex flex-col items-center justify-center space-y-4 pt-4">
            <div className="rounded-lg border bg-white p-4">
              <QRCodeCanvas
                id="payment-qr-code"
                value={qrValue}
                size={qrSize}
                level="H"
                includeMargin
                imageSettings={{
                  src: "/logo.png",
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {amount || "0"} {token}
              </p>
              <p className="text-xs text-muted-foreground">
                Scan this QR code with the StickyPay app to make a payment
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {showQR && qrValue && !qrError && (
        <CardFooter className="flex flex-wrap gap-2">
          <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button className="flex-1" onClick={handleDownloadQR}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
