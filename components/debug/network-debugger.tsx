"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function NetworkDebugger() {
  const [selectedEndpoint, setSelectedEndpoint] = useState("mainnet")
  const [networkStatus, setNetworkStatus] = useState<"idle" | "checking" | "success" | "error">("idle")
  const [pingResult, setPingResult] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const endpoints = {
    mainnet: "https://api.mainnet-beta.solana.com",
    testnet: "https://api.testnet.solana.com",
    devnet: "https://api.devnet.solana.com",
    custom: "https://solana-api.projectserum.com",
  }

  const checkNetworkConnection = async () => {
    setNetworkStatus("checking")
    setError(null)
    setPingResult(null)

    try {
      const endpoint = endpoints[selectedEndpoint as keyof typeof endpoints]
      const startTime = Date.now()

      // Make a simple RPC call to check connection
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getHealth",
        }),
      })

      const endTime = Date.now()
      const pingTime = endTime - startTime
      setPingResult(pingTime)

      const data = await response.json()

      if (response.ok && data.result === "ok") {
        setNetworkStatus("success")
      } else {
        setNetworkStatus("error")
        setError(`RPC node responded with: ${data.error?.message || "Unknown error"}`)
      }
    } catch (err) {
      setNetworkStatus("error")
      setError(err instanceof Error ? err.message : "Failed to connect to RPC endpoint")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Network Connection Debugger</CardTitle>
        <CardDescription>Check connectivity to Solana RPC endpoints</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid w-full items-center gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="endpoint">RPC Endpoint</Label>
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger id="endpoint">
                <SelectValue placeholder="Select an endpoint" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="mainnet">Mainnet Beta</SelectItem>
                <SelectItem value="testnet">Testnet</SelectItem>
                <SelectItem value="devnet">Devnet</SelectItem>
                <SelectItem value="custom">Custom (Project Serum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Endpoint URL:{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              {endpoints[selectedEndpoint as keyof typeof endpoints]}
            </code>
          </div>
        </div>

        {networkStatus === "success" && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 text-green-600 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-medium">Connection Successful</p>
              {pingResult && <p className="text-sm">Ping: {pingResult}ms</p>}
            </div>
          </div>
        )}

        {networkStatus === "error" && (
          <div className="mt-4 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            <XCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Connection Failed</p>
              {error && <p className="text-sm">{error}</p>}
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="mb-2 text-sm font-medium">Network Status</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md border p-3 text-center">
              <div className="mb-1 text-xs text-muted-foreground">Jupiter API</div>
              <Badge variant="outline" className="bg-green-500 text-white">
                Operational
              </Badge>
            </div>
            <div className="rounded-md border p-3 text-center">
              <div className="mb-1 text-xs text-muted-foreground">Solana Pay</div>
              <Badge variant="outline" className="bg-green-500 text-white">
                Operational
              </Badge>
            </div>
            <div className="rounded-md border p-3 text-center">
              <div className="mb-1 text-xs text-muted-foreground">Fiat Off-ramp</div>
              <Badge variant="outline" className="bg-yellow-500 text-white">
                Degraded
              </Badge>
            </div>
            <div className="rounded-md border p-3 text-center">
              <div className="mb-1 text-xs text-muted-foreground">NFT Verification</div>
              <Badge variant="outline" className="bg-green-500 text-white">
                Operational
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={checkNetworkConnection} disabled={networkStatus === "checking"} className="w-full">
          {networkStatus === "checking" ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4 animate-pulse" />
              Checking...
            </>
          ) : (
            "Check Connection"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
