"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Wallet, AlertTriangle } from "lucide-react"

export default function WalletDebugger() {
  const [walletStatus, setWalletStatus] = useState<"not-checked" | "checking" | "not-found" | "found">("not-checked")
  const [walletInfo, setWalletInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkWalletConnection = async () => {
    setWalletStatus("checking")
    setError(null)

    try {
      // Check if Phantom wallet is available in window.solana
      if (typeof window !== "undefined") {
        // @ts-ignore - window.solana is injected by Phantom
        const solana = window.solana

        if (!solana) {
          setWalletStatus("not-found")
          setError("No Solana wallet found. Please install Phantom or another Solana wallet extension.")
          return
        }

        try {
          // Try to connect to the wallet
          const response = await solana.connect({ onlyIfTrusted: false })
          setWalletStatus("found")
          setWalletInfo({
            publicKey: response.publicKey.toString(),
            isPhantom: solana.isPhantom,
            isConnected: true,
          })
        } catch (err) {
          setWalletStatus("not-found")
          setError("Failed to connect to wallet. User may have denied the connection request.")
        }
      }
    } catch (err) {
      setWalletStatus("not-found")
      setError("An error occurred while checking for Solana wallet.")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Wallet Connection Debugger</CardTitle>
        <CardDescription>Check if a Solana wallet is available and can connect</CardDescription>
      </CardHeader>
      <CardContent>
        {walletStatus === "not-found" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Wallet Not Found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {walletStatus === "found" && (
          <Alert className="mb-4 border-green-500 text-green-500">
            <Wallet className="h-4 w-4" />
            <AlertTitle>Wallet Connected</AlertTitle>
            <AlertDescription>Successfully connected to Solana wallet.</AlertDescription>
          </Alert>
        )}

        {walletInfo && (
          <div className="mt-4 rounded-md border p-4">
            <h3 className="mb-2 font-medium">Wallet Information</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Public Key:</span> {walletInfo.publicKey}
              </div>
              <div>
                <span className="font-medium">Wallet Type:</span> {walletInfo.isPhantom ? "Phantom" : "Other"}
              </div>
              <div>
                <span className="font-medium">Connection Status:</span>{" "}
                {walletInfo.isConnected ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={checkWalletConnection} disabled={walletStatus === "checking"} className="w-full">
          {walletStatus === "checking" ? "Checking..." : "Check Wallet Connection"}
        </Button>
      </CardFooter>
    </Card>
  )
}
