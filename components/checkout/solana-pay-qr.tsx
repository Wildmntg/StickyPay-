"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Copy, Download, Share2, QrCode } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SolanaPayQRProps {
  receiverAddress: string
  label?: string
  message?: string
  amount?: string
  reference?: string
  memo?: string
}

export function SolanaPayQR({
  receiverAddress,
  label = "StickyPay",
  message = "Payment to merchant",
  amount,
  reference,
  memo,
}: SolanaPayQRProps) {
  const { toast } = useToast()
  const [qrValue, setQrValue] = useState("")
  const [qrSize, setQrSize] = useState(250)
  const [showQR, setShowQR] = useState(false)
  const [customAmount, setCustomAmount] = useState(amount || "")

  // Generate Solana Pay URL
  useEffect(() => {
    if (!receiverAddress) return

    // Create Solana Pay URL
    // Format: solana:<recipient>?amount=<amount>&reference=<reference>&label=<label>&message=<message>&memo=<memo>
    let url = `solana:${receiverAddress}`

    const params = new URLSearchParams()

    if (customAmount) {
      params.append("amount", customAmount)
    }

    if (reference) {
      params.append("reference", reference)
    }

    if (label) {
      params.append("label", label)
    }

    if (message) {
      params.append("message", message)
    }

    if (memo) {
      params.append("memo", memo)
    }

    // Add SPL token info if needed
    // params.append("spl-token", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") // USDC on mainnet

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    setQrValue(url)
  }, [receiverAddress, customAmount, reference, label, message, memo])

  const generateQR = () => {
    setShowQR(true)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue)
    toast({
      title: "Link copied",
      description: "Solana Pay link has been copied to clipboard",
    })
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Solana Pay - ${label}`,
          text: message,
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
  }

  const handleDownloadQR = () => {
    const canvas = document.getElementById("solana-pay-qr-code") as HTMLCanvasElement
    if (!canvas) return

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
    const downloadLink = document.createElement("a")
    downloadLink.href = pngUrl
    downloadLink.download = `solana-pay-${receiverAddress.substring(0, 8)}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Solana Pay QR Code</CardTitle>
          <CardDescription>Generate a QR code for your wallet address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wallet">Receiver Wallet</Label>
            <Input id="wallet" value={receiverAddress} readOnly className="font-mono text-xs" />
            <p className="text-xs text-muted-foreground">Wallet address for receiving payments</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (Optional)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave empty for the payer to specify the amount</p>
          </div>

          <Button className="w-full mt-4" onClick={generateQR}>
            <QrCode className="mr-2 h-4 w-4" />
            Generate Solana Pay QR
          </Button>

          {showQR && qrValue && (
            <div className="flex flex-col items-center justify-center space-y-4 pt-4">
              <div className="rounded-lg border bg-white p-4">
                <QRCodeCanvas
                  id="solana-pay-qr-code"
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
                <p className="text-sm font-medium">Solana Pay QR Code</p>
                <p className="text-xs text-muted-foreground">Scan with a Solana Pay compatible wallet</p>
                {customAmount && <p className="text-xs font-medium mt-1">Amount: {customAmount} SOL</p>}
              </div>
            </div>
          )}
        </CardContent>
        {showQR && qrValue && (
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
    </div>
  )
}
