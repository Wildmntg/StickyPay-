"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, CheckCircle2, WifiOff } from "lucide-react"
import { testConnection } from "@/lib/solana-rpc"

export function NetworkStatus() {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading")
  const [details, setDetails] = useState<{
    latency?: number
    slot?: number
    version?: string
    error?: string
  }>({})

  useEffect(() => {
    async function checkConnection() {
      try {
        const result = await testConnection()
        if (result.success) {
          setStatus("connected")
          setDetails({
            latency: result.latency,
            slot: result.slot,
            version: result.version,
          })
        } else {
          setStatus("error")
          setDetails({
            error: result.error,
            latency: result.latency,
          })
        }
      } catch (error) {
        setStatus("error")
        setDetails({
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    checkConnection()
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const networkName = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "testnet"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={status === "connected" ? "outline" : "destructive"}
            className="flex items-center gap-1 px-2 py-0 text-xs font-normal"
          >
            {status === "loading" ? (
              <AlertCircle className="h-3 w-3 animate-pulse" />
            ) : status === "connected" ? (
              <CheckCircle2 className="h-3 w-3 text-green-500" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {networkName.charAt(0).toUpperCase() + networkName.slice(1)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <div className="space-y-1 text-xs">
            <p className="font-medium">
              {status === "loading"
                ? "Checking connection..."
                : status === "connected"
                  ? "Connected to Solana Testnet"
                  : "Connection error"}
            </p>
            {status === "connected" && (
              <>
                <p>Latency: {details.latency}ms</p>
                <p>Current slot: {details.slot}</p>
                <p>Version: {details.version}</p>
              </>
            )}
            {status === "error" && <p className="text-red-400">{details.error}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
