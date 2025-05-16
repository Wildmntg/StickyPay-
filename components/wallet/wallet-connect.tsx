"use client"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

interface WalletConnectProps {
  variant?: "default" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

// Replace the component implementation with:
export function WalletConnect({ variant = "outline", size = "default" }: WalletConnectProps) {
  // Use the wallet adapter instead of our mock implementation
  return <WalletMultiButton className={`wallet-adapter-button-${variant} wallet-adapter-button-${size}`} />
}
