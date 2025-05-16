"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { testConnection, getNetworkName } from "@/lib/solana-rpc"

export function RpcConnectionTester() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    success: boolean
    message: string
    latency: number
    slot?: number
    version?: string
    error?: string
  } | null>(null)
  const [networkName, setNetworkName] = useState("")

  useEffect(() => {
    setNetworkName(getNetworkName())
  }, [])

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      const result = await testConnection()
      setConnectionStatus(result)
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: "An unexpected error occurred",
        latency: 0,
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Test connection on component mount
  useEffect(() => {
    handleTestConnection()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Solana RPC Connection
          {networkName && (
            <Badge
              variant="outline"
              className={`${networkName === "Mainnet" ? "bg-green-500" : "bg-yellow-500"} text-white`}
            >
              {networkName}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Test connection to the Solana RPC endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Testing connection...</p>
          </div>
        ) : connectionStatus ? (
          <div className="space-y-4">
            <div
              className={`flex items-center gap-2 rounded-md ${
                connectionStatus.success
                  ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              } p-4`}
            >
              {connectionStatus.success ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <span>{connectionStatus.message}</span>
            </div>

            <div className="rounded-md border p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Endpoint:</div>
                <div className="truncate">{process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT}</div>

                <div className="font-medium">Latency:</div>
                <div>{connectionStatus.latency}ms</div>

                {connectionStatus.slot && (
                  <>
                    <div className="font-medium">Current Slot:</div>
                    <div>{connectionStatus.slot.toLocaleString()}</div>
                  </>
                )}

                {connectionStatus.version && (
                  <>
                    <div className="font-medium">Solana Version:</div>
                    <div>{connectionStatus.version}</div>
                  </>
                )}

                {connectionStatus.error && (
                  <>
                    <div className="font-medium">Error:</div>
                    <div className="text-red-500">{connectionStatus.error}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button onClick={handleTestConnection} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
