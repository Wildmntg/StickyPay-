"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeSVG } from "qrcode.react"

interface SolanaPayQRProps {
  receiverAddress: string
  amount?: string
  label?: string
  message?: string
  memo?: string
  reference?: string
}

export function SolanaPayQR({
  receiverAddress,
  amount,
  label = "StickyPay Payment",
  message = "Payment via StickyPay",
  memo,
  reference,
}: SolanaPayQRProps) {
  const { toast } = useToast()
  const [paymentUrl, setPaymentUrl] = useState<string>("")
  const [qrRef, setQrRef] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    // Build Solana Pay URL
    let url = `solana:${receiverAddress}`

    // Add query parameters
    const params = new URLSearchParams()
    if (amount) params.append("amount", amount)
    if (label) params.append("label", label)
    if (message) params.append("message", message)
    if (memo) params.append("memo", memo)
    if (reference) params.append("reference", reference)

    const queryString = params.toString()
    if (queryString) {
      url += `?${queryString}`
    }

    setPaymentUrl(url)
  }, [receiverAddress, amount, label, message, memo, reference])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentUrl)
    toast({
      title: "Copied to clipboard",
      description: "Payment URL copied to clipboard",
    })
  }

  const downloadQR = () => {
    if (!qrRef) return

    const canvas = qrRef.querySelector("canvas")
    if (!canvas) return

    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = "stickypay-qr.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR Code Downloaded",
      description: "Your payment QR code has been downloaded",
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Payment QR Code</CardTitle>
        <CardDescription>Scan this QR code to make a payment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center" ref={setQrRef}>
          <div className="rounded-lg bg-white p-4">
            <QRCodeSVG value={paymentUrl} size={200} />
          </div>
        </div>

        <div className="rounded-lg border p-3">
          <p className="mb-1 text-sm font-medium">Recipient Address:</p>
          <p className="break-all text-xs text-muted-foreground">{receiverAddress}</p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" className="flex-1" onClick={copyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Button variant="outline" className="flex-1" onClick={downloadQR}>
            <Download className="mr-2 h-4 w-4" />
            Download QR
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
