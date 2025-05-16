"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertCircle } from "lucide-react"

interface NetworkSelectorProps {
  onNetworkChange?: (network: "mainnet" | "testnet" | "devnet") => void
}

export function NetworkSelector({ onNetworkChange }: NetworkSelectorProps) {
  const [network, setNetwork] = useState<"mainnet" | "testnet" | "devnet">(
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as "mainnet" | "testnet" | "devnet") || "testnet",
  )

  const handleNetworkChange = (newNetwork: "mainnet" | "testnet" | "devnet") => {
    setNetwork(newNetwork)
    if (onNetworkChange) {
      onNetworkChange(newNetwork)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          {network === "mainnet" ? (
            "Mainnet"
          ) : (
            <>
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500" />
              {network === "testnet" ? "Testnet" : "Devnet"}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleNetworkChange("mainnet")}>Mainnet</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNetworkChange("testnet")}>Testnet</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleNetworkChange("devnet")}>Devnet</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
