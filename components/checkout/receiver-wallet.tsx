"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeSVG } from "qrcode.react"
import { Copy, Download } from "lucide-react"
import * as web3 from "@solana/web3.js"

export function ReceiverWallet() {
  const { publicKey, connected } = useWallet()
  const { toast } = useToast()
  const [amount, setAmount] = useState("0.01")
  const [memo, setMemo] = useState("Payment via StickyPay")
  const [solanaPayUrl, setSolanaPayUrl] = useState("")
  const [connection, setConnection] = useState<web3.Connection | null>(null)
  const [balance, setBalance] = useState<number | null>(null)

  // Get Solana network from env
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"
  const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.testnet.solana.com"

  // Initialize connection
  useEffect(() => {
    try {
      const conn = new web3.Connection(rpcEndpoint, "confirmed")
      setConnection(conn)
      console.log("Connected to Solana RPC:", rpcEndpoint)
    } catch (error) {
      console.error("Failed to connect to Solana RPC:", error)
    }
  }, [rpcEndpoint])

  // Get wallet balance
  useEffect(() => {
    if (connected && publicKey && connection) {
      const fetchBalance = async () => {
        try {
          const bal = await connection.getBalance(publicKey)
          setBalance(bal / web3.LAMPORTS_PER_SOL)
        } catch (error) {
          console.error("Failed to fetch balance:", error)
        }
      }

      fetchBalance()

      // Set up interval to refresh balance
      const intervalId = setInterval(fetchBalance, 10000) // Refresh every 10 seconds

      return () => clearInterval(intervalId)
    }
  }, [connected, publicKey, connection])

  // Generate Solana Pay URL when wallet is connected or inputs change
  useEffect(() => {
    if (connected && publicKey) {
      try {
        // Create a Solana Pay URL
        // Format: solana:<recipient>?amount=<amount>&reference=<reference>&label=<label>&message=<message>
        const recipient = publicKey.toString()
        const params = new URLSearchParams()

        if (amount && !isNaN(Number.parseFloat(amount)) && Number.parseFloat(amount) > 0) {
          params.append("amount", amount)
        }

        params.append("label", "StickyPay Payment")
        params.append("message", memo || "Payment via StickyPay")

        // Generate a random reference (optional)
        const reference = web3.Keypair.generate().publicKey.toString()
        params.append("reference", reference)

        const url = `solana:${recipient}?${params.toString()}`
        setSolanaPayUrl(url)
      } catch (error) {
        console.error("Error generating Solana Pay URL:", error)
      }
    } else {
      setSolanaPayUrl("")
    }
  }, [connected, publicKey, amount, memo])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Wallet address copied to clipboard",
    })
  }

  const downloadQR = () => {
    const svg = document.querySelector("svg")
    if (!svg) {
      toast({
        title: "Download failed",
        description: "Could not generate QR code image",
        variant: "destructive",
      })
      return
    }

    // Convert SVG to canvas
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL("image/png")

      // Create download link
      const a = document.createElement("a")
      a.download = "stickypay-qr.png"
      a.href = dataUrl
      a.click()
    }
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Receive Payment</CardTitle>
        <CardDescription>Generate a QR code to receive SOL</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <div className="rounded-lg border p-4 text-center">
            <p className="mb-2 text-sm">Connect your wallet to receive payments</p>
            <WalletMultiButton className="wallet-adapter-button-custom mx-auto" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Your Address</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(publicKey?.toString() || "")}
                >
                  <Copy className="h-3 w-3" />
                  <span className="sr-only">Copy address</span>
                </Button>
              </div>
              <p className="break-all text-xs font-mono">{publicKey?.toString()}</p>

              {balance !== null && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Balance:</span> {balance.toFixed(6)} SOL
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Request Amount (SOL)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.001"
                min="0.001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="memo">Memo (Optional)</Label>
              <Input
                id="memo"
                placeholder="Add a note to this payment request"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>

            {solanaPayUrl && (
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-4">
                <div className="bg-white p-2 rounded-lg">
                  <QRCodeSVG value={solanaPayUrl} size={200} level="H" />
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={downloadQR}>
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(solanaPayUrl)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <div className="w-full text-center text-sm text-muted-foreground">
          Scan this QR code with a Solana Pay compatible wallet to send payment
        </div>
      </CardFooter>
    </Card>
  )
}
