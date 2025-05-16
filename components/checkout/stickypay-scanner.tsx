"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Camera, Ban, QrCode } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import jsQR from "jsqr"

interface SolanaPayScannerProps {
  onScanComplete: (data: any) => void
  onError?: (error: string) => void
}

export function SolanaPayScanner({ onScanComplete, onError }: SolanaPayScannerProps) {
  const [scanning, setScanning] = useState(true)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [manualEntry, setManualEntry] = useState(false)
  const [manualUrl, setManualUrl] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef<boolean>(false)
  const { toast } = useToast()

  // Start camera when component mounts
  useEffect(() => {
    startCamera()

    // Cleanup function to stop camera when component unmounts
    return () => {
      stopCamera()
    }
  }, [])

  // Function to start the camera
  const startCamera = async () => {
    setLoading(true)
    setScanning(true)
    scanningRef.current = true
    setPermissionDenied(false)
    setManualEntry(false)

    try {
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })

      // Store stream in ref for cleanup
      streamRef.current = stream

      // Set video source to camera stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      // Start scanning for QR codes
      requestAnimationFrame(scanQRCode)
    } catch (error) {
      console.error("Error accessing camera:", error)

      // Check if permission was denied
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setPermissionDenied(true)
        if (onError) onError("Camera permission denied. Please allow camera access.")
      } else {
        if (onError) onError(`Error accessing camera: ${error.message}`)
      }

      setScanning(false)
      scanningRef.current = false
    } finally {
      setLoading(false)
    }
  }

  // Function to stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setScanning(false)
    scanningRef.current = false
  }

  // Function to scan for QR codes
  const scanQRCode = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    // Check if video is ready
    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Get image data from canvas
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

      // Scan for QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      })

      // If QR code found
      if (code) {
        console.log("QR code detected:", code.data)
        // Stop camera
        stopCamera()

        try {
          // Try to parse as JSON if it's a JSON string
          let parsedData = code.data

          // Check if it's a URL with data parameter
          if (code.data.includes("/pay?data=")) {
            const url = new URL(code.data)
            const dataParam = url.searchParams.get("data")
            if (dataParam) {
              const decodedData = decodeURIComponent(dataParam)
              parsedData = JSON.parse(decodedData)
              console.log("Parsed URL data:", parsedData)
            }
          } else if (code.data.startsWith("solana:")) {
            // Handle Solana Pay URL format
            // Format: solana:<recipient>?amount=<amount>&reference=<reference>&label=<label>&message=<message>&memo=<memo>
            const [prefix, queryString] = code.data.split("?")
            const recipient = prefix.replace("solana:", "")

            // Parse query parameters
            const params = new URLSearchParams(queryString || "")
            const amount = params.get("amount")
            const reference = params.get("reference")
            const label = params.get("label")
            const message = params.get("message")
            const memo = params.get("memo")
            const splToken = params.get("spl-token")

            parsedData = {
              recipient,
              amount: amount || "0.1",
              reference,
              label: label || "Payment",
              message: message || "StickyPay Transaction",
              memo,
              splToken,
              timestamp: Date.now(),
            }
            console.log("Parsed Solana Pay data:", parsedData)
          } else if (code.data.startsWith("{")) {
            // Try to parse as direct JSON
            parsedData = JSON.parse(code.data)
            console.log("Parsed JSON data:", parsedData)
          }

          // Call onScanComplete callback with parsed data
          onScanComplete(parsedData)
        } catch (error) {
          console.error("Error parsing QR code data:", error)
          // If parsing fails, just pass the raw data
          onScanComplete(code.data)
        }

        return
      }

      // Continue scanning
      requestAnimationFrame(scanQRCode)
    } else {
      // Video not ready yet, try again
      requestAnimationFrame(scanQRCode)
    }
  }

  // Request camera permission
  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setPermissionDenied(false)
      startCamera()
    } catch (error) {
      console.error("Error requesting permission:", error)
      toast({
        title: "Permission Error",
        description: "Could not get camera permission. Please check your browser settings.",
        variant: "destructive",
      })
    }
  }

  // Handle manual entry submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Try to parse as URL with data parameter
      if (manualUrl.includes("/pay?data=")) {
        const url = new URL(manualUrl)
        const dataParam = url.searchParams.get("data")
        if (dataParam) {
          const decodedData = decodeURIComponent(dataParam)
          const parsedData = JSON.parse(decodedData)
          onScanComplete(parsedData)
          return
        }
      } else if (manualUrl.startsWith("solana:")) {
        // Handle Solana Pay URL format
        const [prefix, queryString] = manualUrl.split("?")
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
          message: message || "StickyPay Transaction",
          memo,
          splToken,
          timestamp: Date.now(),
        }

        onScanComplete(parsedData)
        return
      }

      // If not a URL, try as direct JSON
      if (manualUrl.startsWith("{")) {
        const parsedData = JSON.parse(manualUrl)
        onScanComplete(parsedData)
        return
      }

      // If all else fails, just pass the raw text
      onScanComplete(manualUrl)
    } catch (error) {
      console.error("Error parsing manual entry:", error)
      toast({
        title: "Invalid Format",
        description: "Could not parse the payment data. Please check the format.",
        variant: "destructive",
      })
    }
  }

  if (manualEntry) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold">Manual Payment Entry</h2>
            <p className="text-sm text-muted-foreground">Enter a payment URL or data manually</p>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="manualUrl" className="text-sm font-medium">
                Payment URL or Data
              </label>
              <input
                id="manualUrl"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="solana:ADDRESS?amount=0.1"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter a Solana Pay URL (solana:ADDRESS?amount=0.1) or JSON data
              </p>
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Process Payment
              </Button>
              <Button type="button" variant="outline" onClick={() => setManualEntry(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Hidden canvas for QR code processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video element for camera feed */}
      <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Permission denied state */}
      {permissionDenied && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-background p-4 text-center">
          <Ban className="h-10 w-10 text-destructive" />
          <h2 className="text-xl font-bold">Camera Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            We need camera access to scan QR codes. Please allow camera access in your browser settings.
          </p>
          <Button onClick={requestPermission}>Request Camera Access</Button>
        </div>
      )}

      {/* Not scanning state */}
      {!scanning && !loading && !permissionDenied && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-background p-4 text-center">
          <Camera className="h-10 w-10 text-muted-foreground" />
          <h2 className="text-xl font-bold">Camera is not active</h2>
          <p className="text-sm text-muted-foreground">We need to access your camera to scan QR codes.</p>
          <Button onClick={startCamera}>Start Camera</Button>
        </div>
      )}

      {/* Scanning overlay */}
      {scanning && !loading && (
        <>
          {/* QR code frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 rounded-lg border-2 border-white shadow-lg"></div>
          </div>

          {/* Manual entry button */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <Button variant="secondary" onClick={() => setManualEntry(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Manual Entry
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
