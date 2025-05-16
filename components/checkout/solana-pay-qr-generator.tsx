"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QRCode from "qrcode.react"
import { useToast } from "@/components/ui/use-toast"
import { Copy } from "lucide-react"

export function SolanaPayQRGenerator() {
  const { toast } = useToast()
  const [recipient, setRecipient] = useState("3NRCPphqcyVmJviPyTzPBvwamLwUW5WN5sgJLifW2Q7q")
  const [amount, setAmount] = useState("0.1")
  const [label, setLabel] = useState("StickyPay")
  const [message, setMessage] = useState("Payment via StickyPay")
  const [reference, setReference] = useState("")
  const [memo, setMemo] = useState("")
  const [paymentUrl, setPaymentUrl] = useState("")

  const generateQR = () => {
    try {
      // Build Solana Pay URL
      let url = `solana:${recipient}`

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

      toast({
        title: "QR Code Generated",
        description: "Scan this QR code with the StickyPay app to make a payment",
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentUrl)
    toast({
      title: "Copied to clipboard",
      description: "Payment URL copied to clipboard",
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Generate Solana Pay QR</CardTitle>
        <CardDescription>Create a QR code for Solana Pay payments</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Solana address"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount (SOL)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            step="0.01"
            min="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Merchant name" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Payment description"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="memo">Memo (Optional)</Label>
          <Input id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="On-chain memo" />
        </div>

        <Button onClick={generateQR} className="w-full">
          Generate QR Code
        </Button>

        {paymentUrl && (
          <div className="mt-4 space-y-4">
            <div className="flex justify-center">
              <div className="rounded-lg bg-white p-4">
                <QRCode value={paymentUrl} size={200} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Input value={paymentUrl} readOnly className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
