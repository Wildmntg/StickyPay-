"use client"

import type React from "react"

import QRCode from "qrcode.react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Loader2, Copy, Download } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function CreateCheckoutPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false)
  const [generatedWallet, setGeneratedWallet] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [qrValue, setQrValue] = useState("")
  const [checkoutId, setCheckoutId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [enableNftDiscounts, setEnableNftDiscounts] = useState(false)
  const [nftCollection, setNftCollection] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState("10")
  const [redirectUrl, setRedirectUrl] = useState("")

  // Form errors
  const [nameError, setNameError] = useState("")
  const [amountError, setAmountError] = useState("")
  const [redirectUrlError, setRedirectUrlError] = useState("")

  async function generateUniqueWallet() {
    setIsGeneratingWallet(true)

    try {
      // In a real app, this would call an API to generate a unique wallet
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate a generated wallet address
      const mockWalletAddress = "9YUkX4HL8oEyUEwgBK7ndZ5kYZCJPjKJTLXnTzY2zLV3"
      setGeneratedWallet(mockWalletAddress)

      toast({
        title: "Wallet generated",
        description: "A unique payment wallet has been generated for this checkout.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate a unique wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingWallet(false)
    }
  }

  // Generate QR code when checkout is created
  useEffect(() => {
    if (checkoutId && generatedWallet) {
      // Create payment data object
      const paymentData = {
        merchantAddress: generatedWallet,
        amount,
        token: "USDC", // Always use USDC
        reference: checkoutId,
        merchantName: name,
        itemName: description,
        timestamp: Date.now(),
      }

      // Convert to JSON and encode for QR code
      const jsonData = JSON.stringify(paymentData)
      const encodedData = encodeURIComponent(jsonData)

      // Create a deep link URL for the app
      const deepLink = `${window.location.origin}/pay?data=${encodedData}`

      setQrValue(deepLink)
    }
  }, [checkoutId, generatedWallet, amount, name, description])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue)
    toast({
      title: "Link copied",
      description: "Payment link has been copied to clipboard",
    })
  }

  const handleDownloadQR = () => {
    const canvas = document.getElementById("checkout-qr-code") as HTMLCanvasElement
    if (!canvas) return

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
    const downloadLink = document.createElement("a")
    downloadLink.href = pngUrl
    downloadLink.download = `stickypay-qr-${checkoutId}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Reset errors
    setNameError("")
    setAmountError("")
    setRedirectUrlError("")

    // Validate form
    let isValid = true

    if (name.length < 2) {
      setNameError("Name must be at least 2 characters.")
      isValid = false
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError("Amount must be a positive number.")
      isValid = false
    }

    if (redirectUrl && !redirectUrl.startsWith("http")) {
      setRedirectUrlError("Please enter a valid URL.")
      isValid = false
    }

    if (!isValid) return

    setIsSubmitting(true)

    try {
      // Generate wallet if not already generated
      if (!generatedWallet) {
        await generateUniqueWallet()
      }

      // Generate a unique checkout ID
      const id = `checkout_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`
      setCheckoutId(id)

      toast({
        title: "Checkout created",
        description: "Your checkout session has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create checkout session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Create Checkout Session</h3>
        <p className="text-sm text-muted-foreground">Create a new checkout session for your customers.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for your checkout session.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Product or service name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {nameError && <p className="text-sm text-red-500">{nameError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <Input id="amount" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  {amountError && <p className="text-sm text-red-500">{amountError}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a description for this checkout"
                    className="resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label className="text-base">NFT Discounts</Label>
                      <p className="text-xs text-muted-foreground">
                        Enable discounts for customers who own specific NFTs.
                      </p>
                    </div>
                    <Switch checked={enableNftDiscounts} onCheckedChange={setEnableNftDiscounts} />
                  </div>
                </div>

                {enableNftDiscounts && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nftCollection">NFT Collection Address</Label>
                      <Input
                        id="nftCollection"
                        placeholder="Enter NFT collection address"
                        value={nftCollection}
                        onChange={(e) => setNftCollection(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountPercentage">Discount Percentage</Label>
                      <Input
                        id="discountPercentage"
                        type="number"
                        min="1"
                        max="50"
                        placeholder="10"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <Button onClick={handleSubmit} disabled={isSubmitting || !name || !amount} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Checkout"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {checkoutId && generatedWallet && qrValue ? (
            <Card>
              <CardHeader>
                <CardTitle>Payment QR Code</CardTitle>
                <CardDescription>Share this QR code with your customers to accept payments.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                <div className="rounded-lg border bg-white p-4">
                  <QRCode
                    id="checkout-qr-code"
                    value={qrValue}
                    size={250}
                    level="H"
                    includeMargin
                    renderAs="canvas"
                    imageSettings={{
                      src: "/logo.png",
                      height: 40,
                      width: 40,
                      excavate: true,
                    }}
                  />
                </div>

                <div className="w-full space-y-2 rounded-md border p-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm font-medium">Checkout ID:</div>
                    <div className="text-right text-sm">{checkoutId}</div>

                    <div className="text-sm font-medium">Amount:</div>
                    <div className="text-right text-sm">{amount} USDC</div>

                    <div className="text-sm font-medium">Wallet Address:</div>
                    <div className="text-right text-xs break-all">{generatedWallet}</div>
                  </div>
                </div>

                <div className="flex w-full gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleCopyLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button className="flex-1" onClick={handleDownloadQR}>
                    <Download className="mr-2 h-4 w-4" />
                    Download QR
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Payment QR Code</CardTitle>
                <CardDescription>Fill out the form and click "Create Checkout" to generate a QR code.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="flex h-[250px] w-[250px] items-center justify-center rounded-lg border bg-muted/20">
                  <p className="text-center text-sm text-muted-foreground">
                    QR code will appear here after creating checkout
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Checkout Preview</CardTitle>
              <CardDescription>This is how your checkout will appear to customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">{name || "Product Name"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {description || "Product description will appear here"}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Amount:</span>
                    <span className="text-sm">{amount ? `${amount} USDC` : "0.00 USDC"}</span>
                  </div>
                  {enableNftDiscounts && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">NFT Discount:</span>
                      <span className="text-sm">{discountPercentage}% off</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Payment Token:</span>
                    <span className="text-sm">USDC</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
